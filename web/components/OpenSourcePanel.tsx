"use client";

import { useEffect, useRef, useState } from "react";
import type Phaser from "phaser";
import { localize, type Locale } from "@codigdex/game-core/i18n/locale";
import { OPEN_SOURCE_CATALOG, OPEN_SOURCE_FAMILIES, OPEN_SOURCE_KIND_LABELS, filterOpenSources, findOpenSource, type OpenSourceFamily } from "@codigdex/game-content/domain/openSourceCatalog";
import { JOB_OPTIONS, type JobId } from "@codigdex/game-content/domain/player/jobs";
import { pauseForOpenSourceNotes, startOpenSourceMission } from "@/lib/phaser/openSourceNotes";
import Image from "next/image";
import { assetUrl } from "@/lib/assets";
import { openSourceCheckpoints } from "@codigdex/game-content/domain/gameProgress";
import { openSourceExpeditionFor } from "@codigdex/game-content/domain/openSourceChapters";
import { SAVE_CHANGE_EVENT, snapshotRegistry } from "@/lib/phaser/registryAdapter";

export function OpenSourcePanel({ game, locale }: { game: Phaser.Game; locale: Locale }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [family, setFamily] = useState<OpenSourceFamily>();
  const [jobId, setJobId] = useState<JobId>();
  const [ids, setIds] = useState<readonly string[]>();
  const [save, setSave] = useState(() => snapshotRegistry(game.registry));
  const pendingMission = useRef<{ family: string; monsterId: string } | undefined>(undefined);
  const ko = locale === "ko";
  const entries = filterOpenSources({ query, family, jobId, ids });
  const checkpoints = openSourceCheckpoints(save);
  useEffect(() => {
    const update = () => setSave(snapshotRegistry(game.registry));
    update();
    window.addEventListener(SAVE_CHANGE_EVENT, update);
    return () => window.removeEventListener(SAVE_CHANGE_EVENT, update);
  }, [game]);

  useEffect(() => {
    const show = (event: Event) => {
      const detail: unknown = (event as CustomEvent).detail;
      if (detail !== null && (!Array.isArray(detail) || !detail.length || !detail.every((id) => typeof id === "string" && findOpenSource(id)))) return;
      setQuery(""); setFamily(undefined); setJobId(undefined); setIds(detail === null ? undefined : detail as string[]); setOpen(true);
    };
    window.addEventListener("codigdex-open-source-notes", show);
    return () => window.removeEventListener("codigdex-open-source-notes", show);
  }, []);

  useEffect(() => {
    if (!open || !dialog.current) return;
    const element = dialog.current;
    const focus = document.activeElement instanceof HTMLElement ? document.activeElement : launcher.current;
    const resume = pauseForOpenSourceNotes(game);
    element.showModal();
    return () => {
      element.close();
      resume();
      const mission = pendingMission.current;
      pendingMission.current = undefined;
      if (mission) {
        startOpenSourceMission(game, mission);
      }
      if (focus?.isConnected) focus.focus();
    };
  }, [open, game]);

  const reset = () => { setQuery(""); setFamily(undefined); setJobId(undefined); setIds(undefined); };
  return <>
    <button ref={launcher} className="source-launch" onKeyDown={(event) => event.stopPropagation()} onClick={() => { reset(); setOpen(true); }} aria-haspopup="dialog">{ko ? "오픈소스 탐험" : "OPEN-SOURCE NOTES"}</button>
    <dialog ref={dialog} className="source-dialog" aria-labelledby="source-title" onCancel={() => setOpen(false)} onClose={() => setOpen(false)} onKeyDown={(event) => event.stopPropagation()}>
      <div className="source-heading">
        <div><h2 id="source-title">{ko ? "오픈소스 탐험 노트" : "OPEN-SOURCE FIELD NOTES"}</h2>
          <p>{ko ? "9개 생태계의 이야기를 따라 38종을 포획하세요. 공통 경로 완료 후 열리며 전직 MASTER 조건에는 영향을 주지 않습니다." : "Follow 9 ecosystem stories and capture 38 creatures. Opens after the common path; career MASTER requirements stay the same."}</p></div>
        <button onClick={() => setOpen(false)} aria-label={ko ? "오픈소스 탐험 닫기" : "Close open-source notes"}>×</button>
      </div>
      <div className="source-filters">
        <label>{ko ? "검색" : "Search"}<input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder={ko ? "Kafka, 하둡, 계보…" : "Kafka, Hadoop, lineage…"} /></label>
        <label>{ko ? "생태계" : "Ecosystem"}<select value={family ?? ""} onChange={(e) => setFamily(e.target.value as OpenSourceFamily || undefined)}>
          <option value="">{ko ? "모든 생태계" : "All ecosystems"}</option>
          {Object.entries(OPEN_SOURCE_FAMILIES).map(([id, copy]) => <option key={id} value={id}>{localize(copy, locale)}</option>)}
        </select></label>
        <label>{ko ? "직업 경로" : "Career path"}<select value={jobId ?? ""} onChange={(e) => setJobId(e.target.value as JobId || undefined)}>
          <option value="">{ko ? "모든 경로" : "All paths"}</option>
          {JOB_OPTIONS.map((job) => <option key={job.id} value={job.id}>{localize(job.name, locale)}</option>)}
        </select></label>
        <button onClick={reset}>{ko ? "전체 보기" : "Show all"}</button>
      </div>
      <p role="status" className="source-count">{entries.length}/{OPEN_SOURCE_CATALOG.length} · {ids ? (ko ? "현재 의뢰의 관련 도구" : "Tools related to this mission") : (ko ? "프로젝트·구성요소·데이터 형식" : "Projects, components and data formats")}</p>
      <div className="source-results">
        {!entries.length ? <p>{ko ? "조건에 맞는 도구가 없습니다. 검색이나 필터를 바꿔 보세요." : "No matching tools. Try changing the search or filters."}</p> : null}
        <div className="source-grid">{entries.map((entry) => {
          const checkpoint = checkpoints.find(({ monster }) => monster.id === `open-source:${entry.id}`)!;
          const expedition = openSourceExpeditionFor(entry.family)!;
          const complete = expedition.chapter.stages.every(({ id }) => save.progress.captures.some((capture) => capture.id === id));
          return <article className="source-card" key={entry.id} data-project={entry.id}>
          <p className="source-kicker">{localize(OPEN_SOURCE_FAMILIES[entry.family], locale)} · {localize(OPEN_SOURCE_KIND_LABELS[entry.kind], locale)}</p>
          {entry.character.assetKey ? <Image className="source-character" src={assetUrl(entry.character.assetKey)} alt={localize(entry.character.name, locale)} width={256} height={256} unoptimized /> : null}
          <h3>{entry.name}</h3>
          {entry.parentId ? <p className="source-parent">{ko ? "구성요소:" : "Component of:"} {findOpenSource(entry.parentId)!.name}</p> : null}
          <p>{localize(entry.role, locale)}</p>
          <p className="source-learning">{localize(entry.learning, locale)}</p>
          <div className="source-creature"><strong>{localize(entry.character.name, locale)}</strong><p>{localize(entry.character.motif, locale)}</p></div>
          <details className="source-story"><summary>{localize(expedition.chapter.name, locale)}</summary><p>{localize(complete ? expedition.ending : expedition.intro, locale)}</p></details>
          <p className="source-mission-status">{checkpoint.status === "cleared" ? (ko ? "✓ 도감 등록 완료" : "✓ REGISTERED IN DEX") : checkpoint.status === "locked" ? (ko ? "공통 경로와 이 생태계의 선행 의뢰를 완료하세요." : "Complete the common path and earlier missions in this ecosystem.") : (ko ? "의뢰 가능 · 4문항 중 3문항 정답으로 포획" : "MISSION AVAILABLE · Capture with 3 of 4 correct")}</p>
          <button disabled={checkpoint.status === "locked"} onClick={() => { pendingMission.current = { family: entry.family, monsterId: checkpoint.monster.id }; setOpen(false); }}>{checkpoint.status === "cleared" ? (ko ? "의뢰 다시 도전" : "REPLAY MISSION") : (ko ? "이야기 · 의뢰 시작" : "STORY · START MISSION")}</button>
          <a href={entry.officialUrl} target="_blank" rel="noopener noreferrer">{ko ? "공식 프로젝트 자료 ↗" : "Official project documentation ↗"}</a>
        </article>; })}</div>
      </div>
    </dialog>
  </>;
}
