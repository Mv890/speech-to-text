"use client";

import { useState, useRef, useEffect, JSX } from "react";

export default function RecorderPanel(): JSX.Element {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false); // NEW: AI loading state
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60).toString().padStart(2, '0');
    const seconds = (timeInSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const startRecording = async () => {
    try {
      setError(null);
      setAudioUrl(null);
      setRecordingTime(0);
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      // THE MAGIC HAPPENS HERE WHEN YOU CLICK STOP
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const localAudioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(localAudioUrl);

        // --- DAY 5: SEND TO AI BACKEND ---
        setIsTranscribing(true); // Turn on the loading text
        
        try {
          const formData = new FormData();
          formData.append("audio", audioBlob, "recording.webm");

          // Throw the file to the Python server!
          const response = await fetch("http://127.0.0.1:5000/transcribe", {
            method: "POST",
            body: formData,
          });

          const data = await response.json();

          // If successful, show the alert!
          if (data.status === 'success') {
            alert("AI TRANSCRIPT:\n\n" + data.transcript);
          } else {
            alert("AI Error:\n\n" + (data.error || "Something went wrong"));
          }
        } catch (err) {
          alert("Could not connect to Python backend! Is it running?");
        } finally {
          setIsTranscribing(false); // Turn off the loading text
        }
      };

      mediaRecorder.start();
      setIsRecording(true);

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
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };

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
        <div className={`text-[14px] font-mono font-bold ${isRecording ? 'text-red-500 animate-pulse' : 'text-[#3C3489]'}`}>
          {isRecording && <span className="mr-2 text-[10px]">🔴 REC</span>}
          {formatTime(recordingTime)}
        </div>
      </div>
      
      <div className="py-[24px] px-[20px] flex flex-col items-center">
        <div className="flex gap-[12px] justify-center w-full">
          <button 
            onClick={startRecording}
            disabled={isRecording || isTranscribing}
            className={`py-[10px] px-[32px] text-[14px] font-medium rounded-[8px] flex items-center justify-center gap-[8px] border-none font-sans cursor-pointer flex-1 ${
              (isRecording || isTranscribing) ? 'opacity-50 bg-[#7F77DD] text-[#EEEDFE]' : 'bg-[#7F77DD] text-[#EEEDFE] hover:bg-[#6A62CE] transition-colors'
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

        {/* NEW: AI Loading text */}
        {isTranscribing && (
          <div className="mt-4 text-[#534AB7] text-[14px] font-medium animate-pulse">
            🤖 AI is transcribing your audio...
          </div>
        )}
        
        {error && (
          <div className="mt-[16px] w-full bg-[#FCEBEB] border-[0.5px] border-[#F7C1C1] rounded-[8px] py-[10px] px-[14px] flex items-center gap-[8px]">
            <span className="text-[#A32D2D] text-[16px]">⚠️</span>
            <span className="text-[13px] text-[#791F1F]">{error}</span>
          </div>
        )}

        {audioUrl && !isRecording && (
          <div className="mt-[24px] w-full flex flex-col items-center gap-[12px] p-[16px] bg-[#F8F9FA] rounded-[8px] border-[1px] border-[#E9ECEF]">
            <span className="text-[13px] font-medium text-[#495057]">Preview Recording</span>
            <audio src={audioUrl} controls className="w-full h-[40px]" />
          </div>
        )}
      </div>
    </div>
  );
}