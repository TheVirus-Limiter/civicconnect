import { useQuery } from "@tanstack/react-query";

export default function Home() {
  const { data: bills, isLoading: billsLoading } = useQuery({
    queryKey: ['/api/bills'],
  });

  const { data: legislators, isLoading: legislatorsLoading } = useQuery({
    queryKey: ['/api/legislators'],
  });

  const { data: news, isLoading: newsLoading } = useQuery({
    queryKey: ['/api/news/breaking'],
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">Connected Civics</h1>
          <p className="text-primary-foreground/90">TX-23 San Antonio - Civic Engagement Platform</p>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Stay Connected to Your Democracy</h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-3xl mx-auto">
            Track legislation, understand complex bills with AI assistance, and engage with your representatives—all in English and Spanish.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Bills Section */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">📜 Recent Bills</h3>
            {billsLoading ? (
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse"></div>
                <div className="h-4 bg-muted rounded animate-pulse w-3/4"></div>
                <div className="h-4 bg-muted rounded animate-pulse w-1/2"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {(bills as any)?.bills?.slice(0, 3).map((bill: any) => (
                  <div key={bill.id} className="border-b border-border pb-2 last:border-b-0">
                    <h4 className="font-semibold text-sm">{bill.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{bill.status}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Representatives Section */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">👥 Your Representatives</h3>
            {legislatorsLoading ? (
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse"></div>
                <div className="h-4 bg-muted rounded animate-pulse w-3/4"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {(legislators as any)?.legislators?.slice(0, 2).map((rep: any) => (
                  <div key={rep.id} className="border-b border-border pb-2 last:border-b-0">
                    <h4 className="font-semibold text-sm">{rep.name}</h4>
                    <p className="text-xs text-muted-foreground">{rep.position}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* News Section */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-xl font-bold mb-4">📰 Latest News</h3>
            {newsLoading ? (
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse"></div>
                <div className="h-4 bg-muted rounded animate-pulse w-3/4"></div>
                <div className="h-4 bg-muted rounded animate-pulse w-1/2"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {(news as any)?.articles?.slice(0, 3).map((article: any) => (
                  <div key={article.id} className="border-b border-border pb-2 last:border-b-0">
                    <h4 className="font-semibold text-sm">{article.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(article.publishedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}