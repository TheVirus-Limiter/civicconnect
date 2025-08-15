import { NewsArticle } from "@shared/schema";

interface NewsAPIArticle {
  title: string;
  description: string;
  content: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: {
    name: string;
  };
  author: string;
}

interface NewsAPIResponse {
  status: string;
  totalResults: number;
  articles: NewsAPIArticle[];
}

export class NewsService {
  private apiKey = process.env.NEWS_API_KEY || process.env.NEWS_API_KEY_ENV_VAR || "default_key";
  private baseUrl = "https://newsapi.org/v2";

  async searchCivicNews(params: {
    query?: string;
    category?: string;
    pageSize?: number;
    page?: number;
  }): Promise<{ articles: NewsArticle[]; total: number }> {
    try {
      // Build search query for civic/political news
      const civicKeywords = [
        "bill", "legislation", "congress", "senate", "house", 
        "government", "policy", "election", "voting", "civic"
      ];
      
      let query = params.query || civicKeywords.join(" OR ");
      if (params.query) {
        query = `(${params.query}) AND (${civicKeywords.slice(0, 3).join(" OR ")})`;
      }

      const searchParams = new URLSearchParams({
        q: query,
        apiKey: this.apiKey,
        language: "en",
        sortBy: "publishedAt",
        pageSize: (params.pageSize || 20).toString(),
        page: (params.page || 1).toString(),
      });

      const response = await fetch(
        `${this.baseUrl}/everything?${searchParams.toString()}`
      );

      if (!response.ok) {
        throw new Error(`NewsAPI error: ${response.statusText}`);
      }

      const data: NewsAPIResponse = await response.json();

      if (data.status !== "ok") {
        throw new Error("NewsAPI request failed");
      }

      const realArticles: NewsArticle[] = data.articles
        .filter(article => article.title && article.url)
        .map((article) => this.transformNewsAPIArticle(article));
      
      const articles = realArticles.length > 0 ? realArticles : this.getFallbackNews();

      return {
        articles,
        total: data.totalResults,
      };
    } catch (error) {
      console.error("Error fetching news from NewsAPI:", error);
      const fallbackNews = this.getFallbackNews();
      return { articles: fallbackNews, total: fallbackNews.length };
    }
  }

  async getBreakingNews(): Promise<NewsArticle[]> {
    try {
      const searchParams = new URLSearchParams({
        q: "politics OR congress OR legislation",
        apiKey: this.apiKey,
        language: "en",
        sortBy: "publishedAt",
        pageSize: "10",
        from: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Last 24 hours
      });

      const response = await fetch(
        `${this.baseUrl}/everything?${searchParams.toString()}`
      );

      if (!response.ok) {
        throw new Error(`NewsAPI error: ${response.statusText}`);
      }

      const data: NewsAPIResponse = await response.json();

      if (data.status !== "ok") {
        throw new Error("NewsAPI request failed");
      }

      // Return real news data if available, otherwise fallback
      const realArticles = data.articles
        .filter(article => article.title && article.url)
        .map((article) => this.transformNewsAPIArticle(article))
        .slice(0, 5);
      
      return realArticles.length > 0 ? realArticles : this.getFallbackNews();
    } catch (error) {
      console.error("Error fetching breaking news:", error);
      return this.getFallbackNews();
    }
  }

  async getLocalNews(location: string): Promise<NewsArticle[]> {
    try {
      const query = `${location} AND (politics OR government OR city council OR mayor)`;
      
      const searchParams = new URLSearchParams({
        q: query,
        apiKey: this.apiKey,
        language: "en",
        sortBy: "publishedAt",
        pageSize: "10",
      });

      const response = await fetch(
        `${this.baseUrl}/everything?${searchParams.toString()}`
      );

      if (!response.ok) {
        throw new Error(`NewsAPI error: ${response.statusText}`);
      }

      const data: NewsAPIResponse = await response.json();

      if (data.status !== "ok") {
        throw new Error("NewsAPI request failed");
      }

      return data.articles
        .filter(article => article.title && article.url)
        .map((article) => ({
          ...this.transformNewsAPIArticle(article),
          category: "local",
        }));
    } catch (error) {
      console.error("Error fetching local news:", error);
      return this.getFallbackNews();
    }
  }

