import PhaserGame from "@/components/PhaserGame";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center gap-6 px-4 py-10">
      <header className="text-center">
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
      <PhaserGame />
    </div>
  );
}
