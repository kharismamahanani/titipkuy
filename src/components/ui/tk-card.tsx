import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const tkCardVariants = cva("rounded-xl border-2 border-tk-charcoal p-5", {
  variants: {
    variant: {
      default: "bg-tk-card [box-shadow:var(--tk-shadow)]",
      orange: "bg-tk-orange text-tk-charcoal [box-shadow:var(--tk-shadow)]",
      sage: "bg-tk-sage text-tk-cream [box-shadow:var(--tk-shadow)]",
      outline: "bg-tk-cream shadow-none",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface TkCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tkCardVariants> {}

const TkCard = React.forwardRef<HTMLDivElement, TkCardProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(tkCardVariants({ variant, className }))}
        {...props}
      />
    );
  }
);
TkCard.displayName = "TkCard";

export { TkCard, tkCardVariants };
