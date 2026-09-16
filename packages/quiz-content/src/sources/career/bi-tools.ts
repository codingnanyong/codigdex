import type { QuizQuestion } from "@codigdex/game-core/domain/chapters/types";
import { question } from "../question";

/** LV.1 metric-firefly — Metric */
const metricFireflyQuiz: readonly QuizQuestion[] = [
  question(
    ["BI에서 지표(metric)가 뜻하는 것은?", "What is a metric in BI?"],
    [["비즈니스 성과를 일관된 계산식으로 측정한 값", "A business outcome measured by one consistent calculation"], ["데이터를 나누는 기준", "A category used to slice data"], ["보고서의 제목", "A report title"], ["데이터 저장 위치", "Where the data is stored"]]
  ),
  question(
    ["좋은 지표가 갖춰야 할 조건은?", "What must a good metric have?"],
    [["정의가 명확하고 누가 계산해도 같은 값이 나온다", "A clear definition that yields the same number no matter who computes it"], ["항상 증가해야 한다", "It must always go up"], ["계산이 복잡해야 한다", "It must be complex to compute"], ["매달 정의가 바뀌어야 한다", "Its definition should change monthly"]]
  ),
  question(
    ["같은 이름의 지표가 팀마다 다른 값을 낼 때 문제는?", "What is the problem when one metric name yields different numbers per team?"],
    [["회의가 숫자 논쟁으로 흘러 결정이 미뤄진다", "Meetings turn into arguments about numbers and decisions stall"], ["계산이 느려진다", "Calculation gets slower"], ["대시보드가 커진다", "Dashboards get larger"], ["문제가 없다", "There is no problem"]]
  ),
  question(
    ["결과를 뒤따라 보여 주는 후행 지표의 예는?", "Which is an example of a lagging indicator?"],
    [["지난 분기 매출", "Last quarter's revenue"], ["이번 주 신규 가입 추세", "This week's signup trend"], ["체험판 전환 시도 수", "Trial conversion attempts"], ["대기 목록 등록 수", "Waitlist signups"]]
  ),
  question(
    ["앞으로의 성과를 예고하는 선행 지표의 특징은?", "What characterizes a leading indicator?"],
    [["결과보다 먼저 움직여 조치할 시간을 준다", "It moves before the outcome, leaving time to act"], ["항상 더 정확하다", "It is always more accurate"], ["과거만 설명한다", "It only explains the past"], ["계산이 불가능하다", "It cannot be computed"]]
  ),
  question(
    ["비율 지표를 볼 때 함께 확인해야 할 것은?", "What must accompany a ratio metric?"],
    [["분모가 되는 모수의 크기", "The size of the denominator"], ["차트의 색상", "The chart color"], ["보고서 제목", "The report title"], ["데이터 파일 형식", "The data file format"]]
  ),
  question(
    ["작은 표본에서 전환율이 100%로 나왔다면?", "What if a conversion rate reads 100% on a tiny sample?"],
    [["표본이 너무 작아 신뢰하기 어렵다", "The sample is too small to trust"], ["가장 좋은 성과로 보고한다", "Report it as the best result"], ["항상 정확한 값이다", "It is always an accurate figure"], ["분모를 숨긴다", "Hide the denominator"]]
  ),
  question(
    ["지표를 너무 많이 추적하면 생기는 문제는?", "What goes wrong when too many metrics are tracked?"],
    [["무엇이 중요한지 흐려져 아무도 움직이지 않는다", "It blurs what matters and nobody acts"], ["계산이 정확해진다", "Calculations get more accurate"], ["대시보드가 빨라진다", "Dashboards get faster"], ["데이터가 늘어난다", "There is simply more data"]]
  ),
  question(
    ["지표가 목표가 되면 왜곡되기 쉽다는 경고를 부르는 말은?", "What warns that a measure stops being good once it becomes a target?"],
    [["굿하트의 법칙", "Goodhart's law"], ["파레토 법칙", "The Pareto principle"], ["무어의 법칙", "Moore's law"], ["콘웨이의 법칙", "Conway's law"]]
  ),
  question(
    ["지표 정의를 어디에 기록해 두어야 하나?", "Where should a metric definition live?"],
    [["모두가 찾아볼 수 있는 공용 정의 문서나 모델", "In a shared definition doc or model anyone can look up"], ["각자의 스프레드시트", "In each person's spreadsheet"], ["담당자의 기억", "In the owner's memory"], ["대시보드 주석에만", "Only as a dashboard note"]]
  ),
];

