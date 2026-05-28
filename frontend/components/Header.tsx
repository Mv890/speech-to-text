import Link from "next/link";
import { JSX } from "react";

export default function Header(): JSX.Element {
  return (
    <header className="bg-[#26215C] h-[56px] px-[28px] flex items-center justify-between">
      
      <div className="flex items-center gap-[10px]">
        <div className="w-[32px] h-[32px] rounded-[8px] bg-[#7F77DD] flex items-center justify-center">
          <span className="text-[#EEEDFE] text-[18px]">🎙️</span>
        </div>
        <span className="text-[15px] font-medium text-[#EEEDFE] tracking-[0.01em]">AI Speech-to-Text</span>
      </div>

      <div className="flex gap-[4px]">
        <Link href="/" className="text-[13px] text-[#EEEDFE] bg-[#3C3489] px-[14px] py-[6px] rounded-[6px] cursor-pointer no-underline">
          Home
        </Link>
        <Link href="/history" className="text-[13px] text-[#AFA9EC] px-[14px] py-[6px] rounded-[6px] cursor-pointer no-underline">
          History
        </Link>
      </div>

    </header>
  );
}