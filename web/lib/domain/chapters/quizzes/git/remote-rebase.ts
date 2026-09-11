import type { QuizQuestion } from "../../types";

const remoteRebaseQuiz = [
        { prompt: "원격 저장소를 통째로 내 컴퓨터에 복제하는 명령은?", choices: ["git clone", "git copy", "git fetch", "git init"], answerIndex: 0 },
        { prompt: "내 로컬 커밋을 원격 저장소에 올리는 명령은?", choices: ["git push", "git pull", "git fetch", "git clone"], answerIndex: 0 },
        { prompt: "원격의 새 커밋을 받아 현재 브랜치에 병합까지 하는 명령은?", choices: ["git pull", "git fetch", "git push", "git clone"], answerIndex: 0 },
        { prompt: "`git fetch`에 대한 설명으로 옳은 것은?", choices: ["원격 변경을 가져오기만 한다", "가져와서 병합까지 한다", "로컬 커밋을 원격에 올린다", "원격 브랜치를 삭제한다"], answerIndex: 0 },
        { prompt: "clone한 원격 저장소에 붙는 기본 이름은?", choices: ["origin", "main", "master", "remote"], answerIndex: 0 },
        { prompt: "연결된 원격 저장소의 주소를 확인하는 명령은?", choices: ["git remote -v", "git remote --url", "git origin", "git show remote"], answerIndex: 0 },
        { prompt: "로컬 저장소에 원격 origin을 새로 연결하려면?", choices: ["git remote add origin 주소", "git clone origin 주소", "git push origin 주소", "git init origin 주소"], answerIndex: 0 },
        { prompt: "처음 push할 때 `-u` 옵션을 붙이면?", choices: ["로컬과 원격 브랜치가 연결된다", "강제로 덮어쓴다", "커밋이 삭제된다", "원격이 초기화된다"], answerIndex: 0 },
        { prompt: "`origin/main`이 뜻하는 것은?", choices: ["마지막으로 받아 온 원격 main", "내 로컬 main", "새로 만든 브랜치", "원격 서버 주소"], answerIndex: 0 },
        { prompt: "내 push가 거절(rejected)되는 흔한 이유는?", choices: ["원격에 내가 없는 커밋이 있어서", "파일이 너무 작아서", "브랜치 이름이 짧아서", "메시지가 한글이라서"], answerIndex: 0 },
        { prompt: "feature 브랜치에서 `git rebase main`을 실행하면?", choices: ["feature 커밋을 main 뒤로 옮긴다", "main을 feature에 병합한다", "feature를 삭제한다", "main을 원격에 올린다"], answerIndex: 0 },
        { prompt: "merge 대신 rebase를 쓰면 좋은 점은?", choices: ["이력이 한 줄로 깔끔해진다", "충돌이 절대 안 난다", "커밋 수가 늘어난다", "원격이 필요 없어진다"], answerIndex: 0 },
        { prompt: "이미 원격에 공유한 커밋을 rebase하면 안 되는 이유는?", choices: ["다른 사람의 이력과 어긋나서", "파일이 사라져서", "속도가 느려서", "브랜치가 잠겨서"], answerIndex: 0 },
        { prompt: "rebase 도중 충돌을 고친 뒤 계속 진행하는 명령은?", choices: ["git rebase --continue", "git rebase --next", "git merge --continue", "git commit --rebase"], answerIndex: 0 },
        { prompt: "진행 중인 rebase를 취소하고 원래대로 돌리려면?", choices: ["git rebase --abort", "git rebase --undo", "git reset --rebase", "git rebase --stop"], answerIndex: 0 },
        { prompt: "여러 커밋을 하나로 합치거나 순서를 바꿀 때 쓰는 명령은?", choices: ["git rebase -i", "git merge -i", "git push -i", "git fetch -i"], answerIndex: 0 },
        { prompt: "rebase 후 원격에 올릴 때 비교적 안전한 강제 push 옵션은?", choices: ["--force-with-lease", "--force-all", "--no-verify", "--dry-run"], answerIndex: 0 },
        { prompt: "`git pull --rebase`가 하는 일은?", choices: ["원격 변경 위로 내 커밋을 다시 쌓는다", "원격 커밋을 삭제한다", "병합 커밋을 꼭 만든다", "로컬 브랜치를 지운다"], answerIndex: 0 },
        { prompt: "원격에서 삭제된 브랜치 정보를 로컬에서도 정리하려면?", choices: ["git fetch --prune", "git pull --clean", "git push --delete-all", "git remote --clear"], answerIndex: 0 },
        { prompt: "원격 저장소에 feature 브랜치를 올리는 명령은?", choices: ["git push origin feature", "git pull origin feature", "git fetch feature origin", "git clone feature"], answerIndex: 0 },
      ] satisfies readonly QuizQuestion[];

export default remoteRebaseQuiz;
