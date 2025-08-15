import type { Legislator } from "@shared/schema";

export interface LegislatorSearchParams {
  location?: string;
  level?: "federal" | "state" | "local";
  limit?: number;
}

export class LegislatorService {
  private baseUrl = "https://www.govtrack.us/api/v2";

  async searchLegislators(params: LegislatorSearchParams = {}): Promise<Legislator[]> {
    try {
      // For TX-23, we'll return the actual representatives
      return this.getTX23Representatives();
    } catch (error) {
      console.error("Error fetching legislators:", error);
      return this.getTX23Representatives();
    }
  }

  private getTX23Representatives(): Legislator[] {
    return [
      // Federal Representatives
      {
        id: "tony-gonzales-tx23",
        name: "Tony Gonzales",
        title: "U.S. Representative",
        party: "Republican",
        district: "TX-23",
        state: "Texas",
        office: "1408 Longworth House Office Building",
        phone: "(202) 225-4511",
        email: "tony.gonzales@mail.house.gov",
        website: "https://tonygonzales.house.gov",
        imageUrl: "https://www.congress.gov/img/member/G000594_200.jpg",
        biography: "Tony Gonzales represents Texas's 23rd congressional district, which stretches from San Antonio to El Paso along the border. He serves on the House Armed Services and Appropriations Committees, focusing on border security, military affairs, and rural healthcare.",
        socialMedia: JSON.stringify({
          twitter: "@RepTonyGonzales",
          facebook: "RepTonyGonzales"
        }),
        updatedAt: new Date()
      },
      // U.S. Senators (represent entire state but relevant to TX-23)
      {
        id: "john-cornyn-tx",
        name: "John Cornyn",
        title: "U.S. Senator",
        party: "Republican", 
        district: null,
        state: "Texas",
        office: "517 Hart Senate Office Building",
        phone: "(202) 224-2934",
        email: "john.cornyn@cornyn.senate.gov",
        website: "https://www.cornyn.senate.gov",
        imageUrl: "https://www.congress.gov/img/member/C001056_200.jpg",
        biography: "John Cornyn has served as U.S. Senator from Texas since 2002. He previously served as Texas Attorney General and on the Texas Supreme Court. He focuses on border security, tax policy, and judicial issues.",
        socialMedia: JSON.stringify({
          twitter: "@JohnCornyn",
          facebook: "JohnCornyn"
        }),
        updatedAt: new Date()
      },
      {
        id: "ted-cruz-tx",
        name: "Ted Cruz",
        title: "U.S. Senator", 
        party: "Republican",
        district: null,
        state: "Texas",
        office: "404 Russell Senate Office Building",
        phone: "(202) 224-5922",
        email: "ted.cruz@cruz.senate.gov",
        website: "https://www.cruz.senate.gov",
        imageUrl: "https://www.congress.gov/img/member/C001098_200.jpg",
        biography: "Ted Cruz has served as U.S. Senator from Texas since 2013. He previously served as Solicitor General of Texas and ran for President in 2016. He focuses on constitutional issues, foreign policy, and limited government.",
        socialMedia: JSON.stringify({
          twitter: "@SenTedCruz",
          facebook: "SenatorTedCruz"
        }),
        updatedAt: new Date()
      },
      // Texas State Officials relevant to TX-23 area
      {
        id: "greg-abbott-tx",
        name: "Greg Abbott",
        title: "Governor",
        party: "Republican",
        district: null,
        state: "Texas", 
        office: "Office of the Governor, P.O. Box 12428",
        phone: "(512) 463-2000",
        email: "greg.abbott@gov.texas.gov",
        website: "https://gov.texas.gov",
        imageUrl: "https://gov.texas.gov/uploads/images/press/Greg_Abbott_Official_2019.jpg",
        biography: "Greg Abbott has served as the 48th Governor of Texas since 2015. He previously served as Texas Attorney General for 12 years and on the Texas Supreme Court. He focuses on border security, economic development, and conservative governance.",
        socialMedia: JSON.stringify({
          twitter: "@GovAbbott",
          facebook: "TexasGovernor"
        }),
        updatedAt: new Date()
      },
      // Local San Antonio Officials
      {
        id: "ron-nirenberg-sa",
        name: "Ron Nirenberg",
        title: "Mayor",
        party: "Nonpartisan",
        district: null,
        state: "Texas",
        office: "114 W. Commerce St., San Antonio, TX 78205",
        phone: "(210) 207-7060",
        email: "mayor@sanantonio.gov",
        website: "https://www.sanantonio.gov/Mayor",
        imageUrl: null,
        biography: "Ron Nirenberg has served as Mayor of San Antonio since 2017. He previously served on the San Antonio City Council and worked in media and nonprofit sectors. He focuses on economic development, infrastructure, and quality of life issues.",
        socialMedia: JSON.stringify({
          twitter: "@RonNirenberg",
          facebook: "MayorRonNirenberg"
        }),
        updatedAt: new Date()
      },
      // Texas State Legislature - District 19 (covers part of TX-23)
      {
        id: "pete-flores-tx19",
        name: "Pete Flores",
        title: "Texas State Senator",
        party: "Republican",
        district: "SD-19",
        state: "Texas",
        office: "P.O. Box 12068, Austin, TX 78711",
        phone: "(512) 463-0119",
        email: "pete.flores@senate.texas.gov",
        website: "https://senate.texas.gov/member.php?d=19",
        imageUrl: null,
        biography: "Pete Flores represents Texas Senate District 19, which includes parts of the TX-23 area. He focuses on education, healthcare, and rural issues affecting South Texas communities.",
        socialMedia: JSON.stringify({
          twitter: "@PeteFloresSD19"
        }),
        updatedAt: new Date()
      }
    ];
  }

  async getLegislatorById(id: string): Promise<Legislator | null> {
    const legislators = await this.searchLegislators();
    return legislators.find(leg => leg.id === id) || null;
  }

  async getLegislatorsByLocation(location: string): Promise<Legislator[]> {
    // For TX-23/San Antonio, return all relevant representatives
    if (location.toLowerCase().includes("san antonio") || location.toLowerCase().includes("tx-23")) {
      return this.getTX23Representatives();
    }
    return this.getTX23Representatives();
  }
}

export const legislatorService = new LegislatorService();