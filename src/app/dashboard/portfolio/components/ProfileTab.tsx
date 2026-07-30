"use client";

import { useEffect, useState } from "react";
import { portfolioService, PortfolioProfile } from "@/services/portfolio.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Save, Loader2, Link as LinkIcon, User, Globe, ExternalLink, Camera, Star } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

export function ProfileTab() {
  const [profile, setProfile] = useState<Partial<PortfolioProfile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await portfolioService.getProfile();
      setProfile(data);
    } catch (error) {
      toast.error("Erro ao carregar perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await portfolioService.updateProfile(profile);
      toast.success("Perfil salvo com sucesso!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao salvar perfil");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setSaving(true);
      const updatedProfile = await portfolioService.uploadAvatar(file);
      setProfile(updatedProfile);
      toast.success("Foto atualizada com sucesso!");
    } catch (error) {
      toast.error("Erro ao fazer upload da foto");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h2 className="text-xl font-semibold">Configurações Gerais</h2>
          <p className="text-sm text-muted-foreground">Informações principais que aparecem na página inicial.</p>
        </div>
        <div className="flex gap-2">
          {profile.slug && (
            <Button variant="outline" asChild className="gap-2">
              <a href={`/p/${profile.slug}`} target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4" />
                Visualizar Página
              </a>
            </Button>
          )}
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Salvar Alterações
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground"/> Nome Completo</label>
            <Input 
              value={profile.name || ""} 
              onChange={e => setProfile({...profile, name: e.target.value})} 
              placeholder="Ex: João da Silva"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2"><Globe className="h-4 w-4 text-muted-foreground"/> URL do Portfólio (Slug)</label>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground bg-muted px-3 py-2 rounded-md border text-sm">/p/</span>
              <Input 
                value={profile.slug || ""} 
                onChange={e => setProfile({...profile, slug: e.target.value})} 
                placeholder="ex: joao-silva"
              />
            </div>
            <p className="text-xs text-muted-foreground">Esta será a URL pública da sua página.</p>
          </div>


          <div className="space-y-2">
            <label className="text-sm font-medium">Foto de Perfil (Avatar)</label>
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 rounded-full border bg-muted flex items-center justify-center overflow-hidden">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div className="space-y-2">
                <Button variant="outline" className="gap-2 relative">
                  <Camera className="h-4 w-4" />
                  Escolher Foto
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleAvatarUpload}
                  />
                </Button>
                <p className="text-xs text-muted-foreground">Tamanho recomendado: 256x256. Formatos JPG, PNG.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2"><LinkIcon className="h-4 w-4 text-muted-foreground"/> Redes Sociais e Profissionais</label>
            
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <Switch checked={profile.showGithub ?? true} onCheckedChange={(checked) => setProfile({...profile, showGithub: checked})} />
                <span className="text-sm font-medium w-16 text-muted-foreground">GitHub:</span>
                <Input 
                  value={profile.githubUrl || ""} 
                  onChange={e => setProfile({...profile, githubUrl: e.target.value})} 
                  placeholder="URL do GitHub"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Switch checked={profile.showLattes ?? true} onCheckedChange={(checked) => setProfile({...profile, showLattes: checked})} />
                <span className="text-sm font-medium w-16 text-muted-foreground">Lattes:</span>
                <Input 
                  value={profile.lattesUrl || ""} 
                  onChange={e => setProfile({...profile, lattesUrl: e.target.value})} 
                  placeholder="URL do Currículo Lattes"
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch checked={profile.showLinkedin ?? true} onCheckedChange={(checked) => setProfile({...profile, showLinkedin: checked})} />
                <span className="text-sm font-medium w-16 text-muted-foreground">LinkedIn:</span>
                <Input 
                  value={profile.linkedinUrl || ""} 
                  onChange={e => setProfile({...profile, linkedinUrl: e.target.value})} 
                  placeholder="URL do LinkedIn"
                />
              </div>
              
              <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                <Switch checked={profile.showEmail ?? true} onCheckedChange={(checked) => setProfile({...profile, showEmail: checked})} />
                <span className="text-sm font-medium w-16 text-muted-foreground">E-mail:</span>
                <Input 
                  type="email"
                  value={profile.email || ""} 
                  onChange={e => setProfile({...profile, email: e.target.value})} 
                  placeholder="E-mail de Contato"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-4 border-t">
        <label className="text-sm font-medium">Biografia / Sobre Mim (Multilíngue)</label>
        <Tabs defaultValue="pt" className="w-full">
          <TabsList className="mb-2">
            <TabsTrigger value="pt">Português (PT)</TabsTrigger>
            <TabsTrigger value="en">Inglês (EN)</TabsTrigger>
          </TabsList>
          
          <TabsContent value="pt">
            <Textarea 
              value={profile.aboutPt || ""} 
              onChange={e => setProfile({...profile, aboutPt: e.target.value})} 
              placeholder="Escreva sobre você em português..."
              className="min-h-[200px]"
            />
          </TabsContent>
          
          <TabsContent value="en">
            <Textarea 
              value={profile.aboutEn || ""} 
              onChange={e => setProfile({...profile, aboutEn: e.target.value})} 
              placeholder="Write about yourself in English..."
              className="min-h-[200px]"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
