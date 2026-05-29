"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { AlertTriangle, ChevronDown, ScanSearch, TrendingUp, UserRound, X } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import type { PlayerChampionStat, PlayerLookupResult, PlayerMatchItem, RankInfo } from "@/types/player";

type PlayerChampionBannerProps = {
  player?: PlayerLookupResult;
  loading?: boolean;
  error?: {
    message: string;
    code?: string;
  };
};

type BannerStyle = CSSProperties & {
  "--champion-splash"?: string;
};

type PlayerTab = "overview" | "history";
type ChampionModalMode = "played" | "winrate";
type MatchFilter = "all" | "solo" | "flex" | "aram";

const TAB_STORAGE_KEY = "random-rift-player-tab";

const MATCH_FILTERS: Array<{ key: MatchFilter; label: string }> = [
  { key: "all", label: "Tất cả chế độ" },
  { key: "solo", label: "Xếp hạng đơn/đôi" },
  { key: "flex", label: "Linh hoạt 5v5" },
  { key: "aram", label: "ARAM" }
];

const ANALYSIS_ROWS = [
  { key: "combat", label: "Giao tranh" },
  { key: "attack", label: "Tấn công" },
  { key: "farm", label: "Farm" },
  { key: "objective", label: "Mục tiêu" },
  { key: "vision", label: "Tầm nhìn" }
] as const;

