"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { portfolioPublicApiService } from "@/services/portfolio.service";
import { Loader2, Code, Briefcase, Mail, ExternalLink, Globe, GraduationCap, MapPin, Calendar, FileText, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

type Language = 'pt' | 'en';

export default function PublicPortfolioPage() {
  const { slug } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<Language>('pt');
  
  const [activeTab, setActiveTab] = useState<string>('home'); // home, research, teaching, etc.
  const [selectedToolCat, setSelectedToolCat] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      portfolioPublicApiService.getPortfolio(slug as string)
        .then(res => setData(res))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [slug]);

  const t = (pt: any, en: any) => lang === 'pt' ? (pt || en) : (en || pt);

  if (loading) {
    return <div className="h-screen w-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  if (!data) {
    return <div className="h-screen flex items-center justify-center"><h1 className="text-2xl font-bold">Portfólio não encontrado</h1></div>;
  }

  const { profile, interests, educations, surveys } = data;

  const renderContent = () => {
    if (activeTab === 'home') {
      return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* About */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">{t('Sobre mim', 'About me')}</h2>
            <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {t(profile.aboutPt, profile.aboutEn)}
            </div>
          </section>

          {/* Interests */}
          {interests?.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight">{t('Áreas de Atuação', 'Research Interests')}</h2>
              <div className="flex flex-wrap gap-2">
                {interests.map((int: any) => (
                  <span key={int.id} className="bg-secondary text-secondary-foreground px-4 py-1.5 rounded-full text-sm font-medium">
                    {t(int.namePt, int.nameEn)}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Education */}
          {educations?.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight">{t('Formação Acadêmica', 'Education')}</h2>
              <div className="space-y-6">
                {educations.map((edu: any) => (
                  <div key={edu.id} className="relative pl-6 border-l-2 border-primary/20 pb-2">
                    <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-1.5 ring-4 ring-background"></div>
                    <h3 className="text-lg font-semibold">{t(edu.degreePt, edu.degreeEn)}</h3>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-muted-foreground text-sm mt-1">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3"/> {edu.institution}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3"/> {edu.year}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Highlighted Surveys */}
          {surveys?.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                {t('Pesquisas em Destaque', 'Highlighted Surveys')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {surveys.map((survey: any) => (
                  <div key={survey.id} className="group border rounded-xl p-5 hover:border-primary/50 hover:shadow-md transition-all duration-300 bg-card flex flex-col h-full">
                    <h3 className="font-semibold group-hover:text-primary transition-colors mb-2 line-clamp-2">{survey.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1">
                      {survey.description || t('Participe desta pesquisa e contribua com nossos estudos.', 'Participate in this survey and contribute to our studies.')}
                    </p>
                    {survey.publicSlug && (
                      <Button asChild className="w-full gap-2 mt-auto" variant="outline">
                        <a href={`/survey/${survey.publicSlug}`} target="_blank" rel="noreferrer">
                          {t('Participar da Pesquisa', 'Take Survey')} <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
      
      {/* HEADER */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="font-bold text-xl tracking-tight cursor-pointer" onClick={() => setActiveTab('home')}>
            {profile.name}
          </div>
          
          <div className="hidden md:flex items-center gap-1">
            <Button variant="secondary" onClick={() => setActiveTab('home')}>{t('Início', 'Home')}</Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setLang(lang === 'pt' ? 'en' : 'pt')} className="gap-2 rounded-full px-4">
              <Globe className="h-4 w-4" /> {lang.toUpperCase()}
            </Button>
          </div>
        </div>
      </header>

      {/* MOBILE NAV (scrollable) */}
      <div className="md:hidden flex overflow-x-auto border-b bg-muted/30 px-2 py-2 gap-2 hide-scrollbar">
        <Button variant="secondary" size="sm" onClick={() => setActiveTab('home')} className="whitespace-nowrap rounded-full">{t('Início', 'Home')}</Button>
      </div>

      <main className="flex-1 w-full container max-w-6xl mx-auto px-4 md:px-8 py-12 md:py-20 grid grid-cols-1 md:grid-cols-12 gap-12">
        
        {/* HERO / PROFILE SIDEBAR */}
        <aside className="md:col-span-4 lg:col-span-3 flex flex-col items-center md:items-start text-center md:text-left space-y-6">
          <div className="w-40 h-40 md:w-full md:h-auto md:aspect-square rounded-full md:rounded-2xl overflow-hidden border-4 border-muted bg-muted/50 shadow-sm relative group">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-muted-foreground">
                {profile.name.charAt(0)}
              </div>
            )}
          </div>
          
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight">{profile.name}</h1>
            <p className="text-muted-foreground">{t('Pesquisador / Professor', 'Researcher / Professor')}</p>
          </div>

          <div className="flex gap-3 justify-center md:justify-start w-full">
            {profile.showGithub && profile.githubUrl && (
              <a href={profile.githubUrl} target="_blank" rel="noreferrer" className="p-2 rounded-full bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors" title="GitHub">
                <Code className="h-5 w-5" />
              </a>
            )}
            {profile.showLinkedin && profile.linkedinUrl && (
              <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" className="p-2 rounded-full bg-secondary text-secondary-foreground hover:bg-[#0077b5] hover:text-white transition-colors" title="LinkedIn">
                <Briefcase className="h-5 w-5" />
              </a>
            )}
            {profile.showLattes && profile.lattesUrl && (
              <a href={profile.lattesUrl} target="_blank" rel="noreferrer" className="p-2 rounded-full bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors" title="Currículo Lattes">
                <GraduationCap className="h-5 w-5" />
              </a>
            )}
            {profile.showEmail && profile.email && (
              <a href={`mailto:${profile.email}`} className="p-2 rounded-full bg-secondary text-secondary-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors" title="Email">
                <Mail className="h-5 w-5" />
              </a>
            )}
          </div>
        </aside>

        {/* DYNAMIC CONTENT AREA */}
        <div className="md:col-span-8 lg:col-span-9 min-h-[50vh]">
          {renderContent()}
        </div>

      </main>

      {/* FOOTER */}
      <footer className="border-t py-8 mt-auto bg-muted/20">
        <div className="container max-w-6xl mx-auto px-4 md:px-8 text-center text-sm text-muted-foreground flex flex-col items-center space-y-2">
          <p>© {new Date().getFullYear()} {profile.name}. {t('Todos os direitos reservados.', 'All rights reserved.')}</p>
          <div className="flex gap-4">
            {profile.showLattes && profile.lattesUrl && <a href={profile.lattesUrl} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">Lattes</a>}
            {profile.showGithub && profile.githubUrl && <a href={profile.githubUrl} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">GitHub</a>}
            {profile.showLinkedin && profile.linkedinUrl && <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">LinkedIn</a>}
          </div>
        </div>
      </footer>

    </div>
  );
}
