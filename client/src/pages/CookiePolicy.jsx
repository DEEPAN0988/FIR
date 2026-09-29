import React from "react";

export default function CookiePolicy() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10 text-[#191c1e] font-['Inter'] leading-relaxed">
      
      <header className="border-b border-[#E2E8F0] pb-6 mb-8">
        <div className="inline-block px-3 py-1 bg-[#dbe1ff] text-[#0051d5] rounded-full text-xs font-bold uppercase tracking-wider mb-2">
          Technical Transparency
        </div>
        <h1 className="text-3xl font-['Hanken_Grotesk'] font-bold text-[#191c1e]">
          Cookie & Local Storage Policy
        </h1>
        <p className="text-xs text-[#76777d] mt-2">
          Effective Date: September 29, 2026 • Compliant with DPDP Act 2023 & ePrivacy Standards
        </p>
      </header>

      <div className="space-y-8 text-sm text-[#45464d]">
        
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#191c1e] border-l-4 border-[#0051d5] pl-3">
            1. What Are Cookies & Local Storage?
          </h2>
          <p>
            Cookies and Web Local Storage are small text data entries placed on your browser when visiting web applications. They allow web portals to recognize authorized officer sessions, remember active language preferences, and secure data submissions.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#191c1e] border-l-4 border-[#0051d5] pl-3">
            2. Storage Audit: How We Use Storage
          </h2>
          <p>
            Sentinel VoiceFIR operates with a <strong>Zero-Tracking Architecture</strong>. We only utilize <em>Strictly Necessary</em> functional storage keys required to operate the application securely:
          </p>

          <div className="overflow-x-auto my-4">
            <table className="w-full text-left border-collapse border border-[#E2E8F0] text-xs">
              <thead>
                <tr className="bg-[#f2f4f6] text-[#191c1e]">
                  <th className="p-2.5 border border-[#E2E8F0]">Storage Key</th>
                  <th className="p-2.5 border border-[#E2E8F0]">Type</th>
                  <th className="p-2.5 border border-[#E2E8F0]">Purpose</th>
                  <th className="p-2.5 border border-[#E2E8F0]">Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2.5 border border-[#E2E8F0] font-mono text-[#0051d5]">voicefir_auth_token</td>
                  <td className="p-2.5 border border-[#E2E8F0]">Local Storage</td>
                  <td className="p-2.5 border border-[#E2E8F0]">Authenticates officer session for API calls</td>
                  <td className="p-2.5 border border-[#E2E8F0]">8 Hours / Until Signout</td>
                </tr>
                <tr>
                  <td className="p-2.5 border border-[#E2E8F0] font-mono text-[#0051d5]">voicefir_officer_data</td>
                  <td className="p-2.5 border border-[#E2E8F0]">Local Storage</td>
                  <td className="p-2.5 border border-[#E2E8F0]">Stores active officer name, rank & badge ID</td>
                  <td className="p-2.5 border border-[#E2E8F0]">8 Hours / Until Signout</td>
                </tr>
                <tr>
                  <td className="p-2.5 border border-[#E2E8F0] font-mono text-[#0051d5]">voicefir_cookie_consent</td>
                  <td className="p-2.5 border border-[#E2E8F0]">Local Storage</td>
                  <td className="p-2.5 border border-[#E2E8F0]">Remembers officer's consent choice for cookie banner</td>
                  <td className="p-2.5 border border-[#E2E8F0]">365 Days</td>
                </tr>
                <tr>
                  <td className="p-2.5 border border-[#E2E8F0] font-mono text-[#0051d5]">voicefir_groq_api_key</td>
                  <td className="p-2.5 border border-[#E2E8F0]">Local Storage</td>
                  <td className="p-2.5 border border-[#E2E8F0]">Stores officer's custom STT AI key locally</td>
                  <td className="p-2.5 border border-[#E2E8F0]">Persistent / User Managed</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#191c1e] border-l-4 border-[#0051d5] pl-3">
            3. Third-Party Tracking & Advertising Cookies
          </h2>
          <div className="bg-[#e8f5e9] p-4 rounded-xl border border-[#81c784] text-xs text-[#1b5e20] space-y-1">
            <p className="font-bold">ZERO THIRD-PARTY TRACKING GUARANTEE:</p>
            <p>
              Sentinel VoiceFIR contains <strong>NO</strong> Google Analytics, Facebook Pixel, advertising cookies, cross-site trackers, or marketing widgets. Your interaction with police tools is completely private and isolated.
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#191c1e] border-l-4 border-[#0051d5] pl-3">
            4. Managing & Clearing Storage
          </h2>
          <p>
            You can clear your local storage at any time via your browser settings (Privacy & Security &gt; Clear Browsing Data). Note that clearing local storage will require re-authenticating with your officer credentials.
          </p>
        </section>

      </div>
    </div>
  );
}
