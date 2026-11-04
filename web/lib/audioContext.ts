/** Match our 24 kHz masters so browsers need not retain upsampled PCM. */
export function createMusicContext(): AudioContext {
  try { return new AudioContext({ sampleRate: 24000 }); }
  catch { return new AudioContext(); } // Some output devices support only their native rate.
}
