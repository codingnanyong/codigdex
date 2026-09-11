import PhaserGame from "@/components/PhaserGame";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-2 py-4 sm:px-4">
      <header className="game-header text-center">
        <h1
          className="text-2xl tracking-wide text-foreground"
          style={{ fontFamily: "var(--font-pixel-en)" }}
        >
          CODIGDEX
        </h1>
        <p
          className="mt-2 text-sm text-muted"
          style={{ fontFamily: "var(--font-pixel)" }}
        >
          코딩 개념을 도감처럼 수집하는 픽셀 코딩 교육 게임
        </p>
      </header>
      <p
        className="rotate-hint text-center text-sm text-muted"
        style={{ fontFamily: "var(--font-pixel)" }}
      >
        휴대폰을 가로로 돌리면 더 크게 플레이할 수 있어요
      </p>
      <PhaserGame />
    </div>
  );
}
