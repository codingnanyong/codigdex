# 계정 연동과 클라우드 세이브 설계

## 목적

Codigdex는 로그인 없이도 바로 플레이할 수 있어야 한다. 사용자가 계정을 연결하면 같은 계정으로 로그인한 Web과 Android/iOS 앱이 하나의 진행 기록을 공유해야 한다.

이 문서의 목표는 다음과 같다.

- Google, GitHub, Apple 로그인을 하나의 Codigdex 사용자에 연결한다.
- 기존 브라우저 `codigdex:save:v3`와 향후 모바일 로컬 저장을 잃지 않고 계정에 귀속한다.
- Web과 Mobile의 동시 수정, 오프라인 플레이, 세션 만료에도 포획·전직 기록을 잃지 않는다.
- 사용자는 로그인 수단 연결 해제, 전체 로그아웃, 데이터 내보내기와 계정 삭제를 할 수 있다.
- 초기 운영은 무료 범위에서 시작하되 특정 서비스에 게임 규칙을 종속시키지 않는다.

친구 도감, 랭킹, 실시간 멀티플레이는 이 설계의 범위가 아니다.

## 결정 요약

초기 구현은 **Supabase Auth + PostgreSQL + Row Level Security**를 사용한다.

- 로그인 전에는 서버 사용자를 만들지 않고 기존처럼 로컬에만 저장한다.
- 최초 로그인 시 Supabase의 `auth.users.id`를 Codigdex의 영구 사용자 ID로 사용한다.
- Google, GitHub, Apple은 각각 별도 사용자가 아니라 한 사용자에 연결된 identity다.
- 공급자 이메일이 같다는 이유만으로 계정을 합치지 않는다. 로그인한 계정 설정 화면에서 다른 공급자를 명시적으로 연결하는 흐름을 기본으로 한다.
- 진행 데이터는 `game_saves`의 JSON 스냅샷으로 저장하고 `revision`으로 동시 수정을 감지한다.
- 병합 규칙은 `@codigdex/game-core`에 플랫폼 중립 함수로 구현한다.
- 클라이언트가 병합을 계산하더라도 DB는 RLS와 원자적 compare-and-set으로 다른 사용자의 저장 접근과 오래된 revision 덮어쓰기를 차단한다.

Supabase Free의 한도와 중지·백업 정책은 운영 전에 다시 확인한다. 현재 공식 안내 기준으로 Free는 50,000 MAU, DB 500MB, egress 5GB를 제공하지만 비활성 프로젝트는 중지될 수 있고 자동 백업은 제공하지 않는다.

## 전체 구조

```text
Google ─┐
GitHub ─┼─> Supabase Auth ─> auth.users.id
Apple ──┘                         │
                                 ├─> profiles
Web (Next.js) ───────────────────┼─> game_saves
Mobile (Expo) ───────────────────┘
          │
          └─ @codigdex/game-core
             - save v3 migration
             - canonicalizeSave()
             - mergeGameSaves()
             - career mastery recomputation
```

Web과 Mobile은 UI와 세션 보관 방식만 다르고, 저장 마이그레이션과 병합 규칙은 같은 공유 패키지를 사용한다.

## 사용자와 로그인 수단

### 기준 사용자 ID

`auth.users.id`가 계정 귀속의 유일한 기준이다. 이메일, Google subject, GitHub 사용자명, Apple 이메일을 게임 테이블의 소유자 키로 사용하지 않는다.

Supabase가 관리하는 identity는 다음처럼 한 사용자에 여러 개 연결될 수 있다.

```text
auth.users.id = 6f...42
  ├─ google / provider_id=...
  ├─ github / provider_id=...
  └─ apple  / provider_id=...
```

따라서 사용자가 Web에서는 GitHub, Mobile에서는 Apple로 로그인해도 두 identity가 같은 `auth.users.id`에 연결되어 있으면 같은 `game_saves` 행을 읽는다.

### 연결 원칙

1. 사용자가 이미 로그인한 상태에서 **계정 설정 → 로그인 수단 연결**을 선택한다.
2. 현재 세션을 재확인한 뒤 `linkIdentity()` 또는 네이티브 ID token 연결을 시작한다.
3. OAuth callback이 끝난 뒤 서버에서 identity 목록과 현재 사용자 ID가 유지됐는지 확인한다.
4. 연결 성공 전에는 기존 세션과 저장을 변경하지 않는다.
5. 마지막 로그인 수단은 연결 해제하지 못하게 한다.

Supabase의 확인된 동일 이메일 자동 연결은 보조 기능일 뿐, 제품 흐름은 명시적 연결을 기준으로 한다.

