import React, { useState, useEffect } from 'react';
import { WorkspaceState, ProfileConfig, ProjectConfig } from '../types';
import { SupportedLanguage, TRANSLATIONS, DEFAULT_INSTRUCTIONS_BY_LANG } from '../i18n/translations';
import { Modal } from '../components/Modal';
import { Banner } from '../components/Banner';
import { SearchInput } from '../components/SearchInput';
import { useTimedFlag } from '../hooks/useTimedFlag';
import { useFormDirtyGuard } from '../hooks/useFormDirtyGuard';
import { sanitizeItemName } from '../utils/sanitize';
import {
  Plus,
  Check,
  Pencil,
  ArrowRight,
  Copy,
} from 'lucide-react';

/**
 * Props for SettingsPage component
 */
interface SettingsPageProps {
  workspace: WorkspaceState;
  language: SupportedLanguage;
  onPickSettingsFolder: () => Promise<boolean | void>;
  onDisconnectSettingsFolder: () => Promise<void>;
  onRefreshSettings: () => Promise<void>;
  onSaveProfile: (
    oldName: string | null,
    newName: string,
    config: {
      apiKey: string;
      apiKeyProvider: 'gemini' | 'openai' | 'openrouter';
      modelName: string;
      temperature?: number;
    },
    setAsActive: boolean
  ) => Promise<void>;
  onDeleteProfile: (profileName: string) => Promise<void>;
  onSetActiveProfile: (profileName: string) => Promise<void>;
  onSaveProject: (
    oldName: string | null,
    newName: string,
    instructions: string,
    setAsActive: boolean,
    duplicateFrom?: string | null
  ) => Promise<void>;
  onDeleteProject: (projectName: string) => Promise<void>;
  onSetActiveProject: (projectName: string) => Promise<void>;
  onNavigateToContextPrompts: (subfolder?: 'context' | 'prompts') => void;
  onRegisterDirtyCheck: (page: 'settings', checker: (() => boolean) | null) => void;
  showTopNotification: (message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
}

/**
 * SettingsPage: Manages local settings folder connection, API profiles (.env),
 * and project configurations (instructions, context files, and prompts) with duplication support.
 */
export const SettingsPage: React.FC<SettingsPageProps> = ({
  workspace,
  language,
  onPickSettingsFolder,
  onDisconnectSettingsFolder,
  onRefreshSettings,
  onSaveProfile,
  onDeleteProfile,
  onSetActiveProfile,
  onSaveProject,
  onDeleteProject,
  onSetActiveProject,
  onNavigateToContextPrompts,
  onRegisterDirtyCheck,
  showTopNotification,
}) => {
  const t = TRANSLATIONS[language].settings;
  const commonT = TRANSLATIONS[language].common;

  // Toggle between Profiles and Projects
  const [activeSubTab, setActiveSubTab] = useState<'profiles' | 'projects'>('profiles');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Profile state
  const [selectedProfileName, setSelectedProfileName] = useState<string>(() => {
    return workspace.activeProfileName || workspace.profiles[0]?.name || '';
  });
  const [isCreatingProfile, setIsCreatingProfile] = useState<boolean>(false);
  const [isEditingProfileName, setIsEditingProfileName] = useState<boolean>(false);
  const [profileNameInput, setProfileNameInput] = useState<string>('');
  const [profileApiKey, setProfileApiKey] = useState<string>('');
  const [profileProvider, setProfileProvider] = useState<'gemini' | 'openai' | 'openrouter'>('openai');
  const [profileModelName, setProfileModelName] = useState<string>('');
  const [profileTemperature, setProfileTemperature] = useState<number>(0.7);
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);
  const [profileSaveSuccess, triggerProfileSaveSuccess] = useTimedFlag(2000);

  // Selected Project state
  const [selectedProjectName, setSelectedProjectName] = useState<string>(() => {
    return workspace.activeProjectName || workspace.projects[0]?.name || '';
  });
  const [isCreatingProject, setIsCreatingProject] = useState<boolean>(false);
  const [isEditingProjectName, setIsEditingProjectName] = useState<boolean>(false);
  const [projectNameInput, setProjectNameInput] = useState<string>('');
  const [projectInstructions, setProjectInstructions] = useState<string>('');
  const [isSavingProject, setIsSavingProject] = useState<boolean>(false);
  const [projectSaveSuccess, triggerProjectSaveSuccess] = useTimedFlag(2000);
  const [duplicateSourceProject, setDuplicateSourceProject] = useState<string | null>(null);

