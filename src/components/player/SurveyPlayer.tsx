"use client";

import { useEffect } from "react";
import { useSurveyPlayerStore } from "@/store/survey-player.store";
import { QuestionRenderer } from "./QuestionRenderer";
import { IdentificationStep } from "./IdentificationStep";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export function SurveyPlayer() {
  const { 
    survey, 
    playerStep, 
    currentBlockIndex, 
    answers, 
    setAnswer, 
    goToNextBlock, 
    goToPreviousBlock, 
    history,
    finishSurvey,
    savingAnswers,
    saveError
  } = useSurveyPlayerStore();

  useEffect(() => {
    if (saveError) {
      toast.error(saveError);
    }
  }, [saveError]);

  if (!survey) return null;

  if (playerStep === 'IDENTIFICATION') {
    return <IdentificationStep />;
  }

  if (playerStep === 'FINISHED') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
        <CheckCircle className="h-16 w-16 text-emerald-500 mb-6" />
        <h2 className="text-3xl font-bold mb-2">Obrigado pela sua participação!</h2>
        <p className="text-muted-foreground text-lg">Sua resposta foi registrada com sucesso.</p>
      </div>
    );
  }

  // playerStep === 'RESPONDING'
  const currentBlock = survey.blocks[currentBlockIndex];
  const isLastBlock = currentBlockIndex >= survey.blocks.length - 1;

  const validateBlock = () => {
    for (const question of currentBlock.questions) {
      if (question.isRequired) {
        const answer = answers[question.id];
        if (answer === undefined || answer === null || answer === "" || (Array.isArray(answer) && answer.length === 0)) {
          toast.error("Por favor, responda todas as perguntas obrigatórias antes de avançar.");
          return false;
        }
      }
    }
    return true;
  };

  const handleNext = () => {
    if (savingAnswers > 0) return;
    if (!validateBlock()) return;

    if (isLastBlock) {
      finishSurvey();
    } else {
      goToNextBlock();
    }
  };

  const handlePrevious = () => {
    if (savingAnswers > 0) return;
    goToPreviousBlock();
  };

  const progressPercent = Math.round((currentBlockIndex / survey.blocks.length) * 100);

  const isNavigationDisabled = savingAnswers > 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 mt-4 sm:mt-8">
      
      {/* Progress Bar */}
      <div className="space-y-2 px-1">
        <div className="flex justify-between text-xs sm:text-sm text-muted-foreground font-medium">
          <span>{progressPercent}% Concluído</span>
          <span>Bloco {currentBlockIndex + 1} de {survey.blocks.length}</span>
        </div>
        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Bloco Atual */}
      <div className="bg-card border rounded-xl sm:rounded-2xl shadow-sm p-5 sm:p-8 space-y-8 sm:space-y-10 relative">
        {currentBlock.title && (
          <div className="border-b pb-4">
            <h2 className="text-xl sm:text-2xl font-bold">{currentBlock.title}</h2>
            {currentBlock.description && <p className="text-sm sm:text-base text-muted-foreground mt-2">{currentBlock.description}</p>}
          </div>
        )}

        <div className="space-y-10 sm:space-y-12">
          {currentBlock.questions.map((question) => (
            <QuestionRenderer 
              key={question.id} 
              question={question}
              value={answers[question.id]}
              onChange={(val) => setAnswer(question.id, val)}
            />
          ))}
          {currentBlock.questions.length === 0 && (
            <p className="text-muted-foreground italic text-center py-8">Este bloco não possui perguntas.</p>
          )}
        </div>
      </div>

      {/* Feedback de Salvamento */}
      <div className="flex justify-end text-sm text-muted-foreground h-4 px-1">
        {savingAnswers > 0 && (
          <span className="flex items-center gap-2 animate-pulse text-blue-500">
            <span className="h-2 w-2 bg-blue-500 rounded-full animate-ping"></span>
            <span className="text-xs sm:text-sm">Salvando respostas...</span>
          </span>
        )}
      </div>

      {/* Navegação */}
      <div className="flex items-center justify-between pt-2 sm:pt-4 px-1">
        <Button 
          variant="outline" 
          onClick={handlePrevious} 
          disabled={history.length === 0 || isNavigationDisabled}
          className="gap-1 sm:gap-2 h-10 sm:h-11 px-3 sm:px-6 text-sm sm:text-base"
        >
          <ChevronLeft className="h-4 w-4" /> <span className="hidden sm:inline">Anterior</span><span className="sm:hidden">Voltar</span>
        </Button>

        <Button 
          onClick={handleNext}
          disabled={isNavigationDisabled}
          className="gap-1 sm:gap-2 h-10 sm:h-11 px-6 sm:px-8 text-sm sm:text-base"
        >
          {isLastBlock ? "Finalizar" : "Próximo"}
          {!isLastBlock && <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>

    </div>
  );
}
