import React, { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { SocketIOProvider } from "@/lib/socket-io-context";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function ProgressiveApp() {
  const [currentView, setCurrentView] = useState<'home' | 'dashboard' | 'login'>('home');
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <SocketIOProvider>
            <Toaster />
            
            <div style={{ 
              fontFamily: 'Arial, sans-serif',
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '20px'
            }}>
              <h1>Media Intelligence Platform</h1>
              <p>Progressive version with Auth and WebSocket providers.</p>
              
              {/* Simple Navigation */}
              <div style={{
                display: 'flex',
                gap: '10px',
                marginBottom: '20px',
                padding: '10px',
                backgroundColor: '#f0f0f0',
                borderRadius: '8px'
              }}>
                <button 
                  onClick={() => setCurrentView('home')}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: currentView === 'home' ? '#2563eb' : '#e2e8f0',
                    color: currentView === 'home' ? 'white' : 'black',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Home
                </button>
                <button 
                  onClick={() => setCurrentView('dashboard')}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: currentView === 'dashboard' ? '#2563eb' : '#e2e8f0',
                    color: currentView === 'dashboard' ? 'white' : 'black',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Dashboard
                </button>
                <button 
                  onClick={() => setCurrentView('login')}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: currentView === 'login' ? '#2563eb' : '#e2e8f0',
                    color: currentView === 'login' ? 'white' : 'black',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Login
                </button>
              </div>
              
              {/* Content based on current view */}
              {currentView === 'home' && (
                <div>
                  <h2>Welcome to Media Intelligence Platform</h2>
                  <p>This application is a cutting-edge Media Monitoring and Digital Content Management System that leverages advanced AI technologies for comprehensive social media analysis, real-time sentiment tracking, and intelligent reporting.</p>
                  
                  <div style={{ marginTop: '20px', marginBottom: '20px' }}>
                    <h3>API Test</h3>
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
                </div>
              )}
              
              {currentView === 'dashboard' && (
                <div>
                  <h2>Dashboard</h2>
                  <p>This is a placeholder for the dashboard view. In the full application, this would contain the personalized dashboard with widgets.</p>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '16px',
                    marginTop: '20px'
                  }}>
                    <div style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '16px',
                      backgroundColor: '#f8fafc'
                    }}>
                      <h3>Sentiment Analysis</h3>
                      <p>Widget placeholder</p>
                    </div>
                    <div style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '16px',
                      backgroundColor: '#f8fafc'
                    }}>
                      <h3>Media Mentions</h3>
                      <p>Widget placeholder</p>
                    </div>
                    <div style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '16px',
                      backgroundColor: '#f8fafc'
                    }}>
                      <h3>Keyword Trends</h3>
                      <p>Widget placeholder</p>
                    </div>
                    <div style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '16px',
                      backgroundColor: '#f8fafc'
                    }}>
                      <h3>Entity Comparison</h3>
                      <p>Widget placeholder</p>
                    </div>
                  </div>
                </div>
              )}
              
              {currentView === 'login' && (
                <div>
                  <h2>Login</h2>
                  <p>This is a placeholder for the login view. In the full application, this would contain the login form.</p>
                  <div style={{
                    maxWidth: '400px',
                    margin: '0 auto',
                    padding: '20px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    backgroundColor: '#f8fafc'
                  }}>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', marginBottom: '8px' }}>Username</label>
                      <input 
                        type="text" 
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '4px'
                        }}
                      />
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ display: 'block', marginBottom: '8px' }}>Password</label>
                      <input 
                        type="password" 
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '4px'
                        }}
                      />
                    </div>
                    <button
                      style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Login
                    </button>
                  </div>
                </div>
              )}
              
              <div style={{ 
                marginTop: '30px',
                padding: '15px',
                backgroundColor: '#f5f5f5',
                borderRadius: '8px'
              }}>
                <h3>Progress Report</h3>
                <p>We're gradually rebuilding the application to isolate and fix any rendering issues:</p>
                <ul style={{ paddingLeft: '20px' }}>
                  <li style={{ color: 'green' }}>✓ Basic page with API connection</li>
                  <li style={{ color: 'green' }}>✓ Added QueryClientProvider</li>
                  <li style={{ color: 'green' }}>✓ Added AuthProvider and WebSocketProvider</li>
                  <li style={{ color: 'green' }}>✓ Added simple navigation</li>
                  <li style={{ color: 'blue' }}>→ Next: Full layout with sidebar</li>
                  <li style={{ color: 'blue' }}>→ Next: Full dashboard implementation</li>
                </ul>
              </div>
            </div>
            
          </SocketIOProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}