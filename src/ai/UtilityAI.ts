import type { Unit } from '@/gameplay/model/Unit';
import type { GameState } from '@/gameplay/model/GameState';
import type { GameAction } from '@/gameplay/actions/GameAction';
import type { EnemyAI } from './EnemyAI';
import { fleeAtLowHp } from './behaviors/FleeAtLowHp';
import { seekCover } from './behaviors/SeekCover';
import { attackIfInRange } from './behaviors/AttackIfInRange';
import { approach } from './behaviors/Approach';

/**
 * Simple priority-ordered FSM (a "utility AI" only in the loose sense that each
 * behavior self-selects by returning null when inapplicable): survive first,
 * then take cover, then shoot, then close distance, then pass. Each behavior is
 * independently swappable/extendable without touching this priority list.
 */
export class UtilityAI implements EnemyAI {
  decide(unit: Unit, state: GameState): GameAction {
    return (
      fleeAtLowHp(unit, state) ??
      seekCover(unit, state) ??
      attackIfInRange(unit, state) ??
      approach(unit, state) ?? { type: 'endTurn', unitId: unit.id }
    );
  }
}
