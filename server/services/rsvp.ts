import type { EventRsvp, InsertEventRsvp } from "@shared/schema";

export interface RsvpCreateParams {
  eventId: string;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone?: string;
  preferredLanguage?: string;
  accessibilityNeeds?: string;
  questions?: string;
  userId?: string;
}

export interface RsvpUpdateParams {
  status?: "confirmed" | "cancelled" | "waitlist";
  accessibilityNeeds?: string;
  questions?: string;
}

export class RsvpService {
  private rsvps: Map<string, EventRsvp> = new Map();
  private eventAttendeeCount: Map<string, number> = new Map();

  // Create a new RSVP
  async createRsvp(params: RsvpCreateParams): Promise<EventRsvp> {
    const id = `rsvp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const rsvp: EventRsvp = {
      id,
      eventId: params.eventId,
      userId: params.userId || null,
      attendeeName: params.attendeeName,
      attendeeEmail: params.attendeeEmail,
      attendeePhone: params.attendeePhone || null,
      preferredLanguage: params.preferredLanguage || "en",
      accessibilityNeeds: params.accessibilityNeeds || null,
      questions: params.questions || null,
      status: "confirmed",
      reminderSent: false,
      checkInTime: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.rsvps.set(id, rsvp);
    
    // Update attendee count
    const currentCount = this.eventAttendeeCount.get(params.eventId) || 0;
    this.eventAttendeeCount.set(params.eventId, currentCount + 1);

    return rsvp;
  }

  // Get RSVP by ID
  async getRsvpById(id: string): Promise<EventRsvp | null> {
    return this.rsvps.get(id) || null;
  }

  // Get RSVPs for an event
  async getRsvpsForEvent(eventId: string): Promise<EventRsvp[]> {
    return Array.from(this.rsvps.values()).filter(rsvp => 
      rsvp.eventId === eventId && rsvp.status === "confirmed"
    );
  }

  // Get RSVPs for a user
  async getRsvpsForUser(userId: string): Promise<EventRsvp[]> {
    return Array.from(this.rsvps.values()).filter(rsvp => rsvp.userId === userId);
  }

  // Update RSVP
  async updateRsvp(id: string, params: RsvpUpdateParams): Promise<EventRsvp | null> {
    const rsvp = this.rsvps.get(id);
    if (!rsvp) return null;

    const updatedRsvp: EventRsvp = {
      ...rsvp,
      ...params,
      updatedAt: new Date(),
    };

    this.rsvps.set(id, updatedRsvp);

    // Update attendee count if status changed
    if (params.status && params.status !== rsvp.status) {
      const currentCount = this.eventAttendeeCount.get(rsvp.eventId) || 0;
      
      if (rsvp.status === "confirmed" && params.status !== "confirmed") {
        // Someone cancelled or went to waitlist
        this.eventAttendeeCount.set(rsvp.eventId, Math.max(0, currentCount - 1));
      } else if (rsvp.status !== "confirmed" && params.status === "confirmed") {
        // Someone confirmed
        this.eventAttendeeCount.set(rsvp.eventId, currentCount + 1);
      }
    }

    return updatedRsvp;
  }

  // Cancel RSVP
  async cancelRsvp(id: string): Promise<boolean> {
    const result = await this.updateRsvp(id, { status: "cancelled" });
    return result !== null;
  }

  // Get attendee count for an event
  async getAttendeeCount(eventId: string): Promise<number> {
    return this.eventAttendeeCount.get(eventId) || 0;
  }

  // Check if event is full
  async isEventFull(eventId: string, maxAttendees: number): Promise<boolean> {
    const currentCount = await this.getAttendeeCount(eventId);
    return currentCount >= maxAttendees;
  }

  // Get RSVP by email and event
  async getRsvpByEmailAndEvent(email: string, eventId: string): Promise<EventRsvp | null> {
    return Array.from(this.rsvps.values()).find(rsvp => 
      rsvp.attendeeEmail === email && rsvp.eventId === eventId
    ) || null;
  }

  // Send reminder emails (mock implementation)
  async sendReminders(eventId: string): Promise<number> {
    const rsvps = await this.getRsvpsForEvent(eventId);
    let sent = 0;

    for (const rsvp of rsvps) {
      if (!rsvp.reminderSent) {
        // Mock sending email reminder
        console.log(`Sending reminder to ${rsvp.attendeeEmail} for event ${eventId}`);
        
        // Update reminder status
        await this.updateRsvp(rsvp.id, { status: rsvp.status });
        const updatedRsvp = this.rsvps.get(rsvp.id);
        if (updatedRsvp) {
          updatedRsvp.reminderSent = true;
          this.rsvps.set(rsvp.id, updatedRsvp);
        }
        
        sent++;
      }
    }

    return sent;
  }

  // Check in attendee
  async checkInAttendee(rsvpId: string): Promise<boolean> {
    const rsvp = this.rsvps.get(rsvpId);
    if (!rsvp) return false;

    const updatedRsvp: EventRsvp = {
      ...rsvp,
      checkInTime: new Date(),
      updatedAt: new Date(),
    };

    this.rsvps.set(rsvpId, updatedRsvp);
    return true;
  }
}

export const rsvpService = new RsvpService();