import type { MetaState } from '@/meta/MetaState';
import type { Screen } from './Screen';
import { makeButton } from './Screen';

const STATUS_LABEL: Record<string, string> = {
  hostile: 'feindlich',
  contested: 'umkämpft',
  liberated: 'befreit',
};

/**
 * Placeholder for the future world map (Gebietsübernahme, Basisbau, Forschung,
 * Händler). Renders the real MetaState data model read-only and proves the
 * "Mission starten" hand-off into the vertical slice — nothing here is a full
 * implementation of those systems.
 */
export class MetaMapScreenStub implements Screen {
  private el: HTMLElement | null = null;

  constructor(
    private readonly metaState: MetaState,
    private readonly onStartMission: (missionId: string) => void,
    private readonly onBack: () => void,
  ) {}

  mount(container: HTMLElement): void {
    this.el = document.createElement('div');
    this.el.className = 'ui-panel screen meta-map';

    const title = document.createElement('h2');
    title.textContent = 'Weltkarte (Platzhalter)';
    this.el.appendChild(title);

    const note = document.createElement('p');
    note.textContent =
      'Bezirksübernahme, Basisbau, Forschung und Händler folgen in einer späteren Iteration. Diese Ansicht zeigt bereits die vorbereitete Datenstruktur.';
    this.el.appendChild(note);

    const resources = document.createElement('p');
    resources.textContent = `Ressourcen — Credits: ${this.metaState.resources.credits}, Intel: ${this.metaState.resources.intel}`;
    this.el.appendChild(resources);

    const list = document.createElement('ul');
    for (const district of this.metaState.worldMap.districts) {
      const item = document.createElement('li');
      const label = document.createElement('span');
      label.textContent = `${district.name} — Status: ${STATUS_LABEL[district.status] ?? district.status} `;
      item.appendChild(label);

      const missionId = district.availableMissionIds[0];
      if (missionId) {
        const startButton = makeButton('Mission starten', () => this.onStartMission(missionId));
        item.appendChild(startButton);
      }
      list.appendChild(item);
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
