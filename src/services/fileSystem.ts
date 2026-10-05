import { WorkspaceFile, ProfileConfig, ProjectConfig, SettingsConfigFile } from '../types';
import {
  DEFAULT_INSTRUCTIONS,
  getDefaultContext,
  getDefaultPrompts,
} from './defaultWorkspaceData';

export {
  DEFAULT_INSTRUCTIONS,
  getDefaultContext,
  getDefaultPrompts,
};

// Check browser support for File System Access API
export function isFileSystemAccessSupported(): boolean {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
}

// Active settings directory handle kept in memory for the active session
let activeSettingsHandle: FileSystemDirectoryHandle | null = null;

export function getActiveSettingsHandle(): FileSystemDirectoryHandle | null {
  return activeSettingsHandle;
}

export function setActiveSettingsHandle(handle: FileSystemDirectoryHandle | null): void {
  activeSettingsHandle = handle;
}

export class DirectoryPickerError extends Error {
  code: 'NOT_SUPPORTED' | 'USER_CANCELLED' | 'UNKNOWN';
  constructor(message: string, code: 'NOT_SUPPORTED' | 'USER_CANCELLED' | 'UNKNOWN') {
    super(message);
    this.name = 'DirectoryPickerError';
    this.code = code;
  }
}

// Parse key, provider, model, and temperature from .env text
export function parseEnvFile(envContent: string): {
  apiKey: string;
  apiKeyProvider: 'gemini' | 'openai' | 'openrouter' | 'custom' | null;
  modelName: string;
  temperature: number;
} {
  const lines = envContent.split('\n');
  let geminiKey = '';
  let openaiKey = '';
  let openrouterKey = '';
  let llmKey = '';
  let geminiModel = '';
  let openaiModel = '';
  let openrouterModel = '';
  let genericModel = '';
  let temperature = 0.7;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = trimmed.match(/^([A-Za-z0-9_]+)\s*=\s*(.*)$/);
    if (match) {
      const key = match[1].trim();
      let val = match[2].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1).trim();
      }
      if (key === 'GEMINI_API_KEY') geminiKey = val;
      else if (key === 'OPENROUTER_API_KEY') openrouterKey = val;
      else if (key === 'OPENAI_API_KEY') openaiKey = val;
      else if (key === 'LLM_API_KEY') llmKey = val;
      else if (key === 'GEMINI_MODEL') geminiModel = val;
      else if (key === 'OPENAI_MODEL') openaiModel = val;
      else if (key === 'OPENROUTER_MODEL') openrouterModel = val;
      else if (key === 'LLM_MODEL' || key === 'MODEL_NAME' || key === 'MODEL') genericModel = val;
      else if (key === 'TEMPERATURE' || key === 'LLM_TEMPERATURE') {
        const parsedTemp = parseFloat(val);
        if (!isNaN(parsedTemp)) temperature = parsedTemp;
      }
    }
  }

  if (openrouterKey) {
    return { apiKey: openrouterKey, apiKeyProvider: 'openrouter', modelName: openrouterModel || genericModel, temperature };
  }
  if (openaiKey) {
    return { apiKey: openaiKey, apiKeyProvider: 'openai', modelName: openaiModel || genericModel, temperature };
  }
  if (geminiKey) {
    return { apiKey: geminiKey, apiKeyProvider: 'gemini', modelName: geminiModel || genericModel, temperature };
  }
  if (llmKey) {
    if (llmKey.startsWith('sk-or-')) {
      return { apiKey: llmKey, apiKeyProvider: 'openrouter', modelName: openrouterModel || genericModel, temperature };
    }
    const provider = llmKey.startsWith('sk-') ? 'openai' : 'gemini';
    const model = provider === 'openai' ? (openaiModel || genericModel) : (geminiModel || genericModel);
    return { apiKey: llmKey, apiKeyProvider: provider, modelName: model, temperature };
  }
  return { apiKey: '', apiKeyProvider: null, modelName: genericModel, temperature };
}

