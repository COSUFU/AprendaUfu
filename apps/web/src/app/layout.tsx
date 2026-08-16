import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AprendaUfu",
  description: "Mapas de estudo feitos pela comunidade.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <body>{children}</body>
    </html>
  );
}
