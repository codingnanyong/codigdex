import type { QuizQuestion } from "@codigdex/game-core/domain/chapters/types";
import { question } from "../question";

/** LV.1 sample-owl — Sample */
const sampleOwlQuiz: readonly QuizQuestion[] = [
  question(
    ["표본(sample)이 뜻하는 것은?", "What is a sample?"],
    [["모집단을 이해하기 위해 선택한 일부 관측값", "A subset of observations chosen to understand a population"], ["전체 모집단 그 자체", "The entire population itself"], ["평균값 하나", "A single average"], ["측정 오차", "A measurement error"]]
  ),
  question(
    ["모집단이 뜻하는 것은?", "What is a population?"],
    [["알고자 하는 대상 전체", "The whole group you want to learn about"], ["수집한 데이터의 일부", "A portion of the collected data"], ["설문 응답자 수", "The number of survey responses"], ["표본의 평균", "The sample mean"]]
  ),
  question(
    ["모든 대상이 뽑힐 확률이 같은 표집 방법은?", "Which sampling method gives every member an equal chance?"],
    [["단순 무작위 표집", "Simple random sampling"], ["편의 표집", "Convenience sampling"], ["자발적 응답 표집", "Voluntary response sampling"], ["할당 표집", "Quota sampling"]]
  ),
  question(
    ["가장 접근하기 쉬운 대상만 조사했을 때 생기는 문제는?", "What goes wrong when you survey only whoever is easiest to reach?"],
    [["표본이 모집단을 대표하지 못해 결론이 치우친다", "The sample fails to represent the population and skews the conclusion"], ["표본 크기가 커진다", "The sample size grows"], ["분산이 사라진다", "Variance disappears"], ["문제가 없다", "Nothing goes wrong"]]
  ),
  question(
    ["표본 크기를 키우면 일반적으로 일어나는 일은?", "What generally happens as sample size grows?"],
    [["추정값의 불확실성이 줄어든다", "Uncertainty in the estimate shrinks"], ["편향이 자동으로 사라진다", "Bias disappears automatically"], ["모집단이 커진다", "The population grows"], ["분산이 0이 된다", "Variance becomes zero"]]
  ),
  question(
    ["표본 크기를 키워도 해결되지 않는 문제는?", "Which problem more data cannot fix?"],
    [["표집 방법 자체에서 온 편향", "Bias built into the sampling method itself"], ["추정값의 흔들림", "Noise in the estimate"], ["신뢰 구간의 폭", "The width of the confidence interval"], ["표준 오차", "The standard error"]]
  ),
  question(
    ["평균, 중앙값, 최빈값 중 극단값에 가장 덜 흔들리는 것은?", "Which is least affected by extreme values: mean, median or mode?"],
    [["중앙값", "The median"], ["평균", "The mean"], ["최빈값", "The mode"], ["모두 같다", "They are equally affected"]]
  ),
  question(
    ["소득처럼 한쪽으로 치우친 데이터의 대표값으로 나은 것은?", "Which better summarizes skewed data such as income?"],
    [["중앙값", "The median"], ["평균", "The mean"], ["최댓값", "The maximum"], ["합계", "The sum"]]
  ),
  question(
    ["설문에서 응답한 사람만 집계했을 때 생기는 편향은?", "Which bias appears when only respondents are counted?"],
    [["무응답 편향", "Non-response bias"], ["측정 편향", "Measurement bias"], ["출판 편향", "Publication bias"], ["확증 편향", "Confirmation bias"]]
  ),
  question(
    ["데이터를 보기 전에 분석 질문을 정하는 이유는?", "Why decide the analysis question before looking at the data?"],
    [["원하는 결론에 맞춰 사후에 해석을 고르는 일을 막는다", "It prevents picking an interpretation afterwards to fit a desired conclusion"], ["계산이 빨라지기 때문이다", "It makes the math faster"], ["표본이 커지기 때문이다", "It increases the sample size"], ["분산이 줄기 때문이다", "It reduces variance"]]
  ),
];

