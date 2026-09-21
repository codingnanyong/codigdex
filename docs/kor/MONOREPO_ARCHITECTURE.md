# 모노레포 아키텍처

**한국어** · [English](../eng/MONOREPO_ARCHITECTURE.md)

Codigdex는 하나의 저장소 안에서 패키지마다 소유 범위를 나눠 관리합니다. 네트워크로
연결된 마이크로서비스가 아니라 모듈형 모놀리식 구조입니다. web과 mobile은 동일하게
결정적인 게임 규칙과 콘텐츠를 사용해야 하지만, 렌더링과 디바이스 연동 방식은 서로
다르기 때문입니다.

```text
codigdex/
├─ web/                       Next.js + Phaser 웹 애플리케이션
├─ mobile/                    Expo(SDK 57) + React Native 애플리케이션
└─ packages/
   ├─ game-assets/            아트 원본 파일 + 생성된 에셋 키 매니페스트
   ├─ game-core/              규칙, 도메인 타입, 세이브 스키마/마이그레이션
   ├─ game-content/           몬스터, 퀴즈, 챕터, 직업
   └─ game-i18n/              번역된 UI 메시지 카탈로그
```

## 의존성 방향

```text
web ────────┐
mobile ─────┼──> game-content ──> game-core
            ├──> game-i18n ─────> game-core
            ├───────────────────> game-core
            └───────────────────> game-assets
```

- `game-core`는 플랫폼 중립을 유지해야 하며, 다른 워크스페이스를 import할 수 없습니다.
- `game-content`는 `game-core`만 import할 수 있습니다.
- `game-i18n`은 `game-core`의 로케일 계약만 import할 수 있습니다.
- `game-assets`는 다른 워크스페이스를 import할 수 없습니다.

## 에셋

아트는 `packages/game-assets/files/`에 두고 **에셋 키**(해당 폴더 기준 상대 경로,
예: `monsters/ch01.git/sprout-lv1.png`)로 참조합니다. 공유 패키지는 에셋 키만
저장하고 `/assets/...` URL이나 번들러 import는 절대 저장하지 않으므로, 각 클라이언트가
에셋을 어떻게 제공할지 스스로 결정할 수 있습니다. `check:boundaries`는 공유 패키지에
들어온 URL 형태의 에셋 경로를 거부합니다.

- **web**은 `dev`와 `build` 전에 `web/scripts/sync-assets.mjs`를 실행해 파일을
  git에서 무시되는 `web/public/assets/`로 복사하고, `web/lib/assets.ts`의
  `assetUrl()`로 키를 해석합니다.
- **mobile**은 Metro가 동적 `require()` 호출을 해석하지 못하므로
  `mobile/scripts/generate-asset-map.mjs`를 실행합니다. 이 스크립트는
  `packages/game-assets/src/manifest.generated.ts`에서 키 목록을 읽어 키마다
  정적 `require()`를 만들고, 저장소에 커밋되는
  `mobile/src/assets.generated.ts`로 출력합니다. `mobile/src/assets.ts`의
  `mobileAssetSource()`가 그 맵으로 키를 해석합니다. 이 생성기는 `npm start`
  전에 `prestart`로 실행되고, 모바일 `typecheck`에서는 `--check`로 실행되어
  커밋된 맵이 낡았으면 실패합니다.
- 아트를 추가·이름 변경·삭제한 뒤에는
  `npm run generate --workspace @codigdex/game-assets`를 실행합니다. 매니페스트가
  낡은 상태면 `typecheck`가 실패합니다.
- 렌더링, 내비게이션, 입력, 오디오, 분석, 영속성 어댑터는 앱이 담당합니다. 공유
  패키지는 Phaser, React, Next.js, Expo, `window`, `document`, 특정 디바이스 저장소
  API를 import해서는 안 됩니다.
- 새 패키지는 코드가 안정적인 공개 계약을 갖추고 소비자가 둘 이상일 때만 만듭니다.
  기능 전용 UI는 해당 앱 안에 둡니다.

## 모바일 구현

`mobile/`은 워크스페이스 패키지를 직접 사용하는 Expo SDK 57 애플리케이션입니다
(React Native 0.86, React 19). 자세한 내용은 `mobile/README.md`를 참고하세요.

