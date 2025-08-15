import { cn } from "@/lib/utils";
import { CheckCircle, Clock } from "lucide-react";

interface TimelineProps {
  progress: {
    introduced: boolean;
    committee: boolean;
    passed_house?: boolean;
    passed_senate?: boolean;
    signed?: boolean;
  };
  className?: string;
}

export function Timeline({ progress, className }: TimelineProps) {
  const steps = [
    { key: "introduced", label: "Introduced", completed: progress.introduced },
    { key: "committee", label: "Committee", completed: progress.committee },
    { key: "passed_house", label: "House", completed: progress.passed_house || false },
    { key: "passed_senate", label: "Senate", completed: progress.passed_senate || false },
    { key: "signed", label: "Signed", completed: progress.signed || false },
  ];

  const getStepStatus = (step: any, index: number) => {
    if (step.completed) return "completed";
    
    // Find the first incomplete step
    const firstIncomplete = steps.findIndex(s => !s.completed);
    if (index === firstIncomplete) return "current";
    
    return "pending";
  };

  return (
    <div className={cn("bg-muted rounded-lg p-4", className)}>
      <h5 className="text-sm font-medium mb-3">Bill Progress</h5>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const status = getStepStatus(step, index);
          const isLast = index === steps.length - 1;
          
          return (
            <div key={step.key} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={cn(
                  "w-3 h-3 rounded-full flex items-center justify-center",
                  status === "completed" && "bg-green-600",
                  status === "current" && "bg-yellow-600",
                  status === "pending" && "bg-muted-foreground/30"
                )}>
                  {status === "completed" && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                  {status === "current" && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                </div>
                <span className={cn(
                  "text-xs mt-1 text-center",
                  status === "completed" && "text-green-600 font-medium",
                  status === "current" && "text-yellow-600 font-medium",
                  status === "pending" && "text-muted-foreground"
                )}>
                  {step.label}
                </span>
              </div>
              
              {!isLast && (
                <div className={cn(
                  "flex-1 h-0.5 mx-2",
                  steps[index + 1].completed || status === "completed" 
                    ? "bg-green-600" 
                    : "bg-muted-foreground/30"
                )} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
