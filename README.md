# Personal LLM Runner (plr)

Personal LLM Runner is an offline-first Single Page Application (SPA) for generating and refining content with LLM APIs (Google Gemini, OpenAI, OpenRouter) and local markdown context and prompts management.

It runs entirely in the browser and requires no backend server. Configuration, context files, and prompts can be stored in browser storage (IndexedDB/localStorage) or synchronized directly to a local directory on your machine using the File System Access API.

Demo: https://manhowong.github.io/plr/

## Technical Overview

- **Stack**: React 19, TypeScript, Vite 8, Tailwind CSS v4.
- **API Communication**: Direct browser-to-API calls. API keys are stored client-side and sent only to the chosen provider.
- **Routing**: Hash-based routing (`#/workspace`, `#/templates`, `#/settings`, etc.) implemented via `window.location.hash` and `hashchange` events to ensure direct links and browser refreshes work on static hosts like GitHub Pages without server-side rewrite rules.
- **Storage Modes**:
  1. *Browser Storage*: IndexedDB and localStorage (default).
  2. *Local Directory Sync*: Reads and writes plain Markdown files and `.env` files to a user-selected folder via the browser's File System Access API (`showDirectoryPicker`).
- **Offline / PWA**: Built with `vite-plugin-pwa` and Service Worker support. The application shell loads offline; LLM generation requires an active network connection.

## Local Folder Structure

When the app is linked to a local folder via the File System Access API, it expects and maintains the following layout:

```text
<selected-folder>/
├── profiles/
│   └── <profile-name>/
│       └── .env                # Provider, model name, and API keys
└── projects/
    └── <project-name>/
        ├── instructions.md     # Optional custom system instructions for this project
        ├── context/            # Markdown context files (appended to prompt)
        │   └── *.md
        └── prompts/            # Reusable markdown saved prompts
            └── *.md
```

### Profile `.env` Format

Each profile directory contains a `.env` file with settings for that profile:

```env
LLM_PROVIDER=gemini
LLM_MODEL=gemini-2.5-flash
GEMINI_API_KEY=your_gemini_api_key_here

# For OpenAI:
# LLM_PROVIDER=openai
# LLM_MODEL=gpt-4o-mini
# OPENAI_API_KEY=your_openai_api_key_here

# For OpenRouter:
# LLM_PROVIDER=openrouter
# LLM_MODEL=meta-llama/llama-3.3-70b-instruct
# OPENROUTER_API_KEY=your_openrouter_api_key_here
```

## Repository Structure

```text
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Pages CI/CD workflow
├── public/                     # Static assets, icons, manifest
├── src/
│   ├── components/             # Reusable UI components
│   │   ├── Banner.tsx          # Status banners
│   │   ├── CodeBlockWithCopy.tsx
│   │   ├── EditableTitleHeader.tsx
│   │   ├── Modal.tsx
│   │   ├── SearchInput.tsx
│   │   ├── Sidebar.tsx
│   │   └── ToastContainer.tsx
│   ├── hooks/                  # Custom React hooks
│   │   ├── useClipboard.ts
│   │   ├── useFormDirtyGuard.ts
│   │   ├── useOnlineStatus.ts
│   │   ├── usePWAInstall.ts
│   │   └── useTimedFlag.ts
│   ├── i18n/                   # Translation strings (en, zh-TW, zh-CN)
│   │   └── translations.ts
│   ├── pages/                  # Top-level views
│   │   ├── WorkspacePage.tsx   # Drafting UI
│   │   ├── SettingsPage.tsx    # Profile & project settings
│   │   ├── ContextPromptsPage.tsx # Context and prompts manager
│   │   ├── HelpPage.tsx        # Keyboard shortcuts and folder documentation
│   │   └── AboutPage.tsx       # Version, links, and license information
│   ├── services/               # Core application logic
│   │   ├── defaultWorkspaceData.ts
│   │   ├── fileSystem.ts       # File System Access API read/write
│   │   ├── folderStorage.ts    # IndexedDB directory handle persistence
│   │   ├── llm.ts              # Provider dispatch and API execution
│   │   └── promptConfig.ts     # Prompt templates and formatting logic
│   ├── utils/
│   │   └── sanitize.ts         # Path/name sanitization
│   ├── types/                  # TypeScript interfaces and ambient types
│   ├── base.css                # CSS variables and tokens
│   ├── main.css                # Component styles
│   ├── responsive.css          # Mobile breakpoint styles
│   ├── index.css               # Stylesheet entry point
│   ├── App.tsx                 # Root application component
│   └── main.tsx                # React DOM entry point
├── index.html                  # HTML entry point
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Development

### Prerequisites

- Node.js 18 or later
- npm (or bun / pnpm)

### Commands

```bash
# Install dependencies
npm install

# Start development server on http://localhost:3000
npm run dev

# Type check
npm run lint

# Production build (outputs to dist/)
npm run build

# Preview production build locally
npm run preview
```

## Deployment (GitHub Pages)

The repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that builds and deploys the project to GitHub Pages on every push to `main` or `master`.

### Base Path

In `vite.config.ts`, Vite sets the production base path using `process.env.BASE_PATH` with a fallback to `'/eda/'`:

```ts
const isProd = command === 'build';
const base = isProd ? (process.env.BASE_PATH || '/eda/') : '/';
```

If deploying under a different repository name or root domain, set the `BASE_PATH` environment variable during build, or adjust `vite.config.ts`.

### Enabling GitHub Pages

1. In your GitHub repository, open **Settings** > **Pages**.
2. Set **Build and deployment > Source** to **GitHub Actions**.
3. Pushes to `main` will trigger the workflow automatically.

## License

Apache License 2.0. See [LICENSE](LICENSE) for details.
