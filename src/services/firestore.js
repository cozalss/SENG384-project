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
    orderBy
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
    });
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

export const deleteUserFromFirestore = async (userId) => {
    try {
        await deleteDoc(doc(db, "users", userId));
    } catch (err) {
        console.error("Error deleting user:", err);
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
    });
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

// Deterministic ID for 1-on-1 chats
const getConvoId = (uid1, uid2) => {
    return [uid1, uid2].sort().join("_");
};

// Start or get a conversation
export const getOrCreateConversation = async (user1, user2) => {
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

// Send a message within a conversation
export const sendMessage = async (convoId, senderId, text, senderName) => {
    const convoDocRef = doc(db, "conversations", convoId);
    const messagesSubRef = collection(convoDocRef, "messages");

    const newMessage = {
        senderId,
        senderName,
        text,
        timestamp: serverTimestamp(),
        read: false
    };

    // 1. Add message to sub-collection
    await addDoc(messagesSubRef, newMessage);

    // 2. Update conversation summary
    const convoSnap = await getDoc(convoDocRef);
    const currentData = convoSnap.data();
    const otherMemberId = currentData.members.find(id => id !== senderId);

    await updateDoc(convoDocRef, {
        lastMessage: text,
        updatedAt: serverTimestamp(),
        [`unreadCount.${otherMemberId}`]: (currentData.unreadCount?.[otherMemberId] || 0) + 1
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


