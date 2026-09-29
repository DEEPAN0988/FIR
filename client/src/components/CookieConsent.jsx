import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("voicefir_cookie_consent");
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("voicefir_cookie_consent", "accepted");
    setVisible(false);
  };

  const handleDeclineNonEssential = () => {
    localStorage.setItem("voicefir_cookie_consent", "essential_only");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside
      aria-label="Cookie and Data Privacy Notice"
      className="fixed bottom-0 inset-x-0 bg-[#191c1e] text-white p-4 sm:p-5 border-t border-[#313538] shadow-2xl z-50 transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
        <div className="space-y-1 max-w-3xl">
          <div className="flex items-center gap-2 font-bold text-sm text-[#8bb0ff]">
            <span className="material-symbols-outlined text-[18px]">cookie</span>
            Cookie & Essential Storage Notice
          </div>
          <p className="text-[#c6c6cc] leading-relaxed">
            Sentinel VoiceFIR uses strictly essential session tokens and local storage strictly required for secure officer authentication, CSRF security, and system stability under India's Digital Personal Data Protection (DPDP) Act 2023. We <strong>do not</strong> deploy third-party marketing, tracking, or advertising cookies.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
          <Link
            to="/cookie-policy"
            className="text-[#8bb0ff] hover:underline font-semibold focus:outline-2 focus:outline-white rounded px-2 py-1"
          >
            Read Cookie Policy
          </Link>
          <button
            type="button"
            onClick={handleDeclineNonEssential}
            className="bg-[#313538] hover:bg-[#45464d] text-white font-medium px-3 py-2 rounded-lg border border-[#45464d] transition-colors focus:ring-2 focus:ring-white"
          >
            Essential Only
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className="bg-[#0051d5] hover:bg-[#316bf3] text-white font-semibold px-4 py-2 rounded-lg transition-colors focus:ring-2 focus:ring-white"
          >
            Accept All Necessary
          </button>
        </div>
      </div>
    </aside>
  );
}