/** LV.2 probability-reader — Probability */
const probabilityReaderQuiz: readonly QuizQuestion[] = [
  question(
    ["확률이 나타내는 값의 범위는?", "What range does a probability fall in?"],
    [["0과 1 사이", "Between 0 and 1"], ["-1과 1 사이", "Between -1 and 1"], ["0과 100 사이의 정수", "Whole numbers from 0 to 100"], ["제한이 없다", "There is no range"]]
  ),
  question(
    ["서로 배타적인 두 사건 중 하나가 일어날 확률은?", "What is the probability that one of two mutually exclusive events occurs?"],
    [["각 확률의 합", "The sum of their probabilities"], ["각 확률의 곱", "The product of their probabilities"], ["둘 중 큰 값", "The larger of the two"], ["둘의 평균", "Their average"]]
  ),
  question(
    ["서로 독립인 두 사건이 모두 일어날 확률은?", "What is the probability that two independent events both occur?"],
    [["각 확률의 곱", "The product of their probabilities"], ["각 확률의 합", "The sum of their probabilities"], ["둘 중 작은 값", "The smaller of the two"], ["항상 0", "Always zero"]]
  ),
  question(
    ["두 사건이 독립이라는 말의 뜻은?", "What does it mean for two events to be independent?"],
    [["한 사건이 일어나도 다른 사건의 확률이 변하지 않는다", "One occurring does not change the other's probability"], ["두 사건이 동시에 일어날 수 없다", "They cannot both happen"], ["두 사건의 확률이 같다", "They have equal probability"], ["두 사건이 항상 함께 일어난다", "They always happen together"]]
  ),
  question(
    ["동전을 다섯 번 던져 모두 앞면이 나왔을 때 다음 던지기의 확률은?", "After five heads in a row, what is the chance the next flip is heads?"],
    [["여전히 절반", "Still one half"], ["절반보다 낮다", "Lower than one half"], ["절반보다 높다", "Higher than one half"], ["확실히 뒷면이다", "It will certainly be tails"]]
  ),
  question(
    ["앞의 결과가 다음에 영향을 준다고 믿는 오류를 부르는 말은?", "What is the fallacy of believing past results sway the next one?"],
    [["도박사의 오류", "The gambler's fallacy"], ["기저율 무시", "Base rate neglect"], ["생존자 편향", "Survivorship bias"], ["심슨의 역설", "Simpson's paradox"]]
  ),
  question(
    ["조건부 확률이 뜻하는 것은?", "What does a conditional probability express?"],
    [["한 사건이 일어났다는 조건에서 다른 사건이 일어날 확률", "The chance of one event given that another has occurred"], ["두 사건의 확률의 합", "The sum of two probabilities"], ["사건이 일어나지 않을 확률", "The chance an event does not occur"], ["평균 발생 횟수", "The average number of occurrences"]]
  ),
  question(
    ["희귀한 병에 양성이 나왔을 때 실제 환자일 확률이 낮을 수 있는 이유는?", "Why can a positive test for a rare disease still mean a low chance of illness?"],
    [["기저 발병률이 낮아 거짓 양성이 상대적으로 많기 때문이다", "The low base rate means false positives outnumber true ones"], ["검사가 항상 틀리기 때문이다", "The test is always wrong"], ["확률이 1을 넘기 때문이다", "The probability exceeds one"], ["표본이 크기 때문이다", "The sample is large"]]
  ),
  question(
    ["여러 번 반복하면 평균이 기댓값에 가까워진다는 법칙은?", "Which law says repeated trials pull the average toward the expected value?"],
    [["큰 수의 법칙", "The law of large numbers"], ["중심 극한 정리", "The central limit theorem"], ["베이즈 정리", "Bayes' theorem"], ["파레토 법칙", "The Pareto principle"]]
  ),
  question(
    ["기댓값을 계산하는 방법은?", "How do you compute an expected value?"],
    [["각 결과에 그 확률을 곱해 모두 더한다", "Multiply each outcome by its probability and sum them"], ["가장 큰 결과를 고른다", "Take the largest outcome"], ["결과의 개수로 나눈다", "Divide by the number of outcomes"], ["확률을 모두 더한다", "Add up the probabilities"]]
  ),
];

