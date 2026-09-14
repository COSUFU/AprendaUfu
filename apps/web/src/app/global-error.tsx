"use client";

import "./globals.css";
import { useEffect } from "react";
import { MESSAGES } from "@aprendaufu/messages";

export default function GlobalError({
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
    <html lang="pt-BR" className="dark">
      <body>
        <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
          <p className="text-sm font-medium text-accent">{MESSAGES.errorPage.label}</p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {MESSAGES.errorPage.title}
          </h1>
          <p className="max-w-md text-muted-foreground">{MESSAGES.errorPage.description}</p>
          <button
            type="button"
            onClick={reset}
            className="mt-2 rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
          >
            {MESSAGES.errorPage.retry}
          </button>
        </main>
      </body>
    </html>
  );
}
