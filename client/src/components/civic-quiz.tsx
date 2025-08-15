import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, RotateCcw } from "lucide-react";

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const civicsQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "What is the supreme law of the land?",
    options: ["The Declaration of Independence", "The Constitution", "The Bill of Rights", "Federal Laws"],
    correctAnswer: 1,
    explanation: "The Constitution is the supreme law of the United States. All other laws must comply with it."
  },
  {
    id: 2,
    question: "How many amendments does the Constitution have?",
    options: ["25", "27", "30", "33"],
    correctAnswer: 1,
    explanation: "The Constitution has 27 amendments. The first 10 are known as the Bill of Rights."
  },
  {
    id: 3,
    question: "How many U.S. Senators are there?",
    options: ["50", "100", "435", "538"],
    correctAnswer: 1,
    explanation: "There are 100 U.S. Senators - two from each of the 50 states."
  },
  {
    id: 4,
    question: "We elect a U.S. Representative for how many years?",
    options: ["2 years", "4 years", "6 years", "8 years"],
    correctAnswer: 0,
    explanation: "U.S. Representatives serve 2-year terms and must be re-elected every even-numbered year."
  },
  {
    id: 5,
    question: "What is the highest court in the United States?",
    options: ["Federal Court", "Appeals Court", "Supreme Court", "District Court"],
    correctAnswer: 2,
    explanation: "The Supreme Court is the highest court in the United States and the final arbiter of constitutional questions."
  }
];

export default function CivicQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < civicsQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setQuizCompleted(true);
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateScore = () => {
    return selectedAnswers.reduce((score, answer, index) => {
      return score + (answer === civicsQuestions[index].correctAnswer ? 1 : 0);
    }, 0);
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setShowResults(false);
    setQuizCompleted(false);
  };

  const progress = ((currentQuestion + 1) / civicsQuestions.length) * 100;
  const score = calculateScore();
  const percentage = Math.round((score / civicsQuestions.length) * 100);

  if (showResults) {
    return (
      <section className="mb-12">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Quiz Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">
                {score}/{civicsQuestions.length}
              </div>
              <div className="text-xl text-muted-foreground">
                {percentage}% Correct
              </div>
              <div className="mt-4">
                {percentage >= 80 ? (
                  <div className="text-green-600 flex items-center justify-center gap-2">
                    <CheckCircle className="w-6 h-6" />
                    Excellent! You have a strong understanding of civics.
                  </div>
                ) : percentage >= 60 ? (
                  <div className="text-yellow-600 flex items-center justify-center gap-2">
                    <CheckCircle className="w-6 h-6" />
                    Good job! Consider reviewing the areas you missed.
                  </div>
                ) : (
                  <div className="text-red-600 flex items-center justify-center gap-2">
                    <XCircle className="w-6 h-6" />
                    Keep studying! Civic knowledge is important for democracy.
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Review Your Answers:</h3>
              {civicsQuestions.map((question, index) => {
                const userAnswer = selectedAnswers[index];
                const isCorrect = userAnswer === question.correctAnswer;
                return (
                  <div key={question.id} className="border rounded-lg p-4">
                    <div className="flex items-start gap-2 mb-2">
                      {isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{question.question}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Your answer: {question.options[userAnswer]}
                        </p>
                        {!isCorrect && (
                          <p className="text-sm text-green-600 mt-1">
                            Correct answer: {question.options[question.correctAnswer]}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground mt-2">
                          {question.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-4 justify-center">
              <Button onClick={restartQuiz} className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
                Take Quiz Again
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.open('https://www.uscis.gov/citizenship/find-study-materials-and-resources', '_blank')}
              >
                Study More
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  const question = civicsQuestions[currentQuestion];

  return (
    <section className="mb-12">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-xl">Civic Knowledge Quiz</CardTitle>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Question {currentQuestion + 1} of {civicsQuestions.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">{question.question}</h3>
            <RadioGroup
              value={selectedAnswers[currentQuestion]?.toString()}
              onValueChange={(value) => handleAnswerSelect(parseInt(value))}
            >
              {question.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={selectedAnswers[currentQuestion] === undefined}
            >
              {currentQuestion === civicsQuestions.length - 1 ? "Finish Quiz" : "Next"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}