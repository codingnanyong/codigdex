/** Count decoded PCM bytes rather than compressed file sizes. Active sources retain their own buffer. */
export class AudioBufferCache {
  private readonly entries = new Map<string, AudioBuffer>();
  private bytes = 0;
  constructor(private readonly maxBytes = 8 * 1024 * 1024) {}
  get(key: string) {
    const buffer = this.entries.get(key);
    if (buffer) { this.entries.delete(key); this.entries.set(key, buffer); }
    return buffer;
  }
  set(key: string, buffer: AudioBuffer) {
    const previous = this.entries.get(key);
    if (previous) { this.bytes -= previous.length * previous.numberOfChannels * 4; this.entries.delete(key); }
    const size = buffer.length * buffer.numberOfChannels * 4;
    if (size > this.maxBytes) return; // Native-rate fallback may exceed budget; play without retaining it.
    this.entries.set(key, buffer); this.bytes += size;
    while (this.bytes > this.maxBytes) {
      const oldest = this.entries.keys().next().value!;
      const removed = this.entries.get(oldest)!;
      this.bytes -= removed.length * removed.numberOfChannels * 4;
      this.entries.delete(oldest);
    }
  }
  clear() { this.entries.clear(); this.bytes = 0; }
}
