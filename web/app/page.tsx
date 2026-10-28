import GameHeader from "@/components/GameHeader";
import PhaserGame from "@/components/PhaserGame";
import Link from "next/link";

export default function Home() {
  return (
    <div className="game-page flex flex-1 flex-col items-center justify-center gap-4 px-2 py-4 sm:px-4">
      <GameHeader />
      {process.env.CODIGDEX_WEB_QA === "1" ? <Link href="/qa" className="source-launch" style={{ position: "relative", top: "auto", left: "auto" }}>로컬 QA · 테스트 시작점 바꾸기</Link> : null}
      <PhaserGame />
    </div>
  );
}