// Generate .env file content
export function formatEnvFile(
  apiKey: string,
  provider: 'gemini' | 'openai' | 'openrouter',
  modelName: string,
  temperature: number = 0.7
): string {
  let content = '# Profile Environment Configuration\n';
  const cleanKey = apiKey.trim();
  const cleanModel = modelName.trim();

  if (provider === 'gemini') {
    content += `GEMINI_API_KEY="${cleanKey}"\n`;
    if (cleanModel) content += `GEMINI_MODEL="${cleanModel}"\n`;
  } else if (provider === 'openrouter') {
    content += `OPENROUTER_API_KEY="${cleanKey}"\n`;
    if (cleanModel) content += `OPENROUTER_MODEL="${cleanModel}"\n`;
  } else {
    content += `OPENAI_API_KEY="${cleanKey}"\n`;
    if (cleanModel) content += `OPENAI_MODEL="${cleanModel}"\n`;
  }
  content += `TEMPERATURE="${temperature}"\n`;

  return content;
}

/**
 * Pick location for the "plr-settings" folder.
 * If user selected an existing "plr-settings" directory, use it directly.
 * Otherwise, creates an "plr-settings" subfolder inside the selected directory.
 */
export async function pickAndInitializeSettingsFolder(): Promise<{
  settingsHandle: FileSystemDirectoryHandle;
  displayName: string;
}> {
  if (!isFileSystemAccessSupported()) {
    throw new DirectoryPickerError(
      'The File System Access API is not supported in this browser.',
      'NOT_SUPPORTED'
    );
  }

  try {
    const pickedHandle: FileSystemDirectoryHandle = await window.showDirectoryPicker({
      mode: 'readwrite',
    });

    let settingsHandle: FileSystemDirectoryHandle;

    if (pickedHandle.name === 'plr-settings') {
      settingsHandle = pickedHandle;
    } else {
      settingsHandle = await pickedHandle.getDirectoryHandle('plr-settings', { create: true });
    }

    // Ensure profiles/ and projects/ subfolders exist
    const profilesDir = await settingsHandle.getDirectoryHandle('profiles', { create: true });
    const projectsDir = await settingsHandle.getDirectoryHandle('projects', { create: true });

    // Check if profiles are empty; if so, create an empty profile (no credentials)
    let hasProfiles = false;
    for await (const [, entry] of profilesDir.entries()) {
      if (entry.kind === 'directory') {
        hasProfiles = true;
        break;
      }
    }
    if (!hasProfiles) {
      const defaultProfileDir = await profilesDir.getDirectoryHandle('default', { create: true });
      const envHandle = await defaultProfileDir.getFileHandle('.env', { create: true });
      const w = await envHandle.createWritable();
      await w.write('OPENAI_API_KEY=""\n');
      await w.close();
    }

    // Check if projects are empty; if so, create sample-project with NO default instructions, context files, or prompts
    let hasProjects = false;
    for await (const [, entry] of projectsDir.entries()) {
      if (entry.kind === 'directory') {
        hasProjects = true;
        break;
      }
    }
    if (!hasProjects) {
      const sampleProjDir = await projectsDir.getDirectoryHandle('sample-project', { create: true });
      const instHandle = await sampleProjDir.getFileHandle('instructions.md', { create: true });
      const wInst = await instHandle.createWritable();
      await wInst.write('');
      await wInst.close();

      // Create context and prompts subfolders (empty by default)
      await sampleProjDir.getDirectoryHandle('context', { create: true });
      await sampleProjDir.getDirectoryHandle('prompts', { create: true });
    }

    // Ensure settings.json exists and has active profile and project set
    const currentConfig = await readSettingsConfig(settingsHandle);
    let updatedConfig = false;
    if (!currentConfig.activeProfile) {
      currentConfig.activeProfile = 'default';
      updatedConfig = true;
    }
    if (!currentConfig.activeProject) {
      currentConfig.activeProject = 'sample-project';
      updatedConfig = true;
    }
    if (updatedConfig) {
      await writeSettingsConfig(settingsHandle, currentConfig);
    }

    activeSettingsHandle = settingsHandle;
    return {
      settingsHandle,
      displayName: settingsHandle.name,
    };
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new DirectoryPickerError('Folder selection was cancelled.', 'USER_CANCELLED');
    }
    throw err;
  }
}

