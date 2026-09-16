import type { QuizQuestion } from "@codigdex/game-core/domain/chapters/types";
import { question } from "../question";

/** LV.1 bar-chameleon — Chart selection */
const barChameleonQuiz: readonly QuizQuestion[] = [
  question(
    ["범주별 값을 비교할 때 가장 알맞은 차트는?", "Which chart best compares values across categories?"],
    [["막대 차트", "A bar chart"], ["선 차트", "A line chart"], ["산점도", "A scatter plot"], ["히스토그램", "A histogram"]]
  ),
  question(
    ["시간에 따른 추세를 보여 줄 때 알맞은 차트는?", "Which chart best shows a trend over time?"],
    [["선 차트", "A line chart"], ["파이 차트", "A pie chart"], ["막대 차트", "A bar chart"], ["트리맵", "A treemap"]]
  ),
  question(
    ["두 수치 변수의 관계를 볼 때 알맞은 차트는?", "Which chart reveals the relationship between two numeric variables?"],
    [["산점도", "A scatter plot"], ["파이 차트", "A pie chart"], ["선 차트", "A line chart"], ["도넛 차트", "A donut chart"]]
  ),
  question(
    ["하나의 수치 변수의 분포를 볼 때 알맞은 차트는?", "Which chart shows the distribution of one numeric variable?"],
    [["히스토그램", "A histogram"], ["파이 차트", "A pie chart"], ["선 차트", "A line chart"], ["레이더 차트", "A radar chart"]]
  ),
  question(
    ["파이 차트를 신중하게 써야 하는 이유는?", "Why use a pie chart sparingly?"],
    [["사람이 각도 비교를 잘 못해 조각이 많으면 읽기 어렵다", "People compare angles poorly, so many slices become unreadable"], ["색을 쓸 수 없기 때문이다", "It cannot use color"], ["범주를 표시할 수 없기 때문이다", "It cannot label categories"], ["항상 틀린 값을 보여 주기 때문이다", "It always shows wrong values"]]
  ),
  question(
    ["범주가 많고 이름이 긴 데이터에 알맞은 형태는?", "What form fits many categories with long names?"],
    [["가로 막대 차트", "A horizontal bar chart"], ["세로 막대 차트", "A vertical bar chart"], ["파이 차트", "A pie chart"], ["게이지 차트", "A gauge chart"]]
  ),
  question(
    ["막대 차트를 정렬해서 보여 주면 좋은 이유는?", "Why sort the bars in a bar chart?"],
    [["순위와 격차가 한눈에 읽힌다", "Rank and gaps become readable at a glance"], ["색이 선명해진다", "The colors get brighter"], ["데이터가 정확해진다", "The data becomes more accurate"], ["차트가 작아진다", "The chart gets smaller"]]
  ),
  question(
    ["3차원 효과를 준 차트가 문제인 이유는?", "What is wrong with adding a 3D effect to a chart?"],
    [["원근 때문에 값의 크기가 왜곡되어 보인다", "Perspective distorts how large the values appear"], ["파일 크기가 커진다", "The file gets larger"], ["색을 쓸 수 없다", "Colors cannot be used"], ["제목을 넣을 수 없다", "A title cannot be added"]]
  ),
  question(
    ["차트를 고르기 전에 가장 먼저 정해야 할 것은?", "What should be decided before choosing a chart type?"],
    [["이 차트로 답하려는 질문", "The question the chart is meant to answer"], ["사용할 색상 팔레트", "The color palette"], ["차트 라이브러리", "The charting library"], ["화면 크기", "The screen size"]]
  ),
  question(
    ["값이 하나뿐인 지표를 보여 줄 때 알맞은 형태는?", "What form suits a single headline number?"],
    [["큰 숫자와 짧은 맥락 문구", "A large number with a short piece of context"], ["파이 차트", "A pie chart"], ["산점도", "A scatter plot"], ["히트맵", "A heatmap"]]
  ),
];

