import GameHeader from "@/components/GameHeader";
import PhaserGame from "@/components/PhaserGame";

export default function Home() {
  return (
    <div className="game-page flex flex-1 flex-col items-center justify-center gap-4 px-2 py-4 sm:px-4">
      <GameHeader />
      <PhaserGame />
    </div>
  );
}
