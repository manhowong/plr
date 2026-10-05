export type SupportedLanguage = 'en' | 'zh-TW' | 'zh-CN';

export interface Translations {
  appTitle: string;
  common: {
    dismiss: string;
    save: string;
    saving: string;
    saved: string;
  };
  nav: {
    workspace: string;
    settings: string;
    contextPrompts: string;
    help: string;
    about: string;
    aboutTheApp: string;
  };
  status: {
    title: string;
    folder: string;
    key: string;
    model: string;
    provided: string;
    notProvided: string;
    profile: string;
    project: string;
    none: string;
  };
  workspace: {
    yourRequest: string;
    requestPlaceholder: string;
    createReusablePrompt: string;
    promptAttached: string;
    addContextFilesOption: string;
    noContextFiles: string;
    selectAll: string;
    deselectAll: string;
    temperature: string;
    temperatureBalanced: string;
    temperaturePrecise: string;
    temperatureFocused: string;
    temperatureConservative: string;
    temperatureCreative: string;
    temperatureExploratory: string;
    lengthConcise: string;
    lengthNone: string;
    lengthDetailed: string;
    savedPromptBtn: string;
    contextBtnLabel: string;
    tempBtnLabel: string;
    lengthBtnLabel: string;
    lengthDefault: string;
    noSavedPrompts: string;
    estimatedTokens: string;
    copyPromptBtn: string;
    promptCopied: string;
    copyPromptTooltip: string;
    generateBtn: string;
    generatingBtn: string;
    generatedContent: string;
    draftPlaceholder: string;
    refine: string;
    shorter: string;
    expand: string;
    summarize: string;
    copy: string;
    copied: string;
    clear: string;
    clearConfirm: string;
    noKeyWarning: string;
    goToSettings: string;
    offlineWarning: string;
  };
  contextPrompts: {
    title: string;
    contextTab: string;
    promptsTab: string;
    writeNewFile: string;
    importBtn: string;
    importing: string;
    importSuccess: string;
    importError: string;
    searchPlaceholder: string;
    noFilesFound: string;
    filename: string;
    noFileSelected: string;
    contextPlaceholder: string;
    promptPlaceholder: string;
    saveFile: string;
    deleteBtn: string;
    deleteConfirm: string;
    characters: string;
    noFolderWarning: string;
    noProjectWarning: string;
    goToSettings: string;
    editFileNameTooltip: string;
    duplicateFileTooltip: string;
    emptyNameWarning: string;
    cancelBtn: string;
    currentProject: string;
    switchProjectInSettings: string;
  };
  settings: {
    title: string;
    settingsFolderLabel: string;
    reloadBtn: string;
    saveAsBtn: string;
    changeLocationBtn: string;
    deleteSettingsBtn: string;
    setupPromptDesc: string;
    profilesTab: string;
    projectsTab: string;
    newProfile: string;
    newProject: string;
    searchProfiles: string;
    searchProjects: string;
    noProfilesFound: string;
    noProjectsFound: string;
    profileName: string;
    profileNamePlaceholder: string;
    projectName: string;
    projectNamePlaceholder: string;
    provider: string;
    geminiOption: string;
    openaiOption: string;
    openrouterOption: string;
    apiKey: string;
    apiKeyPlaceholder: string;
    keyStatusProvided: string;
    keyStatusNotProvided: string;
    modelName: string;
    modelNameDesc: string;
    modelNamePlaceholder: string;
    temperatureLabel: string;
    activeBadge: string;
    setAsActive: string;
    saveProfileBtn: string;
    saveProjectBtn: string;
    savingBtn: string;
    savedBtn: string;
    deleteBtn: string;
    deleteConfirm: string;
    cancelBtn: string;
    confirmDeleteProfileTitle: string;
    confirmDeleteProfileDesc: string;
    confirmDeleteProjectTitle: string;
    confirmDeleteProjectDesc: string;
    confirmDeleteSettingsTitle: string;
    confirmDeleteSettingsDesc: string;
    confirmChangeLocationTitle: string;
    confirmChangeLocationDesc: string;
    continueBtn: string;
    duplicateProfileTooltip: string;
    duplicateProjectTooltip: string;
    emptyNameWarning: string;
    projectInstructionsTitle: string;
    contextTitle: string;
    promptsTitle: string;
    noContextYet: string;
    noPromptsYet: string;
    savedSuccess: string;
    projectSavedSuccess: string;
    profileDeletedSuccess: string;
    projectDeletedSuccess: string;
    settingsDataDeletedSuccess: string;
    folderConnectedSuccess: string;
    noProfileSelected: string;
    noProjectSelected: string;
    noFolderWarning: string;
    editProfileNameTooltip: string;
    editProjectNameTooltip: string;
    projectInstructionsPlaceholder: string;
  };
  discardModal: {
    title: string;
    description: string;
    discardBtn: string;
    cancelBtn: string;
  };
  help: {
    title: string;
    shortcuts: string;
    generateShortcut: string;
    copyShortcut: string;
    folderStructure: string;
    folderDesc: string;
    contextAndPromptsGuide: string;
    contextGuideDesc: string;
    promptsGuideDesc: string;
    contextExampleTitle: string;
    promptExampleTitle: string;
    envFile: string;
    envDesc: string;
    copy: string;
    copied: string;
  };
  about: {
    title: string;
    description: string;
    version: string;
    license: string;
    developer: string;
    sourceCode: string;
    pullRequest: string;
    feedback: string;
  };
}

