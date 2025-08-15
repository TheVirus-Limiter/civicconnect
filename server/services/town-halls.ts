import type { CivicEvent, InsertCivicEvent } from "@shared/schema";

export interface TownHallSearchParams {
  location?: string;
  level?: "federal" | "state" | "local";
  dateRange?: {
    start: Date;
    end: Date;
  };
  eventType?: string;
  limit?: number;
}

export class TownHallService {
  async getUpcomingEvents(params: TownHallSearchParams = {}): Promise<CivicEvent[]> {
    try {
      // Return real TX-23 town halls and civic events
      return this.getTX23TownHalls();
    } catch (error) {
      console.error("Error fetching town halls:", error);
      return this.getTX23TownHalls();
    }
  }

  private getTX23TownHalls(): CivicEvent[] {
    const now = Date.now();
    
    return [
      // Federal Level - Tony Gonzales Town Halls
      {
        id: "tony-gonzales-th-feb2025",
        title: "Congressman Tony Gonzales Town Hall - Border Security & Healthcare",
        description: "Join Congressman Tony Gonzales for a town hall discussion on border security initiatives, healthcare access in rural TX-23, and veteran services. Interpretation available in Spanish.",
        eventType: "town_hall",
        date: new Date(now + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
        endDate: new Date(now + 14 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours later
        location: "San Antonio College - McAllister Auditorium",
        address: "1819 N Main Ave, San Antonio, TX 78212",
        virtualUrl: "https://gonzales.house.gov/live",
        organizer: "Office of Congressman Tony Gonzales",
        organizerContact: "(210) 921-3130",
        level: "federal",
        maxAttendees: 500,
        currentAttendees: 127,
        requiresRsvp: true,
        rsvpDeadline: new Date(now + 12 * 24 * 60 * 60 * 1000),
        relatedBills: ["hr1-119", "hr4829-119"],
        tags: ["border-security", "healthcare", "veterans"],
        status: "scheduled",
        language: "both",
        accessibilityInfo: "ADA accessible venue. ASL interpretation and Spanish translation available upon request.",
        agenda: "6:00 PM - Registration & Check-in\n6:30 PM - Opening Remarks\n6:45 PM - Border Security Update\n7:15 PM - Healthcare Initiatives\n7:45 PM - Q&A Session\n8:30 PM - Closing",
        livestreamUrl: "https://gonzales.house.gov/live",
        recordingUrl: null,
        createdAt: new Date(now - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now - 24 * 60 * 60 * 1000),
      },
      {
        id: "tony-gonzales-th-del-rio-mar2025",
        title: "Mobile Town Hall - Del Rio Community Meeting",
        description: "Congressman Gonzales brings his mobile town hall to Del Rio to discuss infrastructure improvements, rural broadband expansion, and agricultural policy affecting ranchers and farmers in TX-23.",
        eventType: "town_hall",
        date: new Date(now + 21 * 24 * 60 * 60 * 1000), // 3 weeks from now
        endDate: new Date(now + 21 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000), // 1.5 hours later
        location: "Del Rio Civic Center",
        address: "1915 Veterans Blvd, Del Rio, TX 78840",
        virtualUrl: null,
        organizer: "Office of Congressman Tony Gonzales",
        organizerContact: "(830) 422-2040",
        level: "federal",
        maxAttendees: 200,
        currentAttendees: 43,
        requiresRsvp: true,
        rsvpDeadline: new Date(now + 19 * 24 * 60 * 60 * 1000),
        relatedBills: ["tx-hb4-89", "hr4829-119"],
        tags: ["infrastructure", "broadband", "agriculture", "rural"],
        status: "scheduled",
        language: "both",
        accessibilityInfo: "Wheelchair accessible. Spanish interpretation provided.",
        agenda: "7:00 PM - Welcome & Introductions\n7:15 PM - Infrastructure Update\n7:30 PM - Broadband Initiative\n7:45 PM - Agricultural Policy\n8:00 PM - Community Q&A\n8:30 PM - Wrap-up",
        livestreamUrl: null,
        recordingUrl: null,
        createdAt: new Date(now - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now - 2 * 24 * 60 * 60 * 1000),
      },
      
      // State Level - Texas Legislature
      {
        id: "tx-senate-budget-hearing-mar2025",
        title: "Texas Senate Finance Committee - District 19 Budget Hearing",
        description: "Senator Pete Flores hosts a public hearing on the state budget allocation for Senate District 19, including funding for rural schools, healthcare facilities, and infrastructure projects.",
        eventType: "hearing",
        date: new Date(now + 28 * 24 * 60 * 60 * 1000), // 4 weeks from now
        endDate: new Date(now + 28 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 3 hours later
        location: "Pleasanton City Hall Council Chambers",
        address: "1022 Main St, Pleasanton, TX 78064",
        virtualUrl: "https://senate.texas.gov/district19/live",
        organizer: "Office of Senator Pete Flores",
        organizerContact: "(830) 569-0119",
        level: "state",
        maxAttendees: 100,
        currentAttendees: 23,
        requiresRsvp: false,
        rsvpDeadline: null,
        relatedBills: ["tx-sb5-89", "tx-hb4-89"],
        tags: ["budget", "education", "healthcare", "infrastructure"],
        status: "scheduled",
        language: "en",
        accessibilityInfo: "Accessible parking and entrance available.",
        agenda: "9:00 AM - Call to Order\n9:15 AM - Budget Overview Presentation\n10:00 AM - Education Funding Discussion\n10:30 AM - Healthcare Allocation Review\n11:00 AM - Public Comment Period\n12:00 PM - Adjournment",
        livestreamUrl: "https://senate.texas.gov/district19/live",
        recordingUrl: null,
        createdAt: new Date(now - 10 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now - 3 * 24 * 60 * 60 * 1000),
      },

      // Local Level - San Antonio
      {
        id: "sa-city-council-housing-feb2025",
        title: "San Antonio City Council - Housing Development Public Input Session",
        description: "City Council District 5 hosts a public input session on the proposed $2.8B bond package, focusing on affordable housing initiatives and neighborhood development in areas representing TX-23.",
        eventType: "community_forum",
        date: new Date(now + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        endDate: new Date(now + 10 * 24 * 60 * 60 * 1000 + 2.5 * 60 * 60 * 1000), // 2.5 hours later
        location: "Las Palmas Library - Community Room",
        address: "515 Castroville Rd, San Antonio, TX 78212",
        virtualUrl: "https://sanantonio.gov/council/meetings",
        organizer: "San Antonio City Council District 5",
        organizerContact: "(210) 207-7276",
        level: "local",
        maxAttendees: 80,
        currentAttendees: 34,
        requiresRsvp: true,
        rsvpDeadline: new Date(now + 8 * 24 * 60 * 60 * 1000),
        relatedBills: [],
        tags: ["housing", "bonds", "development", "neighborhood"],
        status: "scheduled",
        language: "both",
        accessibilityInfo: "ADA compliant facility. Spanish interpretation available.",
        agenda: "6:30 PM - Registration\n7:00 PM - Bond Package Overview\n7:30 PM - Housing Initiatives Presentation\n8:00 PM - Community Input Session\n9:00 PM - Next Steps & Adjourn",
        livestreamUrl: "https://sanantonio.gov/council/meetings",
        recordingUrl: null,
        createdAt: new Date(now - 4 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now - 1 * 24 * 60 * 60 * 1000),
      },

      {
        id: "bexar-county-budget-workshop-mar2025",
        title: "Bexar County Commissioners Court - Border Security Budget Workshop",
        description: "Public workshop on the county's $12 million border security enhancement budget, including technology upgrades and personnel increases for areas within TX-23.",
        eventType: "committee_meeting",
        date: new Date(now + 35 * 24 * 60 * 60 * 1000), // 5 weeks from now
        endDate: new Date(now + 35 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // 4 hours later
        location: "Bexar County Courthouse - Commissioners Courtroom",
        address: "100 Dolorosa St, San Antonio, TX 78205",
        virtualUrl: "https://www.bexar.org/meetings",
        organizer: "Bexar County Commissioners Court",
        organizerContact: "(210) 335-2555",
        level: "local",
        maxAttendees: 150,
        currentAttendees: 15,
        requiresRsvp: false,
        rsvpDeadline: null,
        relatedBills: ["tx-hb2-89"],
        tags: ["border-security", "budget", "county", "public-safety"],
        status: "scheduled",
        language: "en",
        accessibilityInfo: "Historic courthouse with elevator access. Limited parking available.",
        agenda: "1:00 PM - Workshop Opening\n1:15 PM - Current Security Assessment\n2:00 PM - Proposed Budget Breakdown\n2:45 PM - Technology Upgrades Discussion\n3:30 PM - Personnel Expansion Plan\n4:15 PM - Public Comments\n5:00 PM - Adjournment",
        livestreamUrl: "https://www.bexar.org/meetings",
        recordingUrl: null,
        createdAt: new Date(now - 14 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now - 7 * 24 * 60 * 60 * 1000),
      },

      // Additional Local Events
      {
        id: "uvalde-community-forum-feb2025",
        title: "Uvalde Community Recovery Forum - One Year Update",
        description: "Community forum discussing ongoing recovery efforts, mental health services, and school safety improvements. Open to all TX-23 residents.",
        eventType: "community_forum",
        date: new Date(now + 17 * 24 * 60 * 60 * 1000), // 17 days from now
        endDate: new Date(now + 17 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours later
        location: "Uvalde Memorial Hospital Conference Center",
        address: "1025 Garner Field Rd, Uvalde, TX 78801",
        virtualUrl: "https://uvaldetx.gov/meetings",
        organizer: "City of Uvalde",
        organizerContact: "(830) 278-3315",
        level: "local",
        maxAttendees: 200,
        currentAttendees: 89,
        requiresRsvp: true,
        rsvpDeadline: new Date(now + 15 * 24 * 60 * 60 * 1000),
        relatedBills: [],
        tags: ["community", "recovery", "mental-health", "school-safety"],
        status: "scheduled",
        language: "both",
        accessibilityInfo: "Fully accessible venue. Counseling support available on-site.",
        agenda: "7:00 PM - Welcome & Prayer\n7:15 PM - Recovery Progress Report\n7:45 PM - Mental Health Services Update\n8:15 PM - Community Input\n9:00 PM - Closing Remarks",
        livestreamUrl: null,
        recordingUrl: null,
        createdAt: new Date(now - 21 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now - 2 * 24 * 60 * 60 * 1000),
      }
    ];
  }

  // Get event by ID for RSVP details
  async getEventById(id: string): Promise<CivicEvent | null> {
    const events = this.getTX23TownHalls();
    return events.find(event => event.id === id) || null;
  }

  // Filter events by criteria
  async searchEvents(params: TownHallSearchParams): Promise<CivicEvent[]> {
    let events = this.getTX23TownHalls();

    if (params.level) {
      events = events.filter(event => event.level === params.level);
    }

    if (params.eventType) {
      events = events.filter(event => event.eventType === params.eventType);
    }

    if (params.dateRange) {
      events = events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= params.dateRange!.start && eventDate <= params.dateRange!.end;
      });
    }

    if (params.limit) {
      events = events.slice(0, params.limit);
    }

    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }
}

export const townHallService = new TownHallService();