export function PlayerChampionBanner({ player, loading = false, error }: PlayerChampionBannerProps) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<PlayerTab>("overview");
  const [imageFailed, setImageFailed] = useState(false);
  const [championModal, setChampionModal] = useState<ChampionModalMode | null>(null);

  const topChampion = player?.topChampion;
  const showChampionBackground = Boolean(topChampion && !imageFailed);
  const bannerStyle: BannerStyle | undefined = showChampionBackground
    ? { "--champion-splash": `url("${topChampion?.splashUrl}")` }
    : undefined;

  useEffect(() => {
    const savedTab = window.localStorage.getItem(TAB_STORAGE_KEY);
    if (savedTab === "overview" || savedTab === "history") {
      setActiveTab(savedTab);
    }
  }, []);

  useEffect(() => {
    setImageFailed(false);
    setChampionModal(null);
  }, [topChampion?.splashUrl, player?.riotId]);

  useEffect(() => {
    if (!championModal) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setChampionModal(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [championModal]);

  const handleTabChange = (tab: PlayerTab) => {
    setActiveTab(tab);
    window.localStorage.setItem(TAB_STORAGE_KEY, tab);
  };

  if (loading) {
    return (
      <article className="player-profile-dashboard is-loading">
        <div className="player-dashboard-glow" />
        <div className="player-dashboard-scan" />
        <div className="player-dashboard-center">
          <div className="hextech-orb">
            <ScanSearch className="h-9 w-9" />
          </div>
          <strong>{t("player.scanning")}</strong>
          <span>{t("player.scanningCopy")}</span>
        </div>
      </article>
    );
  }

  if (error) {
    return (
      <article className="player-profile-dashboard is-error">
        <div className="player-dashboard-glow" />
        <div className="player-dashboard-center">
          <div className="hextech-orb is-error">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <strong>{error.code === "MISSING_API_KEY" ? t("player.missingKey") : t("player.errorTitle")}</strong>
          <span>{error.message}</span>
        </div>
      </article>
    );
  }

  if (!player) {
    return (
      <article className="player-profile-dashboard is-empty">
        <div className="player-dashboard-glow" />
        <div className="player-dashboard-center">
          <div className="hextech-orb">
            <UserRound className="h-9 w-9" />
          </div>
          <strong>{t("player.idleTitle")}</strong>
          <span>{t("player.idleCopy")}</span>
        </div>
      </article>
    );
  }

  return (
    <article
      className={`player-profile-dashboard is-revealed ${showChampionBackground ? "has-champion-art" : "has-fallback-art"}`}
      style={bannerStyle}
    >
      {topChampion && <img className="player-banner-preload" src={topChampion.splashUrl} alt="" onError={() => setImageFailed(true)} />}
      <ProfileHero player={player} showChampionBackground={showChampionBackground} />

      <div className="player-profile-tabs" role="tablist" aria-label="Nội dung tra cứu người chơi">
        <button className={activeTab === "overview" ? "is-active" : ""} type="button" onClick={() => handleTabChange("overview")}>
          Tổng quan
        </button>
        <button className={activeTab === "history" ? "is-active" : ""} type="button" onClick={() => handleTabChange("history")}>
          Lịch sử đấu
        </button>
      </div>

      {activeTab === "overview" ? (
        <OverviewTab player={player} onOpenChampionModal={setChampionModal} />
      ) : (
        <HistoryTab player={player} />
      )}

      {championModal && (
        <ChampionStatsModal
          mode={championModal}
          champions={championModal === "played" ? player.championStats : player.championStats.filter((champion) => champion.games >= 3)}
          onClose={() => setChampionModal(null)}
        />
      )}
    </article>
  );
}

function ProfileHero({ player, showChampionBackground }: { player: PlayerLookupResult; showChampionBackground: boolean }) {
  return (
    <header className="player-profile-hero">
      {showChampionBackground && <div className="player-profile-hero-bg" />}
      <div className="player-profile-hero-overlay" />
      <div className="player-profile-avatar">
        <img src={player.profileIconUrl} alt={player.riotId} />
        <strong>{player.level}</strong>
      </div>
      <div className="player-profile-main">
        <div className="player-name-line">
          <h2>{player.riotId.split("#")[0]}</h2>
          <span>#{player.riotId.split("#")[1] ?? player.region}</span>
        </div>
        <p>
          Cấp {player.level} · {player.region}
          <span className="player-region-pill">Việt Nam</span>
        </p>
        <div className="player-rank-strip">
          <RankSummary title="Đơn/Đôi" rank={player.soloRank} />
          <RankSummary title="Linh Hoạt 5v5" rank={player.flexRank} />
        </div>
      </div>
    </header>
  );
}

function RankSummary({ title, rank }: { title: string; rank?: RankInfo }) {
  return (
    <div className="player-rank-summary">
      <span className="rank-queue-label">{title}</span>
      <img className="rank-emblem" src={getRankEmblemUrl(rank?.tier)} alt={rank ? `${rank.tier} emblem` : "Unranked emblem"} loading="lazy" />
      <strong style={{ color: getRankColor(rank?.tier) }}>{rank ? formatRankVi(rank) : "Chưa xếp hạng"}</strong>
      <small>{rank ? `${rank.leaguePoints} LP` : "0 LP"}</small>
    </div>
  );
}

function OverviewTab({
  player,
  onOpenChampionModal
}: {
  player: PlayerLookupResult;
  onOpenChampionModal: (mode: ChampionModalMode) => void;
}) {
  return (
    <div className="player-overview-grid">
      <section className="player-overview-left">
        <OverviewPanel player={player} />
        <ChampionListPanel
          title="Tướng chơi nhiều nhất"
          champions={player.mostPlayedChampions}
          mode="played"
          onViewAll={() => onOpenChampionModal("played")}
        />
        <ChampionListPanel
          title="Tướng có tỉ lệ thắng cao nhất"
          champions={player.bestWinrateChampions}
          mode="winrate"
          onViewAll={() => onOpenChampionModal("winrate")}
        />
      </section>

      <section className="player-overview-right">
        <RankProgressPanel player={player} />
        <AnalysisPanel player={player} />
      </section>
    </div>
  );
}

function OverviewPanel({ player }: { player: PlayerLookupResult }) {
  const summary = player.performance;

  return (
    <section className="player-data-panel overview-panel">
      <h3>Hiệu suất tổng quan</h3>
      <div className="overview-content">
        <WinrateRing value={summary.winrate} />
        <div className="overview-stats">
          <MetricLine value={summary.games} label="Trận" accent={`${summary.wins}W - ${summary.losses}L`} />
          <MetricLine value={summary.kda} label="KDA" accent={`(${summary.kills} / ${summary.deaths} / ${summary.assists})`} />
          <MetricLine value={summary.csPerMinute} label="CS/phút" />
          <MetricLine value={`+${summary.damagePerMinute}`} label="DNG/phút" />
        </div>
      </div>
    </section>
  );
}

function MetricLine({ value, label, accent }: { value: number | string; label: string; accent?: string }) {
  return (
    <div className="metric-line">
      <strong>{value}</strong>
      <span>{label}</span>
      {accent && <small>{accent}</small>}
    </div>
  );
}

function WinrateRing({ value }: { value: number }) {
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="winrate-ring" style={{ "--ring-offset": offset } as CSSProperties}>
      <svg viewBox="0 0 120 120" aria-hidden>
        <circle cx="60" cy="60" r={radius} />
        <circle cx="60" cy="60" r={radius} strokeDasharray={circumference} strokeDashoffset={offset} />
      </svg>
      <div>
        <strong>{value}%</strong>
        <span>Tỉ lệ thắng</span>
      </div>
    </div>
  );
}