/** LV.3 distribution-scholar — Distribution */
const distributionScholarQuiz: readonly QuizQuestion[] = [
  question(
    ["분포가 설명하는 것은?", "What does a distribution describe?"],
    [["가능한 값과 그 확률의 패턴", "The possible values and the pattern of their probabilities"], ["표본의 크기", "The size of the sample"], ["측정 도구의 정확도", "The accuracy of the instrument"], ["데이터 수집 일정", "The data collection schedule"]]
  ),
  question(
    ["평균을 중심으로 좌우가 대칭인 종 모양 분포는?", "Which distribution is the symmetric bell shape centered on its mean?"],
    [["정규 분포", "The normal distribution"], ["균등 분포", "The uniform distribution"], ["지수 분포", "The exponential distribution"], ["이항 분포", "The binomial distribution"]]
  ),
  question(
    ["모든 값이 나올 가능성이 같은 분포는?", "Which distribution gives every value the same chance?"],
    [["균등 분포", "The uniform distribution"], ["정규 분포", "The normal distribution"], ["포아송 분포", "The Poisson distribution"], ["지수 분포", "The exponential distribution"]]
  ),
  question(
    ["성공과 실패 두 결과의 반복 시행을 다루는 분포는?", "Which distribution models repeated trials with two outcomes?"],
    [["이항 분포", "The binomial distribution"], ["정규 분포", "The normal distribution"], ["균등 분포", "The uniform distribution"], ["지수 분포", "The exponential distribution"]]
  ),
  question(
    ["한쪽으로 길게 꼬리가 늘어진 분포를 부르는 말은?", "What is a distribution with one long tail called?"],
    [["치우친 분포", "A skewed distribution"], ["대칭 분포", "A symmetric distribution"], ["균등 분포", "A uniform distribution"], ["이산 분포", "A discrete distribution"]]
  ),
  question(
    ["오른쪽으로 치우친 분포에서 평균과 중앙값의 관계는?", "In a right-skewed distribution, how do the mean and median compare?"],
    [["평균이 중앙값보다 크다", "The mean is greater than the median"], ["평균이 중앙값보다 작다", "The mean is less than the median"], ["둘은 항상 같다", "They are always equal"], ["관계를 알 수 없다", "No relationship exists"]]
  ),
  question(
    ["표본 평균의 분포가 정규에 가까워진다는 정리는?", "Which theorem says the distribution of sample means approaches normal?"],
    [["중심 극한 정리", "The central limit theorem"], ["큰 수의 법칙", "The law of large numbers"], ["베이즈 정리", "Bayes' theorem"], ["체비셰프 부등식", "Chebyshev's inequality"]]
  ),
  question(
    ["정규 분포에서 평균 ±1 표준편차 안에 들어가는 비율은?", "What share of a normal distribution lies within one standard deviation of the mean?"],
    [["약 68%", "About 68%"], ["약 50%", "About 50%"], ["약 95%", "About 95%"], ["약 99%", "About 99%"]]
  ),
  question(
    ["데이터의 분포 모양을 먼저 확인해야 하는 이유는?", "Why inspect the shape of a distribution first?"],
    [["평균이나 정규성을 전제한 방법이 맞는지 판단할 수 있다", "It tells you whether methods assuming a mean or normality even apply"], ["계산이 빨라지기 때문이다", "It speeds up the computation"], ["표본이 커지기 때문이다", "It increases the sample size"], ["편향이 사라지기 때문이다", "It removes bias"]]
  ),
  question(
    ["같은 평균과 분산을 가진 데이터가 전혀 다른 모양일 수 있다는 사실이 시사하는 것은?", "What does it imply that datasets with equal mean and variance can look entirely different?"],
    [["요약 통계만 보지 말고 분포를 그려 봐야 한다", "Summary statistics are not enough; plot the distribution"], ["요약 통계는 항상 충분하다", "Summary statistics are always sufficient"], ["분산은 쓸모없다", "Variance is useless"], ["평균은 계산할 수 없다", "The mean cannot be computed"]]
  ),
];