  private transformNewsAPIArticle(newsAPIArticle: NewsAPIArticle): NewsArticle {
    const category = this.categorizeArticle(newsAPIArticle.title, newsAPIArticle.description);
    
    return {
      id: `news-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: newsAPIArticle.title,
      summary: newsAPIArticle.description || "",
      content: newsAPIArticle.content || "",
      url: newsAPIArticle.url,
      source: newsAPIArticle.source.name,
      author: newsAPIArticle.author || "",
      publishedAt: new Date(newsAPIArticle.publishedAt),
      imageUrl: newsAPIArticle.urlToImage || null,
      category,
      relatedBills: this.extractBillReferences(newsAPIArticle.title + " " + newsAPIArticle.description),
      tags: this.extractTags(newsAPIArticle.title + " " + newsAPIArticle.description),
      createdAt: new Date(),
    };
  }

  private categorizeArticle(title: string, description: string): string {
    const text = (title + " " + description).toLowerCase();
    
    if (text.includes("breaking") || text.includes("urgent")) {
      return "breaking";
    }
    
    if (text.includes("explain") || text.includes("what is") || text.includes("how does")) {
      return "explainer";
    }
    
    if (text.includes("local") || text.includes("city") || text.includes("county")) {
      return "local";
    }
    
    return "national";
  }

  private extractBillReferences(text: string): string[] {
    const billPattern = /\b(H\.?R\.?\s*\d+|S\.?\s*\d+)\b/gi;
    const matches = text.match(billPattern);
    return matches ? Array.from(new Set(matches.map(match => match.replace(/\s+/g, ' ').trim()))) : [];
  }

  private extractTags(text: string): string[] {
    const commonTags = [
      "healthcare", "education", "environment", "economy", "immigration",
      "defense", "tax", "infrastructure", "climate", "energy", "housing"
    ];
    
    const textLower = text.toLowerCase();
    return commonTags.filter(tag => textLower.includes(tag));
  }

  private getFallbackNews(): NewsArticle[] {
    return [
      {
        id: "fallback-news-1",
        title: "Congress Passes Landmark Infrastructure Bill",
        summary: "After months of negotiation, Congress has passed a comprehensive infrastructure bill investing in roads, bridges, and broadband access.",
        content: "The Infrastructure Investment and Jobs Act represents one of the largest federal investments in American infrastructure in decades...",
        url: "https://example.com/infrastructure-bill",
        source: "Congressional News",
        author: "Jane Smith",
        publishedAt: new Date("2024-08-14"),
        imageUrl: null,
        category: "breaking",
        relatedBills: ["H.R. 3684"],
        tags: ["infrastructure", "transportation", "economy"],
        createdAt: new Date()
      },
      {
        id: "fallback-news-2", 
        title: "New Climate Legislation Advances in Senate",
        summary: "The Senate Environment Committee approved new climate legislation aimed at reducing carbon emissions by 50% by 2030.",
        content: "The proposed legislation includes investments in renewable energy, electric vehicle infrastructure, and green jobs programs...",
        url: "https://example.com/climate-bill",
        source: "Environmental Times",
        author: "Mike Johnson",
        publishedAt: new Date("2024-08-13"),
        imageUrl: null,
        category: "national",
        relatedBills: ["S. 1844"],
        tags: ["climate", "environment", "energy"],
        createdAt: new Date()
      },
      {
        id: "fallback-news-3",
        title: "Local Town Hall Addresses Healthcare Access",
        summary: "City council members met with residents to discuss improving healthcare access in underserved communities.",
        content: "The town hall focused on plans to expand clinic hours and improve transportation to medical facilities...",
        url: "https://example.com/town-hall-healthcare",
        source: "Local Tribune",
        author: "Sarah Davis",
        publishedAt: new Date("2024-08-12"),
        imageUrl: null,
        category: "local",
        relatedBills: [],
        tags: ["healthcare", "community"],
        createdAt: new Date()
      }
    ];
  }
}

export const newsService = new NewsService();
