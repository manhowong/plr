import type { SupportedLanguage } from '../i18n/translations';
import { WorkspaceFile, LengthPreference } from '../types';

/* ==========================================================================
   LLM Prompt & Generation Configuration
   Manages prompt assembly, length preferences, refine options,
   model configurations, and error messages.
   ========================================================================== */

export const DEFAULT_MODELS: Record<'gemini' | 'openai' | 'openrouter', string> = {
  gemini: 'gemini-2.5-flash',
  openai: 'gpt-4o-mini',
  openrouter: 'openai/gpt-4o-mini',
};

export const RECOMMENDED_MODELS: Record<'gemini' | 'openai' | 'openrouter', { id: string; label: string; note: string }[]> = {
  gemini: [
    { id: 'gemini-2.5-flash', label: 'gemini-2.5-flash', note: 'Fast, multimodal & versatile (Default)' },
    { id: 'gemini-2.5-pro', label: 'gemini-2.5-pro', note: 'Complex reasoning & nuanced drafting' },
    { id: 'gemini-1.5-flash', label: 'gemini-1.5-flash', note: 'High speed & lightweight' },
    { id: 'gemini-1.5-pro', label: 'gemini-1.5-pro', note: 'Deep context analysis' },
  ],
  openai: [
    { id: 'gpt-4o-mini', label: 'gpt-4o-mini', note: 'Fast & cost-efficient (Default)' },
    { id: 'gpt-4o', label: 'gpt-4o', note: 'Flagship omni model for high-stakes drafts' },
    { id: 'o3-mini', label: 'o3-mini', note: 'High efficiency reasoning model' },
    { id: 'gpt-4-turbo', label: 'gpt-4-turbo', note: 'High capability model' },
  ],
  openrouter: [
    { id: 'openai/gpt-4o-mini', label: 'openai/gpt-4o-mini', note: 'OpenAI GPT-4o mini via OpenRouter (Default)' },
    { id: 'anthropic/claude-3.5-sonnet', label: 'anthropic/claude-3.5-sonnet', note: 'Top tier writing & nuance' },
    { id: 'deepseek/deepseek-chat', label: 'deepseek/deepseek-chat', note: 'DeepSeek V3 general chat' },
    { id: 'meta-llama/llama-3.3-70b-instruct', label: 'meta-llama/llama-3.3-70b-instruct', note: 'Meta open weights' },
    { id: 'google/gemini-2.5-flash', label: 'google/gemini-2.5-flash', note: 'Google Gemini via OpenRouter' },
  ],
};

export const DEFAULT_TEMPERATURE = 0.7;
export const DEFAULT_MAX_OUTPUT_TOKENS = 2048;

/**
 * Language constraints enforcing strict output language
 */
export const LANGUAGE_DIRECTIVES: Record<SupportedLanguage, string> = {
  en: 'LANGUAGE CONSTRAINT: You must write in natural, professional English.\n\n',
  'zh-TW': 'LANGUAGE CONSTRAINT: You must write strictly in Traditional Chinese (繁體中文, using standard Taiwanese/Hong Kong business idioms and vocabulary, strictly no Simplified Chinese characters).\n\n',
  'zh-CN': 'LANGUAGE CONSTRAINT: You must write strictly in Simplified Chinese (规范简体中文商务书写规范与用语).\n\n',
};

/**
 * Refine instruction prompts across supported languages:
 * Shorter, Expand, Summarize
 */
export const REFINE_PROMPTS: Record<
  SupportedLanguage,
  { shorter: string; expand: string; summarize: string }
> = {
  en: {
    shorter: 'Make the response shorter, tighter, and more concise.',
    expand: 'Expand on the response with more details, explanation, and depth.',
    summarize: 'Summarize the response into key bullet points and clear conclusions.',
  },
  'zh-TW': {
    shorter: '將內容修飾得更精煉短小，直截了當。',
    expand: '擴充內容細節與深度，提供更詳盡的說明。',
    summarize: '將內容濃縮摘要為核心重點與行動結論。',
  },
  'zh-CN': {
    shorter: '将内容修饰得更精练短小，开门见山。',
    expand: '扩展内容细节与深度，提供更详尽的说明。',
    summarize: '将内容浓缩摘要为核心要点与明确结论。',
  },
};

/**
 * Length constraints by option
 */
export const LENGTH_INSTRUCTIONS: Record<
  SupportedLanguage,
  Record<LengthPreference, string>
