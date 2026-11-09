"use client";

import { useEffect } from "react";
import { Button, Logo } from "@aprendaufu/ui";
import { MESSAGES } from "@aprendaufu/messages";
import { BackgroundGlow } from "@/components/background-glow";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="relative min-h-screen bg-background">
      <BackgroundGlow />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10 lg:px-10">
        <Logo />

        <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
          <p className="text-sm font-medium text-accent">{MESSAGES.errorPage.label}</p>
          <h1 className="max-w-xl text-4xl font-bold leading-tight tracking-tight text-foreground lg:text-5xl">
            {MESSAGES.errorPage.title}
          </h1>
          <p className="max-w-md text-base text-muted-foreground">
            {MESSAGES.errorPage.description}
          </p>
          <div className="w-full max-w-xs">
            <Button variant="accent" size="lg" onClick={reset}>
              {MESSAGES.errorPage.retry}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
