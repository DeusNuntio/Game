import type { GameState } from '@/gameplay/model/GameState';
import { MissionBuilder } from './builders';

/** Informant meeting gone wrong: eliminate the ambush, or grab the dossier and disappear. */
export function createMission13(): GameState {
  const b = new MissionBuilder(9, 7);

  b.wallLine({ x: 4, y: 1 }, { x: 4, y: 5 }, [{ x: 4, y: 3 }]);
  b.door(4, 3, 'meeting_door');

  b.cover(3, 2, 'east', 'full');
  b.cover(3, 4, 'east', 'full');
  b.cover(5, 2, 'west', 'half');
  b.cover(5, 4, 'west', 'half');

  b.groundItem(7, 3, 'informant_dossier');

  b.player({ id: 'ghost', name: 'Ghost', template: 'ghost', coord: { x: 1, y: 2 }, weaponId: 'pistol_mk1' });
  b.player({ id: 'runner', name: 'Runner', template: 'runner', coord: { x: 1, y: 4 }, weaponId: 'smg_mk1' });

  b.enemy({
    id: 'guard1',
    name: 'Wachposten',
    template: 'guard',
    coord: { x: 6, y: 2 },
    weaponId: 'pistol_mk1',
    patrolRoute: [
      { x: 6, y: 2 },
      { x: 5, y: 2 },
    ],
  });
  b.enemy({
    id: 'guard2',
    name: 'Wachposten',
    template: 'guard',
    coord: { x: 6, y: 4 },
    weaponId: 'pistol_mk1',
    patrolRoute: [
      { x: 6, y: 4 },
      { x: 5, y: 4 },
    ],
  });

  b.objective({ id: 'elim', type: 'eliminateAll', description: 'Den Hinterhalt ausschalten', complete: false });
  b.objective({
    id: 'grab_dossier',
    type: 'retrieveItem',
    description: 'Das Dossier des Informanten bergen',
    itemId: 'informant_dossier',
    complete: false,
  });

  return b.build({
    id: 'mission13',
    name: 'Informantentreffen',
    briefing:
      'Ein Kontakt sollte hier Beweise übergeben — stattdessen wartet eine Falle. Holt das Dossier trotzdem unbemerkt, oder kämpft euch frei.',
  });
}
