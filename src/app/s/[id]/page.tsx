"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchApi } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function SurveyPlayerPage() {
  const params = useParams();
  const id = params.id as string;

  const [survey, setSurvey] = useState<any>(null);
  const [responseId, setResponseId] = useState<string | null>(null);
  
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [finished, setFinished] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSurvey() {
      try {
        const data = await fetchApi(`/public/survey/${id}`);
        setSurvey(data);

        // Start response
        const resp = await fetchApi(`/public/survey/${id}/start`, { method: "POST" });
        setResponseId(resp.id);
      } catch (err: any) {
        setError(err.message || "Erro ao carregar o questionário.");
      } finally {
        setLoading(false);
      }
    }
    loadSurvey();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Carregando questionário...</div>;
  if (error) return <div className="p-8 text-center text-destructive">{error}</div>;
  if (finished) return (
    <div className="min-h-screen bg-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl text-center py-12 shadow-md">
        <CardTitle className="text-2xl mb-2 text-primary">Muito obrigado!</CardTitle>
        <CardDescription className="text-lg">Suas respostas foram registradas com sucesso.</CardDescription>
      </Card>
    </div>
  );
  if (!survey || survey.blocks.length === 0) return <div className="p-8 text-center">Nenhum bloco encontrado.</div>;

  const currentBlock = survey.blocks[currentBlockIndex];

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = async () => {
    setSubmitting(true);
    try {
      // 1. Salvar respostas
      for (const question of currentBlock.questions) {
        const answerVal = answers[question.id];
        if (answerVal !== undefined) {
          let body: any = { questionId: question.id };
          
          if (question.type === "multiple_choice" || question.type === "checkboxes" || question.type === "short_answer" || question.type === "paragraph") {
            body.valueText = Array.isArray(answerVal) ? JSON.stringify(answerVal) : String(answerVal);
          } else if (question.type === "likert" || question.type === "slider") {
            body.valueNumber = Number(answerVal);
          }

          await fetchApi(`/public/response/${responseId}/answer`, {
            method: "POST",
            body: JSON.stringify(body)
          });
        }
      }

      // 2. Calcular Lógica de Pulo
      let nextBlockIndex = currentBlockIndex + 1;
      
      for (const question of currentBlock.questions) {
        if (question.rules && question.rules.length > 0) {
          const answerVal = answers[question.id];
          if (answerVal) {
            for (const rule of question.rules) {
              const matched = 
                (rule.operator === "EQUALS" && String(answerVal) === rule.matchValue) ||
                (rule.operator === "NOT_EQUALS" && String(answerVal) !== rule.matchValue) ||
                (rule.operator === "GREATER_THAN" && Number(answerVal) > Number(rule.matchValue)) ||
                (rule.operator === "LESS_THAN" && Number(answerVal) < Number(rule.matchValue));
              
              if (matched) {
                const targetIdx = survey.blocks.findIndex((b: any) => b.id === rule.targetBlockId);
                if (targetIdx !== -1) {
                  nextBlockIndex = targetIdx;
                  break;
                }
              }
            }
          }
        }
      }

      // 3. Navegar
      if (nextBlockIndex >= survey.blocks.length) {
        await fetchApi(`/public/response/${responseId}/complete`, { method: "POST" });
        setFinished(true);
      } else {
        setCurrentBlockIndex(nextBlockIndex);
      }
    } catch (err: any) {
      alert("Erro ao salvar respostas: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {currentBlockIndex === 0 && (
          <Card className="border-t-8 border-t-primary shadow-sm mb-8">
            <CardHeader>
              <CardTitle className="text-3xl font-bold">{survey.title}</CardTitle>
              {survey.description && <CardDescription className="text-lg mt-2">{survey.description}</CardDescription>}
            </CardHeader>
          </Card>
        )}

        <Card className="shadow-sm">
          {currentBlock.title && (
            <CardHeader className="bg-primary/5 rounded-t-xl border-b">
              <CardTitle>{currentBlock.title}</CardTitle>
              {currentBlock.description && <CardDescription>{currentBlock.description}</CardDescription>}
            </CardHeader>
          )}
          
          <CardContent className="p-6 space-y-8">
            {currentBlock.questions.map((q: any) => (
              <div key={q.id} className="space-y-4">
                <Label className="text-lg font-medium flex items-center">
                  {q.title}
                  {q.isRequired && <span className="text-destructive ml-1">*</span>}
                </Label>
                
                {q.medias && q.medias.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {q.medias.map((m: any) => (
                      <div key={m.id} className="rounded overflow-hidden">
                        {m.type === "IMAGE" && <img src={m.url} className="w-full h-auto" />}
                        {m.type === "VIDEO" && <video src={m.url} controls className="w-full h-auto" />}
                        {m.type === "AUDIO" && <audio src={m.url} controls className="w-full" />}
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-2">
                  {q.type === "short_answer" && (
                    <Input 
                      className="max-w-md" 
                      value={answers[q.id] || ""} 
                      onChange={e => handleAnswerChange(q.id, e.target.value)} 
                    />
                  )}
                  {q.type === "paragraph" && (
                    <Textarea 
                      className="max-w-xl" 
                      value={answers[q.id] || ""} 
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleAnswerChange(q.id, e.target.value)} 
                    />
                  )}
                  {(q.type === "multiple_choice") && (
                    <div className="space-y-2">
                      {q.options.map((opt: any) => (
                        <Label key={opt.id} className="flex items-center gap-2 cursor-pointer font-normal border p-3 rounded-md hover:bg-muted/30 transition-colors">
                          <input 
                            type="radio" 
                            name={`q_${q.id}`} 
                            value={opt.label}
                            checked={answers[q.id] === opt.label}
                            onChange={() => handleAnswerChange(q.id, opt.label)}
                            className="w-4 h-4 text-primary focus:ring-primary border-gray-300"
                          />
                          {opt.label}
                        </Label>
                      ))}
                    </div>
                  )}
                  {(q.type === "checkboxes") && (
                    <div className="space-y-2">
                      {q.options.map((opt: any) => {
                        const currentArr = Array.isArray(answers[q.id]) ? answers[q.id] : [];
                        return (
                          <Label key={opt.id} className="flex items-center gap-2 cursor-pointer font-normal border p-3 rounded-md hover:bg-muted/30 transition-colors">
                            <input 
                              type="checkbox" 
                              checked={currentArr.includes(opt.label)}
                              onChange={(e) => {
                                const newArr = e.target.checked 
                                  ? [...currentArr, opt.label] 
                                  : currentArr.filter((val: string) => val !== opt.label);
                                handleAnswerChange(q.id, newArr);
                              }}
                              className="w-4 h-4 rounded text-primary focus:ring-primary border-gray-300"
                            />
                            {opt.label}
                          </Label>
                        );
                      })}
                    </div>
                  )}
                  {(q.type === "likert" || q.type === "slider") && (
                    <div className="pt-2 pb-4">
                      <div className="flex items-center justify-between gap-4 max-w-xl mx-auto">
                        <span className="text-sm font-medium bg-muted px-3 py-1 rounded shadow-sm">{q.scaleStart ?? 1}</span>
                        <input 
                          type="range"
                          min={q.scaleStart ?? 1}
                          max={q.scaleEnd ?? 5}
                          value={answers[q.id] || q.scaleStart || 1}
                          onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                          className="flex-1 accent-primary h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-sm font-medium bg-muted px-3 py-1 rounded shadow-sm">{q.scaleEnd ?? 5}</span>
                      </div>
                      <div className="text-center mt-4 text-primary font-bold text-lg">
                        Valor selecionado: {answers[q.id] || q.scaleStart || 1}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-between items-center py-4">
          <div className="text-sm text-muted-foreground">
            {currentBlockIndex + 1} de {survey.blocks.length} blocos
          </div>
          <Button onClick={handleNext} disabled={submitting} className="min-w-32 text-lg py-6 shadow-md hover:shadow-lg transition-shadow">
            {submitting ? "Enviando..." : (currentBlockIndex === survey.blocks.length - 1 ? "Finalizar" : "Próximo")}
          </Button>
        </div>
        
      </div>
    </div>
  );
}
