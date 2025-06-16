import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import PageHeader from '@/components/layout/PageHeader';
import MainLayout from '@/components/layout/MainLayout';
import ChatInterface from '@/components/chat/ChatInterface';

const ChatAssistantPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <MainLayout>
      <Helmet>
        <title>{t('pages.chat.title', 'Media Pulse Assistant')}</title>
      </Helmet>

      <PageHeader
        title={t('pages.chat.title', 'Media Pulse Assistant')}
        description={t(
          'pages.chat.description',
          'Interact with our AI assistant powered by Rasa and AraBERT technology to get insights and answer questions about your media data.'
        )}
        actions={[]}
      />

      <div className="p-4">
        <div className="h-[calc(100vh-12rem)]">
          <ChatInterface />
        </div>
      </div>
    </MainLayout>
  );
};

export default ChatAssistantPage;