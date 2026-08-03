import { PortfolioEducation, PortfolioInterest, PortfolioProfile } from "@/services/portfolio.service";
import { PortfolioSidebar } from "./PortfolioSidebar";
import { AboutTab } from "./AboutTab";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface PortfolioLayoutProps {
  profile: Partial<PortfolioProfile>;
  interests: PortfolioInterest[];
  educations: PortfolioEducation[];
  isEditing: boolean;
  onUpdateProfile?: (data: Partial<PortfolioProfile>) => void;
  onAvatarUpload?: (file: File) => void;
  onAddInterest?: () => void;
  onUpdateInterest?: (id: string, data: Partial<PortfolioInterest>) => void;
  onDeleteInterest?: (id: string) => void;
  onAddEducation?: () => void;
  onUpdateEducation?: (id: string, data: Partial<PortfolioEducation>) => void;
  onDeleteEducation?: (id: string) => void;
}

export function PortfolioLayout({
  profile,
  interests,
  educations,
  isEditing,
  onUpdateProfile,
  onAvatarUpload,
  onAddInterest,
  onUpdateInterest,
  onDeleteInterest,
  onAddEducation,
  onUpdateEducation,
  onDeleteEducation,
}: PortfolioLayoutProps) {
  const [activeTab, setActiveTab] = useState("sobre");

  const tabs = [
    { id: "sobre", label: "Sobre" },
    { id: "aba2", label: "Aba 2" },
    { id: "aba3", label: "Aba 3" },
    { id: "aba4", label: "Aba 4" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header / Navigation */}
      <header className="w-full border-b sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="font-bold text-xl uppercase tracking-widest hidden md:block">
            {profile.name || "Seu Nome"}
          </div>
          
          <nav className="flex space-x-1 md:space-x-8 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap",
                  activeTab === tab.id
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row gap-12 lg:gap-24">
          
          {/* Sidebar */}
          <PortfolioSidebar 
            profile={profile} 
            isEditing={isEditing} 
            onUpdate={onUpdateProfile || (() => {})} 
            onAvatarUpload={onAvatarUpload}
          />

          {/* Tab Content */}
          <div className="flex-1 min-w-0">
            {activeTab === "sobre" && (
              <AboutTab 
                profile={profile}
                interests={interests}
                educations={educations}
                isEditing={isEditing}
                onUpdateProfile={onUpdateProfile || (() => {})}
                onAddInterest={onAddInterest}
                onUpdateInterest={onUpdateInterest}
                onDeleteInterest={onDeleteInterest}
                onAddEducation={onAddEducation}
                onUpdateEducation={onUpdateEducation}
                onDeleteEducation={onDeleteEducation}
              />
            )}
            
            {activeTab !== "sobre" && (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <section>
                  <h2 className="text-3xl font-light mb-6 tracking-tight capitalize">
                    {tabs.find(t => t.id === activeTab)?.label}
                  </h2>
                  <div className="text-lg leading-relaxed text-muted-foreground italic">
                    Conteúdo em desenvolvimento...
                  </div>
                </section>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
