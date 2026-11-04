import type { QuizPack } from "./types";

/** Bound retained normalized packs during long sessions; active battles own their questions. */
export class PackCache {
  private readonly entries = new Map<string, Promise<QuizPack>>();
  constructor(private readonly limit = 12) {}
  load(id: string, load: () => Promise<QuizPack>): Promise<QuizPack> {
    const existing = this.entries.get(id);
    if (existing) {
      this.entries.delete(id); this.entries.set(id, existing);
      return existing;
    }
    const pending = Promise.resolve().then(load);
    this.entries.set(id, pending);
    // Include in-flight entries in the bound; a heavily evicted request may load again.
    while (this.entries.size > this.limit) this.entries.delete(this.entries.keys().next().value!);
    void pending.catch(() => { if (this.entries.get(id) === pending) this.entries.delete(id); });
    return pending;
  }
}