function ChampionListPanel({
  title,
  champions,
  mode,
  onViewAll
}: {
  title: string;
  champions: PlayerChampionStat[];
  mode: ChampionModalMode;
  onViewAll: () => void;
}) {
  const maxGames = Math.max(...champions.map((champion) => champion.games), 1);

  return (
    <section className="player-data-panel champion-list-panel">
      <div className="player-panel-head compact">
        <h3>{title}</h3>
        <button type="button" onClick={onViewAll}>Xem tất cả</button>
      </div>
      <div className="champion-stat-list">
        {champions.length > 0 ? (
          champions.map((champion) => (
            <div className="champion-stat-row" key={`${title}-${champion.championKey}`}>
              <img src={champion.championIconUrl} alt={champion.championName} loading="lazy" />
              <strong>{champion.championName}</strong>
              <span>{champion.games} trận</span>
              <div className="champion-stat-bar">
                <i style={{ width: `${mode === "played" ? (champion.games / maxGames) * 100 : champion.winrate}%` }} />
              </div>
              <em>{mode === "played" ? `${champion.winrate}%` : `${champion.winrate}% (${champion.wins}W)`}</em>
            </div>
          ))
        ) : (
          <div className="player-empty-data">Chưa có đủ dữ liệu tướng.</div>
        )}
      </div>
    </section>
  );
}

