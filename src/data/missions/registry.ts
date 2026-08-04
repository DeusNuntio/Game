import type { GameState } from '@/gameplay/model/GameState';
import { createMission01 } from './mission01';
import { createMission02 } from './mission02';
import { createMission03 } from './mission03';
import { createMission04 } from './mission04';
import { createMission05 } from './mission05';
import { createMission06 } from './mission06';
import { createMission07 } from './mission07';
import { createMission08 } from './mission08';
import { createMission09 } from './mission09';
import { createMission10 } from './mission10';
import { createMission11 } from './mission11';
import { createMission12 } from './mission12';
import { createMission13 } from './mission13';
import { createMission14 } from './mission14';
import { createMission15 } from './mission15';
import { createMission16 } from './mission16';
import { createMission17 } from './mission17';
import { createMission18 } from './mission18';
import { createMission19 } from './mission19';
import { createMission20 } from './mission20';
import { createMission21 } from './mission21';

export interface MissionRegistryEntry {
  id: string;
  name: string;
  description: string;
  create: () => GameState;
}

/** Every playable mission, in the order shown on the mission select screen. */
export const MISSION_REGISTRY: MissionRegistryEntry[] = [
  {
    id: 'mission01',
    name: 'Serverraum-Infiltration',
    description: 'Alle Wachen ausschalten ODER die Sicherheitskonsole hacken.',
    create: createMission01,
  },
  {
    id: 'mission02',
    name: 'Datenhafen',
    description: 'Wachen ausschalten ODER die Datenfestplatte stehlen.',
    create: createMission02,
  },
  {
    id: 'mission03',
    name: 'Klinik-Sabotage',
    description: 'Wachen ausschalten ODER die Impfstoffprobe aus dem Tresor bergen.',
    create: createMission03,
  },
  {
    id: 'mission04',
    name: 'Senderturm',
    description: 'Turmbesatzung ausschalten ODER die Sendekonsole hacken.',
    create: createMission04,
  },
  {
    id: 'mission05',
    name: 'Geiselbefreiung',
    description: 'Wachen ausschalten ODER den Peilsender der Geisel bergen.',
    create: createMission05,
  },
  {
    id: 'mission06',
    name: 'Aktenkeller',
    description: 'Wachen ausschalten, Index hacken, ODER die Notizen stehlen.',
    create: createMission06,
  },
  {
    id: 'mission07',
    name: 'Schwarzmarkt-Auktion',
    description: 'Auktionswachen ausschalten ODER das Auktionsgut stehlen.',
    create: createMission07,
  },
  {
    id: 'mission08',
    name: 'Serverfarm-Sabotage',
    description: 'Drohnen ausschalten ODER den Serverkern über eine der zwei Türen erreichen.',
    create: createMission08,
  },
  {
    id: 'mission09',
    name: 'Chemiefabrik',
    description: 'Werksbesatzung ausschalten ODER die Ventilsequenz korrekt hacken.',
    create: createMission09,
  },
  {
    id: 'mission10',
    name: 'Wachturm-Infiltration',
    description: 'Turmbesatzung ausschalten ODER die Turmspitze erreichen.',
    create: createMission10,
  },
  {
    id: 'mission11',
    name: 'U-Bahn-Tunnel',
    description: 'Tunnelpatrouille ausschalten ODER zum anderen Bahnsteig durchbrechen.',
    create: createMission11,
  },
  {
    id: 'mission12',
    name: 'Konzern-Lobby',
    description: 'Wachen ausschalten ODER das Kontobuch aus der Chefetage stehlen.',
    create: createMission12,
  },
  {
    id: 'mission13',
    name: 'Informantentreffen',
    description: 'Den Hinterhalt ausschalten ODER das Dossier unbemerkt bergen.',
    create: createMission13,
  },
  {
    id: 'mission14',
    name: 'Blackout-Protokoll',
    description: 'Die Elitewache ausschalten ODER den Flugschreiber bergen.',
    create: createMission14,
  },
  {
    id: 'mission15',
    name: 'Prototyp-Diebstahl',
    description: 'Laborwachen ausschalten ODER den Prototypkern stehlen.',
    create: createMission15,
  },
  {
    id: 'mission16',
    name: 'Fluchtpunkt',
    description: 'Wachen ausschalten, den Beweischip stehlen, ODER zum Evakuierungspunkt rennen.',
    create: createMission16,
  },
  {
    id: 'mission17',
    name: 'Wartungsschacht',
    description: 'Wachen ausschalten ODER über die keycard-gesicherte Abkürzung zum Ausgang.',
    create: createMission17,
  },
  {
    id: 'mission18',
    name: 'Belagerungsring',
    description: 'Vier Wege: Feuergefecht, Hack, Diebstahl, oder Flucht.',
    create: createMission18,
  },
  {
    id: 'mission19',
    name: 'Datenbunker',
    description: 'Bunkerwachen ausschalten ODER die dreiteilige Konsolensequenz hacken.',
    create: createMission19,
  },
  {
    id: 'mission20',
    name: 'Letzter Ausweg',
    description: 'Die Garnison inklusive Direktor ausschalten ODER zur letzten Extraktion durchbrechen.',
    create: createMission20,
  },
  {
    id: 'mission21',
    name: 'Chrom-Oper',
    description: 'Verdeckte Security ausschalten, Lockdown-Konsole hacken, ODER übers Dach flüchten.',
    create: createMission21,
  },
];

export function findMission(id: string): MissionRegistryEntry | undefined {
  return MISSION_REGISTRY.find((m) => m.id === id);
}
