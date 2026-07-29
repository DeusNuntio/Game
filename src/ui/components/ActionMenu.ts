export interface ActionMenuOption {
  id: string;
  label: string;
  enabled: boolean;
}

/**
 * Generic list of clickable action buttons. Deliberately data-driven (a plain
 * option list, not a hardcoded enum of buttons) so M7 can add "Hacken"/"Tür
 * öffnen" options and M9 an "Ausrüstung" option without touching this class.
 */
export class ActionMenu {
  private readonly el: HTMLElement;
  private activeId: string | null = null;

  constructor(
    container: HTMLElement,
    private readonly onSelect: (id: string) => void,
  ) {
    this.el = document.createElement('div');
    this.el.className = 'ui-panel action-menu';
    container.appendChild(this.el);
  }

  setOptions(options: ActionMenuOption[]): void {
    this.el.innerHTML = '';
    for (const option of options) {
      const button = document.createElement('button');
      button.textContent = option.label;
      button.disabled = !option.enabled;
      button.dataset.actionId = option.id;
      button.className = option.id === this.activeId ? 'active' : '';
      button.addEventListener('click', () => this.onSelect(option.id));
      this.el.appendChild(button);
    }
  }

  setActive(id: string | null): void {
    this.activeId = id;
    for (const button of Array.from(this.el.children)) {
      if (button instanceof HTMLButtonElement) {
        button.classList.toggle('active', button.dataset.actionId === id);
      }
    }
  }
}
