import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import AppRoutes from './routes/AppRoutes';
import { useAuth } from './hooks/useAuth';
import { useNotifications } from './hooks/useNotifications';
import { usePosts } from './hooks/usePosts';
import NetworkStatus from './components/NetworkStatus';
import GlobalErrorBoundary from './components/GlobalErrorBoundary';
import HeroDNA from './components/HeroDNA';
import VideoBackground from './components/VideoBackground';
import { Suspense, useState, useEffect } from 'react';
import './App.css';

function AppContent() {
  const { user, login, logout, updateUser } = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    // Ensure no stale light-mode class lingers from previous versions
    document.documentElement.classList.remove('light');
    localStorage.removeItem('theme');
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { 
    notifications, 
    addNotification, 
    dismissNotification, 
    dismissAllNotifications 
  } = useNotifications();
  
  const { 
    posts, 
    addPost, 
    updatePost, 
    updatePostStatus, 
    addInterest, 
    addMeetingRequest,
    respondToMeeting 
  } = usePosts(user, addNotification);

  const location = useLocation();
  const isFullWidth = location.pathname === '/' || location.pathname === '/login';
  const isLanding = location.pathname === '/';

  useEffect(() => {
    if (isLanding) {
      document.body.classList.add('theme-landing');
    } else {
      document.body.classList.remove('theme-landing');
    }
    return () => document.body.classList.remove('theme-landing');
  }, [isLanding]);

  return (
    <>
      {/* Video is always mounted to avoid HLS reload stutter on navigation;
          it's hidden on landing via opacity/visibility transition. */}
      <VideoBackground hidden={isLanding} />

      {isLanding && (
        <>
          <div className="bg-grid-lines"></div>
          <div className="bg-orb-wrap">
            <div className="bg-orb orb-1"></div>
            <div className="bg-orb orb-2"></div>
            <div className="bg-orb orb-3"></div>
            <div className="bg-orb orb-4"></div>
            <div className="bg-orb orb-5"></div>
          </div>
          <Suspense fallback={null}>
            <HeroDNA isMobile={isMobile} />
          </Suspense>
        </>
      )}
      
      <NetworkStatus />

      <div className="app-container">
        {!isFullWidth && (
          <Navbar
            user={user}
            logout={logout}
            notifications={notifications}
            dismissNotification={dismissNotification}
            dismissAllNotifications={dismissAllNotifications}
          />
        )}

        <main
          className={isFullWidth ? 'main-content' : 'main-content container'}
          style={{ marginTop: isFullWidth ? '0px' : '120px' }}
        >
          <AppRoutes
            user={user}
            posts={posts}
            login={login}
            logout={logout}
            addPost={addPost}
            updatePost={updatePost}
            updatePostStatus={updatePostStatus}
            updateUser={updateUser}
            addMeetingRequest={addMeetingRequest}
            addInterest={addInterest}
            respondToMeeting={respondToMeeting}
          />
        </main>
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <GlobalErrorBoundary>
        <AppContent />
      </GlobalErrorBoundary>
    </Router>
  );
}

export default App;
