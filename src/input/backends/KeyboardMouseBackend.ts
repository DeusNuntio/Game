import type { InputBackend, InputBackendEvent } from '../InputBackend';

export class KeyboardMouseBackend implements InputBackend {
  private onEvent: ((event: InputBackendEvent) => void) | null = null;

  private readonly handlePointerDown = (e: MouseEvent): void => {
    const rect = this.canvas.getBoundingClientRect();
    this.onEvent?.({ type: 'pointerDown', screenX: e.clientX - rect.left, screenY: e.clientY - rect.top });
  };

  private readonly handleKeyDown = (e: KeyboardEvent): void => {
    this.onEvent?.({ type: 'keyDown', key: e.key });
  };

  constructor(private readonly canvas: HTMLCanvasElement) {}

  start(onEvent: (event: InputBackendEvent) => void): void {
    this.onEvent = onEvent;
    this.canvas.addEventListener('mousedown', this.handlePointerDown);
    window.addEventListener('keydown', this.handleKeyDown);
  }

  stop(): void {
    this.canvas.removeEventListener('mousedown', this.handlePointerDown);
    window.removeEventListener('keydown', this.handleKeyDown);
    this.onEvent = null;
  }
}
