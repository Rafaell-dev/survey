import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function CompletionPage() {
  return (
    <div className="w-full h-full min-h-[60vh] flex items-center justify-center p-4 animate-in fade-in zoom-in duration-500">
      <Card className="w-full max-w-lg text-center shadow-lg border-primary/20">
        <CardHeader className="pt-10">
          <div className="mx-auto bg-primary/10 w-24 h-24 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-12 h-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">Pesquisa Concluída!</CardTitle>
          <CardDescription className="text-lg mt-2">
            Suas respostas foram registradas com sucesso. Agradecemos muito a sua participação!
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-10 pt-4">
          <p className="text-muted-foreground mb-8">
            Você pode fechar esta aba agora. Nenhuma outra ação é necessária.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
