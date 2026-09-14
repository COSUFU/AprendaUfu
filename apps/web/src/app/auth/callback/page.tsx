"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { saveAccessToken } from "@/lib/auth-client";

const TOKEN_HASH_KEY = "token";
const OAUTH_ERROR_URL = "/login?error=oauth";
const HOME_URL = "/";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const token = new URLSearchParams(window.location.hash.slice(1)).get(TOKEN_HASH_KEY);

    if (!token) {
      router.replace(OAUTH_ERROR_URL);
      return;
    }

    saveAccessToken(token);
    window.location.hash = "";
    router.replace(HOME_URL);
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background">
      <p className="text-sm text-muted-foreground">Concluindo o login...</p>
    </main>
  );
}
