import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertListingSchema, insertUserSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage_multer = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage: storage_multer });

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Auth Routes (Disabled - using default user for MVP)
  // app.post(api.auth.register.path, ...);
  // app.post(api.auth.login.path, ...);

  // Listings Routes
  app.get(api.listings.list.path, async (req, res) => {
    const filters = req.query as { category?: string; search?: string };
    const listings = await storage.getListings(filters);
    res.json(listings);
  });

  app.get(api.listings.get.path, async (req, res) => {
    const listing = await storage.getListing(Number(req.params.id));
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    res.json(listing);
  });

  app.post(api.listings.create.path, async (req, res) => {
    try {
      const input = api.listings.create.input.parse(req.body);
      const listing = await storage.createListing(input);
      res.status(201).json(listing);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.patch(api.listings.update.path, async (req, res) => {
    const listing = await storage.updateListing(Number(req.params.id), req.body);
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    res.json(listing);
  });

  // Chats Routes
  app.get(api.chats.list.path, async (req, res) => {
    // Expect userId in query for MVP simplicity
    const userId = Number(req.query.userId);
    if (!userId) return res.status(400).json({ message: "userId required" });
    const chats = await storage.getChats(userId);
    res.json(chats);
  });

  app.post(api.chats.create.path, async (req, res) => {
    try {
      const { listingId, buyerId } = req.body;
      
      if (!listingId || !buyerId) {
        return res.status(400).json({ message: "listingId and buyerId required" });
      }
      
      const buyerIdNum = Number(buyerId);
      if (isNaN(buyerIdNum)) {
        return res.status(400).json({ message: "buyerId must be a valid number" });
      }
      
      const listing = await storage.getListing(Number(listingId));
      if (!listing) return res.status(404).json({ message: "Listing not found" });
      
      // Check if chat exists
      let chat = await storage.getChat(Number(listingId), buyerIdNum);
      if (!chat) {
        chat = await storage.createChat(Number(listingId), buyerIdNum, listing.sellerId);
      }
      
      res.status(201).json(chat);
    } catch (err) {
      console.error("Error creating chat:", err);
      res.status(500).json({ message: "Error creating chat" });
    }
  });

  app.get(api.chats.getMessages.path, async (req, res) => {
    const messages = await storage.getMessages(Number(req.params.id));
    res.json(messages);
  });

  app.post(api.chats.sendMessage.path, async (req, res) => {
    try {
      const { content, senderId } = req.body;
      
      if (!content || !senderId) {
        return res.status(400).json({ message: "content and senderId required" });
      }
      
      const senderIdNum = Number(senderId);
      if (isNaN(senderIdNum)) {
        return res.status(400).json({ message: "senderId must be a valid number" });
      }
      
      const message = await storage.createMessage({
        chatId: Number(req.params.id),
        senderId: senderIdNum,
        content
      });
      res.status(201).json(message);
    } catch (err) {
      console.error("Error sending message:", err);
      res.status(500).json({ message: "Error sending message" });
    }
  });

  // File Upload Endpoint (Images, PDFs, Videos)
  app.post("/api/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const url = `/uploads/${req.file.filename}`;
    res.json({ url });
  });

  // Seed Data
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  // Seed is disabled - users will create their own listings with real images
}
