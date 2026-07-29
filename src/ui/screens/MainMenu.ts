import type { Screen } from './Screen';
import { makeButton } from './Screen';

export interface MainMenuHandlers {
  onNewGame: () => void;
  onContinue: () => void;
  onOptions: () => void;
  hasSave: boolean;
}

export class MainMenu implements Screen {
  private el: HTMLElement | null = null;

  constructor(private readonly handlers: MainMenuHandlers) {}

  mount(container: HTMLElement): void {
    this.el = document.createElement('div');
    this.el.className = 'ui-panel screen main-menu';

    const title = document.createElement('h2');
    title.textContent = 'Dark Horizon';
    this.el.appendChild(title);

    const subtitle = document.createElement('p');
    subtitle.textContent = 'Widerstand gegen Konzerne, Militär und KI.';
    this.el.appendChild(subtitle);

    const newGame = makeButton('Neues Spiel', this.handlers.onNewGame);
    const cont = makeButton('Fortsetzen', this.handlers.onContinue);
    cont.disabled = !this.handlers.hasSave;
    const options = makeButton('Optionen', this.handlers.onOptions);

    const nav = document.createElement('div');
    nav.className = 'action-menu';
    nav.append(newGame, cont, options);
    this.el.appendChild(nav);

    container.appendChild(this.el);
  }

  unmount(): void {
    this.el?.remove();
    this.el = null;
  }
}
