export interface WorkspaceFile {
  name: string;
  content: string;
  lastModified?: number;
}

export interface ProfileConfig {
  name: string;
  apiKey: string;
  apiKeyProvider: 'gemini' | 'openai' | 'openrouter' | 'custom' | null;
  modelName: string;
  temperature?: number;
}

export interface ProjectConfig {
  name: string;
  instructions: string;
  context: WorkspaceFile[];
  prompts: WorkspaceFile[];
}

export interface SettingsConfigFile {
  activeProfile: string;
  activeProject: string;
}

export interface WorkspaceState {
  hasSettingsFolder: boolean;
  settingsFolderName: string;
  isFileSystemSupported: boolean;
  isFallbackMode: boolean;

  // Profiles
  profiles: ProfileConfig[];
  activeProfileName: string;

  // Projects
  projects: ProjectConfig[];
  activeProjectName: string;

  // Active session data derived from active profile & active project:
  apiKey: string;
  apiKeyProvider: 'gemini' | 'openai' | 'openrouter' | 'custom' | null;
  modelName: string;
  temperature: number;
  instructions: string; // Active instructions on disk/store
  sessionInstructions: string; // Locked into memory for current session
  context: WorkspaceFile[];
  prompts: WorkspaceFile[];
  lastSyncedAt: Date | null;
}

export type LengthPreference = 'concise' | 'none' | 'detailed';

export type PageTab = 'workspace' | 'settings' | 'context' | 'help' | 'about';
