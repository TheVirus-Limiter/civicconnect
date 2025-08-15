import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "@/hooks/use-translation";
import { useLocation } from "@/hooks/use-location";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Search, Mail, Plus, User } from "lucide-react";
import type { Legislator } from "@shared/schema";

export default function LegislatorTracker() {
  const { t } = useTranslation();
  const { location } = useLocation();

  const { data: legislatorsData, isLoading, error } = useQuery({
    queryKey: ["/api/legislators", location.state, location.district],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (location.state) params.append("state", location.state);
      if (location.district) params.append("district", location.district);
      params.append("limit", "10");
      
      const response = await fetch(`/api/legislators?${params}`);
      if (!response.ok) throw new Error("Failed to fetch legislators");
      return response.json();
    },
    enabled: !!location.state, // Only fetch if we have location data
  });

  const legislators = legislatorsData?.legislators || [];

  const getPartyColor = (party: string) => {
    switch (party?.toLowerCase()) {
      case "democratic":
        return "text-blue-600";
      case "republican":
        return "text-red-600";
      case "independent":
        return "text-purple-600";
      default:
        return "text-gray-600";
    }
  };

  if (error) {
    return (
      <section id="legislators" className="mb-12">
        <div className="text-center py-8">
          <p className="text-destructive">{t("common.error")}: {(error as Error).message}</p>
          <Button variant="outline" onClick={() => window.location.reload()} className="mt-4">
            {t("common.retry")}
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section id="legislators" className="mb-12">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold flex items-center">
          <Users className="w-6 h-6 mr-3 text-primary" />
          {t("legislators.title")}
        </h3>
        <Button variant="outline">
          <Search className="w-4 h-4 mr-1" />
          {t("legislators.findAll")}
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4 mb-4">
                  <Skeleton className="w-16 h-16 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
                <div className="space-y-3">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="flex justify-between">
                      <Skeleton className="h-3 w-1/3" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {legislators.map((legislator: Legislator) => (
            <LegislatorCard key={legislator.id} legislator={legislator} />
          ))}
          
          {legislators.length === 0 && (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">
                {location.state 
                  ? "No representatives found for your location."
                  : "Please set your location to see your representatives."
                }
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function LegislatorCard({ legislator }: { legislator: Legislator }) {
  const { t } = useTranslation();

  const getPartyColor = (party: string) => {
    switch (party?.toLowerCase()) {
      case "democratic":
        return "text-blue-600";
      case "republican":
        return "text-red-600";
      case "independent":
        return "text-purple-600";
      default:
        return "text-gray-600";
    }
  };

  const getActivityText = (activity: { action: string; bill: string; date: string }) => {
    const actionMap: Record<string, string> = {
      "Voted Yes": t("legislators.votedYes"),
      "Voted No": t("legislators.votedNo"),
      "Sponsored": t("legislators.sponsored"),
      "Co-sponsored": t("legislators.coSponsored"),
      "Proposed": t("legislators.proposed"),
      "Signed": t("legislators.signed"),
    };

    return actionMap[activity.action] || activity.action;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4 mb-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            {legislator.imageUrl ? (
              <img 
                src={legislator.imageUrl} 
                alt={legislator.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-semibold">{legislator.name}</h4>
            <p className="text-sm text-muted-foreground">{legislator.office}</p>
            <p className="text-sm text-muted-foreground">
              {legislator.district && `District ${legislator.district}, `}{legislator.state}
            </p>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t("legislators.party")}</span>
            <span className={`font-medium ${getPartyColor(legislator.party || "")}`}>
              {legislator.party}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t("legislators.yearsInOffice")}</span>
            <span className="font-medium">{legislator.yearsInOffice}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{t("legislators.billsSponsored")}</span>
            <span className="font-medium">{legislator.billsSponsored}</span>
          </div>
        </div>

        <div className="border-t border-border pt-4">
          <h5 className="text-sm font-medium mb-2">{t("legislators.recentActivity")}</h5>
          <div className="space-y-2">
            {legislator.recentActivity?.slice(0, 2).map((activity, index) => (
              <div key={index} className="text-xs text-muted-foreground">
                <span className="font-medium">{getActivityText(activity)}</span> on {activity.bill}
              </div>
            )) || (
              <p className="text-xs text-muted-foreground">No recent activity</p>
            )}
          </div>
        </div>

        <div className="flex space-x-2 mt-4">
          <Button variant="outline" size="sm" className="flex-1">
            <Mail className="w-4 h-4 mr-1" />
            {t("legislators.contact")}
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Plus className="w-4 h-4 mr-1" />
            {t("legislators.track")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