- **내비게이션**은 `mobile/app/` 아래의 Expo Router 파일 기반 라우팅이며,
  `app.json`에서 `typedRoutes`를 켜 두었습니다. 구현된 경로는 `/`(인트로),
  `/dex`(도감 그리드), `/dex/[id]`(몬스터 카드), `/settings`(언어 선택)입니다.
- **Phaser는 재사용하지 않습니다.** 모바일 화면은 순수 React Native
  컴포넌트이며, 이 워크스페이스에는 캔버스도 WebView도 Phaser 의존성도 없습니다.
  웹의 씬 클래스는 `web/`에 그대로 둡니다. 두 클라이언트가 동일하게 동작해야 하는
  로직은 씬을 이식하지 말고 `game-core`나 `game-content`에 둡니다.
- **사용 중인 공유 패키지:** 세이브 스키마·마이그레이션·로케일 계약은
  `game-core`, `DEX_CATALOG`는 `game-content`, `translate()`는 `game-i18n`,
  아트는 생성된 `require()` 맵을 통해 `game-assets`를 사용합니다. 전투와 포획 퀴즈
  흐름은 아직 웹 전용이므로 `quiz-content`는 의도적으로 모바일 의존성에서
  제외했습니다.
- **영속성**은 `@react-native-async-storage/async-storage`를 `mobile/src/storage/`
  에서 공유 `SaveStorage` 계약에 연결한 구조입니다. `load()`는
  `codigdex:save:v3` → `:v2` → `:v1` 순서로 읽고, `game-core`의 `parseSave()`가
  v1·v2 데이터를 `StoredGameStateV3`로 마이그레이션하며, 마이그레이션된 결과는
  다시 v3 키에 기록됩니다. 데이터가 손상되었거나 읽기에 실패하면
  `createEmptySave()`로 되돌아갑니다. 쓰기는 항상 v3 키에만 이뤄지고, 공유 규칙에는
  순수 데이터만 전달합니다.
- **서체**는 `galmuri` 패키지의 Galmuri14 비트맵 폰트이며 `app/_layout.tsx`에서
  `expo-font`로 불러옵니다. 폰트 로딩이 끝나기 전까지 루트 레이아웃은 아무것도
  렌더링하지 않습니다.

## 명령어

저장소 루트에서 실행합니다.

```bash
npm ci
npm run check:boundaries
npm run typecheck
npm run lint
npm test
npm run build:web
```

`typecheck`와 `test`는 모바일을 포함한 모든 워크스페이스로 퍼집니다. 모바일만
확인하려면 다음을 실행합니다.

```bash
npm run typecheck --workspace @codigdex/mobile   # 에셋 맵 --check 후 tsc --noEmit
npm test --workspace @codigdex/mobile            # vitest run
npm run generate:assets --workspace @codigdex/mobile
```

Expo 개발 서버를 켜고 Expo Go로 QR 코드를 스캔합니다.

```bash
# LAN — 기기와 컴퓨터가 같은 Wi-Fi에 있을 때. 에셋 맵을 먼저 다시 생성합니다.
npm run start --workspace @codigdex/mobile

# 터널 — 네트워크가 다르거나 LAN이 개발 서버를 막을 때
npm run generate:assets --workspace @codigdex/mobile
npm run start:tunnel --workspace @codigdex/mobile
```

에셋 맵을 `prestart`로 다시 생성하는 스크립트는 `start`뿐입니다.
`start:tunnel`, `android`, `ios`에는 해당 훅이 없으므로 아트가 바뀌었다면
`generate:assets`를 먼저 실행하세요.

Vercel에서는 Root Directory를 `web`으로 설정합니다. 웹 애플리케이션이 그 디렉터리
바깥의 워크스페이스 패키지를 import하므로 **Include source files outside of the Root
Directory in the Build Step** 옵션을 켠 상태로 유지하세요. 웹 패키지의 `prebuild`
스크립트가 `@codigdex/game-assets`를 먼저 동기화하기 때문에 기본
`npm run build` 명령으로 충분합니다.
