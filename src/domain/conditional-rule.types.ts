export type RuleOperator = "EQUALS" | "NOT_EQUALS" | "GREATER_THAN" | "LESS_THAN";

export interface ConditionalRule {
  id: string;
  questionId: string;
  operator: RuleOperator;
  matchValue: string;
  targetBlockId: string;
  targetBlock?: {
    id: string;
    title: string | null;
    orderIndex: number;
    surveyId: string;
  };
}

export interface CreateConditionalRuleDTO {
  operator: RuleOperator;
  matchValue: string;
  targetBlockId: string;
}

export interface UpdateConditionalRuleDTO {
  operator?: RuleOperator;
  matchValue?: string;
  targetBlockId?: string;
}
