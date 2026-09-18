# 모노레포 아키텍처

**한국어** · [English](../eng/MONOREPO_ARCHITECTURE.md)

Codigdex는 하나의 저장소 안에서 패키지마다 소유 범위를 나눠 관리합니다. 네트워크로
연결된 마이크로서비스가 아니라 모듈형 모놀리식 구조입니다. web과 mobile은 동일하게
결정적인 게임 규칙과 콘텐츠를 사용해야 하지만, 렌더링과 디바이스 연동 방식은 서로
다르기 때문입니다.

```text
codigdex/
├─ web/                       Next.js + Phaser 웹 애플리케이션
├─ mobile/                    향후 추가될 Expo/React Native 애플리케이션
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
- **mobile**은 Metro가 동적 `require()` 호출을 해석하지 못하므로,
  `@codigdex/game-assets/manifest`의 `ASSET_KEYS`에서 정적 `require()` 맵을
  생성해야 합니다.
- 아트를 추가·이름 변경·삭제한 뒤에는
  `npm run generate --workspace @codigdex/game-assets`를 실행합니다. 매니페스트가
  낡은 상태면 `typecheck`가 실패합니다.
- 렌더링, 내비게이션, 입력, 오디오, 분석, 영속성 어댑터는 앱이 담당합니다. 공유
  패키지는 Phaser, React, Next.js, Expo, `window`, `document`, 특정 디바이스 저장소
  API를 import해서는 안 됩니다.
- 새 패키지는 코드가 안정적인 공개 계약을 갖추고 소비자가 둘 이상일 때만 만듭니다.
  기능 전용 UI는 해당 앱 안에 둡니다.

## 모바일 구현

`mobile/`에 Expo 애플리케이션을 만들고 워크스페이스 패키지를 직접 사용합니다.
모바일은 자체 화면과 터치 우선 레이아웃을 구현해야 하며, Phaser 캔버스를 감싸거나
재사용하지 않습니다. 공유 세이브 스냅샷은 모바일 어댑터(예: AsyncStorage)를 통해
저장하고, 공유 규칙에는 순수 데이터만 전달합니다.

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

Vercel에서는 Root Directory를 `web`으로 설정합니다. 웹 애플리케이션이 그 디렉터리
바깥의 워크스페이스 패키지를 import하므로 **Include source files outside of the Root
Directory in the Build Step** 옵션을 켠 상태로 유지하세요. 웹 패키지의 `prebuild`
스크립트가 `@codigdex/game-assets`를 먼저 동기화하기 때문에 기본
`npm run build` 명령으로 충분합니다.
