import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import AppRoutes from './routes/AppRoutes';
import { useAuth } from './hooks/useAuth';
import { useNotifications } from './hooks/useNotifications';
import { usePosts } from './hooks/usePosts';
import NetworkStatus from './components/NetworkStatus';
import GlobalErrorBoundary from './components/GlobalErrorBoundary';
import ScrollToTop from './components/ScrollToTop';
import ShortcutsModal from './components/ShortcutsModal';
import { ToastProvider } from './components/ToastProvider';
import { Suspense, lazy, useState, useEffect } from 'react';
import { MotionConfig } from 'framer-motion';
import { AnimReadyContext } from './hooks/useAnimReady';
import './App.css';

// Heavy dependencies — lazy-loaded to keep initial bundle lean.
// Three.js + r3f + drei alone are ~400KB gzipped; HLS.js is ~60KB.
const HeroDNA = lazy(() => import('./components/HeroDNA'));
const VideoBackground = lazy(() => import('./components/VideoBackground'));

function AppContent() {
  const { user, login, logout, updateUser, deleteUser } = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [animReady, setAnimReady] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    // Ensure no stale light-mode class lingers from previous versions
    document.documentElement.classList.remove('light');
    localStorage.removeItem('theme');
    // Lift the first-paint animation lock after one frame — both CSS and FM
    // animations resume after the initial snap.
    const rafId = requestAnimationFrame(() => {
      document.documentElement.classList.remove('no-anim-initial');
      setAnimReady(true);
    });
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(rafId);
    };
  }, []);

  const { 
    notifications, 
    addNotification, 
    dismissNotification, 
    dismissAllNotifications 
  } = useNotifications();
  
  const {
    posts,
    postsLoading,
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

  // Deferred unmount of heavy landing decorations — avoids Three.js disposal
  // blocking the main thread during navigation. The login/dashboard route
  // renders first; the heavy scene is torn down AFTER the new page paints.
  const [landingDecorMounted, setLandingDecorMounted] = useState(isLanding);
  const [landingDecorVisible, setLandingDecorVisible] = useState(isLanding);

  // Sync mount state on landing → ensure it's mounted (idempotent, pre-effect).
  if (isLanding && !landingDecorMounted) {
    setLandingDecorMounted(true);
  }

  useEffect(() => {
    let rafId;
    let timeoutId;
    rafId = requestAnimationFrame(() => {
      setLandingDecorVisible(isLanding);
    });
    if (!isLanding) {
      timeoutId = setTimeout(() => setLandingDecorMounted(false), 650);
    }
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isLanding]);

  useEffect(() => {
    if (isLanding) {
      document.body.classList.add('theme-landing');
    } else {
      document.body.classList.remove('theme-landing');
    }
    return () => document.body.classList.remove('theme-landing');
  }, [isLanding]);

  return (
    <AnimReadyContext.Provider value={animReady}>
    <MotionConfig
      // On very first frame, force all descendant FM animations to be instant
      // (0 duration). After first paint we flip animReady and animations resume.
      transition={animReady ? undefined : { duration: 0 }}
      reducedMotion={animReady ? 'never' : 'always'}
    >
      {/* Video is always mounted to avoid HLS reload stutter on navigation;
          it's hidden on landing via opacity/visibility transition. */}
      <Suspense fallback={null}>
        <VideoBackground hidden={isLanding} />
      </Suspense>

      {landingDecorMounted && (
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: -1,
            pointerEvents: 'none',
            opacity: landingDecorVisible ? 1 : 0,
            transition: 'opacity 0.55s cubic-bezier(0.16, 1, 0.3, 1)',
            willChange: 'opacity'
          }}
        >
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
        </div>
      )}
      
      <NetworkStatus />
      <ShortcutsModal />

      <div className="app-container">
        {!isFullWidth && (
          <Navbar
            user={user}
            logout={logout}
            notifications={notifications}
            dismissNotification={dismissNotification}
            dismissAllNotifications={dismissAllNotifications}
            posts={posts}
          />
        )}

        <main
          className={isFullWidth ? 'main-content' : 'main-content container'}
          style={{ marginTop: isFullWidth ? '0px' : '120px' }}
        >
          <AppRoutes
            user={user}
            posts={posts}
            postsLoading={postsLoading}
            login={login}
            logout={logout}
            addPost={addPost}
            updatePost={updatePost}
            updatePostStatus={updatePostStatus}
            updateUser={updateUser}
            deleteUser={deleteUser}
            addMeetingRequest={addMeetingRequest}
            addInterest={addInterest}
            respondToMeeting={respondToMeeting}
          />
        </main>
      </div>
    </MotionConfig>
    </AnimReadyContext.Provider>
  );
}

function App() {
  return (
    <Router>
      <GlobalErrorBoundary>
        <ToastProvider>
          <ScrollToTop />
          <AppContent />
        </ToastProvider>
      </GlobalErrorBoundary>
    </Router>
  );
}

export default App;