### Apple 비공개 이메일

Apple의 `Hide My Email`을 사용하면 Google/GitHub 이메일과 다른 relay 이메일이 제공될 수 있다. 그러므로 이메일 일치만으로 같은 사람이라고 판단하면 안 된다.

- 기존 계정에 Apple을 추가하려면 먼저 기존 계정으로 로그인한 뒤 Apple identity를 연결한다.
- Apple로 별도 사용자가 이미 만들어졌다면 두 계정의 소유권을 각각 재인증한 뒤 서버 트랜잭션으로만 병합한다.
- MVP에서는 실수로 생성된 두 영구 계정의 자동 병합을 지원하지 않는다. 고객지원용 내보내기/복구 절차를 먼저 제공하고, 안전한 재인증 병합은 후속 기능으로 둔다.

## 공급자와 플랫폼

| 공급자 | Web | Mobile | 주의점 |
| --- | --- | --- | --- |
| Google | OAuth PKCE callback | 브라우저 OAuth 또는 네이티브 ID token | redirect allow-list를 환경별로 분리 |
| GitHub | OAuth PKCE callback | 브라우저 OAuth + 앱 딥링크 | GitHub 이메일 공개 여부를 계정 키로 사용하지 않음 |
| Apple | OAuth callback | Sign in with Apple ID token 권장 | relay 이메일과 Apple 설정·키 갱신 절차 기록 |

권장 callback은 다음과 같다.

```text
Production Web: https://codigdex.vercel.app/auth/callback
Preview Web:    허용된 Vercel Preview callback
Mobile dev:     codigdex://auth/callback
Mobile prod:    Universal Link / App Link + custom scheme fallback
```

Preview 도메인을 무제한 wildcard로 허용하지 않는다. 배포 환경별 redirect allow-list와 OAuth state/PKCE 검증을 사용한다.

## 클라이언트 세션

### Web

- Next.js에는 `@supabase/ssr`와 PKCE를 사용한다.
- 세션은 JavaScript가 직접 읽는 localStorage 대신 보안 속성이 적용된 쿠키 흐름을 사용한다.
- 서버 렌더링 결과에 사용자별 데이터를 정적으로 캐시하지 않는다.
- `service_role` 키는 서버 환경에만 두며 브라우저 번들에는 publishable key만 포함한다.

### Mobile

- Expo 앱은 `@supabase/supabase-js`를 사용한다.
- refresh token과 세션은 Expo SecureStore 기반 어댑터에 저장한다.
- OAuth callback은 Expo Linking으로 처리하고 예상한 scheme/host/path인지 검증한다.
- 앱이 foreground로 돌아올 때 세션 갱신과 저장 동기화를 재개한다.

게임 저장 데이터는 토큰 저장소와 분리한다. AsyncStorage에는 게임 저장과 동기화 메타데이터만 두며 인증 토큰을 평문으로 저장하지 않는다.

## 데이터 모델

### profiles

게임에서 필요한 최소 프로필만 저장한다. 공급자 원본 프로필 전체를 복사하지 않는다.

