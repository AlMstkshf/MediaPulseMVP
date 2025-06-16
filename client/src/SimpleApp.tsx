import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";

export default function SimpleApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <div style={{ 
        fontFamily: 'Arial, sans-serif',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '20px'
      }}>
        <h1>Media Intelligence Platform</h1>
        <p>This is a simplified version of the application with basic providers.</p>
        
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
          <h3>Next Steps</h3>
          <p>This simplified version of the application is working correctly. The next step is to gradually reintroduce the full application components.</p>
          <ol>
            <li>Add more providers (Auth, WebSocket)</li>
            <li>Add basic routing</li>
            <li>Add layout components (Sidebar, Header)</li>
            <li>Finally add the Dashboard widgets</li>
          </ol>
        </div>
      </div>
    </QueryClientProvider>
  );
}