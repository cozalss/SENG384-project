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
import { useToast } from './hooks/useToast';
import { useState, useEffect } from 'react';
import { MotionConfig } from 'framer-motion';
import { AnimReadyContext } from './hooks/useAnimReady';
import './App.css';
import './liquid-glass.css';

import VideoBackground from './components/VideoBackground';
import LandingBackground from './components/landing/LandingBackground';

function AppContent() {
  const { user, login, logout, updateUser, deleteUser } = useAuth();
  const [animReady, setAnimReady] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    document.documentElement.classList.remove('light');
    localStorage.removeItem('theme');
    const rafId = requestAnimationFrame(() => {
      document.documentElement.classList.remove('no-anim-initial');
      setAnimReady(true);
    });
    return () => cancelAnimationFrame(rafId);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e) => setPrefersReducedMotion(e.matches);
    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, []);

  // Real-time arrivals ALSO surface as a toast so important events (new
  // interest, meeting response, post closed) don't wait for the user to open
  // the bell dropdown. The type of the notification maps to the toast intent.
  const toast = useToast();
  const {
    notifications,
    addNotification,
    dismissNotification,
    dismissAllNotifications
  } = useNotifications({
    onNewNotification: (n) => {
      const intentByType = {
        interest: 'success',
        'meeting-accepted': 'success',
        'post-closed': 'success',
        'meeting-request': 'info',
        'meeting-declined': 'info',
        error: 'error',
      };
      const intent = intentByType[n.type] || 'info';
      toast[intent]?.(n.message || '', { title: n.title, duration: 5500 });
    },
  });

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

  // Once LandingBackground has been mounted, keep it mounted for the rest of
  // the session. On non-landing routes the inner Spline canvas is display:none'd,
  // so its WebGL render loop is paused and it consumes ~zero CPU. This makes
  // Login → Landing instant (no Spline re-init) and keeps Landing → Login
  // transition cheap (no WebGL teardown mid-transition). Users who land directly
  // on /login never mount LandingBackground at all.
  const [mountLandingBg, setMountLandingBg] = useState(isLanding);
  useEffect(() => {
    if (!isLanding) return;
    const id = requestAnimationFrame(() => setMountLandingBg(true));
    return () => cancelAnimationFrame(id);
  }, [isLanding]);

  return (
    <AnimReadyContext.Provider value={animReady}>
    <MotionConfig
      transition={animReady && !prefersReducedMotion ? undefined : { duration: 0 }}
      reducedMotion={prefersReducedMotion ? 'always' : animReady ? 'never' : 'always'}
    >
      <VideoBackground hidden={isLanding} />
      {mountLandingBg && <LandingBackground hidden={!isLanding} />}
      {/* 3.5% SVG noise overlay — kills OLED gradient banding, adds tactile texture
          that premium sites (Stripe, Arc, Framer) all ship. Pointer-events: none,
          pure CSS, zero JS cost. */}
      <div className="fx-grain-global" aria-hidden="true" />

      <NetworkStatus />
      <ShortcutsModal />

      <div className="app-container">
        <a href="#main-content" className="skip-to-content">Skip to main content</a>
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
          id="main-content"
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
