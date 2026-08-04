import type { GameState } from '@/gameplay/model/GameState';
import { MissionBuilder } from './builders';

/** Hostage rescue: wipe out the cell block, or slip in and tag the hostage's beacon. */
export function createMission05(): GameState {
  const b = new MissionBuilder(12, 8);

  b.wallLine({ x: 4, y: 1 }, { x: 4, y: 6 }, [{ x: 4, y: 4 }]);
  b.door(4, 4, 'cell_block_door');
  b.wallLine({ x: 8, y: 1 }, { x: 8, y: 6 }, [{ x: 8, y: 4 }]);
  b.door(8, 4, 'cell_door');

  b.cover(3, 3, 'east', 'full');
  b.cover(3, 5, 'east', 'full');
  b.cover(5, 3, 'west', 'half');
  b.cover(5, 5, 'west', 'half');

  b.groundItem(10, 4, 'hostage_beacon');

  b.player({
    id: 'soldier',
    name: 'Soldier',
    template: 'soldier',
    coord: { x: 1, y: 3 },
    weaponId: 'rifle_mk1',
    armorId: 'vest_light',
  });
  b.player({ id: 'runner', name: 'Runner', template: 'runner', coord: { x: 1, y: 5 }, weaponId: 'pistol_mk1' });

  b.enemy({
    id: 'guard1',
    name: 'Zellenwache',
    template: 'guard',
    coord: { x: 5, y: 3 },
    weaponId: 'pistol_mk1',
    patrolRoute: [
      { x: 5, y: 3 },
      { x: 6, y: 3 },
    ],
  });
  b.enemy({
    id: 'heavy1',
    name: 'Zellenblock-Wache',
    template: 'heavyGuard',
    coord: { x: 9, y: 5 },
    weaponId: 'smg_mk1',
    patrolRoute: [
      { x: 9, y: 5 },
      { x: 10, y: 5 },
    ],
  });

  b.objective({ id: 'elim', type: 'eliminateAll', description: 'Alle Wachen ausschalten', complete: false });
  b.objective({
    id: 'tag_hostage',
    type: 'retrieveItem',
    description: 'Den Geisel-Peilsender bergen',
    itemId: 'hostage_beacon',
    complete: false,
  });

  return b.build({
    id: 'mission05',
    name: 'Geiselbefreiung',
    briefing:
      'Ein Widerstandskämpfer wird im Zellenblock eines Konzern-Außenpostens festgehalten. Findet und markiert seinen Peilsender für die Extraktion, oder brecht mit Gewalt durch.',
  });
}
