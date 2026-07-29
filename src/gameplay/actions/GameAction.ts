import type { Coord } from '../model/Grid';

export interface MoveAction {
  type: 'move';
  unitId: string;
  to: Coord;
}

export interface AttackAction {
  type: 'attack';
  attackerId: string;
  targetId: string;
}

export interface EndTurnAction {
  type: 'endTurn';
  unitId: string;
}

/**
 * Discriminated union of every player/AI-issued command. Grows as milestones add
 * systems (hack/openDoor in M7, equip in M9, ...). This file is the single source
 * of truth for what GameEngine.dispatch accepts.
 */
export type GameAction = MoveAction | AttackAction | EndTurnAction;

/** Extracts the id of the unit performing this action, for turn-ownership checks. */
export function actingUnitId(action: GameAction): string {
  switch (action.type) {
    case 'move':
      return action.unitId;
    case 'attack':
      return action.attackerId;
    case 'endTurn':
      return action.unitId;
  }
}
