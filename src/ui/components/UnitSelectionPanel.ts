import type { Unit } from '@/gameplay/model/Unit';

const FACTION_LABEL: Record<string, string> = { player: 'Spieler', enemy: 'Gegner' };

export class UnitSelectionPanel {
  private readonly el: HTMLElement;

  constructor(container: HTMLElement) {
    this.el = document.createElement('div');
    this.el.className = 'ui-panel unit-selection-panel';
    container.appendChild(this.el);
    this.update(undefined);
  }

  update(unit: Unit | undefined): void {
    if (!unit) {
      this.el.textContent = 'Keine Einheit ausgewählt.';
      return;
    }
    const label = FACTION_LABEL[unit.faction] ?? unit.faction;
    this.el.textContent =
      `${unit.name} (${label}) — Stufe ${unit.level}, XP ${unit.xp} — ` +
      `HP ${unit.stats.hp}/${unit.stats.maxHp} — AP ${unit.stats.ap}/${unit.stats.maxAp} — ` +
      `Inventar: ${unit.inventory.length}`;
  }
}
