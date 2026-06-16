"use client";

import { useState } from "react";
import { SurveyPlayerDTO } from "@/domain/public-survey.types";
import { CreateParticipantDTO } from "@/domain/participant.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface ParticipantFormProps {
  survey: SurveyPlayerDTO;
  onSubmit: (data: CreateParticipantDTO) => Promise<void>;
  loading?: boolean;
}

export function ParticipantForm({ survey, onSubmit, loading }: ParticipantFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string; phone?: string; general?: string }>({});

  const type = survey.participantIdentificationType;

  const validate = () => {
    const newErrors: typeof errors = {};
    
    if (type === "NAME_AND_EMAIL") {
      if (!name.trim()) newErrors.name = "Nome é obrigatório";
      if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) newErrors.email = "E-mail inválido";
    }

    if (type === "EMAIL") {
      if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) newErrors.email = "E-mail inválido";
    }

    if (type === "PHONE") {
      if (!phone.trim()) newErrors.phone = "Celular é obrigatório";
    }

    if (type === "EMAIL_OR_PHONE") {
      const hasEmail = email.trim() && /^\S+@\S+\.\S+$/.test(email);
      const hasPhone = !!phone.trim();
      
      if (!hasEmail && !hasPhone) {
        newErrors.general = "Preencha o e-mail ou o celular";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    await onSubmit({ 
      name: name.trim() || undefined, 
      email: email.trim() || undefined, 
      phone: phone.trim() || undefined 
    });
  };

  const showName = type === "NAME_AND_EMAIL";
  const showEmail = ["NAME_AND_EMAIL", "EMAIL", "EMAIL_OR_PHONE"].includes(type);
  const showPhone = ["PHONE", "EMAIL_OR_PHONE"].includes(type);

  if (type === "ANONYMOUS") {
    return (
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Iniciar Pesquisa"}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      {errors.general && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 rounded border border-destructive/20">
          {errors.general}
        </div>
      )}

      {showName && (
        <div className="space-y-2 text-left">
          <Label htmlFor="name">Nome completo</Label>
          <Input 
            id="name" 
            placeholder="Seu nome" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            disabled={loading}
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
        </div>
      )}

      {showEmail && (
        <div className="space-y-2 text-left">
          <Label htmlFor="email">E-mail</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="seu@email.com" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            disabled={loading}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
        </div>
      )}

      {showPhone && (
        <div className="space-y-2 text-left">
          <Label htmlFor="phone">Celular</Label>
          <Input 
            id="phone" 
            type="tel" 
            placeholder="(11) 90000-0000" 
            value={phone} 
            onChange={e => setPhone(e.target.value)} 
            disabled={loading}
          />
          {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
        </div>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Iniciar Pesquisa
      </Button>
    </form>
  );
}
