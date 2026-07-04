"use client";

import { Check } from "lucide-react";
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
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 border-tk-charcoal text-sm font-bold",
                    isDone && "bg-tk-sage text-white",
                    isActive && "bg-tk-orange text-tk-charcoal",
                    !isDone && !isActive && "bg-tk-cream text-tk-charcoal"
                  )}
                >
                  {isDone ? <Check size={16} /> : stepNumber}
                </div>
                <span
                  className={cn(
                    "hidden text-xs sm:block",
                    isActive ? "font-bold text-tk-charcoal" : "text-tk-muted"
                  )}
                >
                  {label}
                </span>
              </div>

              {stepNumber !== STEP_LABELS.length && (
                <div
                  className={cn(
                    "mx-2 h-[2px] flex-1",
                    isDone ? "bg-tk-sage" : "bg-[#D6CEC4]"
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
