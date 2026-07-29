import type { Unit } from '@/gameplay/model/Unit';
import type { GameState } from '@/gameplay/model/GameState';
import type { GameAction } from '@/gameplay/actions/GameAction';

/** Decides a single action for `unit` given the current state. Called repeatedly by AiController until the unit's turn ends. */
export interface EnemyAI {
  decide(unit: Unit, state: GameState): GameAction;
}