```sql
create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### game_saves

한 사용자의 최신 정규 저장 스냅샷은 한 행으로 관리한다.

```sql
create table public.game_saves (
  user_id uuid primary key references auth.users(id) on delete cascade,
  schema_version smallint not null,
  revision bigint not null default 1 check (revision > 0),
  payload jsonb not null,
  payload_hash text not null,
  source_device_id uuid,
  updated_at timestamptz not null default now()
);
```

`payload_hash`는 같은 내용을 반복 업로드하는 것을 피하기 위한 값이지 보안 서명이 아니다. 기기 ID는 설치 단위를 구분하는 임의 UUID이며 광고 ID나 하드웨어 식별자를 사용하지 않는다.

### 로컬 동기화 메타데이터

게임 save v3 자체와 동기화 상태를 분리한다.

```ts
interface LocalSyncMetadata {
  accountUserId?: string;
  cloudRevision?: number;
  lastSyncedHash?: string;
  lastSyncedAt?: string;
  dirty: boolean;
  deviceId: string;
}
```

Web은 `codigdex:sync:v1`, Mobile은 전용 AsyncStorage key를 사용한다. 로그아웃 시 클라우드 사용자 ID와 revision은 지우되, 사용자가 선택하면 로컬 진행 사본은 유지할 수 있다.

## 저장 봉투와 동기화 대상

클라우드에는 현재 save v3를 그대로 던지지 않고 버전과 필드 시각이 있는 봉투로 저장한다.

```ts
interface CloudSaveEnvelope {
  schemaVersion: 3;
  revision: number;
  updatedAt: string;
  sourceDeviceId: string;
  clocks: {
    player?: string;
    locale?: string;
  };
  payload: CodigdexSaveV3;
}
```

- 포획과 직업 이력은 항목별 시각이 있으므로 합집합 병합이 가능하다.
- 현재 선택 직업과 locale처럼 단일 값인 필드는 별도 clock으로 마지막 변경을 비교한다.
- 화면 열림, 현재 탭, 일시적 애니메이션 상태는 동기화하지 않는다.
- MASTER 기록은 업로드 값을 그대로 신뢰하지 않고 병합된 포획 기록에서 다시 계산한다.

## 최초 로그인과 계정 귀속

### 계정에 클라우드 저장이 없는 경우

```text
로컬 save 읽기
→ 최신 save schema로 migration
→ canonicalize
→ 로그인 사용자 ID로 revision 1 생성
→ 서버 결과를 로컬에 다시 저장
→ sync metadata 기록
```

이 시점부터 해당 진행은 `auth.users.id`에 귀속된다.

### 계정에 기존 클라우드 저장이 있는 경우

```text
로컬 save + 클라우드 save 읽기
→ 양쪽 migration/canonicalize
→ deterministic merge
→ 사용자에게 병합 요약 표시
→ expected revision과 함께 저장
→ 성공한 서버 결과로 로컬 교체
```

병합 화면은 최소한 다음 수치를 보여 준다.

- 새로 합쳐지는 포획 수
- 유지되는 1·2·3차 직업 MASTER 수
- 현재 선택 직업이 충돌하는지
- 어느 기기의 locale을 사용할지

사용자가 취소하면 로그인 세션은 유지할 수 있지만 클라우드 동기화는 시작하지 않는다.

## 병합 규칙

| 데이터 | 병합 규칙 |
| --- | --- |
| `progress.captures` | 몬스터 ID 합집합, 중복은 더 이른 `capturedAt` 유지 |
| `progress.careers.unlockedAt` | 더 이른 유효 시각 유지 |
| `selectedAt` | 더 이른 최초 전직 시각 유지 |
| `masteredAt` | 포획 기록에서 조건을 재계산하고 기존의 더 이른 유효 시각 유지 |
| `primaryJobId` | 한쪽만 변경됐으면 변경된 값, 양쪽 충돌이면 사용자 선택 |
| `secondaryJobId` | 해금 조건을 만족하는 값만 허용, 충돌이면 사용자 선택 |
| `tertiaryJobId` | 대응 2차 MASTER를 만족하는 값만 허용, 충돌이면 사용자 선택 |
| `ui.locale` | locale clock이 더 최신인 값, 동률이면 현재 기기 값 |
| `tutorialOnboardingSeen` | 어느 한쪽이라도 `true`이면 `true` |

병합 함수는 교환 법칙과 멱등성을 만족해야 한다. 같은 두 저장을 순서를 바꿔 병합하거나 여러 번 병합해도 포획·직업 기록 결과가 같아야 한다. 사용자 선택이 필요한 필드는 병합 결과 대신 명시적인 conflict를 반환한다.

## revision과 동시 수정

저장은 compare-and-set 방식으로 갱신한다.

```text
클라이언트 expectedRevision == DB revision
  → update payload, revision = revision + 1

expectedRevision != DB revision
  → 409 conflict
  → 최신 클라우드 저장 조회
  → 로컬 저장과 재병합
  → 다시 저장
```

revision 확인과 update는 하나의 PostgreSQL 함수/트랜잭션에서 실행한다. `updated_at`만 비교하면 기기 시계 오차와 동시 요청 때문에 진행을 잃을 수 있으므로 충돌 제어 키로 사용하지 않는다.

## 동기화 시점과 오프라인 처리

다음 이벤트에서 `dirty`를 표시하고 짧게 debounce해 저장한다.

- 몬스터 포획 성공
- 챕터 또는 직업 MASTER 기록
- 1·2·3차 직업 선택 변경
- 동기화 대상 설정 변경

동기화를 다시 시도하는 시점은 다음과 같다.

- 로그인 또는 앱 시작
- 앱이 foreground로 돌아옴
- 네트워크 복구
- 사용자가 수동 동기화 선택
- 중요한 진행 변경 뒤 debounce 완료

오프라인에서는 로컬 게임을 계속 진행한다. 업로드 실패가 게임 완료 화면이나 지도 복귀를 막아서는 안 된다. 재시도는 지수 backoff를 사용하고 같은 `payload_hash`의 중복 요청은 생략한다.

## RLS와 저장 API

모든 노출 테이블에 RLS를 켠다.

```sql
alter table public.profiles enable row level security;
alter table public.game_saves enable row level security;

