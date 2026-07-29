import type { GameState } from '../../model/GameState';
import type { Objective } from '../../model/Mission';

/** Recomputes each objective's `complete` flag from current state. Pure — never mutates. */
export function evaluateObjectives(state: GameState): Objective[] {
  if (!state.mission) return [];

  return state.mission.objectives.map((objective) => {
    if (objective.complete) return objective;

    switch (objective.type) {
      case 'eliminateAll': {
        const anyEnemyAlive = Object.values(state.units).some((u) => u.alive && u.faction === 'enemy');
        return { ...objective, complete: !anyEnemyAlive };
      }
      case 'hackConsole': {
        const hacked = state.consoles?.[objective.consoleId]?.hacked ?? false;
        return { ...objective, complete: hacked };
      }
      default:
        return objective;
    }
  });
}
