// ChatWidget Component Tests
const React = require('react');
const { render, screen, fireEvent, waitFor } = require('@testing-library/react');
const userEvent = require('@testing-library/user-event').default;

// Mock the ChatWidget component
const ChatWidget = ({ isOpen, onToggle, onSendMessage }) => {
  const [message, setMessage] = React.useState('');
  
  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={onToggle}
        aria-label="Open chat"
        data-testid="chat-toggle-button"
        className="chat-toggle-button"
      >
        Chat
      </button>
    );
  }

  return (
    <div className="chat-widget" data-testid="chat-widget">
      <div className="chat-header">
        <h3>Chat Support</h3>
        <button 
          onClick={onToggle}
          aria-label="Close chat"
          data-testid="chat-close-button"
        >
          Close
        </button>
      </div>
      <div className="chat-messages" data-testid="chat-messages">
        {/* Chat messages would go here */}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          data-testid="chat-input"
        />
        <button 
          onClick={handleSendMessage}
          data-testid="chat-send-button"
        >
          Send
        </button>
      </div>
    </div>
  );
};

describe('ChatWidget Component', () => {
  test('renders chat toggle button when closed', () => {
    const handleToggle = jest.fn();
    const handleSendMessage = jest.fn();
    
    render(
      <ChatWidget 
        isOpen={false}
        onToggle={handleToggle}
        onSendMessage={handleSendMessage}
      />
    );
    
    const toggleButton = screen.getByTestId('chat-toggle-button');
    expect(toggleButton).toBeInTheDocument();
    expect(screen.queryByTestId('chat-widget')).not.toBeInTheDocument();
  });
  
  test('opens chat when toggle button is clicked', () => {
    const handleToggle = jest.fn();
    const handleSendMessage = jest.fn();
    
    const { rerender } = render(
      <ChatWidget 
        isOpen={false}
        onToggle={handleToggle}
        onSendMessage={handleSendMessage}
      />
    );
    
    const toggleButton = screen.getByTestId('chat-toggle-button');
    fireEvent.click(toggleButton);
    
    expect(handleToggle).toHaveBeenCalled();
    
    // Simulate the parent component changing the isOpen prop
    rerender(
      <ChatWidget 
        isOpen={true}
        onToggle={handleToggle}
        onSendMessage={handleSendMessage}
      />
    );
    
    expect(screen.getByTestId('chat-widget')).toBeInTheDocument();
    expect(screen.queryByTestId('chat-toggle-button')).not.toBeInTheDocument();
  });
  
  test('sends message when send button is clicked', async () => {
    const handleToggle = jest.fn();
    const handleSendMessage = jest.fn();
    
    render(
      <ChatWidget 
        isOpen={true}
        onToggle={handleToggle}
        onSendMessage={handleSendMessage}
      />
    );
    
    const inputElement = screen.getByTestId('chat-input');
    const sendButton = screen.getByTestId('chat-send-button');
    
    // Type a message
    await userEvent.type(inputElement, 'Hello, world!');
    expect(inputElement).toHaveValue('Hello, world!');
    
    // Send the message
    fireEvent.click(sendButton);
    
    // Check if the message was sent and input was cleared
    expect(handleSendMessage).toHaveBeenCalledWith('Hello, world!');
    await waitFor(() => {
      expect(inputElement).toHaveValue('');
    });
  });
  
  test('does not send empty messages', async () => {
    const handleToggle = jest.fn();
    const handleSendMessage = jest.fn();
    
    render(
      <ChatWidget 
        isOpen={true}
        onToggle={handleToggle}
        onSendMessage={handleSendMessage}
      />
    );
    
    const sendButton = screen.getByTestId('chat-send-button');
    
    // Try to send an empty message
    fireEvent.click(sendButton);
    
    // Check that the send function was not called
    expect(handleSendMessage).not.toHaveBeenCalled();
  });
  
  test('closes chat when close button is clicked', () => {
    const handleToggle = jest.fn();
    const handleSendMessage = jest.fn();
    
    render(
      <ChatWidget 
        isOpen={true}
        onToggle={handleToggle}
        onSendMessage={handleSendMessage}
      />
    );
    
    const closeButton = screen.getByTestId('chat-close-button');
    fireEvent.click(closeButton);
    
    expect(handleToggle).toHaveBeenCalled();
  });
});