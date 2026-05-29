"use client";

import { useState, useRef, useEffect, JSX } from "react";

export default function RecorderPanel(): JSX.Element {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to format seconds into MM:SS
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60).toString().padStart(2, '0');
    const seconds = (timeInSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const startRecording = async () => {
    try {
      setError(null);
      setAudioUrl(null); // Clear previous recording
      setRecordingTime(0); // Reset timer
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      // DAY 3 GOAL: Assemble into a single Blob on stop and preview it locally
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        
        // Create a local URL so the browser can play and download the Blob
        const localAudioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(localAudioUrl);
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Start the timer
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1);
      }, 1000);

    } catch (err) {
      setError("Please allow microphone permissions to start recording.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop all audio tracks to release the microphone
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      
      // Stop the timer
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
  };

  // Cleanup timer if component unmounts
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  return (
    <div className="bg-[#FFFFFF] rounded-[14px] border-[0.5px] border-[#D3D1C7] overflow-hidden mb-[16px]">
      
      <div className="bg-[#EEEDFE] py-[14px] px-[20px] flex items-center justify-between border-b-[0.5px] border-[#CECBF6]">
        <div className="flex items-center gap-[8px]">
          <span className="text-[#534AB7] text-[18px]">🔊</span>
          <span className="text-[13px] font-medium text-[#3C3489] tracking-[0.04em]">Voice capture</span>
        </div>
        
        {/* DAY 3 GOAL: Show recording state / timer */}
        <div className={`text-[14px] font-mono font-bold ${isRecording ? 'text-red-500 animate-pulse' : 'text-[#3C3489]'}`}>
          {isRecording && <span className="mr-2 text-[10px]">🔴 REC</span>}
          {formatTime(recordingTime)}
        </div>
      </div>
      
      <div className="py-[24px] px-[20px] flex flex-col items-center">
        <div className="flex gap-[12px] justify-center w-full">
          <button 
            onClick={startRecording}
            disabled={isRecording}
            className={`py-[10px] px-[32px] text-[14px] font-medium rounded-[8px] flex items-center justify-center gap-[8px] border-none font-sans cursor-pointer flex-1 ${
              isRecording ? 'opacity-50 bg-[#7F77DD] text-[#EEEDFE]' : 'bg-[#7F77DD] text-[#EEEDFE] hover:bg-[#6A62CE] transition-colors'
            }`}
          >
            <span>▶</span> Start recording
          </button>
          
          <button 
            onClick={stopRecording}
            disabled={!isRecording}
            className={`py-[10px] px-[32px] text-[14px] font-medium rounded-[8px] flex items-center justify-center gap-[8px] border-[1px] font-sans cursor-pointer flex-1 ${
              !isRecording ? 'bg-[#FCEBEB] text-[#A32D2D] border-[#F7C1C1] opacity-50' : 'bg-[#FCEBEB] text-[#A32D2D] border-[#A32D2D] hover:bg-[#FAD4D4] transition-colors'
            }`}
          >
            <span>⏹</span> Stop
          </button>
        </div>
        
        {error && (
          <div className="mt-[16px] w-full bg-[#FCEBEB] border-[0.5px] border-[#F7C1C1] rounded-[8px] py-[10px] px-[14px] flex items-center gap-[8px]">
            <span className="text-[#A32D2D] text-[16px]">⚠️</span>
            <span className="text-[13px] text-[#791F1F]">{error}</span>
          </div>
        )}

        {/* DAY 3 GOAL: Provide verify and download locally */}
        {audioUrl && !isRecording && (
          <div className="mt-[24px] w-full flex flex-col items-center gap-[12px] p-[16px] bg-[#F8F9FA] rounded-[8px] border-[1px] border-[#E9ECEF]">
            <span className="text-[13px] font-medium text-[#495057]">Preview Recording</span>
            
            <audio src={audioUrl} controls className="w-full h-[40px]" />
            
            <a 
              href={audioUrl} 
              download={`recording-${new Date().getTime()}.webm`}
              className="mt-[8px] py-[8px] px-[16px] text-[13px] font-medium text-[#0F5132] bg-[#D1E7DD] border-[1px] border-[#BADBCC] rounded-[6px] hover:bg-[#BADBCC] transition-colors no-underline flex items-center gap-[6px]"
            >
              <span>⬇️</span> Download Audio
            </a>
          </div>
        )}
      </div>
    </div>
  );
}