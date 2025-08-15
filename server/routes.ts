import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { govTrackService } from "./services/govtrack";
import { newsService } from "./services/news";
import { summarizeBill, chatWithCivica, translateText, generateContactTemplate } from "./services/openai";
import { insertBillSchema, insertNewsArticleSchema, insertBookmarkSchema, insertChatSessionSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Bills API
  app.get("/api/bills", async (req, res) => {
    try {
      const { query, status, jurisdiction, limit = 20, offset = 0 } = req.query;
      
      let bills;
      let total = 0;

      if (jurisdiction === "federal" || !jurisdiction) {
        const govTrackResult = await govTrackService.searchBills({
          query: query as string,
          status: status as string,
          limit: Number(limit),
          offset: Number(offset),
        });
        bills = govTrackResult.bills;
        total = govTrackResult.total;

        // Store bills in local storage for caching
        for (const bill of bills) {
          await storage.upsertBill(bill);
        }
      } else {
        // Get from local storage for state/local bills
        bills = await storage.getBills({
          query: query as string,
          status: status as string,
          jurisdiction: jurisdiction as string,
          limit: Number(limit),
          offset: Number(offset),
        });
        total = bills.length;
      }

      res.json({ bills, total });
    } catch (error) {
      console.error("Error fetching bills:", error);
      res.status(500).json({ error: "Failed to fetch bills" });
    }
  });

  app.get("/api/bills/:id", async (req, res) => {
    try {
      const { id } = req.params;
      let bill = await storage.getBill(id);

      if (!bill && id.startsWith("govtrack-")) {
        // Try to fetch from GovTrack
        const govTrackId = id.replace("govtrack-", "");
        const fetchedBill = await govTrackService.getBillById(govTrackId);
        if (fetchedBill) {
          bill = fetchedBill;
          await storage.upsertBill(bill);
        }
      }

      if (!bill) {
        return res.status(404).json({ error: "Bill not found" });
      }

      res.json(bill);
    } catch (error) {
      console.error("Error fetching bill:", error);
      res.status(500).json({ error: "Failed to fetch bill" });
    }
  });

  app.post("/api/bills/:id/summarize", async (req, res) => {
    try {
      const { id } = req.params;
      const { language = "en" } = req.body;

      const bill = await storage.getBill(id);
      if (!bill) {
        return res.status(404).json({ error: "Bill not found" });
      }

      const summary = await summarizeBill(bill.summary || bill.title, language);
      
      // Update bill with AI summary
      if (language === "es" && summary.summary) {
        await storage.updateBill(id, { summaryEs: summary.summary });
      }

      res.json(summary);
    } catch (error) {
      console.error("Error summarizing bill:", error);
      res.status(500).json({ error: "Failed to summarize bill" });
    }
  });

  // News API
  app.get("/api/news", async (req, res) => {
    try {
      const { query, category, pageSize = 20, page = 1 } = req.query;

      let result;
      if (category === "local") {
        const articles = await newsService.getLocalNews("San Antonio, Texas");
        result = { articles, total: articles.length };
      } else if (category === "explainer") {
        const articles = await newsService.getExplainerNews();
        result = { articles, total: articles.length };
      } else {
        result = await newsService.searchCivicNews({
          query: query as string,
          category: category as string,
          pageSize: Number(pageSize),
          page: Number(page),
        });
      }

      // Store articles in local storage
      for (const article of result.articles) {
        await storage.upsertNewsArticle(article);
      }

      res.json(result);
    } catch (error) {
      console.error("Error fetching news:", error);
      res.status(500).json({ error: "Failed to fetch news" });
    }
  });

  app.get("/api/news/breaking", async (req, res) => {
    try {
      const articles = await newsService.getBreakingNews();
      
      for (const article of articles) {
        await storage.upsertNewsArticle(article);
      }

      res.json({ articles });
    } catch (error) {
      console.error("Error fetching breaking news:", error);
      res.status(500).json({ error: "Failed to fetch breaking news" });
    }
  });

  app.get("/api/news/local", async (req, res) => {
    try {
      const { location = "San Antonio, Texas" } = req.query;

      const articles = await newsService.getLocalNews(location as string);
      
      for (const article of articles) {
        await storage.upsertNewsArticle(article);
      }

      res.json({ articles });
    } catch (error) {
      console.error("Error fetching local news:", error);
      res.status(500).json({ error: "Failed to fetch local news" });
    }
  });

  // Legislators API
  app.get("/api/legislators", async (req, res) => {
    try {
      const { state, district, limit = 10 } = req.query;
      
      const legislators = await storage.getLegislators({
        state: state as string,
        district: district as string,
        limit: Number(limit),
      });

      res.json({ legislators });
    } catch (error) {
      console.error("Error fetching legislators:", error);
      res.status(500).json({ error: "Failed to fetch legislators" });
    }
  });

  // Chat API
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, context = "", language = "en", sessionId } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const response = await chatWithCivica(message, context, language);

      // Store chat session
      if (sessionId) {
        const session = await storage.getChatSession(sessionId);
        const messages = session?.messages || [];
        
        messages.push(
          { role: "user", content: message, timestamp: new Date().toISOString(), language },
          { role: "assistant", content: response.response, timestamp: new Date().toISOString(), language }
        );

        await storage.updateChatSession(sessionId, { messages });
      }

      res.json(response);
    } catch (error) {
      console.error("Error in chat:", error);
      res.status(500).json({ error: "Failed to process chat message" });
    }
  });

  app.post("/api/chat/sessions", async (req, res) => {
    try {
      const { userId } = req.body;
      
      const session = await storage.createChatSession({
        userId: userId || null,
        messages: [],
      });

      res.json(session);
    } catch (error) {
      console.error("Error creating chat session:", error);
      res.status(500).json({ error: "Failed to create chat session" });
    }
  });

  // Translation API
  app.post("/api/translate", async (req, res) => {
    try {
      const { text, targetLanguage } = req.body;

      if (!text || !targetLanguage) {
        return res.status(400).json({ error: "Text and target language are required" });
      }

      const translatedText = await translateText(text, targetLanguage);
      res.json({ translatedText });
    } catch (error) {
      console.error("Error translating text:", error);
      res.status(500).json({ error: "Failed to translate text" });
    }
  });

  // Contact Templates API
  app.post("/api/contact-template", async (req, res) => {
    try {
      const { billTitle, position = "support", language = "en" } = req.body;

      if (!billTitle) {
        return res.status(400).json({ error: "Bill title is required" });
      }

      const template = await generateContactTemplate(billTitle, position, language);
      res.json({ template });
    } catch (error) {
      console.error("Error generating contact template:", error);
      res.status(500).json({ error: "Failed to generate contact template" });
    }
  });

  // Bookmarks API
  app.post("/api/bookmarks", async (req, res) => {
    try {
      const bookmarkData = insertBookmarkSchema.parse(req.body);
      const bookmark = await storage.createBookmark(bookmarkData);
      res.json(bookmark);
    } catch (error) {
      console.error("Error creating bookmark:", error);
      res.status(500).json({ error: "Failed to create bookmark" });
    }
  });

  app.get("/api/bookmarks/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const bookmarks = await storage.getUserBookmarks(userId);
      res.json({ bookmarks });
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
      res.status(500).json({ error: "Failed to fetch bookmarks" });
    }
  });

  app.delete("/api/bookmarks/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteBookmark(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting bookmark:", error);
      res.status(500).json({ error: "Failed to delete bookmark" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
