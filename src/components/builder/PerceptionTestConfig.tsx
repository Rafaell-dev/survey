"use client";

import { LocalQuestion } from "@/domain/question.types";
import { Input } from "@/components/ui/input";
import { useBuilderStore } from "@/store/builder.store";

interface PerceptionTestConfigProps {
  question: LocalQuestion;
}

export function PerceptionTestConfig({ question }: PerceptionTestConfigProps) {
  const { options, updateOptionLocal, addOption } = useBuilderStore();
  
  // No Teste de Percepção, usamos a primeira Option para armazenar a pergunta a ser feita a cada interação
  const interactionQuestionOpt = options.find(o => o.questionId === question.id && o.orderIndex === 0);

  const handleQuestionChange = (val: string) => {
    if (interactionQuestionOpt) {
      updateOptionLocal(interactionQuestionOpt.id, { label: val });
    } else {
      addOption(question.id);
      // addOption cria com label genérico e index na sequência. Precisamos interceptar se quisermos já vir com texto vazio.
      // Como a renderização reage, na próxima renderização o input exibirá o "Opção 1".
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-dashed space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Pergunta após cada interação
        </label>
        <p className="text-xs text-muted-foreground/80 pb-2">
          Esta pergunta aparecerá sempre que o participante pressionar uma tecla (ou a barra de espaço) durante o vídeo/áudio.
        </p>
        <Input 
          placeholder="Ex: O que você percebeu neste exato momento?"
          value={interactionQuestionOpt?.label || ""}
          onChange={(e) => handleQuestionChange(e.target.value)}
          className="h-8 shadow-none focus-visible:ring-1"
        />
      </div>
    </div>
  );
}
