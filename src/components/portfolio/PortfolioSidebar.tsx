import { PortfolioProfile } from "@/services/portfolio.service";
import { EditableField } from "./EditableField";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Code, Briefcase, Mail, GraduationCap, Camera } from "lucide-react";
import { useRef, useState, useEffect } from "react";
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
  const [localThemeColor, setLocalThemeColor] = useState(profile.themeColor || "#000000");
  const [avatarError, setAvatarError] = useState<string | null>(null);

  useEffect(() => {
    if (profile.themeColor) {
      setLocalThemeColor(profile.themeColor);
    }
  }, [profile.themeColor]);

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
          label="Nome Completo"
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
          label="Cargo / Título"
          isEditing={isEditing}
          value={profile.title || ""}
          onSave={(v) => onUpdate({ title: v })}
          placeholder="Seu cargo (ex: Professora Doutora)"
          className="text-lg font-medium text-muted-foreground text-center md:text-left"
          validator={portfolioProfileSchema.shape.title}
          maxLength={100}
        />
        <EditableField
          id="profile-institution"
          label="Instituição Principal"
          isEditing={isEditing}
          value={profile.institution || ""}
          onSave={(v) => onUpdate({ institution: v })}
          placeholder="Sua instituição (ex: Unicamp)"
          className="text-muted-foreground text-center md:text-left"
          validator={portfolioProfileSchema.shape.institution}
          maxLength={50}
        />
        {isEditing && (
          <EditableField
            id="profile-slug"
            label="Link Público (Slug)"
            isEditing={isEditing}
            value={profile.slug || ""}
            onSave={(v) => onUpdate({ slug: v.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
            placeholder="seu-link-aqui"
            className="text-sm text-primary font-medium text-center md:text-left mt-2"
            validator={portfolioProfileSchema.shape.slug}
            maxLength={100}
          />
        )}
        {isEditing && (
          <div className="mt-4 flex flex-col items-center md:items-start space-y-2">
            <label htmlFor="theme-color" className="text-sm font-semibold text-muted-foreground">Cor de Destaque</label>
            <div className="flex items-center gap-2">
              <input
                id="theme-color"
                type="color"
                value={localThemeColor}
                onChange={(e) => setLocalThemeColor(e.target.value)}
                onBlur={() => onUpdate({ themeColor: localThemeColor })}
                className="w-8 h-8 rounded cursor-pointer border-0 p-0 bg-transparent"
                title="Escolher cor de destaque"
              />
              <span className="text-xs text-muted-foreground uppercase">{localThemeColor}</span>
            </div>
          </div>
        )}
      </div>

      {/* Social Links (View Only) */}
      <div className="w-full mt-4">
        <div className="flex flex-wrap gap-4 justify-center md:justify-start text-primary">
          {profile.email && (
            <a href={`mailto:${profile.email}`} target="_blank" rel="noopener noreferrer" className="hover:text-primary/80 transition-colors">
              <Mail className="w-6 h-6" />
            </a>
          )}
          {profile.lattesUrl && (
            <a href={profile.lattesUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary/80 transition-colors">
              <GraduationCap className="w-6 h-6" />
            </a>
          )}
          {profile.githubUrl && (
            <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary/80 transition-colors">
              <Code className="w-6 h-6" />
            </a>
          )}
          {profile.linkedinUrl && (
            <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary/80 transition-colors">
              <Briefcase className="w-6 h-6" />
            </a>
          )}
        </div>
      </div>
    </aside>
  );
}