/** LV.2 chart-caster — Scale */
const chartCasterQuiz: readonly QuizQuestion[] = [
  question(
    ["스케일이 하는 일은?", "What does a scale do?"],
    [["값을 시각적 위치나 길이에 일관되게 대응시킨다", "It maps values consistently onto visual position or length"], ["차트에 색을 입힌다", "It colors the chart"], ["데이터를 정렬한다", "It sorts the data"], ["범례를 만든다", "It builds the legend"]]
  ),
  question(
    ["막대 차트의 y축을 0에서 시작해야 하는 이유는?", "Why must a bar chart's y-axis start at zero?"],
    [["막대 길이가 값의 크기를 나타내므로 잘라내면 차이가 과장된다", "Bar length encodes magnitude, so truncating exaggerates the difference"], ["0이 항상 보기 좋기 때문이다", "Zero simply looks better"], ["축에 0이 필수 표기이기 때문이다", "Axes are required to print zero"], ["색이 달라지기 때문이다", "The colors would change"]]
  ),
  question(
    ["선 차트에서 축을 잘라도 되는 경우는?", "When is a truncated axis acceptable on a line chart?"],
    [["변화의 크기가 중요해 잘랐음을 분명히 표시할 때", "When the change matters and the truncation is clearly signaled"], ["항상 잘라도 된다", "Always"], ["절대 안 된다", "Never, under any circumstance"], ["색을 바꿀 때", "When the color changes"]]
  ),
  question(
    ["여러 자릿수를 아우르는 값에 알맞은 축은?", "Which axis suits values spanning several orders of magnitude?"],
    [["로그 스케일", "A logarithmic scale"], ["선형 스케일", "A linear scale"], ["역순 스케일", "A reversed scale"], ["범주 스케일", "A categorical scale"]]
  ),
  question(
    ["두 차트를 나란히 비교할 때 지켜야 할 것은?", "What must hold when two charts are compared side by side?"],
    [["축의 범위와 단위를 일치시킨다", "Match their axis ranges and units"], ["색을 다르게 한다", "Use different colors"], ["크기를 다르게 한다", "Use different sizes"], ["제목을 생략한다", "Omit the titles"]]
  ),
  question(
    ["원의 크기로 값을 나타낼 때 기준으로 삼아야 할 것은?", "What should encode the value when using circle size?"],
    [["반지름이 아니라 넓이", "The area, not the radius"], ["반지름", "The radius"], ["지름", "The diameter"], ["둘레", "The circumference"]]
  ),
  question(
    ["축 눈금 간격을 불규칙하게 두면?", "What if axis tick spacing is irregular?"],
    [["값 사이의 거리가 왜곡되어 읽힌다", "Distances between values read as distorted"], ["차트가 정확해진다", "The chart becomes more accurate"], ["색이 선명해진다", "The colors sharpen"], ["아무 영향이 없다", "Nothing is affected"]]
  ),
  question(
    ["시간 축에서 값이 없는 구간을 이어 버리면?", "What if a time axis skips intervals with no data?"],
    [["추세가 실제보다 매끄럽거나 가파르게 보인다", "The trend looks smoother or steeper than it really is"], ["차트가 정확해진다", "The chart becomes more accurate"], ["범례가 사라진다", "The legend disappears"], ["문제가 없다", "There is no problem"]]
  ),
  question(
    ["축 레이블에 단위를 표기해야 하는 이유는?", "Why label axes with units?"],
    [["숫자가 무엇을 뜻하는지 오해 없이 읽히게 한다", "Readers understand what the numbers mean without guessing"], ["차트가 커 보이기 때문이다", "It makes the chart look bigger"], ["색이 필요 없어지기 때문이다", "It removes the need for color"], ["데이터가 정확해지기 때문이다", "It makes the data more accurate"]]
  ),
  question(
    ["매우 긴 숫자를 축에 표시할 때 좋은 방법은?", "How should very long numbers be shown on an axis?"],
    [["단위를 축약하고 그 기준을 명시한다", "Abbreviate them and state the unit explicitly"], ["모든 자릿수를 그대로 쓴다", "Print every digit"], ["숫자를 생략한다", "Omit the numbers"], ["글씨를 아주 작게 한다", "Shrink the type until it fits"]]
  ),
];

