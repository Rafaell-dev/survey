import { useMemo } from "react";
import { QuestionChartProps } from "../charts/types";
import { parseTextResponses, extractWordFrequencies } from "./utils";

export function WordCloud({ question, visualization }: QuestionChartProps) {
  const allResponses = useMemo(() => parseTextResponses(question.responses), [question.responses]);
  const wordFrequencies = useMemo(() => extractWordFrequencies(allResponses).slice(0, 50), [allResponses]);

  if (wordFrequencies.length === 0) {
    return (
      <div className="w-full py-12 text-center text-muted-foreground">
        Não há palavras suficientes para gerar a nuvem.
      </div>
    );
  }

  // Lógica simples de renderização visual da nuvem usando apenas flex e font-sizes variados
  const maxCount = Math.max(...wordFrequencies.map(w => w.count));

  // Embaralhar para o visual "Nuvem"
  const shuffledWords = [...wordFrequencies].sort(() => 0.5 - Math.random());

  return (
    <div className="w-full min-h-[300px] flex items-center justify-center bg-muted/10 rounded-xl p-8 border">
      <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 max-w-2xl mx-auto">
        {shuffledWords.map((item, idx) => {
          // Peso da palavra de 0 a 1
          const weight = item.count / maxCount;
          // Tamanho da fonte varia de 14px a 48px
          const fontSize = 14 + (weight * 34);
          
          // Cores baseadas no peso
          let color = "text-muted-foreground";
          if (weight > 0.7) color = "text-primary font-bold";
          else if (weight > 0.4) color = "text-foreground font-semibold";
          
          return (
            <span 
              key={item.word + idx} 
              className={`transition-all hover:scale-110 cursor-default ${color}`}
              style={{ fontSize: `${fontSize}px`, lineHeight: 1 }}
              title={`Frequência: ${item.count}`}
            >
              {item.word}
            </span>
          );
        })}
      </div>
    </div>
  );
}
