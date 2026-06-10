"use client";

import { MediaUploader } from "./MediaUploader";
import { MediaList } from "./MediaList";

interface MediaSectionProps {
  questionId: string;
  isNew?: boolean;
}

export function MediaSection({ questionId, isNew }: MediaSectionProps) {
  return (
    <div className="mt-4 pt-4 border-t border-dashed space-y-4">
      <MediaList questionId={questionId} isNew={isNew} />
      {!isNew && <MediaUploader questionId={questionId} />}
    </div>
  );
}
