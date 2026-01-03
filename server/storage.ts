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
  confirmRentalReturn(id: number, confirmedBy: "buyer" | "seller", type: "start" | "end" | "date" | "verify_otp" | "reject_date", date?: string, otp?: string): Promise<RentalReturn>;
  markMessagesAsRead(chatId: number, userId: number): Promise<void>;
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

  async confirmRentalReturn(id: number, confirmedBy: "buyer" | "seller", type: "start" | "end" | "date" | "verify_otp" | "reject_date", date?: string, otp?: string): Promise<RentalReturn> {
    const [rental] = await db.select().from(rentalReturns).where(eq(rentalReturns.id, id));
    if (!rental) throw new Error("Rental not found");

    let updates: Partial<RentalReturn> = {};

    if (type === "start") {
      if (confirmedBy === "buyer") updates.buyerStarted = true;
      else updates.sellerStarted = true;
    } else if (type === "end") {
      if (confirmedBy === "buyer") updates.buyerConfirmed = true;
      else updates.sellerConfirmed = true;
    } else if (type === "date" && date) {
      updates.returnDate = new Date(date);
      if (confirmedBy === "buyer") updates.buyerAgreedDate = true;
      else updates.sellerAgreedDate = true;
    } else if (type === "verify_otp" && otp) {
      if (otp === rental.handoverOtp) {
        updates.handoverOtpVerified = true;
        updates.status = "active";
      } else if (otp === rental.returnOtp) {
        updates.returnOtpVerified = true;
        updates.status = "completed";
      }
    }

    const [updated] = await db.update(rentalReturns)
      .set(updates)
      .where(eq(rentalReturns.id, id))
      .returning();
    return updated;
  }

  async markMessagesAsRead(chatId: number, userId: number): Promise<void> {
    const [chat] = await db.select().from(chats).where(eq(chats.id, chatId));
    if (!chat) return;
    const otherUserId = chat.buyerId === userId ? chat.sellerId : chat.buyerId;
    
    await db.update(messages)
      .set({ read: true })
      .where(and(eq(messages.chatId, chatId), eq(messages.senderId, otherUserId)));
  }
}

export const storage = new DatabaseStorage();
