"use client";

import { cn } from "@/lib/utils";

const STEP_LABELS = ["Data Diri", "Paket & Metode Pengiriman", "Perjanjian"];

interface ProgressBarProps {
  currentStep: number;
}

export function ProgressBar({ currentStep }: ProgressBarProps) {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center">
        {STEP_LABELS.map((label, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isDone = stepNumber < currentStep;

          return (
            <div key={label} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
                    isDone || isActive
                      ? "bg-gradient-to-r from-primary-from to-primary-to text-white"
                      : "bg-card-dark text-foreground/50"
                  )}
                >
                  {stepNumber}
                </div>
                <span
                  className={cn(
                    "hidden text-xs sm:block",
                    isActive ? "font-semibold text-foreground" : "text-foreground/50"
                  )}
                >
                  {label}
                </span>
              </div>

              {stepNumber !== STEP_LABELS.length && (
                <div
                  className={cn(
                    "mx-2 h-0.5 flex-1",
                    isDone ? "bg-primary-from" : "bg-card-dark"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