/** LV.2 report-scout — Dimension */
const reportScoutQuiz: readonly QuizQuestion[] = [
  question(
    ["차원(dimension)이 뜻하는 것은?", "What is a dimension?"],
    [["지역, 제품, 시간처럼 지표를 나누어 보는 기준", "A category such as region, product or time used to slice a metric"], ["측정된 수치 값", "The measured numeric value"], ["보고서의 제목", "The report title"], ["데이터 저장 형식", "The storage format"]]
  ),
  question(
    ["지표와 차원의 차이는?", "How does a metric differ from a dimension?"],
    [["지표는 측정값, 차원은 그 값을 나누는 기준이다", "A metric is what is measured; a dimension is how it is sliced"], ["지표가 항상 문자열이다", "Metrics are always text"], ["차원은 계산식이다", "Dimensions are calculations"], ["둘은 같은 말이다", "They mean the same thing"]]
  ),
  question(
    ["다음 중 차원에 해당하는 것은?", "Which of these is a dimension?"],
    [["국가", "Country"], ["총 매출", "Total revenue"], ["평균 주문 금액", "Average order value"], ["전환율", "Conversion rate"]]
  ),
  question(
    ["전체 지표가 좋아 보일 때 차원별로 나눠 보는 이유는?", "Why slice a healthy-looking metric by dimension?"],
    [["특정 집단에서 나빠진 신호가 평균에 가려질 수 있다", "A decline in one segment can hide inside the average"], ["계산이 빨라지기 때문이다", "It computes faster"], ["차트가 예뻐지기 때문이다", "The charts look nicer"], ["데이터가 줄어들기 때문이다", "It reduces the data"]]
  ),
  question(
    ["시간 차원을 다룰 때 흔히 함께 보는 비교는?", "Which comparison usually accompanies a time dimension?"],
    [["전 기간 대비와 전년 동기 대비", "Period over period and year over year"], ["파일 크기 비교", "File size comparison"], ["색상 비교", "Color comparison"], ["행 수 비교", "Row count comparison"]]
  ),
  question(
    ["차원 값이 수천 개로 많을 때 보고서에서 할 일은?", "What should a report do when a dimension has thousands of values?"],
    [["상위 항목만 보여 주고 나머지는 묶는다", "Show the top items and group the remainder"], ["전부 나열한다", "List every one of them"], ["차원을 삭제한다", "Remove the dimension"], ["무작위로 고른다", "Pick some at random"]]
  ),
  question(
    ["여러 차원을 동시에 걸어 볼 때 주의할 점은?", "What deserves care when slicing by several dimensions at once?"],
    [["표본이 잘게 쪼개져 우연한 차이가 커 보인다", "The sample fragments and random noise looks like a real difference"], ["계산이 불가능해진다", "It becomes impossible to compute"], ["차원이 사라진다", "The dimensions disappear"], ["문제가 없다", "There is no problem"]]
  ),
  question(
    ["차원 값의 표기가 제각각일 때 필요한 것은?", "What is needed when a dimension's values are spelled inconsistently?"],
    [["표준화해 같은 값으로 묶는다", "Standardize them so they group as one value"], ["그대로 둔다", "Leave them as they are"], ["가장 많은 표기만 남긴다", "Keep only the most common spelling"], ["차원을 삭제한다", "Delete the dimension"]]
  ),
  question(
    ["차원의 계층 구조를 정의하면 좋은 점은?", "What is gained by defining a dimension hierarchy?"],
    [["국가에서 도시로 자연스럽게 파고들 수 있다", "You can drill naturally from country down to city"], ["데이터가 줄어든다", "The data shrinks"], ["계산이 정확해진다", "Calculations become more accurate"], ["색이 정리된다", "The colors get tidier"]]
  ),
  question(
    ["보고서에 필터 조건을 표시해야 하는 이유는?", "Why display the active filters on a report?"],
    [["어떤 범위의 숫자인지 오해 없이 읽히게 한다", "Readers know exactly what scope the numbers cover"], ["보고서가 길어지기 때문이다", "It makes the report longer"], ["색을 늘리기 위해서다", "To add more color"], ["계산이 빨라지기 때문이다", "It speeds up calculation"]]
  ),
];

