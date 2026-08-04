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
      case 'retrieveItem': {
        const carried = Object.values(state.units).some(
          (u) => u.alive && u.faction === 'player' && u.inventory.includes(objective.itemId),
        );
        return { ...objective, complete: carried };
      }
      case 'reachExtraction': {
        const anyoneThere = Object.values(state.units).some((u) => {
          if (!u.alive || u.faction !== 'player') return false;
          const tile = state.grid.tiles.find(
            (t) => t.coord.x === u.coord.x && t.coord.y === u.coord.y,
          );
          return tile?.extractionZoneId === objective.extractionZoneId;
        });
        return { ...objective, complete: anyoneThere };
      }
      case 'puzzleSequence': {
        const steps = Object.values(state.consoles ?? {}).filter(
          (c) => c.puzzleGroupId === objective.puzzleGroupId,
        );
        const allHacked = steps.length > 0 && steps.every((c) => c.hacked);
        return { ...objective, complete: allHacked };
      }
      default:
        return objective;
    }
  });
}
