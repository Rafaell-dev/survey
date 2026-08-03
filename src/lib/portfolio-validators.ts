import { z } from "zod";

// =====================================
// SANEAMENTO E UTILS
// =====================================

export function sanitizeHTML(input: string): string {
  if (!input) return "";
  // Remove tags HTML
  let clean = input.replace(/<[^>]*>?/gm, "");
  // Remove javascript:, onclick=, onload=
  clean = clean.replace(/javascript:/gi, "");
  clean = clean.replace(/on\w+\s*=/gi, "");
  return clean;
}

export function sanitizeText(input: string): string {
  if (!input) return "";
  const noHtml = sanitizeHTML(input);
  // Remove múltiplos espaços e faz o trim
  return noHtml.replace(/\s\s+/g, " ").trim();
}

// =====================================
// NORMALIZADORES DE URL
// =====================================

export function normalizeGithubUrl(url: string): string {
  if (!url) return "";
  let clean = url.trim();
  if (clean.startsWith("github.com/")) {
    clean = "https://" + clean;
  }
  return clean;
}

export function normalizeLinkedinUrl(url: string): string {
  if (!url) return "";
  let clean = url.trim();
  if (clean.startsWith("linkedin.com/in/")) {
    clean = "https://" + clean;
  }
  return clean;
}

export function normalizeLattesUrl(url: string): string {
  if (!url) return "";
  let clean = url.trim();
  if (clean.startsWith("lattes.cnpq.br/")) {
    clean = "https://" + clean;
  } else if (clean.startsWith("http://lattes.cnpq.br/")) {
    clean = clean.replace("http://", "https://");
  }
  return clean;
}

// =====================================
// SCHEMAS DE VALIDAÇÃO (ZOD)
// =====================================

export const portfolioProfileSchema = z.object({
  name: z.string()
    .min(3, "Nome deve ter no mínimo 3 caracteres.")
    .max(100, "Nome deve ter no máximo 100 caracteres.")
    .regex(/^[a-zA-ZÀ-ÿ\s\-']+$/, "O nome não pode conter números, símbolos ou emojis.")
    .refine(v => v.trim().length > 0, "O nome não pode ser vazio."),
  title: z.string()
    .min(1, "Cargo é obrigatório.")
    .max(100, "Cargo deve ter no máximo 100 caracteres.")
    .refine(v => v.trim().length > 0, "O cargo não pode ser composto apenas por espaços."),
  institution: z.string()
    .min(1, "Instituição é obrigatória.")
    .max(100, "Instituição deve ter no máximo 100 caracteres.")
    .refine(v => v.trim().length > 0, "A instituição não pode ser composta apenas por espaços."),
  aboutPt: z.string()
    .min(50, "A biografia deve ter no mínimo 50 caracteres.")
    .max(500, "A biografia pode ter no máximo 500 caracteres.")
    .refine(v => v.trim().length > 0, "A biografia não pode ser composta apenas por espaços."),
  email: z.string()
    .email("Informe um e-mail válido.")
    .or(z.literal(""))
    .nullable()
    .optional(),
  githubUrl: z.string()
    .regex(/^https:\/\/github\.com\/[a-zA-Z0-9_-]+$/, "Informe uma URL válida do GitHub.")
    .or(z.literal(""))
    .nullable()
    .optional(),
  linkedinUrl: z.string()
    .regex(/^https:\/\/linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/, "Informe uma URL válida do LinkedIn.")
    .or(z.literal(""))
    .nullable()
    .optional(),
  lattesUrl: z.string()
    .regex(/^https:\/\/lattes\.cnpq\.br\/[0-9]+$/, "Informe uma URL válida do Currículo Lattes.")
    .or(z.literal(""))
    .nullable()
    .optional(),
});

export const portfolioInterestSchema = z.object({
  namePt: z.string()
    .min(2, "O interesse deve ter no mínimo 2 caracteres.")
    .max(50, "O interesse pode ter no máximo 50 caracteres.")
    .refine(v => v.trim().length > 0, "O interesse não pode ser vazio.")
});

export const portfolioEducationSchema = z.object({
  degreePt: z.string()
    .min(3, "Curso deve ter no mínimo 3 caracteres.")
    .max(100, "Curso deve ter no máximo 100 caracteres.")
    .refine(v => v.trim().length > 0, "O curso não pode ser vazio."),
  institution: z.string()
    .min(1, "Instituição é obrigatória.")
    .max(100, "Instituição deve ter no máximo 100 caracteres.")
    .refine(v => v.trim().length > 0, "A instituição não pode ser vazia."),
  year: z.coerce.number()
    .int("Ano inválido.")
    .min(1900, "Ano mínimo é 1900.")
    .max(new Date().getFullYear(), "O ano não pode ser maior que o atual.")
});