  // Warning banner state for empty name field
  const [nameWarning, setNameWarning] = useState<string | null>(null);

  // Modals
  const [deleteProfileTarget, setDeleteProfileTarget] = useState<string | null>(null);
  const [deleteProjectTarget, setDeleteProjectTarget] = useState<string | null>(null);
  const [showDeleteSettingsModal, setShowDeleteSettingsModal] = useState<boolean>(false);
  const [showChangeLocationModal, setShowChangeLocationModal] = useState<boolean>(false);

  // Setup prompt after picking settings folder
  const [showSetupPrompt, setShowSetupPrompt] = useState<boolean>(() => {
    return workspace.hasSettingsFolder && !workspace.apiKey;
  });

  // Synchronize selected profile when workspace changes or tab switches
  useEffect(() => {
    if (isCreatingProfile) return;
    const target = workspace.profiles.find((p) => p.name === selectedProfileName) || workspace.profiles[0];
    if (target) {
      setSelectedProfileName(target.name);
      setProfileNameInput(target.name);
      setProfileApiKey(target.apiKey || '');
      setProfileProvider(
        target.apiKeyProvider === 'gemini' || target.apiKeyProvider === 'openrouter' || target.apiKeyProvider === 'openai'
          ? target.apiKeyProvider
          : 'openai'
      );
      setProfileModelName(target.modelName || '');
      setProfileTemperature(target.temperature !== undefined ? target.temperature : 0.7);
    } else {
      setSelectedProfileName('');
      setProfileNameInput('');
      setProfileApiKey('');
      setProfileModelName('');
      setProfileTemperature(0.7);
    }
  }, [workspace.profiles, selectedProfileName, isCreatingProfile]);

  // Synchronize selected project when workspace changes
  useEffect(() => {
    if (isCreatingProject) return;
    const target = workspace.projects.find((p) => p.name === selectedProjectName) || workspace.projects[0];
    if (target) {
      setSelectedProjectName(target.name);
      setProjectNameInput(target.name);
      setProjectInstructions(target.instructions ?? '');
    } else {
      setSelectedProjectName('');
      setProjectNameInput('');
      setProjectInstructions('');
    }
  }, [workspace.projects, selectedProjectName, isCreatingProject]);

  // Register dirty check for filled or modified forms
  useFormDirtyGuard(
    'settings',
    () => {
      if (activeSubTab === 'profiles') {
        if (isCreatingProfile) {
          return Boolean(profileNameInput.trim() || profileApiKey.trim() || profileModelName.trim());
        }
        const active = workspace.profiles.find((p) => p.name === selectedProfileName);
        if (!active) return false;
        return (
          profileNameInput !== active.name ||
          profileApiKey !== (active.apiKey || '') ||
          profileModelName !== (active.modelName || '') ||
          profileProvider !== (active.apiKeyProvider || 'openai') ||
          profileTemperature !== (active.temperature ?? 0.7)
        );
      } else {
        if (isCreatingProject) {
          return Boolean(projectNameInput.trim() || projectInstructions.trim());
        }
        const activeProj = workspace.projects.find((p) => p.name === selectedProjectName);
        if (!activeProj) return false;
        return (
          projectNameInput !== activeProj.name ||
          projectInstructions !== (activeProj.instructions ?? '')
        );
      }
    },
    onRegisterDirtyCheck,
    [
      activeSubTab,
      isCreatingProfile,
      profileNameInput,
      profileApiKey,
      profileModelName,
      profileProvider,
      profileTemperature,
      selectedProfileName,
      workspace.profiles,
      isCreatingProject,
      projectNameInput,
      projectInstructions,
      selectedProjectName,
      workspace.projects,
    ]
  );

  // Auto-detect provider if user pastes key
  const handleApiKeyChange = (val: string) => {
    setProfileApiKey(val);
    const trimmed = val.trim();
    if (trimmed.startsWith('sk-or-')) {
      setProfileProvider('openrouter');
    } else if (trimmed.startsWith('sk-')) {
      setProfileProvider('openai');
    } else if (trimmed.startsWith('AIza')) {
      setProfileProvider('gemini');
    }
  };

