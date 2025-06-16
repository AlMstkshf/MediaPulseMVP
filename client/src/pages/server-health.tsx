import React from 'react';
import { HealthCheck } from '../components/HealthCheck';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

const ServerHealthPage: React.FC = () => {
  const refreshPage = () => {
    window.location.reload();
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Server Status Dashboard</h1>
        <Button onClick={refreshPage} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>API Server Health</CardTitle>
            <CardDescription>
              Real-time status of the Media Intelligence Platform backend server
            </CardDescription>
          </CardHeader>
          <CardContent>
            <HealthCheck />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
            <CardDescription>
              Current system configuration and environment details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Environment</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="font-medium">Frontend URL:</div>
                  <div>{window.location.origin}</div>
                  
                  <div className="font-medium">API Port:</div>
                  <div>8080</div>
                  
                  <div className="font-medium">Browser:</div>
                  <div>{navigator.userAgent}</div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Connectivity</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="font-medium">WebSocket:</div>
                  <div className="text-yellow-600">Checking...</div>
                  
                  <div className="font-medium">Database:</div>
                  <div className="text-yellow-600">Checking...</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ServerHealthPage;