import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function FIRReview() {
  const { id } = useParams();
  const { officer } = useAuth();
  const navigate = useNavigate();

  const [fir, setFir] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [approving, setApproving] = useState(false);
  const [selectedPdfLang, setSelectedPdfLang] = useState("English");
  const [isEditingNarrative, setIsEditingNarrative] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const loadFIR = async () => {
    setLoading(true);
    try {
      const res = await api.getFIRById(id);
      if (res.success) {
        setFir(res.data);
        if (res.data.language === "ta") setSelectedPdfLang("Tamil");
        else if (res.data.language === "hi") setSelectedPdfLang("Hindi");
      } else {
        setErrorMsg(res.error || "Case record not found");
      }
    } catch (err) {
      setErrorMsg("Failed to retrieve FIR details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFIR();
  }, [id]);

  const handleComplainantChange = (field, val) => {
    setFir({
      ...fir,
      complainant: { ...(fir.complainant || {}), [field]: val }
    });
  };

  const handleIncidentChange = (field, val) => {
    setFir({
      ...fir,
      incident: { ...(fir.incident || {}), [field]: val }
    });
  };

  const handleApprove = async () => {
    if (!window.confirm("Confirm official police verification and approval of this FIR?")) {
      return;
    }

    setApproving(true);
    setErrorMsg("");
    try {
      await api.updateFIR(id, fir);
      const res = await api.approveFIR(id);
      if (res.success) {
        navigate(`/fir/${id}/result`);
      }
    } catch (err) {
      setErrorMsg("Failed to approve FIR: " + err.message);
      setApproving(false);
    }
  };

  const handleDownloadPDF = () => {
    const langCode = selectedPdfLang === "Tamil" ? "ta" : selectedPdfLang === "Hindi" ? "hi" : "en";
    const url = api.getPDFUrl(id, langCode);
    window.open(url, "_blank");
  };

  if (loading) {
    return (
      <main className="flex-1 md:ml-64 p-8 text-center">
        <p className="text-sm font-semibold text-[#45464d]">Retrieving FIR Case #{id}...</p>
      </main>
    );
  }

  if (!fir) {
    return (
      <main className="flex-1 md:ml-64 p-8 text-center max-w-xl mx-auto">
        <h2 className="text-lg font-bold text-[#191c1e]">FIR Case Not Found</h2>
        <Link to="/dashboard" className="inline-block mt-4 px-4 py-2 rounded-lg bg-[#0051d5] text-xs font-bold text-white">
          Back to Dashboard
        </Link>
      </main>
    );
  }

  return (
    <main className="flex-1 md:ml-64 pt-6 pb-24 md:pb-12 max-w-[1280px] mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-12 gap-6 font-['Inter']">
      
      {/* Document Editor Container */}
      <div className="md:col-span-8 space-y-6">
        
        {/* Warning Banner */}
        <div className="bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-lg p-4 flex items-start gap-3">
          <span className="material-symbols-outlined text-[#F59E0B] text-[22px] mt-0.5">warning</span>
          <div>
            <h3 className="font-['Hanken_Grotesk'] text-sm font-bold text-[#F59E0B] mb-0.5">Verify Information</h3>
            <p className="text-xs text-[#45464d] leading-relaxed">
              Please review all extracted details carefully before final approval. Edits made here will reflect in the generated PDF.
            </p>
          </div>
        </div>

        {/* Review Card (Document Mental Model) */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-xs p-6 md:p-8 relative overflow-hidden">
          
          {/* Status Chip */}
          <div className="absolute top-4 right-4 bg-[#0051d5]/10 text-[#0051d5] text-xs font-bold px-3 py-1 rounded-full border border-[#0051d5]/20 font-mono">
            {fir.verified ? "APPROVED" : "DRAFT"}
          </div>

          <h1 className="font-['Hanken_Grotesk'] text-2xl font-bold mb-6 text-[#000000] border-b border-[#E2E8F0] pb-3">
            First Information Report
          </h1>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            
            {/* Section: Complainant Details */}
            <section className="space-y-3">
              <h2 className="font-['Hanken_Grotesk'] text-sm font-bold text-[#0051d5] flex items-center gap-1.5 uppercase tracking-wider">
                <span className="material-symbols-outlined text-[18px]">person</span>
                Complainant Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#000000]">Full Name</label>
                  <input
                    type="text"
                    value={fir.complainant?.name || ""}
                    onChange={(e) => handleComplainantChange("name", e.target.value)}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg focus:border-[#0051d5] focus:ring-2 focus:ring-[#0051d5]/20 text-xs text-[#191c1e] p-2.5 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#000000]">Contact Number</label>
                  <input
                    type="tel"
                    value={fir.complainant?.phone || ""}
                    onChange={(e) => handleComplainantChange("phone", e.target.value)}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg focus:border-[#0051d5] focus:ring-2 focus:ring-[#0051d5]/20 text-xs text-[#191c1e] p-2.5 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1 md:col-span-2">
                  <label className="text-xs font-semibold text-[#000000]">Address</label>
                  <input
                    type="text"
                    value={fir.complainant?.address || ""}
                    onChange={(e) => handleComplainantChange("address", e.target.value)}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg focus:border-[#0051d5] focus:ring-2 focus:ring-[#0051d5]/20 text-xs text-[#191c1e] p-2.5 transition-all"
                  />
                </div>
              </div>
            </section>

            {/* Section: Incident Details */}
            <section className="space-y-3 pt-4 border-t border-[#E2E8F0]">
              <h2 className="font-['Hanken_Grotesk'] text-sm font-bold text-[#0051d5] flex items-center gap-1.5 uppercase tracking-wider">
                <span className="material-symbols-outlined text-[18px]">event_note</span>
                Incident Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#000000]">Incident Type</label>
                  <select
                    value={fir.incident?.crimeType || "Theft"}
                    onChange={(e) => handleIncidentChange("crimeType", e.target.value)}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg focus:border-[#0051d5] focus:ring-2 focus:ring-[#0051d5]/20 text-xs text-[#191c1e] p-2.5 transition-all"
                  >
                    <option value="Theft">Theft</option>
                    <option value="Assault">Assault</option>
                    <option value="Housebreaking by Night and Theft">Burglary / Housebreaking</option>
                    <option value="Cyber Financial Fraud & Impersonation">Cyber Fraud</option>
                    <option value="Wrongful Restraint, Assault & Snatching">Snatching</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-[#000000]">Date & Time</label>
                  <input
                    type="text"
                    value={`${fir.incident?.date || ""} ${fir.incident?.time || ""}`.trim()}
                    onChange={(e) => handleIncidentChange("time", e.target.value)}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg focus:border-[#0051d5] focus:ring-2 focus:ring-[#0051d5]/20 font-mono text-xs text-[#191c1e] p-2.5 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1 md:col-span-2">
                  <label className="text-xs font-semibold text-[#000000]">Location of Incident</label>
                  <input
                    type="text"
                    value={fir.incident?.location || ""}
                    onChange={(e) => handleIncidentChange("location", e.target.value)}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg focus:border-[#0051d5] focus:ring-2 focus:ring-[#0051d5]/20 text-xs text-[#191c1e] p-2.5 transition-all"
                  />
                </div>
              </div>
            </section>

            {/* Section: Narrative */}
            <section className="space-y-3 pt-4 border-t border-[#E2E8F0]">
              <div className="flex justify-between items-end mb-1">
                <h2 className="font-['Hanken_Grotesk'] text-sm font-bold text-[#0051d5] flex items-center gap-1.5 uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[18px]">description</span>
                  Extracted Narrative
                </h2>
                <button
                  type="button"
                  onClick={() => setIsEditingNarrative(!isEditingNarrative)}
                  className="text-[#0051d5] hover:text-[#003ea8] flex items-center gap-1 text-xs font-semibold transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">edit</span>
                  {isEditingNarrative ? "Done Editing" : "Edit"}
                </button>
              </div>

              <div className="flex flex-col gap-1 relative">
                <textarea
                  rows={5}
                  value={fir.narrative || ""}
                  onChange={(e) => setFir({ ...fir, narrative: e.target.value })}
                  className="w-full bg-[#f2f4f6] border border-[#E2E8F0] rounded-lg focus:border-[#0051d5] focus:ring-2 focus:ring-[#0051d5]/20 text-xs text-[#191c1e] p-3 transition-all leading-relaxed"
                />
                <div className="absolute bottom-2.5 right-3 flex items-center gap-1 text-[#76777d] opacity-70 pointer-events-none">
                  <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider">AI Generated</span>
                </div>
              </div>
            </section>

          </form>
        </div>
      </div>

      {/* Sidebar Actions */}
      <div className="md:col-span-4 space-y-6">
        <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-xs p-6 flex flex-col gap-4 sticky top-[80px]">
          
          <h3 className="font-['Hanken_Grotesk'] text-base font-bold text-[#000000] border-b border-[#E2E8F0] pb-2">
            Actions
          </h3>

          <div className="flex flex-col gap-3">
            
            <button
              type="button"
              onClick={handleApprove}
              disabled={approving}
              className="w-full bg-[#0051d5] text-white font-semibold text-sm py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-[#316bf3] transition-all active:scale-95 shadow-xs cursor-pointer"
            >
              <span className="material-symbols-outlined fill-icon text-[20px]">check_circle</span>
              {approving ? "Approving..." : "Approve FIR"}
            </button>

            <div className="border-t border-[#E2E8F0] pt-3 mt-1">
              <label className="text-xs font-semibold text-[#45464d] mb-1.5 block">
                Export PDF Language
              </label>
              
              <select
                value={selectedPdfLang}
                onChange={(e) => setSelectedPdfLang(e.target.value)}
                className="w-full bg-white border border-[#E2E8F0] rounded-lg focus:border-[#0051d5] text-xs text-[#191c1e] p-2.5 mb-2.5 transition-all"
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi (हिंदी)</option>
                <option value="Tamil">Tamil (தமிழ்)</option>
              </select>

              <button
                type="button"
                onClick={handleDownloadPDF}
                className="w-full border border-[#E2E8F0] text-[#191c1e] font-semibold text-xs py-2 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-[#f2f4f6] transition-all active:scale-95 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                Download PDF
              </button>
            </div>

          </div>

          {/* Audio Reference Player */}
          <div className="mt-2 pt-4 border-t border-[#E2E8F0]">
            <h4 className="text-xs font-semibold text-[#45464d] mb-2.5 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">mic</span>
              Original Recording
            </h4>
            
            <div className="bg-[#f2f4f6] rounded-lg p-2.5 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                className="w-8 h-8 rounded-full bg-[#0051d5] text-white flex items-center justify-center shrink-0 hover:bg-[#316bf3]"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isPlayingAudio ? "pause" : "play_arrow"}
                </span>
              </button>
              
              <div className="flex-1 h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                <div className={`h-full bg-[#0051d5] ${isPlayingAudio ? "w-2/3 animate-pulse" : "w-1/3"}`}></div>
              </div>
              
              <span className="font-mono text-[11px] text-[#45464d]">0:45</span>
            </div>
          </div>

        </div>
      </div>

    </main>
  );
}
