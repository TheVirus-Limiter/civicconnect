import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Clock, MapPin, Users, Vote } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useSimpleTranslation } from "@/hooks/use-simple-translation";

interface SimplePoll {
  id: string;
  title: string;
  description: string;
  options: string[];
  category: string;
  district: string;
  location: string;
  isActive: boolean;
  allowMultipleChoice: boolean;
  endDate: string;
}

export function SimplePolls() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const { t } = useSimpleTranslation();
  const queryClient = useQueryClient();

  const { data: pollsData, isLoading } = useQuery({
    queryKey: ["/api/polls", { category: activeCategory === "all" ? undefined : activeCategory }],
  });

  const voteMutation = useMutation({
    mutationFn: async ({ pollId, selectedOptions }: { pollId: string; selectedOptions: number[] }) => {
      const response = await fetch(`/api/polls/${pollId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedOptions, userId: null }),
      });
      if (!response.ok) throw new Error("Failed to vote");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/polls"] });
    },
  });

  const polls: SimplePoll[] = pollsData?.polls || [];
  console.log('Polls data:', { pollsData, pollsCount: polls.length });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
    );
  }

  const handleVote = async (pollId: string, selectedOptions: number[]) => {
    try {
      await voteMutation.mutateAsync({ pollId, selectedOptions });
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  const PollCard = ({ poll }: { poll: SimplePoll }) => {
    const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
    const [hasVoted, setHasVoted] = useState(false);

    const handleOptionSelect = (optionIndex: number) => {
      if (poll.allowMultipleChoice) {
        setSelectedOptions(prev => 
          prev.includes(optionIndex)
            ? prev.filter(i => i !== optionIndex)
            : [...prev, optionIndex]
        );
      } else {
        setSelectedOptions([optionIndex]);
      }
    };

    const submitVote = async () => {
      if (selectedOptions.length > 0) {
        await handleVote(poll.id, selectedOptions);
        setHasVoted(true);
      }
    };

    const isExpired = new Date(poll.endDate) < new Date();
    const daysRemaining = Math.ceil((new Date(poll.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            {poll.title}
            {!isExpired && poll.isActive && (
              <Badge variant="secondary" className="text-xs">
                Active
              </Badge>
            )}
            {isExpired && (
              <Badge variant="outline" className="text-xs">
                Closed
              </Badge>
            )}
          </CardTitle>
          <CardDescription className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {poll.location || poll.district}
            </span>
            {daysRemaining > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {daysRemaining} days remaining
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">{poll.description}</p>
          
          {!hasVoted && !isExpired ? (
            <div>
              <div className="space-y-3 mb-4">
                {poll.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <input
                      type={poll.allowMultipleChoice ? "checkbox" : "radio"}
                      id={`poll-${poll.id}-option-${index}`}
                      name={`poll-${poll.id}`}
                      checked={selectedOptions.includes(index)}
                      onChange={() => handleOptionSelect(index)}
                      className="w-4 h-4"
                    />
                    <label 
                      htmlFor={`poll-${poll.id}-option-${index}`}
                      className="flex-1 cursor-pointer"
                    >
                      {option}
                    </label>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {poll.allowMultipleChoice ? "Select all that apply" : "Select one option"}
                </div>
                <Button 
                  onClick={submitVote}
                  disabled={selectedOptions.length === 0 || voteMutation.isPending}
                  size="sm"
                >
                  <Vote className="w-4 h-4 mr-2" />
                  {t("Vote")}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <CheckCircle className="w-8 h-8 mx-auto text-green-500 mb-2" />
              <p className="text-sm text-muted-foreground">
                {hasVoted ? "Thank you for voting!" : "This poll has ended"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t("Community Polls")}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          {t("Share your opinion")} on important issues in TX-23
        </p>
      </div>

      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mb-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">{t("All")}</TabsTrigger>
          <TabsTrigger value="local">{t("Local")}</TabsTrigger>
          <TabsTrigger value="state">{t("State")}</TabsTrigger>
          <TabsTrigger value="national">{t("National")}</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-6">
        {polls.length > 0 ? (
          polls.map((poll) => (
            <PollCard key={poll.id} poll={poll} />
          ))
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t("No polls available")}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t("There are no active polls")} in this category right now.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}