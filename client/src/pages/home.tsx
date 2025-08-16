import Header from "@/components/header";
import BillBrowser from "@/components/bill-browser";
import NewsAggregator from "@/components/news-aggregator";
import CivicaChatbot from "@/components/civica-chatbot";
import LegislatorTracker from "@/components/legislator-tracker";
import CivicEngagement from "@/components/civic-engagement";
import CivicEducation from "@/components/civic-education";
import Footer from "@/components/footer";
import React from "react";
import { useSimpleTranslation } from "@/hooks/use-simple-translation";
import { useLocation } from "@/hooks/use-location";
import { Button } from "@/components/ui/button";
import { MapPin, TrendingUp, Clock, Users, Vote, MessageSquare, Languages, Loader2 } from "lucide-react";
import LocationSelector from "@/components/location-selector";
import { Link } from "wouter";

export default function Home() {
  const { currentLanguage, toggleLanguage, t } = useSimpleTranslation();
  const { location, detectLocation, loading } = useLocation();

  // Simple translation system - no loading needed

  return (
    <div className="min-h-screen bg-background text-foreground">

      
      <Header />
      
      {/* Main Navigation */}
      <nav className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex space-x-8 overflow-x-auto">
              <a href="#bills" className="whitespace-nowrap py-4 px-1 border-b-2 border-primary font-medium text-sm text-primary">
                {t("Recent Bills")}
              </a>
              <a href="#news" className="whitespace-nowrap py-4 px-1 border-b-2 border-transparent font-medium text-sm text-muted-foreground hover:text-foreground hover:border-border">
                {t("Breaking News")}
              </a>
              <a href="#legislators" className="whitespace-nowrap py-4 px-1 border-b-2 border-transparent font-medium text-sm text-muted-foreground hover:text-foreground hover:border-border">
                {t("Your Representatives")}
              </a>
              <Link href="/community/polls" className="whitespace-nowrap py-4 px-1 border-b-2 border-transparent font-medium text-sm text-muted-foreground hover:text-foreground hover:border-border flex items-center gap-1">
                <Vote className="w-4 h-4" />
                {t("Community Polls")}
              </Link>
              <Link href="/community/feedback" className="whitespace-nowrap py-4 px-1 border-b-2 border-transparent font-medium text-sm text-muted-foreground hover:text-foreground hover:border-border flex items-center gap-1">
                <MessageSquare className="w-4 h-4" />
                Feedback
              </Link>
              <a href="#engage" className="whitespace-nowrap py-4 px-1 border-b-2 border-transparent font-medium text-sm text-muted-foreground hover:text-foreground hover:border-border">
                Engage
              </a>
              <a href="#education" className="whitespace-nowrap py-4 px-1 border-b-2 border-transparent font-medium text-sm text-muted-foreground hover:text-foreground hover:border-border">
                Learn
              </a>
            </div>
            
            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="ml-4 flex items-center gap-2"
            >
              <Languages className="w-4 h-4" />
              {currentLanguage === 'en' ? 'ES' : 'EN'}
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-16 overflow-hidden">
        {/* Civic illustration background */}
        <div className="absolute inset-0 opacity-10">
          <svg className="absolute right-0 top-0 h-full w-auto" viewBox="0 0 400 300" fill="currentColor">
            <path d="M200 50 L120 100 L120 250 L280 250 L280 100 Z M200 70 L240 90 L240 230 L160 230 L160 90 Z M180 120 L220 120 L220 140 L180 140 Z M180 160 L220 160 L220 180 L180 180 Z M180 200 L220 200 L220 220 L180 220 Z" />
          </svg>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Main headline */}
            <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">
              Stay Connected to Your Democracy
            </h1>
            
            {/* Subheadline */}
            <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-3xl mx-auto font-light leading-relaxed">
              Track legislation, understand complex bills with AI assistance, and engage with your representatives—all in English and Spanish.
            </p>
            
            {/* Location Input */}
            <div className="bg-white/10 backdrop-blur-sm rounded-full p-1 max-w-md mx-auto mb-8 border border-white/20">
              <div className="flex items-center px-4 py-3">
                <MapPin className="w-5 h-5 text-blue-200 mr-3 flex-shrink-0" />
                <div className="flex-1 text-left">
                  <div className="text-white font-medium">
                    {location.city && location.state ? (
                      `${location.city}, ${location.state}`
                    ) : (
                      "San Antonio, Texas"
                    )}
                  </div>
                  <div className="text-blue-200 text-sm">
                    {location.district || "District TX-23"}
                  </div>
                </div>
                <Button 
                  onClick={detectLocation}
                  disabled={loading}
                  variant="secondary"
                  size="sm"
                  className="ml-3 bg-white/20 hover:bg-white/30 text-white border-none rounded-full px-4"
                >
                  {loading ? "Updating..." : "Update Location"}
                </Button>
              </div>
            </div>

            {/* Call to Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="lg"
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={() => document.getElementById('bills')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Explore Bills
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-2 border-white text-blue-600 bg-white hover:bg-blue-50 font-semibold px-8 py-3 rounded-full transition-all duration-200"
                onClick={() => window.open('https://www.youtube.com/watch?v=Otbml6WIQPo', '_blank')}
              >
                Learn How It Works
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-200 group">
                <div className="flex items-center justify-center w-16 h-16 bg-green-500 rounded-2xl mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold mb-2">1,247</div>
                <div className="text-blue-200 font-medium">Active Bills</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-200 group">
                <div className="flex items-center justify-center w-16 h-16 bg-yellow-500 rounded-2xl mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold mb-2">89</div>
                <div className="text-blue-200 font-medium">Recent Updates</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-200 group">
                <div className="flex items-center justify-center w-16 h-16 bg-purple-500 rounded-2xl mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl font-bold mb-2">23</div>
                <div className="text-blue-200 font-medium">Local Bills</div>
              </div>
            </div>

            {/* Language Support Indicator */}
            <div className="mt-8 text-blue-200 text-sm">
              Available in English and Spanish • Disponible en inglés y español
            </div>
          </div>
        </div>
      </section>

      {/* Community Features Showcase */}
      <section className="py-12 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Join the Community</h3>
            <p className="text-gray-600 dark:text-gray-300">Make your voice heard on important issues in TX-23</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Link href="/community/polls" className="group">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                    <Vote className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Community Polls</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Vote on local issues</p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Share your opinion on healthcare, infrastructure, border security, and other key issues affecting our district.
                </p>
                <div className="text-sm text-blue-600 dark:text-blue-400 font-medium group-hover:text-blue-700 dark:group-hover:text-blue-300">
                  View Active Polls →
                </div>
              </div>
            </Link>
            
            <Link href="/community/feedback" className="group">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                    <MessageSquare className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Community Feedback</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Share your concerns</p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Submit feedback about local issues, suggest improvements, and see responses from your representatives.
                </p>
                <div className="text-sm text-green-600 dark:text-green-400 font-medium group-hover:text-green-700 dark:group-hover:text-green-300">
                  Submit Feedback →
                </div>
              </div>
            </Link>
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
