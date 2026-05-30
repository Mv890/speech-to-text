"use client";

import { useState, useRef, useEffect, JSX } from "react";
import { io, Socket } from "socket.io-client";

export default function RecorderPanel(): JSX.Element {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const [finalTranscript, setFinalTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60).toString().padStart(2, '0');
    const seconds = (timeInSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  };

  const startRecording = async () => {
    try {
      setError(null);
      setFinalTranscript("");
      setInterimTranscript("");
      setRecordingTime(0);
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      let options = {};
      if (MediaRecorder.isTypeSupported('audio/webm')) {
        options = { mimeType: 'audio/webm' };
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        options = { mimeType: 'audio/mp4' };
      }
      
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      socketRef.current = io("http://127.0.0.1:5000");

      socketRef.current.on("transcript_update", (data: { text: string; is_final: boolean }) => {
        if (data.is_final) {
          setFinalTranscript((prev) => prev + data.text + " ");
          setInterimTranscript(""); 
        } else {
          setInterimTranscript(data.text);
        }
      });

      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0 && socketRef.current && socketRef.current.connected) {
          try {
            const buffer = await event.data.arrayBuffer();
            socketRef.current.emit("audio_chunk", buffer);
          } catch (err) {
            console.error("Failed to convert audio buffer:", err);
          }
        }
      };

      // THIS IS THE FIX: Wait for the specific 'deepgram_ready' signal!
      socketRef.current.on("deepgram_ready", () => {
        console.log("🟢 Deepgram is ready! Starting microphone...");
        
        mediaRecorder.start(250); 
        setIsRecording(true);

        timerIntervalRef.current = setInterval(() => {
          setRecordingTime((prevTime) => prevTime + 1);
        }, 1000);
      });

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
      
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    }
  };

  return (
    <div className="bg-[#FFFFFF] rounded-[14px] border-[0.5px] border-[#D3D1C7] overflow-hidden mb-[16px]">
      <div className="bg-[#EEEDFE] py-[14px] px-[20px] flex items-center justify-between border-b-[0.5px] border-[#CECBF6]">
        <div className="flex items-center gap-[8px]">
          <span className="text-[#534AB7] text-[18px]">🔊</span>
          <span className="text-[13px] font-medium text-[#3C3489] tracking-[0.04em]">Live Stream Capture</span>
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
            disabled={isRecording}
            className={`py-[10px] px-[32px] text-[14px] font-medium rounded-[8px] flex items-center justify-center gap-[8px] border-none font-sans cursor-pointer flex-1 ${
              isRecording ? 'opacity-50 bg-[#7F77DD] text-[#EEEDFE]' : 'bg-[#7F77DD] text-[#EEEDFE] hover:bg-[#6A62CE] transition-colors'
            }`}
          >
            <span>▶</span> Start Streaming
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

        <div className="mt-[24px] w-full text-left">
          <h3 className="text-[14px] font-bold text-[#3C3489] mb-[8px] uppercase tracking-wider">Live Transcript</h3>
          <div className="p-[16px] min-h-[100px] bg-[#F4F3FF] rounded-[8px] border-[1px] border-[#CECBF6] text-[#333333] leading-relaxed transition-all">
            {finalTranscript === "" && interimTranscript === "" && (
               <span className="text-gray-400 italic">Waiting for speech...</span>
            )}
            <span>{finalTranscript}</span>
            <span className="text-[#534AB7] italic">{interimTranscript}</span>
          </div>
        </div>
      </div>
    </div>
  );
}