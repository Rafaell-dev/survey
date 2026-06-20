import { SurveyMediaDTO } from "@/domain/public-survey.types";
import { useSurveyPlayerStore } from "@/store/survey-player.store";

export function MediaRenderer({ media }: { media: SurveyMediaDTO }) {
  const trackMediaInteraction = useSurveyPlayerStore(state => state.trackMediaInteraction);

  if (media.type === "IMAGE") {
    return (
      <div className="relative w-full max-h-[400px] rounded-lg overflow-hidden border bg-muted/20 flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={media.url} 
          alt="Media" 
          className="max-w-full max-h-[400px] object-contain cursor-pointer" 
          onClick={() => trackMediaInteraction(media.id, 'CLICK')}
        />
      </div>
    );
  }

  if (media.type === "VIDEO") {
    return (
      <div className="w-full rounded-lg overflow-hidden border bg-black">
        <video 
          src={media.url} 
          controls 
          className="w-full max-h-[500px]" 
          onPlay={(e) => trackMediaInteraction(media.id, 'PLAY', e.currentTarget.currentTime * 1000)}
          onPause={(e) => trackMediaInteraction(media.id, 'PAUSE', e.currentTarget.currentTime * 1000)}
          onEnded={(e) => trackMediaInteraction(media.id, 'END', e.currentTarget.currentTime * 1000)}
        />
      </div>
    );
  }

  if (media.type === "AUDIO") {
    return (
      <div className="w-full rounded-full overflow-hidden border bg-muted/20 p-2">
        <audio 
          src={media.url} 
          controls 
          className="w-full" 
          onPlay={(e) => trackMediaInteraction(media.id, 'PLAY', e.currentTarget.currentTime * 1000)}
          onPause={(e) => trackMediaInteraction(media.id, 'PAUSE', e.currentTarget.currentTime * 1000)}
          onEnded={(e) => trackMediaInteraction(media.id, 'END', e.currentTarget.currentTime * 1000)}
        />
      </div>
    );
  }

  return null;
}
