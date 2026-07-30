"use client";

import { useEffect, useState } from "react";
import { portfolioService, PortfolioEvent } from "@/services/portfolio.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Trash2, Plus, Loader2, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function EventsTab() {
  const [events, setEvents] = useState<PortfolioEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const [newTitlePt, setNewTitlePt] = useState("");
  const [newTitleEn, setNewTitleEn] = useState("");
  const [newInstitution, setNewInstitution] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newSlidesUrl, setNewSlidesUrl] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await portfolioService.getEvents();
      setEvents(data);
    } catch (error) {
      toast.error("Erro ao carregar eventos");
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async () => {
    if (!newTitlePt || !newTitleEn || !newInstitution || !newDate) return toast.error("Preencha todos os campos obrigatórios");
    try {
      const created = await portfolioService.createEvent({ 
        titlePt: newTitlePt, 
        titleEn: newTitleEn, 
        institution: newInstitution, 
        date: new Date(newDate).toISOString(),
        slidesUrl: newSlidesUrl || null
      });
      setEvents([created, ...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setNewTitlePt(""); setNewTitleEn(""); setNewInstitution(""); setNewDate(""); setNewSlidesUrl("");
      toast.success("Evento adicionado");
    } catch { toast.error("Erro ao salvar"); }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("Tem certeza?")) return;
    try {
      await portfolioService.deleteEvent(id);
      setEvents(events.filter(i => i.id !== id));
      toast.success("Excluído com sucesso");
    } catch { toast.error("Erro ao excluir"); }
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 border-b pb-2">
        <Calendar className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Eventos e Palestras</h3>
      </div>
      
      <Card className="bg-muted/30">
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-xs font-medium">Título Palestra (PT)</label>
            <Input value={newTitlePt} onChange={e => setNewTitlePt(e.target.value)} placeholder="Ex: IA na Pesquisa" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium">Título Palestra (EN)</label>
            <Input value={newTitleEn} onChange={e => setNewTitleEn(e.target.value)} placeholder="Ex: AI in Research" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium">Instituição/Evento</label>
            <Input value={newInstitution} onChange={e => setNewInstitution(e.target.value)} placeholder="Ex: Congresso Nacional" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium">Data</label>
            <Input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-medium">URL dos Slides (Opcional)</label>
            <Input type="url" value={newSlidesUrl} onChange={e => setNewSlidesUrl(e.target.value)} placeholder="https://..." />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <Button onClick={handleAddEvent} className="gap-2"><Plus className="h-4 w-4"/> Adicionar Evento</Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3 pt-2">
        {events.length === 0 && <span className="text-sm text-muted-foreground">Nenhum evento cadastrado.</span>}
        {events.map(event => (
          <div key={event.id} className="flex justify-between items-start p-4 border rounded-md hover:bg-muted/30 transition-colors">
            <div>
              <p className="font-semibold text-base">{event.titlePt}</p>
              <p className="text-sm text-muted-foreground mb-2">{event.titleEn}</p>
              <div className="flex gap-4 text-xs font-medium">
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full">{new Date(event.date).toLocaleDateString()}</span>
                <span className="text-muted-foreground">{event.institution}</span>
                {event.slidesUrl && <a href={event.slidesUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Ver Slides</a>}
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => handleDeleteEvent(event.id)} className="text-destructive hover:bg-destructive/10 shrink-0">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
