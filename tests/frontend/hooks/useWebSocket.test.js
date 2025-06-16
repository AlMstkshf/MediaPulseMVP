// WebSocket Hook Tests
const { renderHook, act } = require('@testing-library/react');
const React = require('react');

// Mock implementation of the useWebSocket hook
const useWebSocket = (url, options = {}) => {
  const { onOpen, onMessage, onClose, onError, reconnectInterval = 2000 } = options;
  
  const [socket, setSocket] = React.useState(null);
  const [isConnected, setIsConnected] = React.useState(false);
  const [lastMessage, setLastMessage] = React.useState(null);
  const reconnectTimeoutRef = React.useRef(null);
  
  // Function to create a new WebSocket connection
  const connect = React.useCallback(() => {
    // Clear any existing reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    try {
      const newSocket = new WebSocket(url);
      
      newSocket.onopen = (event) => {
        setIsConnected(true);
        if (onOpen) onOpen(event);
      };
      
      newSocket.onmessage = (event) => {
        setLastMessage(event.data);
        if (onMessage) onMessage(event);
      };
      
      newSocket.onclose = (event) => {
        setIsConnected(false);
        if (onClose) onClose(event);
        
        // Setup reconnection
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, reconnectInterval);
      };
      
      newSocket.onerror = (event) => {
        if (onError) onError(event);
      };
      
      setSocket(newSocket);
    } catch (error) {
      if (onError) onError(error);
    }
  }, [url, onOpen, onMessage, onClose, onError, reconnectInterval]);
  
  // Connect on mount, disconnect on unmount
  React.useEffect(() => {
    connect();
    
    return () => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);
  
  // Function to send a message through the WebSocket
  const sendMessage = React.useCallback((data) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(typeof data === 'string' ? data : JSON.stringify(data));
      return true;
    }
    return false;
  }, [socket]);
  
  return {
    socket,
    isConnected,
    lastMessage,
    sendMessage,
    connect
  };
};

describe('useWebSocket Hook', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });
  
  test('should connect to WebSocket on mount', () => {
    const mockOnOpen = jest.fn();
    
    const { result } = renderHook(() => useWebSocket('ws://localhost:8080', {
      onOpen: mockOnOpen
    }));
    
    // The mock WebSocket will automatically connect (simulated by setTimeout in setup.js)
    jest.advanceTimersByTime(10);
    
    expect(result.current.isConnected).toBe(true);
    expect(mockOnOpen).toHaveBeenCalled();
    expect(result.current.socket).not.toBeNull();
  });
  
  test('should disconnect on unmount', () => {
    const mockSocket = {
      readyState: WebSocket.OPEN,
      close: jest.fn()
    };
    
    // Replace the global WebSocket implementation for this test
    const originalWebSocket = global.WebSocket;
    global.WebSocket = jest.fn().mockImplementation(() => mockSocket);
    
    const { unmount } = renderHook(() => useWebSocket('ws://localhost:8080'));
    
    // Unmount the hook
    unmount();
    
    expect(mockSocket.close).toHaveBeenCalled();
    
    // Restore the original WebSocket implementation
    global.WebSocket = originalWebSocket;
  });
  
  test('should handle messages correctly', () => {
    const mockOnMessage = jest.fn();
    
    const { result } = renderHook(() => useWebSocket('ws://localhost:8080', {
      onMessage: mockOnMessage
    }));
    
    jest.advanceTimersByTime(10); // Ensure connection is established
    
    // Simulate receiving a message
    act(() => {
      const messageEvent = { data: JSON.stringify({ type: 'notification', content: 'New message' }) };
      result.current.socket.onmessage(messageEvent);
    });
    
    expect(mockOnMessage).toHaveBeenCalled();
    expect(result.current.lastMessage).toBe(JSON.stringify({ type: 'notification', content: 'New message' }));
  });
  
  test('should send messages correctly', () => {
    const { result } = renderHook(() => useWebSocket('ws://localhost:8080'));
    
    jest.advanceTimersByTime(10); // Ensure connection is established
    
    // Mock the send method
    result.current.socket.send = jest.fn();
    
    // Send a string message
    act(() => {
      result.current.sendMessage('Hello');
    });
    
    expect(result.current.socket.send).toHaveBeenCalledWith('Hello');
    
    // Send an object message
    const message = { type: 'chat', content: 'Hello world' };
    
    act(() => {
      result.current.sendMessage(message);
    });
    
    expect(result.current.socket.send).toHaveBeenCalledWith(JSON.stringify(message));
  });
  
  test('should attempt to reconnect when connection is closed', () => {
    const mockOnClose = jest.fn();
    const reconnectInterval = 1000;
    
    const { result } = renderHook(() => useWebSocket('ws://localhost:8080', {
      onClose: mockOnClose,
      reconnectInterval
    }));
    
    jest.advanceTimersByTime(10); // Ensure connection is established
    
    // Simulate connection closing
    act(() => {
      result.current.socket.onclose({});
    });
    
    expect(mockOnClose).toHaveBeenCalled();
    expect(result.current.isConnected).toBe(false);
    
    // Check that reconnect is scheduled
    jest.advanceTimersByTime(reconnectInterval + 10);
    
    // After reconnect interval, it should be connected again
    expect(result.current.isConnected).toBe(true);
  });
  
  test('should handle connection errors', () => {
    const mockOnError = jest.fn();
    
    // Create a WebSocket mock that throws an error
    const originalWebSocket = global.WebSocket;
    const mockWebSocketConstructor = jest.fn().mockImplementation(() => {
      throw new Error('Connection failed');
    });
    
    global.WebSocket = mockWebSocketConstructor;
    
    renderHook(() => useWebSocket('ws://localhost:8080', {
      onError: mockOnError
    }));
    
    expect(mockOnError).toHaveBeenCalled();
    expect(mockOnError.mock.calls[0][0].message).toBe('Connection failed');
    
    // Restore the original WebSocket implementation
    global.WebSocket = originalWebSocket;
  });
});