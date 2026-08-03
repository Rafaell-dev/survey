"use client";

import { useEffect, useState } from "react";
import { PortfolioLayout } from "@/components/portfolio/PortfolioLayout";
import { 
  portfolioService, 
  PortfolioProfile, 
  PortfolioInterest, 
  PortfolioEducation 
} from "@/services/portfolio.service";
import { Loader2 } from "lucide-react";

export default function PortfolioDashboardPage() {
  const [profile, setProfile] = useState<Partial<PortfolioProfile>>({});
  const [interests, setInterests] = useState<PortfolioInterest[]>([]);
  const [educations, setEducations] = useState<PortfolioEducation[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleUpdateProfile = async (data: Partial<PortfolioProfile>) => {
    // Optimistic update
    setProfile(prev => ({ ...prev, ...data }));
    try {
      const updated = await portfolioService.updateProfile(data);
      setProfile(updated);
    } catch (error) {
      console.error("Failed to update profile", error);
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
  );
}