/** LV.3 plot-artisan — Color */
const plotArtisanQuiz: readonly QuizQuestion[] = [
  question(
    ["차트에서 색을 쓰는 올바른 원칙은?", "What is the right principle for color in a chart?"],
    [["강조와 범주 구분을 위해 제한적이고 일관되게 쓴다", "Use it sparingly and consistently, for emphasis and categories"], ["가능한 많은 색을 쓴다", "Use as many colors as possible"], ["매 차트마다 색을 바꾼다", "Change colors on every chart"], ["색만으로 모든 정보를 표현한다", "Convey all information through color alone"]]
  ),
  question(
    ["서로 다른 범주를 구분할 때 쓰는 색 팔레트는?", "Which palette distinguishes unordered categories?"],
    [["범주형 팔레트", "A categorical palette"], ["연속형 팔레트", "A sequential palette"], ["발산형 팔레트", "A diverging palette"], ["단색 팔레트", "A monochrome palette"]]
  ),
  question(
    ["낮음에서 높음으로 이어지는 값에 쓰는 팔레트는?", "Which palette suits values running from low to high?"],
    [["연속형 팔레트", "A sequential palette"], ["범주형 팔레트", "A categorical palette"], ["발산형 팔레트", "A diverging palette"], ["무작위 팔레트", "A random palette"]]
  ),
  question(
    ["중간값을 기준으로 양쪽으로 벌어지는 값에 쓰는 팔레트는?", "Which palette suits values spreading either side of a midpoint?"],
    [["발산형 팔레트", "A diverging palette"], ["연속형 팔레트", "A sequential palette"], ["범주형 팔레트", "A categorical palette"], ["회색조 팔레트", "A grayscale palette"]]
  ),
  question(
    ["색으로만 계열을 구분하면 안 되는 이유는?", "Why should color alone never distinguish series?"],
    [["색각 이상 사용자나 흑백 출력에서 구분되지 않는다", "It fails for color-blind readers and in black-and-white printing"], ["색이 화면마다 다르기 때문만이다", "Only because screens render color differently"], ["파일이 커지기 때문이다", "It makes the file larger"], ["범례를 못 쓰기 때문이다", "Legends become unusable"]]
  ),
  question(
    ["색 외에 계열을 구분할 수 있는 방법은?", "What can distinguish series besides color?"],
    [["모양, 선 패턴, 직접 레이블", "Shape, line pattern and direct labels"], ["글꼴 크기만", "Font size alone"], ["차트 크기만", "Chart size alone"], ["배경 이미지", "A background image"]]
  ),
  question(
    ["범주형 팔레트에 색이 너무 많을 때 할 일은?", "What should you do when a categorical palette has too many colors?"],
    [["중요한 범주만 강조하고 나머지는 묶거나 회색으로 둔다", "Highlight the categories that matter and group or gray out the rest"], ["더 밝은 색을 추가한다", "Add brighter colors"], ["색을 무작위로 배정한다", "Assign colors at random"], ["범례를 지운다", "Remove the legend"]]
  ),
  question(
    ["차트의 텍스트와 배경 사이에 확보해야 할 것은?", "What must hold between chart text and its background?"],
    [["충분한 명도 대비", "Sufficient contrast"], ["같은 색조", "The same hue"], ["같은 채도", "The same saturation"], ["투명한 배경", "A transparent background"]]
  ),
  question(
    ["같은 대시보드 안에서 한 범주의 색이 차트마다 다르면?", "What if one category takes a different color on each chart of a dashboard?"],
    [["읽는 사람이 매번 범례를 다시 확인해야 한다", "Readers must re-read the legend every time"], ["차트가 화려해져 좋다", "It makes the dashboard livelier"], ["정확도가 올라간다", "Accuracy improves"], ["아무 영향이 없다", "Nothing is affected"]]
  ),
  question(
    ["강조하고 싶은 값이 하나 있을 때 효과적인 방법은?", "What effectively highlights one value among many?"],
    [["그 하나만 강조색을 주고 나머지는 중립색으로 둔다", "Give it an accent color and leave the rest neutral"], ["모든 값에 다른 색을 준다", "Give every value a different color"], ["배경을 어둡게 한다", "Darken the background"], ["글꼴을 바꾼다", "Change the font"]]
  ),
];

