"use client";

import { Question, QuestionType } from "@/domain/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Trash2, Plus, GripVertical } from "lucide-react";

interface QuestionEditorProps {
  question: Question;
  index: number;
  updateQuestion: (id: string, updates: Partial<Question>) => void;
  removeQuestion: (id: string) => void;
}

export function QuestionEditor({ question, index, updateQuestion, removeQuestion }: QuestionEditorProps) {
  const handleOptionChange = (optIndex: number, value: string) => {
    const newOptions = [...(question.options || [])];
    newOptions[optIndex] = value;
    updateQuestion(question.id, { options: newOptions });
  };

  const addOption = () => {
    const newOptions = [...(question.options || []), `Option ${(question.options?.length || 0) + 1}`];
    updateQuestion(question.id, { options: newOptions });
  };

  const removeOption = (optIndex: number) => {
    const newOptions = (question.options || []).filter((_, i) => i !== optIndex);
    updateQuestion(question.id, { options: newOptions });
  };

  return (
    <Card className="relative group hover:border-primary/30 transition-colors">
      <div className="absolute left-1/2 -top-3 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-background border px-2 py-0.5 rounded shadow-sm cursor-grab">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      
      <CardHeader className="flex flex-row items-start gap-4 pb-2">
        <span className="font-medium text-muted-foreground pt-2">{index + 1}.</span>
        <div className="flex-1 space-y-4">
          <div className="flex gap-4">
            <Input
              value={question.title}
              onChange={(e) => updateQuestion(question.id, { title: e.target.value })}
              placeholder="Question Title"
              className="font-medium text-lg border-x-0 border-t-0 rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary bg-transparent"
            />
            <select
              value={question.type}
              onChange={(e) => updateQuestion(question.id, { type: e.target.value as QuestionType })}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="short_answer">Short Answer</option>
              <option value="paragraph">Paragraph</option>
              <option value="multiple_choice">Multiple Choice</option>
              <option value="checkboxes">Checkboxes</option>
              <option value="likert">Likert Scale</option>
              <option value="slider">Slider</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pl-12">
        {/* Render options based on type */}
        {(question.type === "multiple_choice" || question.type === "checkboxes") && (
          <div className="space-y-3 mt-2">
            {question.options?.map((opt, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-4 h-4 border border-muted-foreground/50 ${question.type === "multiple_choice" ? "rounded-full" : "rounded-sm"}`} />
                <Input
                  value={opt}
                  onChange={(e) => handleOptionChange(i, e.target.value)}
                  className="flex-1 h-8 border-transparent hover:border-input focus-visible:border-input"
                />
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeOption(i)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 border border-muted-foreground/30 ${question.type === "multiple_choice" ? "rounded-full" : "rounded-sm"}`} />
              <Button variant="ghost" size="sm" className="h-8 text-muted-foreground" onClick={addOption}>
                <Plus className="h-4 w-4 mr-1" /> Add Option
              </Button>
            </div>
          </div>
        )}

        {(question.type === "short_answer" || question.type === "paragraph") && (
          <div className="mt-2 border-b border-dashed border-muted-foreground/30 pb-2 w-1/2 text-muted-foreground text-sm">
            {question.type === "short_answer" ? "Short answer text" : "Long answer text"}
          </div>
        )}

        {(question.type === "likert" || question.type === "slider") && (
          <div className="mt-4 space-y-4 bg-muted/30 p-4 rounded-md border border-muted/50">
            <div className="flex items-center gap-6">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Scale Start</Label>
                <Input
                  type="number"
                  value={question.scaleStart ?? 1}
                  onChange={(e) => updateQuestion(question.id, { scaleStart: parseInt(e.target.value) })}
                  className="w-20 h-8"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Scale End</Label>
                <Input
                  type="number"
                  value={question.scaleEnd ?? 5}
                  onChange={(e) => updateQuestion(question.id, { scaleEnd: parseInt(e.target.value) })}
                  className="w-20 h-8"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Visual Type</Label>
                <select
                  value={question.scaleVisualType || "numbers"}
                  onChange={(e) => updateQuestion(question.id, { scaleVisualType: e.target.value })}
                  className="h-8 rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="numbers">Numbers</option>
                  <option value="emojis">Emojis</option>
                  <option value="icons">Icons</option>
                  <option value="slider">Slider (Continuous)</option>
                  <option value="text_labels">Text Labels</option>
                </select>
              </div>
            </div>
            
            {/* Visualização mockada da escala */}
            <div className="flex items-center justify-between mt-6 px-2 text-muted-foreground">
              <span className="text-sm font-medium bg-background px-2 py-1 rounded border shadow-sm">{question.scaleStart ?? 1}</span>
              <div className="h-2 flex-1 mx-4 bg-secondary/20 rounded-full overflow-hidden relative">
                <div className="absolute left-0 top-0 w-1/2 h-full bg-secondary/60" />
                <div className="absolute left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-secondary rounded-full shadow-md border-2 border-background" />
              </div>
              <span className="text-sm font-medium bg-background px-2 py-1 rounded border shadow-sm">{question.scaleEnd ?? 5}</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-4 mt-6 pt-4 border-t border-muted/50">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={question.required}
              onChange={(e) => updateQuestion(question.id, { required: e.target.checked })}
              className="rounded border-gray-300"
            />
            Required
          </label>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => removeQuestion(question.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
