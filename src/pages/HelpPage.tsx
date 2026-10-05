import React from 'react';
import { SupportedLanguage, TRANSLATIONS } from '../i18n/translations';
import { useClipboard } from '../hooks/useClipboard';
import { CodeBlockWithCopy } from '../components/CodeBlockWithCopy';

interface HelpPageProps {
  language: SupportedLanguage;
}

export const HelpPage: React.FC<HelpPageProps> = ({ language }) => {
  const t = TRANSLATIONS[language].help;
  const { copy, isCopied } = useClipboard(2000);

  const folderStructure = `plr-settings/
├── settings.json         <- Active profile & active project state
├── profiles/
│   ├── work/
│   │   └── .env          <- GEMINI_API_KEY=... / OPENAI_API_KEY=...
│   └── personal/
│       └── .env
└── projects/
    └── sales/
        ├── instructions.md   <- Optional project system prompt
        ├── context/          <- Context files (*.md) appended to prompt
        │   └── product-specs.md
        └── prompts/          <- Reusable saved prompts (*.md)
            └── feature-reply.md`;

  const contextSample = `# CloudSync Product Specifications
- Version: 2.4.0 (Enterprise)
- Supported Platforms: Web, macOS, Windows, Linux
- Data Encryption: AES-256 at rest, TLS 1.3 in transit
- Storage Limits: 2TB per seat with unlimited version history
- SLA: 99.95% uptime with 24/7 priority support`;

  const promptSample = `# Feature Reply Prompt
Draft a clear, friendly, and structured reply to the customer's inquiry:
1. Acknowledge and appreciate their question.
2. Direct them to the relevant product specifications.
3. Offer to set up a brief 15-minute walkthrough if needed.
4. Conclude with a warm, professional closing.`;

  const envSample = `# Profile .env Configuration
GEMINI_API_KEY="AIzaSy..."
# Optional: GEMINI_MODEL="gemini-2.5-flash"

# Or OpenAI:
# OPENAI_API_KEY="sk-..."
# OPENAI_MODEL="gpt-4o-mini"

# Or OpenRouter:
# OPENROUTER_API_KEY="sk-or-..."
# OPENROUTER_MODEL="openai/gpt-4o-mini"`;

  return (
    <div className="page-container-medium space-y-6">
      <div>
        <h1 className="page-title">{t.title}</h1>
      </div>

      {/* Keyboard Shortcuts Section */}
      <section className="section-card !space-y-4">
        <h2 className="section-title">{t.shortcuts}</h2>
        <div className="divide-y divide-neutral-100 text-sm">
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-neutral-700">{t.generateShortcut}</span>
            <span>
              <kbd>Ctrl + Enter</kbd> / <kbd>⌘ + Enter</kbd>
            </span>
          </div>
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-neutral-700">{t.copyShortcut}</span>
            <span>
              <kbd>Ctrl + S</kbd> / <kbd>⌘ + S</kbd>
            </span>
          </div>
        </div>
      </section>

      {/* Context & Prompts Guide with Minimal Examples */}
      <section className="section-card !space-y-4">
        <h2 className="section-title">{t.contextAndPromptsGuide}</h2>
        
        {/* Context files guide */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-neutral-800">
            {t.contextExampleTitle}
          </h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            {t.contextGuideDesc}
          </p>
          <CodeBlockWithCopy
            code={contextSample}
            isCopied={isCopied('contextSample')}
            onCopy={() => copy(contextSample, 'contextSample')}
            copyLabel={t.copy}
            copiedLabel={t.copied}
          />
        </div>

        {/* Saved Prompts guide */}
        <div className="space-y-2 pt-2 border-t border-neutral-100">
          <h3 className="text-sm font-semibold text-neutral-800">
            {t.promptExampleTitle}
          </h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            {t.promptsGuideDesc}
          </p>
          <CodeBlockWithCopy
            code={promptSample}
            isCopied={isCopied('promptSample')}
            onCopy={() => copy(promptSample, 'promptSample')}
            copyLabel={t.copy}
            copiedLabel={t.copied}
          />
        </div>
      </section>

      {/* Local Folder Structure */}
      <section className="section-card !space-y-3">
        <h2 className="section-title">{t.folderStructure}</h2>
        <p className="text-sm text-neutral-600 leading-relaxed">
          {t.folderDesc}
        </p>

        <CodeBlockWithCopy
          code={folderStructure}
          isCopied={isCopied('structure')}
          onCopy={() => copy(folderStructure, 'structure')}
          copyLabel={t.copy}
          copiedLabel={t.copied}
        />
      </section>

      {/* Environment File */}
      <section className="section-card !space-y-3">
        <h2 className="section-title">{t.envFile}</h2>
        <p className="text-sm text-neutral-600 leading-relaxed">
          {t.envDesc}
        </p>

        <CodeBlockWithCopy
          code={envSample}
          isCopied={isCopied('env')}
          onCopy={() => copy(envSample, 'env')}
          copyLabel={t.copy}
          copiedLabel={t.copied}
        />
      </section>
    </div>
  );
};
