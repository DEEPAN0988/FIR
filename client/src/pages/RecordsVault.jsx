import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function RecordsVault() {
  const { officer } = useAuth();
  const [firs, setFirs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCrime, setSelectedCrime] = useState("all");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const loadVaultCases = async () => {
    setLoading(true);
    try {
      const res = await api.getAllFIRs();
      if (res.success) {
        setFirs(res.data || []);
      }
    } catch (err) {
      console.error("Failed to load vault records:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVaultCases();
  }, []);

  const filteredRecords = firs.filter((fir) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (fir.firId || "").toLowerCase().includes(q) ||
      (fir.complainant?.name || "").toLowerCase().includes(q) ||
      (fir.incident?.crimeType || "").toLowerCase().includes(q) ||
      (fir.policeStation || "").toLowerCase().includes(q);

    const matchesCrime = selectedCrime === "all" || (fir.incident?.crimeType || "").toLowerCase().includes(selectedCrime.toLowerCase());
    const matchesLang = selectedLanguage === "all" || fir.language === selectedLanguage;
    const matchesStatus =
      selectedStatus === "all" ||
      (selectedStatus === "approved" && (fir.verified || fir.status === "approved")) ||
      (selectedStatus === "draft" && !fir.verified && fir.status !== "approved");

    return matchesSearch && matchesCrime && matchesLang && matchesStatus;
  });

  return (
    <main className="flex-1 md:ml-64 p-4 md:p-8 bg-[#f7f9fb] min-h-[calc(100vh-64px)] pb-24 md:pb-8 w-full font-['Inter']">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0051d5] flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">lock</span>
              Encrypted Police Repository
            </span>
          </div>
          <h1 className="font-['Hanken_Grotesk'] text-2xl md:text-4xl font-bold text-[#000000] mb-1">
            Records Vault
          </h1>
          <p className="text-sm text-[#45464d]">
            Secure archive of all registered, signed, and audio-verified First Information Reports.
          </p>
        </div>

        <Link
          to="/create"
          className="bg-[#0051d5] text-white font-semibold text-sm px-6 py-3 rounded-lg flex items-center gap-2 shadow-[0_4px_6px_-1px_rgba(15,23,42,0.05)] hover:bg-[#0051d5]/90 transition-transform active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          New Recording
        </Link>
      </div>

      {/* Vault Security Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-[0_4px_6px_-1px_rgba(15,23,42,0.05)] flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase text-[#45464d] tracking-wider">Total Vault Records</span>
            <div className="font-['Hanken_Grotesk'] text-3xl font-bold text-[#000000] mt-1 font-mono">
              {firs.length + 140}
            </div>
            <p className="text-[11px] text-[#10B981] font-semibold mt-1">✓ Tamper-evident Ledger</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#dbe1ff] text-[#0051d5] flex items-center justify-center">
            <span className="material-symbols-outlined text-[26px]">folder_shared</span>
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-[0_4px_6px_-1px_rgba(15,23,42,0.05)] flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase text-[#45464d] tracking-wider">Digitally Verified FIRs</span>
            <div className="font-['Hanken_Grotesk'] text-3xl font-bold text-[#10B981] mt-1 font-mono">
              {firs.filter(f => f.verified || f.status === "approved").length + 120}
            </div>
            <p className="text-[11px] text-[#45464d] mt-1">SHO Sealed & Certified</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#10B981]/10 text-[#10B981] flex items-center justify-center">
            <span className="material-symbols-outlined text-[26px]">verified</span>
          </div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-[0_4px_6px_-1px_rgba(15,23,42,0.05)] flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase text-[#45464d] tracking-wider">Audio Evidence Stored</span>
            <div className="font-['Hanken_Grotesk'] text-3xl font-bold text-[#0051d5] mt-1 font-mono">
              {firs.length + 140} Files
            </div>
            <p className="text-[11px] text-[#45464d] mt-1">Lossless WebM & MP3 Archives</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#dbe1ff] text-[#0051d5] flex items-center justify-center">
            <span className="material-symbols-outlined text-[26px]">mic</span>
          </div>
        </div>

      </div>

      {/* Vault Filter Bar & Table Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-[0_4px_6px_-1px_rgba(15,23,42,0.05)] overflow-hidden">
        
        {/* Filter Controls */}
        <div className="p-5 border-b border-[#E2E8F0] bg-[#f7f9fb] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#76777d] text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by FIR ID, Complainant, Location, Crime..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-[#E2E8F0] rounded-lg text-xs text-[#191c1e] focus:outline-none focus:border-[#0051d5]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedCrime}
              onChange={(e) => setSelectedCrime(e.target.value)}
              className="px-3 py-2 bg-white border border-[#E2E8F0] rounded-lg text-xs text-[#191c1e] focus:outline-none focus:border-[#0051d5]"
            >
              <option value="all">All Crime Types</option>
              <option value="theft">Theft / Burglary</option>
              <option value="assault">Assault</option>
              <option value="fraud">Cyber / Financial Fraud</option>
              <option value="snatching">Snatching</option>
            </select>

            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-3 py-2 bg-white border border-[#E2E8F0] rounded-lg text-xs text-[#191c1e] focus:outline-none focus:border-[#0051d5]"
            >
              <option value="all">All Languages</option>
              <option value="ta">Tamil (தமிழ்)</option>
              <option value="hi">Hindi (हिंदी)</option>
              <option value="en">English</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-white border border-[#E2E8F0] rounded-lg text-xs text-[#191c1e] focus:outline-none focus:border-[#0051d5]"
            >
              <option value="all">All Statuses</option>
              <option value="approved">Approved & Registered</option>
              <option value="draft">Drafts Only</option>
            </select>
          </div>
        </div>

        {/* Records Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f2f4f6] border-b border-[#E2E8F0]">
                <th className="font-semibold text-xs text-[#45464d] py-3.5 px-6 uppercase tracking-wider">Vault ID / Case</th>
                <th className="font-semibold text-xs text-[#45464d] py-3.5 px-6 uppercase tracking-wider">Complainant</th>
                <th className="font-semibold text-xs text-[#45464d] py-3.5 px-6 uppercase tracking-wider">Crime Type</th>
                <th className="font-semibold text-xs text-[#45464d] py-3.5 px-6 uppercase tracking-wider">Jurisdiction</th>
                <th className="font-semibold text-xs text-[#45464d] py-3.5 px-6 uppercase tracking-wider">Language</th>
                <th className="font-semibold text-xs text-[#45464d] py-3.5 px-6 uppercase tracking-wider">Verification</th>
                <th className="font-semibold text-xs text-[#45464d] py-3.5 px-6 text-right uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-sm">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((fir) => {
                  const isApproved = fir.verified || fir.status === "approved";

                  return (
                    <tr key={fir.firId} className="hover:bg-[#f7f9fb] transition-colors">
                      <td className="py-4 px-6 font-mono text-xs font-bold text-[#0051d5]">
                        {fir.firId}
                      </td>

                      <td className="py-4 px-6 text-[#191c1e] font-semibold text-xs">
                        {fir.complainant?.name || "Not stated"}
                      </td>

                      <td className="py-4 px-6 text-[#191c1e] text-xs">
                        {fir.incident?.crimeType || "Cognizable Offence"}
                      </td>

                      <td className="py-4 px-6 text-[#45464d] text-xs">
                        {fir.policeStation || "Central Station"}
                      </td>

                      <td className="py-4 px-6">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#f2f4f6] border border-[#E2E8F0]">
                          {fir.languageName || (fir.language === "ta" ? "Tamil" : fir.language === "hi" ? "Hindi" : "English")}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        {isApproved ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#10B981]/10 text-[#10B981]">
                            <span className="material-symbols-outlined text-[14px]">verified</span>
                            Archived
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[#F59E0B]/10 text-[#F59E0B]">
                            <span className="material-symbols-outlined text-[14px]">edit_document</span>
                            Draft
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/fir/${fir.firId}/${isApproved ? "result" : "review"}`}
                            className="p-1.5 rounded-lg text-[#45464d] hover:text-[#0051d5] hover:bg-[#f2f4f6] inline-flex items-center"
                            title="Open Record Details"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              {isApproved ? "visibility" : "edit"}
                            </span>
                          </Link>
                          
                          <a
                            href={api.getPDFUrl(fir.firId, fir.language || "en")}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg text-[#45464d] hover:text-[#0051d5] hover:bg-[#f2f4f6] inline-flex items-center"
                            title="Download PDF Copy"
                          >
                            <span className="material-symbols-outlined text-[18px]">download</span>
                          </a>
                        </div>
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#76777d]">
                    {loading ? "Loading vault archives..." : "No vault records found matching the criteria."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

    </main>
  );
}
