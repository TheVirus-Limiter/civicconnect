import { Bill } from "@shared/schema";

interface GovTrackBill {
  id: number;
  title: string;
  summary: string;
  introduced_date: string;
  current_status: string;
  current_status_date: string;
  sponsor: {
    name: string;
  };
  bill_type: string;
  number: string;
  congress: number;
  link: string;
  subjects: string[];
  major_actions: Array<{
    datetime: string;
    description: string;
  }>;
}

interface GovTrackResponse {
  objects: GovTrackBill[];
  meta: {
    total_count: number;
    offset: number;
    limit: number;
  };
}

export class GovTrackService {
  private baseUrl = "https://www.govtrack.us/api/v2";

  async searchBills(params: {
    query?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ bills: Bill[]; total: number }> {
    try {
      const searchParams = new URLSearchParams({
        format: "json",
        limit: (params.limit || 20).toString(),
        offset: (params.offset || 0).toString(),
      });

      if (params.query) {
        searchParams.append("q", params.query);
      }

      if (params.status) {
        searchParams.append("current_status", params.status);
      }

      const response = await fetch(
        `${this.baseUrl}/bill?${searchParams.toString()}`
      );

      if (!response.ok) {
        throw new Error(`GovTrack API error: ${response.statusText}`);
      }

      const data: GovTrackResponse = await response.json();

      const bills: Bill[] = data.objects.map(this.transformGovTrackBill);

      return {
        bills,
        total: data.meta.total_count,
      };
    } catch (error) {
      console.error("Error fetching bills from GovTrack:", error);
      return { bills: [], total: 0 };
    }
  }

  async getBillById(billId: string): Promise<Bill | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/bill/${billId}?format=json`
      );

      if (!response.ok) {
        throw new Error(`GovTrack API error: ${response.statusText}`);
      }

      const data: GovTrackBill = await response.json();
      return this.transformGovTrackBill(data);
    } catch (error) {
      console.error("Error fetching bill from GovTrack:", error);
      return null;
    }
  }

  async getRecentBills(limit: number = 20): Promise<Bill[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/bill?format=json&limit=${limit}&order_by=-introduced_date`
      );

      if (!response.ok) {
        throw new Error(`GovTrack API error: ${response.statusText}`);
      }

      const data: GovTrackResponse = await response.json();
      return data.objects.map(this.transformGovTrackBill);
    } catch (error) {
      console.error("Error fetching recent bills from GovTrack:", error);
      return [];
    }
  }

  private transformGovTrackBill(govTrackBill: GovTrackBill): Bill {
    const billNumber = `${govTrackBill.bill_type} ${govTrackBill.number}`;
    
    // Determine progress based on status
    const progress = {
      introduced: true,
      committee: govTrackBill.current_status.includes("committee") || 
                govTrackBill.current_status.includes("referred"),
      passed_house: govTrackBill.current_status.includes("passed_house") ||
                   govTrackBill.current_status.includes("passed:house"),
      passed_senate: govTrackBill.current_status.includes("passed_senate") ||
                    govTrackBill.current_status.includes("passed:senate"),
      signed: govTrackBill.current_status.includes("enacted") ||
             govTrackBill.current_status.includes("signed"),
    };

    // Map subjects to impact tags
    const impactTags = govTrackBill.subjects?.slice(0, 5) || [];

    return {
      id: `govtrack-${govTrackBill.id}`,
      title: govTrackBill.title,
      summary: govTrackBill.summary || "",
      summaryEs: null,
      status: this.mapStatus(govTrackBill.current_status),
      billType: govTrackBill.bill_type,
      jurisdiction: "federal",
      sponsor: govTrackBill.sponsor?.name || "",
      introducedDate: new Date(govTrackBill.introduced_date),
      lastAction: govTrackBill.current_status,
      lastActionDate: new Date(govTrackBill.current_status_date),
      url: govTrackBill.link,
      categories: govTrackBill.subjects || [],
      impactTags,
      progress,
      votingHistory: [],
      updatedAt: new Date(),
    };
  }

  private mapStatus(govTrackStatus: string): string {
    const statusMap: Record<string, string> = {
      "introduced": "introduced",
      "referred": "in_committee",
      "reported": "in_committee", 
      "passed_house": "passed_house",
      "passed_senate": "passed_senate",
      "enacted": "signed",
      "vetoed": "vetoed",
      "failed": "failed",
    };

    for (const [key, value] of Object.entries(statusMap)) {
      if (govTrackStatus.toLowerCase().includes(key)) {
        return value;
      }
    }

    return "active";
  }
}

export const govTrackService = new GovTrackService();
