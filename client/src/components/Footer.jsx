import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-[#e0e3e5] border-t border-[#c6c6cc] text-[#45464d] text-xs py-8 px-6 mt-auto relative z-30">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        
        {/* Business & Legal Entity Details */}
        <div className="space-y-1.5 max-w-md">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#0051d5] text-[20px]" aria-hidden="true">
              policy
            </span>
            <span className="font-['Hanken_Grotesk'] font-bold text-sm text-[#191c1e]">
              Sentinel VoiceFIR System
            </span>
          </div>
          <p className="text-[11px] leading-relaxed text-[#45464d]">
            Official Law Enforcement Assistance Platform • Developed for Police Operations & Legal Compliance.
          </p>
          <p className="text-[11px] text-[#45464d]">
            <strong>Entity:</strong> Sentinel Law Enforcement Solutions (India) Pvt. Ltd. • CIN: U72900DL2024PTC998811
          </p>
          <p className="text-[11px] text-[#45464d]">
            <strong>Compliance:</strong> Compliant with Digital Personal Data Protection (DPDP) Act, 2023 & BNSS Guidelines.
          </p>
        </div>

        {/* Legal Policy Links */}
        <div className="flex flex-wrap gap-4 md:gap-6 font-semibold text-[#0051d5]">
          <Link
            to="/privacy-policy"
            className="hover:underline hover:text-[#003ea8] focus:outline-2 focus:outline-[#0051d5] rounded px-1"
          >
            Privacy Policy
          </Link>
          <Link
            to="/terms-and-conditions"
            className="hover:underline hover:text-[#003ea8] focus:outline-2 focus:outline-[#0051d5] rounded px-1"
          >
            Terms & Conditions
          </Link>
          <Link
            to="/cookie-policy"
            className="hover:underline hover:text-[#003ea8] focus:outline-2 focus:outline-[#0051d5] rounded px-1"
          >
            Cookie Policy
          </Link>
          <Link
            to="/refund-policy"
            className="hover:underline hover:text-[#003ea8] focus:outline-2 focus:outline-[#0051d5] rounded px-1"
          >
            Refund Policy
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-[#c6c6cc] mt-6 pt-4 flex flex-col sm:flex-row justify-between items-center text-[11px] text-[#76777d] gap-2">
        <p>© {new Date().getFullYear()} Sentinel Law Enforcement Solutions India. All rights reserved.</p>
        <p>Data Protection Officer Contact: <a href="mailto:dpo@sentinel-fir.gov.in" className="text-[#0051d5] hover:underline">dpo@sentinel-fir.gov.in</a></p>
      </div>
    </footer>
  );
}
