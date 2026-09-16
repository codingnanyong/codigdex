import type { QuizQuestion } from "@codigdex/game-core/domain/chapters/types";
import { question } from "../question";

/** LV.1 structure-sprout — Semantic HTML */
const structureSproutQuiz: readonly QuizQuestion[] = [
  question(["문단 하나를 나타내는 HTML 태그는?", "Which HTML tag marks up a single paragraph?"], ["<p>", "<div>", "<span>", "<br>"]),
  question(["페이지의 주요 탐색 메뉴를 감싸기에 가장 알맞은 태그는?", "Which tag best wraps a page's main navigation menu?"], ["<nav>", "<div>", "<section>", "<aside>"]),
  question(
    ["시맨틱 HTML을 쓰는 가장 큰 이유는?", "What is the main reason to use semantic HTML?"],
    [["콘텐츠의 의미를 브라우저와 보조 기술에 전달한다", "It conveys the meaning of content to browsers and assistive technology"], ["파일 크기를 줄인다", "It reduces file size"], ["CSS 없이 색을 입힌다", "It applies color without CSS"], ["자바스크립트 실행을 빠르게 한다", "It speeds up JavaScript execution"]]
  ),
  question(["문서에서 가장 중요한 제목에 쓰는 태그는?", "Which tag marks the most important heading in a document?"], ["<h1>", "<h6>", "<title>", "<strong>"]),
  question(["독립적으로 재사용될 수 있는 글 한 편을 감싸는 태그는?", "Which tag wraps a self-contained, independently reusable piece of content?"], ["<article>", "<div>", "<p>", "<label>"]),
  question(
    ["이미지에 alt 속성을 적는 이유는?", "Why do you write an alt attribute on an image?"],
    [["이미지를 볼 수 없는 사용자에게 내용을 전달한다", "It conveys the content to users who cannot see the image"], ["이미지 용량을 줄인다", "It shrinks the image file"], ["이미지를 가운데 정렬한다", "It centers the image"], ["이미지 확장자를 바꾼다", "It changes the image format"]]
  ),
  question(["다음 중 의미를 담지 않는 컨테이너 태그는?", "Which of these is a container tag with no meaning of its own?"], ["<div>", "<header>", "<footer>", "<main>"]),
  question(["페이지 본문의 주 내용 영역을 한 번만 감싸는 태그는?", "Which tag wraps a page's primary content area exactly once?"], ["<main>", "<body>", "<section>", "<article>"]),
  question(["순서가 중요한 목록을 만들 때 쓰는 태그는?", "Which tag creates a list where the order matters?"], ["<ol>", "<ul>", "<dl>", "<table>"]),
  question(
    ["클릭 가능한 요소로 <div> 대신 <button>을 쓰는 이유는?", "Why use <button> instead of <div> for a clickable element?"],
    [["키보드 포커스와 엔터 입력을 기본으로 지원한다", "It supports keyboard focus and Enter by default"], ["글자가 자동으로 파랗게 된다", "Its text turns blue automatically"], ["페이지 로딩이 빨라진다", "The page loads faster"], ["CSS가 필요 없어진다", "It removes the need for CSS"]]
  ),
];

