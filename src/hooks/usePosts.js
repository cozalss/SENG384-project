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
} from '../services/firestore';
import emailjs from '@emailjs/browser';

// Initialize emailjs with VITE_EMAILJS_PUBLIC_KEY
if (import.meta.env.VITE_EMAILJS_PUBLIC_KEY) {
  emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);
}

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
  // (Previously ran every 60s on every posts-array change, which fired far
  // more Firestore writes than needed — see audit.)
  useEffect(() => {
    let cancelled = false;
    const checkExpiry = () => {
      if (cancelled) return;
      const now = Date.now();
      posts.forEach(p => {
        if (p.status === 'Active' && p.expiryDate && new Date(p.expiryDate).getTime() < now) {
          updatePostInFirestore(p.id, { status: 'Expired' });
        }
      });
    };
    checkExpiry();
    const interval = setInterval(checkExpiry, 5 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts.length]);

  const addPost = async (newPost, isDraft = false) => {
    if (!user) return;
    
    const postWithId = {
      ...newPost,
      id: `post-${Date.now()}`,
      status: isDraft ? 'Draft' : 'Active',
      createdAt: new Date().toISOString(),
      authorId: user.id,
      authorName: user.name,
      authorRole: user.role,
      authorEmail: user.email,
      // Denormalized counters — actual entries live in /posts/{postId}/interests
      // and /posts/{postId}/meetings subcollections. Keeps the parent doc small
      // and avoids the 1MB Firestore document limit on popular posts.
      interestCount: 0,
      meetingCount: 0,
    };

    await addPostToFirestore(postWithId);

    addNotification({
      type: isDraft ? 'post-draft' : 'post-created',
      title: isDraft ? 'Draft Saved' : 'Post Published',
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

  const updatePost = async (postId, updatedFields) => {
    if (!user) return;
    await updatePostInFirestore(postId, updatedFields);

    addNotification({
      type: 'post-edited',
      title: 'Post Updated',
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
    await updatePostInFirestore(postId, { status: newStatus });

    if (newStatus === 'CLOSED') {
      addNotification({
        type: 'post-closed',
        title: 'Partner Found',
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
    if (!user) return;
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    await addInterestToSubcol(postId, interest);

    addNotification({
      type: 'interest',
      title: 'Interest Expressed',
      message: `${interest.userName} expressed interest in a collaboration.`
    });

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
  };

  const addMeetingRequest = async (postId, meeting) => {
    if (!user) return;
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const authorEmail = post.authorEmail || mockUsers.find(u => u.id === post.authorId)?.email;
    const authorName = post.authorName;
    const postTitle = post.title;

    await addMeetingToSubcol(postId, meeting);

    // EmailJS Integration
    if (authorEmail && import.meta.env.VITE_EMAILJS_SERVICE_ID) {
      try {
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
        console.log('Meeting request email sent successfully to:', authorEmail);
      } catch (error) {
        console.error('Failed to send meeting request email:', error);
      }
    }

    addNotification({
      type: 'meeting-request',
      title: 'Meeting Requested',
      message: `${meeting.proposedByName} proposed a meeting time.`
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
  };

  const respondToMeeting = async (postId, meetingId, status) => {
    if (!user) return;
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    await updateMeetingStatus(postId, meetingId, status);

    addNotification({
      type: status === 'accepted' ? 'meeting-accepted' : 'meeting-declined',
      title: status === 'accepted' ? 'Meeting Accepted' : 'Meeting Declined',
      message: `You have ${status} the meeting request.`
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

  return { posts, postsLoading, addPost, updatePost, updatePostStatus, addInterest, addMeetingRequest, respondToMeeting };
}
