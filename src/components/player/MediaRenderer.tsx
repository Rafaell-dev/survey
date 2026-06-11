import { SurveyMediaDTO } from "@/domain/public-survey.types";

export function MediaRenderer({ media }: { media: SurveyMediaDTO }) {
  if (media.type === "IMAGE") {
    return (
      <div className="relative w-full max-h-[400px] rounded-lg overflow-hidden border bg-muted/20 flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={media.url} alt="Media" className="max-w-full max-h-[400px] object-contain" />
      </div>
    );
  }

  if (media.type === "VIDEO") {
    return (
      <div className="w-full rounded-lg overflow-hidden border">
        <video src={media.url} controls className="w-full max-h-[500px]" />
      </div>
    );
  }

  if (media.type === "AUDIO") {
    return (
      <div className="w-full rounded-full overflow-hidden border bg-muted/20 p-2">
        <audio src={media.url} controls className="w-full" />
      </div>
    );
  }

  return null;
}
