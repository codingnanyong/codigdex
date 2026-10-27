import { text, type LocalizedText } from "@codigdex/game-core/i18n/locale";
import type { ChapterDefinition } from "@codigdex/game-core/domain/chapters/types";
import { quizPackIdFor } from "@codigdex/game-core/domain/dex/quiz";
import { OPEN_SOURCE_CATALOG, OPEN_SOURCE_FAMILIES, type OpenSourceFamily } from "./openSourceCatalog";

export interface OpenSourceExpedition {
  chapter: ChapterDefinition;
  intro: LocalizedText;
  ending: LocalizedText;
}
const stories: Record<OpenSourceFamily, readonly [LocalizedText, LocalizedText, LocalizedText]> = {
  hadoop: [text("코끼리 숲의 분업", "The Elephant Forest Cooperative"), text("폭풍에 흩어진 씨앗 기록을 되찾아야 해요. 저장·자원·처리의 역할을 나누어 숲의 길을 복구해 주세요.", "A storm scattered the seed records. Restore the forest paths by separating storage, resources and processing."), text("씨앗의 위치와 일의 순서가 돌아왔어요. 서로 다른 도구가 협력하는 숲이 되었습니다.", "The seeds and work are in order again. The forest thrives through tools with distinct responsibilities.")],
  orchestration: [text("바람새의 시간표", "Windwing's Timetable"), text("물주기가 수확보다 늦게 시작됐어요. 바람새와 함께 작업의 의존성과 재시도를 정리해 주세요.", "Watering started after the harvest. Help Windwing restore task dependencies and retries."), text("앞선 작업의 약속을 따라 수확이 끝났어요. 실패한 작업도 안전하게 다시 이어 갑니다.", "The harvest follows its dependencies again, and failed work can resume safely.")],
  streaming: [text("끊어진 전령길", "The Broken Messenger Route"), text("숲의 소식이 중복되거나 늦게 도착해요. 변경 수집부터 전달·처리까지 전령길을 점검해 주세요.", "Forest messages arrive late or twice. Inspect the route from change capture through delivery and processing."), text("전령길이 돌아왔어요. 각 도구의 경계와 처리 위치를 기록해 다음 소식도 이어 갑니다.", "The messenger route is restored. Recorded responsibilities and positions keep future messages moving.")],
  lakehouse: [text("여러 시점의 호수", "The Lake of Many Snapshots"), text("어제의 기록과 오늘의 기록이 뒤섞였어요. 파일·테이블·쿼리의 역할을 구분해 호수의 지도를 복구해 주세요.", "Yesterday's records are mixed with today's. Restore the lake map by distinguishing files, tables and query engines."), text("호수의 기록을 다시 읽을 수 있어요. 처리 엔진과 테이블의 약속이 함께 지도를 지킵니다.", "The lake records can be read again. Engines and table guarantees protect the map together.")],
  quality: [text("기록의 뿌리를 찾아서", "Following the Roots of Records"), text("잘못된 열매가 어디서 왔는지 모르겠어요. 변환·검증·계보의 단서를 이어 원천을 찾아 주세요.", "Nobody knows where the bad fruit came from. Connect transformation, validation and lineage clues."), text("열매의 원천과 검증 기준을 찾았어요. 바뀐 가지가 어디에 영향을 주는지도 알 수 있습니다.", "The fruit's origin and validation rules are known. We can trace the impact of changed branches.")],
  analytics: [text("별지도 전시장", "The Star Map Gallery"), text("숲의 수확 기록이 숫자로만 쌓였어요. 같은 지표를 함께 읽을 수 있는 대시보드를 만들어 주세요.", "Harvest records are just piles of numbers. Build a dashboard that helps everyone read the same metrics."), text("별지도에 수확의 변화가 드러났어요. 차트의 기준과 필터를 함께 읽는 전시장이 열렸습니다.", "The star map reveals the harvest trend. The gallery shares chart definitions and filters.")],
  ml: [text("재현의 온실", "The Reproducible Greenhouse"), text("잘 자랐던 모형의 씨앗과 조건을 잃었어요. 데이터·특징·실험·평가를 구분해 온실을 복구해 주세요.", "A successful model lost its seeds and growing conditions. Restore data, features, experiments and evaluation."), text("같은 조건으로 결과를 다시 확인했어요. 학습과 시험의 경계도 온실에 남겼습니다.", "Results can be checked under the same conditions, with clear boundaries between training and testing.")],
  platform: [text("등대의 다섯 신호", "Five Signals at the Lighthouse"), text("항구의 실제 모습과 기록이 달라졌어요. 계측·지표·시각화·배포·인프라의 역할을 맞춰 주세요.", "The harbor differs from its records. Align instrumentation, metrics, dashboards, delivery and infrastructure."), text("등대의 신호와 출항 약속이 다시 맞아요. 관측과 변경을 구분해 안전한 항해를 지킵니다.", "The lighthouse signals match the departure plans again. Observation and controlled change keep voyages safe.")],
  application: [text("약속을 지키는 마을", "The Village of Contracts"), text("장부·입구·기억·여정에 서로 다른 문제가 생겼어요. 저장·검증·캐시·브라우저 테스트로 마을의 약속을 되찾아 주세요.", "The ledger, gate, memory and journey each have a different fault. Restore them with storage, validation, caching and browser tests."), text("마을의 약속을 확인했어요. 데이터의 변경부터 사용자의 마지막 발걸음까지 이어집니다.", "The village contracts are verified, from data changes to the user's final step.")],
};