/** LV.2 style-shell — Box model */
const styleShellQuiz: readonly QuizQuestion[] = [
  question(
    ["박스 모델을 바깥에서 안쪽 순서로 올바르게 나열한 것은?", "Which lists the box model from outside to inside correctly?"],
    [["margin → border → padding → content", "margin → border → padding → content"], ["padding → margin → border → content", "padding → margin → border → content"], ["border → content → margin → padding", "border → content → margin → padding"], ["content → margin → padding → border", "content → margin → padding → border"]]
  ),
  question(["요소의 내용과 테두리 사이에 생기는 안쪽 여백은?", "Which property creates space between an element's content and its border?"], ["padding", "margin", "border", "outline"]),
  question(["요소 바깥에서 다른 요소와 거리를 두는 속성은?", "Which property creates space outside an element, away from its neighbors?"], ["margin", "padding", "border", "gap"]),
  question(
    ["box-sizing: border-box가 하는 일은?", "What does box-sizing: border-box do?"],
    [["width 안에 padding과 border를 포함시킨다", "It includes padding and border inside the declared width"], ["width에서 padding을 빼고 계산한다", "It subtracts padding from the declared width"], ["margin을 width에 포함시킨다", "It includes margin in the width"], ["테두리를 없앤다", "It removes the border"]]
  ),
  question(
    ["width: 200px, padding: 10px, border: 5px이고 box-sizing이 기본값일 때 실제 가로 너비는?", "With width: 200px, padding: 10px, border: 5px and the default box-sizing, what is the rendered width?"],
    ["230px", "200px", "220px", "215px"]
  ),
  question(
    ["위아래로 인접한 블록 요소의 margin이 합쳐져 큰 값 하나만 남는 현상은?", "What is it called when the margins of vertically adjacent block elements combine into the larger one?"],
    [["마진 겹침(margin collapsing)", "Margin collapsing"], ["박스 상속", "Box inheritance"], ["플렉스 정렬", "Flex alignment"], ["캐스케이드", "Cascade"]]
  ),
  question(["너비가 정해진 블록 요소를 가로 가운데로 두는 흔한 방법은?", "What is the common way to center a block element with a set width?"], ["margin: 0 auto", "padding: 0 auto", "border: auto", "text-align: middle"]),
  question(
    ["display: inline 요소에 적용되지 않는 것은?", "Which does NOT apply to a display: inline element?"],
    [["width와 height", "width and height"], ["글자 색", "Text color"], ["좌우 padding", "Left and right padding"], ["font-size", "font-size"]]
  ),
  question(["테두리 바깥에 그려지고 레이아웃 공간은 차지하지 않는 속성은?", "Which property draws outside the border without taking up layout space?"], ["outline", "border", "padding", "margin"]),
  question(["내용이 박스를 넘칠 때 잘라내거나 스크롤을 만드는 속성은?", "Which property clips or scrolls content that overflows its box?"], ["overflow", "display", "position", "float"]),
];

/** LV.3 cascade-weaver — Cascade */
const cascadeWeaverQuiz: readonly QuizQuestion[] = [
  question(
    ["인라인 스타일을 빼면 명시도가 가장 높은 선택자는?", "Ignoring inline styles, which selector has the highest specificity?"],
    [["id 선택자", "An id selector"], ["class 선택자", "A class selector"], ["태그 선택자", "A type selector"], ["전체 선택자", "The universal selector"]]
  ),
  question(
    ["명시도가 같은 두 규칙 중 최종 적용되는 것은?", "When two rules have equal specificity, which one wins?"],
    [["나중에 선언된 규칙", "The one declared later"], ["먼저 선언된 규칙", "The one declared first"], ["더 짧은 규칙", "The shorter rule"], ["알파벳 순서가 빠른 규칙", "The one first alphabetically"]]
  ),
  question(
    ["!important에 대한 설명으로 옳은 것은?", "Which statement about !important is correct?"],
    [["명시도를 뛰어넘어 적용되지만 남용하면 유지보수가 어려워진다", "It overrides specificity but makes maintenance hard when overused"], ["언제나 권장되는 방법이다", "It is always the recommended approach"], ["선택자를 무효화한다", "It disables the selector"], ["브라우저마다 무시된다", "Browsers ignore it inconsistently"]]
  ),
  question(
    ["자식 요소가 부모의 값을 물려받는 CSS 동작은?", "What is it called when a child element takes its parent's value?"],
    [["상속", "Inheritance"], ["캐스케이드", "The cascade"], ["명시도", "Specificity"], ["리셋", "A reset"]]
  ),
  question(["다음 중 기본적으로 상속되는 속성은?", "Which property is inherited by default?"], ["color", "margin", "border", "display"]),
  question(
    [".card p와 p가 같은 요소를 겨냥할 때 적용되는 규칙은?", "When .card p and p target the same element, which rule applies?"],
    [".card p", "p", ["둘 다 무시된다", "Neither applies"], ["무작위로 정해진다", "It is chosen at random"]]
  ),
  question(
    ["캐스케이드가 규칙을 고르는 순서로 맞는 것은?", "In what order does the cascade choose a rule?"],
    [["중요도 → 명시도 → 선언 순서", "Importance → specificity → source order"], ["선언 순서 → 명시도 → 중요도", "Source order → specificity → importance"], ["파일 크기 → 명시도 → 중요도", "File size → specificity → importance"], ["알파벳 순서 → 중요도 → 명시도", "Alphabetical order → importance → specificity"]]
  ),
  question(["#nav .item a의 명시도 값은?", "What is the specificity of #nav .item a?"], ["(1, 1, 1)", "(0, 2, 1)", "(1, 0, 2)", "(0, 1, 2)"]),
  question(["부모에게서 받은 값을 명시적으로 물려받게 하는 키워드는?", "Which keyword explicitly takes the value from the parent?"], ["inherit", "default", "parent", "cascade"]),
  question(
    ["class 대신 id로 스타일을 자주 지정하면 생기는 문제는?", "What problem comes from styling with ids instead of classes?"],
    [["명시도가 높아 나중에 덮어쓰기 어려워진다", "High specificity makes later overrides hard"], ["브라우저가 규칙을 무시한다", "Browsers ignore the rules"], ["파일이 자동으로 커진다", "The file grows automatically"], ["상속이 끊긴다", "Inheritance stops working"]]
  ),
];

