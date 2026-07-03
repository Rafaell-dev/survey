import { QuestionChartProps } from "../charts/types";
import { ChartType } from "@/domain/analytics.types";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";

const ResponseList = dynamic(() => import("./ResponseList").then(mod => mod.ResponseList), { loading: () => <LoadingPlaceholder /> });
const ResponseTable = dynamic(() => import("./ResponseTable").then(mod => mod.ResponseTable), { loading: () => <LoadingPlaceholder /> });
const WordCloud = dynamic(() => import("./WordCloud").then(mod => mod.WordCloud), { loading: () => <LoadingPlaceholder /> });
const WordFrequency = dynamic(() => import("./WordFrequency").then(mod => mod.WordFrequency), { loading: () => <LoadingPlaceholder /> });
const ResponseTimeline = dynamic(() => import("./ResponseTimeline").then(mod => mod.ResponseTimeline), { loading: () => <LoadingPlaceholder /> });
const AiClusters = dynamic(() => import("./AiClusters").then(mod => mod.AiClusters), { loading: () => <LoadingPlaceholder /> });
const SentimentAnalysis = dynamic(() => import("./SentimentAnalysis").then(mod => mod.SentimentAnalysis), { loading: () => <LoadingPlaceholder /> });

function LoadingPlaceholder() {
  return (
    <div className="w-full h-80 flex items-center justify-center text-muted-foreground">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
}

export function TextVisualizationRenderer(props: QuestionChartProps) {
  const { visualization } = props;

  switch (visualization.chartType) {
    case ChartType.TEXT_RESPONSE_LIST:
      return <ResponseList {...props} />;
    
    case ChartType.TEXT_TABLE:
      return <ResponseTable {...props} />;
      
    case ChartType.TEXT_WORD_CLOUD:
      return <WordCloud {...props} />;
      
    case ChartType.TEXT_WORD_FREQUENCY:
      return <WordFrequency {...props} />;
      
    case ChartType.TEXT_TIMELINE:
      return <ResponseTimeline {...props} />;
      
    case ChartType.TEXT_AI_CLUSTERS:
      return <AiClusters {...props} />;
      
    case ChartType.TEXT_SENTIMENT_ANALYSIS:
      return <SentimentAnalysis {...props} />;
      
    default:
      return <ResponseList {...props} />;
  }
}
