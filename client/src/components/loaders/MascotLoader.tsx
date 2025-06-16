import React, { useState, useEffect } from 'react';

// Types for professional loaders
export type LoaderType = 'pulse' | 'circular' | 'bar' | 'dots' | 'random';
export type LoadingSize = 'small' | 'medium' | 'large';

export interface ProfessionalLoaderProps {
  type?: LoaderType;
  size?: LoadingSize;
  message?: string;
  showMessage?: boolean;
  color?: string;
  secondaryColor?: string;
}

// Professional loading messages for enterprise applications
const loadingMessages = [
  "Processing data...",
  "Analyzing media mentions...",
  "Generating insights...",
  "Computing analytics...",
  "Retrieving information...",
  "Preparing dashboards...",
  "Synchronizing data sources...",
  "Calculating metrics...",
  "Processing intelligence...",
  "Retrieving latest reports..."
];

// Function to get random loading message
const getRandomMessage = () => {
  return loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
};

// Function to determine loader size dimensions
const getSizeDimensions = (size: LoadingSize) => {
  switch (size) {
    case 'small':
      return { width: 40, height: 40, fontSize: '0.75rem', strokeWidth: 3 };
    case 'medium':
      return { width: 60, height: 60, fontSize: '0.875rem', strokeWidth: 4 };
    case 'large':
      return { width: 80, height: 80, fontSize: '1rem', strokeWidth: 5 };
    default:
      return { width: 60, height: 60, fontSize: '0.875rem', strokeWidth: 4 };
  }
};

