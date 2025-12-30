import { users, listings, chats, messages, rentalReturns, type User, type InsertUser, type Listing, type InsertListing, type Chat, type Message, type InsertMessage, type RentalReturn, type InsertRentalReturn } from "@shared/schema";
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

  // Rental Returns
  getRentalReturn(chatId: number): Promise<RentalReturn | undefined>;
  createRentalReturn(rental: InsertRentalReturn): Promise<RentalReturn>;
  confirmRentalReturn(id: number, confirmedBy: "buyer" | "seller", type: "start" | "end" | "date", date?: string): Promise<RentalReturn>;
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

  async createUser(insertUser: any): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, update: Partial<User>): Promise<User | undefined> {
    const [user] = await db.update(users).set(update).where(eq(users.id, id)).returning();
    return user;
  }

  async getListings(filters?: { category?: string; search?: string }): Promise<Listing[]> {
    let query = db.select().from(listings).$dynamic();
    
    if (filters?.category) {
      query = query.where(eq(listings.category, filters.category));
    }
    
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

  async getRentalReturn(chatId: number): Promise<RentalReturn | undefined> {
    const [rental] = await db.select().from(rentalReturns)
      .where(eq(rentalReturns.chatId, chatId))
      .orderBy(desc(rentalReturns.createdAt));
    return rental;
  }

  async createRentalReturn(insertRental: InsertRentalReturn): Promise<RentalReturn> {
    const [rental] = await db.insert(rentalReturns).values(insertRental).returning();
    return rental;
  }

  async confirmRentalReturn(id: number, confirmedBy: "buyer" | "seller", type: "start" | "end" | "date", date?: string): Promise<RentalReturn> {
    const update: any = {};
    if (type === "start") {
      update[confirmedBy === "buyer" ? "buyerStarted" : "sellerStarted"] = true;
    } else if (type === "end") {
      update[confirmedBy === "buyer" ? "buyerConfirmed" : "sellerConfirmed"] = true;
    } else if (type === "date") {
      update[confirmedBy === "buyer" ? "buyerAgreedDate" : "sellerAgreedDate"] = true;
      if (date) update.returnDate = new Date(date);
    }

    const [rental] = await db.update(rentalReturns)
      .set(update)
      .where(eq(rentalReturns.id, id))
      .returning();
    
    // Auto-update overall status
    if (rental.buyerStarted && rental.sellerStarted && rental.status === "pending") {
      await db.update(rentalReturns).set({ status: "active" }).where(eq(rentalReturns.id, id));
    } else if (rental.buyerConfirmed && rental.sellerConfirmed && rental.status === "active") {
      await db.update(rentalReturns).set({ status: "completed" }).where(eq(rentalReturns.id, id));
    }

    return rental;
  }
}

export const storage = new DatabaseStorage();
