import { describe, expect, it } from 'vitest';
import { createInitialMetaState } from '@/meta/MetaState';

describe('createInitialMetaState', () => {
  it('seeds one district with mission01 available', () => {
    const state = createInitialMetaState();
    expect(state.worldMap.districts).toHaveLength(1);
    expect(state.worldMap.districts[0]).toMatchObject({
      status: 'hostile',
      availableMissionIds: ['mission01'],
    });
  });

  it('starts with an empty base and zeroed resources', () => {
    const state = createInitialMetaState();
    expect(state.base.facilities).toEqual([]);
    expect(state.resources).toEqual({ credits: 0, intel: 0 });
  });
});
