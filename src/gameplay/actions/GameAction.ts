import type { Coord } from '../model/Grid';

export interface MoveAction {
  type: 'move';
  unitId: string;
  to: Coord;
}

/**
 * Discriminated union of every player/AI-issued command. Grows as milestones add
 * systems (endTurn in M3, attack in M2, hack/openDoor in M7, equip in M9, ...).
 * This file is the single source of truth for what GameEngine.dispatch accepts.
 */
export type GameAction = MoveAction;
