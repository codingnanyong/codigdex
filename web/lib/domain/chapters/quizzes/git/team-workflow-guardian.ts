import type { QuizQuestion } from "../../types";

const teamWorkflowGuardianQuiz = [
        { prompt: "내 브랜치 변경을 main에 합쳐 달라고 리뷰를 요청하는 것은?", choices: ["Pull Request", "git stash", "Fork", "Tag"], answerIndex: 0 },
        { prompt: "Pull Request에서 동료가 코드를 읽고 의견을 남기는 과정은?", choices: ["코드 리뷰", "리베이스", "체크아웃", "클론"], answerIndex: 0 },
        { prompt: "기능마다 브랜치를 따서 작업하고 PR로 합치는 방식은?", choices: ["feature 브랜치 워크플로", "단일 파일 워크플로", "원격 없는 워크플로", "태그 워크플로"], answerIndex: 0 },
        { prompt: "남의 저장소를 내 계정으로 복사해 기여를 시작하는 것은?", choices: ["Fork", "Clone", "Merge", "Stash"], answerIndex: 0 },
        { prompt: "main에 직접 push하지 못하게 막는 저장소 설정은?", choices: ["보호된 브랜치", "공개 저장소", "기본 브랜치 이름", "원격 이름"], answerIndex: 0 },
        { prompt: "PR을 합칠 때 여러 커밋을 하나로 묶어 main에 넣는 방식은?", choices: ["Squash and merge", "Rebase and merge", "Fast-forward only", "Cherry-pick"], answerIndex: 0 },
        { prompt: "PR에 커밋을 올릴 때마다 테스트와 빌드를 자동으로 돌리는 것은?", choices: ["CI", "Fork", "Stash", "Blame"], answerIndex: 0 },
        { prompt: "PR 본문에 `Closes #12`를 쓰면 병합 때 일어나는 일은?", choices: ["12번 이슈가 자동으로 닫힌다", "12번 PR이 삭제된다", "커밋 12개가 합쳐진다", "브랜치 12개가 생긴다"], answerIndex: 0 },
        { prompt: "좋은 PR에 가장 가까운 것은?", choices: ["한 가지 목적의 작은 변경", "한 달치 작업 전부", "여러 기능을 한꺼번에", "리뷰 없이 바로 병합"], answerIndex: 0 },
        { prompt: "릴리스 버전 `v1.0.0`을 특정 커밋에 표시하는 명령은?", choices: ["git tag v1.0.0", "git branch v1.0.0", "git stash v1.0.0", "git label v1.0.0"], answerIndex: 0 },
        { prompt: "다른 브랜치의 커밋 하나만 골라 현재 브랜치에 가져오는 명령은?", choices: ["git cherry-pick", "git pick", "git fetch-one", "git merge --one"], answerIndex: 0 },
        { prompt: "파일의 각 줄을 누가 마지막으로 고쳤는지 보는 명령은?", choices: ["git blame", "git log --who", "git show --line", "git status -l"], answerIndex: 0 },
        { prompt: "비밀번호가 담긴 `.env` 파일을 커밋하지 않으려면?", choices: [".gitignore에 추가한다", "커밋 메시지에 적는다", "README에 적는다", "브랜치 이름으로 쓴다"], answerIndex: 0 },
        { prompt: "실수로 비밀키를 push했을 때 가장 먼저 할 일은?", choices: ["그 키를 폐기하고 새로 발급한다", "다음 커밋에서 파일만 지운다", "커밋 메시지를 고친다", "저장소 이름을 바꾼다"], answerIndex: 0 },
        { prompt: "리뷰어가 수정을 요청(Request changes)하면 작성자가 할 일은?", choices: ["반영해서 같은 브랜치에 커밋", "PR을 닫고 새로 만든다", "main에 직접 push한다", "리뷰어를 PR에서 뺀다"], answerIndex: 0 },
        { prompt: "`feat: 로그인 추가`, `fix: 버튼 오류` 같은 커밋 메시지 규칙은?", choices: ["Conventional Commits", "Git Flow", "Semantic Tag", "Fast-forward"], answerIndex: 0 },
        { prompt: "main(배포)과 develop(개발)을 나눠 운영하는 브랜치 전략은?", choices: ["Git Flow", "Trunk Stack", "Fork Merge", "Stash Flow"], answerIndex: 0 },
        { prompt: "PR 병합 전에 main의 최신 변경을 내 브랜치에 반영하는 이유는?", choices: ["충돌을 미리 확인하고 풀려고", "커밋 수를 줄이려고", "원격을 삭제하려고", "리뷰를 건너뛰려고"], answerIndex: 0 },
        { prompt: "병합이 끝난 PR의 feature 브랜치는 보통 어떻게 하나요?", choices: ["삭제해 정리한다", "main으로 이름을 바꾼다", "영원히 남겨야 한다", "다시 fork한다"], answerIndex: 0 },
        { prompt: "동료의 PR을 내 컴퓨터에서 직접 실행해 보려면 먼저?", choices: ["그 브랜치를 fetch해 switch한다", "main에 바로 merge한다", "저장소를 새로 init한다", "stash를 비운다"], answerIndex: 0 },
      ] satisfies readonly QuizQuestion[];

export default teamWorkflowGuardianQuiz;
