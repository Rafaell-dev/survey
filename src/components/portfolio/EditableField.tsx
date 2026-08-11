import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useEffect, useState, useRef } from "react";
import { AlertCircle, Link as LinkIcon } from "lucide-react";
import { z } from "zod";
import { sanitizeText } from "@/lib/portfolio-validators";
import { RichTextEditor } from "./RichTextEditor";

interface EditableFieldProps {
  value: string;
  onSave: (value: string) => void;
  isEditing: boolean;
  multiline?: boolean;
  placeholder?: string;
  className?: string;
  maxLength?: number;
  showCount?: boolean;
  validator?: z.ZodTypeAny;
  id?: string;
  autoSanitize?: boolean;
  label?: string;
  parseMarkdownLinks?: boolean;
  richText?: boolean;
}

export function EditableField({
  value,
  onSave,
  isEditing,
  multiline = false,
  placeholder = "Clique para editar...",
  className,
  maxLength,
  showCount = false,
  validator,
  id,
  autoSanitize = true,
  label,
  parseMarkdownLinks = false,
  richText = false,
}: EditableFieldProps) {
  const [localValue, setLocalValue] = useState(value || "");
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const successTimeoutRef = useRef<NodeJS.Timeout>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const plainTextLength = (localValue || "")
    .replace(/<[^>]*>?/gm, "")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .trim()
    .length;

  const handleInsertLink = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    const selectedText = localValue.substring(start, end) || "Texto do Link";
    const before = localValue.substring(0, start);
    const after = localValue.substring(end);
    
    const insertion = `[${selectedText}](https://)`;
    const newValue = before + insertion + after;
    
    setLocalValue(newValue);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + selectedText.length + 3, 
        start + selectedText.length + 11
      );
    }, 0);
  };

  useEffect(() => {
    setLocalValue(value || "");
  }, [value]);

  const handleRichTextChange = (v: string) => {
    setLocalValue(v);
    if (v !== value) {
      onSave(v);
    }
  };

  const handleBlur = () => {
    let finalValue = localValue;
    if (autoSanitize && !richText) {
      finalValue = sanitizeText(localValue);
      setLocalValue(finalValue);
    }

    if (validator) {
      const result = validator.safeParse(finalValue);
      if (!result.success) {
        const issues = result.error.issues || (result.error as any).errors || [];
        const msg = issues[0]?.message || result.error.message || "Valor inválido";
        setError(msg);
        return;
      }
    }

    // Valid
    setError(null);
    if (finalValue !== value) {
      onSave(finalValue);
      // Flash green
      setShowSuccess(true);
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
      successTimeoutRef.current = setTimeout(() => setShowSuccess(false), 1000);
    }
  };

  if (!isEditing) {
    if (!localValue) return null;

    const renderValue = () => {
      if (!parseMarkdownLinks) return localValue;
      
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      const parts = [];
      let lastIndex = 0;
      let match;
      
      while ((match = linkRegex.exec(localValue)) !== null) {
        if (match.index > lastIndex) {
          parts.push(localValue.substring(lastIndex, match.index));
        }
        parts.push(
          <a key={match.index} href={match[2]} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
            {match[1]}
          </a>
        );
        lastIndex = linkRegex.lastIndex;
      }
      if (lastIndex < localValue.length) {
        parts.push(localValue.substring(lastIndex));
      }
      
      return parts.length > 0 ? parts : localValue;
    };

    if (richText) {
      return (
        <div className="w-full">
          <div 
            className={cn("prose prose-sm dark:prose-invert max-w-none prose-h2:text-xl prose-h2:font-bold prose-h2:text-foreground prose-h2:mt-5 prose-h2:mb-2.5 prose-h3:text-lg prose-h3:font-bold prose-h3:text-foreground prose-h3:mt-4 prose-h3:mb-2 prose-ul:list-disc prose-ul:pl-5 prose-ul:my-2 prose-ol:list-decimal prose-ol:pl-5 prose-ol:my-2 prose-li:my-1 prose-a:!text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-a:cursor-pointer", className)} 
            dangerouslySetInnerHTML={{ __html: localValue }} 
          />
        </div>
      );
    }

    return (
      <div className="w-full">
        <div className={cn("whitespace-pre-wrap", className)}>
          {renderValue()}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full group flex flex-col gap-0.5">
      {label && (
        <label htmlFor={id} className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold px-1">
          {label}
        </label>
      )}
      <div className="relative">
        {richText ? (
          <RichTextEditor 
            value={localValue}
            onChange={handleRichTextChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            maxLength={maxLength}
          />
        ) : multiline ? (
          <div className="relative">
            <Textarea
              ref={textareaRef}
              id={id}
              value={localValue}
              onChange={(e) => setLocalValue(e.target.value)}
              onBlur={handleBlur}
              placeholder={placeholder}
              maxLength={richText || parseMarkdownLinks ? undefined : maxLength}
              aria-invalid={!!error}
              aria-describedby={error ? `${id}-error` : undefined}
              className={cn(
                "resize-none transition-colors min-h-[120px] p-2 pb-10 shadow-none focus-visible:ring-1",
                error 
                  ? "border-destructive focus-visible:ring-destructive bg-destructive/5" 
                  : showSuccess 
                    ? "border-green-500 focus-visible:ring-green-500 bg-green-500/5" 
                    : "bg-transparent border-dashed border-muted-foreground/30 hover:border-input focus:border-input focus:bg-background",
                className
              )}
            />
            {parseMarkdownLinks && (
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()} // Impede perda de foco
                onClick={handleInsertLink}
                className="absolute bottom-2 right-2 p-1.5 bg-background border border-border rounded-md shadow-sm hover:bg-muted text-muted-foreground transition-colors z-10"
                title="Inserir Link"
              >
                <LinkIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <Input
            id={id}
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={handleBlur}
            placeholder={placeholder}
            maxLength={maxLength}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
            className={cn(
              "transition-colors p-2 h-auto rounded-sm shadow-none focus-visible:ring-1 truncate",
              error 
                ? "border-destructive focus-visible:ring-destructive bg-destructive/5 pr-8" 
                : showSuccess 
                  ? "border-green-500 focus-visible:ring-green-500 bg-green-500/5" 
                  : "bg-transparent border-dashed border-muted-foreground/30 hover:border-input focus:border-input focus:bg-background",
              className
            )}
          />
        )}
        
        {error && !multiline && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-destructive">
            <AlertCircle className="h-4 w-4" />
          </div>
        )}
      </div>

      <div className="flex justify-between items-start mt-1">
        {error ? (
          <p id={`${id}-error`} className="text-xs text-destructive animate-in fade-in slide-in-from-top-1">
            {error}
          </p>
        ) : <div />}
        
        {showCount && maxLength && (
          <div className={cn(
            "text-xs text-right transition-colors",
            plainTextLength >= maxLength ? "text-destructive font-bold" :
            plainTextLength >= maxLength * 0.9 ? "text-yellow-500 font-medium" : "text-muted-foreground"
          )}>
            {plainTextLength}/{maxLength}
          </div>
        )}
      </div>
    </div>
  );
}
