import { WorkspaceFile } from '../types';

/* ==========================================================================
   Default Workspace Data
   No default project instructions, context files, or prompts are injected.
   ========================================================================== */

export const DEFAULT_INSTRUCTIONS = '';

export const STARTER_CONTEXT: Record<string, string> = {};

export const STARTER_PROMPTS: Record<string, string> = {};

export const STARTER_ENV = `# Configuration
# Provide your Google Gemini, OpenAI, or OpenRouter API Key below:
GEMINI_API_KEY=
# OPENAI_API_KEY=
# OPENROUTER_API_KEY=

# Optional: Specify exact model path/name for your provider:
# GEMINI_MODEL="gemini-2.5-flash"
# OPENAI_MODEL="gpt-4o-mini"
# OPENROUTER_MODEL="openai/gpt-4o-mini"
`;

/**
 * Returns default in-memory context files (empty)
 */
export function getDefaultContext(): WorkspaceFile[] {
  return [];
}

/**
 * Returns default in-memory prompts (empty)
 */
export function getDefaultPrompts(): WorkspaceFile[] {
  return [];
}
