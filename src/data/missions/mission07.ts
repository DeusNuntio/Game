import type { GameState } from '@/gameplay/model/GameState';
import { MissionBuilder } from './builders';

/** Black market auction: eliminate the buyers' security, or snatch the lot before anyone notices. */
export function createMission07(): GameState {
  const b = new MissionBuilder(11, 8);

  b.wallLine({ x: 6, y: 1 }, { x: 6, y: 6 }, [{ x: 6, y: 4 }]);
  b.door(6, 4, 'auction_door');

  b.cover(5, 3, 'east', 'full');
  b.cover(5, 5, 'east', 'full');
  b.cover(7, 3, 'west', 'half');
  b.cover(7, 5, 'west', 'half');

  b.groundItem(9, 4, 'auction_lot');

  b.player({ id: 'runner', name: 'Runner', template: 'runner', coord: { x: 1, y: 3 }, weaponId: 'smg_mk1' });
  b.player({
    id: 'soldier',
    name: 'Soldier',
    template: 'soldier',
    coord: { x: 1, y: 5 },
    weaponId: 'rifle_mk1',
    armorId: 'vest_light',
  });

  b.enemy({
    id: 'sniper1',
    name: 'Auktionswache',
    template: 'sniperEnemy',
    coord: { x: 8, y: 2 },
    weaponId: 'rifle_mk1',
    patrolRoute: [
      { x: 8, y: 2 },
      { x: 7, y: 2 },
    ],
  });
  b.enemy({
    id: 'heavy1',
    name: 'Auktionswache',
    template: 'heavyGuard',
    coord: { x: 8, y: 6 },
    weaponId: 'smg_mk1',
    patrolRoute: [
      { x: 8, y: 6 },
      { x: 7, y: 6 },
    ],
  });

  b.objective({ id: 'elim', type: 'eliminateAll', description: 'Die Auktionswachen ausschalten', complete: false });
  b.objective({
    id: 'grab_lot',
    type: 'retrieveItem',
    description: 'Das Auktionsgut bergen',
    itemId: 'auction_lot',
    complete: false,
  });

  return b.build({
    id: 'mission07',
    name: 'Schwarzmarkt-Auktion',
    briefing:
      'Ein Kriegsverbrechen wird meistbietend versteigert. Schnappt euch das Beweisstück, bevor der Zuschlag fällt, oder sprengt die Auktion mit Blei.',
  });
}
