import type { Express } from "express";
import { createServer, type Server } from "http";
import { 
  generatePasswordRequestSchema, 
  generateSeededPasswordRequestSchema,
  generatePassphraseRequestSchema
} from "@shared/schema";
import { 
  generatePassword, 
  generateSeededPassword, 
  generatePassphrase 
} from "./passwordGenerator";

export async function registerRoutes(app: Express): Promise<Server> {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
      console.error("Error in /api/v1/generate:", error);
      return res.status(500).json({ 
        message: error.message || "An error occurred while processing your request" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
