import React from "react";
import { Mic, Globe, Search, Brain, CheckCircle2, Loader2, FileCheck } from "lucide-react";

export default function PipelineProgress({ currentStep, error }) {
  const steps = [
    {
      id: 1,
      title: "Audio Ingestion",
      desc: "Sampling rate & acoustics verification",
      icon: Mic
    },
    {
      id: 2,
      title: "Whisper Large V3",
      desc: "Multilingual transcription (ta/hi/en)",
      icon: Globe
    },
    {
      id: 3,
      title: "Dual Translation",
      desc: "Generating parallel English transcript",
      icon: FileCheck
    },
    {
      id: 4,
      title: "RAG Retrieval",
      desc: "Matching IPC/BNS format & police guidelines",
      icon: Search
    },
    {
      id: 5,
      title: "Groq LLM Synthesis",
      desc: "Anti-hallucination structured FIR extraction",
      icon: Brain
    }
  ];

  return (
    <div className="w-full p-6 rounded-2xl glass-panel-elevated bg-slate-950 border border-slate-800">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping"></span>
            GenAI Processing Pipeline Active
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Whisper Large V3 • RAG Knowledge • Groq LLM Structuring</p>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
          Step {Math.min(currentStep, 5)} of 5
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {steps.map((step) => {
          const Icon = step.icon;
          const isDone = currentStep > step.id;
          const isActive = currentStep === step.id;
          const isPending = currentStep < step.id;

          return (
            <div
              key={step.id}
              className={`flex flex-col p-3.5 rounded-xl border transition-all ${
                isDone
                  ? "bg-emerald-950/20 border-emerald-800/40 text-emerald-300"
                  : isActive
                  ? "bg-blue-950/40 border-blue-500 text-blue-200 shadow-lg shadow-blue-900/30 scale-[1.02]"
                  : "bg-slate-900/30 border-slate-800/60 text-slate-500 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${
                  isDone ? "bg-emerald-900/50 text-emerald-400" : isActive ? "bg-blue-600 text-white animate-pulse" : "bg-slate-800 text-slate-400"
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : isActive ? (
                  <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                ) : (
                  <span className="text-[10px] font-mono font-bold text-slate-600">{step.id}</span>
                )}
              </div>

              <p className="text-xs font-bold text-white leading-tight">{step.title}</p>
              <p className="text-[10px] text-slate-400 mt-1 leading-snug">{step.desc}</p>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="mt-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
          Pipeline Error: {error}
        </div>
      )}
    </div>
  );
}
