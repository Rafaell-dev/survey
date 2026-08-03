import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useEffect, useState, useRef } from "react";
import { AlertCircle } from "lucide-react";
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
}: EditableFieldProps) {
  const [localValue, setLocalValue] = useState(value || "");
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const successTimeoutRef = useRef<NodeJS.Timeout>(null);

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
        setError(result.error.errors[0].message);
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
    return (
      <div className={cn("whitespace-pre-wrap", className)}>
        {localValue}
      </div>
    );
  }

  return (
    <div className="relative w-full group">
      <div className="relative">
        {multiline ? (
          <Textarea
            id={id}
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={handleBlur}
            placeholder={placeholder}
            maxLength={maxLength}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
            className={cn(
              "resize-none transition-colors min-h-[120px] p-2 shadow-none focus-visible:ring-1",
              error 
                ? "border-destructive focus-visible:ring-destructive bg-destructive/5" 
                : showSuccess 
                  ? "border-green-500 focus-visible:ring-green-500 bg-green-500/5" 
                  : "bg-transparent border-dashed border-muted-foreground/30 hover:border-input focus:border-input focus:bg-background",
              className
            )}
          />
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
