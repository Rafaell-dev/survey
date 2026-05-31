import { Block, Question } from "@/domain/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Trash2, PlusCircle, LayoutTemplate } from "lucide-react";
import { QuestionEditor } from "./QuestionEditor";

interface BlockEditorProps {
  block: Block;
  index: number;
  updateBlock: (id: string, updates: Partial<Block>) => void;
  removeBlock: (id: string) => void;
}

export function BlockEditor({ block, index, updateBlock, removeBlock }: BlockEditorProps) {
  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      title: "",
      type: "multiple_choice",
      required: false,
      options: ["Opção 1"],
    };
    updateBlock(block.id, { questions: [...block.questions, newQuestion] });
  };

  const handleUpdateQuestion = (qId: string, updates: Partial<Question>) => {
    const newQuestions = block.questions.map((q) => (q.id === qId ? { ...q, ...updates } : q));
    updateBlock(block.id, { questions: newQuestions });
  };

  const handleRemoveQuestion = (qId: string) => {
    const newQuestions = block.questions.filter((q) => q.id !== qId);
    updateBlock(block.id, { questions: newQuestions });
  };

  return (
    <Card className="border-t-4 border-t-secondary shadow-sm mb-6">
      <CardHeader className="bg-secondary/5 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutTemplate className="h-5 w-5 text-secondary" />
            <h3 className="font-semibold text-lg">Bloco {index + 1}</h3>
          </div>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => removeBlock(block.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-2 mt-4">
          <Input
            value={block.title}
            onChange={(e) => updateBlock(block.id, { title: e.target.value })}
            placeholder="Título do Bloco (Opcional)"
            className="font-medium bg-background border-transparent hover:border-input focus-visible:border-primary"
          />
          <Input
            value={block.description}
            onChange={(e) => updateBlock(block.id, { description: e.target.value })}
            placeholder="Descrição do Bloco (Opcional)"
            className="text-sm text-muted-foreground bg-background border-transparent hover:border-input focus-visible:border-primary"
          />
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6 bg-muted/10">
        {block.questions.map((q, qIndex) => (
          <QuestionEditor
            key={q.id}
            index={qIndex}
            question={q}
            updateQuestion={handleUpdateQuestion}
            removeQuestion={handleRemoveQuestion}
          />
        ))}
        <div className="flex justify-center mt-4">
          <Button type="button" onClick={handleAddQuestion} variant="outline" size="sm" className="gap-2 bg-background">
            <PlusCircle className="h-4 w-4" /> Adicionar Pergunta
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
