import { db } from "./db";
import { 
  users, 
  storedPasswords,
  type User, 
  type InsertUser,
  type StoredPassword,
  type InsertStoredPassword,
  type UpdateStoredPassword
} from "@shared/schema";
import { eq, and, asc, desc } from "drizzle-orm";
import crypto from "crypto";
import bcrypt from "bcrypt";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByApiKey(apiKey: string): Promise<User | undefined>;
  createUser(userData: { email: string; username: string; password: string }): Promise<User>;
  validateUserPassword(email: string, password: string): Promise<User | null>;
  
  // Stored password operations
  getStoredPassword(id: number): Promise<StoredPassword | undefined>;
  getStoredPasswordsByUser(userId: number): Promise<StoredPassword[]>;
  createStoredPassword(userId: number, passwordData: InsertStoredPassword): Promise<StoredPassword>;
  updateStoredPassword(id: number, userId: number, passwordData: UpdateStoredPassword): Promise<StoredPassword | null>;
  deleteStoredPassword(id: number, userId: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserByApiKey(apiKey: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.apiKey, apiKey));
    return user;
  }

  async createUser(userData: { email: string; username: string; password: string }): Promise<User> {
    // Generate a unique API key for the user
    const apiKey = crypto.randomBytes(32).toString('hex');
    
    // Hash the password
    const passwordHash = await bcrypt.hash(userData.password, 10);
    
    const [user] = await db
      .insert(users)
      .values({
        email: userData.email,
        username: userData.username,
        passwordHash,
        apiKey
      })
      .returning();
    
    return user;
  }

  async validateUserPassword(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    
    if (!user) {
      return null;
    }
    
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    
    if (!isValidPassword) {
      return null;
    }
    
    return user;
  }

  // Stored password operations
  async getStoredPassword(id: number): Promise<StoredPassword | undefined> {
    const [storedPassword] = await db
      .select()
      .from(storedPasswords)
      .where(eq(storedPasswords.id, id));
    
    return storedPassword;
  }

  async getStoredPasswordsByUser(userId: number): Promise<StoredPassword[]> {
    return db
      .select()
      .from(storedPasswords)
      .where(eq(storedPasswords.userId, userId))
      .orderBy(desc(storedPasswords.updatedAt));
  }

  async createStoredPassword(userId: number, passwordData: InsertStoredPassword): Promise<StoredPassword> {
    const [storedPassword] = await db
      .insert(storedPasswords)
      .values({
        ...passwordData,
        userId,
        updatedAt: new Date()
      })
      .returning();
    
    return storedPassword;
  }

  async updateStoredPassword(id: number, userId: number, passwordData: UpdateStoredPassword): Promise<StoredPassword | null> {
    const [updatedPassword] = await db
      .update(storedPasswords)
      .set({
        ...passwordData,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(storedPasswords.id, id),
          eq(storedPasswords.userId, userId)
        )
      )
      .returning();
    
    return updatedPassword || null;
  }

  async deleteStoredPassword(id: number, userId: number): Promise<boolean> {
    const result = await db
      .delete(storedPasswords)
      .where(
        and(
          eq(storedPasswords.id, id),
          eq(storedPasswords.userId, userId)
        )
      );
    
    return !!result;
  }
}

export const storage = new DatabaseStorage();
