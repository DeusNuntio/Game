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

export interface OpenDoorAction {
  type: 'openDoor';
  unitId: string;
  doorId: string;
}

export interface HackAction {
  type: 'hack';
  unitId: string;
  consoleId: string;
}

export interface EquipItemAction {
  type: 'equip';
  unitId: string;
  itemId: string;
}

export interface PickupItemAction {
  type: 'pickupItem';
  unitId: string;
  itemId: string;
}

/**
 * Discriminated union of every player/AI-issued command. This file is the single
 * source of truth for what GameEngine.dispatch accepts.
 */
export type GameAction =
  | MoveAction
  | AttackAction
  | EndTurnAction
  | OpenDoorAction
  | HackAction
  | EquipItemAction
  | PickupItemAction;

/** Extracts the id of the unit performing this action, for turn-ownership checks. */
export function actingUnitId(action: GameAction): string {
  switch (action.type) {
    case 'move':
      return action.unitId;
    case 'attack':
      return action.attackerId;
    case 'endTurn':
      return action.unitId;
    case 'openDoor':
      return action.unitId;
    case 'hack':
      return action.unitId;
    case 'equip':
      return action.unitId;
    case 'pickupItem':
      return action.unitId;
  }
}
