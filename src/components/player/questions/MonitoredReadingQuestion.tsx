import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, Check } from 'lucide-react';
import { SurveyQuestionDTO } from '@/domain/public-survey.types';

interface MonitoredReadingQuestionProps {
  question: SurveyQuestionDTO;
  value: string;
  onChange: (value: string) => void;
}

export function MonitoredReadingQuestion({ question, value, onChange }: MonitoredReadingQuestionProps) {
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [chunkStartTime, setChunkStartTime] = useState<number>(Date.now());
  const [results, setResults] = useState<{ segmentIndex: number; timeSpentMs: number; wordCount: number }[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  // Se já tiver valor, assumimos que já foi concluído
  useEffect(() => {
    if (value) {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setIsFinished(true);
        }
      } catch (e) {}
    }
  }, [value]);

  // Conta palavras simples
  const countWords = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const handleNext = () => {
    const timeSpentMs = Date.now() - chunkStartTime;
    const currentChunk = question.options[currentChunkIndex];
    
    const newResults = [
      ...results,
      {
        segmentIndex: currentChunkIndex,
        timeSpentMs,
        wordCount: countWords(currentChunk?.label || '')
      }
    ];

    if (currentChunkIndex < question.options.length - 1) {
      setResults(newResults);
      setCurrentChunkIndex(currentChunkIndex + 1);
      setChunkStartTime(Date.now());
    } else {
      setResults(newResults);
      setIsFinished(true);
      onChange(JSON.stringify(newResults));
    }
  };

  if (!question.options || question.options.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground bg-muted/20 rounded-md">
        Nenhum trecho de leitura configurado.
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="p-8 text-center text-emerald-600 bg-emerald-50 rounded-md flex flex-col items-center justify-center gap-3">
        <Check className="h-8 w-8" />
        <span className="font-medium">Leitura concluída com sucesso!</span>
      </div>
    );
  }

  const currentChunk = question.options[currentChunkIndex];

  return (
    <div className="space-y-6">
      <div className="text-xs text-muted-foreground flex justify-between items-center px-1">
        <span>Trecho {currentChunkIndex + 1} de {question.options.length}</span>
        <span>Atenção e leia em seu ritmo.</span>
      </div>
      
      <div className="p-6 md:p-8 bg-card border rounded-lg shadow-sm text-card-foreground text-lg md:text-xl leading-relaxed whitespace-pre-wrap">
        {currentChunk?.label}
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={handleNext} 
          size="lg"
          className="gap-2"
        >
          {currentChunkIndex < question.options.length - 1 ? (
            <>
              Próximo Trecho
              <ChevronRight className="h-5 w-5" />
            </>
          ) : (
            <>
              Concluir Leitura
              <Check className="h-5 w-5" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
