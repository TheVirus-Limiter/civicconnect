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

      const articles: NewsArticle[] = data.articles
        .filter(article => article.title && article.url)
        .map(this.transformNewsAPIArticle);

      return {
        articles,
        total: data.totalResults,
      };
    } catch (error) {
      console.error("Error fetching news from NewsAPI:", error);
      return { articles: [], total: 0 };
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

      return data.articles
        .filter(article => article.title && article.url)
        .map(this.transformNewsAPIArticle)
        .slice(0, 5);
    } catch (error) {
      console.error("Error fetching breaking news:", error);
      return [];
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
      return [];
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
}

export const newsService = new NewsService();
