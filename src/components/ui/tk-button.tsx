import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const tkButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-extrabold transition-all duration-150 select-none disabled:pointer-events-none disabled:opacity-50 rounded-[var(--tk-radius)] border-solid",
  {
    variants: {
      variant: {
        primary:
          "border-[2.5px] border-tk-charcoal bg-tk-orange text-tk-charcoal [box-shadow:var(--tk-shadow)] hover:bg-tk-orange-dark hover:-translate-x-px hover:-translate-y-px hover:[box-shadow:5px_5px_0_var(--tk-charcoal)] active:translate-x-0.5 active:translate-y-0.5 active:[box-shadow:2px_2px_0_var(--tk-charcoal)]",
        secondary:
          "border-[2.5px] border-tk-charcoal bg-tk-cream text-tk-charcoal [box-shadow:var(--tk-shadow)] hover:bg-[#E8E2D8] hover:-translate-x-px hover:-translate-y-px hover:[box-shadow:5px_5px_0_var(--tk-charcoal)] active:translate-x-0.5 active:translate-y-0.5 active:[box-shadow:2px_2px_0_var(--tk-charcoal)]",
        nav: "border-2 border-tk-charcoal bg-tk-charcoal text-tk-cream [box-shadow:3px_3px_0_var(--tk-orange)] hover:bg-[#5A6B62]",
      },
      size: {
        sm: "text-sm px-4 py-2",
        md: "text-[15px] px-[22px] py-3",
        lg: "text-base px-7 py-3.5",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface TkButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof tkButtonVariants> {}

const TkButton = React.forwardRef<HTMLButtonElement, TkButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(tkButtonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
TkButton.displayName = "TkButton";

export { TkButton, tkButtonVariants };