  const handlePickFolderWithPrompt = async () => {
    try {
      const success = await onPickSettingsFolder();
      if (success) {
        setShowSetupPrompt(true);
      }
    } catch {
      // Handled in callback
    }
  };

  // Start new profile creation
  const handleStartNewProfile = () => {
    if (!workspace.hasSettingsFolder) return;
    setIsCreatingProfile(true);
    setIsEditingProfileName(false);
    setProfileNameInput('');
    setProfileApiKey('');
    setProfileModelName('');
    setProfileTemperature(0.7);
    setProfileProvider('openai');
    setNameWarning(null);
  };

  // Duplicate current profile
  const handleDuplicateProfile = () => {
    if (!selectedProfileName) return;
    setIsCreatingProfile(true);
    setIsEditingProfileName(false);
    setProfileNameInput('');
    setNameWarning(null);
  };

  // Start new project creation
  const handleStartNewProject = () => {
    if (!workspace.hasSettingsFolder) return;
    setIsCreatingProject(true);
    setIsEditingProjectName(false);
    setDuplicateSourceProject(null);
    setProjectNameInput('');
    setProjectInstructions('');
    setNameWarning(null);
  };

  // Duplicate current project
  const handleDuplicateProject = () => {
    if (!selectedProjectName) return;
    setIsCreatingProject(true);
    setIsEditingProjectName(false);
    setDuplicateSourceProject(selectedProjectName);
    setProjectNameInput('');
    setNameWarning(null);
  };

  // Select profile
  const handleSelectProfile = (profile: ProfileConfig) => {
    setIsCreatingProfile(false);
    setIsEditingProfileName(false);
    setSelectedProfileName(profile.name);
    setProfileNameInput(profile.name);
    setProfileApiKey(profile.apiKey || '');
    setProfileProvider(
      profile.apiKeyProvider === 'gemini' || profile.apiKeyProvider === 'openrouter' || profile.apiKeyProvider === 'openai'
        ? profile.apiKeyProvider
        : 'openai'
    );
    setProfileModelName(profile.modelName || '');
    setProfileTemperature(profile.temperature !== undefined ? profile.temperature : 0.7);
    setNameWarning(null);
  };

  // Select project
  const handleSelectProject = (project: ProjectConfig) => {
    setIsCreatingProject(false);
    setIsEditingProjectName(false);
    setDuplicateSourceProject(null);
    setSelectedProjectName(project.name);
    setProjectNameInput(project.name);
    setProjectInstructions(project.instructions ?? '');
    setNameWarning(null);
  };

  // Cancel editing or creating profile
  const handleCancelEditProfile = () => {
    setIsCreatingProfile(false);
    setIsEditingProfileName(false);
    setNameWarning(null);
    if (selectedProfileName) {
      const target = workspace.profiles.find((p) => p.name === selectedProfileName);
      if (target) {
        setProfileNameInput(target.name);
        setProfileApiKey(target.apiKey || '');
        setProfileProvider(
          target.apiKeyProvider === 'gemini' || target.apiKeyProvider === 'openrouter' || target.apiKeyProvider === 'openai'
            ? target.apiKeyProvider
            : 'openai'
        );
        setProfileModelName(target.modelName || '');
        setProfileTemperature(target.temperature !== undefined ? target.temperature : 0.7);
      }
    } else {
      setProfileNameInput('');
      setProfileApiKey('');
      setProfileModelName('');
      setProfileTemperature(0.7);
    }
  };

  // Cancel editing or creating project
  const handleCancelEditProject = () => {
    setIsCreatingProject(false);
    setIsEditingProjectName(false);
    setDuplicateSourceProject(null);
    setNameWarning(null);
    if (selectedProjectName) {
      const target = workspace.projects.find((p) => p.name === selectedProjectName);
      if (target) {
        setProjectNameInput(target.name);
        setProjectInstructions(target.instructions ?? '');
      }
    } else {
      setProjectNameInput('');
      setProjectInstructions('');
    }
  };

  // Save profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace.hasSettingsFolder) return;

