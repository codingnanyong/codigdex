"use client";

import { useEffect, useRef, useState } from "react";
import type Phaser from "phaser";
import { localize, type Locale } from "@codigdex/game-core/i18n/locale";
import { OPEN_SOURCE_FAMILIES, OPEN_SOURCE_KIND_LABELS, filterOpenSources, findOpenSource, type OpenSourceFamily } from "@codigdex/game-content/domain/openSourceCatalog";
import { JOB_OPTIONS } from "@codigdex/game-content/domain/player/jobs";
import { SOURCE_CAREERS, activeSourceCareer, encounterTools, sourceCareer, sourceCareerName, type SourceCareerId } from "@codigdex/game-content/domain/openSourceEncounters";
import { pauseForOpenSourceNotes } from "@/lib/phaser/openSourceNotes";
import Image from "next/image";
import { assetUrl } from "@/lib/assets";
import { SAVE_CHANGE_EVENT, snapshotRegistry } from "@/lib/phaser/registryAdapter";
import { discoveredSourceIds, sourceEvents, SOURCE_EVENTS_CHANGED } from "@/lib/phaser/openSourceEvents";

export function OpenSourcePanel({ game, locale }: { game: Phaser.Game; locale: Locale }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [family, setFamily] = useState<OpenSourceFamily>();
  const [jobId, setJobId] = useState<SourceCareerId>();
  const [ids, setIds] = useState<readonly string[]>();
  const [save, setSave] = useState(() => snapshotRegistry(game.registry));
  const ko = locale === "ko";
  const history = sourceEvents(game.registry).read(save);
  const discovered = discoveredSourceIds(game.registry, save);
  const roleTools = jobId ? new Set(encounterTools(jobId).map(({ id }) => id)) : undefined;
  const entries = filterOpenSources({ query, family, ids }).filter(({ id }) => discovered.has(id) && (!roleTools || roleTools.has(id)));
  useEffect(() => {
    const update = () => setSave(snapshotRegistry(game.registry));
    update();
    window.addEventListener(SAVE_CHANGE_EVENT, update);
    window.addEventListener(SOURCE_EVENTS_CHANGED, update);
    return () => { window.removeEventListener(SAVE_CHANGE_EVENT, update); window.removeEventListener(SOURCE_EVENTS_CHANGED, update); };
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
      if (focus?.isConnected) focus.focus();
    };
  }, [open, game]);

  const reset = () => { setQuery(""); setFamily(undefined); setJobId(undefined); setIds(undefined); };
  return <>
    <button ref={launcher} className="source-launch" onKeyDown={(event) => event.stopPropagation()} onClick={() => { reset(); setOpen(true); }} aria-haspopup="dialog">{ko ? "오픈소스 노트" : "OPEN-SOURCE NOTES"}</button>
    <dialog ref={dialog} className="source-dialog" aria-labelledby="source-title" onCancel={() => setOpen(false)} onClose={() => setOpen(false)} onKeyDown={(event) => event.stopPropagation()}>
      <div className="source-heading">
        <div><h2 id="source-title">{ko ? "발견한 오픈소스 노트" : "OPEN-SOURCE FIELD NOTES"}</h2>
          <p>{ko ? "직무 전투 뒤 돌발 의뢰로 만난 도구를 복습합니다. 의뢰를 해결하면 같은 도구가 도감에도 등록됩니다. 기존 포획 기록은 그대로 보존됩니다." : "Review tools met through surprise requests after career battles. Solving a request also registers its tool in your dex. Existing captures are preserved."}</p></div>
        <button onClick={() => setOpen(false)} aria-label={ko ? "오픈소스 노트 닫기" : "Close open-source notes"}>×</button>
      </div>
      <div className="source-filters">
        <label>{ko ? "검색" : "Search"}<input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder={ko ? "Kafka, 하둡, 계보…" : "Kafka, Hadoop, lineage…"} /></label>
        <label>{ko ? "생태계" : "Ecosystem"}<select value={family ?? ""} onChange={(e) => setFamily(e.target.value as OpenSourceFamily || undefined)}>
          <option value="">{ko ? "모든 생태계" : "All ecosystems"}</option>
          {Object.entries(OPEN_SOURCE_FAMILIES).map(([id, copy]) => <option key={id} value={id}>{localize(copy, locale)}</option>)}
        </select></label>
        <label>{ko ? "직업 경로" : "Career path"}<select value={jobId ?? ""} onChange={(e) => setJobId(e.target.value as SourceCareerId || undefined)}>
          <option value="">{ko ? "모든 경로" : "All paths"}</option>
          {SOURCE_CAREERS.filter(({ id }) => JOB_OPTIONS.some((job) => job.id === id) || activeSourceCareer(save) === id || history.offeredCareers.includes(id)).map(({ id }) => <option key={id} value={id}>{localize(sourceCareerName(id), locale)}</option>)}
        </select></label>
        <button onClick={reset}>{ko ? "전체 보기" : "Show all"}</button>
      </div>
      <p role="status" className="source-count">{entries.length}/{discovered.size} · {ids ? (ko ? "발견한 관련 도구" : "Discovered related tools") : (ko ? "직무 모험에서 발견한 기록" : "Discoveries from your career adventure")}</p>
      <div className="source-results">
        {!entries.length ? <p>{discovered.size ? (ko ? "조건에 맞는 기록이 없습니다. 검색이나 필터를 바꿔 보세요." : "No matching discoveries. Try changing the search or filters.") : (ko ? "아직 만난 도구가 없습니다. 직무를 선택하고 전투를 완료하면 돌발 의뢰로 오픈소스를 만날 수 있어요." : "No tools discovered yet. Choose a career and finish battles to meet open source through surprise requests.")}</p> : null}
        <div className="source-grid">{entries.map((entry) => {
          const captured = save.progress.captures.some(({ id }) => id === `open-source:${entry.id}`);
          const roles = [...new Set(history.discoveries.filter(({ toolId }) => toolId === entry.id).map(({ careerId }) => careerId))];
          return <article className="source-card" key={entry.id} data-project={entry.id}>
          <p className="source-kicker">{localize(OPEN_SOURCE_FAMILIES[entry.family], locale)} · {localize(OPEN_SOURCE_KIND_LABELS[entry.kind], locale)}</p>
          {entry.character.assetKey ? <Image className="source-character" src={assetUrl(entry.character.assetKey)} alt={localize(entry.character.name, locale)} width={256} height={256} unoptimized /> : null}
          <h3>{entry.name}</h3>
          {entry.parentId ? <p className="source-parent">{ko ? "구성요소:" : "Component of:"} {findOpenSource(entry.parentId)!.name}</p> : null}
          <p>{localize(entry.role, locale)}</p>
          <p className="source-learning">{localize(entry.learning, locale)}</p>
          <div className="source-creature"><strong>{localize(entry.character.name, locale)}</strong><p>{localize(entry.character.motif, locale)}</p></div>
          {roles.length ? <details className="source-story"><summary>{ko ? "직무에서 만난 상황" : "Career encounter notes"}</summary>{roles.map((id) => <p key={id}><strong>{localize(sourceCareerName(id), locale)}</strong><br />{localize(sourceCareer(id)!.workplace, locale)}</p>)}</details> : null}
          <p className="source-mission-status">{captured ? (ko ? "✓ 도감 등록 완료" : "✓ REGISTERED IN DEX") : (ko ? "발견 기록 · 직무 모험 중 다시 만날 수 있어요." : "Discovered · You can meet this tool again during your career adventure.")}</p>
          <a href={entry.officialUrl} target="_blank" rel="noopener noreferrer">{ko ? "공식 프로젝트 자료 ↗" : "Official project documentation ↗"}</a>
        </article>; })}</div>
      </div>
    </dialog>
  </>;
}
