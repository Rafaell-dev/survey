"use client";

import { useEffect, useState } from "react";
import { PortfolioLayout } from "@/components/portfolio/PortfolioLayout";
import { 
  portfolioService, 
  PortfolioProfile, 
  PortfolioInterest, 
  PortfolioEducation 
} from "@/services/portfolio.service";
import { Loader2, Save, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PortfolioDashboardPage() {
  const [profile, setProfile] = useState<Partial<PortfolioProfile>>({});
  const [interests, setInterests] = useState<PortfolioInterest[]>([]);
  const [educations, setEducations] = useState<PortfolioEducation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Tracking deleted items for bulk save
  const [deletedInterests, setDeletedInterests] = useState<string[]>([]);
  const [deletedEducations, setDeletedEducations] = useState<string[]>([]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "Você possui alterações não salvas. Deseja realmente sair?";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profData, intData, eduData] = await Promise.all([
          portfolioService.getProfile().catch(() => ({})),
          portfolioService.getInterests().catch(() => []),
          portfolioService.getEducations().catch(() => []),
        ]);
        setProfile(profData as Partial<PortfolioProfile>);
        setInterests(intData);
        setEducations(eduData);
      } catch (error) {
        console.error("Error fetching portfolio data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUpdateProfile = (data: Partial<PortfolioProfile>) => {
    setProfile(prev => ({ ...prev, ...data }));
    setIsDirty(true);
  };

  const handleSaveChanges = async () => {
    // 1. Force blur on active element to trigger any pending validations
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    // 2. Validate visually
    setTimeout(async () => {
      const errorElement = document.querySelector('[aria-invalid="true"]');
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
        alert("Existem informações inválidas antes de salvar o portfólio.");
        return;
      }

      setIsSaving(true);
      try {
        // Bulk save logic
        await portfolioService.updateProfile(profile);

        // Process Interests
        for (const id of deletedInterests) {
          if (!id.startsWith("temp-")) await portfolioService.deleteInterest(id);
        }
        for (const int of interests) {
          if (int.id.startsWith("temp-")) {
            await portfolioService.createInterest({ namePt: int.namePt, nameEn: int.nameEn });
          } else {
            await portfolioService.updateInterest(int.id, { namePt: int.namePt, nameEn: int.nameEn, orderIndex: int.orderIndex });
          }
        }

        // Process Educations
        for (const id of deletedEducations) {
          if (!id.startsWith("temp-")) await portfolioService.deleteEducation(id);
        }
        for (const edu of educations) {
          if (edu.id.startsWith("temp-")) {
            await portfolioService.createEducation({ degreePt: edu.degreePt, degreeEn: edu.degreeEn, institution: edu.institution, year: edu.year });
          } else {
            await portfolioService.updateEducation(edu.id, { degreePt: edu.degreePt, degreeEn: edu.degreeEn, institution: edu.institution, year: edu.year, orderIndex: edu.orderIndex });
          }
        }

        // Reload fresh data to get correct IDs
        const [profData, intData, eduData] = await Promise.all([
          portfolioService.getProfile(),
          portfolioService.getInterests(),
          portfolioService.getEducations(),
        ]);
        setProfile(profData as Partial<PortfolioProfile>);
        setInterests(intData);
        setEducations(eduData);
        setDeletedInterests([]);
        setDeletedEducations([]);
        
        setIsDirty(false);
        // Alert handled by Sonner usually, but we use native for now
        alert("Portfólio atualizado com sucesso.");
      } catch (error) {
        console.error("Failed to update profile", error);
        alert("Não foi possível salvar. Tente novamente em alguns instantes.");
      } finally {
        setIsSaving(false);
      }
    }, 100);
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      const updated = await portfolioService.uploadAvatar(file);
      setProfile(updated);
    } catch (error) {
      console.error("Failed to upload avatar", error);
    }
  };

  const handleAddInterest = () => {
    const newInterest = { id: `temp-${Date.now()}`, namePt: "Novo Interesse", nameEn: "New Interest", orderIndex: interests.length } as PortfolioInterest;
    setInterests([...interests, newInterest]);
    setIsDirty(true);
  };

  const handleUpdateInterest = (id: string, data: Partial<PortfolioInterest>) => {
    setInterests(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
    setIsDirty(true);
  };

  const handleDeleteInterest = (id: string) => {
    if (confirm("Remover este interesse?")) {
      setInterests(prev => prev.filter(i => i.id !== id));
      setDeletedInterests([...deletedInterests, id]);
      setIsDirty(true);
    }
  };

  const handleAddEducation = () => {
    const newEdu = {
      id: `temp-${Date.now()}`,
      degreePt: "Nova Formação",
      degreeEn: "New Education",
      institution: "Instituição",
      year: new Date().getFullYear(),
      orderIndex: educations.length
    } as PortfolioEducation;
    setEducations([...educations, newEdu]);
    setIsDirty(true);
  };

  const handleUpdateEducation = (id: string, data: Partial<PortfolioEducation>) => {
    setEducations(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
    setIsDirty(true);
  };

  const handleDeleteEducation = (id: string) => {
    if (confirm("Remover esta formação?")) {
      setEducations(prev => prev.filter(e => e.id !== id));
      setDeletedEducations([...deletedEducations, id]);
      setIsDirty(true);
    }
  };

  const handleReorderInterests = (newOrder: PortfolioInterest[]) => {
    setInterests(newOrder);
    setIsDirty(true);
  };

  const handleReorderEducations = (newOrder: PortfolioEducation[]) => {
    setEducations(newOrder);
    setIsDirty(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <PortfolioLayout
        isEditing={true}
        profile={profile}
        interests={interests}
        educations={educations}
        onUpdateProfile={handleUpdateProfile}
        onAvatarUpload={handleAvatarUpload}
        onAddInterest={handleAddInterest}
        onUpdateInterest={handleUpdateInterest}
        onDeleteInterest={handleDeleteInterest}
        onAddEducation={handleAddEducation}
        onUpdateEducation={handleUpdateEducation}
        onDeleteEducation={handleDeleteEducation}
        onReorderInterests={handleReorderInterests}
        onReorderEducations={handleReorderEducations}
      />

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t shadow-lg z-50 flex items-center justify-between md:justify-end gap-4 px-4 sm:px-8">
        <Button 
          variant="outline" 
          asChild 
          className="gap-2"
        >
          <a href={`/p/${profile.slug}`} target="_blank" rel="noopener noreferrer">
            Página Pública <ExternalLink className="w-4 h-4" />
          </a>
        </Button>

        <Button 
          onClick={handleSaveChanges} 
          disabled={!isDirty || isSaving}
          className="gap-2"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isSaving ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>
    </>
  );
}
