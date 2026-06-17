"use client";

import { useAuthStore } from "@/store/auth.store";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { LayoutDashboard, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const loading = useAuthStore((state) => state.loading);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Só redireciona se já terminou de carregar a sessão
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, router]);

  if (!user || loading) return null;

  const handleLogout = async () => {
    await logout();
  };

  const navItems = [
    { name: "Painel de Controle", href: "/dashboard", icon: LayoutDashboard },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-muted/20">
      
      {/* Mobile Topbar */}
      <header className="md:hidden flex items-center justify-between p-4 border-b bg-background sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-2 text-primary font-bold text-xl">
          <LayoutDashboard className="h-6 w-6" />
          <span>SurveyApp</span>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
          title="Sair da Conta"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </header>

      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-64 flex-shrink-0 border-r bg-background flex-col sticky top-0 h-screen">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2 text-primary font-bold text-xl">
            <LayoutDashboard />
            <span>SurveyApp</span>
          </div>
        </div>
        <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </div>
        <div className="p-4 border-t">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold shrink-0">
              {user.name.charAt(0)}
            </div>
            <div className="text-sm min-w-0">
              <p className="font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 w-full overflow-x-hidden">
        <div className="flex-1 p-4 sm:p-8 w-full max-w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
