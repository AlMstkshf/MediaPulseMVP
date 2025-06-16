import React from "react";

export default function MinimalApp() {
  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto',
      padding: '20px'
    }}>
      <h1>Media Intelligence Platform</h1>
      <p>This is a minimal version of the application to test rendering.</p>
      
      <div style={{ marginTop: '20px', marginBottom: '20px' }}>
        <h2>API Test</h2>
        <button 
          onClick={async () => {
            try {
              const response = await fetch('/api/health');
              const data = await response.json();
              alert(JSON.stringify(data, null, 2));
            } catch (error) {
              alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
          }}
          style={{
            padding: '10px 15px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Test API Connection
        </button>
      </div>
      
      <div style={{ 
        marginTop: '30px',
        padding: '15px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px'
      }}>
        <h3>Troubleshooting Tips</h3>
        <ul>
          <li>Check browser console for errors</li>
          <li>Verify network connectivity</li>
          <li>Test API endpoints directly</li>
          <li>Check for CORS issues</li>
        </ul>
      </div>
    </div>
  );
}