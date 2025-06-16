import { useState, useEffect } from 'react';
import axios from 'axios';
import { getApiBaseUrl } from '../utils/replit-config';

interface HealthStatus {
  status: string;
  serverTime: string;
  port: string;
}

export function HealthCheck() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        setLoading(true);
        const baseUrl = getApiBaseUrl();
        const response = await axios.get(`${baseUrl}/api/health`);
        setHealth(response.data);
        setError(null);
      } catch (err) {
        console.error('Health check failed:', err);
        setError('Failed to connect to the server. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
    // Check health every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="health-check p-4 bg-gray-50 rounded-lg shadow-sm mb-4">
      <h3 className="text-lg font-medium mb-2">Server Status</h3>
      
      {loading && <p className="text-gray-500">Checking server status...</p>}
      
      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md">
          <p>{error}</p>
        </div>
      )}
      
      {health && (
        <div className="space-y-2">
          <div className="flex items-center">
            <span className="font-medium mr-2">Status:</span>
            <span className={health.status === 'ok' ? 'text-green-600' : 'text-yellow-600'}>
              {health.status === 'ok' ? 'Online' : health.status}
            </span>
          </div>
          
          <div className="flex items-center">
            <span className="font-medium mr-2">Port:</span>
            <span className="text-gray-700">{health.port}</span>
          </div>
          
          <div className="flex items-center">
            <span className="font-medium mr-2">Last checked:</span>
            <span className="text-gray-700">
              {new Date(health.serverTime).toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}