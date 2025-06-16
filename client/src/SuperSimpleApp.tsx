import React, { useState, useEffect } from 'react';
import OnboardingTour from './OnboardingTour';

/**
 * A super simple React component with no dependencies
 * This should work even if other parts of the app are broken
 */
function SuperSimpleApp() {
  const [counter, setCounter] = useState(0);
  const [apiStatus, setApiStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Onboarding tour state
  const [showTour, setShowTour] = useState(false);
  
  // Initialize tour based on localStorage
  useEffect(() => {
    // Check if the user has completed the tour before
    const tourCompleted = localStorage.getItem('onboardingTourCompleted');
    if (!tourCompleted) {
      // If not, show the tour after a slight delay
      const timer = setTimeout(() => {
        setShowTour(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);
  
  // Function to handle tour completion
  const handleTourComplete = () => {
    localStorage.setItem('onboardingTourCompleted', 'true');
  };

  const testApi = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setApiStatus(`API is working! Response: ${JSON.stringify(data)}`);
    } catch (error) {
      setApiStatus(`API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '600px',
      margin: '40px auto',
      padding: '20px',
      borderRadius: '10px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      backgroundColor: 'white'
    }}>
      <h1 
        data-tour="header"
        style={{ color: '#2563eb', textAlign: 'center' }}
      >
        Media Intelligence Platform
      </h1>
      
      <div style={{ 
        borderTop: '1px solid #e5e7eb', 
        borderBottom: '1px solid #e5e7eb',
        margin: '20px 0',
        padding: '20px 0' 
      }}>
        <h2>Simple React Test</h2>
        <p>Counter: <strong>{counter}</strong></p>
        <button
          onClick={() => setCounter(counter + 1)}
          style={{
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            padding: '10px 15px',
            borderRadius: '5px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Increment
        </button>
        <button
          onClick={() => setCounter(0)}
          style={{
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            padding: '10px 15px',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Reset
        </button>
      </div>
      
      <div data-tour="api-test">
        <h2>API Test</h2>
        <button
          onClick={testApi}
          disabled={isLoading}
          style={{
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            padding: '10px 15px',
            borderRadius: '5px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.7 : 1
          }}
        >
          {isLoading ? 'Testing...' : 'Test API Connection'}
        </button>
        
        {apiStatus && (
          <div style={{ 
            margin: '15px 0', 
            padding: '10px', 
            backgroundColor: apiStatus.includes('error') ? '#fee2e2' : '#ecfdf5',
            borderRadius: '5px'
          }}>
            <p>{apiStatus}</p>
          </div>
        )}
      </div>
            
      <div style={{ marginTop: '30px' }} data-tour="quick-questions">
        <h2>System Features</h2>
        <div style={{ 
          border: '1px solid #e5e7eb',
          borderRadius: '10px',
          padding: '15px',
          backgroundColor: '#f9fafb'
        }}>
          <p>The Media Intelligence Platform offers the following features:</p>
          <ul style={{ marginLeft: '20px' }}>
            <li>Sentiment analysis for social media content</li>
            <li>Keyword tracking and trending topics</li>
            <li>Media source monitoring</li>
            <li>Customizable dashboard with real-time analytics</li>
            <li>Multi-language support (Arabic/English)</li>
          </ul>
        </div>
      </div>
      
      <div style={{ marginTop: '20px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
        <p>This is a simplified test page for the Media Intelligence Platform</p>
        <button 
          onClick={() => setShowTour(true)}
          style={{
            marginTop: '10px',
            backgroundColor: 'transparent',
            border: '1px solid #e2e8f0',
            padding: '5px 10px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px',
            color: '#64748b'
          }}
        >
          Restart Tour
        </button>
      </div>

      {/* Onboarding Tour */}
      {showTour && (
        <OnboardingTour 
          isOpen={showTour} 
          onClose={() => setShowTour(false)}
          onComplete={handleTourComplete}
        />
      )}
    </div>
  );
}

export default SuperSimpleApp;