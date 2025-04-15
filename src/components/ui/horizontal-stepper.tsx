import React from 'react';
import { cn } from "@/lib/utils";

type StepProps = {
  number: number;
  title: string;
  description: string;
  isActive: boolean;
  isCompleted: boolean;
};

const Step: React.FC<StepProps> = ({ number, title, description, isActive, isCompleted }) => {
  return (
    <div className="flex flex-col items-center">
      <div 
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium",
          isActive 
            ? "bg-primary text-white border-2 border-primary" 
            : isCompleted 
              ? "bg-primary text-white" 
              : "bg-gray-100 text-gray-400 border-2 border-gray-200"
        )}
      >
        {number}
      </div>
      <div className="mt-2 text-center">
        <p className={cn(
          "text-sm font-medium",
          isActive || isCompleted ? "text-primary" : "text-gray-500"
        )}>
          {title}
        </p>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </div>
    </div>
  );
};

type HorizontalStepperProps = {
  currentStep: number;
  steps: {
    title: string;
    description: string;
  }[];
};

export const HorizontalStepper: React.FC<HorizontalStepperProps> = ({ currentStep, steps }) => {
  return (
    <div className="w-full mb-8">
      <div className="flex justify-between items-start">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          
          // Don't render a connector after the last step
          const isLastStep = index === steps.length - 1;
          
          return (
            <React.Fragment key={index}>
              <Step
                number={stepNumber}
                title={step.title}
                description={step.description}
                isActive={isActive}
                isCompleted={isCompleted}
              />
              
              {!isLastStep && (
                <div className="flex-grow mx-2 mt-4">
                  <div 
                    className={cn(
                      "h-0.5",
                      isCompleted ? "bg-primary" : "bg-gray-200"
                    )}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default HorizontalStepper;