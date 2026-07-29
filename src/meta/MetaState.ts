import type { WorldMap } from './WorldMap';
import type { Base } from './Base';

/**
 * Root state for the future strategic layer (world map, base building,
 * research, resources, trading). v1 populates just enough to prove the shape
 * and give MetaMapScreenStub something real to render — none of it is
 * consumed by gameplay systems yet. See plan v1 scope notes.
 */
export interface MetaState {
  worldMap: WorldMap;
  base: Base;
  resources: { credits: number; intel: number };
}

export function createInitialMetaState(): MetaState {
  return {
    worldMap: {
      districts: [
        {
          id: 'downtown',
          name: 'Downtown',
          status: 'hostile',
          availableMissionIds: ['mission01'],
        },
      ],
    },
    base: { id: 'safehouse', name: 'Safehouse', facilities: [] },
    resources: { credits: 0, intel: 0 },
  };
}
