import * as React from "react";
import { cn } from "@/lib/utils";

export interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  currentStep: number;
  className?: string;
}

export interface StepProps extends React.HTMLAttributes<HTMLDivElement> {
  step: number;
  currentStep: number;
  title: string;
  description?: string;
  className?: string;
}

export const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(
  ({ currentStep, className, children, ...props }, ref) => {
    // Filter and count actual Step children to determine total steps
    const childrenArray = React.Children.toArray(children).filter(
      (child) => React.isValidElement(child) && (child.type as any).displayName === "Step"
    );

    return (
      <div
        ref={ref}
        className={cn("flex flex-row w-full mb-8", className)}
        {...props}
      >
        {React.Children.map(children, (child, index) => {
          if (React.isValidElement(child) && (child.type as any).displayName === "Step") {
            const isLastStep = index === childrenArray.length - 1;
            
            return (
              <div className="flex-1 flex flex-col items-center">
                {React.cloneElement(child as React.ReactElement<StepProps>, {
                  step: index + 1,
                  currentStep,
                })}
                {!isLastStep && (
                  <div 
                    className={cn(
                      "flex-grow-0 w-full h-0.5 mt-2 mb-1 mx-2",
                      index < currentStep - 1 
                        ? "bg-primary" 
                        : "bg-gray-200 dark:bg-gray-700"
                    )}
                  />
                )}
              </div>
            );
          }
          return child;
        })}
      </div>
    );
  }
);
Stepper.displayName = "Stepper";

export const Step = React.forwardRef<HTMLDivElement, StepProps>(
  ({ step, currentStep, title, description, className, ...props }, ref) => {
    const isActive = step === currentStep;
    const isCompleted = step < currentStep;

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center space-y-2",
          className
        )}
        {...props}
      >
        <div className="flex flex-col items-center relative w-full">
          <div 
            className={cn(
              "flex items-center justify-center rounded-full w-8 h-8 font-medium text-sm text-center mb-2",
              isActive 
                ? "bg-primary text-primary-foreground border-2 border-primary" 
                : isCompleted
                  ? "bg-primary text-primary-foreground"
                  : "bg-gray-100 text-gray-500 border-2 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
            )}
          >
            {step}
          </div>
          <div className="text-center">
            <p className={cn(
              "text-sm font-medium",
              isActive || isCompleted ? "text-primary" : "text-gray-500 dark:text-gray-400"
            )}>
              {title}
            </p>
            {description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }
);
Step.displayName = "Step";