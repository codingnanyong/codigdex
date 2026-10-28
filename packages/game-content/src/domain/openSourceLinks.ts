import { findOpenSource, type OpenSourceEntry } from "./openSourceCatalog";
import { PLATFORM_STAGE_IDS, FULLSTACK_STAGE_IDS, ML_STAGE_IDS, MLOPS_STAGE_IDS, ANALYTICS_STAGE_IDS } from "./promotionIds";

const link = (stages: readonly string[], tools: readonly (readonly string[])[]) =>
  Object.fromEntries(stages.map((id, i) => [id, tools[i]]));

/** Related learning examples; tool choice is never an unlock or capture requirement. */
export const PROMOTION_OPEN_SOURCE_IDS: Readonly<Record<string, readonly string[]>> = {
  ...link(PLATFORM_STAGE_IDS, [["argo-cd"], ["opentelemetry", "prometheus", "grafana"], ["prometheus", "grafana"], ["opentelemetry", "prometheus"], ["argo-cd", "opentofu", "opentelemetry"]]),
  ...link(FULLSTACK_STAGE_IDS, [["zod"], ["tanstack-query"], ["postgresql"], ["opentelemetry"], ["playwright", "zod", "postgresql"]]),
  ...link(ML_STAGE_IDS, [["scikit-learn"], ["feast", "scikit-learn"], ["scikit-learn"], ["feast", "mlflow"], ["mlflow", "scikit-learn"]]),
  ...link(MLOPS_STAGE_IDS, [["dvc", "mlflow"], ["airflow", "dvc"], ["mlflow"], ["scikit-learn", "prometheus"], ["airflow", "mlflow", "dvc"]]),
  ...link(ANALYTICS_STAGE_IDS, [["postgresql", "dbt-core"], ["great-expectations", "dbt-core"], ["dbt-core", "superset"], ["openlineage", "marquez"], ["dbt-core", "trino", "superset"]]),
};
export function openSourcesForMonster(monsterId: string): readonly OpenSourceEntry[] {
  return (PROMOTION_OPEN_SOURCE_IDS[monsterId] ?? []).flatMap((id) => {
    const entry = findOpenSource(id);
    return entry ? [entry] : [];
  });
}
