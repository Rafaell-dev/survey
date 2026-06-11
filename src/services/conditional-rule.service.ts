import { api } from './api';
import { ConditionalRule, CreateConditionalRuleDTO, UpdateConditionalRuleDTO } from '../domain/conditional-rule.types';

export const conditionalRuleService = {
  async getRulesByQuestion(questionId: string): Promise<ConditionalRule[]> {
    const response = await api.get(`/questions/${questionId}/rules`);
    return response.data;
  },

  async createRule(questionId: string, dto: CreateConditionalRuleDTO): Promise<ConditionalRule> {
    const response = await api.post(`/questions/${questionId}/rules`, dto);
    return response.data;
  },

  async updateRule(ruleId: string, dto: UpdateConditionalRuleDTO): Promise<ConditionalRule> {
    const response = await api.patch(`/rules/${ruleId}`, dto);
    return response.data;
  },

  async deleteRule(ruleId: string): Promise<void> {
    await api.delete(`/rules/${ruleId}`);
  }
};
