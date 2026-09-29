import React from "react";

export default function RefundPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10 text-[#191c1e] font-['Inter'] leading-relaxed">
      
      <header className="border-b border-[#E2E8F0] pb-6 mb-8">
        <div className="inline-block px-3 py-1 bg-[#dbe1ff] text-[#0051d5] rounded-full text-xs font-bold uppercase tracking-wider mb-2">
          Commercial & Enterprise Terms
        </div>
        <h1 className="text-3xl font-['Hanken_Grotesk'] font-bold text-[#191c1e]">
          Refund & Commercial Subscriptions Policy
        </h1>
        <p className="text-xs text-[#76777d] mt-2">
          Effective Date: September 29, 2026 • Enterprise & Government Procurement Terms
        </p>
      </header>

      <div className="space-y-8 text-sm text-[#45464d]">
        
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#191c1e] border-l-4 border-[#0051d5] pl-3">
            1. Commercial Structure & Scope
          </h2>
          <p>
            Sentinel VoiceFIR is an enterprise government-technology (GovTech) SaaS platform deployed for law enforcement agencies, municipal police departments, and state security bureaus. Access is provisioned under institutional Master Service Agreements (MSA) or government tender contracts.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#191c1e] border-l-4 border-[#0051d5] pl-3">
            2. Non-Applicability of Consumer Retail Refunds
          </h2>
          <div className="bg-[#f2f4f6] p-4 rounded-xl border border-[#E2E8F0] space-y-2 text-xs">
            <p className="font-bold text-[#191c1e]">Notice Regarding Consumer Payment Gateways:</p>
            <p>
              Sentinel VoiceFIR does not sell individual consumer products or process retail credit card transactions on this portal. As such, standard consumer retail return or refund policies (such as 14-day e-commerce return policies) do not apply to this system.
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#191c1e] border-l-4 border-[#0051d5] pl-3">
            3. Departmental Subscription Cancellations & SLA Credits
          </h2>
          <p>
            For police departments and government bodies operating under annual or multi-year enterprise contracts:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-[#191c1e]">
            <li><strong>Contract Termination:</strong> Departmental contract cancellations are governed strictly by the termination clauses set forth in the executed procurement agreement or Memorandum of Understanding (MoU).</li>
            <li><strong>SLA Outage Credits:</strong> In the event of system downtime exceeding guaranteed SLA thresholds, institutional service credits will be applied toward the subsequent billing cycle as stipulated in the MSA.</li>
            <li><strong>Unused Allocation:</strong> Prepaid annual precinct license allocations are non-refundable but may be transferred between precincts upon written request from an authorized Deputy Commissioner or Chief of Police.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-[#191c1e] border-l-4 border-[#0051d5] pl-3">
            4. Enterprise Billing Support & Inquiries
          </h2>
          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] space-y-1 text-xs">
            <p>For billing queries, invoice verification, or institutional contract adjustments:</p>
            <p><strong>Finance & Billing Division:</strong> Sentinel Law Enforcement Solutions (India) Pvt. Ltd.</p>
            <p><strong>Email:</strong> <a href="mailto:billing@sentinel-fir.gov.in" className="text-[#0051d5] underline">billing@sentinel-fir.gov.in</a></p>
            <p><strong>Phone:</strong> +91 (011) 2345-6789 (Gov Support Line)</p>
          </div>
        </section>

      </div>
    </div>
  );
}
