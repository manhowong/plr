import React, { useState } from 'react';
import { PageTab, WorkspaceState } from '../types';
import { SupportedLanguage, TRANSLATIONS } from '../i18n/translations';
import {
  MessageSquareText,
  Settings,
  Folder,
  HelpCircle,
  Info,
  Globe,
  Menu,
  X,
} from 'lucide-react';

interface SidebarProps {
  activeTab: PageTab;
  setActiveTab: (tab: PageTab) => void;
  workspace: WorkspaceState;
  language: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  workspace,
  language,
  onLanguageChange,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const t = TRANSLATIONS[language];

  const currentLanguageLabel =
    language === 'en' ? 'English' : language === 'zh-TW' ? '繁體中文' : '简体中文';

  const navItems: { id: PageTab; label: string; icon: React.ReactNode }[] = [
    { id: 'workspace', label: t.nav.workspace, icon: <MessageSquareText className="w-4 h-4 shrink-0" /> },
    { id: 'context', label: t.nav.contextPrompts, icon: <Folder className="w-4 h-4 shrink-0" /> },
    { id: 'settings', label: t.nav.settings, icon: <Settings className="w-4 h-4 shrink-0" /> },
  ];

  const hasKey = Boolean(workspace.apiKey && workspace.apiKey.trim().length > 0);
  const activeModel = workspace.modelName?.trim() || '';
  const activeProfile = workspace.activeProfileName?.trim() || '';
  const activeProject = workspace.activeProjectName?.trim() || '';

  const handleNavClick = (tabId: PageTab) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
    setIsLangMenuOpen(false);
  };

  React.useEffect(() => {
    setIsLangMenuOpen(false);
  }, [activeTab]);

  React.useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <aside className={`sidebar-container w-60 border-r border-neutral-200 bg-white flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none ${isMobileMenuOpen ? 'menu-open' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-header p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={`${import.meta.env.BASE_URL}icon.svg`} alt="App Logo" className="w-6 h-6 rounded-md shrink-0" />
            <h1 className="text-sm font-semibold text-neutral-900 tracking-tight">
              {t.appTitle}
            </h1>
          </div>

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="sidebar-mobile-toggle p-1.5 rounded-md text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Collapsible Section (always open on desktop, toggled on mobile) */}
      <div className={`sidebar-collapsible ${isMobileMenuOpen ? 'open' : ''} flex-1 flex flex-col justify-between`}>
        <div className="p-4 pt-0 space-y-4">
          {/* Header Menu: Language Button on Left, Help Button on Right */}
          <div className="space-y-2">
            <div className="header-menu segmented-group w-full h-9 flex">
              {/* Left: Language button */}
              <button
                type="button"
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className={`flex-1 ${isLangMenuOpen ? 'segmented-btn-active' : 'segmented-btn'} flex items-center justify-center gap-1.5 px-2`}
                aria-expanded={isLangMenuOpen}
                aria-label="Toggle language menu"
              >
                <Globe className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate text-xs font-medium">{currentLanguageLabel}</span>
              </button>

              {/* Right: Help button */}
              <button
                type="button"
                onClick={() => handleNavClick('help')}
                className={`flex-1 segmented-btn flex items-center justify-center gap-1.5 px-2`}
                title={t.nav.help}
              >
                <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate text-xs font-medium">{t.nav.help}</span>
              </button>
            </div>

            {/* Expanded Language Toggle: Shown below header menu, pushing things below down */}
            {isLangMenuOpen && (
              <div className="sidebar-lang-section">
                <div className="segmented-group w-full h-9 flex">
                  <button
                    type="button"
                    onClick={() => {
                      onLanguageChange('en');
                      setIsLangMenuOpen(false);
                    }}
                    className={`flex-1 ${language === 'en' ? 'segmented-btn-active' : 'segmented-btn'}`}
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onLanguageChange('zh-TW');
                      setIsLangMenuOpen(false);
                    }}
                    className={`flex-1 ${language === 'zh-TW' ? 'segmented-btn-active' : 'segmented-btn'}`}
                  >
                    繁體
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onLanguageChange('zh-CN');
                      setIsLangMenuOpen(false);
                    }}
                    className={`flex-1 ${language === 'zh-CN' ? 'segmented-btn-active' : 'segmented-btn'}`}
                  >
                    简体
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Main Navigation Links */}
          <nav className="sidebar-nav space-y-0.5">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <a
                  key={item.id}
                  href={`#/${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.id);
                  }}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive
                      ? 'font-medium text-neutral-950 bg-neutral-100'
                      : 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-50'
                  }`}
                >
                  <span className={isActive ? 'text-neutral-950' : 'text-neutral-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </a>
              );
            })}
          </nav>
        </div>

        {/* Bottom Group: About link & Status section */}
        <div className="mt-auto">
          {/* About link */}
          <div className="flex items-center justify-center px-4 py-2">
            <a
              href="#/about"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('about');
              }}
              className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-700 transition-colors"
            >
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>{t.nav.aboutTheApp}</span>
            </a>
          </div>

          {/* Status Section */}
          <div className="sidebar-status h-auto p-4 border-t border-neutral-200 space-y-2 bg-white">
            <div className="text-neutral-400 font-medium uppercase tracking-wider text-[10px]">
              {t.status.title}
            </div>
            <div className="space-y-1.5 text-xs text-neutral-800">
              <div className="flex justify-between items-center">
                <span className="text-neutral-500">{t.status.project}:</span>
                <span className="font-medium text-neutral-900 truncate max-w-[120px]" title={activeProject || t.status.none}>
                  {activeProject || t.status.none}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500">{t.status.profile}:</span>
                <span className="font-medium text-neutral-900 truncate max-w-[120px]" title={activeProfile || t.status.none}>
                  {activeProfile || t.status.none}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500">{t.status.key}:</span>
                <span className="font-medium text-neutral-900">
                  {hasKey ? t.status.provided : t.status.notProvided}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-500">{t.status.model}:</span>
                <span className="font-medium text-neutral-900 truncate max-w-[120px] font-mono text-[11px]" title={activeModel || t.status.none}>
                  {activeModel || t.status.none}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
