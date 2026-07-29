import type { Screen } from './Screen';
import { makeButton } from './Screen';

export interface MissionListing {
  id: string;
  name: string;
  description: string;
}

export class MissionSelect implements Screen {
  private el: HTMLElement | null = null;

  constructor(
    private readonly missions: MissionListing[],
    private readonly onSelect: (missionId: string) => void,
    private readonly onBack: () => void,
  ) {}

  mount(container: HTMLElement): void {
    this.el = document.createElement('div');
    this.el.className = 'ui-panel screen mission-select';

    const title = document.createElement('h2');
    title.textContent = 'Missionsauswahl';
    this.el.appendChild(title);

    const list = document.createElement('div');
    list.className = 'action-menu';
    for (const mission of this.missions) {
      const button = makeButton(mission.name, () => this.onSelect(mission.id));
      button.title = mission.description;
      list.appendChild(button);
    }
    this.el.appendChild(list);

    const back = makeButton('Zurück', this.onBack);
    this.el.appendChild(back);

    container.appendChild(this.el);
  }

  unmount(): void {
    this.el?.remove();
    this.el = null;
  }
}
