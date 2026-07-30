import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portfólio Institucional",
  description: "Página de perfil acadêmico e profissional",
};

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background font-sans antialiased text-foreground">
      {children}
    </div>
  );
}
