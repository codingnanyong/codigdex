import Phaser from "phaser";
import { LOCALE_NAMES, LOCALES, type Locale } from "@codigdex/game-core/i18n/locale";
import { sceneLocale, setSceneLocale, t } from "../i18n";
import { PALETTE, PALETTE_HEX } from "../palette";
import { pixelText } from "../pixelFont";
import { addShade, applyPixelFontToScene, createButton, drawOrnateFrame, popIn } from "../ui";

export interface SettingsData {
  /** The paused scene underneath, resumed — or rebuilt in the new language — on close. */
  returnTo: string;
  /** Set once a language was picked, so closing rebuilds the scene underneath. */
  languageChanged?: boolean;
}

const PANEL = { width: 460, height: 300 };
const OPTION = { width: 170, height: 40, gap: 20 };

/** A small settings overlay. Today it holds the interface language. */
export class SettingsScene extends Phaser.Scene {
  private returnTo = "intro";
  private languageChanged = false;
  private closing = false;

  constructor() {
    super("settings");
  }

  init(data?: SettingsData) {
    this.returnTo = data?.returnTo ?? this.returnTo;
    this.languageChanged = data?.languageChanged ?? false;
    this.closing = false;
  }

  create() {
    this.scene.bringToTop();
    const { width, height } = this.scale;
    const current = sceneLocale(this);

    addShade(this, 0.62).on("pointerup", () => this.close());

    const frame = drawOrnateFrame(this, 0, 0, PANEL.width, PANEL.height);
    // Swallow clicks on the panel itself so only the shade around it closes settings.
    const panelHitArea = this.add.rectangle(0, 0, PANEL.width, PANEL.height, 0xffffff, 0).setInteractive();
    const title = this.add
      .text(0, -PANEL.height / 2 + 38, t(this, "settings.title"), {
        ...pixelText("subtitle"),
        color: PALETTE_HEX.ink,
      })
      .setOrigin(0.5);
    const label = this.add
      .text(0, -52, t(this, "settings.language"), {
        ...pixelText("body"),
        color: PALETTE_HEX.maroon,
      })
      .setOrigin(0.5);

    const items: Phaser.GameObjects.GameObject[] = [frame, panelHitArea, title, label];
    const totalWidth = LOCALES.length * OPTION.width + (LOCALES.length - 1) * OPTION.gap;
    LOCALES.forEach((locale, index) => {
      const x = -totalWidth / 2 + OPTION.width / 2 + index * (OPTION.width + OPTION.gap);
      const selected = locale === current;
      if (selected) {
        items.push(
          this.add
            .rectangle(x, -6, OPTION.width + 10, OPTION.height + 10)
            .setStrokeStyle(3, PALETTE.amber, 1)
        );
      }
      items.push(
        createButton(
          this,
          x,
          -6,
          OPTION.width,
          OPTION.height,
          `${selected ? "◆ " : ""}${LOCALE_NAMES[locale]}`,
          () => this.choose(locale)
        )
      );
    });

    items.push(
      this.add
        .text(0, 34, t(this, "settings.languageHint"), {
          ...pixelText("caption"),
          color: PALETTE_HEX.mutedBrown,
          align: "center",
          wordWrap: { width: PANEL.width - 60 },
        })
        .setOrigin(0.5, 0),
      createButton(this, 0, PANEL.height / 2 - 34, 120, 34, t(this, "common.close"), () => this.close())
    );

    const panel = this.add.container(width / 2, height / 2, items);
    popIn(this, panel);
    this.input.keyboard?.once("keydown-ESC", () => this.close());
    applyPixelFontToScene(this);
  }

  private choose(locale: Locale) {
    if (locale === sceneLocale(this)) return;
    setSceneLocale(this, locale);
    const data: SettingsData = { returnTo: this.returnTo, languageChanged: true };
    this.scene.restart(data);
  }

  private close() {
    if (this.closing) return;
    this.closing = true;
    this.scene.stop();
    if (this.languageChanged) {
      // Scenes build their text in create(), so rebuilding is what redraws them.
      // Starting without data keeps the scene's previous init data.
      this.scene.stop(this.returnTo);
      this.scene.start(this.returnTo);
    } else {
      this.scene.resume(this.returnTo);
    }
  }
}
