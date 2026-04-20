import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import PageTransition from '../components/PageTransition';

// Route-level code splitting. Each page ships as its own chunk — initial
// bundle drops dramatically. The user only downloads what they navigate to.
const LandingPage = lazy(() => import('../pages/LandingPage'));
const Login = lazy(() => import('../pages/Login'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const CreatePost = lazy(() => import('../pages/CreatePost'));
const PostDetail = lazy(() => import('../pages/PostDetail'));
const MyPosts = lazy(() => import('../pages/MyPosts'));
const Profile = lazy(() => import('../pages/Profile'));
const AdminDashboard = lazy(() => import('../pages/AdminDashboard'));
const Chat = lazy(() => import('../pages/Chat'));

// Minimal fallback — the first-paint snap class on <html> hides the body
// anyway for the very first frame. After that, route changes show this.
const RouteFallback = () => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    minHeight: '50vh', padding: '40px'
  }}>
    <div style={{
      width: '28px', height: '28px',
      border: '2.5px solid rgba(94, 210, 156, 0.18)',
      borderTopColor: '#8be8bc',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite'
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

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
  postsLoading,
  login,
  logout,
  addPost,
  updatePost,
  updatePostStatus,
  updateUser,
  deleteUser,
  addMeetingRequest,
  addInterest,
  respondToMeeting
}) {
  const location = useLocation();

  return (
    <Suspense fallback={<RouteFallback />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
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
              <PageTransition><Dashboard posts={posts} postsLoading={postsLoading} user={user} updateUser={updateUser} /></PageTransition>
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
              <PageTransition><Profile user={user} updateUser={updateUser} deleteUser={deleteUser} posts={posts} logout={logout} /></PageTransition>
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

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}

export default AppRoutes;
