"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useThemeStore } from "@/store/theme.store";

const FONTS = [
  { id: "Inter", label: "Inter (Padrão)" },
  { id: "Roboto", label: "Roboto" },
  { id: "Open Sans", label: "Open Sans" },
  { id: "Lato", label: "Lato" },
  { id: "Montserrat", label: "Montserrat" },
  { id: "Merriweather", label: "Merriweather" },
  { id: "Playfair Display", label: "Playfair Display" },
];

export function TypographySettings({ surveyId }: { surveyId: string }) {
  const { theme, updateTheme, previewTheme } = useThemeStore();

  const handleFontChange = (val: string) => {
    previewTheme({ fontFamily: val });
    updateTheme(surveyId, { fontFamily: val });
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Tipografia</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label className="text-xs">Família da Fonte</Label>
          <Select 
            value={theme?.fontFamily || "Inter"} 
            onValueChange={handleFontChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma fonte" />
            </SelectTrigger>
            <SelectContent>
              {FONTS.map(font => (
                <SelectItem key={font.id} value={font.id} style={{ fontFamily: font.id }}>
                  {font.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            Esta fonte será aplicada em todo o questionário.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
