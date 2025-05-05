import { pgTable, text, serial, timestamp, integer, boolean, varchar } from "drizzle-orm/pg-core";
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

export const usersRelations = relations(users, ({ many }) => ({
  storedPasswords: many(storedPasswords),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  username: true,
  passwordHash: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

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
