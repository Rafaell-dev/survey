"use client";

import { useEffect, useState } from "react";
import { portfolioService, PortfolioInterest, PortfolioEducation } from "@/services/portfolio.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Trash2, Plus, Loader2, GraduationCap, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function CurriculumTab() {
  const [interests, setInterests] = useState<PortfolioInterest[]>([]);
  const [educations, setEducations] = useState<PortfolioEducation[]>([]);
  const [loading, setLoading] = useState(true);

  // New Interest State
  const [newInterestPt, setNewInterestPt] = useState("");
  const [newInterestEn, setNewInterestEn] = useState("");

  // New Education State
  const [newDegreePt, setNewDegreePt] = useState("");
  const [newDegreeEn, setNewDegreeEn] = useState("");
  const [newInstitution, setNewInstitution] = useState("");
  const [newYear, setNewYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ints, edus] = await Promise.all([
        portfolioService.getInterests(),
        portfolioService.getEducations()
      ]);
      setInterests(ints);
      setEducations(edus);
    } catch (error) {
      toast.error("Erro ao carregar currículo");
    } finally {
      setLoading(false);
    }
  };

  const handleAddInterest = async () => {
    if (!newInterestPt || !newInterestEn) return toast.error("Preencha PT e EN");
    try {
      const created = await portfolioService.createInterest({ namePt: newInterestPt, nameEn: newInterestEn });
      setInterests([...interests, created]);
      setNewInterestPt("");
      setNewInterestEn("");
      toast.success("Interesse adicionado");
    } catch { toast.error("Erro ao salvar"); }
  };

  const handleDeleteInterest = async (id: string) => {
    if (!confirm("Tem certeza?")) return;
    try {
      await portfolioService.deleteInterest(id);
      setInterests(interests.filter(i => i.id !== id));
      toast.success("Excluído com sucesso");
    } catch { toast.error("Erro ao excluir"); }
  };

  const handleAddEducation = async () => {
    if (!newDegreePt || !newDegreeEn || !newInstitution) return toast.error("Preencha todos os campos textuais");
    try {
      const created = await portfolioService.createEducation({ 
        degreePt: newDegreePt, degreeEn: newDegreeEn, institution: newInstitution, year: Number(newYear) 
      });
      setEducations([created, ...educations].sort((a, b) => b.year - a.year));
      setNewDegreePt(""); setNewDegreeEn(""); setNewInstitution("");
      toast.success("Formação adicionada");
    } catch { toast.error("Erro ao salvar"); }
  };

  const handleDeleteEducation = async (id: string) => {
    if (!confirm("Tem certeza?")) return;
    try {
      await portfolioService.deleteEducation(id);
      setEducations(educations.filter(i => i.id !== id));
      toast.success("Excluído com sucesso");
    } catch { toast.error("Erro ao excluir"); }
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-10">
      
      {/* ========================================== */}
      {/* INTERESTS */}
      {/* ========================================== */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b pb-2">
          <Tag className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Interesses e Especialidades</h3>
        </div>
        
        <Card className="bg-muted/30">
          <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2">
              <label className="text-xs font-medium">Nome (PT)</label>
              <Input value={newInterestPt} onChange={e => setNewInterestPt(e.target.value)} placeholder="Ex: Linguística Computacional" />
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-xs font-medium">Nome (EN)</label>
              <Input value={newInterestEn} onChange={e => setNewInterestEn(e.target.value)} placeholder="Ex: Computational Linguistics" />
            </div>
            <Button onClick={handleAddInterest} className="gap-2 shrink-0"><Plus className="h-4 w-4"/> Adicionar</Button>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-2 pt-2">
          {interests.length === 0 && <span className="text-sm text-muted-foreground">Nenhum interesse cadastrado.</span>}
          {interests.map(interest => (
            <div key={interest.id} className="flex items-center gap-2 bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full text-sm">
              <span className="font-medium">{interest.namePt}</span>
              <span className="text-xs opacity-70">| {interest.nameEn}</span>
              <button onClick={() => handleDeleteInterest(interest.id)} className="ml-1 text-destructive hover:bg-destructive/10 rounded-full p-0.5">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>


      {/* ========================================== */}
      {/* EDUCATION */}
      {/* ========================================== */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b pb-2">
          <GraduationCap className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Formação Acadêmica</h3>
        </div>
        
        <Card className="bg-muted/30">
          <CardContent className="p-4 grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-medium">Grau (PT)</label>
              <Input value={newDegreePt} onChange={e => setNewDegreePt(e.target.value)} placeholder="Ex: Doutorado em Letras" />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-medium">Grau (EN)</label>
              <Input value={newDegreeEn} onChange={e => setNewDegreeEn(e.target.value)} placeholder="Ex: PhD in Linguistics" />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-medium">Instituição</label>
              <Input value={newInstitution} onChange={e => setNewInstitution(e.target.value)} placeholder="Ex: UFMG" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium">Ano</label>
              <Input type="number" value={newYear} onChange={e => setNewYear(Number(e.target.value))} />
            </div>
            <Button onClick={handleAddEducation} className="gap-2 shrink-0 md:col-span-2"><Plus className="h-4 w-4"/> Adicionar Formação</Button>
          </CardContent>
        </Card>

        <div className="space-y-2 pt-2">
          {educations.length === 0 && <span className="text-sm text-muted-foreground">Nenhuma formação cadastrada.</span>}
          {educations.map(edu => (
            <div key={edu.id} className="flex justify-between items-center p-3 border rounded-md hover:bg-muted/30">
              <div>
                <p className="font-semibold">{edu.degreePt} <span className="text-muted-foreground font-normal text-sm">/ {edu.degreeEn}</span></p>
                <p className="text-sm text-muted-foreground">{edu.institution} • {edu.year}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleDeleteEducation(edu.id)} className="text-destructive hover:bg-destructive/10">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
