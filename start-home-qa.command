#!/bin/bash
set -euo pipefail

usage() {
  cat <<'HELP'
Codigdex 집 Mac 검수
  bash start-home-qa.command                  실행 메뉴
  bash start-home-qa.command prepare [ios|android|all]
  bash start-home-qa.command ios [--device ID]
  bash start-home-qa.command android [--device ID]
  bash start-home-qa.command all
  bash start-home-qa.command ios --doctor     설치 상태만 확인

prepare는 lockfile 기준으로 저장소 의존성을 다시 설치하고 도구를 점검합니다. 앱 테스트는 실행하지 않습니다.
all은 Web + Android + iOS입니다. 실제 검수 전에 해당 기기/시뮬레이터를 켜 두세요.
일반 플레이 저장·키체인은 초기화하지 않습니다. 결과는 qa-results/에 남습니다.
HELP
}

if [[ "${1:-}" == '--help' || "${1:-}" == '-h' ]]; then usage; exit 0; fi
if [[ "$(uname -s)" != 'Darwin' ]]; then
  echo 'This launcher requires macOS. Use npm run qa:home directly for Windows/Android.' >&2
  exit 1
fi

cd -- "$(dirname -- "$0")"
qa_prepare=0
if [[ $# -eq 0 ]]; then
  if [[ ! -t 0 ]]; then usage; exit 1; fi
  trap 'qa_status=$?; trap - EXIT; read -r -p "Enter를 누르면 창을 닫습니다. " qa_close_input || true; exit "$qa_status"' EXIT
  printf '1) 환경 준비·도구 점검\n2) Android 전체 검수\n3) iOS 전체 검수\n4) Web + Android + iOS 전체 검수\n0) 종료\n'
  read -r -p '선택: ' qa_choice
  case "$qa_choice" in
    1) set -- prepare ;;
    2) set -- android ;;
    3) set -- ios ;;
    4) set -- all ;;
    0) trap - EXIT; exit 0 ;;
    *) echo '1, 2, 3, 4 또는 0을 선택하세요.' >&2; exit 1 ;;
  esac
fi

qa_platform="$1"
shift
if [[ "$qa_platform" == prepare ]]; then
  qa_prepare=1
  qa_platform=all
  if [[ $# -gt 0 && "$1" != --* ]]; then qa_platform="$1"; shift; fi
fi
case "$qa_platform" in
  android|ios|all) ;;
  *) usage; exit 1 ;;
esac

# Recover common Finder/Terminal tool paths, without changing login profiles.
export ANDROID_HOME="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-$HOME/Library/Android/sdk}}"
export PATH="$PATH:/opt/homebrew/bin:/usr/local/bin:$HOME/.maestro/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator"
qa_node22() { command -v node >/dev/null 2>&1 && [[ "$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null)" == 22 ]]; }
if ! qa_node22; then
  qa_nvm_script="${NVM_DIR:-$HOME/.nvm}/nvm.sh"
  if [[ -s "$qa_nvm_script" ]]; then
    set +u
    . "$qa_nvm_script" --no-use
    if nvm use 22; then :; fi
    set -u
  fi
fi
if ! qa_node22; then
  echo 'Node.js 22.x is required. With nvm: nvm install 22 && nvm use 22. Then rerun this launcher.' >&2
  exit 1
fi
qa_doctor=0
qa_inspect=0
for qa_arg in "$@"; do
  [[ "$qa_arg" != --doctor ]] || qa_doctor=1
  case "$qa_arg" in --dry-run|--help|--list) qa_inspect=1 ;; esac
done
qa_args=(--platform "$qa_platform" --feature all "$@")
if [[ "$qa_prepare" == 1 && "$qa_doctor" == 0 ]]; then qa_args+=(--doctor); qa_doctor=1; fi
if [[ "$qa_inspect" == 1 ]]; then exec node scripts/home-qa.mjs "${qa_args[@]}"; fi
if ! command -v npx >/dev/null 2>&1; then echo 'Install npm/npx with Node.js 22 first.' >&2; exit 1; fi
# The runner's help/list/plan path uses only Node built-ins and the committed cases.
# Validate options before installation; keep that bootstrap path dependency-free.
node scripts/home-qa.mjs "${qa_args[@]}" --dry-run >/dev/null

if [[ "$qa_prepare" == 1 ]]; then
  npx --yes npm@10.9.2 ci --no-audit --no-fund
elif [[ ! -f node_modules/expo/bin/cli || ! -f node_modules/tsx/dist/cli.mjs || ! -f node_modules/@playwright/test/cli.js ]]; then
  if [[ "$qa_doctor" == 1 ]]; then echo "Run: bash start-home-qa.command prepare $qa_platform" >&2; exit 1; fi
  npx --yes npm@10.9.2 ci --no-audit --no-fund
fi
if [[ "$qa_platform" == all && ( "$qa_prepare" == 1 || "$qa_doctor" == 0 ) ]]; then
  npx --no-install playwright install chromium
fi
if [[ "$qa_doctor" == 1 ]]; then
  printf '필수 도구: Java 17+, Maestro 2.11+, Android SDK 또는 Xcode/CocoaPods\n'
  printf 'Maestro 설치: https://docs.maestro.dev/maestro-cli/how-to-install-maestro-cli\n'
fi
node scripts/home-qa.mjs "${qa_args[@]}"
if [[ "$qa_doctor" == 1 ]]; then
  echo "도구 점검을 마쳤습니다. 실제 기기 테스트는 아직 실행하지 않았습니다."
  echo "기기/시뮬레이터를 켠 뒤 실행: bash start-home-qa.command $qa_platform"
fi
