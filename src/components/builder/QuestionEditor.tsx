"use client";

import { Question, QuestionType, Media } from "@/domain/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Trash2, Plus, GripVertical, ImageIcon, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import { fetchApi } from "@/services/api";

interface QuestionEditorProps {
  question: Question;
  index: number;
  updateQuestion: (id: string, updates: Partial<Question>) => void;
  removeQuestion: (id: string) => void;
}

export function QuestionEditor({ question, index, updateQuestion, removeQuestion }: QuestionEditorProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const media = await fetchApi("/media/upload", {
        method: "POST",
        body: formData,
      });

      const newMedias = [...(question.medias || []), {
        id: media.id,
        type: media.type,
        url: media.url
      }];

      updateQuestion(question.id, { medias: newMedias });
    } catch (error) {
      console.error(error);
      alert("Erro ao enviar a mídia");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeMedia = (mediaId: string) => {
    const newMedias = (question.medias || []).filter((m) => m.id !== mediaId);
    updateQuestion(question.id, { medias: newMedias });
    fetchApi(`/media/${mediaId}`, { method: 'DELETE' }).catch(console.error);
  };

  return (
    <Card className="relative group hover:border-primary/30 transition-colors">
      <div className="absolute left-1/2 -top-3 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-background border px-2 py-0.5 rounded shadow-sm cursor-grab">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      
      <CardHeader className="flex flex-row items-start gap-4 pb-2">
        <span className="font-medium text-muted-foreground pt-2">{index + 1}.</span>
        <div className="flex-1 space-y-4">
          <div className="flex gap-4 items-center">
            <Input
              value={question.title}
              onChange={(e) => updateQuestion(question.id, { title: e.target.value })}
              placeholder="Question Title"
              className="font-medium text-lg border-x-0 border-t-0 rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary bg-transparent"
            />
            
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*,video/*,audio/*"
              onChange={handleFileUpload}
            />
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              title="Adicionar Mídia"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4 text-muted-foreground" />}
            </Button>

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

          {/* Mídia renderizada */}
          {question.medias && question.medias.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {question.medias.map((m) => (
                <div key={m.id} className="relative group/media border rounded-md overflow-hidden bg-muted/50 aspect-video flex items-center justify-center">
                  {m.type === 'IMAGE' && <img src={m.url} alt="Media" className="object-cover w-full h-full" />}
                  {m.type === 'VIDEO' && <video src={m.url} controls className="object-cover w-full h-full" />}
                  {m.type === 'AUDIO' && <audio src={m.url} controls className="w-full h-12 mt-auto mb-auto" />}
                  
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    className="absolute top-1 right-1 opacity-0 group-hover/media:opacity-100 transition-opacity h-6 w-6"
                    onClick={() => removeMedia(m.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
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
