import express, { type Request, Response, NextFunction } from "express";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { seedDatabase } from "./seed";
import cors from "cors";
import cookieParser from "cookie-parser";
import { PORT as CONFIG_PORT, HOST } from "./config"; // Renamed to avoid conflict
import fs from 'fs';
import { setupViteMiddleware } from "./vite-middleware";

// ES module compatible __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set environment variable for OpenAI live mode
// Default to live mode with our new API key
process.env.USE_OPENAI = 'true';

const app = express();

// Enable trust proxy for Cloudflare headers
// Set to "1" hop since Cloudflare sits directly in front of our app
app.set('trust proxy', 1);

// Alternative: Could whitelist Cloudflare IP ranges instead:
// app.set('trust proxy', [
//   '103.21.244.0/22', '103.22.200.0/22', '103.31.4.0/22', '104.16.0.0/13',
//   '104.24.0.0/14', '108.162.192.0/18', '131.0.72.0/22', '141.101.64.0/18',
//   '162.158.0.0/15', '172.64.0.0/13', '173.245.48.0/20', '188.114.96.0/20',
//   '190.93.240.0/20', '197.234.240.0/22', '198.41.128.0/17'
// ]);

// Add HTTPS redirect middleware - only in production
app.use((req, res, next) => {
  // Only enforce HTTPS in production environment
  if (process.env.NODE_ENV === 'production' && req.protocol !== 'https') {
    return res.redirect(301, 'https://' + req.headers.host + req.url);
  }
  next();
});

// Import our CORS fix for Replit
import { setupCORSForReplit } from './cors-fix';

// Apply our custom CORS middleware for Replit
app.use(setupCORSForReplit);

// Configure CORS
app.use(cors({
  origin: function(origin, callback) {
    // Allow all origins in development mode
    if (process.env.NODE_ENV !== 'production') {
      callback(null, origin || true);
      return;
    }

    // Define allowed origins for production
    const allowedOrigins = [
      'http://localhost:5000',
      'https://localhost:5000',
      'https://rhalftn.replit.app',
      'https://media-pulse.almstkshf.com',
      // Allow Replit's proxy URLs (which change with each web session)
      /https:\/\/.*\.replit\.dev$/,
      /https:\/\/.*\.replit\.app$/,
      /https:\/\/.*\.sisko\.replit\.dev$/
    ];

    // Check if origin is in our allowlist; if it's undefined, also allow it (e.g., for test)
    // When returning the origin, use the actual origin value so the browser accepts it
    if (!origin) {
      callback(null, true);
      return;
    }

    // Check exact string matches first
    const exactMatch = allowedOrigins.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return allowedOrigin === origin;
      }
      // Check RegExp patterns
      if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    });

    if (exactMatch) {
      console.log(`CORS allowed: Exact match for origin ${origin}`);
      callback(null, origin); // Return the actual origin instead of true for credentials to work
    } else {
      // For Replit development environment, allow all origins when running in development mode
      if (process.env.REPL_ID && process.env.NODE_ENV !== 'production') {
        console.log(`CORS dev mode: Allowing origin ${origin} in Replit development environment`);
        callback(null, origin);
      } else {
        console.log(`CORS blocked: ${origin}`);
        callback(new Error(`CORS not allowed for origin: ${origin}`));
      }
    }
  },
  credentials: true, // Allow credentials
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Add more specific CORS headers to handle preflight requests
app.use((req, res, next) => {
  // When credentials are included, we must specify an exact origin instead of '*'
  const origin = req.headers.origin;
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
  }

  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configure cookie parser middleware to handle cookies
app.use(cookieParser());

// Add middleware to set secure cookie defaults
app.use((req, res, next) => {
  // Store the original Express cookie method reference
  const originalCookie = res.cookie;

  // Create a typed interface for cookie options
  interface CookieOptions {
    httpOnly?: boolean;
    secure?: boolean;
    path?: string;
    sameSite?: 'strict' | 'lax' | 'none' | boolean;
    domain?: string;
    expires?: Date;
    maxAge?: number;
    [key: string]: any;
  }

  // Override the cookie method with a secured version
  res.cookie = function(
    name: string,
    value: string,
    options: CookieOptions = {}
  ) {
    // Check if the connection is secure
    const isSecure = process.env.NODE_ENV === 'production' || req.secure || req.protocol === 'https';

    // Get the host from the request header
    const host = req.get('host');
    let cookieDomain = options.domain;

    // Only set domain in production and only if request comes from our domains
    if (process.env.NODE_ENV === 'production') {
      if (host === 'media-pulse.almstkshf.com') {
        cookieDomain = 'media-pulse.almstkshf.com';
      } else if (host === 'rhalftn.replit.app') {
        cookieDomain = 'rhalftn.replit.app';
      }
      // For all other hosts, don't set the domain (browser will use the current domain)
    }

    console.log(`Cookie Middleware: Setting cookie for host: ${host}, domain: ${cookieDomain}, isSecure: ${isSecure}`);
    console.log(`Cookie Middleware: Final secureOptions: ${JSON.stringify(secureOptions)}`);

    // Create a new options object with security defaults
    const secureOptions = {
      httpOnly: options.httpOnly !== undefined ? options.httpOnly : true,
      secure: options.secure !== undefined ? options.secure : true,
      path: options.path || '/',
      sameSite: options.sameSite !== undefined ? options.sameSite : (process.env.NODE_ENV === 'production' ? 'none' : 'lax')
    } as CookieOptions;

    // Only set domain if we have a valid domain to use
    if (cookieDomain) {
      secureOptions.domain = cookieDomain;
    }

    // Copy all other properties from the original options
    Object.keys(options).forEach(key => {
      if (!secureOptions.hasOwnProperty(key)) {
        (secureOptions as any)[key] = options[key];
      }
    });

    // Call the original cookie method with our enhanced options
    return originalCookie.apply(this, [name, value, secureOptions]);
  };

  next();
});

// Serve uploaded files from the uploads directory
app.use('/uploads', express.static('uploads'));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Temporary redirect for root path to the welcome page
app.get('/', (req: Request, res: Response) => {
  res.redirect('/_welcome');
});

// Example route for testing WebSocket connections
app.get('/websocket-test', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'public/websocket-test.html'));
});

