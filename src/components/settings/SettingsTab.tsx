"use client";

import {
  Brush,
  ChevronDown,
  Database,
  Eraser,
  Globe2,
  Languages,
  RotateCcw,
  Settings2,
  SlidersHorizontal,
  Sparkles,
  Users,
  Volume2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { HistoryPanel } from "@/components/history/HistoryPanel";
import { REGIONS } from "@/constants/regions";
import { useI18n } from "@/i18n/I18nProvider";
import type { Language } from "@/i18n/dictionaries";
import type { PlatformRegion } from "@/types/player";
import type { HistoryEntry } from "@/types/random";

export type AppSettings = {
  animationLevel: "full" | "lite";
  defaultRegion: PlatformRegion;
  defaultTeamMode: 1 | 2;
  language: Language;
  soundEnabled: boolean;
  theme: "esports" | "rift";
};

type SettingsTabProps = {
  history: HistoryEntry[];
  onClearHistory: () => void;
  onDeleteHistory: (id: string) => void;
  onResetLocalData: () => void;
  onResetSettings: () => void;
  onSettingsChange: (settings: AppSettings) => void;
  settings: AppSettings;
};

export function SettingsTab({
  history,
  onClearHistory,
  onDeleteHistory,
  onResetLocalData,
  onResetSettings,
  onSettingsChange,
  settings,
}: SettingsTabProps) {
  const { t } = useI18n();

  return (
    <div className="settings-control-panel">
      <section className="workspace-panel settings-hero">
        <div className="settings-hero-copy">
          <span className="settings-hero-orb">
            <Settings2 className="h-7 w-7" />
          </span>
          <div>
            <p className="screen-kicker">{t("settings.kicker")}</p>
            <h2>{t("settings.pageTitle")}</h2>
            <span>{t("settings.subtitle")}</span>
          </div>
        </div>
        <SlidersHorizontal className="settings-hero-icon h-12 w-12" />
      </section>

      <SettingsSection kicker={t("settings.experienceKicker")} title={t("settings.experience")} icon={Sparkles}>
        <SettingCard icon={Sparkles} title={t("settings.animation")} description={t("settings.animationDescription")}>
          <SegmentedControl
            items={[
              { label: t("settings.full"), value: "full" },
              { label: t("settings.lite"), value: "lite" },
            ]}
            value={settings.animationLevel}
            onChange={(value) => onSettingsChange({ ...settings, animationLevel: value as AppSettings["animationLevel"] })}
          />
        </SettingCard>

        <SettingCard icon={Volume2} title={t("settings.sound")} description={t("settings.soundDescription")}>
          <label className="switch settings-switch">
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(event) => onSettingsChange({ ...settings, soundEnabled: event.target.checked })}
            />
            <span />
            <em>{settings.soundEnabled ? t("settings.on") : t("settings.off")}</em>
          </label>
        </SettingCard>

        <SettingCard icon={Brush} title={t("settings.theme")} description={t("settings.themeDescription")}>
          <CustomSelect
            value={settings.theme}
            items={[
              { label: t("settings.themeEsports"), value: "esports" },
              { label: t("settings.themeRift"), value: "rift" },
            ]}
            onChange={(value) => onSettingsChange({ ...settings, theme: value as AppSettings["theme"] })}
          />
        </SettingCard>

        <SettingCard icon={Users} title={t("settings.defaultTeam")} description={t("settings.defaultTeamDescription")}>
          <SegmentedControl
            items={[
              { label: t("team.oneTeam"), value: "1" },
              { label: t("team.twoTeam"), value: "2" },
            ]}
            value={String(settings.defaultTeamMode)}
            onChange={(value) => onSettingsChange({ ...settings, defaultTeamMode: Number(value) as AppSettings["defaultTeamMode"] })}
          />
        </SettingCard>
      </SettingsSection>

      <SettingsSection kicker={t("settings.localeKicker")} title={t("settings.locale")} icon={Globe2}>
        <SettingCard icon={Languages} title={t("settings.language")} description={t("settings.languageDescription")}>
          <SegmentedControl
            items={[
              { label: "EN", value: "en" },
              { label: "VI", value: "vi" },
            ]}
            value={settings.language}
            onChange={(value) => onSettingsChange({ ...settings, language: value as Language })}
          />
        </SettingCard>

        <SettingCard icon={Globe2} title={t("settings.defaultRegion")} description={t("settings.defaultRegionDescription")}>
          <CustomSelect
            value={settings.defaultRegion}
            items={REGIONS.map((region) => ({ label: region, value: region }))}
            onChange={(value) => onSettingsChange({ ...settings, defaultRegion: value as PlatformRegion })}
          />
        </SettingCard>
      </SettingsSection>

      <SettingsSection kicker={t("settings.dataKicker")} title={t("settings.data")} icon={Database}>
        <SettingCard icon={Eraser} title={t("settings.reset")} description={t("settings.resetDescription")} tone="danger">
          <button className="danger-button settings-danger-button" onClick={onResetLocalData}>
            <Eraser className="h-4 w-4" />
            {t("settings.resetButton")}
          </button>
        </SettingCard>

        <SettingCard icon={RotateCcw} title={t("settings.restoreDefaults")} description={t("settings.restoreDefaultsDescription")}>
          <button className="settings-secondary-button" onClick={onResetSettings}>
            <RotateCcw className="h-4 w-4" />
            {t("settings.restoreDefaultsButton")}
          </button>
        </SettingCard>
      </SettingsSection>

      <HistoryPanel history={history} onDelete={onDeleteHistory} onClear={onClearHistory} embedded />
    </div>
  );
}

