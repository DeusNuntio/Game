import type { GameState } from '@/gameplay/model/GameState';
import { MissionBuilder } from './builders';

/** Warehouse heist: eliminate the dock guards, or slip past them and grab the data drive. */
export function createMission02(): GameState {
  const b = new MissionBuilder(11, 7);

  b.wallLine({ x: 6, y: 1 }, { x: 6, y: 5 }, [{ x: 6, y: 3 }]);
  b.door(6, 3, 'harbor_door');

  b.cover(5, 2, 'east', 'full');
  b.cover(5, 4, 'east', 'full');
  b.cover(7, 2, 'west', 'half');
  b.cover(7, 4, 'west', 'half');

  b.groundItem(9, 2, 'data_drive');

  b.player({
    id: 'runner',
    name: 'Runner',
    template: 'runner',
    coord: { x: 1, y: 2 },
    weaponId: 'smg_mk1',
    inventory: ['medkit_small'],
  });
  b.player({ id: 'ghost', name: 'Ghost', template: 'ghost', coord: { x: 1, y: 4 }, weaponId: 'pistol_mk1' });

  b.enemy({
    id: 'guard1',
    name: 'Hafenwache',
    template: 'guard',
    coord: { x: 8, y: 2 },
    weaponId: 'pistol_mk1',
    patrolRoute: [
      { x: 8, y: 2 },
      { x: 8, y: 3 },
    ],
  });
  b.enemy({
    id: 'guard2',
    name: 'Hafenwache',
    template: 'guard',
    coord: { x: 8, y: 4 },
    weaponId: 'pistol_mk1',
    patrolRoute: [
      { x: 8, y: 4 },
      { x: 9, y: 4 },
    ],
  });

  b.objective({ id: 'elim', type: 'eliminateAll', description: 'Alle Wachen ausschalten', complete: false });
  b.objective({
    id: 'grab_drive',
    type: 'retrieveItem',
    description: 'Die verschlüsselte Datenfestplatte bergen',
    itemId: 'data_drive',
    complete: false,
  });

  return b.build({
    id: 'mission02',
    name: 'Datenhafen',
    briefing:
      'Ein stillgelegtes Hafenlager dient als Zwischenlager für gestohlene Konzerndaten. Schleicht euch an den Wachen vorbei und holt die Festplatte, oder räumt den Hafen mit Gewalt.',
  });
}
