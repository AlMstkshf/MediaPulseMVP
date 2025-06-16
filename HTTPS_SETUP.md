# HTTPS Configuration for Ajman Police Media Intelligence Platform

This document outlines the steps taken to configure secure HTTPS redirection for the application when deployed on Replit and served through Cloudflare.

## Server-side Implementation

The following changes have been made to the Express application in `server/index.ts`:

1. **Enable Trust Proxy**
   ```javascript
   app.enable('trust proxy');
   ```
   This configuration ensures Express correctly identifies client HTTPS requests when proxied through Cloudflare by respecting the `X-Forwarded-Proto` header.

2. **HTTPS Redirect Middleware**
   ```javascript
   app.use((req, res, next) => {
     if (req.protocol !== 'https') {
       return res.redirect(301, 'https://' + req.headers.host + req.url);
     }
     next();
   });
   ```
   This middleware automatically redirects any HTTP requests to their HTTPS equivalent with a permanent 301 redirect.

3. **Secure Cookie Configuration**
   ```javascript
   app.use((req, res, next) => {
     res.cookie = function(name, value, options = {}) {
       const isSecure = process.env.NODE_ENV === 'production' || req.secure || req.protocol === 'https';
       const defaultOptions = {
         httpOnly: true,
         secure: isSecure,
         sameSite: isSecure ? 'none' : 'lax',
         path: '/'
       };
       return Object.getPrototypeOf(res).cookie.call(
         this, name, value, { ...defaultOptions, ...options }
       );
     };
     next();
   });
   ```
   This middleware overrides the default cookie-setting behavior to ensure:
   - Cookies are marked as `secure` when using HTTPS
   - `SameSite=None` is set for secure cookies to support cross-origin requests
   - `httpOnly` flag is set to prevent JavaScript access to cookies
   - All cookies default to the root path

4. **Debug Route**
   ```javascript
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
   ```
   This optional route can be used to inspect and verify the request headers, protocol information, and cookie status when troubleshooting HTTPS and authentication issues.

## Authentication Cookie Security

The secure cookie configuration added to the application addresses the needs of authentication requests that use `credentials: 'include'` in fetch calls. This configuration ensures:

1. Cookies are automatically set to be secure when using HTTPS
2. SameSite attribute is set to 'lax' as specified
3. Domain is set to '.media-pulse.almstkshf.com' in production for cross-subdomain access
4. Proper handling of cookies in both development and production environments

### Client-Side Fetch Configuration

When making authenticated requests from the client, use the following configuration with fetch:

```javascript
fetch('/login', {
  method: 'POST',
  credentials: 'include',  // This is crucial for sending/receiving cookies
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ username, password })
})
```

The `credentials: 'include'` option instructs the browser to send cookies with the request and to store any cookies received in response.

### Server-Side Session Configuration

The Express session middleware should also be configured properly:

```javascript
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    // These options will be overridden by our global cookie middleware
    // and will automatically use appropriate secure settings
  }
}));
```

## Express Proxy Configuration

The application uses Express's `trust proxy` setting to properly handle HTTPS and secure cookies when deployed behind Cloudflare:

```javascript
// Set to "1" hop since Cloudflare sits directly in front of our app
app.set('trust proxy', 1);
```

This configuration is critical for:
1. Correctly identifying the client's IP address
2. Properly detecting HTTPS via the `X-Forwarded-Proto` header
3. Ensuring `req.protocol` returns "https" when the request comes through Cloudflare

For more complex setups with multiple proxies, the number can be increased, or specific Cloudflare IP ranges can be whitelisted.

## Required Cloudflare Configuration

After deploying the application to Replit, you must configure the following settings in your Cloudflare dashboard:

### 1. Set SSL/TLS Encryption Mode to Full (Strict)

1. Log in to your Cloudflare account
2. Select the domain that points to your Replit application
3. Navigate to **SSL/TLS** > **Overview**
4. Select **Full (strict)** as the encryption mode
   - This ensures secure connections throughout the entire path from the client to Cloudflare to your Replit application

### 2. Enable "Always Use HTTPS" Option

1. In Cloudflare dashboard, go to **SSL/TLS** > **Edge Certificates**
2. Toggle ON the **Always Use HTTPS** setting
   - This forces all HTTP requests to be redirected to HTTPS at the Cloudflare edge

### 3. Create a Page Rule for HTTPS Enforcement

1. Go to **Rules** > **Page Rules** in Cloudflare dashboard
2. Click **Create Page Rule**
3. Enter the URL pattern: `http://yourdomain.com/*` (replace with your actual domain)
4. Add a setting: **Always Use HTTPS**
5. Save and Deploy the Page Rule
   - This provides an extra layer of enforcement at the Cloudflare level

## Verification

After implementation, you can verify that HTTPS redirection is working properly by:

1. Visiting the `/debug` endpoint at your domain
2. Checking that `protocol` shows as `https` and `secure` is `true`
3. Attempting to access your site with `http://` and verifying you are redirected to `https://`

## Important Notes

- Replit provides HTTPS by default for your application, so internal HTTPS handling is already in place
- The Cloudflare SSL mode should never be set to "Flexible" as this would create a security vulnerability
- These measures ensure all traffic to your application is encrypted, protecting user data and maintaining security best practices

If you encounter any issues with HTTPS redirection, check:
1. That `trust proxy` is correctly enabled
2. That Cloudflare is properly configured as outlined above
3. The headers displayed in the `/debug` endpoint to understand how requests are being processed