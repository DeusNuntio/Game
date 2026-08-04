import type { GameState } from '@/gameplay/model/GameState';
import { MissionBuilder } from './builders';

/** Opera house heist: eliminate the undercover security, hack the lockdown console, or make it to the rooftop. */
export function createMission21(): GameState {
  const b = new MissionBuilder(12, 8);

  b.wallLine({ x: 4, y: 1 }, { x: 4, y: 6 }, [{ x: 4, y: 4 }]);
  b.door(4, 4, 'opera_door1');
  b.wallLine({ x: 8, y: 1 }, { x: 8, y: 6 }, [{ x: 8, y: 4 }]);
  b.door(8, 4, 'opera_door2');

  b.cover(3, 3, 'east', 'full');
  b.cover(3, 5, 'east', 'full');
  b.cover(5, 3, 'west', 'half');
  b.cover(5, 5, 'west', 'half');
  b.cover(7, 3, 'east', 'full');
  b.cover(7, 5, 'east', 'full');
  b.cover(9, 3, 'west', 'half');
  b.cover(9, 5, 'west', 'half');

  b.console(6, 2, 'console_opera', { difficulty: 0.5 });
  b.extraction(10, 3, 'rooftop');

  b.player({ id: 'ghost', name: 'Ghost', template: 'ghost', coord: { x: 1, y: 2 }, weaponId: 'pistol_mk1' });
  b.player({ id: 'runner', name: 'Runner', template: 'runner', coord: { x: 1, y: 5 }, weaponId: 'smg_mk1' });

  b.enemy({
    id: 'guard1',
    name: 'Verdeckte Wache',
    template: 'guard',
    coord: { x: 5, y: 5 },
    weaponId: 'pistol_mk1',
    patrolRoute: [
      { x: 5, y: 5 },
      { x: 6, y: 5 },
    ],
  });
  b.enemy({
    id: 'guard2',
    name: 'Verdeckte Wache',
    template: 'guard',
    coord: { x: 7, y: 2 },
    weaponId: 'pistol_mk1',
    patrolRoute: [
      { x: 7, y: 2 },
      { x: 6, y: 2 },
    ],
  });
  b.enemy({
    id: 'sniper1',
    name: 'Dachscharfschütze',
    template: 'sniperEnemy',
    coord: { x: 10, y: 6 },
    weaponId: 'rifle_mk1',
    patrolRoute: [
      { x: 10, y: 6 },
      { x: 9, y: 6 },
    ],
  });

  b.objective({ id: 'elim', type: 'eliminateAll', description: 'Die verdeckten Wachen ausschalten', complete: false });
  b.objective({
    id: 'hack_opera',
    type: 'hackConsole',
    description: 'Die Lockdown-Konsole hacken',
    consoleId: 'console_opera',
    complete: false,
  });
  b.objective({
    id: 'reach_rooftop',
    type: 'reachExtraction',
    description: 'Das Dach erreichen',
    extractionZoneId: 'rooftop',
    complete: false,
  });

  return b.build({
    id: 'mission21',
    name: 'Chrom-Oper',
    briefing:
      'Ein mondäner Opernball tarnt einen Konzern-Deal. Neutralisiert die verdeckte Security, hackt die Lockdown-Konsole für einen ruhigen Abgang, oder flüchtet direkt übers Dach.',
  });
}
