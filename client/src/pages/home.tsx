import Header from "@/components/header";
import BillBrowser from "@/components/bill-browser";
import NewsAggregator from "@/components/news-aggregator";
import CivicaChatbot from "@/components/civica-chatbot";
import LegislatorTracker from "@/components/legislator-tracker";
import CivicEngagement from "@/components/civic-engagement";
import CivicEducation from "@/components/civic-education";
import Footer from "@/components/footer";
import { useTranslation } from "@/hooks/use-translation";
import { useLocation } from "@/hooks/use-location";
import { Button } from "@/components/ui/button";
import { MapPin, TrendingUp, Clock, Users } from "lucide-react";

export default function Home() {
  const { t, language } = useTranslation();
  const { location, detectLocation, loading } = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      {/* Main Navigation */}
      <nav className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            <a href="#bills" className="whitespace-nowrap py-4 px-1 border-b-2 border-primary font-medium text-sm text-primary">
              {t("nav.bills")}
            </a>
            <a href="#news" className="whitespace-nowrap py-4 px-1 border-b-2 border-transparent font-medium text-sm text-muted-foreground hover:text-foreground hover:border-border">
              {t("nav.news")}
            </a>
            <a href="#legislators" className="whitespace-nowrap py-4 px-1 border-b-2 border-transparent font-medium text-sm text-muted-foreground hover:text-foreground hover:border-border">
              {t("nav.legislators")}
            </a>
            <a href="#engage" className="whitespace-nowrap py-4 px-1 border-b-2 border-transparent font-medium text-sm text-muted-foreground hover:text-foreground hover:border-border">
              {t("nav.engage")}
            </a>
            <a href="#education" className="whitespace-nowrap py-4 px-1 border-b-2 border-transparent font-medium text-sm text-muted-foreground hover:text-foreground hover:border-border">
              {t("nav.education")}
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("hero.title")}</h2>
            <p className="text-xl text-primary-foreground/90 mb-8 max-w-3xl mx-auto">
              {t("hero.subtitle")}
            </p>
            
            {/* Location Detector */}
            <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-lg p-6 max-w-md mx-auto mb-8">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <MapPin className="w-6 h-6" />
                <span className="text-lg font-medium">{t("hero.location")}</span>
              </div>
              <div className="text-primary-foreground/90">
                {location.city && location.state ? (
                  <>
                    <p className="font-medium">{location.city}, {location.state}</p>
                    {location.district && <p className="text-sm">District {location.district}</p>}
                  </>
                ) : (
                  <p className="text-sm">Location not detected</p>
                )}
              </div>
              <Button 
                onClick={detectLocation}
                disabled={loading}
                variant="ghost"
                size="sm"
                className="mt-3 text-primary-foreground/90 hover:text-primary-foreground hover:bg-primary-foreground/10"
              >
                <MapPin className="w-4 h-4 mr-1" />
                {loading ? t("common.loading") : t("hero.updateLocation")}
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold flex items-center justify-center space-x-2">
                  <TrendingUp className="w-6 h-6" />
                  <span>1,247</span>
                </div>
                <div className="text-primary-foreground/80">{t("hero.activeBills")}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold flex items-center justify-center space-x-2">
                  <Clock className="w-6 h-6" />
                  <span>89</span>
                </div>
                <div className="text-primary-foreground/80">{t("hero.recentUpdates")}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold flex items-center justify-center space-x-2">
                  <Users className="w-6 h-6" />
                  <span>23</span>
                </div>
                <div className="text-primary-foreground/80">{t("hero.localBills")}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BillBrowser />
        <NewsAggregator />
        <CivicaChatbot />
        <LegislatorTracker />
        <CivicEngagement />
        <CivicEducation />
      </main>

      <Footer />

      {/* Floating Chat Button */}
      <Button
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg hover:shadow-xl z-40"
        size="icon"
        onClick={() => {
          const chatSection = document.getElementById("civica-chat");
          chatSection?.scrollIntoView({ behavior: "smooth" });
        }}
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 2.98.97 4.29L1 23l6.71-1.97C9.02 21.64 10.46 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm0 18c-1.38 0-2.69-.28-3.88-.78L7 20l.78-1.12C7.28 17.69 7 16.38 7 15c0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
        </svg>
      </Button>
    </div>
  );
}
