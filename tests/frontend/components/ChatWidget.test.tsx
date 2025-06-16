import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import ChatWidget from '@/components/chat/ChatWidget';

// Mock the API call
jest.mock('@/lib/queryClient', () => ({
  queryClient: {
    invalidateQueries: jest.fn(),
  },
  apiRequest: jest.fn().mockResolvedValue({
    response: 'Hello! How can I help you today?',
    intent: 'greeting',
  }),
}));

const renderChatWidget = () => {
  return render(
    <QueryClientProvider client={queryClient}>
      <ChatWidget />
    </QueryClientProvider>
  );
};

describe('ChatWidget Component', () => {
  beforeEach(() => {
    // Clear mocks between tests
    jest.clearAllMocks();
  });

  test('renders the chat widget in closed state initially', () => {
    renderChatWidget();
    
    // The chat icon should be visible but not the chat window
    expect(screen.getByTestId('chat-widget-button')).toBeInTheDocument();
    expect(screen.queryByTestId('chat-window')).not.toBeVisible();
  });

  test('opens the chat window when chat button is clicked', async () => {
    renderChatWidget();
    
    // Click on the chat button
    const chatButton = screen.getByTestId('chat-widget-button');
    fireEvent.click(chatButton);
    
    // The chat window should be visible
    await waitFor(() => {
      expect(screen.getByTestId('chat-window')).toBeVisible();
    });
  });

  test('sends a message when user submits input', async () => {
    renderChatWidget();
    
    // Open the chat window
    const chatButton = screen.getByTestId('chat-widget-button');
    fireEvent.click(chatButton);
    
    // Enter a message
    const input = screen.getByPlaceholderText('Type a message...');
    await userEvent.type(input, 'Hello');
    
    // Submit the message
    const sendButton = screen.getByTestId('send-message-button');
    fireEvent.click(sendButton);
    
    // Check if the sent message appears in the chat window
    await waitFor(() => {
      expect(screen.getByText('Hello')).toBeInTheDocument();
    });
    
    // Check if the response from the API appears in the chat window
    await waitFor(() => {
      expect(screen.getByText('Hello! How can I help you today?')).toBeInTheDocument();
    });
  });

  test('displays typing indicator when waiting for a response', async () => {
    // Mock the API to delay the response
    const { apiRequest } = require('@/lib/queryClient');
    apiRequest.mockImplementationOnce(() => 
      new Promise(resolve => {
        setTimeout(() => {
          resolve({
            response: 'Delayed response',
            intent: 'greeting',
          });
        }, 1000);
      })
    );

    renderChatWidget();
    
    // Open the chat window
    const chatButton = screen.getByTestId('chat-widget-button');
    fireEvent.click(chatButton);
    
    // Enter and send a message
    const input = screen.getByPlaceholderText('Type a message...');
    await userEvent.type(input, 'Hello');
    
    const sendButton = screen.getByTestId('send-message-button');
    fireEvent.click(sendButton);
    
    // Typing indicator should appear
    await waitFor(() => {
      expect(screen.getByTestId('typing-indicator')).toBeInTheDocument();
    });
    
    // Eventually, the response should appear and the typing indicator should disappear
    await waitFor(() => {
      expect(screen.getByText('Delayed response')).toBeInTheDocument();
      expect(screen.queryByTestId('typing-indicator')).not.toBeInTheDocument();
    }, { timeout: 2000 });
  });

  test('closes the chat window when close button is clicked', async () => {
    renderChatWidget();
    
    // Open the chat window
    const chatButton = screen.getByTestId('chat-widget-button');
    fireEvent.click(chatButton);
    
    // The chat window should be visible
    await waitFor(() => {
      expect(screen.getByTestId('chat-window')).toBeVisible();
    });
    
    // Click the close button
    const closeButton = screen.getByTestId('close-chat-button');
    fireEvent.click(closeButton);
    
    // The chat window should be hidden
    await waitFor(() => {
      expect(screen.queryByTestId('chat-window')).not.toBeVisible();
    });
  });
});