import type { GameState } from '@/gameplay/model/GameState';
import { MissionBuilder } from './builders';

/** Three ways out: eliminate the guards, grab the evidence chip, or just run for the evac point. */
export function createMission16(): GameState {
  const b = new MissionBuilder(10, 7);

  b.wallLine({ x: 5, y: 1 }, { x: 5, y: 5 }, [{ x: 5, y: 3 }]);
  b.door(5, 3, 'evac_corridor_door');

  b.cover(4, 2, 'east', 'full');
  b.cover(4, 4, 'east', 'full');
  b.cover(6, 2, 'west', 'half');
  b.cover(6, 4, 'west', 'half');

  b.extraction(8, 5, 'evac');
  b.groundItem(8, 2, 'evidence_chip');

  b.player({ id: 'runner', name: 'Runner', template: 'runner', coord: { x: 1, y: 2 }, weaponId: 'smg_mk1' });
  b.player({
    id: 'soldier',
    name: 'Soldier',
    template: 'soldier',
    coord: { x: 1, y: 4 },
    weaponId: 'rifle_mk1',
    armorId: 'vest_light',
  });

  b.enemy({
    id: 'guard1',
    name: 'Sicherheitswache',
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
    name: 'Sicherheitswache',
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
    id: 'reach_evac',
    type: 'reachExtraction',
    description: 'Den Evakuierungspunkt erreichen',
    extractionZoneId: 'evac',
    complete: false,
  });
  b.objective({
    id: 'grab_evidence',
    type: 'retrieveItem',
    description: 'Den Beweischip bergen',
    itemId: 'evidence_chip',
    complete: false,
  });

  return b.build({
    id: 'mission16',
    name: 'Fluchtpunkt',
    briefing:
      'Ein früherer Job ist aufgeflogen — Zeit zu verschwinden. Schnappt euch den Beweischip auf dem Weg raus, kämpft euch frei, oder rennt einfach zum Evakuierungspunkt.',
  });
}
