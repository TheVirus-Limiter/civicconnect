import { 
  type User, 
  type InsertUser, 
  type Bill, 
  type InsertBill,
  type Legislator,
  type InsertLegislator,
  type NewsArticle,
  type InsertNewsArticle,
  type Bookmark,
  type InsertBookmark,
  type ChatSession,
  type InsertChatSession,
  type CivicEvent,
  type InsertCivicEvent
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Bills
  getBill(id: string): Promise<Bill | undefined>;
  getBills(params: {
    query?: string;
    status?: string;
    jurisdiction?: string;
    limit?: number;
    offset?: number;
  }): Promise<Bill[]>;
  upsertBill(bill: Bill): Promise<Bill>;
  updateBill(id: string, updates: Partial<Bill>): Promise<Bill | undefined>;

  // Legislators
  getLegislator(id: string): Promise<Legislator | undefined>;
  getLegislators(params: {
    state?: string;
    district?: string;
    limit?: number;
  }): Promise<Legislator[]>;
  upsertLegislator(legislator: Legislator): Promise<Legislator>;

  // News Articles
  getNewsArticle(id: string): Promise<NewsArticle | undefined>;
  getNewsArticles(params: {
    category?: string;
    limit?: number;
  }): Promise<NewsArticle[]>;
  upsertNewsArticle(article: NewsArticle): Promise<NewsArticle>;

  // Bookmarks
  createBookmark(bookmark: InsertBookmark): Promise<Bookmark>;
  getUserBookmarks(userId: string): Promise<Bookmark[]>;
  deleteBookmark(id: string): Promise<void>;

  // Chat Sessions
  getChatSession(id: string): Promise<ChatSession | undefined>;
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  updateChatSession(id: string, updates: Partial<ChatSession>): Promise<ChatSession | undefined>;

  // Civic Events
  getCivicEvents(params: {
    location?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<CivicEvent[]>;
  createCivicEvent(event: InsertCivicEvent): Promise<CivicEvent>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private bills: Map<string, Bill>;
  private legislators: Map<string, Legislator>;
  private newsArticles: Map<string, NewsArticle>;
  private bookmarks: Map<string, Bookmark>;
  private chatSessions: Map<string, ChatSession>;
  private civicEvents: Map<string, CivicEvent>;

  constructor() {
    this.users = new Map();
    this.bills = new Map();
    this.legislators = new Map();
    this.newsArticles = new Map();
    this.bookmarks = new Map();
    this.chatSessions = new Map();
    this.civicEvents = new Map();
    
    this.seedData();
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date(),
      email: insertUser.email || null,
      preferredLanguage: insertUser.preferredLanguage || null,
      location: insertUser.location || null
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Bills
  async getBill(id: string): Promise<Bill | undefined> {
    return this.bills.get(id);
  }

  async getBills(params: {
    query?: string;
    status?: string;
    jurisdiction?: string;
    limit?: number;
    offset?: number;
  }): Promise<Bill[]> {
    let bills = Array.from(this.bills.values());

    if (params.query) {
      const query = params.query.toLowerCase();
      bills = bills.filter(bill => 
        bill.title.toLowerCase().includes(query) ||
        bill.summary?.toLowerCase().includes(query) ||
        bill.sponsor?.toLowerCase().includes(query)
      );
    }

    if (params.status) {
      bills = bills.filter(bill => bill.status === params.status);
    }

    if (params.jurisdiction) {
      bills = bills.filter(bill => bill.jurisdiction === params.jurisdiction);
    }

    // Sort by most recent
    bills.sort((a, b) => {
      const dateA = a.lastActionDate || a.introducedDate || new Date(0);
      const dateB = b.lastActionDate || b.introducedDate || new Date(0);
      return dateB.getTime() - dateA.getTime();
    });

    const offset = params.offset || 0;
    const limit = params.limit || 20;
    return bills.slice(offset, offset + limit);
  }

  async upsertBill(bill: Bill): Promise<Bill> {
    this.bills.set(bill.id, bill);
    return bill;
  }

  async updateBill(id: string, updates: Partial<Bill>): Promise<Bill | undefined> {
    const bill = this.bills.get(id);
    if (!bill) return undefined;
    
    const updatedBill = { ...bill, ...updates, updatedAt: new Date() };
    this.bills.set(id, updatedBill);
    return updatedBill;
  }

  // Legislators
  async getLegislator(id: string): Promise<Legislator | undefined> {
    return this.legislators.get(id);
  }

  async getLegislators(params: {
    state?: string;
    district?: string;
    limit?: number;
  }): Promise<Legislator[]> {
    let legislators = Array.from(this.legislators.values());

    if (params.state) {
      legislators = legislators.filter(leg => leg.state === params.state);
    }

    if (params.district) {
      legislators = legislators.filter(leg => leg.district === params.district);
    }

    const limit = params.limit || 10;
    return legislators.slice(0, limit);
  }

  async upsertLegislator(legislator: Legislator): Promise<Legislator> {
    this.legislators.set(legislator.id, legislator);
    return legislator;
  }

  // News Articles
  async getNewsArticle(id: string): Promise<NewsArticle | undefined> {
    return this.newsArticles.get(id);
  }

  async getNewsArticles(params: {
    category?: string;
    limit?: number;
  }): Promise<NewsArticle[]> {
    let articles = Array.from(this.newsArticles.values());

    if (params.category) {
      articles = articles.filter(article => article.category === params.category);
    }

    articles.sort((a, b) => {
      const dateA = a.publishedAt || a.createdAt || new Date(0);
      const dateB = b.publishedAt || b.createdAt || new Date(0);
      return dateB.getTime() - dateA.getTime();
    });

    const limit = params.limit || 20;
    return articles.slice(0, limit);
  }

  async upsertNewsArticle(article: NewsArticle): Promise<NewsArticle> {
    this.newsArticles.set(article.id, article);
    return article;
  }

  // Bookmarks
  async createBookmark(insertBookmark: InsertBookmark): Promise<Bookmark> {
    const id = randomUUID();
    const bookmark: Bookmark = {
      ...insertBookmark,
      id,
      createdAt: new Date(),
    };
    this.bookmarks.set(id, bookmark);
    return bookmark;
  }

  async getUserBookmarks(userId: string): Promise<Bookmark[]> {
    return Array.from(this.bookmarks.values())
      .filter(bookmark => bookmark.userId === userId)
      .sort((a, b) => {
        const aTime = a.createdAt?.getTime() || 0;
        const bTime = b.createdAt?.getTime() || 0;
        return bTime - aTime;
      });
  }

  async deleteBookmark(id: string): Promise<void> {
    this.bookmarks.delete(id);
  }

  // Chat Sessions
  async getChatSession(id: string): Promise<ChatSession | undefined> {
    return this.chatSessions.get(id);
  }

  async createChatSession(insertSession: InsertChatSession): Promise<ChatSession> {
    const id = randomUUID();
    const session: ChatSession = {
      ...insertSession,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: insertSession.userId || null,
      messages: insertSession.messages || null
    };
    this.chatSessions.set(id, session);
    return session;
  }

  async updateChatSession(id: string, updates: Partial<ChatSession>): Promise<ChatSession | undefined> {
    const session = this.chatSessions.get(id);
    if (!session) return undefined;
    
    const updatedSession = { ...session, ...updates, updatedAt: new Date() };
    this.chatSessions.set(id, updatedSession);
    return updatedSession;
  }

  // Civic Events
  async getCivicEvents(params: {
    location?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<CivicEvent[]> {
    let events = Array.from(this.civicEvents.values());

    if (params.location) {
      events = events.filter(event => 
        event.location?.toLowerCase().includes(params.location!.toLowerCase())
      );
    }

    if (params.startDate) {
      events = events.filter(event => event.date >= params.startDate!);
    }

    if (params.endDate) {
      events = events.filter(event => event.date <= params.endDate!);
    }

    events.sort((a, b) => a.date.getTime() - b.date.getTime());

    const limit = params.limit || 20;
    return events.slice(0, limit);
  }

  async createCivicEvent(insertEvent: InsertCivicEvent): Promise<CivicEvent> {
    const id = randomUUID();
    const event: CivicEvent = {
      ...insertEvent,
      id,
      createdAt: new Date(),
      description: insertEvent.description || null,
      url: insertEvent.url || null,
      location: insertEvent.location || null,
      organizer: insertEvent.organizer || null,
      relatedBills: insertEvent.relatedBills || null
    };
    this.civicEvents.set(id, event);
    return event;
  }

  private seedData() {
    // Seed some sample legislators
    const sampleLegislators: Legislator[] = [
      {
        id: "rep-pelosi",
        name: "Nancy Pelosi",
        title: "Representative",
        party: "Democratic",
        state: "CA",
        district: "11",
        office: "U.S. House of Representatives",
        phone: "(202) 225-4965",
        email: "sf.nancy@mail.house.gov",
        website: "https://pelosi.house.gov",
        imageUrl: null,
        yearsInOffice: 37,
        billsSponsored: 23,
        recentActivity: [
          { action: "Voted Yes", bill: "Clean Energy Infrastructure Act", date: "2024-08-10" },
          { action: "Sponsored", bill: "Student Loan Relief Amendment", date: "2024-08-05" }
        ],
        updatedAt: new Date(),
      },
      {
        id: "sen-feinstein",
        name: "Dianne Feinstein",
        title: "Senator",
        party: "Democratic",
        state: "CA",
        district: null,
        office: "U.S. Senate",
        phone: "(202) 224-3841",
        email: "senator@feinstein.senate.gov",
        website: "https://feinstein.senate.gov",
        imageUrl: null,
        yearsInOffice: 31,
        billsSponsored: 45,
        recentActivity: [
          { action: "Co-sponsored", bill: "Climate Action Framework", date: "2024-08-12" },
          { action: "Voted No", bill: "Tax Reform Amendment", date: "2024-08-08" }
        ],
        updatedAt: new Date(),
      },
      {
        id: "mayor-breed",
        name: "London Breed",
        title: "Mayor",
        party: "Democratic",
        state: "CA",
        district: null,
        office: "Mayor of San Francisco",
        phone: "(415) 554-6141",
        email: "mayor@sfgov.org",
        website: "https://sf.gov/mayor",
        imageUrl: null,
        yearsInOffice: 6,
        billsSponsored: 12,
        recentActivity: [
          { action: "Proposed", bill: "Housing Affordability Initiative", date: "2024-08-13" },
          { action: "Signed", bill: "Public Transit Expansion Plan", date: "2024-08-11" }
        ],
        updatedAt: new Date(),
      },
    ];

    sampleLegislators.forEach(legislator => {
      this.legislators.set(legislator.id, legislator);
    });

    // Seed a sample civic event
    const sampleEvent: CivicEvent = {
      id: "event-city-council",
      title: "City Council Meeting",
      description: "Monthly city council meeting discussing the housing ordinance",
      eventType: "meeting",
      date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      location: "San Francisco City Hall",
      organizer: "San Francisco City Council",
      relatedBills: ["SF-2024-12"],
      url: "https://sf.gov/meetings",
      createdAt: new Date(),
    };

    this.civicEvents.set(sampleEvent.id, sampleEvent);
  }
}

export const storage = new MemStorage();