/**
 * Read settings.json from plr-settings folder
 */
export async function readSettingsConfig(
  settingsHandle: FileSystemDirectoryHandle
): Promise<SettingsConfigFile> {
  try {
    const fileHandle = await settingsHandle.getFileHandle('settings.json');
    const file = await fileHandle.getFile();
    const text = await file.text();
    const parsed = JSON.parse(text);
    return {
      activeProfile: typeof parsed.activeProfile === 'string' ? parsed.activeProfile : '',
      activeProject: typeof parsed.activeProject === 'string' ? parsed.activeProject : '',
    };
  } catch {
    const defaultConfig: SettingsConfigFile = {
      activeProfile: '',
      activeProject: '',
    };
    await writeSettingsConfig(settingsHandle, defaultConfig);
    return defaultConfig;
  }
}

/**
 * Write settings.json to plr-settings folder
 */
export async function writeSettingsConfig(
  settingsHandle: FileSystemDirectoryHandle,
  config: SettingsConfigFile
): Promise<void> {
  const fileHandle = await settingsHandle.getFileHandle('settings.json', { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(JSON.stringify(config, null, 2));
  await writable.close();
}

/**
 * List all profiles from /profiles directory
 */
export async function listProfiles(
  settingsHandle: FileSystemDirectoryHandle
): Promise<ProfileConfig[]> {
  const profilesDir = await settingsHandle.getDirectoryHandle('profiles', { create: true });
  const profiles: ProfileConfig[] = [];

  for await (const [name, entry] of profilesDir.entries()) {
    if (entry.kind === 'directory') {
      const profileDir = entry as FileSystemDirectoryHandle;
      let envText = '';
      try {
        const envHandle = await profileDir.getFileHandle('.env');
        const envFile = await envHandle.getFile();
        envText = await envFile.text();
      } catch {
        // .env may not exist yet
      }

      const { apiKey, apiKeyProvider, modelName, temperature } = parseEnvFile(envText);
      profiles.push({
        name,
        apiKey,
        apiKeyProvider,
        modelName,
        temperature,
      });
    }
  }

  return profiles.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Save / Update a profile (creates or renames folder, writes .env)
 */
export async function saveProfileToDisk(
  settingsHandle: FileSystemDirectoryHandle,
  oldName: string | null,
  newName: string,
  config: {
    apiKey: string;
    apiKeyProvider: 'gemini' | 'openai' | 'openrouter';
    modelName: string;
    temperature?: number;
  }
): Promise<void> {
  const profilesDir = await settingsHandle.getDirectoryHandle('profiles', { create: true });
  const cleanName = newName.trim();
  if (!cleanName) throw new Error('Profile name cannot be empty.');

  if (oldName && oldName !== cleanName) {
    try {
      await profilesDir.removeEntry(oldName, { recursive: true });
    } catch {
      // ignore
    }
  }

  const profileDir = await profilesDir.getDirectoryHandle(cleanName, { create: true });
  const envContent = formatEnvFile(config.apiKey, config.apiKeyProvider, config.modelName, config.temperature ?? 0.7);

  const envFileHandle = await profileDir.getFileHandle('.env', { create: true });
  const writable = await envFileHandle.createWritable();
  await writable.write(envContent);
  await writable.close();
}

/**
 * Delete a profile directory
 */
export async function deleteProfileFromDisk(
  settingsHandle: FileSystemDirectoryHandle,
  profileName: string
): Promise<void> {
  const profilesDir = await settingsHandle.getDirectoryHandle('profiles', { create: true });
  await profilesDir.removeEntry(profileName, { recursive: true });
}

/**
 * Read markdown files from a project subfolder (supports fallback)
 */
async function readFilesFromSubfolder(
  projectDir: FileSystemDirectoryHandle,
  folderName: string,
  fallbackFolderName?: string
): Promise<WorkspaceFile[]> {
  const files: WorkspaceFile[] = [];

  let dirHandle: FileSystemDirectoryHandle | null = null;
  try {
    dirHandle = await projectDir.getDirectoryHandle(folderName);
  } catch {
    if (fallbackFolderName) {
      try {
        dirHandle = await projectDir.getDirectoryHandle(fallbackFolderName);
      } catch {
        // neither folder exists
      }
    }
  }

  if (dirHandle) {
    for await (const [fileName, fileEntry] of dirHandle.entries()) {
      if (fileEntry.kind === 'file' && fileName.endsWith('.md')) {
        const file = await (fileEntry as FileSystemFileHandle).getFile();
        files.push({
          name: fileName,
          content: await file.text(),
          lastModified: file.lastModified,
        });
      }
    }
  }

  return files.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * List all projects from /projects directory
 */
export async function listProjects(
  settingsHandle: FileSystemDirectoryHandle
): Promise<ProjectConfig[]> {
  const projectsDir = await settingsHandle.getDirectoryHandle('projects', { create: true });
  const projects: ProjectConfig[] = [];

  for await (const [name, entry] of projectsDir.entries()) {
    if (entry.kind === 'directory') {
      const projectDir = entry as FileSystemDirectoryHandle;
      let instructions = '';

      // Read instructions.md
      try {
        const instHandle = await projectDir.getFileHandle('instructions.md');
        const instFile = await instHandle.getFile();
        instructions = await instFile.text();
      } catch {
        // empty instructions by default
      }

      // Read context/ (with fallback to templates/ for backward compatibility)
      const context = await readFilesFromSubfolder(projectDir, 'context', 'templates');

      // Read prompts/ (with fallback to signatures/ for backward compatibility)
      const prompts = await readFilesFromSubfolder(projectDir, 'prompts', 'signatures');

      projects.push({
        name,
        instructions,
        context,
        prompts,
      });
    }
  }

  return projects.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Save / Create / Rename a project
 */
export async function saveProjectToDisk(
  settingsHandle: FileSystemDirectoryHandle,
  oldName: string | null,
  newName: string,
  instructions?: string,
  duplicateFrom?: string | null
): Promise<void> {
  const projectsDir = await settingsHandle.getDirectoryHandle('projects', { create: true });
  const cleanName = newName.trim();
  if (!cleanName) throw new Error('Project name cannot be empty.');

  let projectDir: FileSystemDirectoryHandle;

  if (duplicateFrom && duplicateFrom !== cleanName) {
    let sourceInstructions = instructions !== undefined ? instructions : '';
    const sourceContext: Record<string, string> = {};
    const sourcePrompts: Record<string, string> = {};

    try {
      const srcDir = await projectsDir.getDirectoryHandle(duplicateFrom);
      if (instructions === undefined) {
        try {
          const f = await srcDir.getFileHandle('instructions.md');
          sourceInstructions = await (await f.getFile()).text();
        } catch {
          // ignore
        }
      }

      // Read source context
      let cd: FileSystemDirectoryHandle | null = null;
      try {
        cd = await srcDir.getDirectoryHandle('context');
      } catch {
        try {
          cd = await srcDir.getDirectoryHandle('templates');
        } catch {
          // none
        }
      }
      if (cd) {
        for await (const [cName, cEntry] of cd.entries()) {
          if (cEntry.kind === 'file') {
            sourceContext[cName] = await (await (cEntry as FileSystemFileHandle).getFile()).text();
          }
        }
      }

      // Read source prompts
      let pd: FileSystemDirectoryHandle | null = null;
      try {
        pd = await srcDir.getDirectoryHandle('prompts');
      } catch {
        try {
          pd = await srcDir.getDirectoryHandle('signatures');
        } catch {
          // none
        }
      }
      if (pd) {
        for await (const [pName, pEntry] of pd.entries()) {
          if (pEntry.kind === 'file') {
            sourcePrompts[pName] = await (await (pEntry as FileSystemFileHandle).getFile()).text();
          }
        }
      }
    } catch (err) {
      console.warn(`Could not read source project ${duplicateFrom} for duplication:`, err);
    }

    projectDir = await projectsDir.getDirectoryHandle(cleanName, { create: true });
    const instHandle = await projectDir.getFileHandle('instructions.md', { create: true });
    const w = await instHandle.createWritable();
    await w.write(sourceInstructions);
    await w.close();

    const cDir = await projectDir.getDirectoryHandle('context', { create: true });
    for (const [cn, cc] of Object.entries(sourceContext)) {
      const ch = await cDir.getFileHandle(cn, { create: true });
      const cw = await ch.createWritable();
      await cw.write(cc);
      await cw.close();
    }

    const pDir = await projectDir.getDirectoryHandle('prompts', { create: true });
    for (const [pn, pc] of Object.entries(sourcePrompts)) {
      const ph = await pDir.getFileHandle(pn, { create: true });
      const pw = await ph.createWritable();
      await pw.write(pc);
      await pw.close();
    }
  } else if (oldName && oldName !== cleanName) {
    let oldInstructions = instructions || '';
    const oldContext: Record<string, string> = {};
    const oldPrompts: Record<string, string> = {};

    try {
      const oldDir = await projectsDir.getDirectoryHandle(oldName);
      try {
        const f = await oldDir.getFileHandle('instructions.md');
        oldInstructions = await (await f.getFile()).text();
      } catch {
        // ignore
      }

      let cd: FileSystemDirectoryHandle | null = null;
      try {
        cd = await oldDir.getDirectoryHandle('context');
      } catch {
        try {
          cd = await oldDir.getDirectoryHandle('templates');
        } catch {
          // none
        }
      }
      if (cd) {
        for await (const [cName, cEntry] of cd.entries()) {
          if (cEntry.kind === 'file') {
            oldContext[cName] = await (await (cEntry as FileSystemFileHandle).getFile()).text();
          }
        }
      }

      let pd: FileSystemDirectoryHandle | null = null;
      try {
        pd = await oldDir.getDirectoryHandle('prompts');
      } catch {
        try {
          pd = await oldDir.getDirectoryHandle('signatures');
        } catch {
          // none
        }
      }
      if (pd) {
        for await (const [pName, pEntry] of pd.entries()) {
          if (pEntry.kind === 'file') {
            oldPrompts[pName] = await (await (pEntry as FileSystemFileHandle).getFile()).text();
          }
        }
      }

      await projectsDir.removeEntry(oldName, { recursive: true });
    } catch {
      // old didn't exist
    }

    projectDir = await projectsDir.getDirectoryHandle(cleanName, { create: true });
    const instHandle = await projectDir.getFileHandle('instructions.md', { create: true });
    const w = await instHandle.createWritable();
    await w.write(oldInstructions);
    await w.close();

    const cDir = await projectDir.getDirectoryHandle('context', { create: true });
    for (const [cn, cc] of Object.entries(oldContext)) {
      const ch = await cDir.getFileHandle(cn, { create: true });
      const cw = await ch.createWritable();
      await cw.write(cc);
      await cw.close();
    }

    const pDir = await projectDir.getDirectoryHandle('prompts', { create: true });
    for (const [pn, pc] of Object.entries(oldPrompts)) {
      const ph = await pDir.getFileHandle(pn, { create: true });
      const pw = await ph.createWritable();
      await pw.write(pc);
      await pw.close();
    }
  } else {
    projectDir = await projectsDir.getDirectoryHandle(cleanName, { create: true });
    await projectDir.getDirectoryHandle('context', { create: true });
    await projectDir.getDirectoryHandle('prompts', { create: true });

    if (instructions !== undefined) {
      const instHandle = await projectDir.getFileHandle('instructions.md', { create: true });
      const w = await instHandle.createWritable();
      await w.write(instructions);
      await w.close();
    } else {
      try {
        await projectDir.getFileHandle('instructions.md');
      } catch {
        const instHandle = await projectDir.getFileHandle('instructions.md', { create: true });
        const w = await instHandle.createWritable();
        await w.write('');
        await w.close();
      }
    }
  }
}

/**
 * Delete a project directory
 */
export async function deleteProjectFromDisk(
  settingsHandle: FileSystemDirectoryHandle,
  projectName: string
): Promise<void> {
  const projectsDir = await settingsHandle.getDirectoryHandle('projects', { create: true });
  await projectsDir.removeEntry(projectName, { recursive: true });
}

/**
 * Save a context or prompt file inside a project
 */
export async function saveProjectFileToDisk(
  settingsHandle: FileSystemDirectoryHandle,
  projectName: string,
  subfolder: 'context' | 'prompts',
  filename: string,
  content: string
): Promise<void> {
  const projectsDir = await settingsHandle.getDirectoryHandle('projects', { create: true });
  const projectDir = await projectsDir.getDirectoryHandle(projectName, { create: true });
  const subfolderDir = await projectDir.getDirectoryHandle(subfolder, { create: true });

  const cleanName = filename.endsWith('.md') ? filename : `${filename}.md`;
  const fileHandle = await subfolderDir.getFileHandle(cleanName, { create: true });
  const writable = await fileHandle.createWritable();
  await writable.write(content);
  await writable.close();
}

/**
 * Delete a context or prompt file inside a project
 */
export async function deleteProjectFileFromDisk(
  settingsHandle: FileSystemDirectoryHandle,
  projectName: string,
  subfolder: 'context' | 'prompts',
  filename: string
): Promise<void> {
  const projectsDir = await settingsHandle.getDirectoryHandle('projects');
  const projectDir = await projectsDir.getDirectoryHandle(projectName);
  const subfolderDir = await projectDir.getDirectoryHandle(subfolder);
  await subfolderDir.removeEntry(filename);
}

/**
 * Save instructions.md in a project
 */
export async function saveProjectInstructionsToDisk(
  settingsHandle: FileSystemDirectoryHandle,
  projectName: string,
  content: string
): Promise<void> {
  const projectsDir = await settingsHandle.getDirectoryHandle('projects', { create: true });
  const projectDir = await projectsDir.getDirectoryHandle(projectName, { create: true });
  const instHandle = await projectDir.getFileHandle('instructions.md', { create: true });
  const writable = await instHandle.createWritable();
  await writable.write(content);
  await writable.close();
}

/**
 * Permanently delete the plr-settings folder and all its contents from disk
 */
export async function permanentlyDeleteSettingsFolder(
  settingsHandle: FileSystemDirectoryHandle
): Promise<void> {
  try {
    for await (const [name] of settingsHandle.entries()) {
      try {
        await settingsHandle.removeEntry(name, { recursive: true });
      } catch (err) {
        console.warn(`Failed to remove entry ${name}:`, err);
      }
    }
  } catch (err) {
    console.warn('Failed to clear directory entries:', err);
  }

  try {
    if (typeof settingsHandle.remove === 'function') {
      await settingsHandle.remove({ recursive: true });
    }
  } catch (err) {
    console.warn('handle.remove on folder itself was not permitted, all folder contents purged:', err);
  }
}
