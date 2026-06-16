export interface ParticipantDTO {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  createdAt: string;
}

export interface CreateParticipantDTO {
  name?: string;
  email?: string;
  phone?: string;
}

export interface ResponseSessionDTO {
  participantId: string;
  responseId: string;
  status: "IN_PROGRESS" | "COMPLETED" | "ABANDONED";
  startedAt: string;
}

export interface StartResponseDTO {
  surveyId: string;
  participant: CreateParticipantDTO;
}
