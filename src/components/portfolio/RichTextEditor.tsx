import { useEditor, EditorContent } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import { useState, useEffect, useRef } from 'react'
import { Bold, Italic, Underline as UnderlineIcon, Strikethrough, Link as LinkIcon, ExternalLink, X, Edit2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { ConfirmModal } from '@/components/ui/confirm-modal'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const normalizeUrl = (url: string) => {
  if (!url) return null;
  let trimmed = url.trim();
  const forbidden = /^(javascript|data|file|vbscript|blob):/i;
  if (forbidden.test(trimmed)) return null;

  if (!trimmed.startsWith('mailto:') && !trimmed.startsWith('tel:') && !trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('/')) {
    trimmed = `https://${trimmed}`;
  }

  try {
    // Usamos dummy base (ex: http://local) apenas para testar caminhos relativos
    new URL(trimmed, 'http://localhost');
    return trimmed;
  } catch (e) {
    return null;
  }
}

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  maxLength?: number;
}

export function RichTextEditor({ value, onChange, onBlur, placeholder, maxLength }: RichTextEditorProps) {
  const [menuState, setMenuState] = useState<'DEFAULT' | 'EDIT_LINK' | 'VIEW_LINK'>('DEFAULT');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [pasteModalOpen, setPasteModalOpen] = useState(false);
  const [pendingPasteUrl, setPendingPasteUrl] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.extend({
        addKeyboardShortcuts() {
          return {
            'Mod-k': () => {
              if (this.editor.isActive('link')) {
                setMenuState('EDIT_LINK');
                const attrs = this.editor.getAttributes('link');
                setLinkUrl(attrs.href || '');
                const { from, to } = this.editor.state.selection;
                setLinkText(this.editor.state.doc.textBetween(from, to, ' ') || '');
              } else {
                setMenuState('EDIT_LINK');
                setLinkUrl('');
                const { from, to } = this.editor.state.selection;
                setLinkText(this.editor.state.doc.textBetween(from, to, ' ') || '');
              }
              return true;
            },
          }
        }
      }).configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: false, 
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank',
          class: '!text-primary hover:underline cursor-pointer transition-colors',
          title: 'Abrir link',
        },
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none p-3 min-h-[120px] focus:outline-none text-muted-foreground outline-none prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline prose-a:cursor-pointer',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onBlur: () => {
      if (onBlur) onBlur();
    },
    onSelectionUpdate: ({ editor }) => {
      if (menuState === 'EDIT_LINK') return; 
      
      if (editor.isActive('link')) {
        setMenuState('VIEW_LINK');
      } else {
        setMenuState('DEFAULT');
      }
    }
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  const openEditLink = () => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    const text = editor.state.doc.textBetween(from, to, ' ');
    setLinkText(text || '');
    
    if (editor.isActive('link')) {
      setLinkUrl(editor.getAttributes('link').href || '');
    } else {
      setLinkUrl('');
    }
    setMenuState('EDIT_LINK');
  }
  
  const saveLink = () => {
    if (!editor) return;
    const normalized = normalizeUrl(linkUrl);
    if (!normalized) {
      alert("Informe uma URL válida.");
      return;
    }
    
    const txt = linkText.trim();
    if (txt.length === 0 || txt.length > 200) {
      alert("O texto do link é obrigatório e deve ter no máximo 200 caracteres.");
      return;
    }
    
    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .insertContent(`<a href="${normalized}">${txt}</a>`)
      .run();
      
    setMenuState('DEFAULT');
  }

  const cancelLink = () => {
    setMenuState(editor?.isActive('link') ? 'VIEW_LINK' : 'DEFAULT');
    editor?.commands.focus();
  }

  const removeLink = () => {
    if (!editor) return;
    editor.chain().focus().unsetLink().run();
    setMenuState('DEFAULT');
  }

  const handlePasteCapture = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text');
    const isUrl = /^(https?:\/\/|www\.)[^\s]+/i.test(text);
    
    if (!editor) return;
    const { empty } = editor.state.selection;

    if (isUrl) {
      if (!empty) {
        e.preventDefault();
        e.stopPropagation();
        setPendingPasteUrl(text);
        setPasteModalOpen(true);
      } else {
        e.preventDefault();
        e.stopPropagation();
        const normalized = normalizeUrl(text);
        if (normalized) {
          editor.chain().focus().insertContent(`<a href="${normalized}">${normalized}</a>`).run();
        }
      }
    }
  };

  const confirmPasteLink = () => {
    if (!editor) return;
    const normalized = normalizeUrl(pendingPasteUrl);
    if (normalized) {
      editor.chain().focus().setLink({ href: normalized }).run();
    }
    setPasteModalOpen(false);
  }

  const handleContainerBlur = (e: React.FocusEvent) => {
    setTimeout(() => {
      const activeEl = document.activeElement;
      const isInsideContainer = containerRef.current?.contains(activeEl);
      const isInsidePopover = activeEl?.closest('[data-slot="popover-content"]');
      const isInsideModal = activeEl?.closest('[role="dialog"]');
      
      if (!isInsideContainer && !isInsidePopover && !isInsideModal) {
        if (onBlur) onBlur();
      }
    }, 150);
  };

  if (!editor) return null;

  return (
    <div 
      ref={containerRef}
      onBlur={handleContainerBlur}
      className="relative w-full border border-dashed border-muted-foreground/30 rounded-md bg-transparent overflow-visible focus-within:ring-1 focus-within:ring-ring focus-within:border-input focus-within:bg-background hover:border-input transition-colors group/rte" 
      onPasteCapture={handlePasteCapture}
    >
      
      {/* FIXED TOOLBAR */}
      <div className="flex items-center gap-1 border-b border-border/40 p-1.5 bg-muted/20 rounded-t-md">
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn("h-7 w-7", editor.isActive('bold') && "bg-muted")} 
          onClick={() => editor.chain().focus().toggleBold().run()} 
          aria-label="Negrito"
          title="Negrito"
        >
          <Bold className={cn("w-3.5 h-3.5", editor.isActive('bold') && "text-primary")} />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn("h-7 w-7", editor.isActive('italic') && "bg-muted")} 
          onClick={() => editor.chain().focus().toggleItalic().run()} 
          aria-label="Itálico"
          title="Itálico"
        >
          <Italic className={cn("w-3.5 h-3.5", editor.isActive('italic') && "text-primary")} />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn("h-7 w-7", editor.isActive('underline') && "bg-muted")} 
          onClick={() => editor.chain().focus().toggleUnderline().run()} 
          aria-label="Sublinhado"
          title="Sublinhado"
        >
          <UnderlineIcon className={cn("w-3.5 h-3.5", editor.isActive('underline') && "text-primary")} />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn("h-7 w-7", editor.isActive('strike') && "bg-muted")} 
          onClick={() => editor.chain().focus().toggleStrike().run()} 
          aria-label="Tachado"
          title="Tachado"
        >
          <Strikethrough className={cn("w-3.5 h-3.5", editor.isActive('strike') && "text-primary")} />
        </Button>
        <div className="w-px h-4 bg-border mx-1" />
        
        <Popover open={menuState === 'EDIT_LINK'} onOpenChange={(open) => {
          if (!open && menuState === 'EDIT_LINK') cancelLink();
        }}>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn("h-7 w-7", editor.isActive('link') && "bg-muted")} 
              onClick={openEditLink} 
              aria-label="Adicionar Link"
              title="Adicionar Link (Ctrl+K)"
            >
              <LinkIcon className={cn("w-3.5 h-3.5", editor.isActive('link') && "text-primary")} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3" align="start" sideOffset={8}>
            <div className="flex flex-col gap-3">
               <div className="space-y-1.5">
                 <label className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Texto</label>
                 <Input 
                   value={linkText} 
                   onChange={e => setLinkText(e.target.value)} 
                   placeholder="Digite o texto" 
                   className="h-8 text-xs" 
                   autoFocus
                   onKeyDown={e => { if(e.key === 'Enter') saveLink(); if(e.key === 'Escape') cancelLink(); }}
                 />
               </div>
               <div className="space-y-1.5">
                 <label className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">URL</label>
                 <Input 
                   value={linkUrl} 
                   onChange={e => setLinkUrl(e.target.value)} 
                   placeholder="https://" 
                   className="h-8 text-xs"
                   onKeyDown={e => { if(e.key === 'Enter') saveLink(); if(e.key === 'Escape') cancelLink(); }}
                 />
               </div>
               <div className="flex justify-end gap-2 mt-1">
                 <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={cancelLink} aria-label="Cancelar">
                   Cancelar
                 </Button>
                 <Button variant="default" size="sm" className="h-7 text-xs" onClick={saveLink} aria-label="Salvar Link">
                   Salvar
                 </Button>
               </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* VIEW LINK BUBBLE MENU */}
      <BubbleMenu editor={editor} shouldShow={({ editor }) => editor.isActive('link') && menuState !== 'EDIT_LINK'}>
        <div className="bg-popover border border-border text-popover-foreground shadow-md rounded-md flex flex-col p-1 gap-1 min-w-[200px]">
           <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-8 gap-2 text-xs" onClick={openEditLink} aria-label="Editar Link">
                <Edit2 className="w-3.5 h-3.5" /> Editar
              </Button>
              <Button variant="ghost" size="sm" className="h-8 gap-2 text-xs" asChild aria-label="Abrir Link">
                <a href={editor.getAttributes('link').href} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-3.5 h-3.5" /> Abrir
                </a>
              </Button>
              <div className="w-px h-5 bg-border mx-1" />
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={removeLink} aria-label="Remover Link">
                <X className="w-4 h-4" />
              </Button>
           </div>
        </div>
      </BubbleMenu>

      <div className="relative">
        <EditorContent editor={editor} />
        {placeholder && !value && (
           <div className="absolute top-3 left-3 pointer-events-none text-muted-foreground/50 text-sm">
             {placeholder}
           </div>
        )}
      </div>
      
      <ConfirmModal 
        isOpen={pasteModalOpen} 
        onClose={() => setPasteModalOpen(false)}
        onConfirm={confirmPasteLink}
        title="Transformar em Link?"
        description="Deseja transformar o texto selecionado em um link apontando para a URL copiada?"
        confirmText="Sim"
        cancelText="Cancelar"
      />
    </div>
  )
}
