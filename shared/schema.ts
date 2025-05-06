import { pgTable, text, serial, timestamp, integer, boolean, varchar, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table (for authentication and sync)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  username: varchar("username", { length: 100 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  apiKey: varchar("api_key", { length: 64 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  username: true,
  passwordHash: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// User relations (need to be after all table definitions)
export const usersRelations = relations(users, ({ many }) => ({
  storedPasswords: many(storedPasswords),
  chatMessages: many(chatMessages),
  agents: many(agents),
}));

// Authentication schemas
export const userRegisterSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type UserRegister = z.infer<typeof userRegisterSchema>;

export const userLoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type UserLogin = z.infer<typeof userLoginSchema>;

// Stored passwords table (for syncing)
export const storedPasswords = pgTable("stored_passwords", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  website: varchar("website", { length: 255 }),
  username: varchar("username", { length: 255 }),
  password: text("password").notNull(),
  notes: text("notes"),
  favorite: boolean("favorite").default(false),
  category: varchar("category", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const storedPasswordsRelations = relations(storedPasswords, ({ one }) => ({
  user: one(users, {
    fields: [storedPasswords.userId],
    references: [users.id],
  }),
}));

export const insertStoredPasswordSchema = createInsertSchema(storedPasswords)
  .omit({ id: true, userId: true, createdAt: true, updatedAt: true });

export type InsertStoredPassword = z.infer<typeof insertStoredPasswordSchema>;
export type StoredPassword = typeof storedPasswords.$inferSelect;

// Update stored password schema
export const updateStoredPasswordSchema = insertStoredPasswordSchema.partial();
export type UpdateStoredPassword = z.infer<typeof updateStoredPasswordSchema>;

// Sessions table (required for authentication)
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

// Morpheus Chat Messages
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  role: varchar("role", { length: 20 }).notNull(), // 'user', 'assistant', 'system'
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  user: one(users, {
    fields: [chatMessages.userId],
    references: [users.id]
  })
}));

export const insertChatMessageSchema = createInsertSchema(chatMessages)
  .omit({ id: true, createdAt: true });

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

// Morpheus Agents
export const agents = pgTable("agents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 20 }).notNull().default("idle"), // 'idle', 'active', 'paused', 'error'
  capabilities: jsonb("capabilities"),
  configuration: jsonb("configuration"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const agentsRelations = relations(agents, ({ one, many }) => ({
  user: one(users, {
    fields: [agents.userId],
    references: [users.id]
  }),
  logs: many(agentLogs)
}));

export const insertAgentSchema = createInsertSchema(agents)
  .omit({ id: true, userId: true, createdAt: true, updatedAt: true, status: true });

export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type Agent = typeof agents.$inferSelect;

export const updateAgentSchema = insertAgentSchema.partial();
export type UpdateAgent = z.infer<typeof updateAgentSchema>;

// Agent Logs
export const agentLogs = pgTable("agent_logs", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").notNull().references(() => agents.id, { onDelete: "cascade" }),
  action: varchar("action", { length: 100 }).notNull(),
  details: jsonb("details"),
  logLevel: varchar("log_level", { length: 20 }).notNull().default("info"), // 'info', 'warning', 'error', 'debug'
  timestamp: timestamp("timestamp").defaultNow().notNull()
});

export const agentLogsRelations = relations(agentLogs, ({ one }) => ({
  agent: one(agents, {
    fields: [agentLogs.agentId],
    references: [agents.id]
  })
}));

export const insertAgentLogSchema = createInsertSchema(agentLogs)
  .omit({ id: true, timestamp: true });

export type InsertAgentLog = z.infer<typeof insertAgentLogSchema>;
export type AgentLog = typeof agentLogs.$inferSelect;

// Chat Commands Schema
export const chatCommandSchema = z.object({
  command: z.string().min(1, "Command is required"),
  args: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional()
});

export type ChatCommand = z.infer<typeof chatCommandSchema>;
