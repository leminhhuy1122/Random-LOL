"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  Clock,
  Dices,
  Languages,
  Search,
  Settings,
  Swords,
} from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import type { Language, TranslationKey } from "@/i18n/dictionaries";

export type AppTabId = "one" | "team" | "player" | "settings";

export type AppTab = {
  id: AppTabId;
  labelKey: TranslationKey;
  shortLabelKey: TranslationKey;
  icon: LucideIcon;
};

const MAIN_TABS: AppTab[] = [
  { id: "one", labelKey: "nav.one", shortLabelKey: "nav.oneShort", icon: Dices },
  { id: "team", labelKey: "nav.team", shortLabelKey: "nav.teamShort", icon: Swords },
  { id: "player", labelKey: "nav.player", shortLabelKey: "nav.playerShort", icon: Search },
];

const SETTINGS_TAB: AppTab = { id: "settings", labelKey: "nav.settings", shortLabelKey: "nav.settingsShort", icon: Settings };

export const APP_TABS: AppTab[] = [
  ...MAIN_TABS,
  SETTINGS_TAB,
];

type AppShellProps = {
  activeTab: AppTabId;
  championCount: number | "...";
  children: React.ReactNode;
  language: Language;
  onLanguageChange: (language: Language) => void;
  onTabChange: (tab: AppTabId) => void;
};

export function AppShell({
  activeTab,
  championCount,
  children,
  language,
  onLanguageChange,
  onTabChange,
}: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { t } = useI18n();
  const active = APP_TABS.find((tab) => tab.id === activeTab) ?? APP_TABS[0];
  const ActiveIcon = active.icon;
  const toggleLabel = sidebarCollapsed ? t("app.expandMenu") : t("app.collapseMenu");

  return (
    <main className={`app-root ${activeTab === "one" ? "mode-cinematic" : ""} ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <div className="app-backdrop" />
      <aside className="app-sidebar">
        <button className="sidebar-toggle" type="button" onClick={() => setSidebarCollapsed((current) => !current)} aria-label={toggleLabel} title={toggleLabel}>
          {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>

        <div className="brand-lockup">
          <div className="brand-mark">R</div>
          <div>
            <strong>{t("app.brandName")}</strong>
            <span>{t("app.brandSubtitle")}</span>
          </div>
        </div>

        <nav className="desktop-nav" aria-label={t("app.navLabel")}>
          {MAIN_TABS.map((tab) => (
            <NavButton
              key={tab.id}
              tab={tab}
              active={tab.id === activeTab}
              compact={false}
              onClick={() => onTabChange(tab.id)}
            />
          ))}
        </nav>

        <div className="sidebar-bottom-area">
          <LanguageSwitcher language={language} onLanguageChange={onLanguageChange} />
          <NavButton
            tab={SETTINGS_TAB}
            active={activeTab === SETTINGS_TAB.id}
            compact={false}
            onClick={() => onTabChange(SETTINGS_TAB.id)}
            variant="secondary"
          />
        </div>
      </aside>

      <section className="app-main">
        <header className="app-header">
          <div>
            <p className="screen-kicker">{t("app.dashboard")}</p>
            <h1>
              <ActiveIcon aria-hidden className="h-7 w-7" />
              {t(active.labelKey)}
            </h1>
          </div>

          <div className="header-metrics">
            <Metric icon={Activity} label={t("app.champions")} value={championCount} />
            <Metric icon={Clock} label={t("app.cache")} value="12h" />
          </div>
        </header>

        <div className="app-content">{children}</div>
      </section>

      <nav className="mobile-nav" aria-label={t("app.mobileNavLabel")}>
        {APP_TABS.map((tab) => (
          <NavButton
            key={tab.id}
            tab={tab}
            active={tab.id === activeTab}
            compact
            onClick={() => onTabChange(tab.id)}
          />
        ))}
      </nav>
    </main>
  );

}

function NavButton({
  active,
  compact,
  onClick,
  tab,
  variant = "primary",
}: {
  active: boolean;
  compact: boolean;
  onClick: () => void;
  tab: AppTab;
  variant?: "primary" | "secondary";
}) {
  const { t } = useI18n();
  const Icon = tab.icon;

  return (
    <button className={`nav-button ${variant === "secondary" ? "is-secondary" : ""} ${active ? "is-active" : ""} ${compact ? "is-compact" : ""}`} onClick={onClick}>
      <Icon aria-hidden className="h-5 w-5" />
      <span>{compact ? t(tab.shortLabelKey) : t(tab.labelKey)}</span>
    </button>
  );
}

function LanguageSwitcher({
  language,
  onLanguageChange,
}: {
  language: Language;
  onLanguageChange: (language: Language) => void;
}) {
  const { t } = useI18n();

  return (
    <section className="sidebar-language-switcher" aria-label={t("settings.language")}>
      <div className="language-switcher-label">
        <Languages className="h-4 w-4" />
        <span>{t("settings.language")}</span>
      </div>
      <div className="language-toggle">
        <button className={language === "en" ? "language-option active" : "language-option"} onClick={() => onLanguageChange("en")} type="button">
          EN
        </button>
        <button className={language === "vi" ? "language-option active" : "language-option"} onClick={() => onLanguageChange("vi")} type="button">
          VI
        </button>
      </div>
    </section>
  );
}

function Metric({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: number | string }) {
  return (
    <div className="metric-pill">
      <Icon aria-hidden className="h-4 w-4" />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
