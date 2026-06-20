"use client";

import { useThemeStore } from "@/store/theme.store";

export function SurveyPreview() {
  const { theme } = useThemeStore();

  if (!theme) return null;

  // Transformar configs no style inline dinâmico
  const containerStyle = {
    backgroundColor: theme.backgroundColor,
    color: theme.textColor,
    fontFamily: theme.fontFamily,
  };

  const primaryStyle = {
    backgroundColor: theme.primaryColor,
    color: theme.buttonColor, // Vamos usar buttonColor como texto em cima da cor primária ou vice-versa? 
                              // O prompt diz 'buttonColor' como cor do botão, e primary como tema geral.
  };

  const isFullPage = theme.layout === "FULL_PAGE";
  const isCompact = theme.layout === "COMPACT";

  return (
    <div 
      className="w-full h-full min-h-[500px] max-h-[800px] overflow-y-auto rounded-xl flex items-start justify-center shadow-inner transition-all duration-300"
      style={{ backgroundColor: isFullPage ? theme.backgroundColor : "#f1f5f9", fontFamily: theme.fontFamily }}
    >
      <div 
        className={`w-full transition-all duration-500 ${
          isFullPage ? "min-h-full max-w-3xl px-8 py-12" : 
          isCompact ? "max-w-xl my-8 bg-white shadow-lg rounded-2xl overflow-hidden border" :
          "max-w-2xl my-12 bg-white shadow-xl rounded-xl overflow-hidden border"
        }`}
        style={!isFullPage ? { backgroundColor: theme.backgroundColor, color: theme.textColor } : { color: theme.textColor }}
      >
        {theme.headerImage && (
          <div className="w-full h-48 bg-muted relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={theme.headerImage.startsWith('http') ? theme.headerImage : `${process.env.NEXT_PUBLIC_API_URL}${theme.headerImage}`} 
              alt="Capa"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className={`space-y-6 ${isFullPage ? "" : "p-8"}`}>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold" style={{ color: theme.primaryColor }}>
              Pesquisa de Satisfação (Exemplo)
            </h1>
            <p className="opacity-80">
              Esta é uma visualização de como o seu formulário será renderizado para os participantes.
            </p>
          </div>

          <div className="space-y-4 pt-6">
            <div className="p-4 border rounded-lg bg-black/5 border-black/10">
              <p className="font-medium mb-3">1. Como você avalia sua experiência?</p>
              <div className="flex gap-3">
                {[1, 2, 3, 4, 5].map(num => (
                  <div key={num} className="w-10 h-10 rounded-full flex items-center justify-center border opacity-50 cursor-pointer">
                    {num}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border rounded-lg bg-black/5 border-black/10">
              <p className="font-medium mb-3">2. Qual o seu feedback?</p>
              <div className="h-24 w-full rounded border bg-transparent opacity-50"></div>
            </div>
          </div>

          <div className="pt-8">
            <button 
              className="px-6 py-3 rounded-lg font-medium shadow-sm transition-opacity hover:opacity-90 w-full sm:w-auto"
              style={{ backgroundColor: theme.buttonColor, color: theme.backgroundColor }}
            >
              Enviar Respostas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
