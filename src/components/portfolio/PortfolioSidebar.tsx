import { PortfolioProfile } from "@/services/portfolio.service";
import { EditableField } from "./EditableField";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Code, Briefcase, Mail, GraduationCap, Camera } from "lucide-react";
import { useRef, useState } from "react";
import { portfolioProfileSchema, normalizeGithubUrl, normalizeLinkedinUrl, normalizeLattesUrl } from "@/lib/portfolio-validators";
import { AlertCircle } from "lucide-react";

interface PortfolioSidebarProps {
  profile: Partial<PortfolioProfile>;
  isEditing: boolean;
  onUpdate: (data: Partial<PortfolioProfile>) => void;
  onAvatarUpload?: (file: File) => void;
}

export function PortfolioSidebar({ profile, isEditing, onUpdate, onAvatarUpload }: PortfolioSidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [avatarError, setAvatarError] = useState<string | null>(null);

  const handleAvatarClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAvatarError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Validate format
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setAvatarError("Formato não suportado. Use JPG, PNG ou WEBP.");
      return;
    }

    // 2. Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("Arquivo maior que 5 MB.");
      return;
    }

    // 3. Validate dimensions (min 300x300)
    const img = new window.Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      if (img.width < 300 || img.height < 300) {
        setAvatarError("Imagem muito pequena. Mínimo: 300x300.");
      } else {
        if (onAvatarUpload) onAvatarUpload(file);
      }
    };
    img.src = objectUrl;
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
        {avatarError && (
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-destructive flex items-center gap-1 bg-background/80 px-2 py-1 rounded">
            <AlertCircle className="w-3 h-3" />
            {avatarError}
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
          id="profile-name"
          isEditing={isEditing}
          value={profile.name || ""}
          onSave={(v) => onUpdate({ name: v })}
          placeholder="Seu nome completo"
          className="text-2xl font-bold tracking-tight text-center md:text-left"
          validator={portfolioProfileSchema.shape.name}
          maxLength={100}
        />
        <EditableField
          id="profile-title"
          isEditing={isEditing}
          value={profile.title || ""}
          onSave={(v) => onUpdate({ title: v })}
          placeholder="Seu Cargo / Título (ex: Professora de Linguística)"
          className="text-lg text-muted-foreground text-center md:text-left"
          validator={portfolioProfileSchema.shape.title}
          maxLength={100}
        />
        <EditableField
          id="profile-institution"
          isEditing={isEditing}
          value={profile.institution || ""}
          onSave={(v) => onUpdate({ institution: v })}
          placeholder="Instituição (ex: Universidade de São Paulo)"
          className="text-md text-muted-foreground text-center md:text-left"
          validator={portfolioProfileSchema.shape.institution}
          maxLength={100}
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
              <Mail className="w-4 h-4 text-muted-foreground shrink-0 mt-2" />
              <div className="flex-1">
                <EditableField
                  id="profile-email"
                  isEditing={isEditing}
                  value={profile.email || ""}
                  onSave={(v) => onUpdate({ email: v })}
                  placeholder="Email..."
                  className="h-8 text-sm"
                  validator={portfolioProfileSchema.shape.email}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-muted-foreground shrink-0 mt-2" />
              <div className="flex-1">
                <EditableField
                  id="profile-lattes"
                  isEditing={isEditing}
                  value={profile.lattesUrl || ""}
                  onSave={(v) => onUpdate({ lattesUrl: normalizeLattesUrl(v) })}
                  placeholder="Link Currículo Lattes..."
                  className="h-8 text-sm"
                  validator={portfolioProfileSchema.shape.lattesUrl}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-muted-foreground shrink-0 mt-2" />
              <div className="flex-1">
                <EditableField
                  id="profile-github"
                  isEditing={isEditing}
                  value={profile.githubUrl || ""}
                  onSave={(v) => onUpdate({ githubUrl: normalizeGithubUrl(v) })}
                  placeholder="Link GitHub..."
                  className="h-8 text-sm"
                  validator={portfolioProfileSchema.shape.githubUrl}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-muted-foreground shrink-0 mt-2" />
              <div className="flex-1">
                <EditableField
                  id="profile-linkedin"
                  isEditing={isEditing}
                  value={profile.linkedinUrl || ""}
                  onSave={(v) => onUpdate({ linkedinUrl: normalizeLinkedinUrl(v) })}
                  placeholder="Link LinkedIn..."
                  className="h-8 text-sm"
                  validator={portfolioProfileSchema.shape.linkedinUrl}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
