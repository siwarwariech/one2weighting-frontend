// src/components/ui/input.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "flex h-10 w-full rounded-xl border px-3 py-2 text-sm shadow focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";
