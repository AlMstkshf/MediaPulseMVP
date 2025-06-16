// Jest setup file

// Mock browser globals for testing components
global.matchMedia = global.matchMedia || function() {
  return {
    matches: false,
    addListener: function() {},
    removeListener: function() {}
  };
};

// Mock WebSocket for tests
global.WebSocket = class MockWebSocket {
  constructor(url) {
    this.url = url;
    this.readyState = 0; // CONNECTING
    
    // Allow tests to simulate connection
    setTimeout(() => {
      this.readyState = 1; // OPEN
      if (this.onopen) this.onopen();
    }, 0);
  }
  
  send(data) {
    if (this.readyState !== 1) {
      throw new Error('WebSocket is not open');
    }
    // Mock sending data
  }
  
  close() {
    this.readyState = 3; // CLOSED
    if (this.onclose) this.onclose();
  }
};

// Define WebSocket constants
global.WebSocket.CONNECTING = 0;
global.WebSocket.OPEN = 1;
global.WebSocket.CLOSING = 2;
global.WebSocket.CLOSED = 3;

// Mock localStorage
if (typeof window === 'undefined') {
  class LocalStorageMock {
    constructor() {
      this.store = {};
    }

    clear() {
      this.store = {};
    }

    getItem(key) {
      return this.store[key] || null;
    }

    setItem(key, value) {
      this.store[key] = String(value);
    }

    removeItem(key) {
      delete this.store[key];
    }
  }

  global.localStorage = new LocalStorageMock();
}

// Mock console.error to catch React errors and warnings
const originalConsoleError = console.error;
console.error = function(message) {
  // Fail tests if React issues warnings about prop types
  if (/(Invalid prop|Failed prop type)/gi.test(message)) {
    throw new Error(message);
  }
  originalConsoleError.apply(console, arguments);
};

// Mock intersectionObserver for components using useInView or similar hooks
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }

  observe() {
    this.callback([{ isIntersecting: true }], this);
  }

  unobserve() {}
  disconnect() {}
};