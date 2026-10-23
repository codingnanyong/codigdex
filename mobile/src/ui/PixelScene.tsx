import { Canvas, FilterMode, Image, MipmapMode, useImage } from "@shopify/react-native-skia";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { MOBILE_ASSETS } from "../assets.generated";
import { WALLPAPERS, type Scenery } from "@codigdex/game-assets/visuals";

export type PixelScenery = Scenery;

/** Share the web original, with nearest sampling and whole-step upscaling. */
export function PixelScene({ scene = "field", height, backdrop = false }: { scene?: PixelScenery; height?: number; backdrop?: boolean }) {
  const image = useImage(MOBILE_ASSETS[WALLPAPERS[scene]]);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const ratio = image ? Math.max(size.width / image.width(), size.height / image.height()) : 1;
  const scale = ratio >= 1 ? Math.ceil(ratio) : ratio;
  const width = image ? Math.ceil(image.width() * scale) : 0;
  const imageHeight = image ? Math.ceil(image.height() * scale) : 0;
  return <View pointerEvents="none" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
    onLayout={({ nativeEvent: { layout } }) => setSize((current) => current.width === layout.width && current.height === layout.height ? current : { width: layout.width, height: layout.height })}
    style={[styles.scene, backdrop ? StyleSheet.absoluteFill : { height: height ?? 160 }]}>
    {image && size.width > 0 ? <Canvas style={StyleSheet.absoluteFill}>
      <Image image={image} x={Math.floor((size.width - width) / 2)} y={Math.floor((size.height - imageHeight) / 2)}
        width={width} height={imageHeight} sampling={{ filter: FilterMode.Nearest, mipmap: MipmapMode.None }} />
    </Canvas> : null}
  </View>;
}

const styles = StyleSheet.create({ scene: { overflow: "hidden", backgroundColor: "#f2e5c6" } });
