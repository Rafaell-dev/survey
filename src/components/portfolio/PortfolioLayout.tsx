import { PortfolioEducation, PortfolioInterest, PortfolioProfile } from "@/services/portfolio.service";
import { PortfolioSidebar } from "./PortfolioSidebar";
import { AboutTab } from "./AboutTab";
import { TeachingTab, TeachingData } from "./TeachingTab";
import { ToolsTab, ToolsData } from "./ToolsTab";
import { SurveysTab } from "./SurveysTab";
import { useState, useEffect } from "react";
import { cn, hexToHsl } from "@/lib/utils";

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
  onReorderInterests?: (newOrder: PortfolioInterest[]) => void;
  onReorderEducations?: (newOrder: PortfolioEducation[]) => void;
  teachingData?: TeachingData;
  onUpdateTeaching?: (data: TeachingData) => void;
  toolsData?: ToolsData;
  onUpdateTools?: (data: ToolsData) => void;
  onSurveysChange?: (surveys: any[]) => void;
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
  onReorderInterests,
  onReorderEducations,
  teachingData,
  onUpdateTeaching,
  toolsData,
  onUpdateTools,
  onSurveysChange,
}: PortfolioLayoutProps) {
  const [activeTab, setActiveTab] = useState("sobre");

  const hasTeachingContent = Boolean(
    teachingData && (
      (teachingData.graduacao && teachingData.graduacao.length > 0) ||
      (teachingData.posGraduacao && teachingData.posGraduacao.length > 0) ||
      (teachingData.workshops && teachingData.workshops.length > 0) ||
      (teachingData.introText && teachingData.introText.trim().length > 0)
    )
  );

  const hasSurveysContent = Boolean(
    profile.surveys && profile.surveys.length > 0
  );

  const hasToolsContent = Boolean(
    toolsData && (
      (toolsData.items && toolsData.items.length > 0) ||
      (toolsData.introText && toolsData.introText.trim().length > 0)
    )
  );

  const tabs = [
    { id: "sobre", label: "Sobre", show: true },
    { id: "ensino", label: "Ensino", show: isEditing || hasTeachingContent },
    { id: "pesquisas", label: "Pesquisas", show: isEditing || hasSurveysContent },
    { id: "ferramentas", label: "Ferramentas & Projetos", show: isEditing || hasToolsContent },
  ].filter(t => t.show);

  useEffect(() => {
    if (!tabs.some(t => t.id === activeTab)) {
      setActiveTab("sobre");
    }
  }, [tabs, activeTab]);

  return (
    <div 
      className="min-h-screen bg-background" 
      style={profile.themeColor ? { 
        "--primary": hexToHsl(profile.themeColor),
        "--color-primary": profile.themeColor
      } as React.CSSProperties : undefined}
    >
      {/* Top Header / Navigation */}
      <header className="w-full border-b sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="font-bold text-xl uppercase tracking-widest hidden md:block">
            {profile.name || "Seu Nome"}
          </div>
          
          <nav className="flex space-x-1 md:space-x-8 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={profile.themeColor ? {
                    color: isActive ? profile.themeColor : undefined,
                    borderColor: isActive ? profile.themeColor : 'transparent',
                  } : undefined}
                  className={cn(
                    "px-3 py-2 text-sm font-medium transition-all whitespace-nowrap border-b-2 rounded-t-sm",
                    isActive
                      ? "text-primary border-primary font-semibold bg-primary/5"
                      : "text-muted-foreground border-transparent hover:text-primary hover:bg-primary/5"
                  )}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className={cn("max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12", isEditing ? "pb-48" : "pb-12")}>
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
                onReorderInterests={onReorderInterests}
                onReorderEducations={onReorderEducations}
              />
            )}

            {activeTab === "ensino" && (
              <TeachingTab 
                data={teachingData || { graduacao: [], posGraduacao: [], workshops: [] }}
                isEditing={isEditing}
                onUpdate={onUpdateTeaching || (() => {})}
              />
            )}

            {activeTab === "ferramentas" && (
              <ToolsTab 
                data={toolsData || { items: [] }}
                isEditing={isEditing}
                onUpdate={onUpdateTools || (() => {})}
              />
            )}

            {activeTab === "pesquisas" && (
              <SurveysTab 
                publicSurveys={profile.surveys}
                isEditing={isEditing}
                onSurveysChange={onSurveysChange}
              />
            )}
            
            {activeTab !== "sobre" && activeTab !== "ensino" && activeTab !== "ferramentas" && activeTab !== "pesquisas" && (
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
