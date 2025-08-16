import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useSimpleTranslation } from "@/hooks/use-simple-translation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Mail, Calendar, Vote, TriangleAlert } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function CivicEngagement() {
  const { t } = useSimpleTranslation();
  const { toast } = useToast();
  const [selectedBill, setSelectedBill] = useState("");

  const generateTemplateMutation = useMutation({
    mutationFn: async (data: { billTitle: string; position: "support" | "oppose"; language: string }) => {
      const response = await apiRequest("POST", "/api/contact-template", data);
      return response.json();
    },
    onSuccess: (data) => {
      // In a real app, this would open a modal or navigate to an email interface
      toast({
        title: "Email Template Generated",
        description: "Your contact template has been created and is ready to send.",
      });
      console.log("Generated template:", data.template);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate email template. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerateTemplate = () => {
    if (!selectedBill) {
      toast({
        title: "Please Select a Bill",
        description: "Choose a bill to discuss before generating the template.",
        variant: "destructive",
      });
      return;
    }

    generateTemplateMutation.mutate({
      billTitle: selectedBill,
      position: "support",
      language: "en",
    });
  };

  return (
    <section id="engage" className="mb-12">
      <h3 className="text-2xl font-bold mb-6 flex items-center">
        <Megaphone className="w-6 h-6 mr-3 text-primary" />
        {t("Take Action")}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Contact Representatives Tool */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Mail className="text-primary-foreground w-5 h-5" />
              </div>
              <span>{t("Contact Your Reps")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm mb-4">
              {t("Generate personalized letters to your representatives about important legislation.")}
            </p>
            <div className="space-y-3">
              <Select value={selectedBill} onValueChange={setSelectedBill}>
                <SelectTrigger>
                  <SelectValue placeholder={t("Select a bill to discuss")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="H.R. 1234 - Clean Energy Infrastructure">
                    H.R. 1234 - Clean Energy Infrastructure
                  </SelectItem>
                  <SelectItem value="S. 567 - Student Loan Forgiveness">
                    S. 567 - Student Loan Forgiveness
                  </SelectItem>
                  <SelectItem value="Local Housing Initiative">
                    Local Housing Initiative
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button 
                className="w-full" 
                onClick={handleGenerateTemplate}
                disabled={generateTemplateMutation.isPending}
              >
                {generateTemplateMutation.isPending ? "Generating..." : t("Generate Template")}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Town Halls & Events */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                <Calendar className="text-white w-5 h-5" />
              </div>
              <span>{t("Upcoming Events")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm mb-4">
              {t("Find town halls, city council meetings, and other civic events in your area.")}
            </p>
            <div className="space-y-3">
              <div className="text-center py-4 text-muted-foreground">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">{t("No upcoming events found")}</p>
                <p className="text-xs">{t("Check back soon for new civic events")}</p>
              </div>
              <Button variant="outline" className="w-full">
                {t("View All Events")}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Voter Information */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center">
                <Vote className="text-white w-5 h-5" />
              </div>
              <span>{t("Voter Information")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm mb-4">
              {t("Check your registration status, find polling locations, and get important voting dates.")}
            </p>
            <div className="space-y-3">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <TriangleAlert className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    {t("Next Election")}: November 5, 2025 (82 {t("days")})
                  </span>
                </div>
              </div>
              <Button 
                className="w-full bg-yellow-600 hover:bg-yellow-700"
                onClick={() => window.open("https://www.sos.state.tx.us/elections/voter/important-election-dates.shtml", "_blank")}
              >
                {t("More Info")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
