"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  Clock,
  Dices,
  History,
  Languages,
  Search,
  Settings,
  Swords,
} from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import type { TranslationKey } from "@/i18n/dictionaries";

export type AppTabId = "one" | "team" | "player" | "history" | "settings";

export type AppTab = {
  id: AppTabId;
  labelKey: TranslationKey;
  shortLabelKey: TranslationKey;
  icon: LucideIcon;
};

export const APP_TABS: AppTab[] = [
  { id: "one", labelKey: "nav.one", shortLabelKey: "nav.oneShort", icon: Dices },
  { id: "team", labelKey: "nav.team", shortLabelKey: "nav.teamShort", icon: Swords },
  { id: "player", labelKey: "nav.player", shortLabelKey: "nav.playerShort", icon: Search },
  { id: "history", labelKey: "nav.history", shortLabelKey: "nav.historyShort", icon: History },
  { id: "settings", labelKey: "nav.settings", shortLabelKey: "nav.settingsShort", icon: Settings },
];

type AppShellProps = {
  activeTab: AppTabId;
  championCount: number | "...";
  children: React.ReactNode;
  dataStatus: "loading" | "ready" | "error";
  onTabChange: (tab: AppTabId) => void;
  version: string;
};

export function AppShell({
  activeTab,
  championCount,
  children,
  dataStatus,
  onTabChange,
  version,
}: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { language, setLanguage, t } = useI18n();
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
            <strong>Random Rift</strong>
            <span>{t("app.brandSubtitle")}</span>
          </div>
        </div>

        <nav className="desktop-nav" aria-label={t("app.navLabel")}>
          {APP_TABS.map((tab) => (
            <NavButton
              key={tab.id}
              tab={tab}
              active={tab.id === activeTab}
              compact={false}
              onClick={() => onTabChange(tab.id)}
            />
          ))}
        </nav>

        <LanguageSwitch />

        <div className="sidebar-status">
          <div className={`status-dot ${dataStatus}`} />
          <div>
            <span>Data Dragon</span>
            <strong>{dataStatus === "ready" ? t("app.patch", { version }) : dataStatus === "loading" ? t("app.dataLoading") : t("app.dataError")}</strong>
          </div>
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

  function LanguageSwitch() {
    return (
      <div className="language-switch" aria-label={t("app.language")}>
        <Languages className="h-4 w-4" />
        <button className={language === "en" ? "is-active" : ""} onClick={() => setLanguage("en")} title={t("app.english")}>
          EN
        </button>
        <button className={language === "vi" ? "is-active" : ""} onClick={() => setLanguage("vi")} title={t("app.vietnamese")}>
          VI
        </button>
      </div>
    );
  }
}

function NavButton({
  active,
  compact,
  onClick,
  tab,
}: {
  active: boolean;
  compact: boolean;
  onClick: () => void;
  tab: AppTab;
}) {
  const { t } = useI18n();
  const Icon = tab.icon;

  return (
    <button className={`nav-button ${active ? "is-active" : ""} ${compact ? "is-compact" : ""}`} onClick={onClick}>
      <Icon aria-hidden className="h-5 w-5" />
      <span>{compact ? t(tab.shortLabelKey) : t(tab.labelKey)}</span>
    </button>
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
