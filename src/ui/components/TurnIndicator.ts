import type { GameState } from '@/gameplay/model/GameState';
import { getActiveUnitId } from '@/gameplay/model/GameState';

const FACTION_LABEL: Record<string, string> = { player: 'Spieler', enemy: 'Gegner' };

export class TurnIndicator {
  private readonly el: HTMLElement;

  constructor(container: HTMLElement) {
    this.el = document.createElement('div');
    this.el.className = 'ui-panel turn-indicator';
    container.appendChild(this.el);
  }

  update(state: GameState): void {
    const activeId = getActiveUnitId(state);
    const unit = activeId ? state.units[activeId] : undefined;
    if (!unit) {
      this.el.textContent = `Runde ${state.turn.round}`;
      return;
    }
    const label = FACTION_LABEL[unit.faction] ?? unit.faction;
    this.el.textContent = `Runde ${state.turn.round} — Am Zug: ${unit.name} (${label}) — AP ${unit.stats.ap}/${unit.stats.maxAp}`;
  }
}
