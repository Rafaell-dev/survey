# Esquema de Banco de Dados (PostgreSQL + Prisma)

Com base no documento de requisitos e no contexto do projeto, o banco de dados precisará ser estruturado não apenas para gerenciar o conteúdo dos formulários, mas principalmente para suportar o **rastreamento comportamental** (tempos, cliques, interações com mídias e fluxo condicional).

Abaixo estão descritas as entidades necessárias e a representação de como elas podem ser implementadas no **Prisma Schema**.

---

## 1. Agrupamento das Entidades

Podemos dividir as entidades em dois grandes grupos: **Estruturais** (gerenciamento do survey pelo pesquisador) e **Tracking/Coleta** (dados gerados pelo participante).

### 1.1. Entidades Estruturais (Criação do Survey)
- **`User` (Pesquisador):** O dono do survey, responsável pela criação e análise.
- **`Survey`:** O experimento em si (título, descrição, status).
- **`Block`:** Um bloco de agrupamento. Essencial para organizar perguntas e aplicar a lógica condicional (ex: "Se X, vá para o Bloco B").
- **`Question`:** A pergunta. Pode ser texto, Likert, múltipla escolha, mídia, etc. Guarda configurações específicas (ex: range da escala Likert e representação visual).
- **`QuestionOption`:** As alternativas de uma pergunta (se múltipla escolha) ou rótulos de uma escala Likert. Cada opção tem um valor numérico associado.
- **`Media`:** Arquivos multimídia (áudio, vídeo, imagem) associados a uma pergunta ou bloco.
- **`ConditionalRule`:** As regras criadas no survey para rotear o participante para diferentes blocos com base em respostas anteriores.

### 1.2. Entidades de Tracking e Coleta (Respostas)
- **`Participant`:** O respondente (pode ser anônimo ou identificado).
- **`SurveyResponse`:** A sessão de uma resposta ao survey. Armazena o momento de início, fim, status e tempo total gasto.
- **`Answer`:** A resposta concreta a uma pergunta. Armazena o valor (texto e numérico), bem como o **tempo gasto naquela tela/pergunta**.
- **`BlockTracking`:** Registra a jornada do participante pelos blocos, incluindo ordem de entrada, saída e tempo de permanência em cada bloco.
- **`MediaInteraction`:** O log de interações comportamentais com mídias (quando deu play, pause, terminou ou clicou, e o momento exato).

---

## 2. Proposta de Código: `schema.prisma`

Abaixo está a representação sugerida para as tabelas e relacionamentos utilizando Prisma ORM para PostgreSQL.

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ==========================================
// ESTRUTURA E CRIAÇÃO DO SURVEY
// ==========================================

