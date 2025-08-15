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

    // Seed sample polls
    this.seedPolls();
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