export const ProfessionalLoader: React.FC<ProfessionalLoaderProps> = ({
  type = 'random',
  size = 'medium',
  message,
  showMessage = true,
  color = '#2563eb', // Modern professional blue
  secondaryColor = '#e2e8f0' // Light gray secondary color
}) => {
  const [currentMessage, setCurrentMessage] = useState(message || getRandomMessage());
  const [activeLoader, setActiveLoader] = useState<LoaderType>(type);
  const { width, height, fontSize, strokeWidth } = getSizeDimensions(size);

  // If type is random, pick one at random
  useEffect(() => {
    if (type === 'random') {
      const loaders: LoaderType[] = ['pulse', 'circular', 'bar', 'dots'];
      setActiveLoader(loaders[Math.floor(Math.random() * loaders.length)]);
    } else {
      setActiveLoader(type);
    }
  }, [type]);

  // Cycle through messages if no specific message is provided
  useEffect(() => {
    if (!message) {
      const intervalId = setInterval(() => {
        setCurrentMessage(getRandomMessage());
      }, 3000);
      
      return () => clearInterval(intervalId);
    }
  }, [message]);

  // Render appropriate loader based on selected type
  const renderLoader = () => {
    switch (activeLoader) {
      case 'pulse':
        return (
          <div className="loader-container" style={{ width, height }}>
            <svg width={width} height={height} viewBox="0 0 50 50">
              <circle 
                cx="25" 
                cy="25" 
                r="20" 
                fill="none" 
                stroke={secondaryColor} 
                strokeWidth={strokeWidth} 
              />
              <circle 
                cx="25" 
                cy="25" 
                r="20" 
                fill="none" 
                stroke={color} 
                strokeWidth={strokeWidth}
                strokeDasharray="31.4 125.6"
                strokeLinecap="round"
              >
                <animateTransform 
                  attributeName="transform" 
                  attributeType="XML"
                  type="rotate"
                  from="0 25 25"
                  to="360 25 25"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle 
                cx="25" 
                cy="25" 
                r="10" 
                fill={color}
                opacity="0.2"
              >
                <animate 
                  attributeName="r" 
                  values="10;15;10" 
                  dur="1.5s" 
                  repeatCount="indefinite" 
                />
                <animate 
                  attributeName="opacity" 
                  values="0.2;0.4;0.2" 
                  dur="1.5s" 
                  repeatCount="indefinite" 
                />
              </circle>
            </svg>
          </div>
        );
        
      case 'circular':
        return (
          <div className="loader-container" style={{ width, height }}>
            <svg width={width} height={height} viewBox="0 0 50 50">
              <circle 
                cx="25" 
                cy="25" 
                r="20" 
                fill="none" 
                stroke={secondaryColor} 
                strokeWidth={strokeWidth} 
              />
              <circle 
                cx="25" 
                cy="25" 
                r="20" 
                fill="none" 
                stroke={color} 
                strokeWidth={strokeWidth}
                strokeDasharray="80 45"
                strokeLinecap="round"
              >
                <animateTransform 
                  attributeName="transform" 
                  attributeType="XML"
                  type="rotate"
                  from="0 25 25"
                  to="360 25 25"
                  dur="1.2s"
                  repeatCount="indefinite"
                />
              </circle>
            </svg>
          </div>
        );
        
      case 'bar':
        return (
          <div className="loader-container" style={{ width, height }}>
            <svg width={width} height={height} viewBox="0 0 100 100">
              <rect 
                x="20" 
                y="30" 
                width="10" 
                height="40" 
                fill={color}
                opacity="0.2"
              >
                <animate 
                  attributeName="opacity" 
                  values="0.2;1;0.2" 
                  dur="1s" 
                  repeatCount="indefinite" 
                  begin="0.0s"
                />
                <animate 
                  attributeName="height" 
                  values="40;50;40" 
                  dur="1s" 
                  repeatCount="indefinite" 
                  begin="0.0s"
                />
                <animate 
                  attributeName="y" 
                  values="30;25;30" 
                  dur="1s" 
                  repeatCount="indefinite" 
                  begin="0.0s"
                />
              </rect>
              <rect 
                x="45" 
                y="30" 
                width="10" 
                height="40" 
                fill={color}
                opacity="0.2"
              >
                <animate 
                  attributeName="opacity" 
                  values="0.2;1;0.2" 
                  dur="1s" 
                  repeatCount="indefinite" 
                  begin="0.2s"
                />
                <animate 
                  attributeName="height" 
                  values="40;50;40" 
                  dur="1s" 
                  repeatCount="indefinite" 
                  begin="0.2s"
                />
                <animate 
                  attributeName="y" 
                  values="30;25;30" 
                  dur="1s" 
                  repeatCount="indefinite" 
                  begin="0.2s"
                />
              </rect>
              <rect 
                x="70" 
                y="30" 
                width="10" 
                height="40" 
                fill={color}
                opacity="0.2"
              >
                <animate 
                  attributeName="opacity" 
                  values="0.2;1;0.2" 
                  dur="1s" 
                  repeatCount="indefinite" 
                  begin="0.4s"
                />
                <animate 
                  attributeName="height" 
                  values="40;50;40" 
                  dur="1s" 
                  repeatCount="indefinite" 
                  begin="0.4s"
                />
                <animate 
                  attributeName="y" 
                  values="30;25;30" 
                  dur="1s" 
                  repeatCount="indefinite" 
                  begin="0.4s"
                />
              </rect>
            </svg>
          </div>
        );
        
      case 'dots':
        return (
          <div className="loader-container" style={{ width, height }}>
            <svg width={width} height={height} viewBox="0 0 120 30">
              <circle 
                cx="15" 
                cy="15" 
                r="10" 
                fill={color}
              >
                <animate 
                  attributeName="r" 
                  values="10;15;10" 
                  dur="0.8s" 
                  repeatCount="indefinite" 
                  begin="0.0s"
                />
                <animate 
                  attributeName="opacity" 
                  values="0.3;1;0.3" 
                  dur="0.8s" 
                  repeatCount="indefinite" 
                  begin="0.0s"
                />
              </circle>
              <circle 
                cx="60" 
                cy="15" 
                r="10" 
                fill={color}
              >
                <animate 
                  attributeName="r" 
                  values="10;15;10" 
                  dur="0.8s" 
                  repeatCount="indefinite" 
                  begin="0.2s"
                />
                <animate 
                  attributeName="opacity" 
                  values="0.3;1;0.3" 
                  dur="0.8s" 
                  repeatCount="indefinite" 
                  begin="0.2s"
                />
              </circle>
              <circle 
                cx="105" 
                cy="15" 
                r="10" 
                fill={color}
              >
                <animate 
                  attributeName="r" 
                  values="10;15;10" 
                  dur="0.8s" 
                  repeatCount="indefinite" 
                  begin="0.4s"
                />
                <animate 
                  attributeName="opacity" 
                  values="0.3;1;0.3" 
                  dur="0.8s" 
                  repeatCount="indefinite" 
                  begin="0.4s"
                />
              </circle>
            </svg>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div 
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
    >
      {renderLoader()}
      
      {showMessage && (
        <div 
          style={{ 
            marginTop: '0.75rem', 
            textAlign: 'center',
            fontSize,
            fontWeight: 500,
            color: '#64748b', // Slate-500 - professional text color
            maxWidth: width * 2.5,
            letterSpacing: '0.01em'
          }}
        >
          {currentMessage}
          <span className="loading-dots">
            <span style={{ 
              display: 'inline-block',
              animation: 'loadingDot 1.5s infinite',
            }}>.</span>
            <span style={{ 
              display: 'inline-block',
              animation: 'loadingDot 1.5s 0.5s infinite',
            }}>.</span>
            <span style={{ 
              display: 'inline-block',
              animation: 'loadingDot 1.5s 1s infinite',
            }}>.</span>
          </span>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes loadingDot {
            0%, 100% { opacity: 0; }
            50% { opacity: 1; }
          }
        `
      }} />
    </div>
  );
};

// Rename exports and component to maintain backward compatibility
export type MascotType = LoaderType;
export const MascotLoader = ProfessionalLoader;
export default ProfessionalLoader;