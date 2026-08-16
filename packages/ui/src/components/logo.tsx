import { cn } from "../lib/utils";

export interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-sm font-bold text-accent-foreground">
        A
      </span>
      <span className="text-base font-bold text-foreground">AprendaUfu</span>
    </div>
  );
}