/** LV.3 dashboard-keeper — Semantic model */
const dashboardKeeperQuiz: readonly QuizQuestion[] = [
  question(
    ["시맨틱 모델이 하는 일은?", "What does a semantic model do?"],
    [["데이터 관계와 공통 비즈니스 정의를 한곳에서 관리한다", "It centralizes data relationships and shared business definitions"], ["차트를 렌더링한다", "It renders charts"], ["데이터를 수집한다", "It collects the data"], ["사용자를 인증한다", "It authenticates users"]]
  ),
  question(
    ["시맨틱 모델을 두면 얻는 가장 큰 이점은?", "What is the biggest benefit of a semantic model?"],
    [["누가 어떤 도구로 물어도 같은 정의의 숫자가 나온다", "Anyone, through any tool, gets numbers from the same definition"], ["쿼리가 항상 빨라진다", "Queries always run faster"], ["저장 비용이 줄어든다", "Storage cost drops"], ["데이터가 자동 생성된다", "Data is generated automatically"]]
  ),
  question(
    ["각 보고서가 자기만의 계산식을 갖고 있으면?", "What happens when every report carries its own formula?"],
    [["같은 이름의 숫자가 보고서마다 달라진다", "The same named number differs from report to report"], ["보고서가 빨라진다", "Reports get faster"], ["정의가 명확해진다", "Definitions get clearer"], ["문제가 없다", "There is no problem"]]
  ),
  question(
    ["수치가 담긴 테이블과 기준이 담긴 테이블을 나눈 구조는?", "What is the layout separating tables of measures from tables of attributes?"],
    [["팩트 테이블과 차원 테이블", "Fact tables and dimension tables"], ["임시 테이블과 뷰", "Temporary tables and views"], ["인덱스와 파티션", "Indexes and partitions"], ["스테이징과 백업", "Staging and backup"]]
  ),
  question(
    ["팩트 테이블과 차원 테이블을 잇는 것은?", "What links a fact table to its dimension tables?"],
    [["공통 키", "A shared key"], ["색상 코드", "A color code"], ["보고서 제목", "The report title"], ["파일 이름", "The file name"]]
  ),
  question(
    ["모델에서 관계를 잘못 정의하면?", "What if a relationship in the model is defined incorrectly?"],
    [["집계 값이 부풀거나 누락돼도 오류 없이 보고된다", "Aggregates inflate or drop silently, with no error to warn you"], ["쿼리가 실패한다", "The query fails"], ["차트가 사라진다", "The chart disappears"], ["아무 영향이 없다", "Nothing is affected"]]
  ),
  question(
    ["모델에 계산 지표를 정의해 두면 좋은 이유는?", "Why define calculated metrics inside the model?"],
    [["한 번 고치면 모든 보고서에 반영된다", "Fixing it once fixes every report"], ["보고서가 짧아진다", "Reports get shorter"], ["색이 통일된다", "Colors become consistent"], ["데이터가 줄어든다", "The data shrinks"]]
  ),
  question(
    ["모델을 바꿀 때 반드시 확인해야 할 것은?", "What must be checked before changing the model?"],
    [["그 정의에 의존하는 기존 보고서와 사용자", "The existing reports and users that depend on the definition"], ["차트의 색상", "The chart colors"], ["파일 이름 규칙", "The file naming rules"], ["대시보드 개수", "The dashboard count"]]
  ),
  question(
    ["같은 지표를 여러 이름으로 만들어 두면?", "What is the cost of the same metric existing under several names?"],
    [["사용자가 어느 것을 써야 할지 알 수 없다", "Users cannot tell which one to use"], ["선택지가 많아 좋다", "More choice is better"], ["계산이 빨라진다", "Calculation gets faster"], ["문제가 없다", "There is no problem"]]
  ),
  question(
    ["시맨틱 모델을 코드로 버전 관리하면 좋은 점은?", "What is gained by version-controlling the semantic model?"],
    [["정의 변경을 리뷰하고 되돌릴 수 있다", "Definition changes become reviewable and reversible"], ["쿼리가 빨라진다", "Queries get faster"], ["저장 공간이 준다", "Storage shrinks"], ["사용자가 늘어난다", "You get more users"]]
  ),
];

