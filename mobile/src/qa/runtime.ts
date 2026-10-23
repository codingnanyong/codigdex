export function isQaEnabled(development: boolean, flag: string | undefined): boolean {
  return development && flag === "1";
}

// Expo replaces this literal environment access at bundle time. Release bundles never enable QA.
export const QA_ENABLED = isQaEnabled(typeof __DEV__ !== "undefined" && __DEV__, process.env.EXPO_PUBLIC_QA);
export function isE2eEnabled(qa: boolean, flag: string | undefined): boolean { return qa && flag === "1"; }
export const E2E_ENABLED = isE2eEnabled(QA_ENABLED, process.env.EXPO_PUBLIC_E2E);
export const E2E_REVISION = E2E_ENABLED ? process.env.EXPO_PUBLIC_E2E_REVISION ?? "unknown" : "disabled";

export function createQaFaults(enabled: boolean) {
  let save = false;
  let quiz = false;
  return {
    reset() { save = false; quiz = false; },
    failNextSave() { if (enabled) save = true; },
    failNextQuiz() { if (enabled) quiz = true; },
    beforeSave() { if (save) { save = false; throw new Error("QA: simulated save failure"); } },
    beforeQuiz() { if (quiz) { quiz = false; throw new Error("QA: simulated quiz load failure"); } },
  };
}

export const qaFaults = createQaFaults(QA_ENABLED);
