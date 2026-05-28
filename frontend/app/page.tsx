import { JSX } from "react";
import Header from "../components/Header";
import RecorderPanel from "../components/RecorderPanel";
import TranscriptPanel from "../components/TranscriptPanel";

export default function Home(): JSX.Element {
  return (
    <div className="min-h-[520px] bg-[#F1EFE8] font-sans">
      <Header />
      <main className="pt-[28px] px-[28px] pb-[32px] max-w-4xl mx-auto">
        <RecorderPanel />
        <TranscriptPanel />
      </main>
    </div>
  );
}