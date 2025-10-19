'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      // Simulate loading progress over 10 seconds
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            // Redirect to simulation after loading completes
            setTimeout(() => {
              router.push('/simulation');
            }, 500);
            return 100;
          }
          return prev + 1; // Increment by 1% every 100ms (10 seconds total)
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [loading, router]);

  const handleStartSimulation = () => {
    setLoading(true);
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        {/* Animated checkered flag pattern background */}
        <div style={styles.checkeredBackground}></div>
        
        <div style={styles.loadingContent}>
          {/* F1 Logo Style Text */}
          <div style={styles.f1Logo}>
            <span style={styles.f1Text}>F1</span>
            <span style={styles.raceText}>COTA SIMULATION</span>
          </div>
          
          {/* Loading Text */}
          <h1 style={styles.loadingTitle}>
            SIMULATION LOADING
            <span style={styles.dots}>
              {'.'.repeat(Math.floor(progress / 25) + 1)}
            </span>
          </h1>
          
          {/* Progress Bar */}
          <div style={styles.progressBarContainer}>
            <div 
              style={{
                ...styles.progressBar,
                width: `${progress}%`
              }}
            >
              <div style={styles.progressGlow}></div>
            </div>
            <div style={styles.progressText}>{progress}%</div>
          </div>
          
          {/* Loading Messages */}
          <div style={styles.loadingMessages}>
            {progress < 20 && <p style={styles.message}>🏎️ Initializing race engines...</p>}
            {progress >= 20 && progress < 40 && <p style={styles.message}>🏁 Loading COTA circuit...</p>}
            {progress >= 40 && progress < 60 && <p style={styles.message}>🎨 Rendering Ferrari F1 models...</p>}
            {progress >= 60 && progress < 80 && <p style={styles.message}>⚡ Calibrating physics simulation...</p>}
            {progress >= 80 && progress < 100 && <p style={styles.message}>🏆 Preparing race start...</p>}
            {progress === 100 && <p style={styles.message}>✅ READY TO RACE!</p>}
          </div>
          
          {/* Racing stripe animation */}
          <div style={styles.racingStripe}></div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.landingContainer}>
      {/* Animated background gradient */}
      <div style={styles.gradientBackground}></div>
      
      {/* Grid pattern overlay */}
      <div style={styles.gridPattern}></div>
      
      <div style={styles.content}>
        {/* F1 Logo */}
        <div style={styles.logoContainer}>
          <div style={styles.f1LogoLarge}>
            <span style={styles.f1TextLarge}>F1</span>
          </div>
          <h1 style={styles.title}>
            CIRCUIT OF THE AMERICAS
            <span style={styles.subtitle}>Race Simulation Experience</span>
          </h1>
        </div>
        
        {/* Feature Cards */}
        <div style={styles.featuresContainer}>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>🏎️</div>
            <h3 style={styles.featureTitle}>Ferrari F1 Cars</h3>
            <p style={styles.featureDesc}>Authentic SF16-H models</p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>🏁</div>
            <h3 style={styles.featureTitle}>COTA Track</h3>
            <p style={styles.featureDesc}>Full circuit replica</p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>⚡</div>
            <h3 style={styles.featureTitle}>Live Action</h3>
            <p style={styles.featureDesc}>Dynamic overtaking</p>
          </div>
        </div>
        
        {/* Start Button */}
        <button 
          onClick={handleStartSimulation}
          style={styles.startButton}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.05) translateY(-2px)';
            e.target.style.boxShadow = '0 20px 40px rgba(220, 0, 0, 0.6), 0 0 80px rgba(220, 0, 0, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1) translateY(0)';
            e.target.style.boxShadow = '0 10px 30px rgba(220, 0, 0, 0.5), 0 0 60px rgba(220, 0, 0, 0.3)';
          }}
        >
          <span style={styles.buttonText}>START SIMULATION</span>
          <span style={styles.buttonIcon}>🏁</span>
        </button>
        
        {/* Footer Info */}
        <div style={styles.footer}>
          <p style={styles.footerText}>
            Experience real-time F1 racing | Realistic physics | Dynamic weather
          </p>
        </div>
      </div>
      
      {/* Animated racing stripes */}
      <div style={styles.stripeTop}></div>
      <div style={styles.stripeBottom}></div>
      
      <style jsx>{`
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes slideStripe {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        
        @keyframes checkeredMove {
          0% { background-position: 0 0, 0 0; }
          100% { background-position: 40px 40px, 40px 40px; }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(220, 0, 0, 0.5); }
          50% { box-shadow: 0 0 40px rgba(220, 0, 0, 0.8); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  // Landing Page Styles
  landingContainer: {
    position: 'relative',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0a0a0a',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, #1a0000 0%, #0a0a0a 50%, #000a1a 100%)',
    backgroundSize: '200% 200%',
    animation: 'gradientShift 15s ease infinite',
  },
  gridPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `
      linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
    `,
    backgroundSize: '50px 50px',
    opacity: 0.5,
  },
  content: {
    position: 'relative',
    zIndex: 10,
    textAlign: 'center',
    padding: '20px',
    maxWidth: '1000px',
  },
  logoContainer: {
    marginBottom: '30px',
  },
  f1LogoLarge: {
    display: 'inline-block',
    marginBottom: '15px',
  },
  f1TextLarge: {
    fontSize: '80px',
    fontWeight: '900',
    background: 'linear-gradient(135deg, #dc0000 0%, #ff4444 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textShadow: '0 0 60px rgba(220, 0, 0, 0.5)',
    letterSpacing: '-5px',
    fontFamily: 'Arial Black, sans-serif',
  },
  title: {
    fontSize: '32px',
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: '8px',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    textShadow: '0 0 20px rgba(255, 255, 255, 0.3)',
    fontFamily: 'Arial Black, sans-serif',
    lineHeight: '1.2',
  },
  subtitle: {
    display: 'block',
    fontSize: '16px',
    fontWeight: '400',
    color: '#dc0000',
    marginTop: '8px',
    letterSpacing: '1.5px',
    fontFamily: 'Arial, sans-serif',
  },
  featuresContainer: {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center',
    marginBottom: '40px',
    flexWrap: 'wrap',
  },
  featureCard: {
    background: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(10px)',
    border: '2px solid rgba(220, 0, 0, 0.3)',
    borderRadius: '12px',
    padding: '20px 18px',
    minWidth: '160px',
    transition: 'all 0.3s ease',
    cursor: 'default',
  },
  featureIcon: {
    fontSize: '36px',
    marginBottom: '10px',
  },
  featureTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: '6px',
    fontFamily: 'Arial Black, sans-serif',
  },
  featureDesc: {
    fontSize: '12px',
    color: '#aaaaaa',
    fontFamily: 'Arial, sans-serif',
  },
  startButton: {
    position: 'relative',
    padding: '20px 50px',
    fontSize: '24px',
    fontWeight: '900',
    color: '#ffffff',
    background: 'linear-gradient(135deg, #dc0000 0%, #a00000 100%)',
    border: '3px solid #ffffff',
    borderRadius: '50px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 10px 30px rgba(220, 0, 0, 0.5), 0 0 60px rgba(220, 0, 0, 0.3)',
    letterSpacing: '2px',
    fontFamily: 'Arial Black, sans-serif',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '12px',
    overflow: 'hidden',
    outline: 'none',
  },
  buttonText: {
    position: 'relative',
    zIndex: 2,
  },
  buttonIcon: {
    fontSize: '28px',
    animation: 'pulse 2s ease infinite',
  },
  footer: {
    marginTop: '30px',
  },
  footerText: {
    color: '#666666',
    fontSize: '12px',
    letterSpacing: '1px',
    fontFamily: 'Arial, sans-serif',
  },
  stripeTop: {
    position: 'absolute',
    top: '10%',
    left: 0,
    right: 0,
    height: '3px',
    background: 'linear-gradient(90deg, transparent, #dc0000, transparent)',
    animation: 'slideStripe 3s ease-in-out infinite',
  },
  stripeBottom: {
    position: 'absolute',
    bottom: '10%',
    left: 0,
    right: 0,
    height: '3px',
    background: 'linear-gradient(90deg, transparent, #dc0000, transparent)',
    animation: 'slideStripe 3s ease-in-out infinite reverse',
  },
  
  // Loading Page Styles
  loadingContainer: {
    position: 'relative',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#000000',
  },
  checkeredBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `
      linear-gradient(45deg, #1a1a1a 25%, transparent 25%),
      linear-gradient(-45deg, #1a1a1a 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #1a1a1a 75%),
      linear-gradient(-45deg, transparent 75%, #1a1a1a 75%)
    `,
    backgroundSize: '40px 40px',
    backgroundPosition: '0 0, 0 20px, 20px -20px, -20px 0px',
    opacity: 0.3,
    animation: 'checkeredMove 2s linear infinite',
  },
  loadingContent: {
    position: 'relative',
    zIndex: 10,
    textAlign: 'center',
    padding: '40px',
    maxWidth: '800px',
    width: '100%',
  },
  f1Logo: {
    marginBottom: '40px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
  },
  f1Text: {
    fontSize: '80px',
    fontWeight: '900',
    background: 'linear-gradient(135deg, #dc0000 0%, #ff4444 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '-3px',
    fontFamily: 'Arial Black, sans-serif',
    animation: 'glow 2s ease infinite',
  },
  raceText: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: '4px',
    fontFamily: 'Arial Black, sans-serif',
  },
  loadingTitle: {
    fontSize: '36px',
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: '40px',
    letterSpacing: '3px',
    fontFamily: 'Arial Black, sans-serif',
    textShadow: '0 0 20px rgba(255, 255, 255, 0.5)',
  },
  dots: {
    display: 'inline-block',
    width: '40px',
    textAlign: 'left',
  },
  progressBarContainer: {
    position: 'relative',
    width: '100%',
    height: '40px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '20px',
    overflow: 'hidden',
    border: '2px solid rgba(220, 0, 0, 0.5)',
    marginBottom: '30px',
  },
  progressBar: {
    height: '100%',
    background: 'linear-gradient(90deg, #dc0000 0%, #ff4444 50%, #dc0000 100%)',
    backgroundSize: '200% 100%',
    transition: 'width 0.1s linear',
    borderRadius: '20px',
    position: 'relative',
    boxShadow: '0 0 20px rgba(220, 0, 0, 0.8)',
    animation: 'gradientShift 2s ease infinite',
  },
  progressGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
    animation: 'slideStripe 1.5s ease infinite',
  },
  progressText: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '18px',
    fontWeight: '900',
    color: '#ffffff',
    textShadow: '0 0 10px rgba(0, 0, 0, 0.8)',
    fontFamily: 'Arial Black, sans-serif',
  },
  loadingMessages: {
    minHeight: '30px',
    marginTop: '20px',
  },
  message: {
    fontSize: '18px',
    color: '#dc0000',
    fontWeight: '700',
    letterSpacing: '1px',
    fontFamily: 'Arial, sans-serif',
    animation: 'pulse 1s ease infinite',
  },
  racingStripe: {
    position: 'absolute',
    bottom: '40px',
    left: 0,
    right: 0,
    height: '5px',
    background: 'linear-gradient(90deg, transparent, #dc0000, transparent)',
    animation: 'slideStripe 2s ease-in-out infinite',
  },
};
