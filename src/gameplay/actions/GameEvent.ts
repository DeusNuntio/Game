import type { Coord } from '../model/Grid';
import type { GameAction } from './GameAction';

export interface UnitMovedEvent {
  type: 'unitMoved';
  unitId: string;
  from: Coord;
  to: Coord;
  path: Coord[];
}

export interface TurnStartedEvent {
  type: 'turnStarted';
  round: number;
  unitId: string;
}

export interface TurnEndedEvent {
  type: 'turnEnded';
  unitId: string;
}

export interface RoundStartedEvent {
  type: 'roundStarted';
  round: number;
}

export interface ActionRejectedEvent {
  type: 'actionRejected';
  action: GameAction;
  reason: string;
}

export interface AttackResolvedEvent {
  type: 'attackResolved';
  attackerId: string;
  targetId: string;
  hit: boolean;
  crit: boolean;
  damage: number;
  hitChance: number;
  targetHpAfter: number;
}

export interface UnitDiedEvent {
  type: 'unitDied';
  unitId: string;
}

/**
 * Discriminated union of everything GameEngine can emit. Rendering/audio/UI/save
 * subscribe to these; they never read gameplay internals directly. Grows alongside
 * GameAction as later milestones add systems.
 */
export type GameEvent =
  | UnitMovedEvent
  | TurnStartedEvent
  | TurnEndedEvent
  | RoundStartedEvent
  | ActionRejectedEvent
  | AttackResolvedEvent
  | UnitDiedEvent;
