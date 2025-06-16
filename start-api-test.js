import { exec } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the port to use
const PORT = 5001;

// Create a simple server that serves the api-test.html file
const server = http.createServer((req, res) => {
  console.log(`Received request for: ${req.url}`);
  
  // Serve the API test page
  if (req.url === '/' || req.url === '/index.html') {
    const filePath = path.join(__dirname, 'client', 'public', 'api-test.html');
    
    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(500);
        res.end(`Error loading API test page: ${err.message}`);
        return;
      }
      
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(content);
    });
    return;
  }
  
  // Proxy API requests to the main server
  if (req.url.startsWith('/api/')) {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: req.url,
      method: req.method,
      headers: req.headers
    };
    
    const proxyReq = http.request(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    });
    
    proxyReq.on('error', (err) => {
      console.error('Proxy error:', err);
      res.writeHead(500);
      res.end(`Proxy error: ${err.message}`);
    });
    
    req.pipe(proxyReq, { end: true });
    return;
  }
  
  // Default response for other requests
  res.writeHead(404);
  res.end('Not found');
});

// Start the server
server.listen(PORT, () => {
  console.log(`API Test server running at http://localhost:${PORT}`);
  console.log(`Access the API test page at: http://localhost:${PORT}/`);
});

// Keep the process running
process.on('SIGINT', () => {
  console.log('Shutting down API test server');
  server.close();
  process.exit(0);
});