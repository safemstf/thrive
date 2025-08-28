// src/components/cs/bacteria/bacteria.styles.ts
export const styles = {
  // Animation keyframes
  keyframes: `
    @keyframes pulse {
      0% {
        transform: translate(-50%, -50%) scale(1);
        opacity: 1;
      }
      100% {
        transform: translate(-50%, -50%) scale(4);
        opacity: 0;
      }
    }
    
    @keyframes slideIn {
      from {
        transform: translateY(10px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
    
    @keyframes heartbeat {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
  `,

  // Class styles
  statCard: `
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    }
  `,

  // Layout styles
  container: (isDark: boolean) => ({
    width: '100%',
    maxWidth: '1920px',
    margin: '0 auto',
    background: isDark ? 'linear-gradient(180deg, #0a0a0a 0%, #111111 50%, #0a0a0a 100%)' : '#f8fafc',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  }),

  header: (isDark: boolean) => ({
    padding: '1rem 1.5rem',
    background: isDark ? 
      'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))' : 
      'linear-gradient(135deg, rgba(248, 250, 252, 0.95), rgba(241, 245, 249, 0.95))',
    borderBottom: `2px solid ${isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'}`,
    backdropFilter: 'blur(10px)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  }),

  title: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: 800,
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },

  clockContainer: {
    display: 'flex',
    gap: '1rem',
    padding: '0.5rem 1rem',
    background: 'rgba(59, 130, 246, 0.1)',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    borderRadius: '12px'
  },

  clockSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },

  clockLabel: {
    fontSize: '0.625rem',
    color: '#94a3b8',
    marginBottom: '0.25rem'
  },

  clockValue: (color: string) => ({
    fontSize: '1rem',
    fontWeight: 700,
    color,
    fontFamily: 'monospace',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  }),

  divider: {
    width: '1px',
    background: 'rgba(59, 130, 246, 0.3)'
  },

  performanceMetrics: (isDark: boolean) => ({
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
    fontSize: '0.875rem',
    color: isDark ? '#94a3b8' : '#64748b'
  }),

  metricItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem'
  },

  quickControls: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center'
  },

  controlButton: (isDark: boolean, isActive: boolean = false) => ({
    background: isActive ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    borderRadius: '6px',
    padding: '0.5rem',
    color: isDark ? '#94a3b8' : '#64748b',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  }),

  simulationContainer: (isDark: boolean) => ({
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: '1.5rem',
    gap: '1.5rem'
  }),

  canvasContainer: (isDark: boolean) => ({
    position: 'relative',
    background: isDark ? 
      'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' : 
      'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    borderRadius: '16px',
    overflow: 'hidden',
    border: `3px solid ${isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'}`,
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  }),

  controlsOverlay: {
    position: 'absolute',
    bottom: '1.5rem',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    alignItems: 'center'
  },

  speedMenu: {
    display: 'flex',
    gap: '0.5rem',
    background: 'rgba(0, 0, 0, 0.9)',
    padding: '1rem',
    borderRadius: '16px',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    animation: 'slideIn 0.2s ease-out'
  },

  speedPresetButton: (isActive: boolean) => ({
    background: isActive ? 
      'rgba(59, 130, 246, 0.3)' : 
      'rgba(255, 255, 255, 0.05)',
    border: `1px solid ${isActive ? 
      'rgba(59, 130, 246, 0.5)' : 
      'rgba(255, 255, 255, 0.1)'}`,
    borderRadius: '8px',
    padding: '0.5rem 1rem',
    color: isActive ? '#3b82f6' : '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: '60px'
  }),

  mainControls: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
    background: 'rgba(0, 0, 0, 0.8)',
    padding: '1rem 1.5rem',
    borderRadius: '16px',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
  },

  playPauseButton: (isRunning: boolean) => ({
    background: isRunning ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)',
    border: `2px solid ${isRunning ? 'rgba(239, 68, 68, 0.5)' : 'rgba(34, 197, 94, 0.5)'}`,
    borderRadius: '12px',
    padding: '0.75rem',
    color: '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    animation: isRunning ? 'heartbeat 1s infinite' : 'none'
  }),

  resetButton: {
    background: 'rgba(156, 163, 175, 0.2)',
    border: '2px solid rgba(156, 163, 175, 0.5)',
    borderRadius: '12px',
    padding: '0.75rem',
    color: '#fff',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },

  speedControl: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    color: '#fff',
    background: 'rgba(59, 130, 246, 0.1)',
    padding: '0.5rem 1rem',
    borderRadius: '12px',
    border: '1px solid rgba(59, 130, 246, 0.3)'
  },

  miniStats: {
    position: 'absolute',
    top: '1.5rem',
    right: '1.5rem',
    background: 'rgba(0, 0, 0, 0.85)',
    padding: '1rem 1.25rem',
    borderRadius: '16px',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    minWidth: '320px',
    fontSize: '0.875rem',
    color: '#fff',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
  },

  errorDisplay: {
    position: 'fixed',
    bottom: '1.5rem',
    right: '1.5rem',
    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(127, 29, 29, 0.9))',
    color: '#fff',
    padding: '1rem 1.25rem',
    borderRadius: '12px',
    maxWidth: '400px',
    fontSize: '0.875rem',
    boxShadow: '0 10px 25px rgba(239, 68, 68, 0.3)',
    border: '1px solid rgba(239, 68, 68, 0.5)',
    zIndex: 1000,
    animation: 'slideIn 0.3s ease-out'
  },

  // Color themes
  colors: {
    physiology: {
      primary: '#ef4444',
      secondary: 'rgba(239, 68, 68, 0.1)',
      border: 'rgba(239, 68, 68, 0.3)'
    },
    microbiology: {
      primary: '#8b5cf6',
      secondary: 'rgba(139, 92, 246, 0.1)',
      border: 'rgba(139, 92, 246, 0.3)'
    },
    therapy: {
      primary: '#10b981',
      secondary: 'rgba(16, 185, 129, 0.1)',
      border: 'rgba(16, 185, 129, 0.3)'
    },
    immune: {
      primary: '#06b6d4',
      secondary: 'rgba(6, 182, 212, 0.1)',
      border: 'rgba(6, 182, 212, 0.3)'
    },
    analytics: {
      primary: '#ec4899',
      secondary: 'rgba(236, 72, 153, 0.1)',
      border: 'rgba(236, 72, 153, 0.3)'
    }
  }
};