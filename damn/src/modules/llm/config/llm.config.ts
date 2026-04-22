export interface LLMConfig {
  apiKey: string;
  baseURL: string;
  model: string;
  maxContextMessages: number;
  temperature: number;
  maxTokens: number;
}

export const getDefaultLLMConfig = (): LLMConfig => ({
  apiKey: process.env.LLM_API_KEY || '',
  baseURL: process.env.LLM_BASE_URL || 'https://api.openai.com/v1',
  model: process.env.LLM_MODEL || 'gpt-3.5-turbo',
  maxContextMessages: parseInt(process.env.LLM_MAX_CONTEXT_MESSAGES || '20'),
  temperature: parseFloat(process.env.LLM_TEMPERATURE || '0.7'),
  maxTokens: parseInt(process.env.LLM_MAX_TOKENS || '2000'),
});