let dex = 136;
export const OPEN_SOURCE_EXPEDITIONS: readonly OpenSourceExpedition[] = (Object.keys(OPEN_SOURCE_FAMILIES) as OpenSourceFamily[]).map((family, index) => {
  const [name, intro, ending] = stories[family];
  const id = `open-source:${family}` as const;
  return { intro, ending, chapter: {
    id, label: `EX.${String(index + 1).padStart(2, "0")}`, name,
    place: OPEN_SOURCE_FAMILIES[family], requires: "linux", npcName: text("탐험 기록관", "Expedition Archivist"),
    successLine: text("역할의 단서를 되찾았어요. 다음 의뢰에도 배운 것을 이어 주세요!", "A responsibility clue is restored. Carry it into the next mission!"),
    retryLine: text("역할과 학습 노트를 다시 읽고 재도전해요.", "Read the role and learning notes, then try again."),
    retryScene: "open-source-chapter",
    stages: OPEN_SOURCE_CATALOG.filter((entry) => entry.family === family).map((entry) => {
      const monsterId = `open-source:${entry.id}`;
      return {
        id: monsterId, dexNumber: String(dex++).padStart(3, "0"), level: 2,
        name: entry.character.name, classification: text(entry.name, entry.name), trait: entry.learning,
        description: entry.role, snippet: entry.learning,
        textureKey: monsterId, assetKey: entry.character.assetKey!, quizPackId: quizPackIdFor(id, monsterId),
        briefing: text(`${entry.character.motif.ko}. ${entry.name}의 역할을 이해하고 기록을 되찾아 주세요.`, `${entry.character.motif.en}. Understand ${entry.name}'s role to restore its record.`),
        preBattleLine: text(`${entry.name}: ${entry.learning.ko}`, `${entry.name}: ${entry.learning.en}`),
      };
    }),
  } };
});
export const OPEN_SOURCE_CHAPTERS = OPEN_SOURCE_EXPEDITIONS.map(({ chapter }) => chapter);
export function openSourceExpeditionFor(family: string | undefined) {
  return OPEN_SOURCE_EXPEDITIONS.find(({ chapter }) => chapter.id === `open-source:${family}`);
}
export function openSourceStageFor(id: string) {
  return OPEN_SOURCE_CHAPTERS.flatMap(({ stages }) => stages).find((stage) => stage.id === `open-source:${id}`);
}
