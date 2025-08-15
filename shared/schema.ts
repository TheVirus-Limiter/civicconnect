import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  preferredLanguage: text("preferred_language").default("en"),
  location: jsonb("location").$type<{
    city?: string;
    state?: string;
    district?: string;
    latitude?: number;
    longitude?: number;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bills = pgTable("bills", {
  id: varchar("id").primaryKey(),
  title: text("title").notNull(),
  summary: text("summary"),
  summaryEs: text("summary_es"),
  status: text("status").notNull(),
  billType: text("bill_type").notNull(),
  jurisdiction: text("jurisdiction").notNull(), // federal, state, local
  sponsor: text("sponsor"),
  introducedDate: timestamp("introduced_date"),
  lastAction: text("last_action"),
  lastActionDate: timestamp("last_action_date"),
  url: text("url"),
  categories: text("categories").array(),
  impactTags: text("impact_tags").array(),
  progress: jsonb("progress").$type<{
    introduced: boolean;
    committee: boolean;
    passed_house?: boolean;
    passed_senate?: boolean;
    signed?: boolean;
  }>(),
  votingHistory: jsonb("voting_history").$type<Array<{
    date: string;
    chamber: string;
    result: string;
    votes_for: number;
    votes_against: number;
  }>>(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const legislators = pgTable("legislators", {
  id: varchar("id").primaryKey(),
  name: text("name").notNull(),
  title: text("title").notNull(), // Rep., Sen., Mayor, etc.
  party: text("party"),
  state: text("state"),
  district: text("district"),
  office: text("office"),
  phone: text("phone"),
  email: text("email"),
  website: text("website"),
  imageUrl: text("image_url"),
  yearsInOffice: integer("years_in_office"),
  billsSponsored: integer("bills_sponsored").default(0),
  recentActivity: jsonb("recent_activity").$type<Array<{
    action: string;
    bill: string;
    date: string;
  }>>(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const newsArticles = pgTable("news_articles", {
  id: varchar("id").primaryKey(),
  title: text("title").notNull(),
  summary: text("summary"),
  content: text("content"),
  url: text("url").notNull(),
  source: text("source").notNull(),
  author: text("author"),
  publishedAt: timestamp("published_at"),
  imageUrl: text("image_url"),
  category: text("category"), // breaking, local, national, explainer
  relatedBills: text("related_bills").array(),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bookmarks = pgTable("bookmarks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  itemType: text("item_type").notNull(), // bill, legislator, article
  itemId: text("item_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatSessions = pgTable("chat_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  messages: jsonb("messages").$type<Array<{
    role: "user" | "assistant";
    content: string;
    timestamp: string;
    language?: string;
  }>>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const civicEvents = pgTable("civic_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  eventType: text("event_type").notNull(), // town_hall, hearing, committee_meeting, community_forum
  date: timestamp("date").notNull(),
  endDate: timestamp("end_date"),
  location: text("location").notNull(),
  address: text("address"),
  virtualUrl: text("virtual_url"),
  organizer: text("organizer").notNull(),
  organizerContact: text("organizer_contact"),
  level: text("level").notNull(), // federal, state, local
  maxAttendees: integer("max_attendees"),
  currentAttendees: integer("current_attendees").default(0),
  requiresRsvp: boolean("requires_rsvp").default(false),
  rsvpDeadline: timestamp("rsvp_deadline"),
  relatedBills: text("related_bills").array(),
  tags: text("tags").array(),
  status: text("status").default("scheduled"), // scheduled, cancelled, completed, rescheduled
  language: text("language").default("en"), // en, es, both
  accessibilityInfo: text("accessibility_info"),
  agenda: text("agenda"),
  livestreamUrl: text("livestream_url"),
  recordingUrl: text("recording_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const eventRsvps = pgTable("event_rsvps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").references(() => civicEvents.id).notNull(),
  userId: varchar("user_id").references(() => users.id),
  attendeeName: text("attendee_name").notNull(),
  attendeeEmail: text("attendee_email").notNull(),
  attendeePhone: text("attendee_phone"),
  preferredLanguage: text("preferred_language").default("en"),
  accessibilityNeeds: text("accessibility_needs"),
  questions: text("questions"),
  status: text("status").default("confirmed"), // confirmed, cancelled, waitlist
  reminderSent: boolean("reminder_sent").default(false),
  checkInTime: timestamp("check_in_time"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations for events and RSVPs
export const eventsRelations = relations(civicEvents, ({ many }) => ({
  rsvps: many(eventRsvps),
}));

export const rsvpsRelations = relations(eventRsvps, ({ one }) => ({
  event: one(civicEvents, {
    fields: [eventRsvps.eventId],
    references: [civicEvents.id],
  }),
  user: one(users, {
    fields: [eventRsvps.userId],
    references: [users.id],
  }),
}));

// Schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertBillSchema = createInsertSchema(bills).omit({
  updatedAt: true,
});

export const insertLegislatorSchema = createInsertSchema(legislators).omit({
  updatedAt: true,
});

export const insertNewsArticleSchema = createInsertSchema(newsArticles).omit({
  id: true,
  createdAt: true,
});

export const insertBookmarkSchema = createInsertSchema(bookmarks).omit({
  id: true,
  createdAt: true,
});

export const insertChatSessionSchema = createInsertSchema(chatSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCivicEventSchema = createInsertSchema(civicEvents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEventRsvpSchema = createInsertSchema(eventRsvps).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertBill = z.infer<typeof insertBillSchema>;
export type Bill = typeof bills.$inferSelect;
export type InsertLegislator = z.infer<typeof insertLegislatorSchema>;
export type Legislator = typeof legislators.$inferSelect;
export type InsertNewsArticle = z.infer<typeof insertNewsArticleSchema>;
export type NewsArticle = typeof newsArticles.$inferSelect;
export type InsertBookmark = z.infer<typeof insertBookmarkSchema>;
export type Bookmark = typeof bookmarks.$inferSelect;
export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;
export type ChatSession = typeof chatSessions.$inferSelect;
export type InsertCivicEvent = z.infer<typeof insertCivicEventSchema>;
export type CivicEvent = typeof civicEvents.$inferSelect;
export type InsertEventRsvp = z.infer<typeof insertEventRsvpSchema>;
export type EventRsvp = typeof eventRsvps.$inferSelect;
