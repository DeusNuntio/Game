import type { GameState } from '../../model/GameState';
import type { MissionStatus } from '../../model/Mission';

/**
 * Any single objective complete => won (this is what makes a mission have
 * multiple solutions). All player units down => lost. Otherwise ongoing.
 * Assumes state.mission.objectives has already been refreshed by evaluateObjectives.
 */
export function evaluateMissionOutcome(state: GameState): MissionStatus {
  if (!state.mission) return 'ongoing';

  const anyPlayerAlive = Object.values(state.units).some((u) => u.alive && u.faction === 'player');
  if (!anyPlayerAlive) return 'lost';

  const anyObjectiveComplete = state.mission.objectives.some((o) => o.complete);
  if (anyObjectiveComplete) return 'won';

  return 'ongoing';
}