/** LV.4 kpi-oracle — Filter/Drill */
const kpiOracleQuiz: readonly QuizQuestion[] = [
  question(
    ["필터와 드릴이 하는 일은?", "What do filtering and drilling do?"],
    [["관심 범위를 좁히거나 더 상세한 수준으로 탐색한다", "They narrow the scope or explore a more detailed level"], ["지표를 새로 정의한다", "They define new metrics"], ["데이터를 적재한다", "They load data"], ["권한을 부여한다", "They grant permissions"]]
  ),
  question(
    ["드릴다운이 뜻하는 것은?", "What does drilling down mean?"],
    [["요약에서 더 세부적인 수준으로 내려가 보는 것", "Moving from a summary into a more detailed level"], ["여러 지표를 합치는 것", "Combining several metrics"], ["필터를 제거하는 것", "Removing every filter"], ["차트 종류를 바꾸는 것", "Switching the chart type"]]
  ),
  question(
    ["지표가 갑자기 떨어졌을 때 첫 조치는?", "What is the first move when a metric suddenly drops?"],
    [["차원별로 쪼개 어디서 떨어졌는지 좁혀 간다", "Slice by dimension to narrow down where the drop came from"], ["보고서를 다시 만든다", "Rebuild the report"], ["차트 색을 바꾼다", "Change the chart colors"], ["지표 정의를 바꾼다", "Redefine the metric"]]
  ),
  question(
    ["필터를 걸었는데 합계가 전체와 맞지 않을 때 확인할 것은?", "What should you check when a filtered total does not add up?"],
    [["결측이나 미분류 값이 제외됐는지", "Whether missing or unclassified values were excluded"], ["차트 크기", "The chart size"], ["글꼴", "The font"], ["파일 이름", "The file name"]]
  ),
  question(
    ["대시보드에 기본 필터를 걸어 둘 때 필요한 것은?", "What must accompany a default filter on a dashboard?"],
    [["무엇이 걸려 있는지 화면에 드러내는 것", "Making the active filter visible on screen"], ["필터를 숨기는 것", "Hiding the filter"], ["색을 바꾸는 것", "Changing the color"], ["제목을 지우는 것", "Removing the title"]]
  ),
  question(
    ["요약 수치만 보고 결론 내리면 위험한 이유는?", "Why is concluding from a summary number alone risky?"],
    [["집단별로 반대되는 흐름이 상쇄되어 보이지 않을 수 있다", "Opposing trends in different segments can cancel out and stay invisible"], ["숫자가 항상 틀리기 때문이다", "Summary numbers are always wrong"], ["계산이 느리기 때문이다", "It is slow to compute"], ["차트가 없기 때문이다", "There is no chart"]]
  ),
  question(
    ["드릴다운을 계속하다 보면 마주치는 한계는?", "What limit do you hit as you keep drilling down?"],
    [["표본이 작아져 차이가 우연일 가능성이 커진다", "The sample shrinks until differences are likely to be chance"], ["차트가 커진다", "The chart grows"], ["색이 부족해진다", "You run out of colors"], ["한계는 없다", "There is no limit"]]
  ),
  question(
    ["대시보드에 상호작용을 넣을 때 고려할 것은?", "What should guide adding interactivity to a dashboard?"],
    [["사용자가 실제로 자주 던지는 질문에 맞춘다", "Match it to the questions users actually ask most"], ["가능한 모든 필터를 넣는다", "Add every possible filter"], ["필터를 하나도 넣지 않는다", "Add no filters at all"], ["색을 늘린다", "Add more colors"]]
  ),
  question(
    ["필터 조건이 복잡해져 사용자가 헤맬 때 방법은?", "What helps when filter options grow confusing?"],
    [["자주 쓰는 조합을 저장된 뷰로 제공한다", "Offer common combinations as saved views"], ["필터를 모두 숨긴다", "Hide all the filters"], ["대시보드를 하나 더 만든다", "Build another dashboard"], ["색을 바꾼다", "Change the colors"]]
  ),
  question(
    ["탐색 결과를 공유할 때 함께 전달해야 할 것은?", "What must accompany a shared exploration result?"],
    [["적용된 필터와 기간, 데이터 기준일", "The applied filters, the period and the as-of date"], ["차트 종류만", "Only the chart type"], ["색상 코드", "The color codes"], ["파일 크기", "The file size"]]
  ),
];

