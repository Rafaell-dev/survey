import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useEffect, useState, useRef } from "react";
import { AlertCircle, Link as LinkIcon } from "lucide-react";
import { z } from "zod";
import { sanitizeText } from "@/lib/portfolio-validators";

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
}: EditableFieldProps) {
  const [localValue, setLocalValue] = useState(value || "");
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const successTimeoutRef = useRef<NodeJS.Timeout>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const handleBlur = () => {
    let finalValue = localValue;
    if (autoSanitize) {
      finalValue = sanitizeText(localValue);
      setLocalValue(finalValue);
    }

    if (validator) {
      const result = validator.safeParse(finalValue);
      if (!result.success) {
        setError((result.error as any).errors[0]?.message || "Valor inválido");
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
        {multiline ? (
          <div className="relative">
            <Textarea
              ref={textareaRef}
              id={id}
              value={localValue}
              onChange={(e) => setLocalValue(e.target.value)}
              onBlur={handleBlur}
              placeholder={placeholder}
              maxLength={maxLength}
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
            localValue.length >= maxLength ? "text-destructive font-bold" :
            localValue.length >= maxLength * 0.9 ? "text-yellow-500 font-medium" : "text-muted-foreground"
          )}>
            {localValue.length}/{maxLength}
          </div>
        )}
      </div>
    </div>
  );
}
