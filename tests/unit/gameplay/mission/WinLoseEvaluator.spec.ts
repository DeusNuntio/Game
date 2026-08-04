import { describe, expect, it } from 'vitest';
import { evaluateMissionOutcome } from '@/gameplay/systems/mission/WinLoseEvaluator';
import type { Mission } from '@/gameplay/model/Mission';
import { makeTestState } from '../../helpers/testState';

function withMission(state: ReturnType<typeof makeTestState>, mission: Mission) {
  state.mission = mission;
  return state;
}

describe('evaluateMissionOutcome', () => {
  it('is ongoing with no mission attached', () => {
    expect(evaluateMissionOutcome(makeTestState())).toBe('ongoing');
  });

  it('is ongoing while players are alive and no objective is complete', () => {
    const state = withMission(
      makeTestState({ units: [{ id: 'p1', faction: 'player', x: 0, y: 0 }] }),
      { id: 'm1', name: 't', briefing: '', status: 'ongoing', alarmActive: false, objectives: [] },
    );
    expect(evaluateMissionOutcome(state)).toBe('ongoing');
  });

  it('is lost once no player units are alive', () => {
    const state = withMission(
      makeTestState({ units: [{ id: 'p1', faction: 'player', x: 0, y: 0 }] }),
      { id: 'm1', name: 't', briefing: '', status: 'ongoing', alarmActive: false, objectives: [] },
    );
    state.units.p1!.alive = false;
    expect(evaluateMissionOutcome(state)).toBe('lost');
  });

  it('is won once any objective is complete, even with the mission also otherwise losable', () => {
    const state = withMission(
      makeTestState({ units: [{ id: 'p1', faction: 'player', x: 0, y: 0 }] }),
      {
        id: 'm1',
        name: 't',
        briefing: '',
        status: 'ongoing',
        alarmActive: false,
        objectives: [{ id: 'o1', type: 'eliminateAll', description: '', complete: true }],
      },
    );
    expect(evaluateMissionOutcome(state)).toBe('won');
  });
});
