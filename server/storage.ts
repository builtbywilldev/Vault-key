import { db } from "./db";
import { 
  users, 
  storedPasswords,
  type User, 
  type UpsertUser,
  type StoredPassword,
  type InsertStoredPassword,
  type UpdateStoredPassword
} from "@shared/schema";
import { eq, and, asc, desc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string | null | undefined): Promise<User | undefined>;
  upsertUser(userData: UpsertUser): Promise<User>;
  
  // Stored password operations
  getStoredPassword(id: number): Promise<StoredPassword | undefined>;
  getStoredPasswordsByUser(userId: string): Promise<StoredPassword[]>;
  createStoredPassword(userId: string, passwordData: InsertStoredPassword): Promise<StoredPassword>;
  updateStoredPassword(id: number, userId: string, passwordData: UpdateStoredPassword): Promise<StoredPassword | null>;
  deleteStoredPassword(id: number, userId: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string | null | undefined): Promise<User | undefined> {
    if (!email) return undefined;
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  
  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
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

  async getStoredPasswordsByUser(userId: string): Promise<StoredPassword[]> {
    return db
      .select()
      .from(storedPasswords)
      .where(eq(storedPasswords.userId, userId))
      .orderBy(desc(storedPasswords.updatedAt));
  }

  async createStoredPassword(userId: string, passwordData: InsertStoredPassword): Promise<StoredPassword> {
    const [storedPassword] = await db
      .insert(storedPasswords)
      .values({
        ...passwordData,
        userId,
      })
      .returning();
    
    return storedPassword;
  }

  async updateStoredPassword(id: number, userId: string, passwordData: UpdateStoredPassword): Promise<StoredPassword | null> {
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

  async deleteStoredPassword(id: number, userId: string): Promise<boolean> {
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
