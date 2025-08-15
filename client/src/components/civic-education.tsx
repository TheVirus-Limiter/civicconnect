import { useState } from "react";
import { useTranslation } from "@/hooks/use-translation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { GraduationCap, Play, CheckCircle, Clock, Gavel } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CivicEducation() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) {
      toast({
        title: "Please Select an Answer",
        description: "Choose an option before submitting your answer.",
        variant: "destructive",
      });
      return;
    }

    setShowAnswer(true);
    const isCorrect = selectedAnswer === "two-thirds";
    
    toast({
      title: isCorrect ? "Correct!" : "Not quite right",
      description: isCorrect 
        ? "Two-thirds majority (67%) is correct! This is required in both chambers to override a presidential veto."
        : "The correct answer is two-thirds majority (67%). This high threshold ensures that vetoes can only be overridden with broad bipartisan support.",
    });
  };

  const billSteps = [
    {
      number: 1,
      title: "Introduction",
      description: "Bill is introduced in House or Senate",
      status: "completed" as const,
    },
    {
      number: 2,
      title: "Committee Review",
      description: "Committee studies and marks up bill",
      status: "completed" as const,
    },
    {
      number: 3,
      title: "Floor Vote",
      description: "Full chamber debates and votes",
      status: "current" as const,
    },
    {
      number: 4,
      title: "Senate Vote",
      description: "Senate debates and votes on the bill",
      status: "pending" as const,
    },
    {
      number: 5,
      title: "Presidential Action",
      description: "President signs or vetoes the bill",
      status: "pending" as const,
    },
  ];

  const getStepIcon = (status: "completed" | "current" | "pending") => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "current":
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStepColor = (status: "completed" | "current" | "pending") => {
    switch (status) {
      case "completed":
        return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
      case "current":
        return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800";
      default:
        return "bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800";
    }
  };

  return (
    <section id="education" className="mb-12">
      <h3 className="text-2xl font-bold mb-6 flex items-center">
        <GraduationCap className="w-6 h-6 mr-3 text-primary" />
        Civic Education
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* How a Bill Becomes Law */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">How a Bill Becomes Law</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {billSteps.map((step, index) => (
                <div key={step.number} className={`p-4 rounded-lg border ${getStepColor(step.status)}`}>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getStepIcon(step.status)}
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium text-sm mb-1">{step.title}</h5>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full mt-6" variant="outline">
              <Play className="w-4 h-4 mr-2" />
              Start Interactive Tutorial
            </Button>
          </CardContent>
        </Card>

        {/* Knowledge Quiz */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Test Your Knowledge</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-primary/5 to-blue-50 dark:from-slate-700 dark:to-slate-600 rounded-lg p-4">
                <h5 className="font-medium mb-2">Quick Quiz: Legislative Basics</h5>
                <p className="text-sm text-muted-foreground mb-4">
                  How many votes are needed to override a presidential veto?
                </p>
                <RadioGroup 
                  value={selectedAnswer} 
                  onValueChange={setSelectedAnswer}
                  disabled={showAnswer}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="simple-majority" id="simple-majority" />
                    <Label htmlFor="simple-majority" className="text-sm">
                      Simple Majority (51%)
                    </Label>
                    {showAnswer && selectedAnswer === "simple-majority" && (
                      <Badge variant="destructive" className="text-xs">Incorrect</Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="two-thirds" id="two-thirds" />
                    <Label htmlFor="two-thirds" className="text-sm">
                      Two-Thirds Majority (67%)
                    </Label>
                    {showAnswer && selectedAnswer === "two-thirds" && (
                      <Badge className="text-xs bg-green-600">Correct!</Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="three-quarters" id="three-quarters" />
                    <Label htmlFor="three-quarters" className="text-sm">
                      Three-Quarters Majority (75%)
                    </Label>
                    {showAnswer && selectedAnswer === "three-quarters" && (
                      <Badge variant="destructive" className="text-xs">Incorrect</Badge>
                    )}
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Button 
                  onClick={handleSubmitAnswer} 
                  className="w-full"
                  disabled={showAnswer}
                >
                  Submit Answer
                </Button>
                <Button variant="outline" className="w-full">
                  Take Full Quiz
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
