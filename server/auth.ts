import { Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";
import { storage } from "./storage";

// Define session interface with user information
declare module "express-session" {
  interface SessionData {
    userId?: number;
    authenticated?: boolean;
  }
}

// Initialize session middleware
export function setupSession() {
  const sessionTtl = 14 * 24 * 60 * 60 * 1000; // 14 days
  
  const PostgresStore = connectPgSimple(session);
  const sessionStore = new PostgresStore({
    pool,
    tableName: "sessions",
    createTableIfMissing: true,
  });
  
  return session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || 'vaultkeyDefaultSecret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to false for development, true for production
      httpOnly: true,
      maxAge: sessionTtl,
      sameSite: "lax",
    },
  });
}

// Authentication middleware
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.authenticated || !req.session.userId) {
    return res.status(401).json({ 
      status: "error", 
      message: "Unauthorized. Please login." 
    });
  }
  
  next();
}

// Helper to get current user
export async function getCurrentUser(req: Request) {
  if (!req.session.userId) {
    return null;
  }
  
  const user = await storage.getUser(req.session.userId);
  return user || null;
}

// Login handler
export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ 
      status: "error", 
      message: "Email and password are required" 
    });
  }
  
  try {
    const user = await storage.validateUserPassword(email, password);
    
    if (!user) {
      return res.status(401).json({ 
        status: "error", 
        message: "Invalid email or password" 
      });
    }
    
    req.session.userId = user.id;
    req.session.authenticated = true;
    
    // Save the session before responding
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({
          status: "error",
          message: "An error occurred during login. Please try again."
        });
      }
      
      const { passwordHash, ...safeUser } = user;
      
      return res.status(200).json({
        status: "success",
        message: "Login successful",
        data: safeUser
      });
    });
  } catch (error: any) {
    console.error("Login error:", error);
    
    return res.status(500).json({
      status: "error",
      message: "An error occurred during login. Please try again."
    });
  }
}

// Register handler
export async function register(req: Request, res: Response) {
  const { email, username, password } = req.body;
  
  if (!email || !username || !password) {
    return res.status(400).json({ 
      status: "error", 
      message: "Email, username, and password are required" 
    });
  }
  
  try {
    // Check if user already exists
    const existingUserByEmail = await storage.getUserByEmail(email);
    if (existingUserByEmail) {
      return res.status(409).json({ 
        status: "error", 
        message: "Email already in use" 
      });
    }
    
    const existingUserByUsername = await storage.getUserByUsername(username);
    if (existingUserByUsername) {
      return res.status(409).json({ 
        status: "error", 
        message: "Username already in use" 
      });
    }
    
    // Create new user
    const newUser = await storage.createUser({
      email: email,
      username: username,
      password: password
    });
    
    // Log in the user automatically
    req.session.userId = newUser.id;
    req.session.authenticated = true;
    
    // Save the session before responding
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({
          status: "error",
          message: "An error occurred during registration. Please try again."
        });
      }
      
      const { passwordHash, ...safeUser } = newUser;
      
      return res.status(201).json({
        status: "success",
        message: "Registration successful",
        data: safeUser
      });
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    
    return res.status(500).json({
      status: "error",
      message: "An error occurred during registration. Please try again."
    });
  }
}

// Logout handler
export async function logout(req: Request, res: Response) {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({
        status: "error",
        message: "An error occurred during logout. Please try again."
      });
    }
    
    res.clearCookie("connect.sid");
    
    return res.status(200).json({
      status: "success",
      message: "Logout successful"
    });
  });
}

// Get current user
export async function getCurrentUserHandler(req: Request, res: Response) {
  try {
    const user = await getCurrentUser(req);
    
    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Not authenticated"
      });
    }
    
    const { passwordHash, ...safeUser } = user;
    
    return res.status(200).json({
      status: "success",
      data: safeUser
    });
  } catch (error: any) {
    console.error("Get current user error:", error);
    
    return res.status(500).json({
      status: "error",
      message: "An error occurred while fetching user. Please try again."
    });
  }
}