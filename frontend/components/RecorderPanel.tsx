"use client";

import { useState, useRef, JSX } from "react";

export default function RecorderPanel(): JSX.Element {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>("Please allow microphone permissions to start recording.");
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      setError("Please allow microphone permissions to start recording.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  return (
    <div className="bg-[#FFFFFF] rounded-[14px] border-[0.5px] border-[#D3D1C7] overflow-hidden mb-[16px]">
      
      <div className="bg-[#EEEDFE] py-[14px] px-[20px] flex items-center gap-[8px] border-b-[0.5px] border-[#CECBF6]">
        <span className="text-[#534AB7] text-[18px]">🔊</span>
        <span className="text-[13px] font-medium text-[#3C3489] tracking-[0.04em]">Voice capture</span>
      </div>
      
      <div className="py-[24px] px-[20px]">
        <div className="flex gap-[12px] justify-center">
          <button 
            onClick={startRecording}
            disabled={isRecording}
            className={`py-[10px] px-[32px] text-[14px] font-medium rounded-[8px] flex items-center gap-[8px] border-none font-sans cursor-pointer ${
              isRecording ? 'opacity-50 bg-[#7F77DD] text-[#EEEDFE]' : 'bg-[#7F77DD] text-[#EEEDFE]'
            }`}
          >
            <span>▶</span> Start recording
          </button>
          
          <button 
            onClick={stopRecording}
            disabled={!isRecording}
            className={`py-[10px] px-[32px] text-[14px] font-medium rounded-[8px] flex items-center gap-[8px] border-[0.5px] font-sans cursor-pointer ${
              !isRecording ? 'bg-[#FCEBEB] text-[#A32D2D] border-[#F7C1C1] opacity-50' : 'bg-[#FCEBEB] text-[#A32D2D] border-[#F7C1C1]'
            }`}
          >
            <span>⏹</span> Stop recording
          </button>
        </div>
        
        {error && (
          <div className="mt-[16px] bg-[#FCEBEB] border-[0.5px] border-[#F7C1C1] rounded-[8px] py-[10px] px-[14px] flex items-center gap-[8px]">
            <span className="text-[#A32D2D] text-[16px]">⚠️</span>
            <span className="text-[13px] text-[#791F1F]">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}