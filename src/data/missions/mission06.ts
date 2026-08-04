import type { GameState } from '@/gameplay/model/GameState';
import { MissionBuilder } from './builders';

/** Archive raid: three independent solutions — eliminate, hack the index console, or just grab the notes. */
export function createMission06(): GameState {
  const b = new MissionBuilder(10, 7);

  b.wallLine({ x: 5, y: 1 }, { x: 5, y: 5 }, [{ x: 5, y: 3 }]);
  b.door(5, 3, 'archive_door');

  b.cover(4, 2, 'east', 'full');
  b.cover(4, 4, 'east', 'full');
  b.cover(6, 2, 'west', 'half');
  b.cover(6, 4, 'west', 'half');

  b.groundItem(8, 2, 'research_notes');
  b.console(8, 5, 'console_archive', { difficulty: 0.5 });

  b.player({ id: 'ghost', name: 'Ghost', template: 'ghost', coord: { x: 1, y: 2 }, weaponId: 'pistol_mk1' });
  b.player({ id: 'runner', name: 'Runner', template: 'runner', coord: { x: 1, y: 4 }, weaponId: 'smg_mk1' });

  b.enemy({
    id: 'guard1',
    name: 'Archivwache',
    template: 'guard',
    coord: { x: 7, y: 2 },
    weaponId: 'pistol_mk1',
    patrolRoute: [
      { x: 7, y: 2 },
      { x: 6, y: 2 },
    ],
  });
  b.enemy({
    id: 'guard2',
    name: 'Archivwache',
    template: 'guard',
    coord: { x: 7, y: 4 },
    weaponId: 'pistol_mk1',
    patrolRoute: [
      { x: 7, y: 4 },
      { x: 6, y: 4 },
    ],
  });

  b.objective({ id: 'elim', type: 'eliminateAll', description: 'Alle Wachen ausschalten', complete: false });
  b.objective({
    id: 'hack_archive',
    type: 'hackConsole',
    description: 'Den Archivindex hacken',
    consoleId: 'console_archive',
    complete: false,
  });
  b.objective({
    id: 'grab_notes',
    type: 'retrieveItem',
    description: 'Die gestohlenen Forschungsnotizen bergen',
    itemId: 'research_notes',
    complete: false,
  });

  return b.build({
    id: 'mission06',
    name: 'Aktenkeller',
    briefing:
      'Unterdrückte Forschungsergebnisse liegen in einem Konzern-Archivkeller. Holt die Papierakten direkt, hackt den Index für eine digitale Kopie, oder räumt einfach auf.',
  });
}
