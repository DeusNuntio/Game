/**
 * Typed pub/sub for GameEvent-shaped unions. Rendering, audio, UI, and the save
 * system subscribe here and never call into gameplay/AI internals directly.
 */
export type TypedEvent = { type: string };
export type Listener<TEvent> = (event: TEvent) => void;

export class EventBus<TEvent extends TypedEvent> {
  private listeners = new Map<TEvent['type'], Set<Listener<TEvent>>>();
  private wildcardListeners = new Set<Listener<TEvent>>();

  on<TType extends TEvent['type']>(
    type: TType,
    listener: Listener<Extract<TEvent, { type: TType }>>,
  ): () => void {
    let set = this.listeners.get(type);
    if (!set) {
      set = new Set();
      this.listeners.set(type, set);
    }
    set.add(listener as Listener<TEvent>);
    return () => set!.delete(listener as Listener<TEvent>);
  }

  onAny(listener: Listener<TEvent>): () => void {
    this.wildcardListeners.add(listener);
    return () => this.wildcardListeners.delete(listener);
  }

  emit(event: TEvent): void {
    this.listeners.get(event.type)?.forEach((listener) => listener(event));
    this.wildcardListeners.forEach((listener) => listener(event));
  }

  emitAll(events: TEvent[]): void {
    for (const event of events) {
      this.emit(event);
    }
  }
}
