import { notFound } from "next/navigation";
import { WebQALauncher } from "@/components/WebQALauncher";
import { webQAPresets } from "@/lib/qa/presets";

export const dynamic = "force-dynamic";
export const metadata = { title: "Codigdex · 로컬 웹 QA", robots: { index: false, follow: false } };

export default function WebQAPage() {
  if (process.env.CODIGDEX_WEB_QA !== "1") notFound();
  return <WebQALauncher presets={webQAPresets("ko")} />;
}
