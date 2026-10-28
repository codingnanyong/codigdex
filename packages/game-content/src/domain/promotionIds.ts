/** Stable save IDs; art and translations may change without losing progress. */
export const PLATFORM_STAGE_IDS = [
  "platform-release-ferry", "platform-signal-owl", "platform-budget-keeper",
  "platform-incident-heron", "platform-harbor-guardian",
] as const;

export const FULLSTACK_STAGE_IDS = ["fullstack-contract-fox", "fullstack-session-otter", "fullstack-transaction-pangolin", "fullstack-trace-swallow", "fullstack-bridge-kirin"] as const;
export const ML_STAGE_IDS = ["ml-sample-mouse", "ml-feature-deer", "ml-validation-lynx", "ml-serving-gecko", "ml-model-griffin"] as const;
export const MLOPS_STAGE_IDS = ["mlops-lineage-snail", "mlops-pipeline-beaver", "mlops-registry-tortoise", "mlops-drift-moth", "mlops-cycle-phoenix"] as const;
export const ANALYTICS_STAGE_IDS = ["analytics-grain-sparrow", "analytics-quality-frog", "analytics-metric-lanternfish", "analytics-lineage-stag", "analytics-insight-dragon"] as const;
