import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "@/hooks/use-translation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Newspaper, ExternalLink, Bot } from "lucide-react";
import type { NewsArticle } from "@shared/schema";

export default function NewsAggregator() {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState("breaking");

  const { data: newsData, isLoading, error } = useQuery({
    queryKey: ["/api/news", activeCategory],
    queryFn: async () => {
      const endpoint = activeCategory === "breaking" 
        ? "/api/news/breaking" 
        : `/api/news?category=${activeCategory}`;
      
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error("Failed to fetch news");
      return response.json();
    },
  });

  const articles = newsData?.articles || [];

  const categories = [
    { key: "breaking", label: "Breaking" },
    { key: "local", label: "Local" },
    { key: "national", label: "National" },
    { key: "explainer", label: "Explainer" },
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "breaking":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "local":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
      case "national":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "explainer":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const formatTimeAgo = (date: Date | null | undefined) => {
    if (!date) return "";
    
    const now = new Date();
    const publishedDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (error) {
    return (
      <section id="news" className="mb-12">
        <div className="text-center py-8">
          <p className="text-destructive">Error: {(error as Error).message}</p>
          <Button variant="outline" onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section id="news" className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold flex items-center">
          <Newspaper className="w-6 h-6 mr-3 text-primary" />
          Civic News
        </h3>
        <div className="flex space-x-2">
          {categories.map((category) => (
            <Button
              key={category.key}
              variant={activeCategory === category.key ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(category.key)}
            >
              {category.label}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-48 w-full rounded-t-lg" />
              <CardContent className="p-6">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article: NewsArticle, index: number) => (
            <NewsCard key={article.id} article={article} featured={index === 0} />
          ))}
          
          {articles.length === 0 && (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">No news articles found for this category.</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function NewsCard({ article, featured = false }: { article: NewsArticle; featured?: boolean }) {
  const { t } = useTranslation();

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "breaking":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "local":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
      case "national":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "explainer":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const formatTimeAgo = (date: Date | null | undefined) => {
    if (!date) return "";
    
    const now = new Date();
    const publishedDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <Card className={`hover:shadow-md transition-shadow ${featured ? "md:col-span-2 lg:col-span-1" : ""}`}>
      {article.imageUrl && (
        <div className="relative">
          <img 
            src={article.imageUrl} 
            alt={article.title}
            className={`w-full object-cover rounded-t-lg ${featured ? "h-64" : "h-48"}`}
          />
        </div>
      )}
      <CardContent className="p-6">
        <div className="flex items-center space-x-2 mb-3">
          <Badge className={getCategoryColor(article.category || "national")}>
            {article.category?.toUpperCase() || "NEWS"}
          </Badge>
          <span className="text-xs text-muted-foreground">{article.source}</span>
          <span className="text-xs text-muted-foreground">
            {formatTimeAgo(article.publishedAt)}
          </span>
        </div>
        
        <h4 className={`font-semibold mb-2 ${featured ? "text-xl" : "text-lg"}`}>
          {article.title}
        </h4>
        
        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
          {article.summary}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            {article.tags && article.tags.slice(0, 2).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Bot className="w-4 h-4 mr-1" />
              Ask AI
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a href={article.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-1" />
                {t("news.readMore")}
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
