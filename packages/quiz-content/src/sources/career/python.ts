import type { QuizQuestion } from "@codigdex/game-core/domain/chapters/types";
import { question } from "../question";

/** LV.1 script-snake — Indentation */
const scriptSnakeQuiz: readonly QuizQuestion[] = [
  question(
    ["Python이 코드 블록의 범위를 표현하는 방법은?", "How does Python express the extent of a code block?"],
    [["들여쓰기", "Indentation"], ["중괄호", "Curly braces"], ["begin과 end 키워드", "begin and end keywords"], ["세미콜론", "Semicolons"]]
  ),
  question(
    ["PEP 8이 권장하는 들여쓰기 한 단계는?", "How much indentation does PEP 8 recommend per level?"],
    [["공백 4칸", "Four spaces"], ["공백 2칸", "Two spaces"], ["탭 2개", "Two tabs"], ["공백 8칸", "Eight spaces"]]
  ),
  question(
    ["들여쓰기가 어긋났을 때 발생하는 오류는?", "Which error does inconsistent indentation raise?"],
    ["IndentationError", "SyntaxWarning", "ValueError", "NameError"]
  ),
  question(
    ["한 블록 안에서 탭과 공백을 섞어 쓰면?", "What happens if you mix tabs and spaces inside one block?"],
    [["TabError 같은 오류가 나므로 하나로 통일해야 한다", "It raises an error such as TabError, so pick one and stay with it"], ["문제없이 동작한다", "It works without any problem"], ["자동으로 공백으로 변환된다", "Python converts tabs to spaces automatically"], ["경고만 출력된다", "Only a warning is printed"]]
  ),
  question(["if 문의 조건 끝에 붙여 블록의 시작을 알리는 기호는?", "Which character ends an if condition and opens its block?"], [":", ";", "{", "->"]),
  question(
    ["아직 내용을 채우지 않은 블록을 문법적으로 통과시키는 키워드는?", "Which keyword keeps an empty block syntactically valid?"],
    ["pass", "skip", "null", "void"]
  ),
  question(
    ["Python에서 한 줄 주석을 쓰는 기호는?", "Which character starts a single-line comment in Python?"],
    ["#", "//", "--", "/*"]
  ),
  question(
    ["for 반복문 안의 코드가 반복되려면 어떻게 해야 하나?", "What makes code repeat inside a for loop?"],
    [["for 줄보다 한 단계 더 들여쓴다", "Indent it one level deeper than the for line"], ["for 줄과 같은 열에 맞춘다", "Align it with the for line"], ["중괄호로 감싼다", "Wrap it in curly braces"], ["end 키워드로 닫는다", "Close it with an end keyword"]]
  ),
  question(
    ["문자열을 화면에 출력하는 기본 함수는?", "Which built-in function prints text to the screen?"],
    ["print()", "echo()", "console.log()", "write()"]
  ),
  question(
    ["들여쓰기로 블록을 표현하는 방식의 장점은?", "What is the benefit of expressing blocks with indentation?"],
    [["보이는 구조와 실제 구조가 항상 일치한다", "The visible structure always matches the real structure"], ["코드가 자동으로 최적화된다", "The code is optimized automatically"], ["문법 검사가 필요 없어진다", "Syntax checking becomes unnecessary"], ["변수 타입이 고정된다", "Variable types become fixed"]]
  ),
];