> = {
  en: {
    concise: 'LENGTH PREFERENCE: Keep the output concise, succinct, and to the point.\n\n',
    none: '',
    detailed: 'LENGTH PREFERENCE: Provide an elaborate, comprehensive, and detailed output.\n\n',
  },
  'zh-TW': {
    concise: '篇幅要求：請保持精簡扼要、言簡意賅。\n\n',
    none: '',
    detailed: '篇幅要求：請提供詳盡完整、深入細緻的內容。\n\n',
  },
  'zh-CN': {
    concise: '篇幅要求：请保持精简扼要、直奔主题。\n\n',
    none: '',
    detailed: '篇幅要求：请提供详尽完整、深入细致的内容。\n\n',
  },
};

export interface PromptBuilderParams {
  requestDescription: string;
  contextFiles?: WorkspaceFile[];
  lengthPreference?: LengthPreference;
  targetLanguage?: SupportedLanguage;
  refineInstruction?: string;
  previousContent?: string;
}

/**
 * Assembles the full user prompt for the LLM based on:
 * - Selected Context files content
 * - Request description
 * - Length preference
 * - Refinement instruction (if any)
 * - Language constraints
 */
export function buildDraftPrompt({
  requestDescription,
  contextFiles = [],
  lengthPreference = 'none',
  targetLanguage = 'en',
  refineInstruction,
  previousContent,
}: PromptBuilderParams): string {
  let prompt = '';

  // 1. Language constraint
  if (targetLanguage && targetLanguage !== 'en') {
    prompt += LANGUAGE_DIRECTIVES[targetLanguage] || '';
  }

  // 2. Length preference
  const lengthText = LENGTH_INSTRUCTIONS[targetLanguage]?.[lengthPreference] || '';
  if (lengthText) {
    prompt += lengthText;
  }

  // 3. Context files (added to the final prompt)
  if (contextFiles && contextFiles.length > 0) {
    prompt += '--- CONTEXT FILES ---\n';
    for (const file of contextFiles) {
      prompt += `\n### File: ${file.name}\n${file.content.trim()}\n`;
    }
    prompt += '\n--- END CONTEXT FILES ---\n\n';
  }

  // 4. If this is a refinement of previous content
  if (previousContent && refineInstruction) {
    prompt += '--- PREVIOUS GENERATED CONTENT ---\n';
    prompt += `${previousContent.trim()}\n`;
    prompt += '--- END PREVIOUS CONTENT ---\n\n';
    prompt += `REFINEMENT TASK:\n${refineInstruction}\n\n`;
    if (requestDescription.trim()) {
      prompt += `ADDITIONAL INSTRUCTIONS / REQUEST:\n${requestDescription.trim()}\n\n`;
    }
    return prompt;
  }

  // 5. Main user request description
  prompt += '--- USER REQUEST ---\n';
  prompt += `${requestDescription.trim()}\n`;
  prompt += '--- END USER REQUEST ---\n';

  return prompt;
}

/**
 * Multilingual Token Estimator
 * Heuristic: ~4 characters per token for Latin alphabets, ~0.7-1 token per CJK character.
 */
export function estimateTokens(text: string): number {
  if (!text || !text.trim()) return 0;
  let cjkCount = 0;
  let nonCjkLength = 0;

  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (
      (code >= 0x4e00 && code <= 0x9fff) ||
      (code >= 0x3400 && code <= 0x4dbf) ||
      (code >= 0x3000 && code <= 0x303f)
    ) {
      cjkCount++;
    } else {
      nonCjkLength++;
    }
  }

  return Math.ceil(cjkCount * 0.75 + nonCjkLength / 4);
}

/**
 * User-friendly error message resolution
 */
export const LLM_ERROR_MESSAGES = {
  offline: 'Draft generation requires an active internet connection.',
  missingKey: 'Missing API Key. Please configure your API Key in Settings.',
  geminiKeyInvalid: 'Invalid Gemini API Key. Please verify your key in Settings.',
  openaiKeyInvalid: 'Invalid OpenAI API Key. Please verify your key in Settings.',
  openrouterKeyInvalid: 'Invalid OpenRouter API Key. Please verify your key in Settings.',
  quotaExceeded: 'API quota exceeded or rate limit reached. Please check your provider account.',
  emptyOutput: 'No draft was generated by the model. Please check your inputs and try again.',
};
