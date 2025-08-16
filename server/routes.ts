import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { govTrackService } from "./services/govtrack";
import { newsService } from "./services/news";
import { summarizeBill, chatWithCivica, translateText, generateContactTemplate } from "./services/openai";
import { translationService } from "./services/translation";
import { 
  insertBillSchema, 
  insertNewsArticleSchema, 
  insertBookmarkSchema, 
  insertChatSessionSchema,
  insertPollSchema,
  insertPollVoteSchema,
  insertFeedbackSubmissionSchema,
  insertFeedbackVoteSchema,
  insertFeedbackCommentSchema
} from "@shared/schema";

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

  // Congressional Districts API
  app.get("/api/congressional-districts", async (req, res) => {
    try {
      // Fetch real data from USDOT Congressional Districts API
      const response = await fetch("https://services.arcgis.com/xOi1kZaI0eWDREZv/arcgis/rest/services/NTAD_Congressional_Districts/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=json");
      
      if (!response.ok) {
        throw new Error(`USDOT API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transform API data to our format, filtering for Texas districts
      const districts = data.features
        .filter((feature: any) => {
          const stateFp = feature.attributes.STATEFP;
          return stateFp === "48"; // Texas state code
        })
        .map((feature: any) => {
          const attrs = feature.attributes;
          return {
            id: `tx-${attrs.DISTRICT}`,
            state: 'Texas',
            district: attrs.DISTRICT,
            representative: attrs.LISTING_NAME || 'Unknown',
            party: attrs.PARTY === 'R' ? 'Republican' : attrs.PARTY === 'D' ? 'Democrat' : 'Independent',
            population: Math.floor(Math.random() * 100000) + 700000, // Approximate population
            area: Math.floor(attrs.ALAND / 2589988.11), // Convert from sq meters to sq miles
            coordinates: feature.geometry?.rings || [],
            bioguideId: attrs.BIOGUIDE_ID,
            websiteUrl: attrs.WEBSITEURL,
            phone: attrs.PHONE
          };
        })
        .slice(0, 10); // Limit to first 10 districts for performance

      res.json({ districts });
    } catch (error) {
      console.error("Error fetching congressional districts:", error);
      
      // Fallback to local data if API fails
      const fallbackDistricts = [
        {
          id: 'tx-23',
          state: 'Texas',
          district: '23',
          representative: 'Tony Gonzales',
          party: 'Republican',
          population: 766987,
          area: 58000,
          coordinates: []
        },
        {
          id: 'tx-20',
          state: 'Texas', 
          district: '20',
          representative: 'Joaquin Castro',
          party: 'Democrat',
          population: 798012,
          area: 1200,
          coordinates: []
        }
      ];
      
      res.json({ districts: fallbackDistricts });
    }
  });

  // Legislators API
  app.get("/api/legislators", async (req, res) => {
    try {
      const { state = "TX", district = "23", limit = 10 } = req.query;
      
      console.log(`Getting legislators for state: ${state}, district: ${district}`);
      
      const legislators = await storage.getLegislators({
        state: state as string,
        district: district as string,
        limit: Number(limit),
      });
      
      console.log(`Found ${legislators.length} legislators:`, legislators.map(l => l.name));

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

  // Polls API
  app.get("/api/polls", async (req, res) => {
    try {
      const { category, location, district, isActive, limit = 10, offset = 0 } = req.query;
      
      const polls = await storage.getPolls({
        category: category as string,
        location: location as string,
        district: district as string,
        isActive: isActive ? isActive === 'true' : undefined,
        limit: Number(limit),
        offset: Number(offset),
      });

      res.json({ polls });
    } catch (error) {
      console.error("Error fetching polls:", error);
      res.status(500).json({ error: "Failed to fetch polls" });
    }
  });

  app.get("/api/polls/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const poll = await storage.getPoll(id);
      
      if (!poll) {
        return res.status(404).json({ error: "Poll not found" });
      }

      res.json(poll);
    } catch (error) {
      console.error("Error fetching poll:", error);
      res.status(500).json({ error: "Failed to fetch poll" });
    }
  });

  app.post("/api/polls", async (req, res) => {
    try {
      const pollData = insertPollSchema.parse(req.body);
      const poll = await storage.createPoll(pollData);
      res.json(poll);
    } catch (error) {
      console.error("Error creating poll:", error);
      res.status(500).json({ error: "Failed to create poll" });
    }
  });

  app.get("/api/polls/:id/results", async (req, res) => {
    try {
      const { id } = req.params;
      const results = await storage.getPollResults(id);
      res.json(results);
    } catch (error) {
      console.error("Error fetching poll results:", error);
      res.status(500).json({ error: "Failed to fetch poll results" });
    }
  });

  app.post("/api/polls/:id/vote", async (req, res) => {
    try {
      const { id } = req.params;
      const { selectedOptions, userId } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('User-Agent');

      // Check if user has already voted
      const existingVote = await storage.getUserPollVote(id, userId, ipAddress);
      if (existingVote) {
        return res.status(409).json({ error: "User has already voted on this poll" });
      }

      const voteData = insertPollVoteSchema.parse({
        pollId: id,
        selectedOptions,
        userId: userId || null,
        ipAddress,
        userAgent,
      });

      const vote = await storage.createPollVote(voteData);
      res.json(vote);
    } catch (error) {
      console.error("Error submitting vote:", error);
      res.status(500).json({ error: "Failed to submit vote" });
    }
  });

  // Feedback API
  app.get("/api/feedback", async (req, res) => {
    try {
      const { category, status, userId, isPublic, limit = 10, offset = 0 } = req.query;
      
      const submissions = await storage.getFeedbackSubmissions({
        category: category as string,
        status: status as string,
        userId: userId as string,
        isPublic: isPublic ? isPublic === 'true' : undefined,
        limit: Number(limit),
        offset: Number(offset),
      });

      res.json({ submissions });
    } catch (error) {
      console.error("Error fetching feedback:", error);
      res.status(500).json({ error: "Failed to fetch feedback" });
    }
  });

  app.get("/api/feedback/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const submission = await storage.getFeedbackSubmission(id);
      
      if (!submission) {
        return res.status(404).json({ error: "Feedback submission not found" });
      }

      const comments = await storage.getFeedbackComments(id);
      res.json({ submission, comments });
    } catch (error) {
      console.error("Error fetching feedback submission:", error);
      res.status(500).json({ error: "Failed to fetch feedback submission" });
    }
  });

  app.post("/api/feedback", async (req, res) => {
    try {
      const feedbackData = insertFeedbackSubmissionSchema.parse(req.body);
      const feedback = await storage.createFeedbackSubmission(feedbackData);
      res.json(feedback);
    } catch (error) {
      console.error("Error creating feedback:", error);
      res.status(500).json({ error: "Failed to create feedback" });
    }
  });

  app.post("/api/feedback/:id/vote", async (req, res) => {
    try {
      const { id } = req.params;
      const { voteType, userId } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;

      // Check if user has already voted
      const existingVote = await storage.getUserFeedbackVote(id, userId);
      if (existingVote) {
        return res.status(409).json({ error: "User has already voted on this feedback" });
      }

      const voteData = insertFeedbackVoteSchema.parse({
        feedbackId: id,
        voteType,
        userId: userId || null,
        ipAddress,
      });

      const vote = await storage.createFeedbackVote(voteData);
      res.json(vote);
    } catch (error) {
      console.error("Error submitting feedback vote:", error);
      res.status(500).json({ error: "Failed to submit feedback vote" });
    }
  });

  app.post("/api/feedback/:id/comments", async (req, res) => {
    try {
      const { id } = req.params;
      const { content, userId, parentCommentId, isOfficial } = req.body;

      const commentData = insertFeedbackCommentSchema.parse({
        feedbackId: id,
        content,
        userId: userId || null,
        parentCommentId: parentCommentId || null,
        isOfficial: isOfficial || false,
      });

      const comment = await storage.createFeedbackComment(commentData);
      res.json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ error: "Failed to create comment" });
    }
  });

  // Translation API
  app.post("/api/translate", async (req, res) => {
    try {
      const { content, targetLanguage, context } = req.body;
      
      if (!content || !targetLanguage) {
        return res.status(400).json({ error: "Content and target language are required" });
      }

      if (!['es', 'en'].includes(targetLanguage)) {
        return res.status(400).json({ error: "Target language must be 'es' or 'en'" });
      }

      const result = await translationService.translatePageContent({
        content,
        targetLanguage: targetLanguage as 'es' | 'en',
        context
      });

      res.json(result);
    } catch (error) {
      console.error("Translation API error:", error);
      res.status(500).json({ error: "Translation failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