function RankProgressPanel({ player }: { player: PlayerLookupResult }) {
  const rank = player.soloRank;
  const rankedMatches = player.matches.filter((match) => match.queueGroup === "solo").slice(0, 12);
  const recentRanked = rankedMatches.length > 0 ? rankedMatches : player.matches.slice(0, 12);
  const winrate = rank ? Math.round((rank.wins / Math.max(rank.wins + rank.losses, 1)) * 1000) / 10 : 0;
  const recentWins = recentRanked.slice(0, 5).filter((match) => match.win).length;

  return (
    <section className="rank-progress-card">
      <div className="rank-progress-top">
        <h3>Xếp hạng đơn/đôi</h3>
        <div className="rank-progress-summary">
          <img className="rank-progress-emblem" src={getRankEmblemUrl(rank?.tier)} alt={rank ? `${rank.tier} emblem` : "Unranked emblem"} loading="lazy" />
          <div className="rank-progress-info">
            <div className="rank-title-line">
              <strong style={{ color: getRankColor(rank?.tier) }}>{formatRankVi(rank)}</strong>
              <span>{rank ? `${rank.leaguePoints} LP` : "0 LP"}</span>
            </div>
            <div className="rank-progress-bar">
              <i style={{ width: `${rank ? Math.max(4, Math.min(rank.leaguePoints, 100)) : 0}%` }} />
            </div>
            <div className="rank-record-row">
              <span>{winrate.toLocaleString("vi-VN")}% tỉ lệ thắng</span>
              <span>{rank ? `${rank.wins} thắng - ${rank.losses} thua` : "0 thắng - 0 thua"}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="rank-progress-chart-area">
        <div className="rank-mini-head">
          <h3>Phong độ xếp hạng gần đây</h3>
          <span>{recentRanked.length > 0 ? `${recentWins} thắng / ${Math.min(5, recentRanked.length)} trận gần nhất` : "Chưa có dữ liệu"}</span>
        </div>
        {recentRanked.length > 0 ? (
          <div className="rank-form-strip">
            {recentRanked.map((match) => (
              <span
                key={match.id}
                className={`rank-form-dot ${match.win ? "is-win" : "is-loss"}`}
                title={`${match.win ? "Thắng" : "Thua"} ${match.championName}`}
              >
                {match.win ? "W" : "L"}
              </span>
            ))}
          </div>
        ) : (
          <div className="player-empty-data">Không có trận xếp hạng gần đây.</div>
        )}
      </div>
    </section>
  );
}

function AnalysisPanel({ player }: { player: PlayerLookupResult }) {
  const summaryRows = [
    { label: "KDA", value: player.performance.kda, percent: Math.min(100, player.performance.kda * 18), top: "42%" },
    { label: "CS/phút", value: player.performance.csPerMinute, percent: Math.min(100, player.performance.csPerMinute * 12), top: "58%" },
    { label: "DNG/phút", value: player.performance.damagePerMinute, percent: Math.min(100, player.performance.damagePerMinute / 8), top: "47%" },
    { label: "KP", value: `${player.performance.killParticipation}%`, percent: player.performance.killParticipation, top: "53%" }
  ];

  return (
    <section className="player-data-panel analysis-panel">
      <div className="player-panel-head">
        <h3>Phân tích hiệu suất</h3>
        <button type="button">So sánh với trung bình <ChevronDown className="h-4 w-4" /></button>
      </div>
      <div className="analysis-summary-card">
        <TrendingUp className="h-5 w-5" />
        <span>{player.performance.winrate >= 50 ? "Phong độ ổn định trong 20 trận gần đây." : "Cần cải thiện nhịp thắng trong các trận gần đây."}</span>
      </div>
      <div className="analysis-performance-bars">
        {ANALYSIS_ROWS.map((row) => (
          <AnalysisMetric
            key={row.key}
            label={row.label}
            value={player.analysis[row.key]}
            percent={player.analysis[row.key]}
            top={`${Math.max(1, 100 - player.analysis[row.key])}%`}
          />
        ))}
        {summaryRows.map((row) => (
          <AnalysisMetric key={row.label} label={row.label} value={row.value} percent={row.percent} top={row.top} />
        ))}
      </div>
    </section>
  );
}

function AnalysisMetric({ label, value, percent, top }: { label: string; value: number | string; percent: number; top: string }) {
  return (
    <div className="analysis-metric">
      <div>
        <span>{label}</span>
        <small>Top {top}</small>
      </div>
      <strong>{value}</strong>
      <i><b style={{ width: `${Math.max(4, Math.min(percent, 100))}%` }} /></i>
    </div>
  );
}

