export interface Block {
  id: string;
  title: string | null;
  description: string | null;
  orderIndex: number;
  responseLimit?: number | null;
  fallbackBlockId?: string | null;
  showOnlyOnFallback?: boolean;
  responsesCount?: number;
  surveyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBlockDTO {
  title?: string;
  description?: string;
  responseLimit?: number | null;
  fallbackBlockId?: string | null;
  showOnlyOnFallback?: boolean;
}

export interface UpdateBlockDTO {
  title?: string;
  description?: string;
  responseLimit?: number | null;
  fallbackBlockId?: string | null;
  showOnlyOnFallback?: boolean;
}

export interface ReorderBlocksDTO {
  blocks: {
    id: string;
    orderIndex: number;
  }[];
}

// Tipo customizado local (Frontend-Only) 
// Utilizado para gerenciar estado antes de sincronizar com o banco.
// Blocos que são gerados no frontend e ainda não foram pro BD terão `isNew: true`.
// Blocos que não foram pro BD têm id temporário no formato UUID gerado localmente.
export interface LocalBlock extends Partial<Block> {
  id: string;
  title: string;
  description: string;
  orderIndex: number;
  responseLimit?: number | null;
  fallbackBlockId?: string | null;
  showOnlyOnFallback?: boolean;
  responsesCount?: number;
  isNew?: boolean;
  isDeleted?: boolean;
}
