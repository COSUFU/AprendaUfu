import { AvatarStack, Logo } from "@aprendaufu/ui";
import { BackgroundGlow } from "@/components/background-glow";
import { SignupCard } from "@/components/signup-card";

export default function SignupPage() {
  return (
    <main className="relative min-h-screen bg-background">
      <BackgroundGlow />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10 lg:px-10">
        <Logo />

        <div className="mt-16 grid flex-1 items-center gap-12 lg:mt-0 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-6">
            <h1 className="text-glitch text-4xl font-bold leading-tight tracking-tight text-foreground lg:text-5xl">
              Ninguém aprende sozinho na aba aberta.
            </h1>
            <p className="max-w-md text-base text-muted-foreground">
              Mapas de estudo feitos pela comunidade, com o conteúdo gratuito que realmente
              funcionou pra quem já passou por ali — e o selo dos professores em cima.
            </p>
            <div className="flex items-center gap-3">
              <AvatarStack initials={["AR", "PL", "MC"]} extraCount="+8k" />
              <span className="text-sm text-muted-foreground">
                8.412 pessoas estudando agora em 142 trilhas
              </span>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <SignupCard />
          </div>
        </div>
      </div>
    </main>
  );
}
