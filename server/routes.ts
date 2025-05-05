import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  generatePasswordRequestSchema, 
  generateSeededPasswordRequestSchema,
  generatePassphraseRequestSchema,
  userRegisterSchema,
  userLoginSchema,
  insertStoredPasswordSchema,
  updateStoredPasswordSchema
} from "@shared/schema";
import { 
  generatePassword, 
  generateSeededPassword, 
  generatePassphrase 
} from "./passwordGenerator";
import { setupSession, requireAuth, login, register, logout, getCurrentUserHandler } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication middleware
  app.use(setupSession());
  
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = userRegisterSchema.safeParse(req.body);
      if (!validatedData.success) {
        return res.status(400).json({ 
          status: "error", 
          message: "Invalid registration data",
          errors: validatedData.error.errors
        });
      }
      await register(req, res);
    } catch (error: any) {
      console.error("Error in registration:", error);
      res.status(500).json({ 
        status: "error", 
        message: error.message || "Registration failed"
      });
    }
  });
  
  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = userLoginSchema.safeParse(req.body);
      if (!validatedData.success) {
        return res.status(400).json({ 
          status: "error", 
          message: "Invalid login data",
          errors: validatedData.error.errors
        });
      }
      await login(req, res);
    } catch (error: any) {
      console.error("Error in login:", error);
      res.status(500).json({ 
        status: "error", 
        message: error.message || "Login failed"
      });
    }
  });
  
  app.post("/api/auth/logout", async (req, res) => {
    await logout(req, res);
  });
  
  app.get("/api/auth/user", async (req, res) => {
    await getCurrentUserHandler(req, res);
  });
  
  // Stored passwords management routes (protected)
  app.get("/api/passwords", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const passwords = await storage.getStoredPasswordsByUser(userId);
      
      res.json({
        status: "success",
        data: passwords
      });
    } catch (error: any) {
      console.error("Error fetching passwords:", error);
      res.status(500).json({
        status: "error",
        message: error.message || "Failed to fetch passwords"
      });
    }
  });
  
  app.post("/api/passwords", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const result = insertStoredPasswordSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({
          status: "error",
          message: "Invalid password data",
          errors: result.error.errors
        });
      }
      
      const storedPassword = await storage.createStoredPassword(userId, result.data);
      
      res.status(201).json({
        status: "success",
        message: "Password saved successfully",
        data: storedPassword
      });
    } catch (error: any) {
      console.error("Error saving password:", error);
      res.status(500).json({
        status: "error",
        message: error.message || "Failed to save password"
      });
    }
  });
  
  app.patch("/api/passwords/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const passwordId = parseInt(req.params.id);
      
      if (isNaN(passwordId)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid password ID"
        });
      }
      
      const result = updateStoredPasswordSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          status: "error",
          message: "Invalid update data",
          errors: result.error.errors
        });
      }
      
      const updatedPassword = await storage.updateStoredPassword(passwordId, userId, result.data);
      
      if (!updatedPassword) {
        return res.status(404).json({
          status: "error",
          message: "Password not found or you don't have permission to update it"
        });
      }
      
      res.json({
        status: "success",
        message: "Password updated successfully",
        data: updatedPassword
      });
    } catch (error: any) {
      console.error("Error updating password:", error);
      res.status(500).json({
        status: "error",
        message: error.message || "Failed to update password"
      });
    }
  });
  
  app.delete("/api/passwords/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const passwordId = parseInt(req.params.id);
      
      if (isNaN(passwordId)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid password ID"
        });
      }
      
      const result = await storage.deleteStoredPassword(passwordId, userId);
      
      if (!result) {
        return res.status(404).json({
          status: "error",
          message: "Password not found or you don't have permission to delete it"
        });
      }
      
      res.json({
        status: "success",
        message: "Password deleted successfully"
      });
    } catch (error: any) {
      console.error("Error deleting password:", error);
      res.status(500).json({
        status: "error",
        message: error.message || "Failed to delete password"
      });
    }
  });
  // Password generation endpoint
  app.post('/api/generate-password', async (req, res) => {
    try {
      // Validate request body
      const result = generatePasswordRequestSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid request data", 
          errors: result.error.errors 
        });
      }
      
      // Generate password with specified options
      const password = generatePassword(result.data);
      
      return res.status(200).json({ password });
    } catch (error: any) {
      console.error("Error in /api/generate-password:", error);
      return res.status(500).json({ 
        message: error.message || "An error occurred while generating password" 
      });
    }
  });

  // Seeded password generation endpoint
  app.post('/api/generate-seeded-password', async (req, res) => {
    try {
      // Validate request body
      const result = generateSeededPasswordRequestSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid request data", 
          errors: result.error.errors 
        });
      }
      
      // Generate deterministic password based on master word and domain
      const password = generateSeededPassword(result.data);
      
      return res.status(200).json({ password });
    } catch (error: any) {
      console.error("Error in /api/generate-seeded-password:", error);
      return res.status(500).json({ 
        message: error.message || "An error occurred while generating seeded password" 
      });
    }
  });

  // Passphrase generation endpoint
  app.post('/api/generate-passphrase', async (req, res) => {
    try {
      // Validate request body
      const result = generatePassphraseRequestSchema.safeParse(req.body);
      
      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid request data", 
          errors: result.error.errors 
        });
      }
      
      // Generate passphrase with specified options
      const password = generatePassphrase(result.data);
      
      return res.status(200).json({ password });
    } catch (error: any) {
      console.error("Error in /api/generate-passphrase:", error);
      return res.status(500).json({ 
        message: error.message || "An error occurred while generating passphrase" 
      });
    }
  });

  // API access endpoint (for programmatic use)
  app.post('/api/v1/generate', async (req, res) => {
    try {
      const apiKey = req.headers['x-api-key'];
      
      if (!apiKey || typeof apiKey !== 'string') {
        return res.status(401).json({ message: "API key is required" });
      }
      
      // Validate the API key (implement API key validation)
      // TODO: Implement API key validation with storage.getUserByApiKey

      // Determine the type of generation
      const { type = 'password', ...options } = req.body;
      
      let result;
      
      if (type === 'password') {
        const validatedOptions = generatePasswordRequestSchema.safeParse(options);
        if (!validatedOptions.success) {
          return res.status(400).json({ 
            message: "Invalid password options", 
            errors: validatedOptions.error.errors 
          });
        }
        result = { password: generatePassword(validatedOptions.data) };
      } else if (type === 'seeded') {
        const validatedOptions = generateSeededPasswordRequestSchema.safeParse(options);
        if (!validatedOptions.success) {
          return res.status(400).json({ 
            message: "Invalid seeded password options", 
            errors: validatedOptions.error.errors 
          });
        }
        result = { password: generateSeededPassword(validatedOptions.data) };
      } else if (type === 'passphrase') {
        const validatedOptions = generatePassphraseRequestSchema.safeParse(options);
        if (!validatedOptions.success) {
          return res.status(400).json({ 
            message: "Invalid passphrase options", 
            errors: validatedOptions.error.errors 
          });
        }
        result = { password: generatePassphrase(validatedOptions.data) };
      } else {
        return res.status(400).json({ message: `Invalid generation type: ${type}` });
      }
      
      return res.status(200).json(result);
    } catch (error: any) {
      console.error("Error in /api/v1/generate:", error);
      return res.status(500).json({ 
        message: error.message || "An error occurred while processing your request" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
