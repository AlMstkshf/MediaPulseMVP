import { renderHook, act } from '@testing-library/react';
import { useWebSocket } from '@/hooks/useWebSocket';

// Mock the WebSocket class
class MockWebSocket {
  url: string;
  onopen: Function | null = null;
  onclose: Function | null = null;
  onmessage: Function | null = null;
  onerror: Function | null = null;
  readyState: number = WebSocket.CONNECTING;
  send: jest.Mock = jest.fn();
  close: jest.Mock = jest.fn();
  
  constructor(url: string) {
    this.url = url;
    // Simulate connection after a short delay
    setTimeout(() => {
      this.readyState = WebSocket.OPEN;
      if (this.onopen) this.onopen({});
    }, 50);
  }
}

// Create a mock implementation of WebSocket
global.WebSocket = MockWebSocket as any;

describe('useWebSocket Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('establishes a connection to the WebSocket server', async () => {
    const { result } = renderHook(() => useWebSocket('/ws'));
    
    // Initially connecting
    expect(result.current.isConnected).toBe(false);
    expect(result.current.isConnecting).toBe(true);
    
    // Wait for connection to be established
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    
    // Connection should be established
    expect(result.current.isConnected).toBe(true);
    expect(result.current.isConnecting).toBe(false);
  });

  test('sends messages through the WebSocket connection', async () => {
    const { result } = renderHook(() => useWebSocket('/ws'));
    
    // Wait for connection to be established
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    
    // Send a message
    act(() => {
      result.current.send('Hello, WebSocket!');
    });
    
    // The send method should have been called
    expect(result.current.socketRef.current?.send).toHaveBeenCalledWith('Hello, WebSocket!');
  });

  test('receives messages from the WebSocket server', async () => {
    const { result } = renderHook(() => useWebSocket('/ws'));
    
    // Wait for connection to be established
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    
    // Simulate receiving a message
    act(() => {
      if (result.current.socketRef.current?.onmessage) {
        result.current.socketRef.current.onmessage({
          data: JSON.stringify({ type: 'test', data: { message: 'Test message' } })
        });
      }
    });
    
    // The latest message should be stored
    expect(result.current.lastMessage).toEqual({ type: 'test', data: { message: 'Test message' } });
  });

  test('handles connection errors', async () => {
    // Override the onopen functionality to trigger an error instead
    const originalWebSocket = global.WebSocket;
    const mockOnError = jest.fn();
    
    // Mock implementation that will error
    global.WebSocket = jest.fn().mockImplementation((url: string) => {
      const ws = new originalWebSocket(url);
      
      // Store the original onopen
      const originalOnopen = ws.onopen;
      
      // Override onopen to call onerror instead
      Object.defineProperty(ws, 'onopen', {
        set(handler) {
          originalOnopen = handler;
          // Simulate an error after a short delay
          setTimeout(() => {
            if (ws.onerror) ws.onerror(new Error('Connection failed'));
          }, 50);
        },
        get() {
          return originalOnopen;
        }
      });
      
      return ws;
    }) as any;
    
    const { result } = renderHook(() => useWebSocket('/ws'));
    
    // Set the error handler
    act(() => {
      if (result.current.socketRef.current) {
        result.current.socketRef.current.onerror = mockOnError;
      }
    });
    
    // Wait for error to be triggered
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    
    // Error handler should have been called
    expect(mockOnError).toHaveBeenCalled();
    
    // Restore original WebSocket
    global.WebSocket = originalWebSocket;
  });

  test('closes the connection when unmounted', async () => {
    const { result, unmount } = renderHook(() => useWebSocket('/ws'));
    
    // Wait for connection to be established
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    
    // Store the socket reference
    const socketRef = result.current.socketRef.current;
    
    // Unmount the hook
    unmount();
    
    // The close method should have been called
    expect(socketRef?.close).toHaveBeenCalled();
  });
});