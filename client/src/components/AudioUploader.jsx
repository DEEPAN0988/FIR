import React, { useState, useRef } from "react";
import { UploadCloud, FileAudio, CheckCircle2, Sparkles, X } from "lucide-react";

export default function AudioUploader({ onFileSelect, onSelectSample }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [activeSample, setActiveSample] = useState(null);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    setSelectedFile(file);
    setActiveSample(null);
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setActiveSample(null);
    if (inputRef.current) inputRef.current.value = "";
    if (onFileSelect) onFileSelect(null);
  };

  const handleSampleClick = (sampleKey, label, lang) => {
    setActiveSample(sampleKey);
    setSelectedFile(null);
    if (onSelectSample) {
      onSelectSample(sampleKey, label, lang);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Drag & Drop Box */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !selectedFile && inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${
          dragActive
            ? "border-blue-500 bg-blue-950/40 scale-[1.01]"
            : selectedFile
            ? "border-emerald-500/60 bg-emerald-950/20 cursor-default"
            : "border-slate-700/80 bg-slate-900/40 hover:border-slate-500 hover:bg-slate-900/70"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="audio/*,.wav,.mp3,.m4a,.webm,.ogg,.aac"
          onChange={handleChange}
          className="hidden"
        />

        {!selectedFile ? (
          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-950/80 border border-blue-600/30 flex items-center justify-center text-blue-400">
              <UploadCloud className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">
                <span className="text-blue-400 underline underline-offset-2">Click to browse</span> or drag & drop audio complaint
              </p>
              <p className="text-xs text-slate-400 mt-1">
                WAV, MP3, WebM, M4A, AAC (Max 25MB)
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-600/50 flex items-center justify-center text-emerald-400">
                <FileAudio className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-200 truncate max-w-[280px]">
                  {selectedFile.name}
                </p>
                <p className="text-[10px] text-slate-400">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for Whisper Large V3
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearFile();
              }}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 hover:text-rose-400 text-slate-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Preset Realistic Test Cases */}
      <div>
        <div className="flex items-center gap-2 mb-2.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Or Test with Verified Case Sample Audio:
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Sample 1: Tamil */}
          <button
            type="button"
            onClick={() => handleSampleClick("ta", "Tamil House Theft (Chennai)", "ta")}
            className={`flex flex-col text-left p-3 rounded-xl border transition-all ${
              activeSample === "ta"
                ? "bg-blue-900/30 border-blue-500 text-blue-200 ring-1 ring-blue-500/50"
                : "bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-900"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800">
                தமிழ் • Tamil
              </span>
              {activeSample === "ta" && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />}
            </div>
            <p className="text-xs font-semibold text-white mt-1.5">Housebreaking & Theft</p>
            <p className="text-[10px] text-slate-400 mt-0.5 truncate">Anna Nagar, Chennai (8 Sovereigns Gold)</p>
          </button>

          {/* Sample 2: Hindi */}
          <button
            type="button"
            onClick={() => handleSampleClick("hi", "Hindi Assault & Snatching (Delhi)", "hi")}
            className={`flex flex-col text-left p-3 rounded-xl border transition-all ${
              activeSample === "hi"
                ? "bg-amber-900/30 border-amber-500 text-amber-200 ring-1 ring-amber-500/50"
                : "bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-900"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                हिंदी • Hindi
              </span>
              {activeSample === "hi" && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
            </div>
            <p className="text-xs font-semibold text-white mt-1.5">Assault & Snatching</p>
            <p className="text-[10px] text-slate-400 mt-0.5 truncate">Connaught Place Metro, New Delhi</p>
          </button>

          {/* Sample 3: English */}
          <button
            type="button"
            onClick={() => handleSampleClick("en", "English Cyber Fraud (Bengaluru)", "en")}
            className={`flex flex-col text-left p-3 rounded-xl border transition-all ${
              activeSample === "en"
                ? "bg-indigo-900/30 border-indigo-500 text-indigo-200 ring-1 ring-indigo-500/50"
                : "bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-900"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800">
                English
              </span>
              {activeSample === "en" && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
            </div>
            <p className="text-xs font-semibold text-white mt-1.5">Cyber Financial Fraud</p>
            <p className="text-[10px] text-slate-400 mt-0.5 truncate">Indiranagar, Bengaluru (Bank Impersonation)</p>
          </button>
        </div>
      </div>
    </div>
  );
}
