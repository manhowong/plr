import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { WorkspaceState, WorkspaceFile, LengthPreference } from '../types';
import { generateContent } from '../services/llm';
import {
  REFINE_PROMPTS,
  buildDraftPrompt,
  estimateTokens,
  DEFAULT_TEMPERATURE,
} from '../services/promptConfig';
import { SupportedLanguage, TRANSLATIONS } from '../i18n/translations';
import {
  Copy,
  Check,
  Wand,
  Plus,
  MessageCircleMore,
  Folder,
  Gauge,
  ListChevronsUpDown,
  Eye,
  PenLine,
} from 'lucide-react';
import { Banner } from '../components/Banner';
import { MarkdownPreview } from '../components/MarkdownPreview';
import { PopoverMenu } from '../components/PopoverMenu';
import { useClipboard } from '../hooks/useClipboard';
import { useTimedFlag } from '../hooks/useTimedFlag';
import { useFormDirtyGuard } from '../hooks/useFormDirtyGuard';

type ActiveToolbarMenu = 'prompt' | 'context' | 'temperature' | 'length' | null;

type GeneratedViewMode = 'preview' | 'editor';

interface WorkspacePageProps {
  workspace: WorkspaceState;
  isOnline: boolean;
  language: SupportedLanguage;
  onNavigateToSettings: () => void;
  onNavigateToContextPrompts: (subfolder?: 'context' | 'prompts') => void;
  onRegisterDirtyCheck: (page: 'workspace', checker: (() => boolean) | null) => void;
}

