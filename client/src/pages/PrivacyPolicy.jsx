import React from "react";

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10 text-[#191c1e] font-['Inter'] leading-relaxed">
      
      <header className="border-b border-[#E2E8F0] pb-6 mb-8">
        <div className="inline-block px-3 py-1 bg-[#dbe1ff] text-[#0051d5] rounded-full text-xs font-bold uppercase tracking-wider mb-2">
          Legal Notice & Statutory Compliance
        </div>
        <h1 className="text-3xl font-['Hanken_Grotesk'] font-bold text-[#191c1e]">
          Privacy Policy & DPDP Act Compliance
        </h1>
        <p className="text-xs text-[#76777d] mt-2">
          Last Updated & Effective: September 29, 2026 • Compliant with India Digital Personal Data Protection (DPDP) Act, 2023
        </p>
      </header>

      <div className="space-y-8 text-sm text-[#45464d]">
        
        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#191c1e] border-l-4 border-[#0051d5] pl-3">
            1. Overview & Scope
          </h2>
          <p>
            Sentinel Law Enforcement Solutions India Pvt. Ltd. ("Sentinel", "we", "us", or "our") provides the <strong>Sentinel VoiceFIR System</strong> to authorized law enforcement agencies, police precincts, and investigating officers. This Privacy Policy outlines our procedures regarding the collection, processing, storage, and protection of personal data in accordance with the <strong>Digital Personal Data Protection (DPDP) Act, 2023</strong> and the <strong>Bharatiya Nagarik Suraksha Sanhita (BNSS), 2023</strong>.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#191c1e] border-l-4 border-[#0051d5] pl-3">
            2. Lawful Grounds & Purpose of Data Processing
          </h2>
          <p>
            Personal data processed within Sentinel VoiceFIR is handled under <strong>Section 7 of the DPDP Act, 2023 ("Certain Legitimate Uses")</strong> for the performance of state functions, crime prevention, criminal investigation, and maintenance of public order under law.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-[#191c1e]">
            <li><strong>Voice Audio & Speech Transcripts:</strong> Collected to generate accurate First Information Report (FIR) drafts under BNSS Section 173.</li>
            <li><strong>Officer Credentials:</strong> Name, Rank, Badge Number, Station ID, and Email used for authentication and chain-of-custody audit logs.</li>
            <li><strong>Case Identifiers:</strong> Incident dates, locations, witness statements, and accused details as provided directly by the reporting officer or complainant.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#191c1e] border-l-4 border-[#0051d5] pl-3">
            3. Data Minimization & Security Controls
          </h2>
          <p>
            We adhere strictly to the principle of <em>Data Minimization</em>. Sentinel VoiceFIR collects only data strictly necessary for law enforcement documentation.
          </p>
          <div className="bg-[#f2f4f6] p-4 rounded-xl border border-[#E2E8F0] space-y-2">
            <h3 className="font-bold text-[#191c1e]">Security Standards:</h3>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li><strong>Encryption in Transit:</strong> TLS 1.3 encryption on all web and API transmissions.</li>
              <li><strong>Encryption at Rest:</strong> AES-256 bit encryption for stored FIR records and audio artifacts.</li>
              <li><strong>Zero Commercial Monetization:</strong> No data is ever sold, rented, or repurposed for commercial profiling or advertising.</li>
              <li><strong>AI Processing Safeguards:</strong> Automated speech transcription utilizes enterprise zero-data-retention APIs where inputs are discarded immediately after processing.</li>
            </ul>
          </div>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#191c1e] border-l-4 border-[#0051d5] pl-3">
            4. Statutory Exemptions & Data Principal Rights
          </h2>
          <p>
            Under the DPDP Act 2023, individuals ("Data Principals") generally possess rights to access, correct, and erase personal data. However, under <strong>Section 17(1) of the DPDP Act</strong>, data processed for law enforcement, prevention/investigation of offences, or judicial proceedings is exempt from right-to-erasure requests to preserve evidentiary integrity under Indian law.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#191c1e] border-l-4 border-[#0051d5] pl-3">
            5. Business Details & Data Protection Officer (DPO) Contact
          </h2>
          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] space-y-1 text-xs">
            <p><strong>Entity Name:</strong> Sentinel Law Enforcement Solutions (India) Pvt. Ltd.</p>
            <p><strong>Corporate Identification Number (CIN):</strong> U72900DL2024PTC998811</p>
            <p><strong>Registered Address:</strong> Technology Legal Wing, Barakhamba Road, Connaught Place, New Delhi 110001, India</p>
            <p><strong>Data Protection Officer (DPO):</strong> Compliance Bureau (<a href="mailto:dpo@sentinel-fir.gov.in" className="text-[#0051d5] underline">dpo@sentinel-fir.gov.in</a>)</p>
          </div>
        </section>

      </div>
    </div>
  );
}
