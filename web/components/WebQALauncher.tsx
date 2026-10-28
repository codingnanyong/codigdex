"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { parseSave } from "@codigdex/game-core/save/schema";
import { SAVE_STORAGE_KEYS } from "@codigdex/game-core/save/storage";
import type { WebQAPreset } from "@/lib/qa/presets";
import styles from "./WebQALauncher.module.css";

const BACKUP_KEY = "codigdex:qa:previous-session:v3";
export function WebQALauncher({ presets }: { presets: WebQAPreset[] }) {
  const [error, setError] = useState("");
  const [locale, setLocale] = useState<"ko" | "en">("ko");
  const router = useRouter();
  const groups = [...new Set(presets.map(({ group }) => group))];
  const apply = (preset: WebQAPreset) => {
    try {
      const previous = localStorage.getItem(SAVE_STORAGE_KEYS.current);
      if (previous !== null) localStorage.setItem(BACKUP_KEY, previous);
      const next = { ...preset.save, ui: { ...preset.save.ui, locale } };
      localStorage.setItem(SAVE_STORAGE_KEYS.current, JSON.stringify(next));
      router.push("/");
    } catch {
      setError("브라우저에 테스트 기록을 저장하지 못했습니다. 저장 공간과 사이트 데이터 설정을 확인해 주세요.");
    }
  };
  const restore = () => {
    try {
      const backup = localStorage.getItem(BACKUP_KEY);
      if (!backup || !parseSave(backup)) { setError("복원할 이전 테스트 기록이 없습니다."); return; }
      localStorage.setItem(SAVE_STORAGE_KEYS.current, backup);
      router.push("/");
    } catch { setError("이전 테스트 기록을 복원하지 못했습니다."); }
  };
  return <main className={styles.page}>
    <header className={styles.header}>
      <p className={styles.eyebrow}>CODIGDEX · LOCAL WEB QA</p>
      <h1>웹 플레이 테스트</h1>
      <p>아래 시작점을 고르면 선행 구간을 반복하지 않고 바로 확인할 수 있습니다.</p>
      <p className={styles.note}>이 주소의 테스트 기록만 바뀝니다. 다른 주소의 저장 기록은 유지되며, 시작점을 바꾸기 전 기록은 한 번 복원할 수 있습니다. 로그인·DB 연결은 사용하지 않습니다.</p>
      <div className={styles.actions}>
        <label>게임 언어 <select value={locale} onChange={(event) => setLocale(event.target.value as "ko" | "en")}><option value="ko">한국어</option><option value="en">English</option></select></label>
        <Link href="/">현재 테스트 이어하기</Link>
        <button type="button" data-action="restore" onClick={restore}>이전 테스트 기록 복원</button>
      </div>
      {error ? <p role="alert" className={styles.error}>{error}</p> : null}
    </header>
    <aside className={styles.checklist}>
      <strong>추천 확인 순서</strong>
      <ol><li>데이터 엔지니어: 직무 전투 완료 → Airflow 돌발 의뢰 → 포획 → 원래 직무로 복귀</li><li>프론트엔드: 직무 전투 완료 → TanStack Query 의뢰를 나중으로 미루기 → 발견 노트 확인</li><li>플랫폼 엔지니어 / SRE: 돌발 의뢰와 본래 다섯 의뢰 → MASTER → 재접속</li></ol>
      <p>정답과 오답을 섞어 재도전도 확인하고, 화면이 잘리거나 흐름이 멈추면 시작점·문제 문구를 알려 주세요.</p>
    </aside>
    {groups.map((group) => <section key={group} className={styles.section}>
      <h2>{group}</h2>
      <div className={styles.grid}>{presets.filter((preset) => preset.group === group).map((preset) => <article key={preset.id} className={styles.card}>
        <h3>{preset.title}</h3><p>{preset.description}</p>
        <button type="button" data-preset={preset.id} onClick={() => apply(preset)}>이 상태로 테스트 시작</button>
      </article>)}</div>
    </section>)}
  </main>;
}
