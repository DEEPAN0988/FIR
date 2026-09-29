import React from "react";

export default function TermsAndConditions() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10 text-[#191c1e] font-['Inter'] leading-relaxed">
      
      <header className="border-b border-[#E2E8F0] pb-6 mb-8">
        <div className="inline-block px-3 py-1 bg-[#dbe1ff] text-[#0051d5] rounded-full text-xs font-bold uppercase tracking-wider mb-2">
          Official Terms of Service
        </div>
        <h1 className="text-3xl font-['Hanken_Grotesk'] font-bold text-[#191c1e]">
          Terms & Conditions of Use
        </h1>
        <p className="text-xs text-[#76777d] mt-2">
          Effective Date: September 29, 2026 • Governed by the Laws of the Republic of India
        </p>
      </header>

      <div className="space-y-8 text-sm text-[#45464d]">
        
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#191c1e] border-l-4 border-[#0051d5] pl-3">
            1. Authorization & Designated Usage
          </h2>
          <p>
            The <strong>Sentinel VoiceFIR System</strong> is an enterprise software platform designed exclusively for sworn law enforcement officers, police department staff, and authorized public safety agency personnel. Unauthorized access, attempt to impersonate an officer, or unauthorized extraction of police records is strictly prohibited and constitutes an offence under the <strong>Information Technology Act, 2000 (Section 66 & 70)</strong>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#191c1e] border-l-4 border-[#0051d5] pl-3">
            2. Mandatory Human-in-the-Loop Review Requirement
          </h2>
          <div className="bg-[#fff8f6] p-4 rounded-xl border border-[#ba1a1a]/30 space-y-2 text-xs text-[#93000a]">
            <p className="font-bold text-sm">IMPORTANT LEGAL DISCLAIMER FOR INVESTIGATING OFFICERS:</p>
            <p>
              Sentinel VoiceFIR uses Artificial Intelligence to transcribe spoken statements and structure draft First Information Reports (FIRs). <strong>AI-generated drafts do NOT constitute an official legal FIR until verified, corrected, and signed off by the Investigating Officer (IO)</strong> pursuant to Section 173 of Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023 / CrPC. The Investigating Officer remains solely responsible for the legal accuracy of filed documents.
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#191c1e] border-l-4 border-[#0051d5] pl-3">
            3. Account Responsibility & Security
          </h2>
          <p>
            Users are required to maintain strict confidentiality of badge login credentials and API keys. Any action originating from an authenticated badge login shall be attributed to the registered officer in system audit logs.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#191c1e] border-l-4 border-[#0051d5] pl-3">
            4. System Availability & Service Level Agreement (SLA)
          </h2>
          <p>
            While Sentinel aims for continuous service availability for critical police infrastructure, the platform is provided on an "AS IS" and "AS AVAILABLE" basis. Sentinel Law Enforcement Solutions India Pvt. Ltd. shall not be held liable for temporary network latency, third-party speech API disruptions, or hardware failure at precinct level.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#191c1e] border-l-4 border-[#0051d5] pl-3">
            5. Governing Law & Dispute Resolution
          </h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of India. Any legal action or proceeding arising under these Terms shall be subject to the exclusive jurisdiction of the courts located in <strong>New Delhi, India</strong>.
          </p>
        </section>

      </div>
    </div>
  );
}
