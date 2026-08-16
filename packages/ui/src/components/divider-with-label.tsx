import * as React from "react";
import { cn } from "../lib/utils";

export interface DividerWithLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
}

export function DividerWithLabel({ label, className, ...props }: DividerWithLabelProps) {
  return (
    <div className={cn("relative flex items-center py-1", className)} {...props}>
      <div className="h-px w-full bg-border" />
      <span className="absolute left-1/2 -translate-x-1/2 bg-card px-3 text-xs text-muted-foreground">
        {label}
      </span>
    </div>
  );
}
