'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoadingDataPage() {
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  useEffect(() => {
    // Simulate loading progress over 8 seconds
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          // Redirect to results after loading completes
          setTimeout(() => {
            router.push('/results');
          }, 500);
          return 100;
        }
        return prev + 1.25; // Increment by 1.25% every 100ms (8 seconds total)
      });
    }, 100);

    return () => clearInterval(interval);
  }, [router]);

  return (
    <div style={styles.container}>
      {/* Animated matrix-style background */}
      <div style={styles.matrixBackground}>
        <div style={styles.matrixOverlay}></div>
      </div>
      
      <div style={styles.content}>
        {/* Racing data icon */}
        <div style={styles.iconContainer}>
          <div style={styles.dataIcon}>📊</div>
          <div style={styles.loadingSpinner}></div>
        </div>
        
        {/* Title */}
        <h1 style={styles.title}>
          LOADING DATA FROM SIMULATION
          <span style={styles.dots}>
            {'.'.repeat(Math.floor(progress / 25) + 1)}
          </span>
        </h1>
        
        {/* Progress bar */}
        <div style={styles.progressContainer}>
          <div style={styles.progressBar}>
            <div 
              style={{
                ...styles.progressFill,
                width: `${progress}%`
              }}
            >
              <div style={styles.progressShine}></div>
            </div>
          </div>
          <div style={styles.progressText}>{Math.round(progress)}%</div>
        </div>
        
        {/* Loading status messages */}
        <div style={styles.statusContainer}>
          {progress < 20 && <p style={styles.status}>🔍 Analyzing race telemetry data...</p>}
          {progress >= 20 && progress < 40 && <p style={styles.status}>📈 Processing lap times and sectors...</p>}
          {progress >= 40 && progress < 60 && <p style={styles.status}>🎯 Calculating race positions...</p>}
          {progress >= 60 && progress < 80 && <p style={styles.status}>⚙️ Extracting vehicle performance metrics...</p>}
          {progress >= 80 && progress < 100 && <p style={styles.status}>✨ Finalizing data compilation...</p>}
          {progress === 100 && <p style={styles.statusComplete}>✅ DATA READY!</p>}
        </div>
        
        {/* Data streams animation */}
        <div style={styles.dataStreams}>
          <div style={styles.stream}>{'> '.repeat(50)}</div>
          <div style={{...styles.stream, animationDelay: '0.3s'}}>{'< '.repeat(50)}</div>
          <div style={{...styles.stream, animationDelay: '0.6s'}}>{'> '.repeat(50)}</div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes scrollData {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        
        @keyframes matrixRain {
          0% { background-position: 0% 0%; }
          100% { background-position: 0% 100%; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  container: {
    position: 'relative',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#000000',
  },
  matrixBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      repeating-linear-gradient(
        0deg,
        transparent,
        transparent 2px,
        rgba(0, 255, 0, 0.03) 2px,
        rgba(0, 255, 0, 0.03) 4px
      )
    `,
    animation: 'matrixRain 20s linear infinite',
  },
  matrixOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(ellipse at center, transparent 0%, #000000 100%)',
  },
  content: {
    position: 'relative',
    zIndex: 10,
    textAlign: 'center',
    padding: '40px',
    maxWidth: '800px',
    width: '100%',
  },
  iconContainer: {
    position: 'relative',
    display: 'inline-block',
    marginBottom: '40px',
  },
  dataIcon: {
    fontSize: '80px',
    animation: 'pulse 2s ease infinite',
    filter: 'drop-shadow(0 0 20px rgba(0, 255, 0, 0.6))',
  },
  loadingSpinner: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '120px',
    height: '120px',
    margin: '-60px 0 0 -60px',
    border: '3px solid rgba(0, 255, 0, 0.2)',
    borderTop: '3px solid #00ff00',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  title: {
    fontSize: '36px',
    fontWeight: '900',
    color: '#00ff00',
    marginBottom: '50px',
    letterSpacing: '2px',
    fontFamily: 'Courier New, monospace',
    textShadow: '0 0 20px rgba(0, 255, 0, 0.8)',
    textTransform: 'uppercase',
  },
  dots: {
    display: 'inline-block',
    width: '60px',
    textAlign: 'left',
  },
  progressContainer: {
    position: 'relative',
    marginBottom: '40px',
  },
  progressBar: {
    width: '100%',
    height: '30px',
    background: 'rgba(0, 255, 0, 0.1)',
    borderRadius: '15px',
    overflow: 'hidden',
    border: '2px solid rgba(0, 255, 0, 0.4)',
    boxShadow: '0 0 20px rgba(0, 255, 0, 0.2)',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #00ff00 0%, #00cc00 50%, #00ff00 100%)',
    backgroundSize: '200% 100%',
    transition: 'width 0.1s linear',
    borderRadius: '15px',
    position: 'relative',
    boxShadow: '0 0 20px rgba(0, 255, 0, 0.8)',
    animation: 'shimmer 2s ease infinite',
  },
  progressShine: {
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
    animation: 'shimmer 1.5s ease infinite',
  },
  progressText: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '16px',
    fontWeight: '900',
    color: '#000000',
    fontFamily: 'Courier New, monospace',
    textShadow: '0 0 5px rgba(255, 255, 255, 0.8)',
    mixBlendMode: 'difference',
  },
  statusContainer: {
    minHeight: '30px',
    marginBottom: '30px',
  },
  status: {
    fontSize: '18px',
    color: '#00ff00',
    fontWeight: '600',
    letterSpacing: '1px',
    fontFamily: 'Courier New, monospace',
    animation: 'pulse 1.5s ease infinite',
    textShadow: '0 0 10px rgba(0, 255, 0, 0.6)',
  },
  statusComplete: {
    fontSize: '20px',
    color: '#00ff00',
    fontWeight: '900',
    letterSpacing: '2px',
    fontFamily: 'Courier New, monospace',
    textShadow: '0 0 20px rgba(0, 255, 0, 1)',
    animation: 'pulse 0.5s ease infinite',
  },
  dataStreams: {
    marginTop: '40px',
    overflow: 'hidden',
    opacity: 0.3,
  },
  stream: {
    fontSize: '12px',
    color: '#00ff00',
    fontFamily: 'Courier New, monospace',
    whiteSpace: 'nowrap',
    animation: 'scrollData 5s linear infinite',
    marginBottom: '5px',
  },
};

