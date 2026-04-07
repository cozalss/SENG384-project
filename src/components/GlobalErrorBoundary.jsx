import React from 'react';
import { ShieldAlert, RefreshCcw, Home } from 'lucide-react';
import { motion } from 'framer-motion';

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Critical Fault Detected:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#030712',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          color: 'white',
          fontFamily: "'Inter', sans-serif"
        }}>
          {/* Animated Background Orbs (Re-used from App.css style) */}
          <div style={{
            position: 'fixed',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            filter: 'blur(100px)',
            background: 'radial-gradient(circle, rgba(239, 68, 68, 0.15) 0%, transparent 70%)',
            top: '-200px',
            left: '-150px',
            zIndex: -1
          }}></div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel"
            style={{
              maxWidth: '540px',
              padding: '64px 48px',
              textAlign: 'center',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              boxShadow: '0 25px 64px rgba(0, 0, 0, 0.8), 0 0 40px rgba(239, 68, 68, 0.05)'
            }}
          >
            <div style={{
              background: 'rgba(239, 68, 68, 0.12)',
              padding: '16px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              width: 'max-content'
            }}>
              <ShieldAlert size={48} color="#ef4444" />
            </div>

            <h1 style={{
              fontSize: '32px',
              fontWeight: '800',
              marginBottom: '16px',
              fontFamily: "'Space Grotesk', sans-serif",
              letterSpacing: '-0.04em'
            }}>
              Critical <span style={{ color: 'var(--badge-error-text)' }}>Diagnostics</span> Fault
            </h1>
            
            <p className="text-muted" style={{ fontSize: '15px', lineHeight: '1.7', marginBottom: '32px' }}>
              We encountered an unhandled exception in the platform state. No data has been lost, but a system restart is required.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button 
                onClick={() => window.location.reload()}
                className="btn btn-accent"
                style={{ padding: '14px', borderRadius: '14px' }}
              >
                <RefreshCcw size={18} /> Recover Session
              </button>
              <button 
                onClick={() => window.location.href = '/'}
                className="btn btn-secondary"
                style={{ padding: '14px', borderRadius: '14px' }}
              >
                <Home size={18} /> Return Home
              </button>
            </div>
            
            <div style={{ 
              marginTop: '40px', 
              paddingTop: '24px', 
              borderTop: '1px solid var(--border)', 
              fontSize: '11px', 
              color: 'var(--text-subtle)',
              fontFamily: 'monospace'
            }}>
              ERROR CODE: {this.state.error?.name?.toUpperCase() || 'UNKNOWN_STMT_EXEC'}
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
