import { JSX } from "react";

export default function TranscriptPanel(): JSX.Element {
  return (
    <div className="bg-[#FFFFFF] rounded-[14px] border-[0.5px] border-[#D3D1C7] overflow-hidden mb-[16px]">
      
      <div className="bg-[#EEEDFE] py-[14px] px-[20px] flex items-center gap-[8px] border-b-[0.5px] border-[#CECBF6]">
        <span className="text-[#534AB7] text-[18px]">📄</span>
        <span className="text-[13px] font-medium text-[#3C3489] tracking-[0.04em]">Live transcript</span>
      </div>
      
      <div className="py-[24px] px-[20px]">
        <div className="min-h-[100px] bg-[#F1EFE8] border-[0.5px] border-[#D3D1C7] rounded-[10px] py-[14px] px-[16px] text-[14px] text-[#888780] italic leading-[1.6] font-sans">
          Your transcribed text will appear here...
        </div>
      </div>
      
    </div>
  );
}