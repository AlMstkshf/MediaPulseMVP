import React from 'react';
import ProfessionalLoader, { LoaderType, LoadingSize } from './MascotLoader';
import './loader.css';

export interface LoadingStateProps {
  isLoading: boolean;
  children: React.ReactNode;
  type?: LoaderType;
  size?: LoadingSize;
  message?: string;
  fullscreen?: boolean;
  overlay?: boolean;
  customStyle?: React.CSSProperties;
  className?: string;
  showMessage?: boolean;
  color?: string;
  secondaryColor?: string;
  blur?: boolean;
}

/**
 * LoadingState component that shows a professional loader when content is loading
 * Can be used as a wrapper around content or as a fullscreen/overlay loader
 */
export const LoadingState: React.FC<LoadingStateProps> = ({
  isLoading,
  children,
  type = 'random',
  size = 'medium',
  message,
  fullscreen = false,
  overlay = false,
  customStyle,
  className = '',
  showMessage = true,
  color = '#2563eb',
  secondaryColor = '#e2e8f0',
  blur = false
}) => {
  // Early return if not loading and not fullscreen/overlay
  if (!isLoading && !fullscreen && !overlay) {
    return <>{children}</>;
  }

  // Determine the container class based on props
  const containerClass = `
    loader-container 
    fade-in
    ${fullscreen ? 'loader-fullscreen' : ''} 
    ${blur ? 'loader-blur' : ''}
    ${className}
  `.trim();

  // If it's a fullscreen or overlay loader, show the loader with appropriate styling
  if (isLoading && (fullscreen || overlay)) {
    const loaderElement = (
      <div className={containerClass} style={customStyle}>
        <ProfessionalLoader
          type={type}
          size={size}
          message={message}
          showMessage={showMessage}
          color={color}
          secondaryColor={secondaryColor}
        />
      </div>
    );

    // Return either the overlay with content or just the loader for fullscreen
    if (overlay && !fullscreen) {
      return (
        <div style={{ position: 'relative' }}>
          {children}
          <div className={`loader-overlay ${blur ? 'loader-blur' : ''}`}>{loaderElement}</div>
        </div>
      );
    }

    return loaderElement;
  }

  // Default case - show either children or loader depending on loading state
  return (
    <>
      {isLoading ? (
        <div className={containerClass} style={customStyle}>
          <ProfessionalLoader
            type={type}
            size={size}
            message={message}
            showMessage={showMessage}
            color={color}
            secondaryColor={secondaryColor}
          />
        </div>
      ) : (
        children
      )}
    </>
  );
};

// Compatibility with previous API
export interface MascotLoaderStateProps extends LoadingStateProps {
  mascot?: LoaderType;
}

export const MascotLoaderState: React.FC<MascotLoaderStateProps> = (props) => {
  const { mascot, ...rest } = props;
  return <LoadingState type={mascot} {...rest} />;
};

export default LoadingState;