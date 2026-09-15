import type { QuizQuestion } from "../../types";
import { question } from "../question";

const permissionGuardQuiz = [
  question(
    ["`ls -l` 결과에 보이는 `rwx`가 뜻하는 것은?", "What does the `rwx` shown in `ls -l` output mean?"],
    [["읽기·쓰기·실행 권한", "Read, write and execute permissions"], ["파일 크기", "File size"], ["소유자 이름", "Owner name"], ["수정 날짜", "Modified date"]]
  ),
  question(["`run.sh`에 실행 권한을 주는 명령은?", "Which command gives `run.sh` execute permission?"], ["chmod +x run.sh", "chown +x run.sh", "mkdir +x run.sh", "cat +x run.sh"]),
  question(["관리자(root) 권한으로 명령을 실행할 때 앞에 붙이는 것은?", "What do you put in front of a command to run it with admin (root) rights?"], ["sudo", "admin", "root", "super"]),
  question(
    ["`-rwxr-xr--`에서 맨 앞 `rwx`는 누구의 권한인가요?", "In `-rwxr-xr--`, whose permissions are the first `rwx`?"],
    [["파일 소유자", "The file owner"], ["같은 그룹", "The same group"], ["그 외 사용자", "Other users"], ["root만", "Only root"]]
  ),
  question(
    ["`chmod 755`에서 7이 뜻하는 권한은?", "In `chmod 755`, which permissions does the 7 stand for?"],
    [["읽기·쓰기·실행 모두", "Read, write and execute"], ["읽기만", "Read only"], ["읽기·실행", "Read and execute"], ["권한 없음", "No permissions"]]
  ),
  question(
    ["`chmod 644 notes.txt`를 하면 그룹과 기타 사용자는?", "After `chmod 644 notes.txt`, what can the group and other users do?"],
    [["읽기만 할 수 있다", "Only read it"], ["읽고 쓸 수 있다", "Read and write it"], ["실행만 할 수 있다", "Only execute it"], ["아무것도 못 한다", "Nothing at all"]]
  ),
  question(["파일의 소유자를 바꾸는 명령은?", "Which command changes a file's owner?"], ["chown", "chmod", "chowner", "usermod"]),
  question(["권한 숫자에서 읽기, 쓰기, 실행의 값은?", "In numeric permissions, what are the values for read, write and execute?"], ["r=4 w=2 x=1", "r=1 w=2 x=4", "r=3 w=2 x=1", "r=7 w=5 x=1"]),
  question(
    ["디렉터리에 실행(x) 권한이 없으면 할 수 없는 것은?", "Without execute (x) permission on a directory, what can't you do?"],
    [["그 안으로 cd 들어가기", "cd into it"], ["권한 표시 보기", "See its permissions"], ["상위 폴더로 가기", "Go to the parent folder"], ["내 계정 이름 보기", "See your account name"]]
  ),
  question(["현재 사용자가 속한 그룹 목록을 보는 명령은?", "Which command lists the groups the current user belongs to?"], ["groups", "whoami", "grouplist", "chgrp"]),
  question(["시스템 전체에 대해 최고 권한을 가진 계정 이름은?", "What is the name of the account with the highest rights over the whole system?"], ["root", "admin", "super", "master"]),
  question(
    ["`Permission denied` 오류가 뜨는 흔한 이유는?", "What is a common reason for a `Permission denied` error?"],
    [["필요한 권한이 없어서", "You lack the needed permission"], ["파일 이름이 길어서", "The file name is too long"], ["인터넷이 끊겨서", "The internet is down"], ["화면이 작아서", "The screen is too small"]]
  ),
  question(["내 계정의 비밀번호를 바꾸는 명령은?", "Which command changes your account's password?"], ["passwd", "password", "secret", "chpassword"]),
  question(["새 사용자 계정을 만드는 명령은?", "Which command creates a new user account?"], ["useradd", "mkuser", "newuser", "makeuser"]),
  question(["파일의 그룹을 바꾸는 명령은?", "Which command changes a file's group?"], ["chgrp", "chmod g", "grpmod", "setgroup"]),
  question(["`sudo`를 쓸 수 있는 사용자를 정해 두는 설정 파일은?", "Which config file defines who is allowed to use `sudo`?"], ["/etc/sudoers", "/etc/hosts", "/etc/passwd", "/etc/fstab"]),
  question(["사용자 계정 목록이 저장된 파일은?", "Which file stores the list of user accounts?"], ["/etc/passwd", "/etc/sudoers", "/etc/hosts", "/etc/shells"]),
  question(
    ["`chmod 777`을 함부로 쓰면 안 되는 이유는?", "Why shouldn't you use `chmod 777` carelessly?"],
    [["아무나 고치고 실행할 수 있어서", "Anyone can edit and run the file"], ["파일이 느려져서", "The file gets slower"], ["파일이 숨겨져서", "The file becomes hidden"], ["디렉터리가 사라져서", "The directory disappears"]]
  ),
  question(
    ["`chmod u+x`에서 `u`가 뜻하는 것은?", "In `chmod u+x`, what does `u` stand for?"],
    [["파일 소유자", "The file owner"], ["모든 사용자", "All users"], ["그룹", "The group"], ["기타 사용자", "Other users"]]
  ),
  question(
    ["최소 권한 원칙에 맞는 태도는?", "Which approach follows the principle of least privilege?"],
    [["필요한 만큼만 권한을 준다", "Grant only the permissions that are needed"], ["항상 root로 작업한다", "Always work as root"], ["모든 파일을 777로 연다", "Open every file with 777"], ["비밀번호를 공유한다", "Share passwords"]]
  ),
] satisfies readonly QuizQuestion[];

export default permissionGuardQuiz;
