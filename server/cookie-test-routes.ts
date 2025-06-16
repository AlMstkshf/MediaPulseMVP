import { Express, Request, Response } from 'express';

/**
 * Register cookie test routes for demonstrating secure cookie handling
 * These routes are for testing purposes only and should be removed in production
 */
export function registerCookieTestRoutes(app: Express) {
  // Set a test cookie
  app.post('/api/auth/test-set-cookie', (req: Request, res: Response) => {
    const cookieValue = req.body.value || 'test-cookie-value';
    const cookieName = req.body.name || 'test-cookie';
    
    // The cookie will automatically use secure settings from our middleware
    res.cookie(cookieName, cookieValue);
    
    res.json({
      success: true,
      message: `Cookie "${cookieName}" set successfully`,
      secure: req.secure || req.protocol === 'https',
      sameSite: req.secure || req.protocol === 'https' ? 'none' : 'lax',
    });
  });

  // Get all cookies
  app.get('/api/auth/test-get-cookies', (req: Request, res: Response) => {
    res.json({
      cookies: req.cookies,
      signedCookies: req.signedCookies,
      headers: req.headers,
      secure: req.secure || req.protocol === 'https'
    });
  });

  // Clear a test cookie
  app.post('/api/auth/test-clear-cookie', (req: Request, res: Response) => {
    const cookieName = req.body.name || 'test-cookie';
    
    res.clearCookie(cookieName);
    
    res.json({
      success: true,
      message: `Cookie "${cookieName}" cleared successfully`
    });
  });
}