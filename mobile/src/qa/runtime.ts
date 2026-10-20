export function isQaEnabled(development: boolean, flag: string | undefined): boolean {
  return development && flag === "1";
}

// Expo replaces this literal environment access at bundle time. Release bundles never enable QA.
export const QA_ENABLED = isQaEnabled(typeof __DEV__ !== "undefined" && __DEV__, process.env.EXPO_PUBLIC_QA);

export function createQaFaults(enabled: boolean) {
  let save = false;
  let quiz = false;
  return {
    failNextSave() { if (enabled) save = true; },
    failNextQuiz() { if (enabled) quiz = true; },
    beforeSave() { if (save) { save = false; throw new Error("QA: simulated save failure"); } },
    beforeQuiz() { if (quiz) { quiz = false; throw new Error("QA: simulated quiz load failure"); } },
  };
}

export const qaFaults = createQaFaults(QA_ENABLED);