/** LV.4 variance-oracle — Variance */
const varianceOracleQuiz: readonly QuizQuestion[] = [
  question(
    ["분산이 측정하는 것은?", "What does variance measure?"],
    [["값들이 평균에서 얼마나 퍼져 있는지", "How far values spread from their mean"], ["값들의 중앙 위치", "The central location of the values"], ["표본의 크기", "The size of the sample"], ["가장 자주 나오는 값", "The most frequent value"]]
  ),
  question(
    ["표준편차와 분산의 관계는?", "How does standard deviation relate to variance?"],
    [["표준편차는 분산의 제곱근이다", "Standard deviation is the square root of variance"], ["표준편차는 분산의 제곱이다", "Standard deviation is variance squared"], ["둘은 같은 값이다", "They are the same number"], ["관계가 없다", "They are unrelated"]]
  ),
  question(
    ["분산 대신 표준편차를 자주 쓰는 이유는?", "Why is standard deviation often preferred over variance?"],
    [["원래 데이터와 같은 단위라 해석하기 쉽다", "It shares the data's units, so it is easier to interpret"], ["항상 더 작기 때문이다", "It is always smaller"], ["계산이 더 빠르기 때문이다", "It is faster to compute"], ["음수가 될 수 있기 때문이다", "It can be negative"]]
  ),
  question(
    ["분산이 0이라는 것은?", "What does a variance of zero mean?"],
    [["모든 값이 동일하다", "Every value is identical"], ["평균이 0이다", "The mean is zero"], ["표본이 비어 있다", "The sample is empty"], ["분포가 정규다", "The distribution is normal"]]
  ),
  question(
    ["단위가 다른 두 집단의 산포를 비교할 때 쓰는 지표는?", "Which measure compares spread across groups with different units?"],
    [["변동 계수", "The coefficient of variation"], ["분산", "Variance"], ["범위", "The range"], ["합계", "The sum"]]
  ),
  question(
    ["평균에서 크게 벗어난 관측값을 부르는 말은?", "What is an observation far from the rest called?"],
    [["이상치", "An outlier"], ["중앙값", "The median"], ["잔차 평균", "The mean residual"], ["최빈값", "The mode"]]
  ),
  question(
    ["이상치를 발견했을 때 바람직한 태도는?", "What is the right attitude toward an outlier?"],
    [["원인을 조사한 뒤 처리 방침을 정하고 기록한다", "Investigate the cause, then decide and document how to treat it"], ["무조건 삭제한다", "Always delete it"], ["무조건 남긴다", "Always keep it silently"], ["평균으로 바꾼다", "Replace it with the mean"]]
  ),
  question(
    ["두 변수가 함께 움직이는 정도를 -1과 1 사이로 나타내는 값은?", "Which value expresses how two variables move together, between -1 and 1?"],
    [["상관 계수", "The correlation coefficient"], ["분산", "Variance"], ["표준 오차", "The standard error"], ["p값", "The p-value"]]
  ),
  question(
    ["상관관계가 인과관계를 뜻하지 않는 이유는?", "Why does correlation not imply causation?"],
    [["둘 다에 영향을 주는 제3의 요인이 있을 수 있다", "A third factor may be driving both"], ["상관 계수는 항상 틀리기 때문이다", "Correlation coefficients are always wrong"], ["표본이 작기 때문이다", "The sample is small"], ["분산이 크기 때문이다", "The variance is large"]]
  ),
  question(
    ["집단을 나눠 보면 추세가 뒤집히는 현상을 부르는 말은?", "What is it called when a trend reverses once the data is split into groups?"],
    [["심슨의 역설", "Simpson's paradox"], ["도박사의 오류", "The gambler's fallacy"], ["중심 극한 정리", "The central limit theorem"], ["큰 수의 법칙", "The law of large numbers"]]
  ),
];

