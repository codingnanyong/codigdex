import PhaserGame from "@/components/PhaserGame";

export default function Home() {
  return (
    <div className="game-page">
      <PhaserGame qaEnabled={process.env.CODIGDEX_WEB_QA === "1"} />
    </div>
  );
}
