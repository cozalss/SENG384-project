import { useState, useEffect } from 'react';
import { mockPosts, mockUsers } from '../mockData';
import {
  subscribeToPostsRT,
  addPostToFirestore,
  updatePostInFirestore,
  addActivityLog,
  addInterestToSubcol,
  addMeetingToSubcol,
  updateMeetingStatus,
  cancelMeetingRequest as cancelMeetingInFirestore,
} from '../services/firestore';
import { arrayUnion } from 'firebase/firestore';

let emailjsInitialized = false;

const getEmailJs = async () => {
  const { default: emailjs } = await import('@emailjs/browser');
  if (!emailjsInitialized && import.meta.env.VITE_EMAILJS_PUBLIC_KEY) {
    emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);
    emailjsInitialized = true;
  }
  return emailjs;
};

export function usePosts(user, addNotification) {
  // Start empty — mock data is only a fallback if Firebase init fails.
  // Previously we initialized with mockPosts which caused a visible "3 posts
  // then drops to 1" flicker on refresh as Firebase delivered the real list.
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);

  useEffect(() => {
    let unsubPosts;
    let isActive = true;

    try {
      unsubPosts = subscribeToPostsRT((firestorePosts) => {
        if (!isActive) return;
        setPosts(firestorePosts);
        setPostsLoading(false);
      });
    } catch (error) {
      console.error('Firebase init error for posts:', error);
      if (isActive) {
        if (addNotification) {
          addNotification({
            type: 'error',
            title: 'Database Offline',
            message: 'Unable to sync with live records. You are viewing cached/mock data.'
          });
        }
        setTimeout(() => {
          setPosts(mockPosts);
          setPostsLoading(false);
        }, 0);
      }
    }
    return () => {
      isActive = false;
      if (unsubPosts) unsubPosts();
    };
  }, [addNotification]);

  // Automatic post expiry check (FR-13).
  // Runs when the realtime post list arrives, and afterwards every 5 minutes
  // to pick up posts that have crossed their expiry while the tab stayed open.
  // The interval is the actual cadence; the effect re-binds whenever `posts`
  // changes so the latest snapshot is always inspected. Depending only on
  // `posts.length` (the previous shape) missed posts that flipped status
  // while the array length stayed constant, so an Active post could cross
  // its expiry without ever being marked Expired.
  useEffect(() => {
    let cancelled = false;
    const checkExpiry = () => {
      if (cancelled) return;
      const now = Date.now();
      posts.forEach(p => {
        if (p.status === 'Active' && p.expiryDate && new Date(p.expiryDate).getTime() < now) {
          updatePostInFirestore(p.id, {
            status: 'Expired',
            statusHistory: arrayUnion({
              status: 'Expired',
              at: new Date().toISOString(),
              byUserId: 'system',
              byUserName: 'Auto-expiry',
            }),
          });
        }
      });
    };
    checkExpiry();
    const interval = setInterval(checkExpiry, 5 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [posts]);

  const addPost = async (newPost, isDraft = false) => {
    if (!user) return;

    const initialStatus = isDraft ? 'Draft' : 'Active';
    const nowIso = new Date().toISOString();
    const postWithId = {
      ...newPost,
      id: `post-${Date.now()}`,
      status: initialStatus,
      createdAt: nowIso,
      authorId: user.id,
      authorName: user.name,
      authorRole: user.role,
      authorEmail: user.email,
      // Denormalized counters — actual entries live in /posts/{postId}/interests
      // and /posts/{postId}/meetings subcollections. Keeps the parent doc small
      // and avoids the 1MB Firestore document limit on popular posts.
      interestCount: 0,
      meetingCount: 0,
      // Brief 4.5.1 — "View lifecycle history". We persist every status
      // transition as an append-only log on the parent doc so admins can audit
      // the path a post took without joining against the activity log.
      statusHistory: [
        { status: initialStatus, at: nowIso, byUserId: user.id, byUserName: user.name },
      ],
    };

    await addPostToFirestore(postWithId);

    addNotification({
      type: isDraft ? 'post-draft' : 'post-created',
      title: isDraft ? 'Draft Saved' : 'Post Published',
      targetUserId: user.id,
      message: isDraft
        ? `Your draft "${newPost.title}" has been saved.`
        : `Your announcement "${newPost.title}" is now live on the network.`
    });

    await addActivityLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: user.id,
      userName: user.name,
      role: user.role,
      actionType: 'POST_CREATE',
      targetEntity: postWithId.id,
      result: 'success',
      details: isDraft ? `Saved draft '${newPost.title}'` : `Created '${newPost.title}'`
    });
  };

  // Whitelist of fields that the post-edit UI is allowed to touch. Anything
  // outside this set (authorId, status, createdAt, interestCount, etc.) must
  // not be writable from the edit surface — devtools could otherwise call
  // updatePost(id, { authorId: '<other>' }) and silently steal a post.
  const EDITABLE_POST_FIELDS = new Set([
    'title',
    'explanation',
    'highLevelIdea',
    'expertiseNeeded',
    'collaborationType',
    'commitmentLevel',
    'city',
    'country',
    'confidentiality',
    'expiryDate',
    'projectStage',
    'domain',
  ]);

  const updatePost = async (postId, updatedFields) => {
    if (!user) return;
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    if (post.authorId !== user.id && user.role !== 'Admin') return;

    const safeFields = {};
    for (const key of Object.keys(updatedFields || {})) {
      if (EDITABLE_POST_FIELDS.has(key)) safeFields[key] = updatedFields[key];
    }
    if (Object.keys(safeFields).length === 0) return;

    await updatePostInFirestore(postId, safeFields);

    addNotification({
      type: 'post-edited',
      title: 'Post Updated',
      targetUserId: user.id,
      message: `Your announcement has been updated successfully.`
    });

    await addActivityLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: user.id,
      userName: user.name,
      role: user.role,
      actionType: 'POST_EDIT',
      targetEntity: postId,
      result: 'success',
      details: `Edited post ${postId}`
    });
  };

  const updatePostStatus = async (postId, newStatus) => {
    if (!user) return;
    // Brief 4.5.1 — append the transition to the lifecycle history. arrayUnion
    // is idempotent, so a double-click won't double-stamp the timeline; the
    // payload includes a unique timestamp so legitimate repeated transitions
    // (e.g. Active → Meeting Scheduled → Active again) all land cleanly.
    const transition = {
      status: newStatus,
      at: new Date().toISOString(),
      byUserId: user.id,
      byUserName: user.name,
    };
    await updatePostInFirestore(postId, {
      status: newStatus,
      statusHistory: arrayUnion(transition),
    });

    if (newStatus === 'CLOSED') {
      addNotification({
        type: 'post-closed',
        title: 'Partner Found',
        targetUserId: user.id,
        message: 'Your announcement has been marked as Partner Found and closed.'
      });
    }

    await addActivityLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: user.id,
      userName: user.name,
      role: user.role,
      actionType: newStatus === 'CLOSED' ? 'POST_CLOSE' : 'POST_STATUS_CHANGE',
      targetEntity: postId,
      result: 'success',
      details: `Post status changed to ${newStatus}`
    });
  };

  const addInterest = async (postId, interest) => {
    if (!user) return { ok: false, reason: 'not-signed-in' };
    const post = posts.find(p => p.id === postId);
    if (!post) return { ok: false, reason: 'post-not-found' };
    if (post.authorId === user.id) return { ok: false, reason: 'is-author' };

    await addInterestToSubcol(postId, interest);

    // Notify the post AUTHOR — this is the person who needs to know that
    // someone wants to collaborate. (Previously the notification was global
    // and untargeted, so it surfaced for the wrong user.)
    addNotification({
      type: 'interest',
      title: 'New Interest in Your Post',
      targetUserId: post.authorId,
      message: `${interest.userName} expressed interest in "${post.title}".`
    });

    // Best-effort author email so they don't have to be on the site. Email
    // failure does not block the in-app workflow — the in-app notification
    // still reaches the author — but we surface the failure in the return so
    // the caller can show a soft toast and the user knows the email side
    // didn't go through (rate-limit, EmailJS outage, missing template).
    let emailDelivered = null; // null = not attempted, true/false = result
    const authorEmail = post.authorEmail || mockUsers.find(u => u.id === post.authorId)?.email;
    if (authorEmail && import.meta.env.VITE_EMAILJS_SERVICE_ID && import.meta.env.VITE_EMAILJS_TEMPLATE_ID) {
      try {
        const emailjs = await getEmailJs();
        await emailjs.send(
          import.meta.env.VITE_EMAILJS_SERVICE_ID,
          import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
          {
            project_title: post.title,
            to_name: post.authorName,
            from_name: user.name,
            name: user.name,
            to_email: authorEmail,
            from_email: user.email,
            meeting_slot: interest.message
              ? `Interest message: ${interest.message}`
              : 'No additional message.'
          }
        );
        emailDelivered = true;
      } catch (error) {
        console.error('Failed to send interest email:', error);
        emailDelivered = false;
      }
    }

    await addActivityLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: user.id,
      userName: user.name,
      role: user.role,
      actionType: 'INTEREST_EXPRESSED',
      targetEntity: postId,
      result: 'success',
      details: `Expressed interest in post ${postId}`
    });

    return { ok: true, emailDelivered };
  };

  const addMeetingRequest = async (postId, meeting) => {
    if (!user) return { ok: false, reason: 'not-signed-in' };
    const post = posts.find(p => p.id === postId);
    if (!post) return { ok: false, reason: 'post-not-found' };
    if (post.authorId === user.id) return { ok: false, reason: 'is-author' };

    const authorEmail = post.authorEmail || mockUsers.find(u => u.id === post.authorId)?.email;
    const authorName = post.authorName;
    const postTitle = post.title;

    await addMeetingToSubcol(postId, meeting);

    // EmailJS Integration. Email is best-effort — the in-app notification is
    // the source of truth — but we report delivery in the return value so the
    // proposer can be told if their email side failed (e.g. rate-limit).
    let emailDelivered = null;
    if (authorEmail && import.meta.env.VITE_EMAILJS_SERVICE_ID && import.meta.env.VITE_EMAILJS_TEMPLATE_ID) {
      try {
        const emailjs = await getEmailJs();
        const templateParams = {
          project_title: postTitle,
          to_name: authorName,
          from_name: user.name,
          name: user.name,
          to_email: authorEmail,
          from_email: user.email,
          meeting_slot: meeting.slot?.label || 'Not specified'
        };

        await emailjs.send(
          import.meta.env.VITE_EMAILJS_SERVICE_ID,
          import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
          templateParams
        );
        emailDelivered = true;
      } catch (error) {
        console.error('Failed to send meeting request email:', error);
        emailDelivered = false;
      }
    }

    addNotification({
      type: 'meeting-request',
      title: 'Meeting Requested',
      targetUserId: post.authorId,
      message: `${meeting.proposedByName} proposed ${meeting.slot?.label || 'a time'} for "${post.title}".`
    });

    await addActivityLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: user.id,
      userName: user.name,
      role: user.role,
      actionType: 'MEETING_REQUEST',
      targetEntity: postId,
      result: 'success',
      details: `Proposed meeting for post ${postId}`
    });

    return { ok: true, emailDelivered };
  };

  const respondToMeeting = async (postId, meetingId, status, meetingSnapshot = null) => {
    if (!user) return;
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    // updateMeetingStatus performs the Firestore write AND returns the meeting
    // doc so we always have the proposer / slot label, even after a hard
    // refresh that wiped the live snapshot from React state.
    const fetched = await updateMeetingStatus(postId, meetingId, status);

    const meeting = meetingSnapshot
        || fetched
        || (post.meetings || []).find(m => m && m.id === meetingId);
    const proposerId = meeting?.proposedBy;
    const slotLabel = meeting?.slot?.label || 'the proposed time';

    // Notify the meeting requester (the OTHER side) of the decision.
    if (proposerId && proposerId !== user.id) {
      addNotification({
        type: status === 'accepted' ? 'meeting-accepted' : 'meeting-declined',
        title: status === 'accepted' ? 'Meeting Accepted' : 'Meeting Declined',
        targetUserId: proposerId,
        message: status === 'accepted'
          ? `${post.authorName} accepted your meeting for "${post.title}" at ${slotLabel}.`
          : `${post.authorName} declined your meeting for "${post.title}".`
      });
    }

    // Echo confirmation to the responder so the bell shows the outcome on
    // their side too.
    addNotification({
      type: status === 'accepted' ? 'meeting-accepted' : 'meeting-declined',
      title: status === 'accepted' ? 'You accepted a meeting' : 'You declined a meeting',
      targetUserId: user.id,
      message: status === 'accepted'
        ? `Meeting confirmed for "${post.title}" — ${slotLabel}.`
        : `You declined the meeting for "${post.title}".`
    });

    await addActivityLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: user.id,
      userName: user.name,
      role: user.role,
      actionType: status === 'accepted' ? 'MEETING_ACCEPT' : 'MEETING_DECLINE',
      targetEntity: postId,
      result: 'success',
      details: `${status} meeting request ${meetingId}`
    });
  };

  // Brief 4.4 — proposer-side "Cancel meeting request". Allowed only when the
  // meeting is still pending. After cancellation, the post author gets an
  // in-app notification so they aren't waiting on a slot that's no longer on
  // the table.
  const cancelMeeting = async (postId, meetingId) => {
    if (!user) return { ok: false, reason: 'not-signed-in' };
    const post = posts.find(p => p.id === postId);
    if (!post) return { ok: false, reason: 'post-not-found' };

    const result = await cancelMeetingInFirestore(postId, meetingId);
    if (!result.ok) return result;

    const slotLabel = result.meeting?.slot?.label || 'the proposed time';

    // Notify the post author — only if the cancelling user isn't the author
    // themselves (defensive; in normal flow only proposers cancel).
    if (post.authorId && post.authorId !== user.id) {
      addNotification({
        type: 'meeting-cancelled',
        title: 'Meeting Request Cancelled',
        targetUserId: post.authorId,
        message: `${user.name} cancelled their meeting request for "${post.title}" (${slotLabel}).`,
      });
    }

    // Echo to the proposer so the bell reflects their own action.
    addNotification({
      type: 'meeting-cancelled',
      title: 'Meeting cancelled',
      targetUserId: user.id,
      message: `You cancelled your meeting request for "${post.title}".`,
    });

    await addActivityLog({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: user.id,
      userName: user.name,
      role: user.role,
      actionType: 'MEETING_CANCEL',
      targetEntity: postId,
      result: 'success',
      details: `Cancelled meeting ${meetingId}`,
    });

    return { ok: true };
  };

  return { posts, postsLoading, addPost, updatePost, updatePostStatus, addInterest, addMeetingRequest, respondToMeeting, cancelMeeting };
}