export const DEFAULT_INSTRUCTIONS_BY_LANG: Record<SupportedLanguage, string> = {
  en: '',
  'zh-TW': '',
  'zh-CN': '',
};

export const TRANSLATIONS: Record<SupportedLanguage, Translations> = {
  en: {
    appTitle: 'Personal LLM Runner',
    common: {
      dismiss: 'Dismiss',
      save: 'Save',
      saving: 'Saving...',
      saved: 'Saved!',
    },
    nav: {
      workspace: 'Workspace',
      settings: 'Settings',
      contextPrompts: 'Context & Prompts',
      help: 'Help',
      about: 'About',
      aboutTheApp: 'About the app',
    },
    status: {
      title: 'Status',
      folder: 'Folder',
      key: 'Key',
      model: 'Model',
      provided: 'Provided',
      notProvided: 'Not provided',
      profile: 'Profile',
      project: 'Project',
      none: 'None',
    },
    workspace: {
      yourRequest: 'Your Request',
      requestPlaceholder: 'Describe your request, goals, or instructions here...',
      createReusablePrompt: 'Create reusable prompt...',
      promptAttached: 'Appended!',
      addContextFilesOption: 'Add more files...',
      noContextFiles: 'No context files',
      selectAll: 'Select All',
      deselectAll: 'Deselect All',
      temperature: 'Temperature',
      temperatureBalanced: '0.7 (Balanced)',
      temperaturePrecise: '0.0 (Precise)',
      temperatureFocused: '0.2 (Focused)',
      temperatureConservative: '0.5 (Conservative)',
      temperatureCreative: '1.0 (Creative)',
      temperatureExploratory: '1.2 (Exploratory)',
      lengthConcise: 'Concise',
      lengthNone: 'No Preference',
      lengthDetailed: 'Detailed',
      savedPromptBtn: 'Prompt Library',
      contextBtnLabel: 'Context: {n} files',
      tempBtnLabel: 'Temp: {temp}',
      lengthBtnLabel: 'Length: {length}',
      lengthDefault: 'default',
      noSavedPrompts: 'No saved prompts',
      estimatedTokens: 'Estimated tokens',
      copyPromptBtn: 'Copy Final Prompt',
      promptCopied: 'Copied!',
      copyPromptTooltip: 'Copy the complete prompt that will be sent to the LLM',
      generateBtn: 'Generate (Ctrl+Enter)',
      generatingBtn: 'Generating...',
      generatedContent: 'Generated Content',
      draftPlaceholder: 'Generated draft will appear here',
      refine: 'Refine:',
      shorter: 'Shorter',
      expand: 'Expand',
      summarize: 'Summarize',
      copy: 'Copy to Clipboard (Ctrl+S)',
      copied: 'Copied!',
      clear: 'Clear',
      clearConfirm: 'Press again to confirm',
      noKeyWarning: 'Please configure an API key in Settings to generate content.',
      goToSettings: 'Go to Settings',
      offlineWarning: 'Generation requires an active internet connection.',
    },
    contextPrompts: {
      title: 'Context & Prompts',
      contextTab: 'Context',
      promptsTab: 'Prompts',
      writeNewFile: 'Write',
      importBtn: 'Import...',
      importing: 'Importing...',
      importSuccess: 'Imported successfully.',
      importError: 'Failed to import files. Please ensure they are Markdown (.md).',
      searchPlaceholder: 'Search files...',
      noFilesFound: 'No files found',
      filename: 'Filename (e.g. background.md)',
      noFileSelected: 'No file selected',
      contextPlaceholder: 'Write markdown context content (e.g. product specs, company background, reference guidelines)...',
      promptPlaceholder: 'Write reusable markdown prompt instructions...',
      saveFile: 'Save',
      deleteBtn: 'Delete',
      deleteConfirm: 'Press again to confirm',
      characters: 'characters',
      noFolderWarning: 'Please set up a settings folder first in the Settings page.',
      noProjectWarning: 'Please add a project in Settings to manage context & prompts.',
      goToSettings: 'Go to Settings',
      editFileNameTooltip: 'Edit file name',
      duplicateFileTooltip: 'Duplicate file',
      emptyNameWarning: 'File name cannot be empty. Please enter a valid file name.',
      cancelBtn: 'Cancel',
      currentProject: 'Current Project:',
      switchProjectInSettings: 'Switch Project in Settings',
    },
    settings: {
      title: 'Settings',
      settingsFolderLabel: 'Settings Folder:',
      reloadBtn: 'Reload',
      saveAsBtn: 'Save As...',
      changeLocationBtn: 'Change Location',
      deleteSettingsBtn: 'Delete Settings Data',
      setupPromptDesc: 'Please configure your profile below to enable LLM generation.',
      noFolderWarning: 'Pick a location on your computer to save settings.',
      profilesTab: 'Profiles',
      projectsTab: 'Projects',
      newProfile: 'New Profile',
      newProject: 'New Project',
      searchProfiles: 'Search profiles...',
      searchProjects: 'Search projects...',
      noProfilesFound: 'No profiles found',
      noProjectsFound: 'No projects found',
      profileName: 'Profile Name',
      profileNamePlaceholder: 'Profile name, e.g. Work, Personal...',
      projectName: 'Project Name',
      projectNamePlaceholder: 'Project name, e.g. Sales, Support...',
      provider: 'Provider',
      geminiOption: 'Google Gemini',
      openaiOption: 'OpenAI',
      openrouterOption: 'OpenRouter',
      apiKey: 'API Key',
      apiKeyPlaceholder: 'Enter API key...',
      keyStatusProvided: 'Key configured in profile .env',
      keyStatusNotProvided: 'Key not configured',
      modelName: 'Model Name / Path',
      modelNameDesc: 'Specify the model identifier for this profile.',
      modelNamePlaceholder: 'e.g. gpt-4o, claude-3-5-sonnet, gemini-2.5-flash',
      temperatureLabel: 'Temperature',
      activeBadge: 'Active',
      setAsActive: 'Set as Active',
      saveProfileBtn: 'Save',
      saveProjectBtn: 'Save',
      savingBtn: 'Saving...',
      savedBtn: 'Saved!',
      deleteBtn: 'Delete',
      deleteConfirm: 'Click again to confirm',
      cancelBtn: 'Cancel',
      confirmDeleteProfileTitle: 'Delete Profile?',
      confirmDeleteProfileDesc: 'This will permanently remove this profile folder and its .env configuration file from disk.',
      confirmDeleteProjectTitle: 'Delete Project?',
      confirmDeleteProjectDesc: 'This will permanently remove this project folder and its instructions, context, and prompts from disk.',
      confirmDeleteSettingsTitle: 'Delete Settings Data?',
      confirmDeleteSettingsDesc: 'This will permanently delete the "plr-settings" folder and all its profiles and projects from your disk.',
      confirmChangeLocationTitle: 'Change Settings Folder Location?',
      confirmChangeLocationDesc: 'The current settings folder may contain sensitive or private configuration data (such as API keys and profiles). Please ensure you know where it is stored and remove any sensitive files if needed.',
      continueBtn: 'Continue',
      duplicateProfileTooltip: 'Duplicate profile',
      duplicateProjectTooltip: 'Duplicate project',
      emptyNameWarning: 'Name cannot be empty. Please enter a valid name.',
      projectInstructionsTitle: 'Project Instructions',
      contextTitle: 'Context',
      promptsTitle: 'Prompts',
      noContextYet: 'No context files yet',
      noPromptsYet: 'No saved prompts yet',
      savedSuccess: 'Profile configuration saved to disk.',
      projectSavedSuccess: 'Project configuration saved to disk.',
      profileDeletedSuccess: 'Profile deleted.',
      projectDeletedSuccess: 'Project deleted.',
      settingsDataDeletedSuccess: 'Settings data deleted permanently from disk.',
      folderConnectedSuccess: 'Settings folder connected successfully.',
      noProfileSelected: 'Create a profile to configure API credentials.',
      noProjectSelected: 'Create a project to configure instructions, context, and prompts.',
      editProfileNameTooltip: 'Edit profile name',
      editProjectNameTooltip: 'Edit project name',
      projectInstructionsPlaceholder: 'Optional: Enter project instructions (system prompt) for this project...',
    },
    discardModal: {
      title: 'Discard Unsaved Form?',
      description: 'You have unsaved changes or filled form content on this page. If you leave now, your input will be discarded. Do you want to continue?',
      discardBtn: 'Discard & Leave',
      cancelBtn: 'Cancel',
    },
    help: {
      title: 'Help & Shortcuts',
      shortcuts: 'Keyboard Shortcuts',
      generateShortcut: 'Generate content (Workspace)',
      copyShortcut: 'Copy generated draft to clipboard',
      folderStructure: 'Configuration Structure',
      folderDesc: 'All settings are stored locally in the "plr-settings" folder containing /profiles/<name>/.env and /projects/<name>/(instructions, context, prompts).',
      contextAndPromptsGuide: 'Context vs. Prompts',
      contextGuideDesc: 'Context files (*.md) provide background information, data, or documents that are appended to the final prompt sent to the LLM.',
      promptsGuideDesc: 'Saved Prompts (*.md) are reusable instructions and templates that you can attach directly to your workspace request.',
      contextExampleTitle: 'Minimal Context File Example (e.g. context/product-specs.md)',
      promptExampleTitle: 'Minimal Saved Prompt Example (e.g. prompts/feature-reply.md)',
      envFile: 'Profile .env Format',
      envDesc: 'Each profile folder contains its own isolated .env configuration file:',
      copy: 'Copy',
      copied: 'Copied!',
    },
    about: {
      title: 'About',
      description: 'An offline-first Personal LLM Runner with Context & Prompts management and multi-project configuration support.',
      version: 'Version',
      license: 'License',
      developer: 'Developer',
      sourceCode: 'Source Code',
      pullRequest: 'Pull request',
      feedback: 'Feedback',
    },
  },

  'zh-TW': {
    appTitle: 'Personal LLM Runner',
    common: {
      dismiss: '關閉',
      save: '儲存',
      saving: '儲存中...',
      saved: '已儲存！',
    },
    nav: {
      workspace: '工作區',
      settings: '設定',
      contextPrompts: '情境與提示詞',
      help: '說明',
      about: '關於',
      aboutTheApp: '關於此應用程式',
    },
    status: {
      title: '狀態',
      folder: '資料夾',
      key: '金鑰',
      model: '模型',
      provided: '已設定',
      notProvided: '未設定',
      profile: '設定檔',
      project: '專案',
      none: '無',
    },
    workspace: {
      yourRequest: '您的指令',
      requestPlaceholder: '在此描述您的請求、目標或指示...',
      createReusablePrompt: '建立可重複使用的提示詞...',
      promptAttached: '已附加！',
      addContextFilesOption: '新增更多檔案...',
      noContextFiles: '尚無情境檔案',
      selectAll: '全選',
      deselectAll: '取消全選',
      temperature: '溫度',
      temperatureBalanced: '0.7 (平衡)',
      temperaturePrecise: '0.0 (精確)',
      temperatureFocused: '0.2 (聚焦)',
      temperatureConservative: '0.5 (穩健)',
      temperatureCreative: '1.0 (創意)',
      temperatureExploratory: '1.2 (探索)',
      lengthConcise: '精簡',
      lengthNone: '無偏好',
      lengthDetailed: '詳盡',
      savedPromptBtn: '提示詞庫',
      contextBtnLabel: '情境：{n} 個檔案',
      tempBtnLabel: '溫度：{temp}',
      lengthBtnLabel: '長度：{length}',
      lengthDefault: '預設',
      noSavedPrompts: '尚無已儲存的提示詞',
      estimatedTokens: '預估符元數',
      copyPromptBtn: '複製完整提示詞',
      promptCopied: '已複製！',
      copyPromptTooltip: '複製發送給 LLM 的完整提示詞',
      generateBtn: '生成 (Ctrl+Enter)',
      generatingBtn: '正在生成...',
      generatedContent: '生成內容',
      draftPlaceholder: '生成的內容將在此處顯示',
      refine: '潤飾：',
      shorter: '更簡短',
      expand: '擴充細節',
      summarize: '濃縮摘要',
      copy: '複製到剪貼簿 (Ctrl+S)',
      copied: '已複製！',
      clear: '清空內容',
      clearConfirm: '再次點擊以確認',
      noKeyWarning: '請在「設定」中設定 API 金鑰以生成內容。',
      goToSettings: '前往設定',
      offlineWarning: '生成內容需要連接網際網路。',
    },
    contextPrompts: {
      title: '情境與提示詞',
      contextTab: '情境',
      promptsTab: '提示詞',
      writeNewFile: '撰寫',
      importBtn: '匯入...',
      importing: '匯入中...',
      importSuccess: '匯入成功。',
      importError: '部分檔案無法匯入，請確保為 Markdown (.md) 格式。',
      searchPlaceholder: '搜尋檔案...',
      noFilesFound: '找不到相符檔案',
      filename: '檔案名稱（例如 background.md）',
      noFileSelected: '未選擇檔案',
      contextPlaceholder: '請輸入 Markdown 格式的情境內容（例如產品規格、公司背景、參考指南）...',
      promptPlaceholder: '請輸入可重複使用的 Markdown 提示詞指令...',
      saveFile: '儲存',
      deleteBtn: '刪除',
      deleteConfirm: '再次點擊以確認',
      characters: '字元數',
      noFolderWarning: '請先前往「設定」頁面完成設定資料夾配置。',
      noProjectWarning: '請在「設定」中新增專案以管理情境與提示詞。',
      goToSettings: '前往設定',
      editFileNameTooltip: '編輯檔案名稱',
      duplicateFileTooltip: '複製檔案',
      emptyNameWarning: '檔案名稱不能為空，請輸入有效檔案名稱。',
      cancelBtn: '取消',
      currentProject: '目前專案：',
      switchProjectInSettings: '在設定中切換專案',
    },
    settings: {
      title: '設定',
      settingsFolderLabel: '設定資料夾：',
      reloadBtn: '重新載入',
      saveAsBtn: '另存新檔...',
      changeLocationBtn: '變更位置',
      deleteSettingsBtn: '刪除設定資料',
      setupPromptDesc: '請在下方填寫您的設定檔以啟用 LLM 生成功能。',
      noFolderWarning: '請選擇電腦上的位置以儲存設定。',
      profilesTab: '設定檔',
      projectsTab: '專案',
      newProfile: '新增設定檔',
      newProject: '新增專案',
      searchProfiles: '搜尋設定檔...',
      searchProjects: '搜尋專案...',
      noProfilesFound: '找不到相符設定檔',
      noProjectsFound: '找不到相符專案',
      profileName: '設定檔名稱',
      profileNamePlaceholder: '設定檔名稱，例如：Work，Personal...',
      projectName: '專案名稱',
      projectNamePlaceholder: '專案名稱，例如：Sales，Support...',
      provider: '模型提供商',
      geminiOption: 'Google Gemini',
      openaiOption: 'OpenAI',
      openrouterOption: 'OpenRouter',
      apiKey: 'API 金鑰',
      apiKeyPlaceholder: '輸入 API 金鑰...',
      keyStatusProvided: '金鑰已於設定檔 .env 中設定',
      keyStatusNotProvided: '金鑰未設定',
      modelName: '模型名稱／路徑',
      modelNameDesc: '指定此設定檔使用的模型代碼。',
      modelNamePlaceholder: '例如：gpt-4o，claude-3-5-sonnet，gemini-2.5-flash',
      temperatureLabel: '溫度設定',
      activeBadge: '已啟用',
      setAsActive: '啟用',
      saveProfileBtn: '儲存',
      saveProjectBtn: '儲存',
      savingBtn: '儲存中...',
      savedBtn: '已儲存！',
      deleteBtn: '刪除',
      deleteConfirm: '再次點擊確認刪除',
      cancelBtn: '取消',
      confirmDeleteProfileTitle: '確定刪除設定檔？',
      confirmDeleteProfileDesc: '這將永久從硬碟刪除該設定檔資料夾及其 .env 檔案。',
      confirmDeleteProjectTitle: '確定刪除專案？',
      confirmDeleteProjectDesc: '這將永久從硬碟刪除該專案資料夾及其指令、情境與提示詞。',
      confirmDeleteSettingsTitle: '確定刪除設定資料？',
      confirmDeleteSettingsDesc: '這將從硬碟永久刪除 "plr-settings" 資料夾及其所有設定檔與專案。',
      confirmChangeLocationTitle: '變更設定資料夾位置？',
      confirmChangeLocationDesc: '目前設定資料夾中可能包含私密資訊（如 API 金鑰與設定檔）。請務必記住該資料夾的存放位置，並於需要時清除機密內容。',
      continueBtn: '繼續',
      duplicateProfileTooltip: '複製設定檔',
      duplicateProjectTooltip: '複製專案',
      emptyNameWarning: '名稱不能為空，請輸入有效名稱。',
      projectInstructionsTitle: '專案指令',
      contextTitle: '情境',
      promptsTitle: '提示詞',
      noContextYet: '尚無情境檔案',
      noPromptsYet: '尚無提示詞',
      savedSuccess: '設定檔已儲存至磁碟。',
      projectSavedSuccess: '專案已儲存至磁碟。',
      profileDeletedSuccess: '設定檔已刪除。',
      projectDeletedSuccess: '專案已刪除。',
      settingsDataDeletedSuccess: '設定資料已永久從磁碟刪除。',
      folderConnectedSuccess: '已成功連接設定資料夾。',
      noProfileSelected: '建立設定檔以配置 API 憑證。',
      noProjectSelected: '建立專案以配置專案指令、情境與提示詞。',
      editProfileNameTooltip: '編輯設定檔名稱',
      editProjectNameTooltip: '編輯專案名稱',
      projectInstructionsPlaceholder: '選填：輸入此專案的自訂專案指令（作為系統提示詞）...',
    },
    discardModal: {
      title: '確定放棄未儲存的表單？',
      description: '本頁面有未儲存或已填寫的表單內容。若現在離開，這些內容將會遺失。您確定要繼續嗎？',
      discardBtn: '放棄並離開',
      cancelBtn: '取消',
    },
    help: {
      title: '說明與快捷鍵',
      shortcuts: '鍵盤快捷鍵',
      generateShortcut: '生成內容（工作區）',
      copyShortcut: '複製草稿至剪貼簿',
      folderStructure: '設定目錄結構',
      folderDesc: '所有組態均儲存於本機 "plr-settings" 目錄，內含 /profiles/<名稱>/.env 與 /projects/<名稱>/(instructions, context, prompts)。',
      contextAndPromptsGuide: '情境 (Context) 與提示詞 (Prompts)',
      contextGuideDesc: '情境檔案 (*.md) 提供背景知識、規格或參考資料，其完整內容會附加於發送給 LLM 的最終提示詞中。',
      promptsGuideDesc: '提示詞檔案 (*.md) 是可重複使用的指示範本，可隨時附加到工作區的請求欄位中。',
      contextExampleTitle: '極簡情境檔案範例（例：context/product-specs.md）',
      promptExampleTitle: '極簡提示詞範例（例：prompts/feature-reply.md）',
      envFile: '設定檔 .env 格式',
      envDesc: '每個設定檔資料夾皆包含獨立的 .env 設定檔：',
      copy: '複製',
      copied: '已複製！',
    },
    about: {
      title: '關於',
      description: '具備離線運行能力與情境與提示詞管理的 Personal LLM Runner，支援多設定檔與多專案獨立組態。',
      version: '版本',
      license: '授權條款',
      developer: '開發者',
      sourceCode: '原始碼',
      pullRequest: 'Pull request (拉取請求)',
      feedback: '建議',
    },
  },

  'zh-CN': {
    appTitle: 'Personal LLM Runner',
    common: {
      dismiss: '关闭',
      save: '保存',
      saving: '保存中...',
      saved: '已保存！',
    },
    nav: {
      workspace: '工作区',
      settings: '设置',
      contextPrompts: '上下文与提示词',
      help: '帮助',
      about: '关于',
      aboutTheApp: '关于此应用',
    },
    status: {
      title: '状态',
      folder: '文件夹',
      key: '密钥',
      model: '模型',
      provided: '已配置',
      notProvided: '未配置',
      profile: '配置文件',
      project: '项目',
      none: '无',
    },
    workspace: {
      yourRequest: '您的指令',
      requestPlaceholder: '在此描述您的请求、目标或指示...',
      createReusablePrompt: '创建可重复使用的提示词...',
      promptAttached: '已附加！',
      addContextFilesOption: '添加更多文件...',
      noContextFiles: '尚无上下文文件',
      selectAll: '全选',
      deselectAll: '取消全选',
      temperature: '温度',
      temperatureBalanced: '0.7 (平衡)',
      temperaturePrecise: '0.0 (精确)',
      temperatureFocused: '0.2 (聚焦)',
      temperatureConservative: '0.5 (稳健)',
      temperatureCreative: '1.0 (创意)',
      temperatureExploratory: '1.2 (探索)',
      lengthConcise: '精简',
      lengthNone: '无偏好',
      lengthDetailed: '详尽',
      savedPromptBtn: '提示词库',
      contextBtnLabel: '上下文：{n} 个文件',
      tempBtnLabel: '温度：{temp}',
      lengthBtnLabel: '长度：{length}',
      lengthDefault: '默认',
      noSavedPrompts: '尚无已保存的提示词',
      estimatedTokens: '预估词元数',
      copyPromptBtn: '复制完整提示词',
      promptCopied: '已复制！',
      copyPromptTooltip: '复制发送给 LLM 的完整提示词',
      generateBtn: '生成 (Ctrl+Enter)',
      generatingBtn: '正在生成...',
      generatedContent: '生成内容',
      draftPlaceholder: '生成的内容将在此处显示',
      refine: '微调：',
      shorter: '更简短',
      expand: '扩展细节',
      summarize: '浓缩摘要',
      copy: '复制到剪贴板 (Ctrl+S)',
      copied: '已复制！',
      clear: '清空内容',
      clearConfirm: '再次点击以确认',
      noKeyWarning: '请在“设置”中配置 API 密钥以生成内容。',
      goToSettings: '前往设置',
      offlineWarning: '生成内容需要连接互联网。',
    },
    contextPrompts: {
      title: '上下文与提示词',
      contextTab: '上下文',
      promptsTab: '提示词',
      writeNewFile: '编写',
      importBtn: '导入...',
      importing: '导入中...',
      importSuccess: '导入成功。',
      importError: '部分文件无法导入，请确保为 Markdown (.md) 格式。',
      searchPlaceholder: '搜索文件...',
      noFilesFound: '未找到匹配文件',
      filename: '文件名称（例如 background.md）',
      noFileSelected: '未选择文件',
      contextPlaceholder: '请输入 Markdown 格式的上下文内容（例如产品规格、公司背景、参考规范）...',
      promptPlaceholder: '请输入可重复使用的 Markdown 提示词指令...',
      saveFile: '保存',
      deleteBtn: '删除',
      deleteConfirm: '再次点击以确认',
      characters: '字符数',
      noFolderWarning: '请先前往“设置”页面完成设置文件夹配置。',
      noProjectWarning: '请在“设置”中新建项目以管理上下文与提示词。',
      goToSettings: '前往设置',
      editFileNameTooltip: '编辑文件名称',
      duplicateFileTooltip: '复制文件',
      emptyNameWarning: '文件名不能为空，请输入有效文件名。',
      cancelBtn: '取消',
      currentProject: '当前项目：',
      switchProjectInSettings: '在设置中切换项目',
    },
    settings: {
      title: '设置',
      settingsFolderLabel: '设置文件夹：',
      reloadBtn: '重新加载',
      saveAsBtn: '另存为...',
      changeLocationBtn: '更改位置',
      deleteSettingsBtn: '删除设置数据',
      setupPromptDesc: '请在下方填写您的配置文件以启用 LLM 生成功能。',
      noFolderWarning: '请选择电脑上的位置以保存设置。',
      profilesTab: '配置文件',
      projectsTab: '项目',
      newProfile: '新建配置文件',
      newProject: '新建项目',
      searchProfiles: '搜索配置文件...',
      searchProjects: '搜索项目...',
      noProfilesFound: '未找到匹配配置文件',
      noProjectsFound: '未找到匹配项目',
      profileName: '配置文件名称',
      profileNamePlaceholder: '配置文件名称，例如：Work，Personal...',
      projectName: '项目名称',
      projectNamePlaceholder: '项目名称，例如：Sales，Support...',
      provider: '模型提供商',
      geminiOption: 'Google Gemini',
      openaiOption: 'OpenAI',
      openrouterOption: 'OpenRouter',
      apiKey: 'API 密钥',
      apiKeyPlaceholder: '输入 API 密钥...',
      keyStatusProvided: '密钥已在配置文件 .env 中配置',
      keyStatusNotProvided: '密钥未配置',
      modelName: '模型名称／路径',
      modelNameDesc: '指定此配置文件使用的模型标识符。',
      modelNamePlaceholder: '例如：gpt-4o，claude-3-5-sonnet，gemini-2.5-flash',
      temperatureLabel: '温度设定',
      activeBadge: '已启用',
      setAsActive: '启用',
      saveProfileBtn: '保存',
      saveProjectBtn: '保存',
      savingBtn: '保存中...',
      savedBtn: '已保存！',
      deleteBtn: '删除',
      deleteConfirm: '再次点击确认删除',
      cancelBtn: '取消',
      confirmDeleteProfileTitle: '确定删除配置文件？',
      confirmDeleteProfileDesc: '这将永久从硬盘中删除该配置文件文件夹及其 .env 文件。',
      confirmDeleteProjectTitle: '确定删除项目？',
      confirmDeleteProjectDesc: '这将永久从硬盘中删除该项目文件夹及其指令、上下文与提示词。',
      confirmDeleteSettingsTitle: '确定删除设置数据？',
      confirmDeleteSettingsDesc: '这将从硬盘中永久删除 "plr-settings" 文件夹及其全部配置文件和项目。',
      confirmChangeLocationTitle: '更改设置文件夹位置？',
      confirmChangeLocationDesc: '当前设置文件夹中可能包含敏感或私密配置（如 API 密钥与配置文件）。请务必记住该文件夹的存储位置，并在需要时清理相关信息。',
      continueBtn: '继续',
      duplicateProfileTooltip: '复制配置文件',
      duplicateProjectTooltip: '复制项目',
      emptyNameWarning: '名称不能为空，请输入有效名称。',
      projectInstructionsTitle: '项目指令',
      contextTitle: '上下文',
      promptsTitle: '提示词',
      noContextYet: '尚无上下文文件',
      noPromptsYet: '尚无提示词',
      savedSuccess: '配置文件已保存至磁盘。',
      projectSavedSuccess: '项目已保存至磁盘。',
      profileDeletedSuccess: '配置文件已删除。',
      projectDeletedSuccess: '项目已删除。',
      settingsDataDeletedSuccess: '设置数据已永久从磁盘删除。',
      folderConnectedSuccess: '已成功连接设置文件夹。',
      noProfileSelected: '创建配置文件以配置 API 凭证。',
      noProjectSelected: '创建项目以配置项目指令、上下文与提示词。',
      editProfileNameTooltip: '编辑配置文件名称',
      editProjectNameTooltip: '编辑项目名称',
      projectInstructionsPlaceholder: '选填：输入此项目的自定义项目指令（作为系统提示词）...',
    },
    discardModal: {
      title: '确定放弃未保存的表单？',
      description: '本页面有未保存或已填写的表单内容。若现在离开，这些修改将会丢失。您确定要继续吗？',
      discardBtn: '放弃并离开',
      cancelBtn: '取消',
    },
    help: {
      title: '帮助与快捷键',
      shortcuts: '键盘快捷键',
      generateShortcut: '生成内容（工作区）',
      copyShortcut: '复制草稿至剪贴板',
      folderStructure: '配置目录结构',
      folderDesc: '所有配置均存储在本地 "plr-settings" 目录中，内含 /profiles/<名称>/.env 与 /projects/<名称>/(instructions, context, prompts)。',
      contextAndPromptsGuide: '上下文 (Context) 与提示词 (Prompts)',
      contextGuideDesc: '上下文文件 (*.md) 提供背景知识、规格或参考资料，其完整内容会附加到发送给 LLM 的最终提示词中。',
      promptsGuideDesc: '提示词文件 (*.md) 是可重复使用的指令模板，可随时附加到工作区的请求输入框中。',
      contextExampleTitle: '极简上下文文件示例（例：context/product-specs.md）',
      promptExampleTitle: '极简提示词示例（例：prompts/feature-reply.md）',
      envFile: '配置文件 .env 格式',
      envDesc: '每个配置文件文件夹均包含独立的 .env 文件：',
      copy: '复制',
      copied: '已复制！',
    },
    about: {
      title: '关于',
      description: '支持离线运行与上下文及提示词管理的 Personal LLM Runner，具备独立的多配置文件与多项目配置管理功能。',
      version: '版本',
      license: '许可证',
      developer: '开发者',
      sourceCode: '源代码',
      pullRequest: 'Pull request (合并请求)',
      feedback: '建议',
    },
  },
};
