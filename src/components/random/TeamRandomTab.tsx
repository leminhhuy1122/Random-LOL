"use client";

import { Activity, Crosshair, Dices, Radar, ShieldCheck, Swords, Users } from "lucide-react";
import { AssetIcon } from "@/components/ui/AssetIcon";
import { LaneIcon } from "@/components/ui/LaneIcon";
import { LANES, LANE_BY_ID } from "@/constants/lanes";
import { useI18n } from "@/i18n/I18nProvider";
import { getLaneLabel } from "@/i18n/laneLabels";
import type { ChampionPick, LaneId, TeamResult } from "@/types/random";

type TeamRandomTabProps = {
  disabled: boolean;
  isRolling: boolean;
  mode: 1 | 2;
  onModeChange: (mode: 1 | 2) => void;
  onRandom: (mode: 1 | 2) => void;
  onToggleLane: (lane: LaneId) => void;
  selectedLanes: Record<LaneId, boolean>;
  teams: TeamResult[];
};

const FORMATION_LANES: LaneId[] = ["top", "jungle", "mid", "ad", "sp"];

export function TeamRandomTab({
  disabled,
  isRolling,
  mode,
  onModeChange,
  onRandom,
  onToggleLane,
  selectedLanes,
  teams,
}: TeamRandomTabProps) {
  const { language, t } = useI18n();
  const selectedCount = FORMATION_LANES.filter((lane) => selectedLanes[lane]).length;

  return (
    <div className="draft-simulator">
      <section className="draft-command-deck">
        <div className="draft-command-copy">
          <p className="screen-kicker">{t("team.kicker")}</p>
          <h2>{t("team.title")}</h2>
          <span>{t("team.copy")}</span>
        </div>

        <div className="draft-command-actions">
          <div className="draft-mode-switch" aria-label={t("team.modeLabel")}>
            <button className={mode === 1 ? "is-active" : ""} onClick={() => onModeChange(1)}>
              <Users className="h-4 w-4" />
              {t("team.oneTeam")}
            </button>
            <button className={mode === 2 ? "is-active" : ""} onClick={() => onModeChange(2)}>
              <Swords className="h-4 w-4" />
              {t("team.twoTeam")}
            </button>
          </div>

          <button className={`draft-launch-button ${isRolling ? "is-rolling" : ""}`} disabled={disabled || isRolling} onClick={() => onRandom(mode)}>
            {isRolling ? <Dices className="h-6 w-6 animate-spin" /> : <Crosshair className="h-6 w-6" />}
            <span>{isRolling ? t("team.locking") : t("team.generate", { mode })}</span>
          </button>
        </div>
      </section>

      <section className="draft-lane-console" aria-label={t("team.laneFilters")}>
        {LANES.map((lane) => (
          <button
            key={lane.id}
            className={`draft-lane-chip ${selectedLanes[lane.id] ? "is-selected" : ""}`}
            onClick={() => onToggleLane(lane.id)}
          >
            <span className={`draft-lane-orb bg-gradient-to-r ${lane.color}`}>
              <LaneIcon lane={lane.id} />
            </span>
            <strong>{lane.shortLabel}</strong>
            <small>{getLaneLabel(language, lane.id)}</small>
          </button>
        ))}
        <div className="draft-system-readout">
          <Activity className="h-4 w-4" />
          <span>{t("team.lanesArmed", { count: selectedCount || 5 })}</span>
        </div>
      </section>

      <section className={`draft-war-room ${teams.length > 1 ? "is-versus" : ""}`}>
        {teams.length === 0 ? (
          <EmptyDraftTable selectedLanes={selectedLanes} />
        ) : (
          teams.map((team, index) => <DraftTeamTable key={team.id} team={team} index={index} selectedLanes={selectedLanes} />)
        )}
      </section>
    </div>
  );
}

