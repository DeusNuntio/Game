/**
 * Deliberately decoupled from the gameplay Mission/Objective model shape (added
 * in M11) — callers map their objectives to this plain view model, so this
 * component never needs to change when the mission data model grows.
 */
export interface ObjectiveView {
  id: string;
  description: string;
  complete: boolean;
}

export class ObjectiveTracker {
  private readonly el: HTMLElement;

  constructor(container: HTMLElement) {
    this.el = document.createElement('div');
    this.el.className = 'ui-panel objective-tracker';
    container.appendChild(this.el);
    this.update([]);
  }

  update(objectives: ObjectiveView[]): void {
    this.el.innerHTML = '';
    const title = document.createElement('strong');
    title.textContent = 'Missionsziele';
    this.el.appendChild(title);

    if (objectives.length === 0) {
      const empty = document.createElement('div');
      empty.textContent = 'Keine aktive Mission.';
      this.el.appendChild(empty);
      return;
    }

    const list = document.createElement('ul');
    for (const objective of objectives) {
      const item = document.createElement('li');
      item.textContent = `${objective.complete ? '[x]' : '[ ]'} ${objective.description}`;
      list.appendChild(item);
    }
    this.el.appendChild(list);
  }
}
