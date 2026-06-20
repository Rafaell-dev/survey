"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useThemeStore } from "@/store/theme.store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ColorSettings({ surveyId }: { surveyId: string }) {
  const { theme, previewTheme, updateTheme } = useThemeStore();
  
  // Usamos um estado local para fluidez do color picker, e salvamos onBlur
  const [colors, setColors] = useState({
    primaryColor: theme?.primaryColor || "#000000",
    backgroundColor: theme?.backgroundColor || "#ffffff",
    textColor: theme?.textColor || "#000000",
    buttonColor: theme?.buttonColor || "#000000",
  });

  const handleChange = (key: keyof typeof colors, value: string) => {
    setColors(prev => ({ ...prev, [key]: value }));
    previewTheme({ [key]: value });
  };

  const handleSave = () => {
    updateTheme(surveyId, colors);
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Cores</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs">Cor Principal</Label>
            <div className="flex gap-2">
              <Input 
                type="color" 
                value={colors.primaryColor}
                onChange={(e) => handleChange("primaryColor", e.target.value)}
                onBlur={handleSave}
                className="w-12 h-10 p-1 cursor-pointer"
              />
              <Input 
                type="text" 
                value={colors.primaryColor}
                onChange={(e) => handleChange("primaryColor", e.target.value)}
                onBlur={handleSave}
                className="flex-1 font-mono text-sm uppercase"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Cor de Fundo</Label>
            <div className="flex gap-2">
              <Input 
                type="color" 
                value={colors.backgroundColor}
                onChange={(e) => handleChange("backgroundColor", e.target.value)}
                onBlur={handleSave}
                className="w-12 h-10 p-1 cursor-pointer"
              />
              <Input 
                type="text" 
                value={colors.backgroundColor}
                onChange={(e) => handleChange("backgroundColor", e.target.value)}
                onBlur={handleSave}
                className="flex-1 font-mono text-sm uppercase"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Texto</Label>
            <div className="flex gap-2">
              <Input 
                type="color" 
                value={colors.textColor}
                onChange={(e) => handleChange("textColor", e.target.value)}
                onBlur={handleSave}
                className="w-12 h-10 p-1 cursor-pointer"
              />
              <Input 
                type="text" 
                value={colors.textColor}
                onChange={(e) => handleChange("textColor", e.target.value)}
                onBlur={handleSave}
                className="flex-1 font-mono text-sm uppercase"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Botões (Primários)</Label>
            <div className="flex gap-2">
              <Input 
                type="color" 
                value={colors.buttonColor}
                onChange={(e) => handleChange("buttonColor", e.target.value)}
                onBlur={handleSave}
                className="w-12 h-10 p-1 cursor-pointer"
              />
              <Input 
                type="text" 
                value={colors.buttonColor}
                onChange={(e) => handleChange("buttonColor", e.target.value)}
                onBlur={handleSave}
                className="flex-1 font-mono text-sm uppercase"
              />
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