/** LV.2 library-coil — Collection */
const libraryCoilQuiz: readonly QuizQuestion[] = [
  question(
    ["순서가 있고 내용을 바꿀 수 있는 자료형은?", "Which collection is ordered and mutable?"],
    ["list", "tuple", "set", "frozenset"]
  ),
  question(
    ["한 번 만들면 내용을 바꿀 수 없는 순서 자료형은?", "Which ordered collection cannot be changed once created?"],
    ["tuple", "list", "dict", "set"]
  ),
  question(["키와 값을 짝지어 저장하는 자료형은?", "Which collection stores keys paired with values?"], ["dict", "list", "tuple", "set"]),
  question(
    ["중복을 허용하지 않고 순서가 없는 자료형은?", "Which collection has no duplicates and no order?"],
    ["set", "list", "tuple", "dict"]
  ),
  question(["리스트의 첫 번째 요소를 꺼내는 표현은?", "Which expression reads the first element of a list?"], ["items[0]", "items[1]", "items.first", "items(0)"]),
  question(
    ["리스트 끝에 요소 하나를 추가하는 메서드는?", "Which method appends one element to the end of a list?"],
    ["append()", "add()", "push()", "insert()"]
  ),
  question(
    ["리스트 items의 마지막 요소를 가리키는 표현은?", "Which expression refers to the last element of the list items?"],
    ["items[-1]", "items[len(items)]", "items[last]", "items[0]"]
  ),
  question(
    ["[x * 2 for x in nums]와 같은 문법을 부르는 말은?", "What is the syntax [x * 2 for x in nums] called?"],
    [["리스트 컴프리헨션", "A list comprehension"], ["제너레이터 함수", "A generator function"], ["람다 표현식", "A lambda expression"], ["데코레이터", "A decorator"]]
  ),
  question(
    ["dict에서 없는 키를 조회해도 오류를 내지 않는 방법은?", "How do you read a missing dict key without raising an error?"],
    ["d.get(key)", "d[key]", "d.fetch(key)", "d.at(key)"]
  ),
  question(
    ["함수 기본값으로 빈 리스트를 직접 쓰면 안 되는 이유는?", "Why should a mutable empty list never be a default argument?"],
    [["기본값 객체가 호출 사이에 공유돼 값이 쌓인다", "The default object is shared between calls and accumulates values"], ["문법 오류가 발생한다", "It is a syntax error"], ["리스트가 튜플로 바뀐다", "The list turns into a tuple"], ["함수가 느려지기 때문이다", "It makes the function slower"]]
  ),
];

/** LV.3 data-coil — Function/Module */
const dataCoilQuiz: readonly QuizQuestion[] = [
  question(["함수를 정의할 때 쓰는 키워드는?", "Which keyword defines a function?"], ["def", "func", "function", "define"]),
  question(
    ["다른 파일의 기능을 현재 파일로 가져오는 문장은?", "Which statement brings another file's features into the current one?"],
    ["import", "include", "require", "using"]
  ),
  question(
    ["함수 바로 아래에 적어 그 함수의 설명을 남기는 문자열은?", "Which string sits just below a function to describe it?"],
    [["독스트링", "A docstring"], ["주석 블록", "A comment block"], ["타입 힌트", "A type hint"], ["어노테이션", "An annotation"]]
  ),
  question(
    ["여러 개의 위치 인자를 묶어 받는 매개변수 표기는?", "Which parameter form collects any number of positional arguments?"],
    ["*args", "**kwargs", "&args", "...args"]
  ),
  question(
    ["이름이 붙은 인자들을 딕셔너리로 받는 매개변수 표기는?", "Which parameter form collects named arguments into a dict?"],
    ["**kwargs", "*args", "&&kwargs", "dict args"]
  ),
  question(
    ['if __name__ == "__main__": 을 쓰는 이유는?', 'Why write if __name__ == "__main__":?'],
    [["모듈로 import될 때는 실행되지 않게 하기 위해", "So the code does not run when the file is imported as a module"], ["함수를 더 빠르게 만들기 위해", "To make functions faster"], ["전역 변수를 지우기 위해", "To clear global variables"], ["들여쓰기를 줄이기 위해", "To reduce indentation"]]
  ),
  question(
    ["여러 모듈을 담는 디렉터리 단위를 부르는 말은?", "What is a directory that groups several modules called?"],
    [["패키지", "A package"], ["라이브러리 파일", "A library file"], ["네임스페이스 변수", "A namespace variable"], ["빌드 산출물", "A build artifact"]]
  ),
  question(
    ["from module import *를 피해야 하는 이유는?", "Why avoid from module import *?"],
    [["어떤 이름이 들어왔는지 알기 어려워 충돌이 생긴다", "It hides which names arrived and invites collisions"], ["문법 오류가 발생한다", "It is a syntax error"], ["import 속도가 느려진다", "It slows down importing"], ["모듈이 삭제된다", "It deletes the module"]]
  ),
  question(
    ["매개변수와 반환값의 타입을 표기하는 문법은?", "Which syntax annotates parameter and return types?"],
    ["def f(x: int) -> str:", "def f(int x) string:", "def f(x as int) returns str:", "def<int, str> f(x):"]
  ),
  question(
    ["함수를 모듈로 분리했을 때 얻는 이점은?", "What do you gain by splitting functions into modules?"],
    [["역할별로 찾기 쉽고 다른 프로젝트에서도 재사용할 수 있다", "Code is easier to find by role and reusable in other projects"], ["실행 파일 크기가 줄어든다", "The executable gets smaller"], ["타입 검사가 자동으로 켜진다", "Type checking turns on automatically"], ["변수가 모두 전역이 된다", "All variables become global"]]
  ),
];