/** LV.5 decision-guardian — Dashboard governance */
const decisionGuardianQuiz: readonly QuizQuestion[] = [
  question(
    ["대시보드 거버넌스가 관리하는 것은?", "What does dashboard governance manage?"],
    [["지표 소유권과 갱신 주기, 접근 권한", "Metric ownership, refresh cadence and access"], ["차트의 색상 팔레트", "The chart color palette"], ["데이터베이스 인덱스", "Database indexes"], ["네트워크 대역폭", "Network bandwidth"]]
  ),
  question(
    ["대시보드마다 담당자를 지정하는 이유는?", "Why assign an owner to each dashboard?"],
    [["숫자가 이상할 때 책임지고 답할 사람이 분명해진다", "Someone is accountable for answering when the numbers look wrong"], ["보고서가 빨라진다", "Reports get faster"], ["색이 통일된다", "Colors become consistent"], ["데이터가 늘어난다", "There is more data"]]
  ),
  question(
    ["대시보드에 갱신 시각을 표시해야 하는 이유는?", "Why display the last refresh time on a dashboard?"],
    [["언제 기준 데이터인지 알아야 판단할 수 있다", "You need to know how current the data is to act on it"], ["화면을 채우기 위해서다", "To fill the screen"], ["색을 늘리기 위해서다", "To add color"], ["로딩을 빠르게 하기 위해서다", "To speed up loading"]]
  ),
  question(
    ["아무도 보지 않는 대시보드를 그대로 두면?", "What happens to dashboards nobody opens?"],
    [["오래된 정의가 남아 언젠가 잘못된 결정을 부른다", "Stale definitions linger and eventually drive a wrong decision"], ["저장 공간만 조금 쓴다", "They only use a little storage"], ["자동으로 갱신된다", "They refresh themselves"], ["문제가 없다", "There is no problem"]]
  ),
  question(
    ["민감한 지표에 접근 권한을 두는 원칙은?", "What principle governs access to sensitive metrics?"],
    [["필요한 사람에게 필요한 범위만 부여한다", "Grant only the scope each person actually needs"], ["전사에 모두 공개한다", "Open everything to the whole company"], ["담당자만 보게 잠근다", "Lock it to the owner alone"], ["권한을 두지 않는다", "Do not manage access at all"]]
  ),
  question(
    ["공식 지표와 실험적 분석을 구분해 두어야 하는 이유는?", "Why separate official metrics from exploratory analysis?"],
    [["검증되지 않은 숫자가 공식 결정에 쓰이는 것을 막는다", "It keeps unvalidated numbers out of official decisions"], ["대시보드를 늘리기 위해서다", "To have more dashboards"], ["색을 나누기 위해서다", "To split the colors"], ["저장 비용 때문이다", "Because of storage cost"]]
  ),
  question(
    ["지표 정의를 바꿀 때 필요한 절차는?", "What process does changing a metric definition require?"],
    [["변경 사유와 영향 범위를 알리고 과거 값과의 관계를 밝힌다", "Announce the reason and impact, and explain how it relates to past values"], ["조용히 바꾼다", "Change it quietly"], ["과거 값을 삭제한다", "Delete the historical values"], ["새 대시보드를 만든다", "Build a new dashboard"]]
  ),
  question(
    ["데이터 파이프라인이 실패했을 때 대시보드가 해야 할 일은?", "What should a dashboard do when its pipeline fails?"],
    [["오래된 데이터임을 분명히 알린다", "Clearly signal that the data is stale"], ["마지막 값을 그대로 보여 준다", "Show the last values as if current"], ["빈 화면을 띄운다", "Show a blank screen"], ["평균으로 채운다", "Fill in the average"]]
  ),
  question(
    ["셀프서비스 BI를 도입할 때 함께 필요한 것은?", "What must accompany a move to self-service BI?"],
    [["공통 정의와 교육, 품질 보증 체계", "Shared definitions, training and a quality assurance process"], ["더 많은 대시보드", "More dashboards"], ["더 많은 색상", "More colors"], ["더 큰 화면", "Bigger screens"]]
  ),
  question(
    ["BI가 성공적으로 자리 잡았는지 보는 기준은?", "How do you tell whether BI has actually taken hold?"],
    [["사람들이 같은 정의를 두고 실제 결정을 내리는지", "Whether people make real decisions from the same definitions"], ["대시보드 개수", "The number of dashboards"], ["차트의 종류 수", "The variety of chart types"], ["데이터 용량", "The volume of data"]]
  ),
];

const biToolsQuiz: readonly (readonly QuizQuestion[])[] = [
  metricFireflyQuiz,
  reportScoutQuiz,
  dashboardKeeperQuiz,
  kpiOracleQuiz,
  decisionGuardianQuiz,
];

export default biToolsQuiz;
