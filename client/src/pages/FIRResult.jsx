import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import FIRPreview from "../components/FIRPreview";
import api from "../services/api";

export default function FIRResult() {
  const { id } = useParams();
  const [fir, setFir] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeLanguage, setActiveLanguage] = useState("en");

  const loadCase = async () => {
    setLoading(true);
    try {
      const res = await api.getFIRById(id);
      if (res.success) {
        setFir(res.data);
        if (res.data.language === "ta") setActiveLanguage("ta");
        else if (res.data.language === "hi") setActiveLanguage("hi");
      }
    } catch (err) {
      console.error("Failed to load FIR:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCase();
  }, [id]);

  const handleDownloadPDF = (lang) => {
    const url = api.getPDFUrl(id, lang || activeLanguage);
    window.open(url, "_blank");
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <main className="flex-1 md:ml-64 p-8 text-center">
        <p className="text-sm font-semibold text-[#45464d]">Loading Official FIR #{id}...</p>
      </main>
    );
  }

  if (!fir) {
    return (
      <main className="flex-1 md:ml-64 p-8 text-center max-w-xl mx-auto">
        <h2 className="text-lg font-bold text-[#191c1e]">Case Record Not Found</h2>
        <Link to="/dashboard" className="inline-block mt-4 px-4 py-2 rounded-lg bg-[#0051d5] text-xs font-bold text-white">
          Back to Dashboard
        </Link>
      </main>
    );
  }

  return (
    <main className="flex-1 md:ml-64 p-4 md:p-8 bg-[#f7f9fb] min-h-[calc(100vh-64px)] w-full">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="p-2 rounded-lg bg-white hover:bg-[#f2f4f6] text-[#45464d] border border-[#E2E8F0] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#dbe1ff] text-[#0051d5] border border-[#b4c5ff]">
                {fir.firId}
              </span>
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-[#10B981]/10 text-[#10B981] flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                Officially Registered
              </span>
            </div>
            <h1 className="font-['Hanken_Grotesk'] text-2xl font-bold text-[#000000] mt-1">
              Registered First Information Report
            </h1>
          </div>
        </div>

        {/* Global PDF & Print Actions */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-white hover:bg-[#f2f4f6] text-[#191c1e] border border-[#E2E8F0] text-xs font-semibold transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">print</span>
            Print Report
          </button>

          <button
            type="button"
            onClick={() => handleDownloadPDF(activeLanguage)}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-lg bg-[#0051d5] hover:bg-[#316bf3] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Download PDF ({activeLanguage.toUpperCase()})
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      <div className="bg-white border border-[#10B981]/30 rounded-xl p-5 mb-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#10B981]/10 text-[#10B981] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">verified</span>
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#191c1e]">FIR Registered & Archived in Police Vault</h3>
            <p className="text-xs text-[#45464d] mt-0.5">
              Verified by {fir.verifiedBy?.name || "Duty Officer"} • {fir.policeStation} • Signed on {new Date(fir.verifiedAt || fir.updatedAt).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleDownloadPDF("en")}
            className="px-3 py-1.5 rounded-lg bg-[#f2f4f6] hover:bg-[#e0e3e5] text-[#0051d5] border border-[#E2E8F0] text-xs font-semibold flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">download</span> English PDF
          </button>
          <button
            type="button"
            onClick={() => handleDownloadPDF("ta")}
            className="px-3 py-1.5 rounded-lg bg-[#f2f4f6] hover:bg-[#e0e3e5] text-[#0051d5] border border-[#E2E8F0] text-xs font-semibold flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">download</span> தமிழ் PDF
          </button>
          <button
            type="button"
            onClick={() => handleDownloadPDF("hi")}
            className="px-3 py-1.5 rounded-lg bg-[#f2f4f6] hover:bg-[#e0e3e5] text-[#0051d5] border border-[#E2E8F0] text-xs font-semibold flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">download</span> हिंदी PDF
          </button>
        </div>
      </div>

      {/* Language Selector */}
      <div className="flex items-center justify-center mb-6">
        <div className="p-1 rounded-xl bg-white border border-[#E2E8F0] shadow-xs flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveLanguage("en")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeLanguage === "en"
                ? "bg-[#0051d5] text-white"
                : "text-[#45464d] hover:text-[#191c1e]"
            }`}
          >
            English FIR
          </button>
          <button
            type="button"
            onClick={() => setActiveLanguage("ta")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeLanguage === "ta"
                ? "bg-[#0051d5] text-white"
                : "text-[#45464d] hover:text-[#191c1e]"
            }`}
          >
            தமிழ் FIR (Tamil)
          </button>
          <button
            type="button"
            onClick={() => setActiveLanguage("hi")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeLanguage === "hi"
                ? "bg-[#0051d5] text-white"
                : "text-[#45464d] hover:text-[#191c1e]"
            }`}
          >
            हिंदी FIR (Hindi)
          </button>
        </div>
      </div>

      {/* Document Sheet */}
      <div className="max-w-4xl mx-auto mb-12">
        <FIRPreview fir={fir} language={activeLanguage} />
      </div>

    </main>
  );
}
