import type { GameState } from '@/gameplay/model/GameState';
import { MissionBuilder } from './builders';

/** A crashed recon drone's flight recorder is worth more than the elite guarding it — eliminate it, or dodge it and grab the box. */
export function createMission14(): GameState {
  const b = new MissionBuilder(9, 6);

  b.groundItem(6, 2, 'black_box');

  b.player({
    id: 'soldier',
    name: 'Soldier',
    template: 'soldier',
    coord: { x: 1, y: 2 },
    weaponId: 'rifle_mk1',
    armorId: 'vest_light',
  });
  b.player({
    id: 'medic',
    name: 'Medic',
    template: 'medic',
    coord: { x: 1, y: 3 },
    weaponId: 'pistol_mk1',
    inventory: ['medkit_small'],
  });

  b.enemy({
    id: 'elite1',
    name: 'Konzern-Elite',
    template: 'elite',
    coord: { x: 5, y: 3 },
    weaponId: 'rifle_mk1',
    armorId: 'vest_heavy',
    patrolRoute: [
      { x: 5, y: 3 },
      { x: 4, y: 3 },
    ],
  });

  b.objective({ id: 'elim', type: 'eliminateAll', description: 'Die Elitewache ausschalten', complete: false });
  b.objective({
    id: 'grab_box',
    type: 'retrieveItem',
    description: 'Den Flugschreiber bergen',
    itemId: 'black_box',
    complete: false,
  });

  return b.build({
    id: 'mission14',
    name: 'Blackout-Protokoll',
    briefing:
      'Eine abgestürzte Aufklärungsdrohne trägt Beweise für den letzten Übergriff des Konzerns in sich. Ein einzelner Elitesoldat bewacht das Wrack — schleicht euch heran oder schaltet ihn aus.',
  });
}
