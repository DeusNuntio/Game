import type { GameState } from '@/gameplay/model/GameState';
import { MissionBuilder } from './builders';

/** Finale: the resistance's boldest strike. Eliminate the garrison and its boss, or sprint straight for extraction. */
export function createMission20(): GameState {
  const b = new MissionBuilder(13, 9);

  b.wallLine({ x: 4, y: 1 }, { x: 4, y: 7 }, [{ x: 4, y: 4 }]);
  b.door(4, 4, 'final_door1');
  b.wallLine({ x: 9, y: 1 }, { x: 9, y: 7 }, [{ x: 9, y: 4 }]);
  b.door(9, 4, 'final_door2');

  b.cover(3, 3, 'east', 'full');
  b.cover(3, 5, 'east', 'full');
  b.cover(5, 3, 'west', 'half');
  b.cover(5, 5, 'west', 'half');
  b.cover(8, 3, 'east', 'full');
  b.cover(8, 5, 'east', 'full');
  b.cover(10, 3, 'west', 'half');
  b.cover(10, 5, 'west', 'half');

  b.extraction(11, 4, 'final_evac');

  b.player({
    id: 'soldier',
    name: 'Soldier',
    template: 'soldier',
    coord: { x: 1, y: 2 },
    weaponId: 'rifle_mk1',
    armorId: 'vest_heavy',
  });
  b.player({ id: 'runner', name: 'Runner', template: 'runner', coord: { x: 1, y: 4 }, weaponId: 'smg_mk1' });
  b.player({ id: 'ghost', name: 'Ghost', template: 'ghost', coord: { x: 1, y: 6 }, weaponId: 'pistol_mk1' });

  b.enemy({
    id: 'heavy1',
    name: 'Elitegarde',
    template: 'heavyGuard',
    coord: { x: 6, y: 2 },
    weaponId: 'smg_mk1',
    patrolRoute: [
      { x: 6, y: 2 },
      { x: 7, y: 2 },
    ],
  });
  b.enemy({
    id: 'heavy2',
    name: 'Elitegarde',
    template: 'heavyGuard',
    coord: { x: 6, y: 6 },
    weaponId: 'smg_mk1',
    patrolRoute: [
      { x: 6, y: 6 },
      { x: 7, y: 6 },
    ],
  });
  b.enemy({
    id: 'guard1',
    name: 'Wachposten',
    template: 'guard',
    coord: { x: 11, y: 2 },
    weaponId: 'pistol_mk1',
    patrolRoute: [
      { x: 11, y: 2 },
      { x: 11, y: 3 },
    ],
  });
  b.enemy({
    id: 'boss',
    name: 'Konzern-Direktor (bewaffnet)',
    template: 'elite',
    coord: { x: 10, y: 4 },
    weaponId: 'rifle_mk1',
    armorId: 'vest_heavy',
  });

  b.objective({
    id: 'elim',
    type: 'eliminateAll',
    description: 'Die gesamte Garnison inklusive Direktor ausschalten',
    complete: false,
  });
  b.objective({
    id: 'reach_evac',
    type: 'reachExtraction',
    description: 'Den finalen Evakuierungspunkt erreichen',
    extractionZoneId: 'final_evac',
    complete: false,
  });

  return b.build({
    id: 'mission20',
    name: 'Letzter Ausweg',
    briefing:
      'Der Widerstand schlägt gegen das Hauptquartier des Konzerns zu. Räumt die Garnison komplett aus, oder durchbrecht die Linien und erreicht die letzte Extraktion, bevor Verstärkung eintrifft.',
  });
}
