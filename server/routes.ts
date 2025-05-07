import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from 'ws';
import { setupAuth, isAuthenticated } from './replitAuth';
import { storage } from './storage';

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  await setupAuth(app);

  // Add authentication route to check current user
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Add Morpheus-specific API endpoints here if needed
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', morpheus: 'online' });
  });

  // Create HTTP server
  const httpServer = createServer(app);
  
  // Set up WebSocket server for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('New client connected');
    
    // Send welcome message
    ws.send(JSON.stringify({
      role: 'assistant',
      content: 'Welcome to Morpheus. How can I assist you today?',
      timestamp: new Date()
    }));
    
    // Handle incoming messages
    ws.on('message', (message) => {
      try {
        // Parse incoming message
        const data = JSON.parse(message.toString());
        console.log('Received message:', data);
        
        // Echo back with Morpheus response for now
        setTimeout(() => {
          if (ws.readyState === ws.OPEN) {
            ws.send(JSON.stringify({
              role: 'assistant',
              content: `I received your message: "${data.content}". The Morpheus AI system is currently in demo mode.`,
              timestamp: new Date()
            }));
          }
        }, 1000);
      } catch (error) {
        console.error('Error processing message:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });

  return httpServer;
}