export const WorkspacePage: React.FC<WorkspacePageProps> = ({
  workspace,
  isOnline,
  language,
  onNavigateToSettings,
  onNavigateToContextPrompts,
  onRegisterDirtyCheck,
}) => {
  const t = TRANSLATIONS[language].workspace;
  const refinePrompts = REFINE_PROMPTS[language] || REFINE_PROMPTS.en;

  // Main input state: Request Description
  const [requestDescription, setRequestDescription] = useState<string>('');
  const [promptAttachedSuccess, triggerPromptAttachedSuccess] = useTimedFlag(1500);

  // Context files selection (select all by default)
  const [selectedContextFileNames, setSelectedContextFileNames] = useState<Set<string>>(() => {
    return new Set(workspace.context.map((f) => f.name));
  });

  // Temperature - default set to user's profile settings (or 0.7)
  const [temperature, setTemperature] = useState<number>(() => workspace.temperature ?? DEFAULT_TEMPERATURE);

  // Length index: 0 = concise, 1 = default ("no preference"), 2 = detailed
  const [lengthIndex, setLengthIndex] = useState<number>(1);

  // Popover menu state
  const [activeMenu, setActiveMenu] = useState<ActiveToolbarMenu>(null);

  // Button refs for anchoring and outside-click detection
  const promptButtonRef = useRef<HTMLButtonElement>(null);
  const contextButtonRef = useRef<HTMLButtonElement>(null);
  const tempButtonRef = useRef<HTMLButtonElement>(null);
  const lengthButtonRef = useRef<HTMLButtonElement>(null);

  // Generated content state
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [generatedViewMode, setGeneratedViewMode] = useState<GeneratedViewMode>('preview');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { copy: copyToClipboard, isCopied } = useClipboard(2000);
  const [confirmClear, triggerConfirmClear, resetConfirmClear] = useTimedFlag(3000);

  const draftSectionRef = useRef<HTMLElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync temperature whenever active profile's temperature changes
  useEffect(() => {
    if (workspace.temperature !== undefined) {
      setTemperature(workspace.temperature);
    }
  }, [workspace.temperature]);

  // Whenever workspace.context changes, ensure newly added files are included by default
  const prevContextNamesRef = useRef<string[]>([]);
  useEffect(() => {
    const currentNames = workspace.context.map((f) => f.name);
    setSelectedContextFileNames((prev) => {
      const next = new Set<string>();
      // Preserve existing selections that still exist
      for (const name of prev) {
        if (currentNames.includes(name)) {
          next.add(name);
        }
      }
      // Add any brand-new context files by default
      for (const name of currentNames) {
        if (!prevContextNamesRef.current.includes(name)) {
          next.add(name);
        }
      }
      return next;
    });
    prevContextNamesRef.current = currentNames;
  }, [workspace.context]);

  // Dirty check: true if user filled in request or has generated content
  useFormDirtyGuard(
    'workspace',
    () => Boolean(requestDescription.trim() || generatedContent.trim()),
    onRegisterDirtyCheck,
    [requestDescription, generatedContent]
  );

  const hasKey = Boolean(workspace.apiKey && workspace.apiKey.trim().length > 0);

  // Derive LengthPreference from lengthIndex
  const lengthPreference: LengthPreference = useMemo(() => {
    if (lengthIndex === 0) return 'concise';
    if (lengthIndex === 2) return 'detailed';
    return 'none';
  }, [lengthIndex]);

  // Derive active context files
  const activeContextFiles = useMemo(() => {
    return workspace.context.filter((f) => selectedContextFileNames.has(f.name));
  }, [workspace.context, selectedContextFileNames]);

  // Estimate total tokens for prompt
  const estimatedTokenCount = useMemo(() => {
    const assembledUserPrompt = buildDraftPrompt({
      requestDescription,
      contextFiles: activeContextFiles,
      lengthPreference,
      targetLanguage: language,
    });
    const fullText = `${workspace.sessionInstructions || ''}\n\n${assembledUserPrompt}`;
    return estimateTokens(fullText);
  }, [requestDescription, activeContextFiles, lengthPreference, language, workspace.sessionInstructions]);

  // Append a saved prompt into request description
  const handleAppendPrompt = (promptItem: WorkspaceFile) => {
    if (!promptItem.content.trim()) return;

    setRequestDescription((prev) => {
      const trimmed = prev.trim();
      return trimmed ? `${trimmed}\n\n${promptItem.content.trim()}` : promptItem.content.trim();
    });
    triggerPromptAttachedSuccess();
    setActiveMenu(null);

    // Focus textarea
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
        textareaRef.current.focus();
      }
    }, 50);
  };

  // Toggle single context file selection
  const handleToggleContextFile = (fileName: string) => {
    setSelectedContextFileNames((prev) => {
      const next = new Set(prev);
      if (next.has(fileName)) {
        next.delete(fileName);
      } else {
        next.add(fileName);
      }
      return next;
    });
  };

  const handleSelectAllContext = () => {
    setSelectedContextFileNames(new Set(workspace.context.map((f) => f.name)));
  };

  const handleDeselectAllContext = () => {
    setSelectedContextFileNames(new Set());
  };

  // Copy Final Prompt
  const handleCopyFinalPrompt = async () => {
    const userPrompt = buildDraftPrompt({
      requestDescription,
      contextFiles: activeContextFiles,
      lengthPreference,
      targetLanguage: language,
    });

    const fullPrompt = workspace.sessionInstructions?.trim()
      ? `### System Instructions:\n${workspace.sessionInstructions.trim()}\n\n---\n\n${userPrompt}`
      : userPrompt;

    await copyToClipboard(fullPrompt, 'prompt');
  };

  // Copy Generated Content
  const handleCopyGenerated = useCallback(async () => {
    if (!generatedContent) return;
    const ok = await copyToClipboard(generatedContent, 'reply');
    if (!ok) {
      setErrorMessage('Failed to copy to clipboard.');
    }
  }, [generatedContent, copyToClipboard]);

  // Main generation handler
  const handleGenerate = useCallback(
    async (refineInstruction?: string) => {
      setErrorMessage(null);

      if (!isOnline) {
        setErrorMessage(t.offlineWarning);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      if (!requestDescription.trim() && !refineInstruction && activeContextFiles.length === 0) {
        return;
      }

      if (!workspace.apiKey || !workspace.apiKey.trim()) {
        setErrorMessage(t.noKeyWarning);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // Scroll to generated content section
      draftSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

      setIsGenerating(true);
      try {
        const result = await generateContent({
          apiKey: workspace.apiKey,
          provider: workspace.apiKeyProvider,
          modelName: workspace.modelName,
          systemInstructions: workspace.sessionInstructions,
          requestDescription,
          contextFiles: activeContextFiles,
          lengthPreference,
          temperature,
          targetLanguage: language,
          refineInstruction,
          previousContent: refineInstruction ? generatedContent : undefined,
        });

        setGeneratedContent(result);
      } catch (err: unknown) {
        setErrorMessage(err instanceof Error ? err.message : String(err));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } finally {
        setIsGenerating(false);
      }
    },
    [
      isOnline,
      requestDescription,
      activeContextFiles,
      workspace,
      lengthPreference,
      temperature,
      language,
      generatedContent,
      t,
    ]
  );

  // Keyboard Shortcuts: Ctrl+Enter (generate), Ctrl+S (copy)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleGenerate();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleCopyGenerated();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleGenerate, handleCopyGenerated]);

  // Clear workspace
  const handleClearWorkspace = () => {
    if (!requestDescription && !generatedContent) return;
    if (!confirmClear) {
      triggerConfirmClear();
      return;
    }
    setRequestDescription('');
    setGeneratedContent('');
    setErrorMessage(null);
    resetConfirmClear();
  };

  const canGenerate = (Boolean(requestDescription.trim()) || activeContextFiles.length > 0) && hasKey;
  const canClear = Boolean(requestDescription || generatedContent);
  const canCopyPrompt = Boolean(requestDescription.trim() || activeContextFiles.length > 0);

  const selectedLengthKey = lengthIndex === 0 ? t.lengthConcise : lengthIndex === 2 ? t.lengthDetailed : t.lengthNone;

  return (
    <div className="page-container-wide space-y-4">
      {/* Page Title & Clear Button */}
      <div className="flex items-center justify-between">
        <h1 className="page-title">{TRANSLATIONS[language].nav.workspace}</h1>

        <button
          type="button"
          onClick={handleClearWorkspace}
          disabled={!canClear || !hasKey}
          className={confirmClear ? 'btn-danger-outline' : 'btn-outline'}
        >
          {confirmClear ? t.clearConfirm : t.clear}
        </button>
      </div>

      {/* Warning Box 1: Runtime Error */}
      {errorMessage && (
        <Banner variant="error" onDismiss={() => setErrorMessage(null)}>
          {errorMessage}
        </Banner>
      )}

      {/* Warning Box 2: Missing API key warning */}
      {!hasKey && !errorMessage && (
        <Banner
          variant="warning"
          action={{ label: t.goToSettings, onClick: onNavigateToSettings }}
        >
          {t.noKeyWarning}
        </Banner>
      )}

      {/* FORM WRAPPER: Greyed out when no API key is provided */}
      <div className={`space-y-4 transition-opacity duration-200 ${!hasKey ? 'opacity-50 pointer-events-none select-none' : ''}`}>
        {/* TOP SECTION: "Your Request" - Single Column with toolbar buttons at bottom */}
        <section className="section-card space-y-4">
          <div className="section-header pb-1">
            <h2 className="section-title !mb-0">{t.yourRequest}</h2>
          </div>

          {/* Description input container with integrated bottom button row */}
          <div className="rounded-lg border-2 border-neutral-300 focus-within:border-2 focus-within:border-neutral-900 bg-white transition-colors flex flex-col">
            <textarea
              ref={textareaRef}
              value={requestDescription}
              autoFocus
              onChange={(e) => setRequestDescription(e.target.value)}
              disabled={!hasKey}
              placeholder={t.requestPlaceholder}
              className="w-full bg-transparent p-3.5 sm:p-4 text-sm leading-relaxed text-neutral-900 outline-none resize-none min-h-[220px]"
            />

            {/* Row of 4 buttons placed at the bottom inside description input field */}
            <div className="p-2 sm:px-3 sm:py-2 rounded-b-lg flex items-center gap-2 flex-wrap">
              {/* Button 1: Select context (Folder icon + "Context: n file(s)") */}
              <div className="relative inline-block">
                <button
                  ref={contextButtonRef}
                  type="button"
                  disabled={!hasKey}
                  onClick={() => setActiveMenu((prev) => (prev === 'context' ? null : 'context'))}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-sm font-medium border transition-colors cursor-pointer ${
                    activeMenu === 'context'
                      ? 'bg-neutral-200 border-neutral-200 text-neutral-950'
                      : 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-200 hover:text-neutral-950'
                  }`}
                >
                  <Folder className="w-3.5 h-3.5 shrink-0" />
                  <span>{t.contextBtnLabel.replace('{n}', String(selectedContextFileNames.size))}</span>
                </button>

                <PopoverMenu
                  isOpen={activeMenu === 'context'}
                  onClose={() => setActiveMenu(null)}
                  triggerRef={contextButtonRef}
                  width="w-max max-w-60"
                >
                  <div className="p-1 space-y-1">

                    {workspace.context.length === 0 ? (
                      <p className="text-sm text-neutral-400 px-2 py-3">
                        {t.noContextFiles}
                      </p>
                    ) : (
                    <div>
                      <div className="flex items-center justify-between px-2 py-1">
                        <div className="flex items-center gap-1.5 text-sm">
                          <button
                            type="button"
                            onClick={handleSelectAllContext}
                            className="text-neutral-600 hover:text-neutral-900 cursor-pointer"
                          >
                            {t.selectAll}
                          </button>
                          <span className="text-neutral-300">|</span>
                          <button
                            type="button"
                            onClick={handleDeselectAllContext}
                            className="text-neutral-600 hover:text-neutral-900 cursor-pointer"
                          >
                            {t.deselectAll}
                          </button>
                        </div>
                      </div>
                      
                      <div className="max-h-48 overflow-y-auto space-y-0.5">
                        {workspace.context.map((file) => {
                          const isChecked = selectedContextFileNames.has(file.name);
                          return (
                            <label
                              key={file.name}
                              className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-neutral-50 cursor-pointer text-sm transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleContextFile(file.name)}
                                className="accent-neutral-900 w-3.5 h-3.5 rounded cursor-pointer"
                              />
                              <span className="font-mono truncate flex-1 text-neutral-900">{file.name}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                    )}

                    <div className="my-1" />

                    <button
                      type="button"
                      onClick={() => {
                        setActiveMenu(null);
                        onNavigateToContextPrompts('context');
                      }}
                      className="w-full text-left px-2 py-1.5 rounded text-sm text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3 h-3 shrink-0" />
                      <span>{t.addContextFilesOption}</span>
                    </button>
                  </div>
                </PopoverMenu>
              </div>

              {/* Button 2: Append a saved prompt (Plus icon + "Saved prompt") */}
              <div className="relative inline-block">
                <button
                  ref={promptButtonRef}
                  type="button"
                  disabled={!hasKey}
                  onClick={() => setActiveMenu((prev) => (prev === 'prompt' ? null : 'prompt'))}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-sm font-medium border transition-colors cursor-pointer ${
                    activeMenu === 'prompt'
                      ? 'bg-neutral-200 border-neutral-200 text-neutral-950'
                      : 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-200 hover:text-neutral-950'
                  }`}
                >
                  <MessageCircleMore className="w-3.5 h-3.5 shrink-0" />
                  <span>{promptAttachedSuccess ? t.promptAttached : (t.savedPromptBtn || 'Saved prompt')}</span>
                </button>

                <PopoverMenu
                  isOpen={activeMenu === 'prompt'}
                  onClose={() => setActiveMenu(null)}
                  triggerRef={promptButtonRef}
                  width="w-max max-w-60"
                >
                  <div className="p-1 space-y-1">
                    {workspace.prompts.length === 0 ? (
                      <p className="text-sm text-neutral-400 px-2 py-3">
                        {t.noSavedPrompts}
                      </p>
                    ) : (
                      <div className="max-h-48 overflow-y-auto space-y-0.5">
                        {workspace.prompts.map((p) => (
                          <button
                            key={p.name}
                            type="button"
                            onClick={() => handleAppendPrompt(p)}
                            className="w-full text-left px-2 py-1.5 rounded hover:bg-neutral-100 text-sm text-neutral-900 transition-colors flex items-center justify-between cursor-pointer"
                          >
                            <span className="truncate">{p.name.replace(/\.md$/, '')}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="my-1" />

                    <button
                      type="button"
                      onClick={() => {
                        setActiveMenu(null);
                        onNavigateToContextPrompts('prompts');
                      }}
                      className="w-full text-left px-2 py-1.5 rounded text-sm text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3 h-3 shrink-0" />
                      <span>{t.createReusablePrompt}</span>
                    </button>
                  </div>
                </PopoverMenu>
              </div>

              {/* Button 3: Temperature (Gauge icon + "Temp: <selected temperature>") */}
              <div className="relative inline-block">
                <button
                  ref={tempButtonRef}
                  type="button"
                  disabled={!hasKey}
                  onClick={() => setActiveMenu((prev) => (prev === 'temperature' ? null : 'temperature'))}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-sm font-medium border transition-colors cursor-pointer ${
                    activeMenu === 'temperature'
                      ? 'bg-neutral-200 border-neutral-200 text-neutral-950'
                      : 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-200 hover:text-neutral-950'
                  }`}
                >
                  <Gauge className="w-3.5 h-3.5 shrink-0" />
                  <span>{t.tempBtnLabel.replace('{temp}', temperature.toFixed(1))}</span>
                </button>

                <PopoverMenu
                  isOpen={activeMenu === 'temperature'}
                  onClose={() => setActiveMenu(null)}
                  triggerRef={tempButtonRef}
                  width="w-52"
                >
                  <div className="p-1 space-y-0.5">
                    {[
                      { value: 0.0, label: t.temperaturePrecise },
                      { value: 0.2, label: t.temperatureFocused },
                      { value: 0.5, label: t.temperatureConservative },
                      { value: 0.7, label: t.temperatureBalanced },
                      { value: 1.0, label: t.temperatureCreative },
                      { value: 1.2, label: t.temperatureExploratory },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setTemperature(opt.value);
                          setActiveMenu(null);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between text-sm transition-colors cursor-pointer ${
                          Math.abs(temperature - opt.value) < 0.01
                            ? 'bg-neutral-100 font-semibold text-neutral-950'
                            : 'hover:bg-neutral-50 text-neutral-700'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {Math.abs(temperature - opt.value) < 0.01 && (
                          <Check className="w-3.5 h-3.5 text-neutral-900 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </PopoverMenu>
              </div>

              {/* Button 4: Length (ListChevronsUpDown icon + "Length: <selected length>") */}
              <div className="relative inline-block">
                <button
                  ref={lengthButtonRef}
                  type="button"
                  disabled={!hasKey}
                  onClick={() => setActiveMenu((prev) => (prev === 'length' ? null : 'length'))}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm text-sm font-medium border transition-colors cursor-pointer ${
                    activeMenu === 'length'
                      ? 'bg-neutral-200 border-neutral-200 text-neutral-950'
                      : 'bg-white border-neutral-300 text-neutral-700 hover:bg-neutral-200 hover:text-neutral-950'
                  }`}
                >
                  <ListChevronsUpDown className="w-3.5 h-3.5 shrink-0" />
                  <span>{t.lengthBtnLabel.replace('{length}', selectedLengthKey)}</span>
                </button>

                <PopoverMenu
                  isOpen={activeMenu === 'length'}
                  onClose={() => setActiveMenu(null)}
                  triggerRef={lengthButtonRef}
                  width="w-52"
                >
                  <div className="p-1 space-y-0.5">
                    {[
                      { id: 0, label: `${t.lengthConcise}` },
                      { id: 1, label: `${t.lengthNone}` },
                      { id: 2, label: `${t.lengthDetailed}` },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setLengthIndex(opt.id);
                          setActiveMenu(null);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between text-sm transition-colors cursor-pointer ${
                          lengthIndex === opt.id
                            ? 'bg-neutral-100 font-semibold text-neutral-950'
                            : 'hover:bg-neutral-50 text-neutral-700'
                        }`}
                      >
                        <span>{opt.label}</span>
                        {lengthIndex === opt.id && (
                          <Check className="w-3.5 h-3.5 text-neutral-900 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </PopoverMenu>
              </div>
            </div>
          </div>

          {/* Bottom row of top section:
              - Left: Copy prompt button and right of it estimated tokens (plain text, no border)
              - Right: Generate button (same position) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3">
            {/* Left side: Copy prompt button & estimated tokens (plain text, no border) */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCopyFinalPrompt}
                disabled={!canCopyPrompt}
                className="btn-outline h-8 inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
                title={t.copyPromptTooltip}
              >
                {isCopied('prompt') ? (
                  <>
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    <span>{t.promptCopied}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 shrink-0" />
                    <span>{t.copyPromptBtn}</span>
                  </>
                )}
              </button>

              <span className="text-xs text-neutral-500">
                {t.estimatedTokens}: ~{estimatedTokenCount}
              </span>
            </div>

            {/* Right side: Generate button (same position) */}
            <button
              type="button"
              onClick={() => handleGenerate()}
              disabled={isGenerating || !canGenerate}
              className="btn-primary shrink-0 inline-flex items-center gap-1.5"
            >
              <Wand className="w-4 h-4 shrink-0" />
              <span>{isGenerating ? t.generatingBtn : t.generateBtn}</span>
            </button>
          </div>
        </section>

        {/* BOTTOM SECTION: "Generated Content" */}
        <section ref={draftSectionRef} className="section-card space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="section-title !mb-0">{t.generatedContent}</h2>

            {/* Preview / Editor toggle (top right corner) */}
            <div className="segmented-group segmented-group-sm max-w-max" role="tablist" aria-label={t.generatedContent}>
              <button
                type="button"
                role="tab"
                aria-selected={generatedViewMode === 'preview'}
                onClick={() => setGeneratedViewMode('preview')}
                className={generatedViewMode === 'preview' ? 'segmented-btn-active' : 'segmented-btn'}
              >
                <Eye className="w-3.5 h-3.5 mr-1 shrink-0" />
                <span>{t.previewMode}</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={generatedViewMode === 'editor'}
                onClick={() => setGeneratedViewMode('editor')}
                className={generatedViewMode === 'editor' ? 'segmented-btn-active' : 'segmented-btn'}
              >
                <PenLine className="w-3.5 h-3.5 mr-1 shrink-0" />
                <span>{t.editorMode}</span>
              </button>
            </div>
          </div>

          {generatedViewMode === 'editor' ? (
            <div className="relative rounded-lg bg-white border-2 border-dashed border-neutral-300 focus-within:border-solid focus-within:border-neutral-900 transition-colors">
              <textarea
                value={generatedContent}
                onChange={(e) => setGeneratedContent(e.target.value)}
                disabled={!hasKey}
                rows={12}
                className="w-full bg-transparent p-4 sm:p-5 text-sm sm:text-base leading-relaxed text-neutral-900 outline-none resize-vertical rounded-lg"
              />
              {!generatedContent && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-4 text-center">
                  <p className="text-sm font-medium text-neutral-400">
                    {t.draftPlaceholder}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-lg bg-white border-2 border-dashed border-neutral-300 p-4 sm:p-5 min-h-[288px] max-h-[560px] overflow-y-auto">
              <MarkdownPreview content={generatedContent} placeholder={t.draftPlaceholder} />
            </div>
          )}

          {/* Row with Refine Buttons (Shorter, Expand, Summarize) and Copy Button */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                {t.refine}
              </span>
              <button
                type="button"
                disabled={!generatedContent || isGenerating || !hasKey}
                onClick={() => handleGenerate(refinePrompts.shorter)}
                className="btn-outline text-xs cursor-pointer"
              >
                {t.shorter}
              </button>
              <button
                type="button"
                disabled={!generatedContent || isGenerating || !hasKey}
                onClick={() => handleGenerate(refinePrompts.expand)}
                className="btn-outline text-xs cursor-pointer"
              >
                {t.expand}
              </button>
              <button
                type="button"
                disabled={!generatedContent || isGenerating || !hasKey}
                onClick={() => handleGenerate(refinePrompts.summarize)}
                className="btn-outline text-xs cursor-pointer"
              >
                {t.summarize}
              </button>
            </div>

            <button
              type="button"
              onClick={handleCopyGenerated}
              disabled={!generatedContent || !hasKey}
              className="btn-primary inline-flex items-center gap-1.5 cursor-pointer"
            >
              {isCopied('reply') ? (
                <>
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{t.copied}</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 shrink-0" />
                  <span>{t.copy}</span>
                </>
              )}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