/** LV.4 automation-engine — Exception */
const automationEngineQuiz: readonly QuizQuestion[] = [
  question(
    ["예외가 발생할 수 있는 코드를 감싸는 키워드는?", "Which keyword wraps code that may raise an exception?"],
    ["try", "catch", "check", "guard"]
  ),
  question(["발생한 예외를 붙잡아 처리하는 절은?", "Which clause catches and handles a raised exception?"], ["except", "catch", "rescue", "handle"]),
  question(
    ["예외 발생 여부와 상관없이 항상 실행되는 절은?", "Which clause always runs, exception or not?"],
    ["finally", "else", "always", "ensure"]
  ),
  question(["예외를 직접 발생시키는 키워드는?", "Which keyword raises an exception yourself?"], ["raise", "throw", "emit", "panic"]),
  question(
    ["0으로 나눌 때 발생하는 예외는?", "Which exception is raised when dividing by zero?"],
    ["ZeroDivisionError", "ValueError", "ArithmeticWarning", "TypeError"]
  ),
  question(
    ["없는 파일을 열려고 할 때 발생하는 예외는?", "Which exception is raised when opening a file that does not exist?"],
    ["FileNotFoundError", "IOWarning", "KeyError", "OSExit"]
  ),
  question(
    ["except: 만 단독으로 쓰면 안 되는 이유는?", "Why is a bare except: a bad idea?"],
    [["의도하지 않은 예외까지 삼켜 문제를 감춘다", "It swallows unintended exceptions and hides real problems"], ["문법 오류가 발생한다", "It is a syntax error"], ["항상 프로그램이 종료된다", "It always terminates the program"], ["예외가 두 번 발생한다", "The exception is raised twice"]]
  ),
  question(
    ["파일을 열고 반드시 닫히게 하는 가장 좋은 방법은?", "What is the best way to guarantee a file is closed?"],
    ["with open(path) as f:", "f = open(path)", "try: open(path)", "import file; file.open(path)"]
  ),
  question(
    ["예외를 붙잡아 맥락을 덧붙여 다시 던지는 문법은?", "Which syntax re-raises an exception with added context?"],
    ["raise NewError(...) from err", "throw err.wrap(...)", "raise err.append(...)", "except err as NewError"]
  ),
  question(
    ["예외 처리를 설계할 때 바람직한 태도는?", "What is a healthy attitude when designing exception handling?"],
    [["복구할 수 있는 예외만 붙잡고 나머지는 위로 올린다", "Catch only what you can recover from and let the rest propagate"], ["모든 예외를 붙잡아 조용히 넘긴다", "Catch everything and pass silently"], ["예외를 아예 쓰지 않는다", "Avoid exceptions entirely"], ["예외 메시지를 항상 숨긴다", "Always hide the exception message"]]
  ),
];