create policy "read own save"
on public.game_saves for select
to authenticated
using (auth.uid() is not null and auth.uid() = user_id);

create policy "insert own save"
on public.game_saves for insert
to authenticated
with check (auth.uid() is not null and auth.uid() = user_id);
```

revision 갱신은 `auth.uid()`로 사용자 ID를 정하는 제한된 RPC를 사용한다. 클라이언트가 전달한 `user_id`나 MASTER 상태를 그대로 신뢰하지 않는다. `service_role`은 migration, 계정 삭제 같은 서버 관리 작업에만 사용한다.

## 계정 수명주기

### 로그아웃

- 대기 중인 저장 동기화를 시도하되 실패해도 로그아웃을 막지 않는다.
- 세션과 sync metadata의 계정 식별자를 제거한다.
- 로컬 진행을 유지할지 이 기기에서 지울지 사용자에게 선택권을 준다.

### 로그인 수단 연결 해제

- 현재 사용자에게 identity가 두 개 이상 있을 때만 허용한다.
- 최근 재인증을 요구한다.
- 연결 해제 뒤에도 `auth.users.id`와 게임 저장은 바뀌지 않는다.

### 계정 삭제

- 최근 재인증과 명시적 확인을 요구한다.
- 서버 함수가 identity, profile, game save를 사용자 ID 기준으로 삭제한다.
- 외부 OAuth 공급자의 계정 자체는 삭제하지 않는다.
- 삭제 성공 후 로컬 데이터를 유지할지 함께 지울지 선택하게 한다.
- 삭제 전에 JSON 데이터 내보내기를 제공한다.

## 무료 운영 전략

- 로그인하지 않은 사용자는 Supabase 사용자를 만들지 않아 MAU와 고아 계정을 줄인다.
- 포획·전직처럼 의미 있는 변경만 동기화하고 매 프레임/화면 이동마다 쓰지 않는다.
- 이미지 자산은 기존 Vercel/static bundle을 사용하고 Supabase Storage에 중복 저장하지 않는다.
- Free 프로젝트는 자동 백업이 없으므로 정기적으로 `supabase db dump`를 암호화된 외부 저장소에 보관한다.
- 비활성 중지와 한도 초과를 모니터링한다. 운영 사용자가 생겨 항상 켜져 있어야 하면 유료 전환을 결정한다.
- SMS 로그인은 비용과 악용 위험 때문에 초기 범위에서 제외한다.

## 구현 순서

1. **COD-254** — 공급자, callback, 세션, 개인정보·보관 정책 ADR
2. **COD-255** — DB schema, RLS, revision RPC와 migration
3. **COD-256 / COD-257** — Web·Mobile 로그인과 세션 복구
4. **COD-258** — 로컬 save 귀속, 병합 UI와 shared merge 함수
5. **COD-259** — 온라인/오프라인 동기화와 충돌 재시도
6. **COD-260** — identity 관리, 내보내기와 계정 삭제
7. **COD-261 / COD-262** — 보안 및 Web↔Mobile E2E

## 완료 기준

- Google, GitHub, Apple을 한 사용자에 연결할 수 있다.
- 같은 사용자 ID로 Web과 Mobile에 로그인하면 같은 진행을 복원한다.
- 로그인 전 포획 기록이 최초 계정 연결 뒤 사라지지 않는다.
- 두 기기에서 서로 다른 몬스터를 오프라인 포획한 뒤 모두 보존된다.
- 현재 직업 충돌은 임의로 덮어쓰지 않고 사용자가 선택한다.
- 다른 사용자의 save 행을 읽거나 수정할 수 없다.
- 세션 만료, OAuth 취소, 네트워크 단절, 중복 요청 뒤에도 로컬 플레이가 가능하다.
- identity 연결 해제, 데이터 내보내기와 계정 삭제가 검증된다.

## 공식 참고 자료

- [Supabase Pricing](https://supabase.com/pricing)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Identity Linking](https://supabase.com/docs/guides/auth/auth-identity-linking)
- [Anonymous Sign-Ins and conflict considerations](https://supabase.com/docs/guides/auth/auth-anonymous)
- [React Native Auth quickstart](https://supabase.com/docs/guides/auth/quickstarts/react-native)
- [Next.js server-side Auth](https://supabase.com/docs/guides/auth/server-side)
- [PostgreSQL Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Free project pausing](https://supabase.com/docs/guides/platform/free-project-pausing)
- [Database backups](https://supabase.com/docs/guides/platform/backups)
