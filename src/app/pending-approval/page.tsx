import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function PendingApprovalPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background/50 p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/20 -z-10" />
      <Card className="w-full max-w-md shadow-lg border-primary/10 text-center">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-green-100 p-4">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Conta Criada com Sucesso!
          </CardTitle>
          <CardDescription className="text-base">
            Sua conta foi registrada na plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            No momento, <strong>sua conta aguarda aprovação</strong> de um administrador para ser liberada. Você receberá um aviso assim que o acesso for concedido.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild variant="default" className="w-full">
            <Link href="/login">Voltar para o Login</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
