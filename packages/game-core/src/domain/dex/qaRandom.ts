/** Reproducible question draws for UI automation; clients opt in only in development QA. */
export const HOME_QA_SEED = 238;

export function createQaRandom(seed = HOME_QA_SEED): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}
