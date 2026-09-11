import type { QuizQuestion } from "../../types";

const sproutQuiz = [
  { prompt: "새 폴더를 Git 저장소로 만드는 명령은?", choices: ["git init", "git start", "git new", "git create"], answerIndex: 0 },
  { prompt: "수정한 파일을 다음 커밋에 담도록 스테이징하는 명령은?", choices: ["git add", "git commit", "git push", "git save"], answerIndex: 0 },
  { prompt: "스테이징된 변경을 메시지와 함께 기록하는 명령은?", choices: ['git commit -m "메시지"', 'git push -m "메시지"', 'git add -m "메시지"', 'git log -m "메시지"'], answerIndex: 0 },
  { prompt: "수정·스테이징된 파일 등 저장소의 현재 상태를 보여주는 명령은?", choices: ["git status", "git log", "git show", "git init"], answerIndex: 0 },
  { prompt: "지금까지 쌓인 커밋 이력을 보는 명령은?", choices: ["git log", "git status", "git diff", "git add"], answerIndex: 0 },
  { prompt: "커밋 이력을 한 줄씩 짧게 보려면?", choices: ["git log --oneline", "git status -s", "git diff --stat", "git branch -v"], answerIndex: 0 },
  { prompt: "커밋하기 전, 수정한 내용을 줄 단위로 비교하는 명령은?", choices: ["git diff", "git log", "git status", "git init"], answerIndex: 0 },
  { prompt: "Git이 추적하지 않을 파일을 적어 두는 파일은?", choices: [".gitignore", ".gitconfig", "README.md", "package.json"], answerIndex: 0 },
  { prompt: "`git add`로 올린 변경이 커밋 전까지 머무는 곳은?", choices: ["스테이징 영역", "원격 저장소", "휴지통", "브랜치 목록"], answerIndex: 0 },
  { prompt: "커밋(commit)을 가장 잘 설명한 것은?", choices: ["변경을 기록한 스냅숏", "원격에 올리는 동작", "파일을 지우는 명령", "브랜치의 다른 이름"], answerIndex: 0 },
  { prompt: "현재 폴더의 모든 변경을 한 번에 스테이징하려면?", choices: ["git add .", "git commit .", "git push .", "git init ."], answerIndex: 0 },
  { prompt: "`git init`을 하면 폴더 안에 생기는 숨김 폴더는?", choices: [".git", ".github", ".gitignore", ".config"], answerIndex: 0 },
  { prompt: "다음 중 가장 좋은 커밋 메시지는?", choices: ["로그인 버튼 오류 수정", "asdf", "수정함", "몰라"], answerIndex: 0 },
  { prompt: "커밋에 남을 작성자 이름을 설정하는 명령은?", choices: ["git config user.name", "git init user.name", "git log user.name", "git add user.name"], answerIndex: 0 },
  { prompt: "커밋 하나의 변경 내용을 자세히 보는 명령은?", choices: ["git show", "git init", "git add", "git clone"], answerIndex: 0 },
  { prompt: "스테이징했지만 아직 커밋하지 않은 변경을 비교하려면?", choices: ["git diff --staged", "git log --staged", "git status --diff", "git show --add"], answerIndex: 0 },
  { prompt: "`git status`의 'Untracked files'가 뜻하는 것은?", choices: ["아직 추적하지 않는 새 파일", "삭제된 파일", "원격에만 있는 파일", "충돌이 난 파일"], answerIndex: 0 },
  { prompt: "커밋마다 붙는 고유한 식별자는?", choices: ["커밋 해시", "브랜치 이름", "태그 번호", "파일 경로"], answerIndex: 0 },
  { prompt: "변경을 저장소에 기록하는 올바른 순서는?", choices: ["add 후 commit", "commit 후 add", "push 후 add", "init 후 push"], answerIndex: 0 },
  { prompt: "파일을 삭제하면서 그 삭제를 스테이징하는 명령은?", choices: ["git rm 파일", "git del 파일", "git drop 파일", "git cut 파일"], answerIndex: 0 },
] satisfies readonly QuizQuestion[];

export default sproutQuiz;
