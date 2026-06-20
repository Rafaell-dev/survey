"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/store/theme.store";
import { HeaderSettings } from "./HeaderSettings";
import { ColorSettings } from "./ColorSettings";
import { TypographySettings } from "./TypographySettings";
import { SurveyPreview } from "./SurveyPreview";
import { Loader2 } from "lucide-react";

export function ThemeEditor({ surveyId }: { surveyId: string }) {
  const { theme, isLoading, loadTheme } = useThemeStore();

  useEffect(() => {
    loadTheme(surveyId);
  }, [surveyId, loadTheme]);

  if (isLoading || !theme) {
    return (
      <div className="flex items-center justify-center h-64 animate-in fade-in">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Carregando personalizações...</span>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-[400px_1fr] gap-6 items-start">
      <div className="space-y-6">
        <HeaderSettings surveyId={surveyId} />
        <ColorSettings surveyId={surveyId} />
        <TypographySettings surveyId={surveyId} />
      </div>

      <div className="sticky top-28 bg-muted/30 p-4 rounded-xl border overflow-hidden min-h-[600px] flex items-center justify-center">
        <SurveyPreview />
      </div>
    </div>
  );
}
