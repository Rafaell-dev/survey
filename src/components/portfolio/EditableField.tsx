import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface EditableFieldProps {
  value: string;
  onSave: (value: string) => void;
  isEditing: boolean;
  multiline?: boolean;
  placeholder?: string;
  className?: string;
  maxLength?: number;
  showCount?: boolean;
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
}: EditableFieldProps) {
  const [localValue, setLocalValue] = useState(value || "");

  useEffect(() => {
    setLocalValue(value || "");
  }, [value]);

  const handleBlur = () => {
    if (localValue !== value) {
      onSave(localValue);
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
    <div className="relative w-full">
      {multiline ? (
        <Textarea
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleBlur}
          placeholder={placeholder}
          maxLength={maxLength}
          className={cn(
            "resize-none bg-transparent border-transparent hover:border-input focus:border-input focus:bg-background transition-colors min-h-[120px] p-2 shadow-none focus-visible:ring-1",
            className
          )}
        />
      ) : (
        <Input
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleBlur}
          placeholder={placeholder}
          maxLength={maxLength}
          className={cn(
            "bg-transparent border-transparent hover:border-input focus:border-input focus:bg-background transition-colors p-2 h-auto rounded-sm shadow-none focus-visible:ring-1 truncate",
            className
          )}
        />
      )}
      {showCount && maxLength && (
        <div className="text-xs text-muted-foreground text-right mt-1">
          {localValue.length}/{maxLength}
        </div>
      )}
    </div>
  );
}