/** LV.4 dashboard-storyteller — Annotation */
const dashboardStorytellerQuiz: readonly QuizQuestion[] = [
  question(
    ["주석(annotation)이 하는 일은?", "What does an annotation do?"],
    [["중요한 값이나 사건에 직접 설명을 덧붙인다", "It adds direct explanation to an important value or event"], ["차트의 색을 바꾼다", "It changes the chart's colors"], ["데이터를 정렬한다", "It sorts the data"], ["축을 생성한다", "It creates the axis"]]
  ),
  question(
    ["추세가 급변한 지점에 주석을 다는 이유는?", "Why annotate the point where a trend changed sharply?"],
    [["읽는 사람이 원인을 추측하지 않아도 되게 한다", "Readers no longer have to guess at the cause"], ["차트를 채우기 위해서다", "To fill empty space"], ["색을 늘리기 위해서다", "To add more color"], ["축을 숨기기 위해서다", "To hide the axis"]]
  ),
  question(
    ["범례 대신 계열 옆에 직접 이름을 붙이면 좋은 이유는?", "Why label a series directly instead of using a legend?"],
    [["시선이 범례와 차트를 오가지 않아도 된다", "The eye no longer has to travel between legend and chart"], ["색을 쓸 수 없기 때문이다", "Color becomes unavailable"], ["파일이 작아지기 때문이다", "The file gets smaller"], ["데이터가 정확해지기 때문이다", "The data becomes more accurate"]]
  ),
  question(
    ["차트 제목으로 가장 좋은 형태는?", "What makes the best chart title?"],
    [["결론이나 핵심 관찰을 담은 문장", "A sentence stating the conclusion or key observation"], ["축 이름을 나열한 문구", "A list of the axis names"], ["데이터 출처 파일명", "The source file name"], ["차트 종류 이름", "The name of the chart type"]]
  ),
  question(
    ["기준선(reference line)을 넣는 이유는?", "Why add a reference line?"],
    [["목표나 평균 같은 비교 기준을 함께 보여 준다", "It shows a benchmark such as a target or an average"], ["차트를 꾸미기 위해서다", "To decorate the chart"], ["데이터를 숨기기 위해서다", "To hide data"], ["축을 없애기 위해서다", "To remove the axis"]]
  ),
  question(
    ["주석을 너무 많이 달면 생기는 문제는?", "What goes wrong when a chart is over-annotated?"],
    [["무엇이 중요한지 오히려 알 수 없어진다", "It stops being clear what actually matters"], ["차트가 느려진다", "The chart renders slowly"], ["데이터가 바뀐다", "The data changes"], ["색이 사라진다", "The colors disappear"]]
  ),
  question(
    ["데이터가 없는 구간을 표시하는 올바른 방법은?", "How should a gap with no data be shown?"],
    [["결측임을 명시해 0과 구분한다", "Mark it explicitly as missing, distinct from zero"], ["0으로 채운다", "Fill it with zero"], ["앞 값으로 잇는다", "Carry the previous value forward"], ["구간을 삭제한다", "Delete the interval"]]
  ),
  question(
    ["대시보드에서 가장 중요한 지표를 두어야 할 위치는?", "Where does the most important metric belong on a dashboard?"],
    [["시선이 먼저 닿는 좌측 상단", "Top left, where the eye lands first"], ["우측 하단", "Bottom right"], ["가운데 가장 작게", "Centered and smallest"], ["위치는 상관없다", "Position does not matter"]]
  ),
  question(
    ["대시보드에 차트를 계속 추가하면 생기는 문제는?", "What happens as charts keep piling onto a dashboard?"],
    [["무엇을 봐야 할지 흐려져 결정에 쓰이지 않는다", "It gets unclear what to look at, and nobody uses it to decide"], ["로딩이 빨라진다", "It loads faster"], ["정확도가 올라간다", "Accuracy improves"], ["색이 정리된다", "The colors get tidier"]]
  ),
  question(
    ["차트에 데이터 출처와 기준일을 적는 이유는?", "Why note the data source and as-of date on a chart?"],
    [["신뢰할 수 있는지, 언제 기준인지 판단할 수 있게 한다", "Readers can judge whether to trust it and what period it covers"], ["빈 공간을 채우기 위해서다", "To fill white space"], ["색을 늘리기 위해서다", "To add color"], ["글자 수를 늘리기 위해서다", "To add more text"]]
  ),
];

