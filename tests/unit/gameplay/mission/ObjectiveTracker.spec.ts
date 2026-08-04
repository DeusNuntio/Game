import { describe, expect, it } from 'vitest';
import { evaluateObjectives } from '@/gameplay/systems/mission/ObjectiveTracker';
import type { Mission } from '@/gameplay/model/Mission';
import { makeTestState } from '../../helpers/testState';

function withMission(state: ReturnType<typeof makeTestState>, mission: Mission) {
  state.mission = mission;
  return state;
}

const BASE_MISSION = { name: 'test', briefing: '', status: 'ongoing', alarmActive: false } as const;

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
        ...BASE_MISSION,
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
      ...BASE_MISSION,
      objectives: [{ id: 'hack', type: 'hackConsole', description: '', consoleId: 'c1', complete: false }],
    });
    expect(evaluateObjectives(state)[0]?.complete).toBe(false);

    state.consoles = { c1: { hacked: true, difficulty: 0.5 } };
    expect(evaluateObjectives(state)[0]?.complete).toBe(true);
  });

  it('never un-completes an objective once marked complete', () => {
    const state = withMission(makeTestState(), {
      id: 'm1',
      ...BASE_MISSION,
      objectives: [{ id: 'hack', type: 'hackConsole', description: '', consoleId: 'c1', complete: true }],
    });
    // no consoles state at all -- would look "not hacked" if re-derived naively
    expect(evaluateObjectives(state)[0]?.complete).toBe(true);
  });

  it('marks retrieveItem complete once any living player unit carries the item', () => {
    const state = withMission(makeTestState({ units: [{ id: 'p1', faction: 'player', x: 0, y: 0 }] }), {
      id: 'm1',
      ...BASE_MISSION,
      objectives: [
        { id: 'grab', type: 'retrieveItem', description: '', itemId: 'data_drive', complete: false },
      ],
    });
    expect(evaluateObjectives(state)[0]?.complete).toBe(false);

    state.units.p1!.inventory.push('data_drive');
    expect(evaluateObjectives(state)[0]?.complete).toBe(true);
  });

  it('marks reachExtraction complete once a living player unit stands on the zone tile', () => {
    const state = withMission(makeTestState({ units: [{ id: 'p1', faction: 'player', x: 0, y: 0 }] }), {
      id: 'm1',
      ...BASE_MISSION,
      objectives: [
        { id: 'extract', type: 'reachExtraction', description: '', extractionZoneId: 'lz1', complete: false },
      ],
    });
    const tile = state.grid.tiles.find((t) => t.coord.x === 2 && t.coord.y === 0)!;
    tile.extractionZoneId = 'lz1';
    expect(evaluateObjectives(state)[0]?.complete).toBe(false);

    state.units.p1!.coord = { x: 2, y: 0 };
    expect(evaluateObjectives(state)[0]?.complete).toBe(true);
  });

  it('marks puzzleSequence complete once every console in the group is hacked', () => {
    const state = withMission(makeTestState(), {
      id: 'm1',
      ...BASE_MISSION,
      objectives: [
        { id: 'relays', type: 'puzzleSequence', description: '', puzzleGroupId: 'relays', complete: false },
      ],
    });
    state.consoles = {
      c1: { hacked: true, difficulty: 0.5, puzzleGroupId: 'relays', sequenceIndex: 0 },
      c2: { hacked: false, difficulty: 0.5, puzzleGroupId: 'relays', sequenceIndex: 1 },
    };
    expect(evaluateObjectives(state)[0]?.complete).toBe(false);

    state.consoles.c2!.hacked = true;
    expect(evaluateObjectives(state)[0]?.complete).toBe(true);
  });
});