// Example route for testing Replit-specific WebSocket connections
app.get('/replit-ws-test', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'public/replit-ws-test.html'));
});

// Add basic health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
    isReplit: !!process.env.REPL_ID,
    replitId: process.env.REPL_ID || 'n/a',
    vite: 'active',
    services: {
      websocket: 'active',
      database: 'connected',
      nlp: 'initialized'
    }
  });
});

// Add port information page
app.get('/port-info', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'ok', 
    serverTime: new Date().toISOString(),
    port: process.env.PORT || '8080',
    vitePort: '3000',
    expressPort: '8080',
    publicPort: '5000',
    host: req.hostname,
    url: req.protocol + '://' + req.get('host') + req.originalUrl,
    replitPort: process.env.REPL_SLUG ? '443' : null,
    replitAppUrl: process.env.REPL_SLUG ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.replit.app` : null
  });
});

// Add a fallback route to serve a simplified welcome page when Vite isn't accessible
app.get('/_welcome', (req: Request, res: Response) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Media Pulse - Welcome</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; line-height: 1.6; }
        .container { max-width: 800px; margin: 0 auto; }
        h1 { color: #333; }
        .card { background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .button { display: inline-block; padding: 10px 20px; margin: 10px 0; background-color: #007bff; 
                 color: white; text-decoration: none; border-radius: 4px; }
        .info { color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Welcome to Media Pulse</h1>
        <div class="card">
          <h2>Media Intelligence Platform</h2>
          <p>Comprehensive monitoring and digital content management system with advanced sentiment analysis.</p>
          <p class="info">Server running on port ${process.env.PORT || '8080'}</p>
          <p>
            <a href="/websocket-test" class="button">WebSocket Test</a>
            <a href="/replit-ws-test" class="button">Replit WebSocket Test</a>
            <a href="/health" class="button">Health Check</a>
            <a href="/port-info" class="button">Port Info</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Add debug route to verify HTTPS handling through Cloudflare
app.get('/debug', (req, res) => {
  res.json({ 
    protocol: req.protocol, 
    secure: req.secure,
    headers: req.headers,
    forwardedProtocol: req.headers['x-forwarded-proto'],
    cookies: req.cookies,
    usingSecureCookies: (req.secure || req.protocol === 'https')
  });
});

// Add a simplified WebSocket test page
app.get('/ws-test', (req, res) => {
  const protocol = req.secure || req.headers['x-forwarded-proto'] === 'https' ? 'wss:' : 'ws:';
  const host = req.headers.host || 'localhost:8080';
  
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>WebSocket Test</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 0; padding: 20px; line-height: 1.6; }
      h1 { color: #333; }
      .container { max-width: 800px; margin: 0 auto; }
      .status { padding: 10px; margin: 10px 0; border-radius: 4px; }
      .connected { background-color: #d4edda; color: #155724; }
      .disconnected { background-color: #f8d7da; color: #721c24; }
      .connecting { background-color: #fff3cd; color: #856404; }
      #messages { height: 300px; border: 1px solid #ddd; padding: 10px; overflow-y: auto; margin: 10px 0; font-family: monospace; }
      .button { padding: 8px 15px; margin: 5px; border: none; border-radius: 4px; cursor: pointer; }
      .primary { background-color: #007bff; color: white; }
      .secondary { background-color: #6c757d; color: white; }
      .warning { background-color: #ffc107; color: #000; }
      input[type="text"] { padding: 8px; width: 100%; margin: 5px 0; }
      .info-box { background-color: #e9ecef; border-radius: 4px; padding: 10px; margin: 10px 0; }
      .control-panel { display: flex; gap: 10px; margin: 10px 0; }
      .message { padding: 5px; border-bottom: 1px solid #eee; }
      .sent { color: #0066cc; }
      .received { color: #006600; }
      .system { color: #666; font-style: italic; }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>WebSocket Test Page</h1>
      <div class="info-box">
        <p><strong>Connection Information:</strong></p>
        <p>WebSocket URL: <code id="wsUrl">${protocol}//${host}/ws</code></p>
        <p>Environment: <span id="environment">Checking...</span></p>
      </div>
      
      <div id="status" class="status disconnected">Status: Disconnected</div>
      
      <div class="control-panel">
        <button id="connectBtn" class="button primary">Connect</button>
        <button id="disconnectBtn" class="button secondary" disabled>Disconnect</button>
        <button id="pingBtn" class="button warning" disabled>Send Ping</button>
      </div>
      
      <div>
        <input type="text" id="messageInput" placeholder="Type a message to send" disabled>
        <button id="sendBtn" class="button primary" disabled>Send</button>
      </div>
      
      <h3>Messages:</h3>
      <div id="messages"></div>
    </div>
    
    <script>
      // DOM Elements
      const statusEl = document.getElementById('status');
      const connectBtn = document.getElementById('connectBtn');
      const disconnectBtn = document.getElementById('disconnectBtn');
      const pingBtn = document.getElementById('pingBtn');
      const messageInput = document.getElementById('messageInput');
      const sendBtn = document.getElementById('sendBtn');
      const messagesEl = document.getElementById('messages');
      const wsUrlEl = document.getElementById('wsUrl');
      const environmentEl = document.getElementById('environment');
      
      // WebSocket reference
      let socket = null;
      
      // Environment detection
      const isHttps = window.location.protocol === 'https:';
      const isReplit = window.location.hostname.includes('replit') || 
                       window.location.hostname.includes('.repl.co') || 
                       window.location.hostname.includes('almstkshf.com');
      
      environmentEl.textContent = isReplit ? 'Replit' : 'Development';
      
      // Update WebSocket URL based on environment
      const wsProtocol = isHttps ? 'wss:' : 'ws:';
      const wsUrl = \`\${wsProtocol}//\${window.location.host}/ws\`;
      wsUrlEl.textContent = wsUrl;
      
      // Helper Functions
      function updateStatus(status) {
        switch(status) {
          case 'connected':
            statusEl.textContent = 'Status: Connected';
            statusEl.className = 'status connected';
            connectBtn.disabled = true;
            disconnectBtn.disabled = false;
            pingBtn.disabled = false;
            messageInput.disabled = false;
            sendBtn.disabled = false;
            break;
          case 'connecting':
            statusEl.textContent = 'Status: Connecting...';
            statusEl.className = 'status connecting';
            connectBtn.disabled = true;
            disconnectBtn.disabled = true;
            pingBtn.disabled = true;
            messageInput.disabled = true;
            sendBtn.disabled = true;
            break;
          case 'disconnected':
          default:
            statusEl.textContent = 'Status: Disconnected';
            statusEl.className = 'status disconnected';
            connectBtn.disabled = false;
            disconnectBtn.disabled = true;
            pingBtn.disabled = true;
            messageInput.disabled = true;
            sendBtn.disabled = true;
            break;
        }
      }
      
      function addMessage(message, type = 'system') {
        const messageEl = document.createElement('div');
        messageEl.className = \`message \${type}\`;
        
        let content = '';
        const timestamp = new Date().toLocaleTimeString();
        
        if (typeof message === 'object') {
          content = JSON.stringify(message);
        } else {
          content = message;
        }
        
        switch(type) {
          case 'sent':
            messageEl.textContent = \`[\${timestamp}] → \${content}\`;
            break;
          case 'received':
            messageEl.textContent = \`[\${timestamp}] ← \${content}\`;
            break;
          case 'system':
          default:
            messageEl.textContent = \`[\${timestamp}] * \${content}\`;
            break;
        }
        
        messagesEl.appendChild(messageEl);
        messagesEl.scrollTop = messagesEl.scrollHeight;
      }
      
      // Event Handlers
      connectBtn.addEventListener('click', () => {
        try {
          updateStatus('connecting');
          addMessage('Connecting to: ' + wsUrl);
          
          socket = new WebSocket(wsUrl);
          
          socket.onopen = () => {
            updateStatus('connected');
            addMessage('Connection established successfully');
          };
          
          socket.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data);
              addMessage(data, 'received');
            } catch (e) {
              addMessage(event.data, 'received');
            }
          };
          
          socket.onclose = () => {
            updateStatus('disconnected');
            addMessage('Connection closed');
            socket = null;
          };
          
          socket.onerror = (error) => {
            updateStatus('disconnected');
            addMessage('WebSocket error: ' + JSON.stringify(error), 'system');
          };
        } catch (error) {
          updateStatus('disconnected');
          addMessage('Failed to create WebSocket connection: ' + error.message, 'system');
        }
      });
      
      disconnectBtn.addEventListener('click', () => {
        if (socket) {
          socket.close();
          socket = null;
          updateStatus('disconnected');
          addMessage('Connection closed by user');
        }
      });
      
      pingBtn.addEventListener('click', () => {
        if (socket && socket.readyState === WebSocket.OPEN) {
          const pingMessage = {
            type: 'ping',
            timestamp: new Date().toISOString()
          };
          
          socket.send(JSON.stringify(pingMessage));
          addMessage(pingMessage, 'sent');
        } else {
          addMessage('Cannot send ping: WebSocket is not connected', 'system');
        }
      });
      
      sendBtn.addEventListener('click', () => {
        const message = messageInput.value.trim();
        
        if (message && socket && socket.readyState === WebSocket.OPEN) {
          try {
            // Try to parse as JSON
            JSON.parse(message);
            socket.send(message);
            addMessage(message, 'sent');
          } catch (e) {
            // Not valid JSON, send as simple text message object
            const messageObj = {
              type: 'message',
              text: message,
              timestamp: new Date().toISOString()
            };
            socket.send(JSON.stringify(messageObj));
            addMessage(messageObj, 'sent');
          }
          
          messageInput.value = '';
        }
      });
      
      messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          sendBtn.click();
        }
      });
      
      // Initialize with connection information
      addMessage('WebSocket Test Page loaded');
      addMessage('WebSocket URL: ' + wsUrl);
      addMessage('Environment: ' + (isReplit ? 'Replit' : 'Development'));
      addMessage('Secure Connection: ' + (isHttps ? 'Yes (HTTPS)' : 'No (HTTP)'));
      addMessage('Click "Connect" to establish WebSocket connection');
    </script>
  </body>
  </html>
  `;
  
  res.send(html);
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Seed the database with initial data
  try {
    await seedDatabase();
  } catch (error) {
    console.error("Error seeding database:", error);
  }

  // Register a direct health check endpoint before vite middleware 
  app.get("/api/health", (req, res) => {
    return res.status(200).json({
      status: "ok",
      serverTime: new Date().toISOString(),
      port: process.env.PORT || "8080",
      version: "1.0.0",
      environment: process.env.NODE_ENV || "development"
    });
  });

  // Apply Vite middleware setup for Replit environment
  await setupViteMiddleware(app);

  // Register our API routes
  const server = await registerRoutes(app);

  // Error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    console.error("Error:", err);
  });

  // Static file setup for production only
  if (app.get("env") !== "development") {
    // Define possible static file locations in order of preference
    const staticPaths = [
      path.join(process.cwd(), 'build/client'),
      path.join(process.cwd(), 'dist/public'),
      path.join(process.cwd(), 'public'),
      path.join(process.cwd(), 'client/dist')
    ];

    // Find first existing static path
    const staticPath = staticPaths.find(p => fs.existsSync(p)) || staticPaths[0];
    console.log(`Using static path: ${staticPath}`);

    // Serve static files with proper caching headers
    app.use(express.static(staticPath, {
      maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0,
      etag: true,
      lastModified: true
    }));

    // Serve additional static assets if needed
    app.use('/assets', express.static(path.join(staticPath, 'assets')));

    // Add catch-all route to serve index.html for client-side routing
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) {
        return next();
      }

      const indexPath = path.join(staticPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('Index file not found');
      }
    });
  }

  // Environment detection for Replit deployments
  const isReplit = process.env.REPL_ID !== undefined;

  // We need to use a port that's not already in use
  // Since Vite is using 3000 in development, we'll use 4000 for the API
  // Log initial port environment variable
  log(`Initial process.env.PORT: ${process.env.PORT}`);

  // We need to use a port that's not already in use
  // Since Vite is using 3000 in development, we'll use 4000 for the API
  const serverPort = process.env.NODE_ENV === 'production' ? 3000 : 4000;
  
  // Set environment variable for consistency
  process.env.PORT = serverPort.toString();

  // Log the port configuration for debugging
  log(`Port configuration: Determined serverPort: ${serverPort} (${process.env.NODE_ENV || 'development'} mode)`);
  log(`Updated process.env.PORT: ${process.env.PORT}`);
  log(`Port from config.ts: ${CONFIG_PORT}`); // Log the port from config.ts

  const host = "0.0.0.0"; // Listen on all network interfaces for Replit compatibility

  // Start server
  const startServer = (port: number) => {
    // Make sure we're not conflicting with any previously running server
    try {
      server.on('error', (error: any) => {
        if (error.code === 'EADDRINUSE') {
          console.log(`Port ${port} is in use, trying port ${port + 1}`);
          setTimeout(() => {
            server.close();
            startServer(port + 1);
          }, 1000);
        } else {
          console.error('Server error:', error);
        }
      });
      
      server.listen(port, host, () => {
        log(`Serving on port ${port}`);
        process.env.CURRENT_SERVER_PORT = port.toString();
        log(`Server listening at http://${host}:${port}`);
        log(`Environment: ${process.env.NODE_ENV || 'development'}`);

        // Log deployment info for Replit
        if (isReplit) {
          log(`Running in Replit: ${process.env.REPL_ID}`);
        }
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      if ((error as any).code === 'EADDRINUSE') {
        log(`Port ${port} is in use, trying port ${port + 1}`);
        startServer(port + 1);
      } else {
        process.exit(1);
      }
    }
  };

  startServer(serverPort);
})();