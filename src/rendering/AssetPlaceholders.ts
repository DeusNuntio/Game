import type { Faction } from '@/gameplay/model/Unit';

export type UnitShape = 'circle' | 'triangle' | 'square';

export interface UnitVisual {
  fill: string;
  outline: string;
  shape: UnitShape;
}

const FACTION_VISUALS: Record<Faction, UnitVisual> = {
  player: { fill: '#00ffc8', outline: '#005f4d', shape: 'circle' },
  enemy: { fill: '#ff3860', outline: '#5f0018', shape: 'triangle' },
};

/**
 * Resolves the placeholder visual for a unit. `visualKey` is the future cosmetic
 * skin hook (e.g. a "Dark Horizon" NFT character skin) — for v1 it is accepted
 * but ignored, so plugging in real art later never touches gameplay code.
 */
export function getUnitVisual(faction: Faction, _visualKey?: string): UnitVisual {
  return FACTION_VISUALS[faction];
}

export const TILE_COLORS = {
  floor: '#141420',
  wall: '#3a3a4a',
  doorClosed: '#8a5a1a',
  doorOpen: '#3a2a10',
  objective: '#2a1a40',
  gridLine: '#232335',
} as const;

export const COVER_COLORS = {
  half: '#c8a000',
  full: '#00b0ff',
} as const;
