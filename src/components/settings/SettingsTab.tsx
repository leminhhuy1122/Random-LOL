"use client";

import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { REGIONS } from "@/constants/regions";
import { useI18n } from "@/i18n/I18nProvider";
import type { PlatformRegion } from "@/types/player";

export type AppSettings = {
  animationLevel: "full" | "lite";
  defaultRegion: PlatformRegion;
  defaultTeamMode: 1 | 2;
  soundEnabled: boolean;
  theme: "esports" | "rift";
};

type SettingsTabProps = {
  onResetLocalData: () => void;
  onSettingsChange: (settings: AppSettings) => void;
  settings: AppSettings;
};

export function SettingsTab({ onResetLocalData, onSettingsChange, settings }: SettingsTabProps) {
  const { language, setLanguage, t } = useI18n();

  return (
    <div className="tab-grid">
      <section className="workspace-panel settings-hero">
        <div>
          <p className="screen-kicker">{t("settings.kicker")}</p>
          <h2>{t("settings.title")}</h2>
        </div>
        <SlidersHorizontal className="h-12 w-12 text-[color:var(--gold-soft)]" />
      </section>

      <section className="workspace-panel settings-grid">
        <SettingRow title={t("settings.animation")} description={t("settings.animationDescription")}>
          <div className="segmented-control">
            <button
              className={settings.animationLevel === "full" ? "is-active" : ""}
              onClick={() => onSettingsChange({ ...settings, animationLevel: "full" })}
            >
              {t("settings.full")}
            </button>
            <button
              className={settings.animationLevel === "lite" ? "is-active" : ""}
              onClick={() => onSettingsChange({ ...settings, animationLevel: "lite" })}
            >
              {t("settings.lite")}
            </button>
          </div>
        </SettingRow>

        <SettingRow title={t("settings.sound")} description={t("settings.soundDescription")}>
          <label className="switch">
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(event) => onSettingsChange({ ...settings, soundEnabled: event.target.checked })}
            />
            <span />
          </label>
        </SettingRow>

        <SettingRow title={t("settings.language")} description={t("settings.languageDescription")}>
          <div className="segmented-control">
            <button className={language === "en" ? "is-active" : ""} onClick={() => setLanguage("en")}>
              EN
            </button>
            <button className={language === "vi" ? "is-active" : ""} onClick={() => setLanguage("vi")}>
              VI
            </button>
          </div>
        </SettingRow>

        <SettingRow title={t("settings.theme")} description={t("settings.themeDescription")}>
          <select
            className="field"
            value={settings.theme}
            onChange={(event) => onSettingsChange({ ...settings, theme: event.target.value as AppSettings["theme"] })}
          >
            <option value="esports">Esports Gold</option>
            <option value="rift">Blue Rift</option>
          </select>
        </SettingRow>

        <SettingRow title={t("settings.defaultTeam")} description={t("settings.defaultTeamDescription")}>
          <div className="segmented-control">
            <button
              className={settings.defaultTeamMode === 1 ? "is-active" : ""}
              onClick={() => onSettingsChange({ ...settings, defaultTeamMode: 1 })}
            >
              {t("team.oneTeam")}
            </button>
            <button
              className={settings.defaultTeamMode === 2 ? "is-active" : ""}
              onClick={() => onSettingsChange({ ...settings, defaultTeamMode: 2 })}
            >
              {t("team.twoTeam")}
            </button>
          </div>
        </SettingRow>

        <SettingRow title={t("settings.defaultRegion")} description={t("settings.defaultRegionDescription")}>
          <select
            className="field"
            value={settings.defaultRegion}
            onChange={(event) => onSettingsChange({ ...settings, defaultRegion: event.target.value as PlatformRegion })}
          >
            {REGIONS.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </SettingRow>

        <SettingRow title={t("settings.reset")} description={t("settings.resetDescription")}>
          <button className="danger-button" onClick={onResetLocalData}>
            <RotateCcw className="h-4 w-4" />
            {t("settings.resetButton")}
          </button>
        </SettingRow>
      </section>
    </div>
  );
}

function SettingRow({
  children,
  description,
  title,
}: {
  children: React.ReactNode;
  description: string;
  title: string;
}) {
  return (
    <div className="setting-row">
      <div>
        <strong>{title}</strong>
        <span>{description}</span>
      </div>
      {children}
    </div>
  );
}
