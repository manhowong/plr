import React from 'react';
import { WorkspaceState } from '../types';
import { SupportedLanguage, TRANSLATIONS } from '../i18n/translations';

export interface AboutLinks {
  sourceCode: string;
  license: string;  
  developer: string;
  feedback: string;
}

// Configurable link targets - replace with actual URLs
export const ABOUT_LINKS: AboutLinks = {
  sourceCode: 'https://github.com/manhowong/plr',
  license: 'https://github.com/manhowong/plr/blob/main/LICENSE',
  developer: 'https://github.com/manhowong',
  feedback: 'https://github.com/manhowong/plr/issues/new',
};

interface AboutPageProps {
  workspace?: WorkspaceState;
  language: SupportedLanguage;
  links?: Partial<AboutLinks>;
}

export const AboutPage: React.FC<AboutPageProps> = ({ language, links }) => {
  const t = TRANSLATIONS[language].about;
  const activeLinks = { ...ABOUT_LINKS, ...links };

  return (
    <div className="page-container-medium space-y-6">
      <div>
        <h1 className="page-title">{t.title}</h1>
      </div>

      <section className="section-card !space-y-3">
        <h2 className="section-title !mb-0">{TRANSLATIONS[language].appTitle}</h2>
        <p className="text-sm text-neutral-600 leading-relaxed pt-1">
          {t.description}
        </p>
      </section>

      <section className="section-card !space-y-3">
        <div className="divide-y divide-neutral-100 text-sm">
          {/* Version */}
          <div className="py-2.5 flex items-center justify-between gap-4">
            <span className="text-neutral-600">{t.version}:</span>
            <span className="font-medium text-neutral-900 font-mono">1.0.0</span>
          </div>

          {/* Developer */}
          <div className="py-2.5 flex items-center justify-between gap-4">
            <span className="text-neutral-600">{t.developer}:</span>
            <a
              href={activeLinks.developer || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
            >
              @manhowong
            </a>
          </div>

          {/* License */}
          <div className="py-2.5 flex items-center justify-between gap-4">
            <span className="text-neutral-600">{t.license}:</span>
            <a
              href={activeLinks.license || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
            >
              Apache License 2.0
            </a>
          </div>

          {/* Source Code */}
          <div className="py-2.5 flex items-center justify-between gap-4">
            <span className="text-neutral-600">{t.sourceCode}:</span>
            <a
              href={activeLinks.sourceCode || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
            >
              github.com/manhowong/plr
            </a>
          </div>

          {/* Suggest a feature / Report an issue */}
          <div className="py-2.5 flex items-center justify-between gap-4">
            <span className="text-neutral-600">{t.feedback}:</span>
            <a
              href={activeLinks.feedback || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
            >
              Suggest a feature / Report an issue
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