/** LV.5 automation-seraph — Virtual environment */
const automationSeraphQuiz: readonly QuizQuestion[] = [
  question(
    ["가상 환경을 쓰는 이유는?", "Why use a virtual environment?"],
    [["프로젝트별로 패키지 의존성을 격리한다", "It isolates package dependencies per project"], ["Python 실행 속도를 높인다", "It speeds up the Python interpreter"], ["코드를 자동으로 검사한다", "It checks code automatically"], ["메모리를 더 많이 할당한다", "It allocates more memory"]]
  ),
  question(
    ["표준 라이브러리로 가상 환경을 만드는 명령은?", "Which standard-library command creates a virtual environment?"],
    ["python -m venv .venv", "python -m pip venv", "pip install venv", "python create env"]
  ),
  question(
    ["설치된 패키지 목록을 파일로 저장하는 명령은?", "Which command writes the installed package list to a file?"],
    ["pip freeze > requirements.txt", "pip list --save", "pip export requirements.txt", "pip dump > requirements.txt"]
  ),
  question(
    ["requirements.txt의 패키지를 설치하는 명령은?", "Which command installs the packages in requirements.txt?"],
    ["pip install -r requirements.txt", "pip add requirements.txt", "pip sync requirements.txt", "python requirements.txt"]
  ),
  question(
    ["가상 환경 디렉터리를 Git에 커밋하면 안 되는 이유는?", "Why should a virtual environment directory never be committed to Git?"],
    [["플랫폼 의존 바이너리가 많고 언제든 다시 만들 수 있다", "It holds platform-specific binaries and can be rebuilt any time"], ["파일 이름이 너무 길기 때문이다", "The file names are too long"], ["Git이 디렉터리를 지원하지 않기 때문이다", "Git does not support directories"], ["가상 환경은 비밀 키를 담기 때문이다", "A virtual environment stores secret keys"]]
  ),
  question(
    ["패키지 버전을 정확히 고정하는 표기는?", "Which notation pins a package to an exact version?"],
    ["requests==2.31.0", "requests>=2.31.0", "requests~2.31.0", "requests@latest"]
  ),
  question(
    ["가상 환경을 활성화한 뒤 pip install을 하면 어디에 설치되나?", "After activating a virtual environment, where does pip install put packages?"],
    [["그 가상 환경 안에만 설치된다", "Only inside that virtual environment"], ["시스템 전역에 설치된다", "Into the system-wide interpreter"], ["홈 디렉터리 전체에 설치된다", "Across the whole home directory"], ["설치되지 않는다", "Nowhere; installation fails"]]
  ),
  question(
    ["현재 사용 중인 Python 실행 파일 경로를 확인하는 방법은?", "How do you check which Python executable is in use?"],
    ["python -c \"import sys; print(sys.executable)\"", "python --path", "pip which python", "python -m venv --show"]
  ),
  question(
    ["여러 프로젝트가 같은 패키지의 다른 버전을 요구할 때 해법은?", "What solves two projects needing different versions of the same package?"],
    [["프로젝트마다 별도 가상 환경을 둔다", "Give each project its own virtual environment"], ["최신 버전 하나만 전역에 설치한다", "Install only the newest version globally"], ["패키지를 직접 복사해 이름을 바꾼다", "Copy the package and rename it"], ["둘 중 하나를 포기한다", "Give up on one of the projects"]]
  ),
  question(
    ["의존성을 requirements.txt로 남겨 두면 좋은 점은?", "What is the benefit of recording dependencies in requirements.txt?"],
    [["다른 사람이 같은 환경을 그대로 재현할 수 있다", "Someone else can reproduce the same environment exactly"], ["패키지가 자동으로 최신화된다", "Packages update themselves automatically"], ["가상 환경이 필요 없어진다", "It removes the need for a virtual environment"], ["설치 속도가 항상 두 배가 된다", "Installation always doubles in speed"]]
  ),
];

const pythonQuiz: readonly (readonly QuizQuestion[])[] = [
  scriptSnakeQuiz,
  libraryCoilQuiz,
  dataCoilQuiz,
  automationEngineQuiz,
  automationSeraphQuiz,
];

export default pythonQuiz;
