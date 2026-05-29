"use client";

import { Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import type { TranslationKey } from "@/i18n/dictionaries";
import type { HistoryEntry, HistoryKind } from "@/types/random";
import { formatDateTime } from "@/utils/format";

type HistoryFilter = "all" | HistoryKind;

type HistoryPanelProps = {
  embedded?: boolean;
  history: HistoryEntry[];
  onClear: () => void;
  onDelete: (id: string) => void;
};

const FILTERS: { id: HistoryFilter; labelKey: TranslationKey }[] = [
  { id: "all", labelKey: "history.all" },
  { id: "one-card", labelKey: "history.oneCard" },
  { id: "one-team", labelKey: "history.oneTeam" },
  { id: "two-team", labelKey: "history.twoTeam" },
];

export function HistoryPanel({ embedded = false, history, onClear, onDelete }: HistoryPanelProps) {
  const { language, t } = useI18n();
  const [filter, setFilter] = useState<HistoryFilter>("all");
  const entries = useMemo(
    () => (filter === "all" ? history : history.filter((entry) => entry.kind === filter)),
    [filter, history],
  );

  return (
    <div className={embedded ? "settings-history tab-grid" : "tab-grid"}>
      <section className="workspace-panel history-toolbar">
        <div>
          <p className="screen-kicker">{t("history.timeline")}</p>
          <h2>{t("history.title")}</h2>
        </div>
        <div className="history-actions">
          <div className="segmented-control">
            {FILTERS.map((item) => (
              <button key={item.id} className={filter === item.id ? "is-active" : ""} onClick={() => setFilter(item.id)}>
                {t(item.labelKey)}
              </button>
            ))}
          </div>
          <button className="danger-button" disabled={history.length === 0} onClick={onClear}>
            <Trash2 className="h-4 w-4" />
            {t("history.clear")}
          </button>
        </div>
      </section>

      <section className="history-list">
        {entries.length === 0 ? (
          <div className="workspace-panel empty-stage">
            <Trash2 className="h-14 w-14" />
            <strong>{t("history.emptyTitle")}</strong>
            <span>{t("history.emptyCopy")}</span>
          </div>
        ) : (
          entries.map((entry) => (
            <article key={entry.id} className="workspace-panel timeline-card">
              <div className="timeline-rail" />
              <div className="timeline-content">
                <div className="timeline-head">
                  <div>
                    <span>{entry.kind}</span>
                    <h3>{entry.title}</h3>
                  </div>
                  <button className="small-icon-button" aria-label={t("history.delete")} onClick={() => onDelete(entry.id)}>
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p>{entry.summary}</p>
                <small>{formatDateTime(entry.createdAt, language === "vi" ? "vi-VN" : "en-US")}</small>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
