export interface ParsedTextResponse {
  id: string;
  text: string;
  participant: string;
  date: string;
}

export function parseTextResponses(responses?: any[]): ParsedTextResponse[] {
  if (!responses || !Array.isArray(responses)) return [];
  
  return responses.map((r, i) => {
    if (typeof r === 'string') {
      return { 
        id: `resp-${i}`,
        text: r, 
        participant: 'Anônimo', 
        date: new Date().toISOString() 
      };
    }
    
    return {
      id: r.id || `resp-${i}`,
      text: r.text || r.answer || r.value || String(r),
      participant: r.participant || r.participantName || r.participantId || 'Anônimo',
      date: r.date || r.submittedAt || r.createdAt || new Date().toISOString()
    };
  });
}

// Stopwords básicas para não poluir a nuvem de palavras
const STOP_WORDS = new Set([
  'o', 'a', 'os', 'as', 'um', 'uma', 'uns', 'umas',
  'de', 'do', 'da', 'dos', 'das',
  'em', 'no', 'na', 'nos', 'nas',
  'por', 'pelo', 'pela', 'pelos', 'pelas',
  'para', 'pra', 'com', 'sem',
  'e', 'ou', 'mas', 'porém', 'contudo', 'todavia',
  'que', 'qual', 'quais', 'quem',
  'é', 'são', 'foi', 'foram', 'ser', 'estar', 'ter',
  'se', 'me', 'te', 'lhe', 'nos', 'vos',
  'não', 'sim', 'já', 'mais', 'muito', 'como',
  'eu', 'tu', 'ele', 'ela', 'nós', 'vós', 'eles', 'elas',
  'meu', 'minha', 'seu', 'sua', 'nosso', 'nossa',
  'este', 'esta', 'esse', 'essa', 'isso', 'isto', 'aquilo',
  'ao', 'aos', 'à', 'às'
]);

export function extractWordFrequencies(responses: ParsedTextResponse[]): { word: string; count: number }[] {
  const frequencies: Record<string, number> = {};
  
  responses.forEach(r => {
    if (!r.text) return;
    
    // Limpa pontuações e quebra em palavras
    const words = r.text
      .toLowerCase()
      .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "")
      .split(/\s+/);
      
    words.forEach(w => {
      if (w.length > 2 && !STOP_WORDS.has(w)) {
        frequencies[w] = (frequencies[w] || 0) + 1;
      }
    });
  });
  
  return Object.entries(frequencies)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count);
}
