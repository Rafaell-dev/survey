"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useThemeStore } from "@/store/theme.store";
import { ThemeLayout } from "@/domain/theme.types";
import { Layout, Maximize, Minimize } from "lucide-react";

export function LayoutSettings({ surveyId }: { surveyId: string }) {
  const { theme, updateTheme, previewTheme } = useThemeStore();

  const handleLayoutChange = (val: ThemeLayout) => {
    previewTheme({ layout: val });
    updateTheme(surveyId, { layout: val });
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Layout do Formulário</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          
          <button
            type="button"
            onClick={() => handleLayoutChange("CARD")}
            className={`flex flex-col items-center justify-center p-4 border rounded-lg transition-colors hover:bg-muted ${
              theme?.layout === "CARD" ? "border-primary bg-primary/5" : "border-border"
            }`}
          >
            <Layout className="h-6 w-6 mb-2 text-muted-foreground" />
            <span className="text-xs font-medium">Card</span>
          </button>

          <button
            type="button"
            onClick={() => handleLayoutChange("FULL_PAGE")}
            className={`flex flex-col items-center justify-center p-4 border rounded-lg transition-colors hover:bg-muted ${
              theme?.layout === "FULL_PAGE" ? "border-primary bg-primary/5" : "border-border"
            }`}
          >
            <Maximize className="h-6 w-6 mb-2 text-muted-foreground" />
            <span className="text-xs font-medium">Página Inteira</span>
          </button>

          <button
            type="button"
            onClick={() => handleLayoutChange("COMPACT")}
            className={`flex flex-col items-center justify-center p-4 border rounded-lg transition-colors hover:bg-muted ${
              theme?.layout === "COMPACT" ? "border-primary bg-primary/5" : "border-border"
            }`}
          >
            <Minimize className="h-6 w-6 mb-2 text-muted-foreground" />
            <span className="text-xs font-medium">Compacto</span>
          </button>

        </div>
      </CardContent>
    </Card>
  );
}
