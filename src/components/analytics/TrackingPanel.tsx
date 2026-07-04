import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BlockNavigationAnalytics, MediaAnalyticsItem, MediaInteractionDetail } from "@/domain/analytics.types";
import { Clock, MousePointerClick, Play, Pause, Square, History } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface TrackingPanelProps {
  blocks: BlockNavigationAnalytics[];
  medias: MediaAnalyticsItem[];
}

function MediaTrackingCard({ media }: { media: MediaAnalyticsItem }) {
  const [showHistory, setShowHistory] = useState(false);

  return (
    <Card className="border-border/50 shadow-sm flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-mono text-muted-foreground truncate" title={media.fileName || media.mediaId}>
          {media.fileName || `Mídia: ${media.mediaId.substring(0, 8)}...`}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="grid grid-cols-4 gap-2 text-center mt-2 mb-4">
          <div className="bg-muted/30 p-2 rounded border flex flex-col items-center">
            <Play className="w-4 h-4 text-emerald-500 mb-1" />
            <span className="text-xs text-muted-foreground">Plays</span>
            <span className="font-bold">{media.plays}</span>
          </div>
          <div className="bg-muted/30 p-2 rounded border flex flex-col items-center">
            <Pause className="w-4 h-4 text-amber-500 mb-1" />
            <span className="text-xs text-muted-foreground">Pauses</span>
            <span className="font-bold">{media.pauses}</span>
          </div>
          <div className="bg-muted/30 p-2 rounded border flex flex-col items-center">
            <Square className="w-4 h-4 text-rose-500 mb-1" />
            <span className="text-xs text-muted-foreground">Ends</span>
            <span className="font-bold">{media.ends}</span>
          </div>
          <div className="bg-muted/30 p-2 rounded border flex flex-col items-center">
            <MousePointerClick className="w-4 h-4 text-blue-500 mb-1" />
            <span className="text-xs text-muted-foreground">Clicks</span>
            <span className="font-bold">{media.clicks}</span>
          </div>
        </div>
        
        {media.interactionsList && media.interactionsList.length > 0 && (
          <div className="mt-auto border-t pt-3">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-xs flex items-center gap-2"
              onClick={() => setShowHistory(!showHistory)}
            >
              <History className="w-4 h-4" />
              {showHistory ? 'Ocultar Histórico' : 'Ver Histórico de Interações'}
            </Button>
            
            {showHistory && (
              <div className="mt-3 max-h-48 overflow-y-auto rounded border bg-muted/20 p-1">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr>
                      <th className="p-2 font-medium">Participante</th>
                      <th className="p-2 font-medium">Ação</th>
                      <th className="p-2 font-medium">Vídeo</th>
                      <th className="p-2 font-medium">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {media.interactionsList.map((inter, idx) => (
                      <tr key={idx} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="p-2 truncate max-w-[120px]" title={inter.participantIdentification}>
                          {inter.participantIdentification}
                        </td>
                        <td className="p-2">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            inter.interactionType === 'PLAY' ? 'bg-emerald-100 text-emerald-700' :
                            inter.interactionType === 'PAUSE' ? 'bg-amber-100 text-amber-700' :
                            inter.interactionType === 'END' ? 'bg-rose-100 text-rose-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {inter.interactionType}
                          </span>
                        </td>
                        <td className="p-2">
                          {inter.timeOffsetMs !== undefined && inter.timeOffsetMs !== null 
                            ? `${Math.round(inter.timeOffsetMs / 1000)}s` 
                            : '-'}
                        </td>
                        <td className="p-2 text-muted-foreground">
                          {new Date(inter.timestamp).toLocaleString(undefined, {
                             month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function TrackingPanel({ blocks, medias }: TrackingPanelProps) {
  return (
    <div className="space-y-8 mt-4">
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="h-6 w-1 bg-blue-500 rounded-full"></div>
          <h3 className="text-xl font-bold">Fluxo de Navegação e Blocos</h3>
        </div>
        
        {blocks.length === 0 ? (
          <p className="text-muted-foreground text-sm italic">Nenhum dado de bloco registrado.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {blocks.map(block => (
              <Card key={block.blockId} className="border-border/50 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm truncate" title={block.title || "Bloco sem título"}>
                    {block.title || "Bloco sem título"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground flex items-center gap-1"><Clock className="w-4 h-4"/> Tempo Médio</span>
                    <span className="font-semibold">{Math.round(block.averageTimeMs / 1000)}s</span>
                  </div>
                  <div className="flex justify-between items-center text-sm border-t pt-2">
                    <span className="text-muted-foreground flex items-center gap-1">Visitas</span>
                    <span className="font-semibold">{block.visits}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="h-6 w-1 bg-emerald-500 rounded-full"></div>
          <h3 className="text-xl font-bold">Interações com Mídias</h3>
        </div>
        
        {medias.length === 0 ? (
          <p className="text-muted-foreground text-sm italic">Nenhum dado de mídia registrado.</p>
        ) : (
          <div className="space-y-6">
            {Object.entries(
              medias.reduce((acc, media) => {
                const qId = media.questionId || 'unknown';
                if (!acc[qId]) acc[qId] = { title: media.questionTitle, medias: [] };
                acc[qId].medias.push(media);
                return acc;
              }, {} as Record<string, { title: string, medias: MediaAnalyticsItem[] }>)
            ).map(([qId, group]) => (
              <div key={qId} className="border rounded-lg p-4 bg-muted/10 shadow-sm">
                <h4 className="font-semibold text-md mb-3 flex items-center gap-2">
                  <span className="bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded text-sm">Pergunta</span> 
                  {group.title}
                </h4>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {group.medias.map(media => (
                    <MediaTrackingCard key={media.mediaId} media={media} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
