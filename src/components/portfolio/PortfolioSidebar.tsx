import { PortfolioProfile } from "@/services/portfolio.service";
import { EditableField } from "./EditableField";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Code, Briefcase, Mail, GraduationCap, Camera } from "lucide-react";
import { useRef } from "react";
import { Input } from "@/components/ui/input";

interface PortfolioSidebarProps {
  profile: Partial<PortfolioProfile>;
  isEditing: boolean;
  onUpdate: (data: Partial<PortfolioProfile>) => void;
  onAvatarUpload?: (file: File) => void;
}

export function PortfolioSidebar({ profile, isEditing, onUpdate, onAvatarUpload }: PortfolioSidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onAvatarUpload) {
      onAvatarUpload(file);
    }
  };

  const initials = profile.name
    ? profile.name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
    : "??";

  return (
    <aside className="w-full md:w-64 flex-shrink-0 flex flex-col items-center md:items-start text-center md:text-left space-y-6">
      <div className="relative group mx-auto md:mx-0">
        <Avatar className="w-48 h-48 border-4 border-background shadow-md">
          <AvatarImage src={profile.avatarUrl || ""} alt={profile.name || ""} className="object-cover" />
          <AvatarFallback className="text-4xl">{initials}</AvatarFallback>
        </Avatar>
        {isEditing && (
          <div 
            className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            onClick={handleAvatarClick}
          >
            <Camera className="w-8 h-8 text-white" />
          </div>
        )}
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*"
          onChange={handleFileChange} 
        />
      </div>

      <div className="w-full space-y-1">
        <EditableField
          isEditing={isEditing}
          value={profile.name || ""}
          onSave={(v) => onUpdate({ name: v })}
          placeholder="Seu nome completo"
          className="text-2xl font-bold tracking-tight text-center md:text-left"
        />
        <EditableField
          isEditing={isEditing}
          value={profile.title || ""}
          onSave={(v) => onUpdate({ title: v })}
          placeholder="Seu Cargo / Título (ex: Professora de Linguística)"
          className="text-lg text-muted-foreground text-center md:text-left"
        />
        <EditableField
          isEditing={isEditing}
          value={profile.institution || ""}
          onSave={(v) => onUpdate({ institution: v })}
          placeholder="Instituição (ex: Universidade de São Paulo)"
          className="text-md text-muted-foreground text-center md:text-left"
        />
      </div>

      {/* Social Links */}
      <div className="w-full">
        {!isEditing ? (
          <div className="flex flex-wrap gap-4 justify-center md:justify-start text-primary">
            {profile.email && profile.showEmail && (
              <a href={`mailto:${profile.email}`} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                <Mail className="w-6 h-6" />
              </a>
            )}
            {profile.lattesUrl && profile.showLattes && (
              <a href={profile.lattesUrl} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                <GraduationCap className="w-6 h-6" />
              </a>
            )}
            {profile.githubUrl && profile.showGithub && (
              <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                <Code className="w-6 h-6" />
              </a>
            )}
            {profile.linkedinUrl && profile.showLinkedin && (
              <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                <Briefcase className="w-6 h-6" />
              </a>
            )}
          </div>
        ) : (
          <div className="space-y-3 w-full bg-muted/30 p-4 rounded-md border border-dashed">
            <h4 className="text-sm font-semibold mb-2">Links & Redes (Visíveis)</h4>
            
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
              <Input 
                placeholder="Email..." 
                value={profile.email || ""} 
                onChange={(e) => onUpdate({ email: e.target.value })} 
                className="h-8 text-sm"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-muted-foreground shrink-0" />
              <Input 
                placeholder="Link Currículo Lattes..." 
                value={profile.lattesUrl || ""} 
                onChange={(e) => onUpdate({ lattesUrl: e.target.value })} 
                className="h-8 text-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-muted-foreground shrink-0" />
              <Input 
                placeholder="Link GitHub..." 
                value={profile.githubUrl || ""} 
                onChange={(e) => onUpdate({ githubUrl: e.target.value })} 
                className="h-8 text-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-muted-foreground shrink-0" />
              <Input 
                placeholder="Link LinkedIn..." 
                value={profile.linkedinUrl || ""} 
                onChange={(e) => onUpdate({ linkedinUrl: e.target.value })} 
                className="h-8 text-sm"
              />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