    const trimmedName = sanitizeItemName(profileNameInput);
    if (!trimmedName) {
      setNameWarning(t.emptyNameWarning);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSavingProfile(true);
    try {
      const isFirst = workspace.profiles.length === 0;
      const setAsActive = isFirst || isCreatingProfile || workspace.activeProfileName === selectedProfileName;
      await onSaveProfile(
        isCreatingProfile ? null : selectedProfileName,
        trimmedName,
        {
          apiKey: profileApiKey.trim(),
          apiKeyProvider: profileProvider,
          modelName: profileModelName.trim(),
          temperature: profileTemperature,
        },
        setAsActive
      );
      setIsCreatingProfile(false);
      setIsEditingProfileName(false);
      setSelectedProfileName(trimmedName);
      if (profileApiKey.trim()) {
        setShowSetupPrompt(false);
      }
      triggerProfileSaveSuccess();
      setNameWarning(null);
      showTopNotification(t.savedSuccess, 'success');
    } catch (err: unknown) {
      showTopNotification(err instanceof Error ? err.message : String(err), 'error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Save project
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace.hasSettingsFolder) return;

    const trimmedName = sanitizeItemName(projectNameInput);
    if (!trimmedName) {
      setNameWarning(t.emptyNameWarning);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSavingProject(true);
    try {
      const isFirst = workspace.projects.length === 0;
      const setAsActive = isFirst || isCreatingProject || workspace.activeProjectName === selectedProjectName;
      await onSaveProject(
        isCreatingProject ? null : selectedProjectName,
        trimmedName,
        projectInstructions,
        setAsActive,
        isCreatingProject ? duplicateSourceProject : null
      );
      setDuplicateSourceProject(null);
      setIsCreatingProject(false);
      setIsEditingProjectName(false);
      setSelectedProjectName(trimmedName);
      triggerProjectSaveSuccess();
      setNameWarning(null);
      showTopNotification(t.projectSavedSuccess, 'success');
    } catch (err: unknown) {
      showTopNotification(err instanceof Error ? err.message : String(err), 'error');
    } finally {
      setIsSavingProject(false);
    }
  };

  // Filtered lists
  const filteredProfiles = workspace.profiles.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredProjects = workspace.projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeProjectData = workspace.projects.find((p) => p.name === selectedProjectName);

  return (
    <div className="page-container-wide space-y-4">
      {/* Title */}
      <div>
        <h1 className="page-title">{t.title}</h1>
      </div>

      {/* Top Banner: Settings Folder Location */}
      {!workspace.hasSettingsFolder ? (
        <Banner
          variant="warning"
          action={{ label: t.saveAsBtn, onClick: handlePickFolderWithPrompt }}
        >
          {t.noFolderWarning}
        </Banner>
      ) : (
        <div className="section-card-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          <div className="text-sm text-neutral-800 flex items-center min-h-[38px]">
            {t.settingsFolderLabel} <strong className="ml-1.5">/plr-settings</strong>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto sm:!mt-0">
            <button
              type="button"
              onClick={() => setShowChangeLocationModal(true)}
              className="btn-secondary"
            >
              {t.changeLocationBtn}
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteSettingsModal(true)}
              className="btn-danger-outline"
            >
              {t.deleteSettingsBtn}
            </button>
          </div>
        </div>
      )}

      {/* Message box after user picks a settings folder */}
      {showSetupPrompt && workspace.hasSettingsFolder && !workspace.apiKey && (
        <Banner
          variant="warning"
          onDismiss={() => setShowSetupPrompt(false)}
        >
          {t.setupPromptDesc}
        </Banner>
      )}

      {/* Warning Box: Empty Name field warning banner */}
      {nameWarning && (
        <Banner
          variant="warning"
          onDismiss={() => setNameWarning(null)}
        >
          {nameWarning}
        </Banner>
      )}

      {/* Two Column Layout matching Templates & Signatures page */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column: Segmented Toggle, Search, New Button, List */}
        <div className="md:col-span-4 section-card-sm space-y-2">
          {/* Segmented Group Toggle between Profiles and Projects */}
          <div className="segmented-group w-full h-9 flex">
            <button
              type="button"
              onClick={() => {
                setActiveSubTab('profiles');
                setIsCreatingProfile(false);
                setIsEditingProfileName(false);
                setIsCreatingProject(false);
                setIsEditingProjectName(false);
              }}
              className={`flex-1 ${activeSubTab === 'profiles' ? 'segmented-btn-active' : 'segmented-btn'}`}
            >
              {t.profilesTab}
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveSubTab('projects');
                setIsCreatingProfile(false);
                setIsEditingProfileName(false);
                setIsCreatingProject(false);
                setIsEditingProjectName(false);
              }}
              className={`flex-1 ${activeSubTab === 'projects' ? 'segmented-btn-active' : 'segmented-btn'}`}
            >
              {t.projectsTab}
            </button>
          </div>

