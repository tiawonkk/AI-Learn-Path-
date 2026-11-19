import { TRACK_01 } from '@/data/tracks/track01';
import { TRACK_02 } from '@/data/tracks/track02';
import { TRACK_03 } from '@/data/tracks/track03';
import { TRACK_04 } from '@/data/tracks/track04';
import { TRACK_05 } from '@/data/tracks/track05';
import type {
  ChallengeProgress,
  KyuRank,
  SubModule,
  TrackId,
  TrackSpec,
} from '@/types/curriculum';

export const TRACKS: TrackSpec[] = [
  TRACK_01,
  TRACK_02,
  TRACK_03,
  TRACK_04,
  TRACK_05,
];

export const TRACK_MAP: Record<TrackId, TrackSpec> = {
  'track-01': TRACK_01,
  'track-02': TRACK_02,
  'track-03': TRACK_03,
  'track-04': TRACK_04,
  'track-05': TRACK_05,
};

export const ALL_SUBMODULES: SubModule[] = TRACKS.flatMap((t) => t.subModules);

export const SUBMODULE_MAP: Record<string, SubModule> = Object.fromEntries(
  ALL_SUBMODULES.map((sub) => [sub.id, sub])
);

export const TOTAL_POSSIBLE_XP = ALL_SUBMODULES.reduce(
  (sum, sub) => sum + sub.challenge.xp_reward,
  0
);

export interface RankTier {
  rank: KyuRank;
  title: string;
  minXp: number;
}

export const RANK_TIERS: RankTier[] = [
  { rank: '8 Kyu', title: 'Initiate', minXp: 0 },
  { rank: '7 Kyu', title: 'Python Scripter', minXp: 450 },
  { rank: '6 Kyu', title: 'Python Builder', minXp: 1100 },
  { rank: '5 Kyu', title: 'Data Wrangler', minXp: 2100 },
  { rank: '4 Kyu', title: 'ML Engineer', minXp: 3600 },
  { rank: '3 Kyu', title: 'Deep Architect', minXp: 5400 },
  { rank: '2 Kyu', title: 'Agent Smith', minXp: 7000 },
  { rank: '1 Kyu', title: 'Principal AI', minXp: 8400 },
];

export interface RankProgressInfo {
  rank: KyuRank;
  title: string;
  xp: number;
  nextRank: KyuRank | null;
  nextMinXp: number | null;
  progressPct: number;
  xpToNext: number;
}

export function getRankInfo(xp: number): RankProgressInfo {
  let activeIdx = 0;
  for (let i = 0; i < RANK_TIERS.length; i += 1) {
    if (xp >= RANK_TIERS[i].minXp) {
      activeIdx = i;
    }
  }
  const current = RANK_TIERS[activeIdx];
  const next = activeIdx < RANK_TIERS.length - 1 ? RANK_TIERS[activeIdx + 1] : null;

  if (!next) {
    return {
      rank: current.rank,
      title: current.title,
      xp,
      nextRank: null,
      nextMinXp: null,
      progressPct: 100,
      xpToNext: 0,
    };
  }

  const span = next.minXp - current.minXp;
  const gained = Math.max(0, xp - current.minXp);
  const progressPct = Math.min(100, Math.round((gained / span) * 100));

  return {
    rank: current.rank,
    title: current.title,
    xp,
    nextRank: next.rank,
    nextMinXp: next.minXp,
    progressPct,
    xpToNext: Math.max(0, next.minXp - xp),
  };
}

export function getPreviousSubModule(sub: SubModule): SubModule | null {
  const track = TRACK_MAP[sub.trackId];
  const idx = track.subModules.findIndex((item) => item.id === sub.id);
  return idx > 0 ? track.subModules[idx - 1] : null;
}

export function getNextSubModule(sub: SubModule): SubModule | null {
  const track = TRACK_MAP[sub.trackId];
  const idx = track.subModules.findIndex((item) => item.id === sub.id);
  if (idx >= 0 && idx < track.subModules.length - 1) {
    return track.subModules[idx + 1];
  }
  const trackIdx = TRACKS.findIndex((t) => t.id === sub.trackId);
  if (trackIdx >= 0 && trackIdx < TRACKS.length - 1) {
    return TRACKS[trackIdx + 1].subModules[0] ?? null;
  }
  return null;
}

export function isSubModuleUnlocked(
  _sub: SubModule,
  _challenges: Record<string, ChallengeProgress>
): boolean {
  // All 41 courses across Tracks 01–05 are open for free exploration.
  void _sub;
  void _challenges;
  return true;
}

export function getTrackStats(
  track: TrackSpec,
  challenges: Record<string, ChallengeProgress>
) {
  const total = track.subModules.length;
  let solved = 0;
  let earnedXp = 0;
  let maxXp = 0;

  for (const sub of track.subModules) {
    maxXp += sub.challenge.xp_reward;
    const progress = challenges[sub.id];
    if (progress?.solved) {
      solved += 1;
      earnedXp += progress.xpEarned || sub.challenge.xp_reward;
    }
  }

  const examSub = track.subModules[track.subModules.length - 1];
  const examSolved = Boolean(examSub && challenges[examSub.id]?.solved);
  const pct = total > 0 ? Math.round((solved / total) * 100) : 0;

  return {
    solved,
    total,
    pct,
    earnedXp,
    maxXp,
    examSolved,
    mastered: solved === total && examSolved,
  };
}

export function getContinueLearningTarget(
  challenges: Record<string, ChallengeProgress>,
  preferredSubId?: string
): SubModule {
  if (preferredSubId && SUBMODULE_MAP[preferredSubId]) {
    const pref = SUBMODULE_MAP[preferredSubId];
    if (isSubModuleUnlocked(pref, challenges) && !challenges[pref.id]?.solved) {
      return pref;
    }
  }
  const firstPending = ALL_SUBMODULES.find(
    (sub) => isSubModuleUnlocked(sub, challenges) && !challenges[sub.id]?.solved
  );
  return firstPending ?? SUBMODULE_MAP['1.1'];
}
