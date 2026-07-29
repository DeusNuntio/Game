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

export interface DoorToggledEvent {
  type: 'doorToggled';
  doorId: string;
  open: boolean;
}

export interface ConsoleHackedEvent {
  type: 'consoleHacked';
  consoleId: string;
  unitId: string;
}

export interface ConsoleHackFailedEvent {
  type: 'consoleHackFailed';
  consoleId: string;
  unitId: string;
}

export interface ItemEquippedEvent {
  type: 'itemEquipped';
  unitId: string;
  itemId: string;
  slot: 'weapon' | 'armor';
}

export interface ItemPickedUpEvent {
  type: 'itemPickedUp';
  unitId: string;
  itemId: string;
}

export interface LootDroppedEvent {
  type: 'lootDropped';
  unitId: string;
  coord: Coord;
  itemIds: string[];
}

export interface XpGainedEvent {
  type: 'xpGained';
  unitId: string;
  amount: number;
}

export interface LevelUpEvent {
  type: 'levelUp';
  unitId: string;
  newLevel: number;
}

export interface ObjectiveCompletedEvent {
  type: 'objectiveCompleted';
  objectiveId: string;
}

export interface MissionWonEvent {
  type: 'missionWon';
}

export interface MissionLostEvent {
  type: 'missionLost';
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
  | UnitDiedEvent
  | DoorToggledEvent
  | ConsoleHackedEvent
  | ConsoleHackFailedEvent
  | ItemEquippedEvent
  | ItemPickedUpEvent
  | LootDroppedEvent
  | XpGainedEvent
  | LevelUpEvent
  | ObjectiveCompletedEvent
  | MissionWonEvent
  | MissionLostEvent;
