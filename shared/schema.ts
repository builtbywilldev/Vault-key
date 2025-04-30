import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for API access
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  apiKey: text("api_key").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Sessions table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: text("sid").primaryKey(),
    sess: text("sess").notNull(),
    expire: timestamp("expire").notNull(),
  }
);

// Define API request schemas for password generation
export const generatePasswordRequestSchema = z.object({
  length: z.number().int().min(8).max(128).default(16),
  useUppercase: z.boolean().default(true),
  useLowercase: z.boolean().default(true),
  useNumbers: z.boolean().default(true),
  useSymbols: z.boolean().default(true),
  excludeSimilarCharacters: z.boolean().default(false),
  excludeAmbiguous: z.boolean().default(false)
});

export type GeneratePasswordRequest = z.infer<typeof generatePasswordRequestSchema>;

export const generateSeededPasswordRequestSchema = z.object({
  masterWord: z.string().min(1, "Master word is required"),
  domain: z.string().min(1, "Domain is required"),
  length: z.number().int().min(8).max(128).default(16),
  useUppercase: z.boolean().default(true),
  useLowercase: z.boolean().default(true),
  useNumbers: z.boolean().default(true),
  useSymbols: z.boolean().default(true)
});

export type GenerateSeededPasswordRequest = z.infer<typeof generateSeededPasswordRequestSchema>;

export const generatePassphraseRequestSchema = z.object({
  words: z.number().int().min(3).max(12).default(4),
  separator: z.string().max(3).default("-"),
  capitalize: z.boolean().default(false),
  includeNumber: z.boolean().default(false)
});

export type GeneratePassphraseRequest = z.infer<typeof generatePassphraseRequestSchema>;

export const generatePasswordResponseSchema = z.object({
  password: z.string()
});

export type GeneratePasswordResponse = z.infer<typeof generatePasswordResponseSchema>;