model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  password  String
  surveys   Survey[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Survey {
  id           String   @id @default(uuid())
  title        String
  description  String?
  instructions String?
  status       SurveyStatus @default(DRAFT)
  
  researcherId String
  researcher   User     @relation(fields: [researcherId], references: [id])
  
  blocks       Block[]
  responses    SurveyResponse[]
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

enum SurveyStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

model Block {
  id          String  @id @default(uuid())
  title       String?
  description String?
  orderIndex  Int
  
  surveyId    String
  survey      Survey  @relation(fields: [surveyId], references: [id], onDelete: Cascade)
  
  questions   Question[]
  rulesTargeted ConditionalRule[] @relation("TargetBlock")
  trackings   BlockTracking[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Question {
  id              String   @id @default(uuid())
  title           String
  description     String?
  type            QuestionType
  isRequired      Boolean  @default(true)
  orderIndex      Int
  
  // Configurações avançadas para Escalas Likert/Sliders
  scaleStart      Int?
  scaleEnd        Int?
  scaleVisualType ScaleVisualType? 
  
  blockId         String
  block           Block    @relation(fields: [blockId], references: [id], onDelete: Cascade)
  
  options         QuestionOption[]
  medias          Media[]
  rules           ConditionalRule[]
  answers         Answer[]
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum QuestionType {
  SHORT_TEXT
  LONG_TEXT
  MULTIPLE_CHOICE
  SINGLE_CHOICE
  LIKERT
  SLIDER
  MEDIA_ONLY
}

enum ScaleVisualType {
  NUMBERS
  EMOJIS
  ICONS
  SLIDER
  TEXT_LABELS
}

model QuestionOption {
  id          String   @id @default(uuid())
  label       String
  value       Int?     // Valor numérico obrigatório para análise de escalas (RN03)
  orderIndex  Int
  
  questionId  String
  question    Question @relation(fields: [questionId], references: [id], onDelete: Cascade)
  
  answers     Answer[]
}

model Media {
  id          String   @id @default(uuid())
  type        MediaType
  url         String
  fileName    String?
  
  questionId  String?
  question    Question? @relation(fields: [questionId], references: [id], onDelete: Cascade)
  
  interactions MediaInteraction[]
  
  createdAt   DateTime @default(now())
}

enum MediaType {
  AUDIO
  VIDEO
  IMAGE
}

model ConditionalRule {
  id              String   @id @default(uuid())
  questionId      String
  question        Question @relation(fields: [questionId], references: [id], onDelete: Cascade)
  
  operator        RuleOperator
  matchValue      String   // O valor esperado (ex: "vermelho" ou ID da opção) para disparar a regra
  
  targetBlockId   String
  targetBlock     Block    @relation("TargetBlock", fields: [targetBlockId], references: [id], onDelete: Cascade)
}

enum RuleOperator {
  EQUALS
  NOT_EQUALS
  GREATER_THAN
  LESS_THAN
}

// ==========================================
// TRACKING, COLETA E RESPOSTAS
// ==========================================

model Participant {
  id             String   @id @default(uuid())
  identifier     String?  // Ex: e-mail, matrícula ou token anônimo
  
  responses      SurveyResponse[]
  
  createdAt      DateTime @default(now())
}

model SurveyResponse {
  id             String   @id @default(uuid())
  status         ResponseStatus @default(IN_PROGRESS)
  totalTimeMs    Int?     // Tempo total do survey
  
  participantId  String
  participant    Participant @relation(fields: [participantId], references: [id])
  
  surveyId       String
  survey         Survey      @relation(fields: [surveyId], references: [id], onDelete: Cascade)
  
  startedAt      DateTime @default(now())
  finishedAt     DateTime?
  
  answers        Answer[]
  blockTrackings BlockTracking[]
  mediaInteractions MediaInteraction[]
}

enum ResponseStatus {
  IN_PROGRESS
  COMPLETED
}

model Answer {
  id               String   @id @default(uuid())
  textValue        String?
  numericValue     Int?     // Resposta visual convertida em numérico
  timeSpentMs      Int?     // Tempo gasto apenas nesta pergunta/tela
  
  responseId       String
  response         SurveyResponse @relation(fields: [responseId], references: [id], onDelete: Cascade)
  
  questionId       String
  question         Question       @relation(fields: [questionId], references: [id], onDelete: Cascade)
  
  selectedOptionId String?
  selectedOption   QuestionOption? @relation(fields: [selectedOptionId], references: [id])
  
  createdAt        DateTime @default(now())
}

model BlockTracking {
  id             String   @id @default(uuid())
  enteredAt      DateTime
  leftAt         DateTime?
  timeSpentMs    Int?
  orderIndex     Int      // Para preservar a exata sequência que o usuário percorreu
  
  responseId     String
  response       SurveyResponse @relation(fields: [responseId], references: [id], onDelete: Cascade)
  
  blockId        String
  block          Block          @relation(fields: [blockId], references: [id], onDelete: Cascade)
}

model MediaInteraction {
  id             String   @id @default(uuid())
  interactionType MediaInteractionType
  timestamp      DateTime @default(now())
  timeOffsetMs   Int?     // Em que segundo do vídeo/áudio ocorreu o clique (opcional)
  
  responseId     String
  response       SurveyResponse @relation(fields: [responseId], references: [id], onDelete: Cascade)
  
  mediaId        String
  media          Media          @relation(fields: [mediaId], references: [id], onDelete: Cascade)
}

enum MediaInteractionType {
  PLAY
  PAUSE
  END
  CLICK
}
```

## 3. Justificativas das Decisões de Design (Arquitetura)

- **Separação Estrutural/Resposta:** Isolamos a arquitetura de *criação* de *respostas* usando `BlockTracking` e `MediaInteraction`. Isso impede que o schema do formulário seja poluído com dados de comportamento, facilitando a extração dos dados (RNF05).
- **Flexibilidade das Escalas Likert (`ScaleVisualType`):** O requisito de usar emojis, numerais e ícones foi resolvido incluindo um enumerador de tipo na pergunta. Assim o Frontend sabe como renderizar. Em seguida, a resposta sempre alimentará o `numericValue` do modelo `Answer` (RN03).
- **Independência Condicional:** O `ConditionalRule` faz ligação direta do valor respondido (`matchValue`) à ação (`targetBlockId`), garantindo um fluxo flexível de direcionamento (HU04).
- **Rastreamento Comportamental Completo:** O modelo `MediaInteraction` permite relatar exatamente o que o usuário fez em um áudio/vídeo, registrando cada PLAY, PAUSE e quando o arquivo atingiu seu END (RN06 e RF11).