function EmptyDraftTable({ selectedLanes }: { selectedLanes: Record<LaneId, boolean> }) {
  const { t } = useI18n();
  const visibleLanes = getVisibleFormationLanes(selectedLanes);

  return (
    <article className="draft-table is-empty">
      <TacticalMapDecor />
      <div className="draft-table-header">
        <div>
          <p className="screen-kicker">{t("team.emptyKicker")}</p>
          <h3>{t("team.emptyTitle")}</h3>
        </div>
        <span>
          <Radar className="h-4 w-4" />
          {t("team.noLineup")}
        </span>
      </div>

      <div className={`formation-grid role-count-${visibleLanes.length}`}>
        {visibleLanes.map((lane, index) => (
          <FormationSlot key={lane} lane={lane} index={index} />
        ))}
      </div>
    </article>
  );
}

function DraftTeamTable({
  team,
  index,
  selectedLanes,
}: {
  team: TeamResult;
  index: number;
  selectedLanes: Record<LaneId, boolean>;
}) {
  const { t } = useI18n();
  const sideLabel = team.side === "blue" ? t("team.blueSide") : t("team.redSide");
  const sideIcon = team.side === "blue" ? ShieldCheck : Swords;
  const SideIcon = sideIcon;
  const visibleLanes = getVisibleFormationLanes(selectedLanes);

  return (
    <article className={`draft-table ${team.side}`} style={{ animationDelay: `${index * 120}ms` }}>
      <TacticalMapDecor />
      <div className="draft-table-header">
        <div>
          <p className="screen-kicker">{sideLabel}</p>
          <h3>{team.name}</h3>
        </div>
        <span>
          <SideIcon className="h-4 w-4" />
          {t("team.lockedCount", { count: team.picks.length })}
        </span>
      </div>

      <div className={`formation-grid role-count-${visibleLanes.length}`}>
        {visibleLanes.map((lane, slotIndex) => (
          <FormationSlot
            key={lane}
            lane={lane}
            pick={team.picks.find((currentPick) => currentPick.lane === lane)}
            index={slotIndex}
          />
        ))}
      </div>
    </article>
  );
}

function FormationSlot({ lane, pick, index }: { lane: LaneId; pick?: ChampionPick; index: number }) {
  const { t } = useI18n();
  const laneMeta = LANE_BY_ID[lane];

  return (
    <div className={`formation-slot lane-${lane} ${pick ? "is-locked" : "is-empty"}`} style={{ animationDelay: `${index * 110}ms` }}>
      <div className="formation-node">
        <span className={`formation-lane-token bg-gradient-to-r ${laneMeta.color}`}>
          <LaneIcon lane={lane} className="lane-token-icon" />
          {laneMeta.shortLabel}
        </span>

        {pick ? (
          <>
            <img className="formation-champion-art" src={pick.champion.splashUrl} alt={pick.champion.name} loading="lazy" />
            <div className="formation-card-shade" />
            <div className="formation-lock-ring" aria-hidden />
            <div className="formation-champion-content">
              <img className="formation-avatar" src={pick.champion.squareUrl} alt="" loading="lazy" />
              <div>
                <strong>{pick.champion.name}</strong>
                <span>{pick.champion.tags.join(" / ")}</span>
              </div>
            </div>
            <div className="formation-loadout">
              {pick.spells.map((spell) => (
                <AssetIcon key={spell.id} src={spell.iconUrl} alt={spell.name} size="sm" />
              ))}
              <AssetIcon src={pick.boots.iconUrl} alt={pick.boots.name} size="sm" />
            </div>
          </>
        ) : (
          <div className="formation-empty-content">
            <Radar className="h-8 w-8" />
            <strong>{laneMeta.shortLabel}</strong>
            <span>{t("team.slotPending")}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function TacticalMapDecor() {
  return (
    <div className="tactical-map-decor" aria-hidden>
      <span className="rift-lane top" />
      <span className="rift-lane mid" />
      <span className="rift-lane bot" />
      <span className="rift-river" />
    </div>
  );
}

function getVisibleFormationLanes(selectedLanes: Record<LaneId, boolean>) {
  const visibleLanes = FORMATION_LANES.filter((lane) => selectedLanes[lane]);
  return visibleLanes.length > 0 ? visibleLanes : FORMATION_LANES;
}
