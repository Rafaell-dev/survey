"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { portfolioPublicApiService } from "@/services/portfolio.service";
import { PortfolioLayout } from "@/components/portfolio/PortfolioLayout";
import { Loader2 } from "lucide-react";

export default function PublicPortfolioPage() {
  const { slug } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      portfolioPublicApiService.getPortfolio(slug as string)
        .then(res => setData(res))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data || !data.profile) {
    return (
      <div className="h-screen flex items-center justify-center">
        <h1 className="text-2xl font-bold">Portfólio não encontrado</h1>
      </div>
    );
  }

  const { profile, interests, educations } = data;

  return (
    <PortfolioLayout
      isEditing={false}
      profile={profile}
      interests={interests || []}
      educations={educations || []}
    />
  );
}
