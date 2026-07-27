import { QuestionAnalyticsDTO } from "@/domain/analytics.types";
import { Card } from "@/components/ui/card";
import { BookOpen, Clock, Zap } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Props {
  question: QuestionAnalyticsDTO;
}

interface SegmentStat {
  segmentIndex: number;
  totalTimeSpentMs: number;
  totalWordCount: number;
  responseCount: number;
}

export function MonitoredReadingRenderer({ question }: Props) {
  const responses = question.responses || [];
  
  const segmentStats: Record<number, SegmentStat> = {};
  let totalOverallTimeMs = 0;
  let totalSegmentsRead = 0;
  let totalWordsRead = 0;
  let validParticipantsCount = 0;

  responses.forEach((responseObj: any) => {
    const rawText = typeof responseObj === 'string' 
      ? responseObj 
      : responseObj.textValue || responseObj.value || responseObj;
      
    if (typeof rawText === 'string') {
      try {
        const parsed = JSON.parse(rawText);
        if (Array.isArray(parsed) && parsed.length > 0) {
          validParticipantsCount++;
          
          parsed.forEach((segment: any) => {
            const index = segment.segmentIndex;
            if (!segmentStats[index]) {
              segmentStats[index] = {
                segmentIndex: index,
                totalTimeSpentMs: 0,
                totalWordCount: 0,
                responseCount: 0
              };
            }
            
            segmentStats[index].totalTimeSpentMs += segment.timeSpentMs || 0;
            segmentStats[index].totalWordCount += segment.wordCount || 0;
            segmentStats[index].responseCount += 1;
            
            totalOverallTimeMs += segment.timeSpentMs || 0;
            totalSegmentsRead += 1;
            totalWordsRead += segment.wordCount || 0;
          });
        }
      } catch (e) {}
    }
  });

  const statsArray = Object.values(segmentStats).sort((a, b) => a.segmentIndex - b.segmentIndex);
  
  const avgOverallTimeS = validParticipantsCount > 0 ? (totalOverallTimeMs / validParticipantsCount / 1000).toFixed(1) : "0.0";
  const overallWPM = (totalOverallTimeMs > 0) ? Math.round(totalWordsRead / (totalOverallTimeMs / 1000 / 60)) : 0;

  if (statsArray.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-muted-foreground w-full border rounded-md border-dashed">
        <p>Nenhum dado de leitura registrado ainda.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 flex items-center gap-4 bg-muted/20">
          <div className="p-3 bg-amber-500/10 text-amber-600 rounded-full">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Tempo Médio Total</p>
            <p className="text-2xl font-bold">{avgOverallTimeS}s</p>
          </div>
        </Card>
        
        <Card className="p-4 flex items-center gap-4 bg-muted/20">
          <div className="p-3 bg-amber-500/10 text-amber-600 rounded-full">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Velocidade Média Global</p>
            <p className="text-2xl font-bold">{overallWPM} PPM <span className="text-xs font-normal text-muted-foreground">(Palavras por Minuto)</span></p>
          </div>
        </Card>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[100px]">Trecho</TableHead>
              <TableHead>Leituras</TableHead>
              <TableHead>Palavras (Méd.)</TableHead>
              <TableHead>Tempo Médio (s)</TableHead>
              <TableHead className="text-right">Velocidade (PPM)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {statsArray.map((stat) => {
              const avgTimeMs = stat.totalTimeSpentMs / stat.responseCount;
              const avgWords = stat.totalWordCount / stat.responseCount;
              const avgTimeS = (avgTimeMs / 1000).toFixed(1);
              
              const wpm = avgTimeMs > 0 ? Math.round(stat.totalWordCount / (stat.totalTimeSpentMs / 1000 / 60)) : 0;
              
              return (
                <TableRow key={stat.segmentIndex}>
                  <TableCell className="font-medium">Parte {stat.segmentIndex + 1}</TableCell>
                  <TableCell>{stat.responseCount}</TableCell>
                  <TableCell>{Math.round(avgWords)}</TableCell>
                  <TableCell>{avgTimeS}s</TableCell>
                  <TableCell className="text-right">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${wpm < 150 ? 'bg-red-100 text-red-700' : wpm > 300 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {wpm} ppm
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
