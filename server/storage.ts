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
  type InsertCivicEvent,
  type Poll,
  type InsertPoll,
  type PollVote,
  type InsertPollVote,
  type FeedbackSubmission,
  type InsertFeedbackSubmission,
  type FeedbackVote,
  type InsertFeedbackVote,
  type FeedbackComment,
  type InsertFeedbackComment
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

  // Polls
  getPoll(id: string): Promise<Poll | undefined>;
  getPolls(params: {
    category?: string;
    location?: string;
    district?: string;
    isActive?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<Poll[]>;
  createPoll(poll: InsertPoll): Promise<Poll>;
  updatePoll(id: string, updates: Partial<Poll>): Promise<Poll | undefined>;
  deletePoll(id: string): Promise<void>;

  // Poll Votes
  createPollVote(vote: InsertPollVote): Promise<PollVote>;
  getUserPollVote(pollId: string, userId?: string, ipAddress?: string): Promise<PollVote | undefined>;
  getPollResults(pollId: string): Promise<{
    pollId: string;
    totalVotes: number;
    results: { optionIndex: number; count: number; percentage: number }[];
  }>;

  // Feedback Submissions
  getFeedbackSubmission(id: string): Promise<FeedbackSubmission | undefined>;
  getFeedbackSubmissions(params: {
    category?: string;
    status?: string;
    userId?: string;
    isPublic?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<FeedbackSubmission[]>;
  createFeedbackSubmission(feedback: InsertFeedbackSubmission): Promise<FeedbackSubmission>;
  updateFeedbackSubmission(id: string, updates: Partial<FeedbackSubmission>): Promise<FeedbackSubmission | undefined>;

  // Feedback Votes
  createFeedbackVote(vote: InsertFeedbackVote): Promise<FeedbackVote>;
  getUserFeedbackVote(feedbackId: string, userId?: string): Promise<FeedbackVote | undefined>;
  updateFeedbackVoteCount(feedbackId: string): Promise<void>;

  // Feedback Comments
  getFeedbackComments(feedbackId: string): Promise<FeedbackComment[]>;
  createFeedbackComment(comment: InsertFeedbackComment): Promise<FeedbackComment>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private bills: Map<string, Bill>;
  private legislators: Map<string, Legislator>;
  private newsArticles: Map<string, NewsArticle>;
  private bookmarks: Map<string, Bookmark>;
  private chatSessions: Map<string, ChatSession>;
  private civicEvents: Map<string, CivicEvent>;
  private polls: Map<string, Poll>;
  private pollVotes: Map<string, PollVote>;
  private feedbackSubmissions: Map<string, FeedbackSubmission>;
  private feedbackVotes: Map<string, FeedbackVote>;
  private feedbackComments: Map<string, FeedbackComment>;

  constructor() {
    this.users = new Map();
    this.bills = new Map();
    this.legislators = new Map();
    this.newsArticles = new Map();
    this.bookmarks = new Map();
    this.chatSessions = new Map();
    this.civicEvents = new Map();
    this.polls = new Map();
    this.pollVotes = new Map();
    this.feedbackSubmissions = new Map();
    this.feedbackVotes = new Map();
    this.feedbackComments = new Map();
    
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
    // Seed TX-23 legislators
    const sampleLegislators: Legislator[] = [
      {
        id: "rep-tx23",
        name: "Tony Gonzales",
        title: "Representative",
        party: "Republican",
        state: "TX",
        district: "23",
        office: "U.S. House of Representatives",
        phone: "(202) 225-4511",
        email: "tony.gonzales@mail.house.gov",
        website: "https://gonzales.house.gov",
        imageUrl: null,
        yearsInOffice: 4,
        billsSponsored: 27,
        recentActivity: [
          { action: "Voted Yes", bill: "Border Security Enhancement Act", date: "2025-08-12" },
          { action: "Sponsored", bill: "Rural Broadband Infrastructure Bill", date: "2025-08-08" }
        ],
        updatedAt: new Date(),
      },
      {
        id: "sen-cornyn",
        name: "John Cornyn",
        title: "Senator",
        party: "Republican",
        state: "TX",
        district: null,
        office: "U.S. Senate",
        phone: "(202) 224-2934",
        email: "john.cornyn@cornyn.senate.gov",
        website: "https://cornyn.senate.gov",
        imageUrl: null,
        yearsInOffice: 22,
        billsSponsored: 89,
        recentActivity: [
          { action: "Co-sponsored", bill: "Veterans Healthcare Expansion", date: "2025-08-10" },
          { action: "Voted Yes", bill: "Infrastructure Investment Act", date: "2025-08-06" }
        ],
        updatedAt: new Date(),
      },
      {
        id: "sen-cruz",
        name: "Ted Cruz",
        title: "Senator",
        party: "Republican",
        state: "TX",
        district: null,
        office: "U.S. Senate",
        phone: "(202) 224-5922",
        email: "ted.cruz@cruz.senate.gov",
        website: "https://cruz.senate.gov",
        imageUrl: null,
        yearsInOffice: 12,
        billsSponsored: 156,
        recentActivity: [
          { action: "Proposed", bill: "Energy Independence Act", date: "2025-08-13" },
          { action: "Voted No", bill: "Climate Action Framework", date: "2025-08-09" }
        ],
        updatedAt: new Date(),
      },
    ];

    sampleLegislators.forEach(legislator => {
      this.legislators.set(legislator.id, legislator);
    });

    // Seed San Antonio civic events for August 2025
    const sampleEvents: CivicEvent[] = [
      {
        id: "event-sa-council",
        title: "San Antonio City Council Meeting",
        description: "Regular city council meeting discussing budget allocation for public transportation improvements",
        eventType: "meeting",
        date: new Date("2025-08-21T18:00:00"), // Next Thursday
        location: "San Antonio City Hall, 100 Military Plaza",
        organizer: "San Antonio City Council",
        relatedBills: ["SA-2025-08"],
        url: "https://sanantonio.gov/meetings",
        createdAt: new Date(),
      },
      {
        id: "event-townhall-tx23",
        title: "Town Hall with Rep. Tony Gonzales",
        description: "Community town hall to discuss border security, veteran affairs, and upcoming legislation affecting TX-23",
        eventType: "town_hall",
        date: new Date("2025-08-28T19:00:00"), // Next Thursday evening
        location: "UTSA Downtown Campus, 501 W Cesar E Chavez Blvd",
        organizer: "Office of Rep. Tony Gonzales",
        relatedBills: ["HR-2025-234", "HR-2025-189"],
        url: "https://gonzales.house.gov/events",
        createdAt: new Date(),
      },
      {
        id: "event-voting-info",
        title: "Voter Registration Drive",
        description: "Register to vote and learn about upcoming local elections. Bilingual assistance available.",
        eventType: "public_event",
        date: new Date("2025-08-24T10:00:00"), // Saturday morning
        location: "Alamodome, 100 Montana St",
        organizer: "Bexar County Elections Department",
        relatedBills: null,
        url: "https://bexar.org/elections",
        createdAt: new Date(),
      },
      {
        id: "event-budget-hearing",
        title: "Public Budget Hearing",
        description: "Public hearing on the proposed 2026 San Antonio city budget. Public comment period included.",
        eventType: "hearing",
        date: new Date("2025-08-30T14:00:00"), // Following Saturday
        location: "San Antonio City Hall, Council Chambers",
        organizer: "San Antonio Budget Office",
        relatedBills: ["SA-2025-Budget"],
        url: "https://sanantonio.gov/budget",
        createdAt: new Date(),
      }
    ];

    sampleEvents.forEach(event => {
      this.civicEvents.set(event.id, event);
    });

    // Seed TX-23 relevant bills
    this.seedLocalBills();
    
    // Seed San Antonio/TX-23 news articles
    this.seedNewsArticles();
    
    // Seed sample polls
    this.seedPolls();
  }

  private seedLocalBills() {
    // Seed TX-23 and San Antonio relevant bills
    const localBills: Bill[] = [
      {
        id: "hr-2025-234",
        title: "Border Infrastructure Modernization Act",
        summary: "Comprehensive legislation to modernize border infrastructure along the Texas-Mexico border, including technology upgrades at ports of entry and additional staffing for border patrol.",
        status: "in_committee",
        jurisdiction: "federal",
        introducedDate: new Date("2025-07-15"),
        lastActionDate: new Date("2025-08-10"),
        sponsor: "Rep. Tony Gonzales (R-TX-23)",
        progress: {
          introduced: true,
          committee: true,
          passed_house: false,
          passed_senate: false,
          signed: false,
        },
        impactTags: ["border-security", "infrastructure", "texas"],
        aiSummary: "This bill focuses on upgrading border technology and increasing security personnel along the Texas-Mexico border.",
        isLocal: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "sa-2025-08",
        title: "San Antonio Public Transit Expansion",
        summary: "City ordinance to expand VIA Metropolitan Transit with new bus rapid transit lines connecting downtown to major employment centers and universities.",
        status: "active",
        jurisdiction: "local",
        introducedDate: new Date("2025-06-20"),
        lastActionDate: new Date("2025-08-12"),
        sponsor: "San Antonio City Council",
        progress: {
          introduced: true,
          committee: true,
          passed_house: false,
          passed_senate: false,
          signed: false,
        },
        impactTags: ["transportation", "public-transit", "san-antonio"],
        aiSummary: "Local initiative to improve public transportation connectivity across San Antonio with new BRT lines.",
        isLocal: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "hr-2025-189",
        title: "Veterans Healthcare Access Enhancement",
        summary: "Legislation to expand healthcare access for veterans in rural areas, including telemedicine services and mobile healthcare units.",
        status: "passed_house",
        jurisdiction: "federal",
        introducedDate: new Date("2025-05-03"),
        lastActionDate: new Date("2025-08-08"),
        sponsor: "Rep. Tony Gonzales (R-TX-23)",
        progress: {
          introduced: true,
          committee: true,
          passed_house: true,
          passed_senate: false,
          signed: false,
        },
        impactTags: ["veterans", "healthcare", "rural-access"],
        aiSummary: "Aims to improve healthcare accessibility for veterans in rural Texas communities through innovative delivery methods.",
        isLocal: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    localBills.forEach(bill => {
      this.bills.set(bill.id, bill);
    });
  }

  private seedNewsArticles() {
    // Seed San Antonio and TX-23 relevant news articles
    const newsArticles: NewsArticle[] = [
      {
        id: "news-border-infrastructure",
        title: "Rep. Gonzales Pushes for $2.1B Border Infrastructure Investment",
        summary: "Texas congressman Tony Gonzales introduces comprehensive border security legislation targeting technology upgrades and additional personnel along the Texas-Mexico border corridor.",
        content: "Representative Tony Gonzales (R-TX-23) announced his Border Infrastructure Modernization Act this week, calling for significant federal investment in border security technology and staffing. The legislation would allocate $2.1 billion over five years for upgraded surveillance systems, biometric processing capabilities, and 1,500 additional border patrol agents specifically for the Texas border region.",
        category: "breaking",
        source: "San Antonio Express-News",
        author: "Maria Rodriguez",
        url: "https://expressnews.com/border-infrastructure-2025",
        publishedAt: new Date("2025-08-14T10:30:00"),
        tags: ["border-security", "congress", "tx-23", "infrastructure"],
        imageUrl: null,
        createdAt: new Date("2025-08-14T10:30:00"),
        updatedAt: new Date("2025-08-14T10:30:00"),
      },
      {
        id: "news-sa-transit-expansion",
        title: "San Antonio City Council Approves VIA Transit Expansion",
        summary: "City council unanimously votes to expand public transportation with new bus rapid transit lines connecting downtown to UTSA and medical center districts.",
        content: "The San Antonio City Council voted 11-0 Thursday to approve a $180 million VIA Metropolitan Transit expansion plan. The project will create three new bus rapid transit (BRT) lines connecting downtown San Antonio to major employment centers including the Texas Medical Center, UTSA's main campus, and the Port San Antonio technology district. Construction is expected to begin in fall 2025 with the first line operational by 2027.",
        category: "local", 
        source: "KSAT 12",
        author: "James Patterson",
        url: "https://ksat.com/via-transit-expansion-2025",
        publishedAt: new Date("2025-08-13T18:45:00"),
        tags: ["transportation", "san-antonio", "public-transit", "city-council"],
        imageUrl: null,
        createdAt: new Date("2025-08-13T18:45:00"),
        updatedAt: new Date("2025-08-13T18:45:00"),
      },
      {
        id: "news-veterans-healthcare",
        title: "Rural Veterans Healthcare Bill Passes House Committee",
        summary: "Legislation co-sponsored by Rep. Gonzales to expand telemedicine and mobile health services for veterans in rural Texas communities advances to full House vote.",
        content: "The Veterans Healthcare Access Enhancement Act passed the House Veterans' Affairs Committee with bipartisan support Wednesday. Co-sponsored by Rep. Tony Gonzales (R-TX-23), the legislation would establish mobile healthcare units and expand telemedicine services for veterans living in rural areas. The bill specifically addresses healthcare access challenges in South Texas, where many veterans travel over 100 miles to reach the nearest VA facility.",
        category: "national",
        source: "Military Times",
        author: "Patricia Williams",
        url: "https://militarytimes.com/veterans-healthcare-rural-access",
        publishedAt: new Date("2025-08-12T14:20:00"),
        tags: ["veterans", "healthcare", "rural-access", "congress", "bipartisan"],
        imageUrl: null,
        createdAt: new Date("2025-08-12T14:20:00"),
        updatedAt: new Date("2025-08-12T14:20:00"),
      },
      {
        id: "news-alamodome-renovation",
        title: "Alamodome Renovation Project Gets $85M City Approval",
        summary: "San Antonio approves major renovation of the Alamodome to improve accessibility, modernize facilities, and attract major sporting events and concerts.",
        content: "The San Antonio City Council approved an $85 million renovation plan for the Alamodome on Thursday, aimed at modernizing the 32-year-old venue and making it more competitive for major events. The project includes upgraded audio-visual systems, improved accessibility features, expanded concourses, and energy-efficient lighting. City officials expect the renovations to attract more NCAA tournament games, major concerts, and potentially position San Antonio for future Super Bowl consideration.",
        category: "local",
        source: "San Antonio Current",
        author: "Carlos Mendez",
        url: "https://sacurrent.com/alamodome-renovation-2025",
        publishedAt: new Date("2025-08-11T16:15:00"),
        tags: ["alamodome", "san-antonio", "renovation", "sports", "entertainment"],
        imageUrl: null,
        createdAt: new Date("2025-08-11T16:15:00"),
        updatedAt: new Date("2025-08-11T16:15:00"),
      },
      {
        id: "news-energy-independence",
        title: "Texas Energy Independence Act Gains Senate Support",
        summary: "Senator Ted Cruz's energy legislation receives bipartisan backing as Texas leads nation in renewable energy production alongside traditional oil and gas sectors.",
        content: "Senator Ted Cruz's Energy Independence Act gained momentum in the Senate Energy Committee this week, with three Democratic senators joining Republican supporters. The legislation aims to reduce federal regulations on energy production while incentivizing both traditional and renewable energy development. Texas currently leads the nation in wind energy production and ranks second in solar capacity, while maintaining its position as the top oil and natural gas producer.",
        category: "national",
        source: "Houston Chronicle",
        author: "Rebecca Thompson",
        url: "https://houstonchronicle.com/energy-independence-act-2025",
        publishedAt: new Date("2025-08-10T12:00:00"),
        tags: ["energy", "texas", "renewable", "oil-gas", "senate", "bipartisan"],
        imageUrl: null,
        createdAt: new Date("2025-08-10T12:00:00"),
        updatedAt: new Date("2025-08-10T12:00:00"),
      }
    ];

    newsArticles.forEach(article => {
      this.newsArticles.set(article.id, article);
    });
  }

  // Polls
  async getPoll(id: string): Promise<Poll | undefined> {
    return this.polls.get(id);
  }

  async getPolls(params: {
    category?: string;
    location?: string;
    district?: string;
    isActive?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<Poll[]> {
    let polls = Array.from(this.polls.values());
    
    if (params.category) {
      polls = polls.filter(poll => poll.category === params.category);
    }
    if (params.location) {
      polls = polls.filter(poll => poll.location === params.location);
    }
    if (params.district) {
      polls = polls.filter(poll => poll.district === params.district);
    }
    if (params.isActive !== undefined) {
      polls = polls.filter(poll => poll.isActive === params.isActive);
    }

    // Sort by creation date, newest first
    polls.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    const offset = params.offset || 0;
    const limit = params.limit || 20;
    return polls.slice(offset, offset + limit);
  }

  async createPoll(insertPoll: InsertPoll): Promise<Poll> {
    const id = randomUUID();
    const poll: Poll = {
      ...insertPoll,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      description: insertPoll.description || null,
      district: insertPoll.district || null,
      location: insertPoll.location || null,
      createdBy: insertPoll.createdBy || null,
      endDate: insertPoll.endDate || null
    };
    this.polls.set(id, poll);
    return poll;
  }

  async updatePoll(id: string, updates: Partial<Poll>): Promise<Poll | undefined> {
    const poll = this.polls.get(id);
    if (!poll) return undefined;
    
    const updatedPoll = { ...poll, ...updates, updatedAt: new Date() };
    this.polls.set(id, updatedPoll);
    return updatedPoll;
  }

  async deletePoll(id: string): Promise<void> {
    this.polls.delete(id);
    // Also delete all votes for this poll
    Array.from(this.pollVotes.values())
      .filter(vote => vote.pollId === id)
      .forEach(vote => this.pollVotes.delete(vote.id));
  }

  // Poll Votes
  async createPollVote(insertVote: InsertPollVote): Promise<PollVote> {
    const id = randomUUID();
    const vote: PollVote = {
      ...insertVote,
      id,
      createdAt: new Date(),
      userId: insertVote.userId || null,
      ipAddress: insertVote.ipAddress || null,
      userAgent: insertVote.userAgent || null
    };
    this.pollVotes.set(id, vote);
    return vote;
  }

  async getUserPollVote(pollId: string, userId?: string, ipAddress?: string): Promise<PollVote | undefined> {
    return Array.from(this.pollVotes.values()).find(vote => {
      if (vote.pollId !== pollId) return false;
      if (userId && vote.userId === userId) return true;
      if (!userId && ipAddress && vote.ipAddress === ipAddress) return true;
      return false;
    });
  }

  async getPollResults(pollId: string): Promise<{
    pollId: string;
    totalVotes: number;
    results: { optionIndex: number; count: number; percentage: number }[];
  }> {
    const votes = Array.from(this.pollVotes.values()).filter(vote => vote.pollId === pollId);
    const poll = await this.getPoll(pollId);
    
    if (!poll) {
      return { pollId, totalVotes: 0, results: [] };
    }

    const optionCounts = new Map<number, number>();
    let totalVotes = 0;

    votes.forEach(vote => {
      vote.selectedOptions.forEach(optionIndex => {
        optionCounts.set(optionIndex, (optionCounts.get(optionIndex) || 0) + 1);
        totalVotes++;
      });
    });

    const results = poll.options.map((_, index) => {
      const count = optionCounts.get(index) || 0;
      const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
      return { optionIndex: index, count, percentage };
    });

    return { pollId, totalVotes, results };
  }

  // Feedback Submissions
  async getFeedbackSubmission(id: string): Promise<FeedbackSubmission | undefined> {
    return this.feedbackSubmissions.get(id);
  }

  async getFeedbackSubmissions(params: {
    category?: string;
    status?: string;
    userId?: string;
    isPublic?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<FeedbackSubmission[]> {
    let submissions = Array.from(this.feedbackSubmissions.values());
    
    if (params.category) {
      submissions = submissions.filter(sub => sub.category === params.category);
    }
    if (params.status) {
      submissions = submissions.filter(sub => sub.status === params.status);
    }
    if (params.userId) {
      submissions = submissions.filter(sub => sub.userId === params.userId);
    }
    if (params.isPublic !== undefined) {
      submissions = submissions.filter(sub => sub.isPublic === params.isPublic);
    }

    // Sort by creation date, newest first
    submissions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    const offset = params.offset || 0;
    const limit = params.limit || 20;
    return submissions.slice(offset, offset + limit);
  }

  async createFeedbackSubmission(insertFeedback: InsertFeedbackSubmission): Promise<FeedbackSubmission> {
    const id = randomUUID();
    const feedback: FeedbackSubmission = {
      ...insertFeedback,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      relatedBillId: insertFeedback.relatedBillId || null,
      relatedPollId: insertFeedback.relatedPollId || null,
      userId: insertFeedback.userId || null,
      userEmail: insertFeedback.userEmail || null,
      tags: insertFeedback.tags || null,
      adminResponse: insertFeedback.adminResponse || null,
      respondedAt: insertFeedback.respondedAt || null
    };
    this.feedbackSubmissions.set(id, feedback);
    return feedback;
  }

  async updateFeedbackSubmission(id: string, updates: Partial<FeedbackSubmission>): Promise<FeedbackSubmission | undefined> {
    const feedback = this.feedbackSubmissions.get(id);
    if (!feedback) return undefined;
    
    const updatedFeedback = { ...feedback, ...updates, updatedAt: new Date() };
    this.feedbackSubmissions.set(id, updatedFeedback);
    return updatedFeedback;
  }

  // Feedback Votes
  async createFeedbackVote(insertVote: InsertFeedbackVote): Promise<FeedbackVote> {
    const id = randomUUID();
    const vote: FeedbackVote = {
      ...insertVote,
      id,
      createdAt: new Date(),
      userId: insertVote.userId || null,
      ipAddress: insertVote.ipAddress || null
    };
    this.feedbackVotes.set(id, vote);
    await this.updateFeedbackVoteCount(insertVote.feedbackId);
    return vote;
  }

  async getUserFeedbackVote(feedbackId: string, userId?: string): Promise<FeedbackVote | undefined> {
    return Array.from(this.feedbackVotes.values()).find(vote => 
      vote.feedbackId === feedbackId && vote.userId === userId
    );
  }

  async updateFeedbackVoteCount(feedbackId: string): Promise<void> {
    const votes = Array.from(this.feedbackVotes.values()).filter(vote => vote.feedbackId === feedbackId);
    const upvotes = votes.filter(vote => vote.voteType === 'upvote').length;
    const downvotes = votes.filter(vote => vote.voteType === 'downvote').length;
    
    const feedback = this.feedbackSubmissions.get(feedbackId);
    if (feedback) {
      const updatedFeedback = { ...feedback, upvotes, downvotes, updatedAt: new Date() };
      this.feedbackSubmissions.set(feedbackId, updatedFeedback);
    }
  }

  // Feedback Comments
  async getFeedbackComments(feedbackId: string): Promise<FeedbackComment[]> {
    const comments = Array.from(this.feedbackComments.values())
      .filter(comment => comment.feedbackId === feedbackId);
    
    // Sort by creation date, oldest first for threaded display
    comments.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    return comments;
  }

  async createFeedbackComment(insertComment: InsertFeedbackComment): Promise<FeedbackComment> {
    const id = randomUUID();
    const comment: FeedbackComment = {
      ...insertComment,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: insertComment.userId || null,
      parentCommentId: insertComment.parentCommentId || null
    };
    this.feedbackComments.set(id, comment);
    return comment;
  }

  private seedPolls() {
    // Sample community polls
    const samplePolls: Poll[] = [
      {
        id: "poll-healthcare",
        title: "Healthcare Access in TX-23",
        description: "What is your biggest concern about healthcare access in our district?",
        options: [
          "Cost of prescription medications",
          "Lack of specialists in rural areas", 
          "Long wait times for appointments",
          "Limited mental health services",
          "Hospital closures"
        ],
        category: "local",
        district: "TX-23",
        location: "San Antonio, TX",
        createdBy: null,
        isActive: true,
        allowMultipleChoice: false,
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        id: "poll-infrastructure", 
        title: "Infrastructure Priorities",
        description: "Which infrastructure improvements should be prioritized in our community?",
        options: [
          "Road and bridge repairs",
          "Public transportation expansion",
          "Broadband internet access",
          "Water and sewage systems",
          "Green energy projects"
        ],
        category: "local",
        district: "TX-23",
        location: "San Antonio, TX",
        createdBy: null,
        isActive: true,
        allowMultipleChoice: true,
        endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 3 weeks from now
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
      {
        id: "poll-border-security",
        title: "Border Security Approaches",
        description: "What approach to border security do you think would be most effective?",
        options: [
          "Increased physical barriers and walls",
          "Enhanced technology and surveillance",
          "More border patrol agents",
          "Comprehensive immigration reform",
          "Focus on legal pathways for immigration"
        ],
        category: "national",
        district: "TX-23",
        location: "Texas Border Region",
        createdBy: null,
        isActive: true,
        allowMultipleChoice: false,
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      }
    ];

    samplePolls.forEach(poll => {
      this.polls.set(poll.id, poll);
    });

    // Sample feedback submissions
    const sampleFeedback: FeedbackSubmission[] = [
      {
        id: "feedback-transportation",
        title: "Public Transit Concerns",
        content: "The bus routes in our area are inadequate and unreliable. Many residents cannot get to work or medical appointments without a car. We need more frequent service and expanded routes.",
        category: "general",
        relatedBillId: null,
        relatedPollId: "poll-infrastructure",
        userId: null,
        userEmail: "concerned.citizen@example.com",
        status: "pending",
        priority: "medium",
        tags: ["transportation", "public-transit", "accessibility"],
        upvotes: 12,
        downvotes: 2,
        isPublic: true,
        adminResponse: null,
        respondedAt: null,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        id: "feedback-education",
        title: "School Funding Inequity",
        content: "Schools in rural parts of TX-23 are severely underfunded compared to urban areas. This creates an unfair disadvantage for our children's education and future opportunities.",
        category: "feature_request",
        relatedBillId: null,
        relatedPollId: null,
        userId: null,
        userEmail: "parent.advocate@example.com",
        status: "reviewed",
        priority: "high",
        tags: ["education", "funding", "rural", "equity"],
        upvotes: 25,
        downvotes: 3,
        isPublic: true,
        adminResponse: "Thank you for raising this important issue. We are currently working with the Texas Education Agency to address funding disparities and will provide updates as we make progress.",
        respondedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      }
    ];

    sampleFeedback.forEach(feedback => {
      this.feedbackSubmissions.set(feedback.id, feedback);
    });
  }
}

export const storage = new MemStorage();