/** LV.4 breakpoint-knight — Media query */
const breakpointKnightQuiz: readonly QuizQuestion[] = [
  question(["화면 조건에 따라 다른 CSS를 적용하는 규칙은?", "Which at-rule applies different CSS based on screen conditions?"], ["@media", "@import", "@font-face", "@keyframes"]),
  question(
    ["@media (min-width: 768px)가 적용되는 조건은?", "When does @media (min-width: 768px) apply?"],
    [["뷰포트 너비가 768px 이상일 때", "When the viewport is 768px wide or more"], ["뷰포트 너비가 768px 이하일 때", "When the viewport is 768px wide or less"], ["정확히 768px일 때만", "Only at exactly 768px"], ["항상 적용된다", "It always applies"]]
  ),
  question(["모바일 우선 설계에서 주로 쓰는 미디어 조건은?", "Which media condition suits a mobile-first design?"], ["min-width", "max-width", "min-height", "orientation"]),
  question(
    ["반응형 페이지의 <head>에 반드시 넣어야 하는 태그는?", "Which tag must a responsive page include in its <head>?"],
    ['<meta name="viewport" content="width=device-width, initial-scale=1">', '<meta charset="utf-8">', '<meta name="robots" content="index">', '<link rel="icon" href="favicon.ico">']
  ),
  question(
    ["레이아웃이 바뀌는 미디어 쿼리 기준점을 부르는 말은?", "What do you call the point where a media query changes the layout?"],
    [["브레이크포인트", "A breakpoint"], ["스냅포인트", "A snap point"], ["앵커", "An anchor"], ["그리드 라인", "A grid line"]]
  ),
  question(["인쇄할 때만 적용할 스타일을 작성하려면?", "How do you write styles that apply only when printing?"], ["@media print", "@media paper", "@print", "@media screen"]),
  question(["사용자가 애니메이션 최소화를 켰는지 확인하는 미디어 기능은?", "Which media feature detects that a user prefers less motion?"], ["prefers-reduced-motion", "prefers-color-scheme", "prefers-contrast", "forced-colors"]),
  question(["다크 모드 대응에 사용하는 미디어 기능은?", "Which media feature supports dark mode?"], ["prefers-color-scheme", "color-gamut", "display-mode", "inverted-colors"]),
  question(
    ["미디어 쿼리 없이 열 개수를 유연하게 바꾸는 Grid 표현은?", "Which Grid expression flexes the column count without a media query?"],
    ["repeat(auto-fit, minmax(200px, 1fr))", "repeat(3, 1fr)", "grid-area: main", "grid-column: span 2"]
  ),
  question(
    ["반응형 레이아웃에서 고정 px 대신 권장되는 단위는?", "Which units are preferred over fixed px in a responsive layout?"],
    [["rem, %, vw 같은 상대 단위", "Relative units such as rem, % and vw"], ["px만 사용한다", "px only"], ["pt만 사용한다", "pt only"], ["cm과 mm", "cm and mm"]]
  ),
];

