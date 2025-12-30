import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  college: text("college").notNull().default("Alliance University"),
  avatar: text("avatar"),
  email: text("email").unique(),
  phone: text("phone").unique(),
  isVerified: boolean("is_verified").default(false),
  otp: text("otp"),
  otpExpiry: timestamp("otp_expiry"),
});

export const listings = pgTable("listings", {
  id: serial("id").primaryKey(),
  sellerId: integer("seller_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url"), // Kept for backward compatibility, nullable for PDF-only notes
  imageUrls: jsonb("image_urls"), // Array of all images (1-5)
  pdfUrl: text("pdf_url"), // Optional PDF for notes
  pdfSlidesAllowed: integer("pdf_slides_allowed"), // How many slides allowed for viewing
  videoUrl: text("video_url"), // Optional video
  type: text("type").notNull(), // 'sell' | 'rent'
  status: text("status").notNull().default("available"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chats = pgTable("chats", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id").notNull(),
  buyerId: integer("buyer_id").notNull(),
  sellerId: integer("seller_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  chatId: integer("chat_id").notNull(),
  senderId: integer("sender_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const rentalReturns = pgTable("rental_returns", {
  id: serial("id").primaryKey(),
  chatId: integer("chat_id").notNull(),
  listingId: integer("listing_id").notNull(),
  startDate: timestamp("start_date").defaultNow(),
  returnDate: timestamp("return_date").notNull(),
  buyerConfirmed: boolean("buyer_confirmed").default(false),
  sellerConfirmed: boolean("seller_confirmed").default(false),
  buyerStarted: boolean("buyer_started").default(false),
  sellerStarted: boolean("seller_started").default(false),
  buyerAgreedDate: boolean("buyer_agreed_date").default(false),
  sellerAgreedDate: boolean("seller_agreed_date").default(false),
  handoverOtp: text("handover_otp"),
  returnOtp: text("return_otp"),
  handoverOtpVerified: boolean("handover_otp_verified").default(false),
  returnOtpVerified: boolean("return_otp_verified").default(false),
  isLate: boolean("is_late").default(false),
  penalty: integer("penalty").default(0),
  status: text("status").default("pending"), // pending | active | completed | late
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const listingsRelations = relations(listings, ({ one }) => ({
  seller: one(users, {
    fields: [listings.sellerId],
    references: [users.id],
  }),
}));

export const chatsRelations = relations(chats, ({ one, many }) => ({
  listing: one(listings, {
    fields: [chats.listingId],
    references: [listings.id],
  }),
  buyer: one(users, {
    fields: [chats.buyerId],
    references: [users.id],
  }),
  seller: one(users, {
    fields: [chats.sellerId],
    references: [users.id],
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  chat: one(chats, {
    fields: [messages.chatId],
    references: [chats.id],
  }),
}));

export const rentalReturnsRelations = relations(rentalReturns, ({ one }) => ({
  chat: one(chats, {
    fields: [rentalReturns.chatId],
    references: [chats.id],
  }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertListingSchema = createInsertSchema(listings).omit({ id: true, createdAt: true });
export const insertChatSchema = createInsertSchema(chats).omit({ id: true, createdAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });
export const insertRentalReturnSchema = createInsertSchema(rentalReturns).omit({ id: true, createdAt: true });

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Listing = typeof listings.$inferSelect;
export type InsertListing = z.infer<typeof insertListingSchema>;
export type Chat = typeof chats.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type RentalReturn = typeof rentalReturns.$inferSelect;
export type InsertRentalReturn = z.infer<typeof insertRentalReturnSchema>;
