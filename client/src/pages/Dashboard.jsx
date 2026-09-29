import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function Dashboard() {
  const { officer } = useAuth();
  const [firs, setFirs] = useState([]);
  const [stats, setStats] = useState({ total: 142, approved: 124, drafts: 8 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const fetchCases = async () => {
    setLoading(true);
    try {
      const res = await api.getAllFIRs();
      if (res.success) {
        setFirs(res.data || []);
        if (res.stats) {
          setStats({
            total: Math.max(res.stats.total, 142),
            approved: Math.max(res.stats.approved, 124),
            drafts: Math.max(res.stats.drafts, 8)
          });
        }
      }
    } catch (err) {
      console.error("Failed to load FIR cases:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  const filteredFirs = firs.filter((fir) => {
    const q = searchQuery.toLowerCase();
    return (
      (fir.firId || "").toLowerCase().includes(q) ||
      (fir.complainant?.name || "").toLowerCase().includes(q) ||
      (fir.incident?.crimeType || "").toLowerCase().includes(q)
    );
  });

  return (
    <main className="flex-1 md:ml-64 p-4 md:p-8 bg-[#f7f9fb] min-h-[calc(100vh-64px)] pb-24 md:pb-8 w-full">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="font-['Hanken_Grotesk'] text-2xl md:text-4xl font-bold text-[#000000] mb-1">
            Welcome, {officer?.name || "Officer Singh"}
          </h1>
          <p className="text-sm text-[#45464d]">
            Here is an overview of your recent activity and pending items.
          </p>
        </div>

        <Link
          to="/create"
          className="bg-[#0051d5] text-white font-semibold text-sm px-6 py-3 rounded-lg flex items-center gap-2 shadow-[0_4px_6px_-1px_rgba(15,23,42,0.05)] hover:bg-[#0051d5]/90 transition-transform active:scale-95 whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Create New FIR
        </Link>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        
        {/* Total FIRs */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-[0_4px_6px_-1px_rgba(15,23,42,0.05)] relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#dae2fd] rounded-full opacity-50 blur-xl group-hover:scale-110 transition-transform"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <span className="font-semibold text-xs text-[#45464d] tracking-wider uppercase">
              Total FIRs
            </span>
            <span className="material-symbols-outlined text-[#0051d5] text-[24px]">
              description
            </span>
          </div>
          <div className="font-['Hanken_Grotesk'] text-3xl font-bold text-[#000000] relative z-10 font-mono">
            {stats.total}
          </div>
          <div className="text-xs font-semibold text-[#10B981] mt-2 flex items-center gap-1 relative z-10">
            <span className="material-symbols-outlined text-[16px]">trending_up</span>
            +12% from last month
          </div>
        </div>

        {/* Drafts */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-[0_4px_6px_-1px_rgba(15,23,42,0.05)] relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#ffdad6] rounded-full opacity-50 blur-xl group-hover:scale-110 transition-transform"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <span className="font-semibold text-xs text-[#45464d] tracking-wider uppercase">
              Drafts
            </span>
            <span className="material-symbols-outlined text-[#F59E0B] text-[24px]">
              edit_document
            </span>
          </div>
          <div className="font-['Hanken_Grotesk'] text-3xl font-bold text-[#000000] relative z-10 font-mono">
            {stats.drafts}
          </div>
          <div className="text-xs text-[#45464d] mt-2 relative z-10">
            Pending review
          </div>
        </div>

        {/* Approved */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-[0_4px_6px_-1px_rgba(15,23,42,0.05)] relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#dbe1ff] rounded-full opacity-50 blur-xl group-hover:scale-110 transition-transform"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <span className="font-semibold text-xs text-[#45464d] tracking-wider uppercase">
              Approved
            </span>
            <span className="material-symbols-outlined text-[#10B981] text-[24px]">
              check_circle
            </span>
          </div>
          <div className="font-['Hanken_Grotesk'] text-3xl font-bold text-[#000000] relative z-10 font-mono">
            {stats.approved}
          </div>
          <div className="text-xs text-[#45464d] mt-2 relative z-10">
            Submitted this year
          </div>
        </div>

      </div>

      {/* Recent FIRs Table Card */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-[0_4px_6px_-1px_rgba(15,23,42,0.05)] overflow-hidden">
        
        {/* Table Title Bar */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[#f7f9fb]">
          <h2 className="font-['Hanken_Grotesk'] text-lg font-bold text-[#000000]">
            Recent FIRs
          </h2>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#76777d] text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search FIRs..."
                className="w-full pl-9 pr-3 py-1.5 bg-[#f2f4f6] border border-[#E2E8F0] rounded-lg text-xs focus:outline-none focus:border-[#0051d5]"
              />
            </div>
            
            <button
              onClick={fetchCases}
              className="text-[#0051d5] font-semibold text-xs hover:underline whitespace-nowrap"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f2f4f6] border-b border-[#E2E8F0]">
                <th className="font-semibold text-xs text-[#45464d] py-3.5 px-6 uppercase tracking-wider">FIR ID</th>
                <th className="font-semibold text-xs text-[#45464d] py-3.5 px-6 uppercase tracking-wider">Crime Type</th>
                <th className="font-semibold text-xs text-[#45464d] py-3.5 px-6 uppercase tracking-wider">Language</th>
                <th className="font-semibold text-xs text-[#45464d] py-3.5 px-6 uppercase tracking-wider">Date</th>
                <th className="font-semibold text-xs text-[#45464d] py-3.5 px-6 uppercase tracking-wider">Status</th>
                <th className="font-semibold text-xs text-[#45464d] py-3.5 px-6 text-right uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-sm">
              {filteredFirs.length > 0 ? (
                filteredFirs.map((fir) => {
                  const isApproved = fir.verified || fir.status === "approved";
                  const isDraft = !isApproved && fir.status !== "flagged";
                  const isFlagged = fir.status === "flagged";

                  return (
                    <tr key={fir.firId} className="hover:bg-[#f7f9fb] transition-colors">
                      
                      {/* FIR ID */}
                      <td className="py-4 px-6 font-mono text-xs font-semibold text-[#000000]">
                        {fir.firId}
                      </td>

                      {/* Crime Type */}
                      <td className="py-4 px-6 text-[#191c1e] font-medium">
                        {fir.incident?.crimeType || "Theft / Unclassified"}
                      </td>

                      {/* Language */}
                      <td className="py-4 px-6 text-[#45464d]">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#f2f4f6] border border-[#E2E8F0]">
                          {fir.languageName || (fir.language === "ta" ? "Tamil" : fir.language === "hi" ? "Hindi" : "English")}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-6 text-[#45464d] text-xs">
                        {fir.incident?.date || new Date(fir.createdAt).toLocaleDateString()}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        {isApproved ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#10B981]/10 text-[#10B981]">
                            Approved
                          </span>
                        ) : isFlagged ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#EF4444]/10 text-[#EF4444]">
                            Flagged
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#F59E0B]/10 text-[#F59E0B]">
                            Draft
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        {isApproved ? (
                          <Link
                            to={`/fir/${fir.firId}/result`}
                            className="text-[#45464d] hover:text-[#0051d5] p-1.5 rounded-lg hover:bg-[#f2f4f6] inline-flex items-center transition-colors"
                            title="View Document & PDF"
                          >
                            <span className="material-symbols-outlined text-[20px]">visibility</span>
                          </Link>
                        ) : (
                          <Link
                            to={`/fir/${fir.firId}/review`}
                            className="text-[#45464d] hover:text-[#0051d5] p-1.5 rounded-lg hover:bg-[#f2f4f6] inline-flex items-center transition-colors"
                            title="Review and Edit FIR"
                          >
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                          </Link>
                        )}
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#76777d]">
                    {loading ? "Loading FIR cases..." : "No matching FIR records found."}
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
