import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import PageTransition from '../components/PageTransition';
import LandingPage from '../pages/LandingPage';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import CreatePost from '../pages/CreatePost';
import PostDetail from '../pages/PostDetail';
import MyPosts from '../pages/MyPosts';
import Profile from '../pages/Profile';
import AdminDashboard from '../pages/AdminDashboard';
import Chat from '../pages/Chat';

export const ProtectedRoute = ({ user, children }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export const GuestRoute = ({ user, children }) => {
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

function AppRoutes({ 
  user, 
  posts, 
  login, 
  logout, 
  addPost, 
  updatePost, 
  updatePostStatus, 
  updateUser, 
  addMeetingRequest, 
  addInterest,
  respondToMeeting 
}) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Landing page for unauthenticated users */}
        <Route path="/" element={
          <GuestRoute user={user}>
            <PageTransition><LandingPage /></PageTransition>
          </GuestRoute>
        } />

        <Route path="/login" element={
          <GuestRoute user={user}>
            <PageTransition><Login login={login} /></PageTransition>
          </GuestRoute>
        } />

        <Route path="/dashboard" element={
          <ProtectedRoute user={user}>
            <PageTransition><Dashboard posts={posts} user={user} updateUser={updateUser} /></PageTransition>
          </ProtectedRoute>
        } />

        <Route path="/create-post" element={
          <ProtectedRoute user={user}>
            <PageTransition><CreatePost addPost={addPost} user={user} /></PageTransition>
          </ProtectedRoute>
        } />

        <Route path="/post/:id" element={
          <ProtectedRoute user={user}>
            <PageTransition>
              <PostDetail
                posts={posts}
                user={user}
                updatePost={updatePost}
                updatePostStatus={updatePostStatus}
                addMeetingRequest={addMeetingRequest}
                addInterest={addInterest}
                respondToMeeting={respondToMeeting}
              />
            </PageTransition>
          </ProtectedRoute>
        } />

        <Route path="/my-posts" element={
          <ProtectedRoute user={user}>
            <PageTransition><MyPosts posts={posts} user={user} updatePostStatus={updatePostStatus} /></PageTransition>
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute user={user}>
            <PageTransition><Profile user={user} updateUser={updateUser} posts={posts} logout={logout} /></PageTransition>
          </ProtectedRoute>
        } />

        <Route path="/admin" element={
          <ProtectedRoute user={user}>
            {user?.role === 'Admin' ? <PageTransition><AdminDashboard user={user} posts={posts} /></PageTransition> : <Navigate to="/dashboard" replace />}
          </ProtectedRoute>
        } />

        <Route path="/chat" element={
          <ProtectedRoute user={user}>
            <PageTransition><Chat user={user} /></PageTransition>
          </ProtectedRoute>
        } />



        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default AppRoutes;
