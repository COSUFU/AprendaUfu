import * as React from "react";
import { cn } from "../lib/utils";

const STACK_COLORS = [
  "bg-violet-500",
  "bg-orange-500",
  "bg-teal-500",
  "bg-pink-500",
  "bg-blue-500",
];

export interface AvatarStackProps extends React.HTMLAttributes<HTMLDivElement> {
  initials: string[];
  extraCount?: string;
}

export function AvatarStack({ initials, extraCount, className, ...props }: AvatarStackProps) {
  return (
    <div className={cn("flex items-center -space-x-2.5", className)} {...props}>
      {initials.map((label, index) => (
        <span
          key={label + index}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full border-2 border-background text-[11px] font-semibold text-white",
            STACK_COLORS[index % STACK_COLORS.length],
          )}
        >
          {label}
        </span>
      ))}
      {extraCount ? (
        <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-[11px] font-semibold text-foreground">
          {extraCount}
        </span>
      ) : null}
    </div>
  );
}