function SettingsSection({
  children,
  icon: Icon,
  kicker,
  title,
}: {
  children: React.ReactNode;
  icon: LucideIcon;
  kicker: string;
  title: string;
}) {
  return (
    <section className="settings-section">
      <header className="settings-section-head">
        <div>
          <p className="screen-kicker">{kicker}</p>
          <h3>{title}</h3>
        </div>
        <Icon className="h-5 w-5" />
      </header>
      <div className="settings-card-grid">{children}</div>
    </section>
  );
}

function SettingCard({
  children,
  description,
  icon: Icon,
  title,
  tone,
}: {
  children: React.ReactNode;
  description: string;
  icon: LucideIcon;
  title: string;
  tone?: "danger";
}) {
  return (
    <article className={`setting-card ${tone === "danger" ? "is-danger" : ""}`}>
      <div className="setting-card-icon">
        <Icon className="h-5 w-5" />
      </div>
      <div className="setting-card-copy">
        <strong>{title}</strong>
        <span>{description}</span>
      </div>
      <div className="setting-card-control">{children}</div>
    </article>
  );
}

function SegmentedControl({
  items,
  onChange,
  value,
}: {
  items: Array<{ label: string; value: string }>;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <div className="segmented-control settings-segmented-control">
      {items.map((item) => (
        <button key={item.value} className={value === item.value ? "is-active" : ""} onClick={() => onChange(item.value)} type="button">
          {item.label}
        </button>
      ))}
    </div>
  );
}

function CustomSelect<T extends string>({
  items,
  onChange,
  value,
}: {
  items: Array<{ label: string; value: T }>;
  onChange: (value: T) => void;
  value: T;
}) {
  const [open, setOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const selectedItem = items.find((item) => item.value === value) ?? items[0];
  const locked = items.length <= 1;

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className={`custom-select ${open ? "is-open" : ""}`} ref={selectRef}>
      <button
        aria-disabled={locked}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={`custom-select-trigger ${locked ? "locked" : ""}`}
        onClick={() => {
          if (!locked) setOpen((current) => !current);
        }}
        type="button"
      >
        <span>{selectedItem?.label ?? value}</span>
        {!locked && <ChevronDown className="custom-select-chevron h-4 w-4" />}
      </button>

      {!locked && open && (
        <div className="custom-select-menu" role="listbox">
          {items.map((item) => (
            <button
              aria-selected={item.value === value}
              className={`custom-select-option ${item.value === value ? "active" : ""}`}
              key={item.value}
              onClick={() => {
                onChange(item.value);
                setOpen(false);
              }}
              role="option"
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
