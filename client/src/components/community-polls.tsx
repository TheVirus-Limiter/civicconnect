import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Clock, MapPin, Users, Vote } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Poll } from "@shared/schema";

interface PollWithResults extends Poll {
  results?: {
    pollId: string;
    totalVotes: number;
    results: { optionIndex: number; count: number; percentage: number }[];
  };
  hasVoted?: boolean;
}

export function CommunityPolls() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [language, setLanguage] = useState<string>("en");
  const queryClient = useQueryClient();

  const { data: pollsData, isLoading } = useQuery({
    queryKey: ["/api/polls", { category: activeCategory === "all" ? undefined : activeCategory }],
  });

  const voteMutation = useMutation({
    mutationFn: async ({ pollId, selectedOptions }: { pollId: string; selectedOptions: number[] }) => {
      return apiRequest(`/api/polls/${pollId}/vote`, {
        method: "POST",
        body: { selectedOptions, userId: null }, // Anonymous voting for now
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/polls"] });
    },
  });

  const polls: PollWithResults[] = pollsData?.polls || [];
  
  console.log('Polls data received:', { pollsData, pollsCount: polls.length });

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

  const PollCard = ({ poll }: { poll: PollWithResults }) => {
    const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
    const [showResults, setShowResults] = useState(false);

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

    const submitVote = () => {
      if (selectedOptions.length > 0) {
        handleVote(poll.id, selectedOptions);
        setShowResults(true);
      }
    };

    const isExpired = poll.endDate && new Date(poll.endDate) < new Date();
    const daysRemaining = poll.endDate 
      ? Math.ceil((new Date(poll.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : null;

    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-lg">
                {language === "es" ? poll.title : poll.title}
              </CardTitle>
              {poll.description && (
                <CardDescription className="mt-2">
                  {language === "es" ? poll.description : poll.description}
                </CardDescription>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Badge variant={poll.category === "local" ? "default" : poll.category === "national" ? "secondary" : "outline"}>
                {poll.category === "local" ? (language === "es" ? "Local" : "Local") :
                 poll.category === "national" ? (language === "es" ? "Nacional" : "National") :
                 (language === "es" ? "Estatal" : "State")}
              </Badge>
              {isExpired && (
                <Badge variant="destructive" className="text-xs">
                  {language === "es" ? "Expirada" : "Expired"}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {poll.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{poll.location}</span>
              </div>
            )}
            {daysRemaining !== null && daysRemaining > 0 && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>
                  {daysRemaining} {language === "es" ? 
                    (daysRemaining === 1 ? "día restante" : "días restantes") :
                    (daysRemaining === 1 ? "day left" : "days left")
                  }
                </span>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          {!showResults && !isExpired ? (
            <div className="space-y-4">
              <div className="space-y-3">
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
                  {poll.allowMultipleChoice ? 
                    (language === "es" ? "Selecciona todas las que apliquen" : "Select all that apply") :
                    (language === "es" ? "Selecciona una opción" : "Select one option")
                  }
                </div>
                <Button 
                  onClick={submitVote}
                  disabled={selectedOptions.length === 0 || voteMutation.isPending}
                  size="sm"
                >
                  <Vote className="w-4 h-4 mr-2" />
                  {language === "es" ? "Votar" : "Vote"}
                </Button>
              </div>
            </div>
          ) : (
            <PollResults poll={poll} language={language} />
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {language === "es" ? "Encuestas Comunitarias" : "Community Polls"}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          {language === "es" 
            ? "Comparte tu opinión sobre temas importantes en TX-23"
            : "Share your opinion on important issues in TX-23"
          }
        </p>
      </div>

      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mb-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">
            {language === "es" ? "Todas" : "All"}
          </TabsTrigger>
          <TabsTrigger value="local">
            {language === "es" ? "Local" : "Local"}
          </TabsTrigger>
          <TabsTrigger value="state">
            {language === "es" ? "Estatal" : "State"}
          </TabsTrigger>
          <TabsTrigger value="national">
            {language === "es" ? "Nacional" : "National"}
          </TabsTrigger>
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
                {language === "es" ? "No hay encuestas disponibles" : "No polls available"}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {language === "es" 
                  ? "No hay encuestas activas en esta categoría en este momento."
                  : "There are no active polls in this category right now."
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function PollResults({ poll, language }: { poll: PollWithResults; language: string }) {
  const { data: resultsData } = useQuery({
    queryKey: [`/api/polls/${poll.id}/results`],
  });

  const results = resultsData || { totalVotes: 0, results: [] };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">
          {language === "es" ? "Resultados" : "Results"}
        </h4>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>
            {results.totalVotes} {language === "es" ? "votos" : "votes"}
          </span>
        </div>
      </div>
      
      <div className="space-y-3">
        {poll.options.map((option, index) => {
          const result = results.results.find((r: any) => r.optionIndex === index);
          const percentage = result?.percentage || 0;
          const count = result?.count || 0;
          
          return (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{option}</span>
                <span className="text-sm text-muted-foreground">
                  {count} ({percentage.toFixed(1)}%)
                </span>
              </div>
              <Progress value={percentage} className="h-2" />
            </div>
          );
        })}
      </div>
    </div>
  );
}