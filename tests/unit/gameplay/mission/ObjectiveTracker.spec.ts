import { describe, expect, it } from 'vitest';
import { evaluateObjectives } from '@/gameplay/systems/mission/ObjectiveTracker';
import type { Mission } from '@/gameplay/model/Mission';
import { makeTestState } from '../../helpers/testState';

function withMission(state: ReturnType<typeof makeTestState>, mission: Mission) {
  state.mission = mission;
  return state;
}

describe('evaluateObjectives', () => {
  it('returns an empty list when there is no mission', () => {
    const state = makeTestState();
    expect(evaluateObjectives(state)).toEqual([]);
  });

  it('marks eliminateAll complete once no enemies remain alive', () => {
    const state = withMission(
      makeTestState({
        units: [
          { id: 'p1', faction: 'player', x: 0, y: 0 },
          { id: 'e1', faction: 'enemy', x: 1, y: 0 },
        ],
      }),
      {
        id: 'm1',
        name: 'test',
        status: 'ongoing',
        objectives: [{ id: 'kill', type: 'eliminateAll', description: '', complete: false }],
      },
    );
    expect(evaluateObjectives(state)[0]?.complete).toBe(false);

    state.units.e1!.alive = false;
    expect(evaluateObjectives(state)[0]?.complete).toBe(true);
  });

  it('marks hackConsole complete once the referenced console is hacked', () => {
    const state = withMission(makeTestState(), {
      id: 'm1',
      name: 'test',
      status: 'ongoing',
      objectives: [
        { id: 'hack', type: 'hackConsole', description: '', consoleId: 'c1', complete: false },
      ],
    });
    expect(evaluateObjectives(state)[0]?.complete).toBe(false);

    state.consoles = { c1: { hacked: true, difficulty: 0.5 } };
    expect(evaluateObjectives(state)[0]?.complete).toBe(true);
  });

  it('never un-completes an objective once marked complete', () => {
    const state = withMission(makeTestState(), {
      id: 'm1',
      name: 'test',
      status: 'ongoing',
      objectives: [
        { id: 'hack', type: 'hackConsole', description: '', consoleId: 'c1', complete: true },
      ],
    });
    // no consoles state at all -- would look "not hacked" if re-derived naively
    expect(evaluateObjectives(state)[0]?.complete).toBe(true);
  });
});