function HistoryTab({ player }: { player: PlayerLookupResult }) {
  const [filter, setFilter] = useState<MatchFilter>("all");
  const [visibleMatches, setVisibleMatches] = useState(8);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [highlightedMatchId, setHighlightedMatchId] = useState<string | null>(null);

  const filteredMatches = useMemo(() => filterMatches(player.matches, filter), [filter, player.matches]);
  const selectedMatch = filteredMatches.find((match) => match.id === selectedMatchId) ?? filteredMatches[0];
  const shownMatches = filteredMatches.slice(0, visibleMatches);

  useEffect(() => {
    setVisibleMatches(8);
    setSelectedMatchId(null);
    setHighlightedMatchId(null);
  }, [filter, player.riotId]);

  return (
    <div className="player-history-grid">
      <section className="player-match-panel is-history">
        <div className="player-panel-head">
          <h3>Lịch sử đấu</h3>
        </div>
        <div className="match-filter-row" aria-label="Lọc lịch sử đấu">
          {MATCH_FILTERS.map((item) => (
            <button
              key={item.key}
              className={filter === item.key ? "is-active" : ""}
              type="button"
              onClick={() => setFilter(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="player-match-list history-list">
          {shownMatches.length > 0 ? (
            shownMatches.map((match) => (
              <MatchRow
                key={match.id}
                match={match}
                active={selectedMatch?.id === match.id || highlightedMatchId === match.id}
                onClick={() => setSelectedMatchId(match.id)}
                onHover={setHighlightedMatchId}
              />
            ))
          ) : (
            <div className="player-empty-data">Không có trận phù hợp với bộ lọc.</div>
          )}
        </div>
        {filteredMatches.length > shownMatches.length && (
          <button className="load-more-matches" type="button" onClick={() => setVisibleMatches((value) => value + 6)}>
            Tải thêm trận đấu
          </button>
        )}
      </section>

      <aside className="history-side-panel">
        <RecentPerformancePanel
          matches={filteredMatches.slice(0, 20)}
          highlightedMatchId={highlightedMatchId}
          onHover={setHighlightedMatchId}
        />
        <MatchDetailPanel match={selectedMatch} />
      </aside>
    </div>
  );
}

function MatchRow({
  match,
  active = false,
  onClick,
  onHover
}: {
  match: PlayerMatchItem;
  active?: boolean;
  onClick?: () => void;
  onHover?: (id: string | null) => void;
}) {
  return (
    <article
      className={`match-row ${match.win ? "is-win" : "is-loss"} ${active ? "is-active" : ""}`}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onMouseEnter={() => onHover?.(match.id)}
      onMouseLeave={() => onHover?.(null)}
      onKeyDown={(event) => {
        if (onClick && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          onClick();
        }
      }}
    >
      <div className="match-champion">
        <img src={match.championIconUrl} alt={match.championName} loading="lazy" />
        <strong>{match.level}</strong>
      </div>
      <div className="match-result">
        <b>{match.win ? "Thắng" : "Thua"}</b>
        <span>{match.championName}</span>
      </div>
      <div className="match-kda">
        <strong>{match.kills} / {match.deaths} / {match.assists}</strong>
        <span>{match.kda.toFixed(2)} KDA</span>
      </div>
      <div className="match-assets">
        <div>
          {match.items.slice(0, 7).map((item, index) => <img key={`${match.id}-item-${index}`} src={item} alt="" loading="lazy" />)}
        </div>
        <div>
          {match.summonerSpells.map((spell, index) => <img key={`${match.id}-spell-${index}`} src={spell} alt="" loading="lazy" />)}
        </div>
      </div>
      <div className="match-meta">
        <span>{match.queueName}</span>
        <small>{timeAgo(match.gameEndedAt)}</small>
        <small>{formatDuration(match.durationSeconds)}</small>
      </div>
    </article>
  );
}

function RecentPerformancePanel({
  matches,
  highlightedMatchId,
  onHover
}: {
  matches: PlayerMatchItem[];
  highlightedMatchId: string | null;
  onHover: (id: string | null) => void;
}) {
  const wins = matches.filter((match) => match.win).length;
  const losses = matches.length - wins;
  const winrate = matches.length > 0 ? Math.round((wins / matches.length) * 100) : 0;
  const mvp = matches.filter((match) => match.isMvp).length;
  const ace = matches.filter((match) => match.isAce).length;

  return (
    <section className="player-data-panel recent-performance-panel">
      <div className="player-panel-head">
        <h3>Phong độ 20 trận gần đây</h3>
        <span>{matches.length} trận</span>
      </div>
      {matches.length > 0 ? (
        <>
          <PerformanceLineChart matches={matches} highlightedMatchId={highlightedMatchId} onHover={onHover} />
          <div className="performance-cards">
            <KpiCard value={`${winrate}%`} label="Tỉ lệ thắng" tone="green" />
            <KpiCard value={`${wins}W - ${losses}L`} label="Kết quả" tone="mixed" />
            <KpiCard value={mvp} label="MVP" />
            <KpiCard value={ace} label="ACE" />
          </div>
        </>
      ) : (
        <div className="player-empty-data">Chưa có dữ liệu phong độ.</div>
      )}
    </section>
  );
}

function PerformanceLineChart({
  matches,
  highlightedMatchId,
  onHover
}: {
  matches: PlayerMatchItem[];
  highlightedMatchId: string | null;
  onHover: (id: string | null) => void;
}) {
  const width = 620;
  const height = 220;
  const paddingX = 28;
  const paddingY = 28;
  const points = [...matches].reverse().map((match, index, source) => {
    const score = Math.max(14, Math.min(96, (match.win ? 58 : 36) + match.kda * 6 + match.killParticipation * 0.12));
    const x = paddingX + (index * (width - paddingX * 2)) / Math.max(source.length - 1, 1);
    const y = height - paddingY - (score / 100) * (height - paddingY * 2);
    return { ...match, x, y, score };
  });
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");

  return (
    <svg className="performance-line-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Biểu đồ phong độ gần đây">
      <line className="rank-lp-midline" x1="22" x2={width - 22} y1={height / 2} y2={height / 2} />
      <path className="rank-lp-path-shadow" d={path} />
      <path className="rank-lp-path" d={path} />
      {points.map((point, index) => (
        <g
          key={point.id}
          onMouseEnter={() => onHover(point.id)}
          onMouseLeave={() => onHover(null)}
        >
          <circle className="chart-hit-area" cx={point.x} cy={point.y} r="16" />
          <circle
            className={`rank-dot ${point.win ? "is-win" : "is-loss"} ${point.id === highlightedMatchId ? "is-highlighted" : ""}`}
            cx={point.x}
            cy={point.y}
            r={point.id === highlightedMatchId ? 8 : 5}
          />
          <text x={point.x} y={height - 6}>{index + 1}</text>
        </g>
      ))}
    </svg>
  );
}

function KpiCard({ value, label, tone }: { value: number | string; label: string; tone?: "green" | "mixed" }) {
  return (
    <div className={`kpi-card ${tone ?? ""}`}>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function MatchDetailPanel({ match }: { match?: PlayerMatchItem }) {
  if (!match) {
    return (
      <section className="player-data-panel match-detail-card">
        <h3>Chi tiết trận đấu</h3>
        <div className="player-empty-data">Chọn một trận để xem chi tiết.</div>
      </section>
    );
  }

  return (
    <section className={`player-data-panel match-detail-card ${match.win ? "is-win" : "is-loss"}`}>
      <div className="match-detail-head">
        <img src={match.championIconUrl} alt={match.championName} loading="lazy" />
        <div>
          <h3>{match.win ? "Chiến thắng" : "Thất bại"} với {match.championName}</h3>
          <span>{match.queueName} · {timeAgo(match.gameEndedAt)} · {formatDuration(match.durationSeconds)}</span>
        </div>
      </div>
      <div className="detail-stat-grid">
        <KpiCard value={`${match.kills}/${match.deaths}/${match.assists}`} label="K/D/A" />
        <KpiCard value={match.kda.toFixed(2)} label="KDA" />
        <KpiCard value={match.csPerMinute} label="CS/phút" />
        <KpiCard value={`${match.killParticipation}%`} label="KP" />
      </div>
      <div className="match-detail-items">
        {match.items.map((item, index) => <img key={`${match.id}-detail-${index}`} src={item} alt="" loading="lazy" />)}
      </div>
    </section>
  );
}

function ChampionStatsModal({
  mode,
  champions,
  onClose
}: {
  mode: ChampionModalMode;
  champions: PlayerChampionStat[];
  onClose: () => void;
}) {
  const sortedChampions = [...champions].sort((a, b) =>
    mode === "played" ? b.games - a.games || b.winrate - a.winrate : b.winrate - a.winrate || b.games - a.games
  );

  return (
    <div className="champion-modal-backdrop" onClick={onClose}>
      <div
        className="champion-modal"
        role="dialog"
        aria-modal="true"
        aria-label={mode === "played" ? "Tướng chơi nhiều nhất" : "Tướng có tỉ lệ thắng cao nhất"}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="champion-modal-head">
          <div>
            <span>{mode === "played" ? "Thống kê theo số trận" : "Tối thiểu 3 trận để xếp hạng"}</span>
            <h3>{mode === "played" ? "Tướng chơi nhiều nhất" : "Tướng có tỉ lệ thắng cao nhất"}</h3>
          </div>
          <button type="button" onClick={onClose} aria-label="Đóng">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="champion-modal-list">
          {sortedChampions.length > 0 ? (
            sortedChampions.map((champion, index) => (
              <div className="champion-modal-row" key={champion.championKey}>
                <span>{index + 1}</span>
                <img src={champion.championIconUrl} alt={champion.championName} loading="lazy" />
                <strong>{champion.championName}</strong>
                <em>{champion.games} trận</em>
                <em>{champion.winrate}% thắng</em>
                <em>{champion.wins}W</em>
                <em>{champion.kda.toFixed(2)} KDA</em>
              </div>
            ))
          ) : (
            <div className="player-empty-data">Chưa có đủ dữ liệu để hiển thị.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function filterMatches(matches: PlayerMatchItem[], filter: MatchFilter) {
  if (filter === "all") return matches;
  return matches.filter((match) => match.queueGroup === filter);
}

function getRankEmblemUrl(tier?: string) {
  const normalizedTier = tier?.toLowerCase() ?? "iron";
  return `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-emblem/emblem-${normalizedTier}.png`;
}

function getRankColor(tier?: string) {
  const colors: Record<string, string> = {
    IRON: "#9ca3af",
    BRONZE: "#c08457",
    SILVER: "#cbd5e1",
    GOLD: "#fbbf24",
    PLATINUM: "#34d399",
    EMERALD: "#4ade80",
    DIAMOND: "#8b5cf6",
    MASTER: "#d946ef",
    GRANDMASTER: "#ef4444",
    CHALLENGER: "#facc15"
  };
  return tier ? colors[tier] ?? "#cbd5e1" : "#9ca3af";
}

function formatRankVi(rank?: RankInfo) {
  if (!rank) return "Chưa xếp hạng";
  const tierNames: Record<string, string> = {
    IRON: "Sắt",
    BRONZE: "Đồng",
    SILVER: "Bạc",
    GOLD: "Vàng",
    PLATINUM: "Bạch kim",
    EMERALD: "Lục bảo",
    DIAMOND: "Kim cương",
    MASTER: "Cao thủ",
    GRANDMASTER: "Đại cao thủ",
    CHALLENGER: "Thách đấu"
  };
  return `${tierNames[rank.tier] ?? rank.tier} ${rank.rank ?? ""}`.trim();
}

function timeAgo(timestamp: number) {
  const diffHours = Math.max(1, Math.round((Date.now() - timestamp) / 3600000));
  if (diffHours < 24) return `Cách đây ${diffHours} giờ`;
  return diffHours < 48 ? "Hôm qua" : `${Math.round(diffHours / 24)} ngày trước`;
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}
