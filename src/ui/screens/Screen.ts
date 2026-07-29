export interface Screen {
  mount(container: HTMLElement): void;
  unmount(): void;
}

export function makeButton(label: string, onClick: () => void): HTMLButtonElement {
  const button = document.createElement('button');
  button.textContent = label;
  button.addEventListener('click', onClick);
  return button;
}
