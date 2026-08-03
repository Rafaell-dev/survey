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
    setIsSaving(true);
    try {
      const updated = await portfolioService.updateProfile(profile);
      setProfile(updated);
      setIsDirty(false);
      alert("Alterações salvas com sucesso!");
    } catch (error) {
      console.error("Failed to update profile", error);
      alert("Erro ao salvar alterações. Verifique os campos.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      const updated = await portfolioService.uploadAvatar(file);
      setProfile(updated);
    } catch (error) {
      console.error("Failed to upload avatar", error);
    }
  };

  const handleAddInterest = async () => {
    try {
      const newInterest = await portfolioService.createInterest({ namePt: "Novo Interesse", nameEn: "New Interest" });
      setInterests([...interests, newInterest]);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateInterest = async (id: string, data: Partial<PortfolioInterest>) => {
    setInterests(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
    try {
      await portfolioService.updateInterest(id, data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteInterest = async (id: string) => {
    setInterests(prev => prev.filter(i => i.id !== id));
    try {
      await portfolioService.deleteInterest(id);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddEducation = async () => {
    try {
      const newEdu = await portfolioService.createEducation({
        degreePt: "Nova Formação",
        degreeEn: "New Education",
        institution: "Instituição",
        year: new Date().getFullYear(),
      });
      setEducations([...educations, newEdu]);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateEducation = async (id: string, data: Partial<PortfolioEducation>) => {
    setEducations(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
    try {
      await portfolioService.updateEducation(id, data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteEducation = async (id: string) => {
    setEducations(prev => prev.filter(e => e.id !== id));
    try {
      await portfolioService.deleteEducation(id);
    } catch (error) {
      console.error(error);
    }
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