          {/* Search box */}
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={activeSubTab === 'profiles' ? t.searchProfiles : t.searchProjects}
          />

          {/* New Item Button (dashed border, full width) */}
          <button
            type="button"
            onClick={activeSubTab === 'profiles' ? handleStartNewProfile : handleStartNewProject}
            disabled={!workspace.hasSettingsFolder}
            className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm border border-dashed border-neutral-300 text-neutral-600 hover:text-neutral-950 hover:border-neutral-400 hover:bg-neutral-50 transition cursor-pointer ${
              !workspace.hasSettingsFolder ? 'opacity-40 cursor-not-allowed' : ''
            }`}
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>{activeSubTab === 'profiles' ? t.newProfile : t.newProject}</span>
          </button>

          {/* List of Profiles or Projects */}
          <div className="space-y-1 max-h-[460px] overflow-y-auto">
            {activeSubTab === 'profiles' ? (
              filteredProfiles.length === 0 ? (
                <p className="text-xs text-neutral-400 py-4 text-center">
                  {t.noProfilesFound}
                </p>
              ) : (
                filteredProfiles.map((p) => {
                  const isSelected = !isCreatingProfile && selectedProfileName === p.name;
                  const isActive = workspace.activeProfileName === p.name;
                  return (
                    <div
                      key={p.name}
                      onClick={() => handleSelectProfile(p)}
                      className={`flex items-center justify-between px-3 py-2 rounded-md text-sm transition cursor-pointer ${
                        isSelected
                          ? 'bg-neutral-200 text-neutral-950 font-medium'
                          : 'hover:bg-neutral-100 text-neutral-700'
                      }`}
                    >
                      <span className="truncate">{p.name}</span>
                      {isActive && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded-full shrink-0">
                          <Check className="w-3 h-3" />
                          {t.activeBadge}
                        </span>
                      )}
                    </div>
                  );
                })
              )
            ) : filteredProjects.length === 0 ? (
              <p className="text-xs text-neutral-400 py-4 text-center">
                {t.noProjectsFound}
              </p>
            ) : (
              filteredProjects.map((p) => {
                const isSelected = !isCreatingProject && selectedProjectName === p.name;
                const isActive = workspace.activeProjectName === p.name;
                return (
                  <div
                    key={p.name}
                    onClick={() => handleSelectProject(p)}
                    className={`flex items-center justify-between px-3 py-2 rounded-md text-sm transition cursor-pointer ${
                      isSelected
                        ? 'bg-neutral-200 text-neutral-950 font-medium'
                        : 'hover:bg-neutral-100 text-neutral-700'
                    }`}
                  >
                    <span className="truncate">{p.name}</span>
                    {isActive && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded-full shrink-0">
                        <Check className="w-3 h-3" />
                        {t.activeBadge}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Editor & Actions */}
        <div className="md:col-span-8 section-card space-y-4">
          {activeSubTab === 'profiles' ? (
            /* ================= PROFILES VIEW / EDITOR ================= */
            <div>
              {!isCreatingProfile && !selectedProfileName ? (
                <div className="py-12 text-center text-neutral-400 text-sm">
                  {t.noProfileSelected}
                </div>
              ) : (
                <form onSubmit={handleSaveProfile} noValidate className="space-y-5">
                  {/* Top action bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
                    {isCreatingProfile || isEditingProfileName ? (
                      <div className="flex items-center gap-2 flex-1 min-w-0 max-w-sm">
                        <div className="relative flex items-center w-full">
                          <input
                            type="text"
                            value={profileNameInput}
                            onChange={(e) => setProfileNameInput(e.target.value)}
                            placeholder={t.profileNamePlaceholder}
                            className="form-input text-base font-semibold h-9 pl-2.5 pr-16 w-full"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Escape') {
                                handleCancelEditProfile();
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={handleCancelEditProfile}
                            className="absolute right-2.5 text-xs text-neutral-400 hover:text-neutral-700 font-medium cursor-pointer"
                          >
                            {t.cancelBtn}
                          </button>
                        </div>
                        {!isCreatingProfile && !isEditingProfileName && workspace.activeProfileName === selectedProfileName && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded-full shrink-0">
                            <Check className="w-3 h-3" />
                            {t.activeBadge}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 flex-wrap min-w-0">
                        <h2 className="text-base font-semibold text-neutral-900 truncate">
                          {selectedProfileName || t.profileName}
                        </h2>
                        <button
                          type="button"
                          onClick={() => {
                            setProfileNameInput(selectedProfileName);
                            setIsEditingProfileName(true);
                          }}
                          title={t.editProfileNameTooltip}
                          className="p-1 rounded hover:bg-neutral-200 transition cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={handleDuplicateProfile}
                          title={t.duplicateProfileTooltip}
                          className="p-1 rounded hover:bg-neutral-200 transition cursor-pointer text-neutral-600 hover:text-neutral-900"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        {workspace.activeProfileName === selectedProfileName && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded-full shrink-0">
                            <Check className="w-3 h-3" />
                            {t.activeBadge}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-2 flex-wrap">
                      {!isCreatingProfile && !isEditingProfileName && selectedProfileName && (
                        <>
                          {workspace.activeProfileName !== selectedProfileName && (
                            <button
                              type="button"
                              onClick={() => onSetActiveProfile(selectedProfileName)}
                              className="btn-secondary"
                            >
                              {t.setAsActive}
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setDeleteProfileTarget(selectedProfileName)}
                            className="btn-danger-outline"
                          >
                            {t.deleteBtn}
                          </button>
                        </>
                      )}

                      <button
                        type="submit"
                        disabled={isSavingProfile || !workspace.hasSettingsFolder}
                        className="btn-primary"
                      >
                        {isSavingProfile ? commonT.saving : profileSaveSuccess ? commonT.saved : commonT.save}
                      </button>
                    </div>
                  </div>

                  {/* Provider Radio Buttons */}
                  <div className="space-y-2">
                    <label className="form-label">{t.provider}</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2.5 text-sm text-neutral-800 cursor-pointer">
                        <input
                          type="radio"
                          name="profileProvider"
                          value="openai"
                          checked={profileProvider === 'openai'}
                          onChange={() => setProfileProvider('openai')}
                          className="accent-neutral-900 w-4 h-4 cursor-pointer"
                        />
                        <span>{t.openaiOption}</span>
                      </label>
                      <label className="flex items-center gap-2.5 text-sm text-neutral-800 cursor-pointer">
                        <input
                          type="radio"
                          name="profileProvider"
                          value="openrouter"
                          checked={profileProvider === 'openrouter'}
                          onChange={() => setProfileProvider('openrouter')}
                          className="accent-neutral-900 w-4 h-4 cursor-pointer"
                        />
                        <span>{t.openrouterOption}</span>
                      </label>
                      <label className="flex items-center gap-2.5 text-sm text-neutral-800 cursor-pointer">
                        <input
                          type="radio"
                          name="profileProvider"
                          value="gemini"
                          checked={profileProvider === 'gemini'}
                          onChange={() => setProfileProvider('gemini')}
                          className="accent-neutral-900 w-4 h-4 cursor-pointer"
                        />
                        <span>{t.geminiOption}</span>
                      </label>
                    </div>
                  </div>

                  {/* API Key */}
                  <div className="space-y-1.5">
                    <label className="form-label">{t.apiKey}</label>
                    <input
                      type="password"
                      value={profileApiKey}
                      onChange={(e) => handleApiKeyChange(e.target.value)}
                      placeholder={
                        profileProvider === 'gemini'
                          ? 'AIzaSy...'
                          : profileProvider === 'openrouter'
                          ? 'sk-or-v1-...'
                          : 'sk-...'
                      }
                      className="form-input text-sm"
                    />
                  </div>

                  {/* Model Name Input */}
                  <div className="space-y-1.5">
                    <label className="form-label">{t.modelName}</label>
                    <input
                      type="text"
                      value={profileModelName}
                      onChange={(e) => setProfileModelName(e.target.value)}
                      placeholder={t.modelNamePlaceholder}
                      className="form-input font-mono text-sm"
                    />
                  </div>

                  {/* Temperature Dropdown */}
                  <div className="space-y-1.5">
                    <label className="form-label">{t.temperatureLabel}</label>
                    <select
                      value={profileTemperature}
                      onChange={(e) => setProfileTemperature(parseFloat(e.target.value))}
                      className="form-select text-sm"
                    >
                      <option value="0.0">{TRANSLATIONS[language].workspace.temperaturePrecise}</option>
                      <option value="0.2">{TRANSLATIONS[language].workspace.temperatureFocused}</option>
                      <option value="0.5">{TRANSLATIONS[language].workspace.temperatureConservative}</option>
                      <option value="0.7">{TRANSLATIONS[language].workspace.temperatureBalanced}</option>
                      <option value="1.0">{TRANSLATIONS[language].workspace.temperatureCreative}</option>
                      <option value="1.2">{TRANSLATIONS[language].workspace.temperatureExploratory}</option>
                    </select>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* ================= PROJECTS VIEW / EDITOR ================= */
            <div>
              {!isCreatingProject && !selectedProjectName ? (
                <div className="py-12 text-center text-neutral-400 text-sm">
                  {t.noProjectSelected}
                </div>
              ) : (
                <form onSubmit={handleSaveProject} noValidate className="space-y-5">
                  {/* Top action bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
                    {isCreatingProject || isEditingProjectName ? (
                      <div className="flex items-center gap-2 flex-1 min-w-0 max-w-sm">
                        <div className="relative flex items-center w-full">
                          <input
                            type="text"
                            value={projectNameInput}
                            onChange={(e) => setProjectNameInput(e.target.value)}
                            placeholder={t.projectNamePlaceholder}
                            className="form-input text-base font-semibold h-9 pl-2.5 pr-16 w-full"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Escape') {
                                handleCancelEditProject();
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={handleCancelEditProject}
                            className="absolute right-2.5 text-xs text-neutral-400 hover:text-neutral-700 font-medium cursor-pointer"
                          >
                            {t.cancelBtn}
                          </button>
                        </div>
                        {!isCreatingProject && !isEditingProjectName && workspace.activeProjectName === selectedProjectName && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded-full shrink-0">
                            <Check className="w-3 h-3" />
                            {t.activeBadge}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 flex-wrap min-w-0">
                        <h2 className="text-base font-semibold text-neutral-900 truncate">
                          {selectedProjectName || t.projectName}
                        </h2>
                        <button
                          type="button"
                          onClick={() => {
                            setProjectNameInput(selectedProjectName);
                            setIsEditingProjectName(true);
                          }}
                          title={t.editProjectNameTooltip}
                          className="p-1 rounded hover:bg-neutral-200 transition cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={handleDuplicateProject}
                          title={t.duplicateProjectTooltip}
                          className="p-1 rounded hover:bg-neutral-200 transition cursor-pointer text-neutral-600 hover:text-neutral-900"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        {workspace.activeProjectName === selectedProjectName && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded-full shrink-0">
                            <Check className="w-3 h-3" />
                            {t.activeBadge}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-2 flex-wrap">
                      {!isCreatingProject && !isEditingProjectName && selectedProjectName && (
                        <>
                          {workspace.activeProjectName !== selectedProjectName && (
                            <button
                              type="button"
                              onClick={() => onSetActiveProject(selectedProjectName)}
                              className="btn-secondary"
                            >
                              {t.setAsActive}
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setDeleteProjectTarget(selectedProjectName)}
                            className="btn-danger-outline"
                          >
                            {t.deleteBtn}
                          </button>
                        </>
                      )}

                      <button
                        type="submit"
                        disabled={isSavingProject || !workspace.hasSettingsFolder}
                        className="btn-primary"
                      >
                        {isSavingProject ? commonT.saving : projectSaveSuccess ? commonT.saved : commonT.save}
                      </button>
                    </div>
                  </div>

                  {/* Project Instructions Editor */}
                  <div className="space-y-2">
                    <label className="form-label !mb-0">{t.projectInstructionsTitle}</label>
                    <textarea
                      value={projectInstructions}
                      onChange={(e) => setProjectInstructions(e.target.value)}
                      rows={8}
                      className="form-textarea font-mono text-sm leading-relaxed"
                      placeholder={t.projectInstructionsPlaceholder}
                    />
                  </div>

                  {/* Context & Prompts clickable sections (navigate to Context & Prompts page) */}
                  {!isCreatingProject && activeProjectData && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div
                        onClick={() => onNavigateToContextPrompts('context')}
                        className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 hover:border-neutral-400 hover:bg-neutral-100/70 transition cursor-pointer group"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-neutral-800 group-hover:text-neutral-950">
                            {t.contextTitle} ({activeProjectData.context.length})
                          </span>
                          <ArrowRight className="w-4 h-4 text-neutral-800 group-hover:text-neutral-950 transition-colors shrink-0" />
                        </div>
                        {activeProjectData.context.length === 0 ? (
                          <p className="text-xs text-neutral-400">{t.noContextYet}</p>
                        ) : (
                          <div className="space-y-0.5 max-h-24 overflow-y-auto">
                            {activeProjectData.context.map((file) => (
                              <div key={file.name} className="text-xs text-neutral-600 truncate">
                                • {file.name}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div
                        onClick={() => onNavigateToContextPrompts('prompts')}
                        className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 hover:border-neutral-400 hover:bg-neutral-100/70 transition cursor-pointer group"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-neutral-800 group-hover:text-neutral-950">
                            {t.promptsTitle} ({activeProjectData.prompts.length})
                          </span>
                          <ArrowRight className="w-4 h-4 text-neutral-800 group-hover:text-neutral-950 transition-colors shrink-0" />
                        </div>
                        {activeProjectData.prompts.length === 0 ? (
                          <p className="text-xs text-neutral-400">{t.noPromptsYet}</p>
                        ) : (
                          <div className="space-y-0.5 max-h-24 overflow-y-auto">
                            {activeProjectData.prompts.map((p) => (
                              <div key={p.name} className="text-xs text-neutral-600 truncate">
                                • {p.name}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: Delete Profile Confirmation */}
      <Modal
        isOpen={Boolean(deleteProfileTarget)}
        onClose={() => setDeleteProfileTarget(null)}
        title={t.confirmDeleteProfileTitle}
        message={t.confirmDeleteProfileDesc}
        actions={
          <>
            <button
              type="button"
              onClick={() => setDeleteProfileTarget(null)}
              className="btn-outline"
            >
              {t.cancelBtn}
            </button>
            <button
              type="button"
              onClick={async () => {
                if (deleteProfileTarget) {
                  await onDeleteProfile(deleteProfileTarget);
                  setDeleteProfileTarget(null);
                }
              }}
              className="btn-danger-outline"
            >
              {t.deleteBtn}
            </button>
          </>
        }
      />

      {/* MODAL 2: Delete Project Confirmation */}
      <Modal
        isOpen={Boolean(deleteProjectTarget)}
        onClose={() => setDeleteProjectTarget(null)}
        title={t.confirmDeleteProjectTitle}
        message={t.confirmDeleteProjectDesc}
        actions={
          <>
            <button
              type="button"
              onClick={() => setDeleteProjectTarget(null)}
              className="btn-outline"
            >
              {t.cancelBtn}
            </button>
            <button
              type="button"
              onClick={async () => {
                if (deleteProjectTarget) {
                  await onDeleteProject(deleteProjectTarget);
                  setDeleteProjectTarget(null);
                }
              }}
              className="btn-danger-outline"
            >
              {t.deleteBtn}
            </button>
          </>
        }
      />

      {/* MODAL 3: Delete Settings Data Confirmation */}
      <Modal
        isOpen={showDeleteSettingsModal}
        onClose={() => setShowDeleteSettingsModal(false)}
        title={t.confirmDeleteSettingsTitle}
        message={t.confirmDeleteSettingsDesc}
        actions={
          <>
            <button
              type="button"
              onClick={() => setShowDeleteSettingsModal(false)}
              className="btn-outline"
            >
              {t.cancelBtn}
            </button>
            <button
              type="button"
              onClick={async () => {
                setShowDeleteSettingsModal(false);
                await onDisconnectSettingsFolder();
              }}
              className="btn-danger-outline"
            >
              {t.deleteSettingsBtn}
            </button>
          </>
        }
      />

      {/* MODAL 4: Change Location Confirmation */}
      <Modal
        isOpen={showChangeLocationModal}
        onClose={() => setShowChangeLocationModal(false)}
        title={t.confirmChangeLocationTitle}
        message={t.confirmChangeLocationDesc}
        actions={
          <>
            <button
              type="button"
              onClick={() => setShowChangeLocationModal(false)}
              className="btn-outline"
            >
              {t.cancelBtn}
            </button>
            <button
              type="button"
              onClick={async () => {
                setShowChangeLocationModal(false);
                await handlePickFolderWithPrompt();
              }}
              className="btn-primary"
            >
              {t.continueBtn}
            </button>
          </>
        }
      />
    </div>
  );
};
