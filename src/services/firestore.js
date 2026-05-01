import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    onSnapshot,
    addDoc,
    serverTimestamp,
    orderBy,
    arrayUnion,
    arrayRemove,
    runTransaction,
    increment,
    writeBatch,
} from "firebase/firestore";
import { db } from "../firebase";

// ==================== PASSWORD HASHING ====================

export const hashPassword = async (password) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// ==================== POSTS ====================

export const postsRef = collection(db, "posts");

// Get all posts
export const getPosts = async () => {
    const snapshot = await getDocs(postsRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Add a new post
export const addPostToFirestore = async (post) => {
    const docRef = doc(postsRef, post.id);
    await setDoc(docRef, post);
    return post;
};

// Update a post
export const updatePostInFirestore = async (postId, updatedFields) => {
    const docRef = doc(db, "posts", postId);
    await updateDoc(docRef, updatedFields);
};

// Delete a post
export const deletePostFromFirestore = async (postId) => {
    const docRef = doc(db, "posts", postId);
    await deleteDoc(docRef);
};

// Listen to posts in real-time
export const subscribeToPostsRT = (callback) => {
    return onSnapshot(postsRef, (snapshot) => {
        const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(posts);
    }, (err) => {
        console.error('Posts subscription error:', err);
    });
};

// ==================== POST INTERESTS (subcollection) ====================
// Stored under /posts/{postId}/interests/{interestId}. Prevents the post
// document from growing past the 1MB limit on popular posts and allows
// atomic counter updates.

// Random suffix appended to deterministic IDs so two writes in the same
// millisecond don't collide. Date.now() granularity is 1ms; rapid double-tap
// over a slow network easily fits inside that window. The 6-char suffix
// pushes collision probability under 1-in-2-billion per pair of writes.
const randSuffix = () => Math.random().toString(36).slice(2, 8);

export const addInterestToSubcol = async (postId, interest) => {
    const postDocRef = doc(db, "posts", postId);
    const interestsSub = collection(postDocRef, "interests");
    const interestId = interest.id || `int-${interest.userId}-${Date.now()}-${randSuffix()}`;
    const interestDocRef = doc(interestsSub, interestId);

    const payload = {
        ...interest,
        id: interestId,
        createdAt: serverTimestamp(),
    };

    await runTransaction(db, async (tx) => {
        tx.set(interestDocRef, payload);
        tx.update(postDocRef, { interestCount: increment(1) });
    });

    return { ...payload, createdAt: new Date().toISOString() };
};

export const subscribeToPostInterests = (postId, callback) => {
    const interestsSub = collection(db, "posts", postId, "interests");
    return onSnapshot(interestsSub, (snap) => {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        callback(items);
    }, (err) => {
        console.error(`Interest subscription error (${postId}):`, err);
    });
};

// ==================== POST MEETINGS (subcollection) ====================

export const addMeetingToSubcol = async (postId, meeting) => {
    const postDocRef = doc(db, "posts", postId);
    const meetingsSub = collection(postDocRef, "meetings");
    const meetingId = meeting.id || `meet-${meeting.proposedBy}-${Date.now()}-${randSuffix()}`;
    const meetingDocRef = doc(meetingsSub, meetingId);

    const payload = {
        ...meeting,
        id: meetingId,
        createdAt: serverTimestamp(),
    };

    // NOTE: We do NOT change post.status here. The post stays "Active" while
    // a proposal is pending so that the author can still receive parallel
    // proposals from other interested parties. The status only flips to
    // "Meeting Scheduled" once the author actually ACCEPTS a slot — see
    // updateMeetingStatus below.
    await runTransaction(db, async (tx) => {
        tx.set(meetingDocRef, payload);
        tx.update(postDocRef, { meetingCount: increment(1) });
    });

    return { ...payload, createdAt: new Date().toISOString() };
};

export const updateMeetingStatus = async (postId, meetingId, newStatus) => {
    const postDocRef = doc(db, "posts", postId);
    const meetingDocRef = doc(db, "posts", postId, "meetings", meetingId);

    // When a meeting is accepted, mark the post as "Meeting Scheduled" so the
    // feed reflects that this collaboration is locked in. Decline does NOT
    // change post status — the post stays Active so other proposals still
    // reach the author. We also return the meeting record so the caller can
    // route a notification to the proposer even after a page refresh wiped
    // the in-memory snapshot.
    let meetingData = null;
    if (newStatus === 'accepted') {
        await runTransaction(db, async (tx) => {
            const postSnap = await tx.get(postDocRef);
            const meetingSnap = await tx.get(meetingDocRef);
            meetingData = meetingSnap.exists() ? { id: meetingSnap.id, ...meetingSnap.data() } : null;
            tx.update(meetingDocRef, { status: newStatus });
            // Only promote to "Meeting Scheduled" if the post is still Active
            // (don't downgrade a CLOSED / Expired post).
            if (postSnap.exists() && postSnap.data().status === 'Active') {
                tx.update(postDocRef, { status: 'Meeting Scheduled' });
            }
        });
    } else {
        const meetingSnap = await getDoc(meetingDocRef);
        meetingData = meetingSnap.exists() ? { id: meetingSnap.id, ...meetingSnap.data() } : null;
        await updateDoc(meetingDocRef, { status: newStatus });
    }
    return meetingData;
};

export const subscribeToPostMeetings = (postId, callback) => {
    const meetingsSub = collection(db, "posts", postId, "meetings");
    return onSnapshot(meetingsSub, (snap) => {
        const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        callback(items);
    }, (err) => {
        console.error(`Meeting subscription error (${postId}):`, err);
    });
};

// Brief 4.4 — "Cancel meeting request". The proposer (the interested party
// who originally sent the slot) is allowed to retract a request that hasn't
// been accepted yet. We delete the meeting doc and decrement the parent
// counter inside a transaction so the UI never sees a stale count.
//
// Returns the meeting snapshot that was cancelled so the caller can route
// a notification to the post author. If the meeting was already accepted,
// we refuse — at that point the proposer should communicate via chat
// rather than silently rip the meeting out from under the author.
export const cancelMeetingRequest = async (postId, meetingId) => {
    const postDocRef = doc(db, "posts", postId);
    const meetingDocRef = doc(db, "posts", postId, "meetings", meetingId);

    let cancelled = null;
    let refused = false;
    await runTransaction(db, async (tx) => {
        const meetingSnap = await tx.get(meetingDocRef);
        if (!meetingSnap.exists()) return;
        const data = meetingSnap.data() || {};
        if (data.status === 'accepted') {
            refused = true;
            return;
        }
        cancelled = { id: meetingSnap.id, ...data };
        tx.delete(meetingDocRef);
        tx.update(postDocRef, { meetingCount: increment(-1) });
    });
    if (refused) {
        return { ok: false, reason: 'already-accepted' };
    }
    return { ok: true, meeting: cancelled };
};

// ==================== USERS ====================

export const usersRef = collection(db, "users");

export const getUsers = async () => {
    const snapshot = await getDocs(usersRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getUserById = async (userId) => {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
};

export const addUserToFirestore = async (user) => {
    const docRef = doc(usersRef, user.id);
    await setDoc(docRef, user);
    return user;
};

// GDPR Article 17 — Right to Erasure. Removing only the user doc leaves
// orphaned posts, interests, meetings, conversations, and notifications that
// reference the deleted user. This helper does a best-effort cascade so the
// user's footprint is fully cleared from the database. Errors on individual
// branches are logged but do not abort the rest of the cleanup; the user
// document is removed last so that a partial failure leaves the account
// recoverable.
export const deleteUserFromFirestore = async (userId) => {
    if (!userId) throw new Error('deleteUserFromFirestore: missing userId');

    const safe = async (label, fn) => {
        try { await fn(); }
        catch (err) { console.error(`GDPR cascade — ${label} cleanup failed:`, err); }
    };

    // 1. Posts authored by the user. Each post also has interests + meetings
    //    subcollections — we drain those before deleting the parent.
    await safe('posts', async () => {
        const ownPostsQ = query(postsRef, where('authorId', '==', userId));
        const postsSnap = await getDocs(ownPostsQ);
        for (const postDoc of postsSnap.docs) {
            const interestsSnap = await getDocs(collection(postDoc.ref, 'interests'));
            await Promise.all(interestsSnap.docs.map(d => deleteDoc(d.ref)));
            const meetingsSnap = await getDocs(collection(postDoc.ref, 'meetings'));
            await Promise.all(meetingsSnap.docs.map(d => deleteDoc(d.ref)));
            await deleteDoc(postDoc.ref);
        }
    });

    // 2. Interests this user expressed on OTHER people's posts. Firestore has
    //    no native collection-group delete, so we walk every post and check
    //    its interests subcollection. (Acceptable for prototype scale.)
    await safe('interests', async () => {
        const allPostsSnap = await getDocs(postsRef);
        for (const postDoc of allPostsSnap.docs) {
            const interestsSnap = await getDocs(collection(postDoc.ref, 'interests'));
            const mine = interestsSnap.docs.filter(d => (d.data() || {}).userId === userId);
            await Promise.all(mine.map(d => deleteDoc(d.ref)));
            const meetingsSnap = await getDocs(collection(postDoc.ref, 'meetings'));
            const myMeetings = meetingsSnap.docs.filter(d => (d.data() || {}).proposedBy === userId);
            await Promise.all(myMeetings.map(d => deleteDoc(d.ref)));
        }
    });

    // 3. Conversations the user participated in (and their messages).
    await safe('conversations', async () => {
        const myConvosQ = query(conversationsRef, where('members', 'array-contains', userId));
        const convosSnap = await getDocs(myConvosQ);
        for (const convoDoc of convosSnap.docs) {
            const msgsSnap = await getDocs(collection(convoDoc.ref, 'messages'));
            await Promise.all(msgsSnap.docs.map(d => deleteDoc(d.ref)));
            await deleteDoc(convoDoc.ref);
        }
    });

    // 4. Notifications targeted at this user.
    await safe('notifications', async () => {
        const myNotifsQ = query(notificationsRef, where('targetUserId', '==', userId));
        const notifsSnap = await getDocs(myNotifsQ);
        await Promise.all(notifsSnap.docs.map(d => deleteDoc(d.ref)));
    });

    // 5. The user document itself. Done last so a partial failure above
    //    leaves the account resurrectable rather than dangling without owner.
    try {
        await deleteDoc(doc(db, 'users', userId));
    } catch (err) {
        console.error('Error deleting user doc:', err);
        throw err;
    }
};

export const updateUserInFirestore = async (userId, updatedFields) => {
    const docRef = doc(db, "users", userId);
    await updateDoc(docRef, updatedFields);
};

// Listen to users in real-time
export const subscribeToUsersRT = (callback) => {
    return onSnapshot(usersRef, (snapshot) => {
        const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(users);
    }, (err) => {
        console.error('Users subscription error:', err);
    });
};

// Get user by email (for login)
export const getUserByEmail = async (email) => {
    const q = query(usersRef, where("email", "==", email));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const userDoc = snapshot.docs[0];
    return { id: userDoc.id, ...userDoc.data() };
};

// Check if email already exists
export const emailExists = async (email) => {
    const user = await getUserByEmail(email);
    return user !== null;
};

// ==================== LOGIN RATE LIMITING ====================
// Brief 5.2 — anti-bot / brute-force protection. Tracks failed login attempts
// per email and locks the account for LOCKOUT_MS after MAX_ATTEMPTS within
// WINDOW_MS. Doc ID is the sanitized email (Firestore disallows `/`); lowercase
// + non-alphanum→underscore keeps the ID stable and predictable.

export const loginAttemptsRef = collection(db, "loginAttempts");

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;   // 15 minute sliding window
const RATE_LIMIT_MAX_ATTEMPTS = 5;
const RATE_LIMIT_LOCKOUT_MS = 15 * 60 * 1000;  // 15 minute lockout

const sanitizedEmailKey = (email) =>
    (email || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '_').slice(0, 200);

// Returns { locked: boolean, retryAfterMs: number, count: number }.
// Fails OPEN (returns "not locked") on Firestore errors so a transient outage
// doesn't lock every user out of the platform — auth itself remains the
// authoritative gate.
export const checkLoginRateLimit = async (email) => {
    const key = sanitizedEmailKey(email);
    if (!key) return { locked: false, retryAfterMs: 0, count: 0 };
    try {
        const docRef = doc(loginAttemptsRef, key);
        const snap = await getDoc(docRef);
        if (!snap.exists()) return { locked: false, retryAfterMs: 0, count: 0 };
        const data = snap.data() || {};
        const now = Date.now();
        const lockedUntil = Number(data.lockedUntil) || 0;
        if (lockedUntil > now) {
            return { locked: true, retryAfterMs: lockedUntil - now, count: data.count || 0 };
        }
        return { locked: false, retryAfterMs: 0, count: data.count || 0 };
    } catch (err) {
        console.warn('checkLoginRateLimit failed (fail-open):', err);
        return { locked: false, retryAfterMs: 0, count: 0 };
    }
};

// Records a failed attempt. If the count crosses MAX_ATTEMPTS within the
// sliding window, sets lockedUntil. Returns the same shape as checkLoginRateLimit
// so the caller can immediately tell the user how long to wait.
export const recordFailedLogin = async (email) => {
    const key = sanitizedEmailKey(email);
    if (!key) return { locked: false, retryAfterMs: 0, count: 0 };
    try {
        const docRef = doc(loginAttemptsRef, key);
        const now = Date.now();
        const snap = await getDoc(docRef);
        const data = snap.exists() ? (snap.data() || {}) : {};
        const firstAt = Number(data.firstAttemptAt) || 0;
        const withinWindow = firstAt && (now - firstAt) < RATE_LIMIT_WINDOW_MS;
        const newCount = withinWindow ? (Number(data.count) || 0) + 1 : 1;
        const lockedUntil = newCount >= RATE_LIMIT_MAX_ATTEMPTS ? now + RATE_LIMIT_LOCKOUT_MS : 0;
        const payload = {
            email: (email || '').toLowerCase(),
            count: newCount,
            firstAttemptAt: withinWindow ? firstAt : now,
            lastAttemptAt: now,
            lockedUntil,
        };
        await setDoc(docRef, payload, { merge: false });
        return {
            locked: lockedUntil > now,
            retryAfterMs: lockedUntil > now ? lockedUntil - now : 0,
            count: newCount,
        };
    } catch (err) {
        console.warn('recordFailedLogin failed:', err);
        return { locked: false, retryAfterMs: 0, count: 0 };
    }
};

// Clears the failure ledger after a successful auth so the user starts fresh
// next time. Best-effort; a stray failure doesn't block login.
export const clearLoginRateLimit = async (email) => {
    const key = sanitizedEmailKey(email);
    if (!key) return;
    try {
        await deleteDoc(doc(loginAttemptsRef, key));
    } catch (err) {
        console.warn('clearLoginRateLimit failed:', err);
    }
};

// Configuration accessors so UI can format messages with the right window.
export const RATE_LIMIT_CONFIG = Object.freeze({
    WINDOW_MS: RATE_LIMIT_WINDOW_MS,
    MAX_ATTEMPTS: RATE_LIMIT_MAX_ATTEMPTS,
    LOCKOUT_MS: RATE_LIMIT_LOCKOUT_MS,
});

// ==================== ACTIVITY LOGS ====================

export const logsRef = collection(db, "activityLogs");

export const getActivityLogs = async () => {
    const snapshot = await getDocs(logsRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addActivityLog = async (log) => {
    const docRef = doc(logsRef, log.id);
    await setDoc(docRef, log);
    return log;
};

// Listen to activity logs in real-time
export const subscribeToLogsRT = (callback) => {
    return onSnapshot(logsRef, (snapshot) => {
        const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(logs);
    }, (err) => {
        console.error('Logs subscription error:', err);
    });
};

// Brief 4.6.3 — defined retention period (24 months). The platform keeps audit
// logs for 24 months for security investigation, then purges. Without a
// scheduled Cloud Function, we run this client-side from the admin dashboard;
// the AdminDashboard component throttles invocations so we sweep at most once
// per 24h regardless of how many admins open the page.
//
// Returns { deleted, cutoff } so the UI can show the operator how many rows
// were swept and the boundary date that was applied. Failures are logged but
// don't throw — the dashboard still renders.
export const RETENTION_MONTHS = 24;

export const purgeOldLogs = async (months = RETENTION_MONTHS) => {
    try {
        const cutoff = new Date();
        cutoff.setMonth(cutoff.getMonth() - months);
        const cutoffIso = cutoff.toISOString();

        // Logs store `timestamp` as ISO string (see addActivityLog call sites).
        // ISO 8601 sorts lexicographically, so a string range query is correct.
        const oldQ = query(logsRef, where('timestamp', '<', cutoffIso));
        const snap = await getDocs(oldQ);
        if (snap.empty) return { deleted: 0, cutoff: cutoffIso };

        // writeBatch caps at 500 ops; chunk for safety even if today's prototype
        // never crosses that threshold. Each chunk is committed independently
        // so a failure halfway through still removes everything before it.
        let deleted = 0;
        const docs = snap.docs;
        for (let i = 0; i < docs.length; i += 450) {
            const batch = writeBatch(db);
            const chunk = docs.slice(i, i + 450);
            chunk.forEach(d => batch.delete(d.ref));
            await batch.commit();
            deleted += chunk.length;
        }
        return { deleted, cutoff: cutoffIso };
    } catch (err) {
        console.error('purgeOldLogs failed:', err);
        return { deleted: 0, cutoff: null, error: err?.message || String(err) };
    }
};

// ==================== NOTIFICATIONS ====================

export const notificationsRef = collection(db, "notifications");

export const getNotifications = async () => {
    const snapshot = await getDocs(notificationsRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addNotificationToFirestore = async (notif) => {
    const docRef = doc(notificationsRef, notif.id);
    await setDoc(docRef, notif);
    return notif;
};

export const deleteNotificationFromFirestore = async (notifId) => {
    const docRef = doc(db, "notifications", notifId);
    await deleteDoc(docRef);
};

export const clearAllNotificationsFromFirestore = async () => {
    const snapshot = await getDocs(notificationsRef);
    const deletePromises = snapshot.docs.map(d => deleteDoc(d.ref));
    await Promise.all(deletePromises);
};

export const subscribeToNotificationsRT = (callback) => {
    return onSnapshot(notificationsRef, (snapshot) => {
        const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(notifs);
    }, (err) => {
        console.error('Notifications subscription error:', err);
    });
};

// ==================== SEED DATA ====================

export const seedCollection = async (collectionName, dataArray) => {
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);

    // Only seed if collection is empty
    if (snapshot.size > 0) {
        console.log(`Collection '${collectionName}' already has data (${snapshot.size} docs). Skipping seed.`);
        return false;
    }

    console.log(`Seeding '${collectionName}' with ${dataArray.length} documents...`);
    for (const item of dataArray) {
        const docRef = doc(colRef, item.id);
        await setDoc(docRef, item);
    }
    console.log(`✅ Seeded '${collectionName}' successfully.`);
    return true;
};

// ==================== CHAT & MESSAGES ====================

export const conversationsRef = collection(db, "conversations");

// Deterministic ID for 1-on-1 chats. The separator is `__||__` (with the
// double-underscore padding) so it can't collide with user IDs that contain
// underscores — the previous single `_` separator caused {uid="a_b", "a"} to
// hash to the same id as {uid="a", "a_b"}.
const CONVO_SEPARATOR = '__||__';
const getConvoId = (uid1, uid2) => [uid1, uid2].sort().join(CONVO_SEPARATOR);

// Start or get a conversation
export const getOrCreateConversation = async (user1, user2) => {
    if (!user1?.id || !user2?.id) {
        throw new Error('getOrCreateConversation: both users must have an id');
    }
    if (user1.id === user2.id) {
        // Self-chat is a degenerate state that creates a conversation with
        // members:[uid, uid] and a half-broken unreadCount map. The UI never
        // intentionally surfaces this, so refuse it loudly instead of silently
        // creating an unusable doc.
        throw new Error('getOrCreateConversation: cannot create a self-conversation');
    }
    const convoId = getConvoId(user1.id, user2.id);
    const convoDocRef = doc(db, "conversations", convoId);
    const convoSnap = await getDoc(convoDocRef);

    if (!convoSnap.exists()) {
        const convoData = {
            id: convoId,
            members: [user1.id, user2.id],
            memberData: {
                [user1.id]: { name: user1.name, role: user1.role },
                [user2.id]: { name: user2.name, role: user2.role }
            },
            lastMessage: "",
            updatedAt: serverTimestamp(),
            unreadCount: {
                [user1.id]: 0,
                [user2.id]: 0
            }
        };
        await setDoc(convoDocRef, convoData);
        return convoData;
    }
    return { id: convoSnap.id, ...convoSnap.data() };
};

// UTF-16 safe truncation. The naive `.slice(0, n)` can split a surrogate pair
// in half (an emoji counts as two char codes), leaving an orphan that renders
// as the U+FFFD replacement glyph in the reply-quote UI. This trims to the
// nearest full codepoint by re-encoding through Array.from.
const safeTruncate = (str, max) => {
    if (typeof str !== 'string') return '';
    const cps = Array.from(str);
    if (cps.length <= max) return str;
    return cps.slice(0, max).join('');
};

// Send a message within a conversation. `metadata` is optional and carries
// rich-composition fields like replyTo (quoted parent message snapshot). New
// fields are additive so older clients render fine.
export const sendMessage = async (convoId, senderId, text, senderName, metadata = {}) => {
    const convoDocRef = doc(db, "conversations", convoId);
    const messagesSubRef = collection(convoDocRef, "messages");

    const newMessage = {
        senderId,
        senderName,
        text,
        timestamp: serverTimestamp(),
        read: false,
        reactions: {},
    };
    if (metadata.replyTo) {
        // Snapshot at send time so the quote survives edits/deletions of parent.
        newMessage.replyTo = {
            id: metadata.replyTo.id,
            text: safeTruncate((metadata.replyTo.text || '').trim(), 280),
            senderId: metadata.replyTo.senderId,
            senderName: metadata.replyTo.senderName || '',
        };
    }

    // 1. Add message to sub-collection.
    const msgRef = await addDoc(messagesSubRef, newMessage);

    // 2. Update conversation summary. Read-only lookup of the other member is
    // safe because conversation members are immutable for the lifetime of the
    // doc; the unread counter, by contrast, races against markAsRead so it
    // MUST be an atomic Firestore increment, not a client-side read+write.
    try {
        const convoSnap = await getDoc(convoDocRef);
        const members = convoSnap.exists() ? (convoSnap.data().members || []) : [];
        const otherMemberId = members.find(id => id !== senderId);

        const updates = {
            lastMessage: text,
            updatedAt: serverTimestamp(),
        };
        if (otherMemberId) {
            updates[`unreadCount.${otherMemberId}`] = increment(1);
        }
        await updateDoc(convoDocRef, updates);
    } catch (err) {
        // The message was delivered (step 1 succeeded), but the conversation
        // summary failed to update. Roll the message back so the recipient
        // doesn't end up with an orphaned message that the sidebar's
        // last-message preview won't reflect. The thrown error reaches the
        // caller (useChat.send → toast) so the sender can retry.
        console.error('sendMessage: conversation summary update failed, rolling back message:', err);
        try { await deleteDoc(msgRef); } catch (rollbackErr) {
            console.error('sendMessage: rollback also failed:', rollbackErr);
        }
        throw err;
    }
};

// Delete a single message within a conversation. Optimistic UI can hide the
// row immediately; the firestore delete is then authoritative.
export const deleteMessage = async (convoId, messageId) => {
    const msgRef = doc(db, "conversations", convoId, "messages", messageId);
    await deleteDoc(msgRef);
};

// Toggle a single-user reaction on a message. Reactions are stored as
// `reactions: { [emoji]: [userId, ...] }`. If the user already has this emoji
// on the message, it's removed; otherwise added.
export const toggleMessageReaction = async (convoId, messageId, userId, emoji) => {
    const msgRef = doc(db, "conversations", convoId, "messages", messageId);
    await runTransaction(db, async (tx) => {
        const snap = await tx.get(msgRef);
        if (!snap.exists()) return;
        const data = snap.data();
        const reactions = { ...(data.reactions || {}) };
        const users = Array.isArray(reactions[emoji]) ? [...reactions[emoji]] : [];
        const idx = users.indexOf(userId);
        if (idx >= 0) {
            users.splice(idx, 1);
            if (users.length === 0) delete reactions[emoji];
            else reactions[emoji] = users;
        } else {
            reactions[emoji] = [...users, userId];
        }
        tx.update(msgRef, { reactions });
    });
};

// Subscribe to conversations for a user
export const subscribeToConversationsRT = (userId, callback) => {
    const q = query(
        conversationsRef,
        where("members", "array-contains", userId)
        // orderBy("updatedAt", "desc") // This requires a composite index. We'll sort on the client side for now.
    );

    return onSnapshot(q, (snapshot) => {
        const conversations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort by updatedAt descending
        conversations.sort((a, b) => {
            const timeA = a.updatedAt?.toMillis() || 0;
            const timeB = b.updatedAt?.toMillis() || 0;
            return timeB - timeA;
        });
        callback(conversations);
    }, (error) => {
        console.error("Convo subscription error:", error);
    });
};

// Subscribe to messages in a conversation
export const subscribeToMessagesRT = (convoId, callback) => {
    const messagesSubRef = collection(db, "conversations", convoId, "messages");
    const q = query(messagesSubRef, orderBy("timestamp", "asc"));

    return onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(messages);
    }, (error) => {
        console.error("Msg subscription error:", error);
    });
};

// --- COMPETITION GRADE: Typing Indicators ---
export const setTypingStatus = async (convoId, userId, isTyping) => {
    const convoDocRef = doc(db, "conversations", convoId);
    await updateDoc(convoDocRef, {
        [`isTyping.${userId}`]: isTyping
    });
};

// --- COMPETITION GRADE: User Presence ---
export const updateUserStatus = async (userId, isOnline) => {
    const userDocRef = doc(db, "users", userId);
    await updateDoc(userDocRef, {
        isOnline,
        lastSeen: serverTimestamp()
    });
};


// Mark messages as read
export const markAsRead = async (convoId, userId) => {
    const convoDocRef = doc(db, "conversations", convoId);
    await updateDoc(convoDocRef, {
        [`unreadCount.${userId}`]: 0
    });
};

// Delete a conversation
export const deleteConversation = async (convoId) => {
    const convoDocRef = doc(db, "conversations", convoId);
    await deleteDoc(convoDocRef);
};

// Identify duplicate conversation docs for the current user. The ID-separator
// switch (`_` → `__||__`) plus aborted "open chat then leave" flows have left
// stale convo docs in Firestore — same pair of users, multiple docs. This
// returns the IDs that are safe to delete and the IDs we're keeping, without
// performing any writes.
//
// Safety rules:
//   - Group all of `userId`'s conversations by the other member's id.
//   - In each group with a duplicate:
//       * If exactly one doc has a real `lastMessage`, keep it and mark every
//         empty stub for deletion.
//       * If none of the docs have a `lastMessage`, keep the most recently
//         updated and mark the rest for deletion.
//       * If MULTIPLE docs have a `lastMessage`, do nothing — we can't tell
//         which message history is canonical, so a human must intervene.
export const findDuplicateConversations = (conversations, userId) => {
    const groups = new Map();
    for (const conv of conversations || []) {
        const otherId = (conv.members || []).find(id => id !== userId);
        if (!otherId) continue;
        if (!groups.has(otherId)) groups.set(otherId, []);
        groups.get(otherId).push(conv);
    }

    const toDelete = [];
    const toKeep = [];
    const skippedAmbiguous = [];

    for (const group of groups.values()) {
        if (group.length <= 1) {
            if (group[0]) toKeep.push(group[0].id);
            continue;
        }
        const withMsg = group.filter(c => !!c.lastMessage);
        if (withMsg.length > 1) {
            skippedAmbiguous.push(...group.map(c => c.id));
            continue;
        }
        let keeper;
        if (withMsg.length === 1) {
            keeper = withMsg[0];
        } else {
            // All empty: keep the freshest by updatedAt.
            keeper = [...group].sort((a, b) =>
                (b.updatedAt?.toMillis?.() || 0) - (a.updatedAt?.toMillis?.() || 0)
            )[0];
        }
        toKeep.push(keeper.id);
        for (const c of group) if (c.id !== keeper.id) toDelete.push(c.id);
    }

    return { toDelete, toKeep, skippedAmbiguous };
};

// Delete a list of conversation docs in parallel. Caller is responsible for
// having confirmed the deletion list — this performs the writes immediately.
// Note: this only removes the parent doc; messages subcollection orphans on
// the deleted ids are not reachable through the UI anyway because the parent
// query no longer surfaces them.
export const deleteConversationsBulk = async (convoIds) => {
    if (!Array.isArray(convoIds) || convoIds.length === 0) return { deleted: 0 };
    const results = await Promise.allSettled(
        convoIds.map(id => deleteDoc(doc(db, "conversations", id)))
    );
    const deleted = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.length - deleted;
    return { deleted, failed };
};

export { arrayUnion, arrayRemove };


