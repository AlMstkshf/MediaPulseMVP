import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./lib/i18n/index";
// import App from "./App";
// import SimpleAlt from "./SimpleAlt";
import SaferApp from "./SaferApp";
// import SimplifiedApp from "./SimplifiedApp";
// import ProgressiveApp from "./ProgressiveApp";
// import SimpleApp from "./SimpleApp";
// import MinimalApp from "./MinimalApp";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

try {
  // Using our safer version with improved WebSocket handling
  createRoot(rootElement).render(
    <React.StrictMode>
      <SaferApp />
    </React.StrictMode>
  );
  console.log("SaferApp rendered successfully");
} catch (error) {
  console.error("Error rendering app:", error);
  
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <h1>Error Rendering Application</h1>
        <p>There was an error rendering the application.</p>
        <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; overflow: auto;">${error instanceof Error ? error.message : 'Unknown error'}</pre>
        <p>Try the <a href="/test.html">test page</a> to check basic API connectivity.</p>
      </div>
    `;
  }
}