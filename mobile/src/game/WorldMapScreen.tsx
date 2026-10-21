import { useSave } from "../state/SaveProvider";
import { Screen } from "../ui/Screen";
import { WorldMapView, type WorldMapViewProps } from "./WorldMapView";

export function WorldMapScreen(props: Omit<WorldMapViewProps, "captured" | "locale">) {
  const { locale, save } = useSave();
  return <Screen><WorldMapView {...props} locale={locale} captured={new Set(save.progress.captures.map(({ id }) => id))} /></Screen>;
}
