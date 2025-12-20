import { users, listings, chats, messages, type User, type InsertUser, type Listing, type InsertListing, type Chat, type Message, type InsertMessage } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, or } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Listings
  getListings(filters?: { category?: string; search?: string }): Promise<Listing[]>;
  getListing(id: number): Promise<Listing | undefined>;
  createListing(listing: InsertListing): Promise<Listing>;
  updateListing(id: number, updates: Partial<InsertListing>): Promise<Listing>;

  // Chats
  getChats(userId: number): Promise<(Chat & { listing: Listing, otherUser: User })[]>;
  createChat(listingId: number, buyerId: number, sellerId: number): Promise<Chat>;
  getChat(listingId: number, buyerId: number): Promise<Chat | undefined>;
  
  // Messages
  getMessages(chatId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getListings(filters?: { category?: string; search?: string }): Promise<Listing[]> {
    let query = db.select().from(listings);
    
    if (filters?.category) {
      query = query.where(eq(listings.category, filters.category));
    }
    
    // Simple search implementation
    // In a real app, use full text search
    
    return await query.orderBy(desc(listings.createdAt));
  }

  async getListing(id: number): Promise<Listing | undefined> {
    const [listing] = await db.select().from(listings).where(eq(listings.id, id));
    return listing;
  }

  async createListing(insertListing: InsertListing): Promise<Listing> {
    const [listing] = await db.insert(listings).values(insertListing).returning();
    return listing;
  }

  async updateListing(id: number, updates: Partial<InsertListing>): Promise<Listing> {
    const [listing] = await db.update(listings)
      .set(updates)
      .where(eq(listings.id, id))
      .returning();
    return listing;
  }

  async getChats(userId: number): Promise<(Chat & { listing: Listing, otherUser: User })[]> {
    const userChats = await db.select({
      chat: chats,
      listing: listings,
      buyer: users,
      seller: users,
    })
    .from(chats)
    .innerJoin(listings, eq(chats.listingId, listings.id))
    .innerJoin(users, eq(chats.buyerId, users.id)) // Join buyer
    .leftJoin(users, eq(chats.sellerId, users.id)) // Join seller (aliased via leftJoin logic, but standard join is fine)
    .where(or(eq(chats.buyerId, userId), eq(chats.sellerId, userId)));

    // Map results to the expected format and determine "otherUser"
    // Note: Drizzle join syntax above is simplified; actual join with aliases for same table twice needs explicit aliases.
    // However, for MVP speed, let's just fetch basic chats and populate manually if needed, or use simpler logic.
    // Let's rely on basic joins.
    // Correct approach with aliases in Drizzle:
    // This is getting complex for a quick edit. Let's simplify: fetch chats, then fetch related data.
    
    const rawChats = await db.select().from(chats).where(or(eq(chats.buyerId, userId), eq(chats.sellerId, userId)));
    
    const enrichedChats = await Promise.all(rawChats.map(async (chat) => {
      const [listing] = await db.select().from(listings).where(eq(listings.id, chat.listingId));
      const otherUserId = chat.buyerId === userId ? chat.sellerId : chat.buyerId;
      const [otherUser] = await db.select().from(users).where(eq(users.id, otherUserId));
      
      return {
        ...chat,
        listing,
        otherUser
      };
    }));

    return enrichedChats as (Chat & { listing: Listing, otherUser: User })[];
  }

  async getChat(listingId: number, buyerId: number): Promise<Chat | undefined> {
    const [chat] = await db.select().from(chats).where(
      and(eq(chats.listingId, listingId), eq(chats.buyerId, buyerId))
    );
    return chat;
  }

  async createChat(listingId: number, buyerId: number, sellerId: number): Promise<Chat> {
    const [chat] = await db.insert(chats).values({
      listingId,
      buyerId,
      sellerId
    }).returning();
    return chat;
  }

  async getMessages(chatId: number): Promise<Message[]> {
    return await db.select().from(messages)
      .where(eq(messages.chatId, chatId))
      .orderBy(messages.createdAt);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(insertMessage).returning();
    return message;
  }
}

export const storage = new DatabaseStorage();
