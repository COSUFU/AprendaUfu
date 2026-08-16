"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  DividerWithLabel,
  GoogleIcon,
  Input,
  Label,
} from "@aprendaufu/ui";
import { register, saveSession } from "@/lib/auth-client";
import { ApiError } from "@/lib/api-client";

export function SignupCard() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      const auth = await register({ username, email, password });
      saveSession(auth);
      router.push("/");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível criar a conta. Tente de novo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md p-8">
      <CardHeader>
        <CardTitle>Criar conta</CardTitle>
        <CardDescription>Grátis. Sem prova de nível, sem assinatura.</CardDescription>
      </CardHeader>

      <CardContent className="mt-6">
        <Button variant="white">
          <GoogleIcon />
          Continuar com Google
        </Button>

        <Button variant="subtle">Conta institucional (.edu.br)</Button>

        <DividerWithLabel label="ou com e-mail" />

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="username" className="sr-only">
              Usuário
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="ana_ribeiro"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email" className="sr-only">
              E-mail
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="ana.ribeiro@aluno.univ.br"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="password" className="sr-only">
              Senha
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirm-password" className="sr-only">
              Confirmar senha
            </Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="Confirme a senha"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" variant="accent" size="lg" className="mt-1" disabled={loading}>
            {loading ? "Criando conta..." : "Criar conta e começar a estudar"}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="mt-6">
        Já tem uma conta?{" "}
        <a href="/login" className="font-medium text-accent hover:underline">
          Entrar
        </a>
      </CardFooter>
    </Card>
  );
}
