import type { Faction } from '@/gameplay/model/Unit';
import type { BlockColors } from './IsoShapes';

export type UnitShape = 'circle' | 'triangle' | 'square';

export interface UnitVisual {
  fill: string;
  outline: string;
  glow: string;
  shape: UnitShape;
}

const FACTION_VISUALS: Record<Faction, UnitVisual> = {
  player: { fill: '#00ffc8', outline: '#0a4a3f', glow: '#00ffc8', shape: 'circle' },
  enemy: { fill: '#ff3d68', outline: '#4a0a18', glow: '#ff3d68', shape: 'triangle' },
};

/**
 * Resolves the placeholder visual for a unit. `visualKey` is the future cosmetic
 * skin hook (e.g. a "Dark Horizon" NFT character skin) — for v1 it is accepted
 * but ignored, so plugging in real art later never touches gameplay code.
 */
export function getUnitVisual(faction: Faction, _visualKey?: string): UnitVisual {
  return FACTION_VISUALS[faction];
}

/** Background wash behind the whole scene — dark with a faint magenta/cyan haze, evoking a server-room/back-alley at night. */
export const SCENE_BACKGROUND = {
  top: '#0a0a16',
  bottom: '#140a1e',
};

export const FLOOR_COLORS = {
  base: '#161422',
  circuit: 'rgba(0, 255, 200, 0.25)',
  circuitNode: 'rgba(0, 255, 200, 0.55)',
  objectiveTint: 'rgba(200, 0, 255, 0.12)',
};

export const WALL_BLOCK: BlockColors = {
  top: '#4a4658',
  left: '#2c2a38',
  right: '#221f2c',
  edge: '#00ffc8',
};

export const DOOR_CLOSED_BLOCK: BlockColors = {
  top: '#c98a2e',
  left: '#7a4e14',
  right: '#5c3a0f',
  edge: '#ffb347',
};

export const DOOR_OPEN_BLOCK: BlockColors = {
  top: '#3a2c18',
  left: '#241b0f',
  right: '#1a130a',
  edge: '#6a4a20',
};

export const COVER_COLORS = {
  half: '#e0b400',
  full: '#00b0ff',
} as const;

export const CONSOLE_COLORS = {
  idle: '#c800ff',
  hacked: '#3ddc84',
};

export const LOOT_COLOR = '#ffd23d';
