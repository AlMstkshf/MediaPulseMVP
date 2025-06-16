import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import WebSocketTester from '@/components/shared/WebSocketTester';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from 'react-i18next';
import PageHeader from '@/components/layout/PageHeader';

const WebSocketTestPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader 
        title={t('websocket.page.title', 'WebSocket Testing')}
        description={t('websocket.page.description', 'Test and monitor real-time WebSocket connections')}
      />

      <Tabs defaultValue="tester" className="w-full">
        <TabsList>
          <TabsTrigger value="tester">{t('websocket.tabs.tester', 'WebSocket Tester')}</TabsTrigger>
          <TabsTrigger value="about">{t('websocket.tabs.about', 'About WebSockets')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tester" className="pt-4">
          <WebSocketTester />
        </TabsContent>
        
        <TabsContent value="about" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('websocket.about.title', 'About WebSockets')}</CardTitle>
              <CardDescription>
                {t('websocket.about.description', 'Learn about WebSocket technology and how it is used in Media Pulse')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">{t('websocket.about.whatAre', 'What are WebSockets?')}</h3>
                <p className="text-muted-foreground">
                  {t('websocket.about.whatAreDetails', 'WebSockets provide a persistent connection between client and server, allowing for real-time, bi-directional communication. Unlike traditional HTTP requests, WebSockets maintain an open connection, enabling immediate data transfer without polling.')}
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">{t('websocket.about.useInApp', 'WebSockets in Media Pulse')}</h3>
                <p className="text-muted-foreground">
                  {t('websocket.about.useInAppDetails', 'In Media Pulse, WebSockets enable real-time updates for:')}
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                  <li>{t('websocket.about.useCase1', 'Live social media updates and alerts')}</li>
                  <li>{t('websocket.about.useCase2', 'Real-time sentiment analysis notifications')}</li>
                  <li>{t('websocket.about.useCase3', 'Instant content updates across devices')}</li>
                  <li>{t('websocket.about.useCase4', 'Real-time collaboration features')}</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">{t('websocket.about.tester', 'About the WebSocket Tester')}</h3>
                <p className="text-muted-foreground">
                  {t('websocket.about.testerDetails', 'The WebSocket Tester allows you to experiment with WebSocket communication, subscribe to topics, and see real-time messages. Use it to test connectivity and understand how real-time updates work in the platform.')}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WebSocketTestPage;