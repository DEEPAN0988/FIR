import React, { useRef, useState, useEffect } from "react";
import { Mic, Square, Play, RotateCcw, Volume2, AlertCircle } from "lucide-react";

export default function AudioRecorder({ onRecordingComplete, onReset }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [permissionError, setPermissionError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      setPermissionError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        if (onRecordingComplete) {
          onRecordingComplete(blob);
        }
        // Stop audio tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(250); // Slice every 250ms
      setIsRecording(true);
      setRecordingDuration(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access error:", err);
      setPermissionError("Microphone access was denied or not available. Please allow mic permissions in browser.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
  };

  const resetRecording = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setAudioBlob(null);
    setRecordingDuration(0);
    if (onReset) onReset();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-inner">
      {permissionError && (
        <div className="mb-4 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs w-full max-w-md">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{permissionError}</span>
        </div>
      )}

      {/* Recording Status & Animation */}
      {!audioUrl ? (
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            {isRecording && (
              <>
                <span className="absolute -inset-3 rounded-full bg-rose-500/20 animate-ping"></span>
                <span className="absolute -inset-6 rounded-full bg-rose-500/10 animate-pulse"></span>
              </>
            )}

            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-xl ${
                isRecording
                  ? "bg-rose-600 hover:bg-rose-700 text-white border-4 border-rose-400/50 shadow-rose-600/30 scale-105"
                  : "bg-gradient-to-tr from-blue-700 to-indigo-600 hover:from-blue-600 hover:to-indigo-500 text-white border-4 border-blue-400/30 shadow-blue-600/30 hover:scale-105"
              }`}
            >
              {isRecording ? (
                <Square className="w-9 h-9 fill-current" />
              ) : (
                <Mic className="w-10 h-10" />
              )}
            </button>
          </div>

          {/* Waveform Visualization when recording */}
          {isRecording ? (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-1.5 h-8">
                {[40, 75, 100, 50, 90, 60, 80, 45, 95, 70, 85, 40].map((h, i) => (
                  <div
                    key={i}
                    className="w-1.5 rounded-full bg-rose-500 wave-bar"
                    style={{
                      height: `${h}%`,
                      animationDelay: `${(i * 0.1).toFixed(1)}s`
                    }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2 text-rose-400 font-mono text-sm font-bold tracking-widest bg-rose-950/40 px-3 py-1 rounded-full border border-rose-900/50">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                REC {formatTime(recordingDuration)}
              </div>
              <p className="text-[11px] text-slate-400">Speak clearly in Tamil, Hindi, or English</p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-200">Click microphone to start recording</p>
              <p className="text-xs text-slate-400 mt-1">Supports Tamil (தமிழ்), Hindi (हिंदी), and English</p>
            </div>
          )}
        </div>
      ) : (
        /* Audio Review & Player */
        <div className="w-full max-w-md flex flex-col items-center gap-4">
          <div className="flex items-center justify-between w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-slate-200">Voice Complaint Recorded</span>
            </div>
            <span className="text-xs font-mono text-slate-400">{formatTime(recordingDuration)}</span>
          </div>

          <audio src={audioUrl} controls className="w-full rounded-lg bg-slate-950" />

          <button
            onClick={resetRecording}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Record Again
          </button>
        </div>
      )}
    </div>
  );
}
