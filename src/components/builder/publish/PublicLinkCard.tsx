"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PublicLinkCardProps {
  url: string;
}

export function PublicLinkCard({ url }: PublicLinkCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      toast.success("Link copiado com sucesso!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Erro ao copiar o link.");
    }
  };

  return (
    <div className="flex items-center space-x-2 w-full mt-4">
      <div className="relative flex-1">
        <Input 
          readOnly 
          value={url} 
          onClick={(e) => (e.target as HTMLInputElement).select()}
          className="pr-10 bg-muted/50 font-mono text-xs focus-visible:ring-0 cursor-text" 
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={handleCopy}
        >
          {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