/** LV.5 inference-guardian — Inference */
const inferenceGuardianQuiz: readonly QuizQuestion[] = [
  question(
    ["통계적 추론이 하는 일은?", "What does statistical inference do?"],
    [["표본을 사용해 모집단에 관한 결론을 추정한다", "It uses a sample to estimate conclusions about a population"], ["모집단 전체를 직접 측정한다", "It measures the entire population directly"], ["데이터를 저장한다", "It stores the data"], ["차트를 그린다", "It draws charts"]]
  ),
  question(
    ["귀무가설이 뜻하는 것은?", "What is the null hypothesis?"],
    [["차이나 효과가 없다는 기본 전제", "The default assumption that there is no difference or effect"], ["증명하고 싶은 주장", "The claim you want to prove"], ["표본의 평균", "The sample mean"], ["측정 오차", "The measurement error"]]
  ),
  question(
    ["p값이 뜻하는 것은?", "What does a p-value express?"],
    [["귀무가설이 참일 때 이 정도 결과가 나올 확률", "The chance of seeing a result this extreme if the null is true"], ["귀무가설이 참일 확률", "The probability that the null hypothesis is true"], ["효과의 크기", "The size of the effect"], ["표본이 대표적일 확률", "The chance the sample is representative"]]
  ),
  question(
    ["p값이 작다는 것이 보장하지 않는 것은?", "What does a small p-value NOT guarantee?"],
    [["효과가 실제로 중요할 만큼 크다는 것", "That the effect is large enough to matter"], ["결과가 우연으로 설명되기 어렵다는 것", "That chance alone explains the result poorly"], ["검정이 수행됐다는 것", "That a test was performed"], ["표본이 존재한다는 것", "That a sample exists"]]
  ),
  question(
    ["신뢰 구간이 알려 주는 것은?", "What does a confidence interval tell you?"],
    [["추정값이 가질 수 있는 범위와 그 불확실성", "The plausible range for the estimate and its uncertainty"], ["정확한 참값", "The exact true value"], ["표본의 크기", "The sample size"], ["귀무가설의 진위", "Whether the null is true"]]
  ),
  question(
    ["효과 크기를 함께 보고해야 하는 이유는?", "Why report an effect size alongside significance?"],
    [["통계적 유의성과 실질적 중요성은 다르기 때문이다", "Statistical significance and practical importance are different things"], ["p값을 낮추기 위해서다", "To lower the p-value"], ["표본을 줄이기 위해서다", "To reduce the sample size"], ["분산을 없애기 위해서다", "To eliminate variance"]]
  ),
  question(
    ["유의한 결과가 나올 때까지 검정을 반복하는 문제를 부르는 말은?", "What is repeatedly testing until something turns significant called?"],
    [["p-해킹", "p-hacking"], ["부트스트래핑", "Bootstrapping"], ["층화 표집", "Stratified sampling"], ["정규화", "Normalization"]]
  ),
  question(
    ["A/B 테스트에서 실험 전에 정해야 할 것은?", "What must be fixed before an A/B test starts?"],
    [["지표, 표본 크기, 실험 기간", "The metric, the sample size and the duration"], ["원하는 결론", "The conclusion you want"], ["승자 그룹", "Which group will win"], ["결과 발표 자료", "The results presentation"]]
  ),
  question(
    ["A/B 테스트를 중간에 보고 유리할 때 멈추면?", "What if you peek at an A/B test and stop when it looks favorable?"],
    [["우연한 변동을 효과로 착각할 확률이 크게 높아진다", "Random fluctuation is much more likely to be mistaken for an effect"], ["결과가 더 정확해진다", "The result becomes more accurate"], ["표본이 커진다", "The sample grows"], ["아무 영향이 없다", "Nothing is affected"]]
  ),
  question(
    ["분석 결과를 보고할 때 함께 밝혀야 할 것은?", "What should accompany a reported analysis?"],
    [["가정, 표본의 한계, 불확실성", "The assumptions, the sample's limits and the uncertainty"], ["결론만 간단히", "Only the conclusion"], ["가장 큰 숫자만", "Only the biggest number"], ["차트 색상 선택", "The chart color choices"]]
  ),
];

const statisticsQuiz: readonly (readonly QuizQuestion[])[] = [
  sampleOwlQuiz,
  probabilityReaderQuiz,
  distributionScholarQuiz,
  varianceOracleQuiz,
  inferenceGuardianQuiz,
];

export default statisticsQuiz;
