import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  // Session cookie settings need to be configured based on the environment
  const isProduction = process.env.NODE_ENV === 'production';
  
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'ajman_police_media_secret',
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: true, // Always use secure for HTTPS connections
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      path: '/',
      // Domain will be set dynamically by middleware based on the request hostname
      sameSite: 'none' // Use 'none' to allow cross-site cookie sharing, needed for production domains
    }
  };

  app.set("trust proxy", 1);

  // Add middleware to dynamically set session cookie domain based on request
  app.use((req, res, next) => {
    const host = req.get('host');
    
    // Only modify domain for known production hosts
    if (host) {
      // Check for each of our known domains
      if (host.includes('media-pulse.almstkshf.com')) {
        sessionSettings.cookie!.domain = 'media-pulse.almstkshf.com';
      } else if (host.includes('rhalftn.replit.app')) {
        sessionSettings.cookie!.domain = 'rhalftn.replit.app';
      } else {
        // For local or unknown domains, don't set domain explicitly
        // This allows the browser to set the cookie for the current domain
        delete sessionSettings.cookie!.domain;
      }
      
      console.log(`Using host ${host}, session cookie domain: ${sessionSettings.cookie!.domain || 'not set (using current domain)'}`);
    }
    next();
  });
  
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Add a debug route for authentication
  app.get("/api/auth/debug", (req, res) => {
    // Get host header information
    const host = req.get('host');
    
    // Check if we're in production mode
    const isProduction = process.env.NODE_ENV === 'production';
    
    // Get session info
    const sessionID = req.sessionID;
    
    // Extract cookie settings from session
    const sessionCookieSettings = (req.session as any).cookie || {};
    
    // Response with details about authentication state
    res.json({
      isAuthenticated: req.isAuthenticated(),
      sessionID,
      cookies: req.cookies,
      domain: sessionCookieSettings.domain || 'Not set',
      sameSite: sessionCookieSettings.sameSite || 'Not set',
      nodeEnv: process.env.NODE_ENV || 'development',
      headers: {
        host,
        userAgent: req.get('user-agent')
      }
    });
  });

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.post("/api/auth/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      // Remove password from the response
      const { password, ...userWithoutPassword } = user;

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", async (err: any, user: Express.User | false, info: any) => {
      if (err) return next(err);
      
      // Record login attempt
      try {
        if (!user) {
          // Record failed login
          await storage.recordLoginHistory({
            status: 'failed',
            userId: 0, // We don't have a valid user ID for failed attempts
            ipAddress: req.ip || null,
            userAgent: req.headers['user-agent'] || null,
            location: null,
            failureReason: 'Invalid credentials',
            loginTime: new Date()
          });
          return res.status(401).json({ message: "Invalid credentials" });
        }
        
        // Proceed with login
        req.login(user, async (loginErr) => {
          if (loginErr) {
            // Record login error
            await storage.recordLoginHistory({
              status: 'failed',
              userId: user.id,
              ipAddress: req.ip || null,
              userAgent: req.headers['user-agent'] || null,
              location: null,
              failureReason: 'Login error',
              loginTime: new Date()
            });
            return next(loginErr);
          }
          
          // Record successful login
          await storage.recordLoginHistory({
            status: 'success',
            userId: user.id,
            ipAddress: req.ip || null,
            userAgent: req.headers['user-agent'] || null,
            location: null, // We could use a geolocation service here but simplified for now
            failureReason: null,
            loginTime: new Date()
          });
          
          // Remove password from the response
          const { password, ...userWithoutPassword } = user;
          res.status(200).json(userWithoutPassword);
        });
      } catch (error) {
        console.error("Error recording login history:", error);
        // Still allow login even if history recording fails
        if (!user) {
          return res.status(401).json({ message: "Invalid credentials" });
        }
        
        req.login(user, (loginErr) => {
          if (loginErr) return next(loginErr);
          
          // Remove password from the response
          const { password, ...userWithoutPassword } = user;
          res.status(200).json(userWithoutPassword);
        });
      }
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/auth/user", (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Not authenticated" });
    
    // Remove password from the response
    const { password, ...userWithoutPassword } = req.user as SelectUser;
    res.json(userWithoutPassword);
  });
  

}