import type { AudioManager } from '@/audio/AudioManager';
import type { Screen } from './Screen';
import { makeButton } from './Screen';

export class OptionsScreen implements Screen {
  private el: HTMLElement | null = null;

  constructor(
    private readonly audio: AudioManager,
    private readonly onBack: () => void,
  ) {}

  mount(container: HTMLElement): void {
    this.el = document.createElement('div');
    this.el.className = 'ui-panel screen options-screen';

    const title = document.createElement('h2');
    title.textContent = 'Optionen';
    this.el.appendChild(title);

    const volumeLabel = document.createElement('label');
    volumeLabel.textContent = 'Lautstärke (Platzhalter, noch ohne Sound): ';
    const volumeSlider = document.createElement('input');
    volumeSlider.type = 'range';
    volumeSlider.min = '0';
    volumeSlider.max = '100';
    volumeSlider.value = '75';
    volumeSlider.addEventListener('input', () => {
      this.audio.setMasterVolume(Number(volumeSlider.value) / 100);
    });
    volumeLabel.appendChild(volumeSlider);
    this.el.appendChild(volumeLabel);
    this.el.appendChild(document.createElement('br'));

    const controllerNote = document.createElement('p');
    controllerNote.textContent =
      'Controller-Unterstützung ist vorbereitet (Gamepad-API), aber in dieser Version nicht verdrahtet.';
    this.el.appendChild(controllerNote);

    const back = makeButton('Zurück', this.onBack);
    this.el.appendChild(back);

    container.appendChild(this.el);
  }

  unmount(): void {
    this.el?.remove();
    this.el = null;
  }
}
