import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BlockNavigationAnalytics, MediaAnalyticsItem } from "@/domain/analytics.types";
import { Clock, MousePointerClick, Play, Pause, Square } from "lucide-react";

interface TrackingPanelProps {
  blocks: BlockNavigationAnalytics[];
  medias: MediaAnalyticsItem[];
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {medias.map(media => (
              <Card key={media.mediaId} className="border-border/50 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-mono text-muted-foreground truncate" title={media.fileName || media.mediaId}>
                    {media.fileName || `Mídia: ${media.mediaId.substring(0, 8)}...`}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-2 text-center mt-2">
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
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