/** LV.5 insight-prism — Visual story */
const insightPrismQuiz: readonly QuizQuestion[] = [
  question(
    ["시각적 스토리텔링이 설계하는 것은?", "What does visual storytelling design?"],
    [["핵심 질문에서 근거를 지나 결론으로 이어지는 시선 흐름", "A path for attention from the key question through evidence to a conclusion"], ["차트의 색상 팔레트만", "Only the color palette"], ["데이터 수집 방법", "The data collection method"], ["저장소 구조", "The storage layout"]]
  ),
  question(
    ["분석 결과를 전달할 때 가장 먼저 정해야 할 것은?", "What comes first when presenting an analysis?"],
    [["듣는 사람이 내려야 할 결정", "The decision the audience has to make"], ["사용할 차트 종류", "Which chart type to use"], ["색상 팔레트", "The color palette"], ["슬라이드 수", "The number of slides"]]
  ),
  question(
    ["경영진 대상 보고에서 바람직한 구성은?", "How should a report for executives be structured?"],
    [["결론을 먼저 말하고 근거를 뒤에 둔다", "State the conclusion first and put the evidence after"], ["방법론을 모두 설명한 뒤 결론을 말한다", "Explain the full methodology and conclude at the end"], ["모든 차트를 순서대로 보여 준다", "Show every chart in order"], ["원본 데이터를 그대로 보여 준다", "Show the raw data as it is"]]
  ),
  question(
    ["차트에서 불필요한 장식을 걷어내야 하는 이유는?", "Why strip decoration from a chart?"],
    [["데이터를 읽는 데 쓰는 주의를 데이터에 집중시킨다", "Attention stays on the data instead of on the ornament"], ["파일 크기 때문이다", "Because of file size"], ["색이 부족하기 때문이다", "Because colors are scarce"], ["렌더링이 느려서다", "Because rendering is slow"]]
  ),
  question(
    ["같은 데이터로도 다른 결론을 만들 수 있다는 사실이 요구하는 것은?", "What does it demand that the same data can support different conclusions?"],
    [["선택한 표현과 그 근거를 투명하게 밝히는 책임", "A responsibility to be transparent about the choices made and why"], ["가장 보기 좋은 표현을 고르는 것", "Choosing whichever looks best"], ["결론을 숨기는 것", "Hiding the conclusion"], ["차트를 늘리는 것", "Adding more charts"]]
  ),
  question(
    ["의도적으로 오해를 부르는 시각화의 흔한 수법은?", "Which is a common technique in a deliberately misleading chart?"],
    [["축을 잘라 차이를 과장한다", "Truncating an axis to exaggerate a difference"], ["축 단위를 표기한다", "Labeling the axis units"], ["기준선을 넣는다", "Adding a reference line"], ["출처를 밝힌다", "Citing the source"]]
  ),
  question(
    ["탐색용 차트와 설명용 차트의 차이는?", "How does an exploratory chart differ from an explanatory one?"],
    [["탐색용은 스스로 묻기 위한 것이고 설명용은 결론을 전달한다", "Exploratory charts ask questions for you; explanatory ones deliver a conclusion"], ["탐색용이 항상 더 아름답다", "Exploratory charts are always prettier"], ["설명용은 데이터가 필요 없다", "Explanatory charts need no data"], ["둘은 같은 말이다", "They mean the same thing"]]
  ),
  question(
    ["대시보드를 만들기 전에 확인해야 할 것은?", "What should be settled before a dashboard is built?"],
    [["누가 어떤 결정을 위해 얼마나 자주 볼지", "Who will read it, for what decision, and how often"], ["차트 라이브러리 선택", "The charting library"], ["색상 코드", "The color codes"], ["화면 해상도", "The screen resolution"]]
  ),
  question(
    ["시각화가 결정을 이끌어 내지 못할 때 점검할 것은?", "What should you examine when a visualization fails to drive a decision?"],
    [["보는 사람의 질문과 차트가 답하는 질문이 맞는지", "Whether the chart answers the question the reader actually has"], ["색이 충분히 화려한지", "Whether the colors are vivid enough"], ["차트 수가 충분한지", "Whether there are enough charts"], ["글꼴이 최신인지", "Whether the font is modern"]]
  ),
  question(
    ["시각화를 공유하기 전 마지막으로 확인할 것은?", "What is the last check before sharing a visualization?"],
    [["숫자의 정확성, 축과 단위, 결론이 근거와 맞는지", "Number accuracy, axes and units, and whether the conclusion follows the evidence"], ["파일 이름 규칙", "The file naming convention"], ["차트 개수", "The chart count"], ["배경 이미지", "The background image"]]
  ),
];

const visualizationQuiz: readonly (readonly QuizQuestion[])[] = [
  barChameleonQuiz,
  chartCasterQuiz,
  plotArtisanQuiz,
  dashboardStorytellerQuiz,
  insightPrismQuiz,
];

export default visualizationQuiz;
