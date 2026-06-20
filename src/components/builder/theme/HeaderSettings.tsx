"use client";

import { useState } from "react";
import { ImagePlus, Loader2, Trash } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useThemeStore } from "@/store/theme.store";

export function HeaderSettings({ surveyId }: { surveyId: string }) {
  const { theme, updateTheme, uploadHeaderImage } = useThemeStore();
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await uploadHeaderImage(surveyId, file);
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    updateTheme(surveyId, { headerImage: null });
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Imagem de Cabeçalho</CardTitle>
      </CardHeader>
      <CardContent>
        {theme?.headerImage ? (
          <div className="space-y-3">
            <div className="relative aspect-video w-full rounded-md overflow-hidden bg-muted border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={`${process.env.NEXT_PUBLIC_API_URL}${theme.headerImage}`} 
                alt="Cabeçalho do Survey" 
                className="w-full h-full object-cover"
              />
            </div>
            <Button variant="destructive" size="sm" onClick={removeImage} className="w-full gap-2">
              <Trash className="h-4 w-4" /> Remover Imagem
            </Button>
          </div>
        ) : (
          <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center text-center bg-muted/30">
            <div className="bg-primary/10 p-3 rounded-full mb-3 text-primary">
              <ImagePlus className="h-6 w-6" />
            </div>
            <p className="text-sm font-medium mb-1">Adicionar imagem de capa</p>
            <p className="text-xs text-muted-foreground mb-4">Recomendado: 1200x400px (JPG ou PNG)</p>
            <div className="relative">
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleFileChange}
                disabled={isUploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <Button variant="secondary" size="sm" disabled={isUploading} className="pointer-events-none gap-2">
                {isUploading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isUploading ? "Enviando..." : "Escolher Arquivo"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