/** LV.5 responsive-layout-paladin — Accessibility */
const responsiveLayoutPaladinQuiz: readonly QuizQuestion[] = [
  question(
    ["웹 접근성의 목표를 가장 잘 설명한 것은?", "Which best describes the goal of web accessibility?"],
    [["장애 여부와 환경에 상관없이 누구나 이용할 수 있게 한다", "It lets anyone use the page regardless of disability or environment"], ["페이지 로딩 속도를 높인다", "It speeds up page loading"], ["검색 순위만 올린다", "It only raises search ranking"], ["디자인을 통일한다", "It makes designs uniform"]]
  ),
  question(
    ["키보드만으로 페이지를 사용할 때 가장 중요한 것은?", "What matters most when a page is used with a keyboard alone?"],
    [["논리적인 포커스 순서와 눈에 보이는 포커스 표시", "A logical focus order and a visible focus indicator"], ["화려한 전환 애니메이션", "Elaborate transition animations"], ["마우스 커서 모양", "The mouse cursor shape"], ["큰 글꼴 크기", "A large font size"]]
  ),
  question(
    ["폼 입력 요소에 설명을 연결하는 올바른 방법은?", "What is the correct way to label a form input?"],
    [['<label for="...">로 입력 요소와 연결한다', 'Connect it to the input with <label for="...">'], ["placeholder만 적어 둔다", "Rely on the placeholder alone"], ["옆에 <p>로 글자만 둔다", "Put plain text in a <p> beside it"], ["title 속성만 쓴다", "Use only the title attribute"]]
  ),
  question(["WCAG가 본문 텍스트에 요구하는 최소 명도 대비는?", "What minimum contrast ratio does WCAG require for body text?"], ["4.5:1", "1.5:1", "3:1", "2:1"]),
  question(
    ["화면에는 보이지 않지만 스크린 리더에는 읽히게 하려면?", "How do you hide content visually but keep it available to screen readers?"],
    [["시각적으로만 숨기는 클래스를 쓴다", "Use a visually-hidden utility class"], ["display: none을 쓴다", "Use display: none"], ["visibility: hidden을 쓴다", "Use visibility: hidden"], ["hidden 속성을 붙인다", "Add the hidden attribute"]]
  ),
  question(
    ["aria-label을 붙이기 전에 먼저 고려할 것은?", "What should you consider before reaching for aria-label?"],
    [["의미에 맞는 네이티브 HTML 요소를 쓰는 것", "Using the native HTML element that already carries the meaning"], ["div를 하나 더 감싸는 것", "Wrapping it in another div"], ["인라인 스타일을 추가하는 것", "Adding an inline style"], ["클릭 이벤트를 추가하는 것", "Adding a click event"]]
  ),
  question(
    ["순수 장식용 이미지의 alt 속성은 어떻게 적어야 하나?", "How should you write the alt attribute of a purely decorative image?"],
    [['alt=""로 비워 보조 기술이 건너뛰게 한다', 'Leave it empty as alt="" so assistive tech skips it'], ["파일명을 그대로 적는다", "Write the file name"], ['"이미지"라고 적는다', 'Write "image"'], ["속성을 아예 생략한다", "Omit the attribute entirely"]]
  ),
  question(
    ["페이지 맨 앞에 본문 바로가기 링크를 두는 이유는?", "Why put a skip link at the very start of a page?"],
    [["반복되는 탐색 영역을 건너뛸 수 있게 한다", "It lets users skip past repeated navigation"], ["검색 순위를 올린다", "It improves search ranking"], ["첫 화면 로딩을 빠르게 한다", "It speeds up first paint"], ["레이아웃을 정렬한다", "It aligns the layout"]]
  ),
  question(
    ["색만으로 정보를 구분하면 안 되는 이유는?", "Why should color alone never carry information?"],
    [["색각 이상 사용자가 구분하지 못한다", "Users with color vision deficiency cannot tell the difference"], ["CSS 파일이 커진다", "The CSS file grows"], ["브라우저가 렌더링하지 못한다", "Browsers fail to render it"], ["인쇄가 되지 않는다", "It cannot be printed"]]
  ),
  question(
    ['<html lang="ko">를 지정하는 이유는?', 'Why set <html lang="ko">?'],
    [["스크린 리더가 올바른 발음으로 읽게 한다", "It lets screen readers pronounce the text correctly"], ["기본 글꼴을 바꾼다", "It changes the default font"], ["문자 인코딩을 정한다", "It sets the character encoding"], ["자동 번역을 실행한다", "It triggers automatic translation"]]
  ),
];

const htmlCssQuiz: readonly (readonly QuizQuestion[])[] = [
  structureSproutQuiz,
  styleShellQuiz,
  cascadeWeaverQuiz,
  breakpointKnightQuiz,
  responsiveLayoutPaladinQuiz,
];

export default htmlCssQuiz;
