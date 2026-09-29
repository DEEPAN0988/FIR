import React from "react";

export default function FIRPreview({ fir, language = "en" }) {
  if (!fir) return null;

  const district = (fir.district || "SALEM").toUpperCase();
  const station = (fir.policeStation || "THOLASAMPATTY").toUpperCase();
  const firId = fir.firId || "FIR-2026-0110";
  const dateStr = fir.registeredAt || fir.createdAt || new Date().toISOString().split("T")[0];
  const comp = fir.complainant || {};
  const inc = fir.incident || {};
  const accusedList = fir.accused || [];
  const props = fir.property || [];

  return (
    <div className="w-full bg-white border border-[#000000] rounded-sm shadow-lg p-6 sm:p-10 font-serif text-[#000000] leading-tight">
      
      {/* Official Government Form Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start border-b border-black pb-4 gap-4">
        <div className="w-16">
          <div className="w-12 h-12 rounded-full border border-black flex items-center justify-center font-bold text-xs">
            POLICE
          </div>
        </div>

        <div className="flex-1 text-center">
          <h2 className="font-bold text-base sm:text-lg tracking-wider uppercase">
            FIRST INFORMATION REPORT
          </h2>
          {language === "ta" && (
            <h3 className="font-bold text-sm tracking-wide mt-0.5">
              முதல் தகவல் அறிக்கை
            </h3>
          )}
          {language === "hi" && (
            <h3 className="font-bold text-sm tracking-wide mt-0.5">
              प्रथम सूचना रिपोर्ट
            </h3>
          )}
          <p className="text-[11px] text-gray-700 mt-0.5">
            (Under Section 154 Cr.P.C. / Section 173 Bharatiya Nagarik Suraksha Sanhita - BNSS)
          </p>
          {language === "ta" && (
            <p className="text-[10px] text-gray-600">
              (கு.ந.வி.தொ.பிரிவு 154 இன் கீழ் / பிரிவு 173 BNSS)
            </p>
          )}
        </div>

        <div className="text-right text-[11px] font-sans">
          <p className="font-bold tracking-wider">TAMIL NADU POLICE</p>
          <p className="text-[10px] text-gray-700 uppercase">Integrated Investigation Form-I</p>
          <p className="font-mono font-bold text-sm text-[#0051d5] mt-1">C {firId.replace("FIR-2026-", "2026-")}</p>
        </div>
      </div>

      {/* Grid Meta Header: 1. District, PS, Year, FIR No, Date */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 py-3 border-b border-gray-300 text-xs font-sans">
        <div>
          <span className="block font-bold">1. District / மாவட்டம் :</span>
          <span className="font-semibold uppercase">{district}</span>
        </div>
        <div>
          <span className="block font-bold">PS / காவல் நிலையம் :</span>
          <span className="font-semibold uppercase">{station}</span>
        </div>
        <div>
          <span className="block font-bold">Year / ஆண்டு :</span>
          <span className="font-semibold">2026</span>
        </div>
        <div>
          <span className="block font-bold">FIR No / மு.த.அ. எண் :</span>
          <span className="font-mono font-bold text-[#0051d5]">{firId}</span>
        </div>
        <div>
          <span className="block font-bold">Date / நாள் :</span>
          <span className="font-semibold">{dateStr}</span>
        </div>
      </div>

      {/* 2. Acts & Sections */}
      <div className="py-2.5 border-b border-gray-300 text-xs font-sans">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
          <div className="sm:col-span-1 font-bold">
            2. Act(s) / சட்டம் :
          </div>
          <div className="sm:col-span-2 text-gray-900">
            INDIAN PENAL CODE, 1860 / BHARATIYA NYAYA SANHITA (BNS)
          </div>
          <div className="sm:col-span-1">
            <span className="font-bold">Sections / பிரிவுகள்: </span>
            <span className="font-mono font-bold">{(fir.sections || []).join(", ") || "IPC 448, 511"}</span>
          </div>
        </div>
      </div>

      {/* 3. Occurrence of Offence */}
      <div className="py-2.5 border-b border-gray-300 text-xs font-sans space-y-1.5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div>
            <span className="font-bold">3. (a) Occurrence Day : </span>
            <span>Wednesday / குறிப்பிட்டபடி</span>
          </div>
          <div>
            <span className="font-bold">Date From / நாள் முதல் : </span>
            <span className="font-semibold">{inc.date || "19-08-2026"}</span>
          </div>
          <div>
            <span className="font-bold">Time / நேரம் : </span>
            <span>{inc.time || "As observed"}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700">
          <div>
            <span className="font-bold text-black">(b) Info Received at PS : </span>
            <span>Date: {dateStr} | Time: 12:00 Hrs</span>
          </div>
          <div>
            <span className="font-bold text-black">(c) GD Entry No : </span>
            <span>{firId}/GD</span>
          </div>
        </div>
      </div>

      {/* 4. Type of Information */}
      <div className="py-2 border-b border-gray-300 text-xs font-sans">
        <span className="font-bold">4. Type of Information / தகவலின் வகை : </span>
        <span className="font-semibold uppercase">ORAL / VOICE RECORDING (குரல் பதிவு மூலமாக பெறப்பட்டது)</span>
      </div>

      {/* 5. Place of Occurrence */}
      <div className="py-2.5 border-b border-gray-300 text-xs font-sans">
        <div className="font-bold mb-1">5. Place of Occurrence / குற்ற நிகழ்விடம் :</div>
        <div className="pl-4 space-y-0.5 text-gray-900">
          <p>(a) Direction & Distance from PS: <b>NORTH-WEST & 2.5 KM</b> | Beat No: <b>04</b></p>
          <p>(b) Address / முகவரி: <b>{inc.location || "Tiruvarur Near Tiruvarur Bus Stand"}</b></p>
          <p>(c) If outside limit of this PS, Name of PS / District: <b>- Nil -</b></p>
        </div>
      </div>

      {/* 6. Complainant Details */}
      <div className="py-2.5 border-b border-gray-300 text-xs font-sans">
        <div className="font-bold mb-1">6. Complainant / Informant / குற்ற முறையீட்டாளர் :</div>
        <div className="pl-4 space-y-1 text-gray-900">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <p>(a) Name: <b>{comp.name || "Deepan Nandakumar"}</b></p>
            <p>(b) Father's Name: <b>{comp.fatherOrHusbandName || "Not stated"}</b></p>
            <p>(c) Year of Birth: <b>1998</b> | Nationality: <b>INDIAN</b></p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <p>(d) Contact Phone: <b>{comp.phone || "8015182880"}</b></p>
            <p>(e) Address: <b>{comp.address || "Tiruvarur near Tiruvarur bus stand"}</b></p>
          </div>
        </div>
      </div>

      {/* 7. Details of Accused */}
      <div className="py-2.5 border-b border-gray-300 text-xs font-sans">
        <div className="font-bold mb-1">7. Details of Accused / குற்றம் சாட்டப்பட்டவரின் விவரங்கள் :</div>
        <div className="pl-4 text-gray-900 space-y-0.5">
          {accusedList.length > 0 ? (
            accusedList.map((a, i) => (
              <p key={i}><b>{i + 1}) {a.name || "Unknown Person"}</b> - {a.description || "Unidentified Suspect"}</p>
            ))
          ) : (
            <p><b>1) Two Unknown Strangers (இரு அடையாளம் தெரியாத நபர்கள்)</b> - Unidentified suspects roaming around house.</p>
          )}
        </div>
      </div>

      {/* 8, 9, 10. Properties Involved */}
      <div className="py-2.5 border-b border-gray-300 text-xs font-sans space-y-1">
        <p><span className="font-bold">8. Reasons for delay in reporting : </span>Direct statement submitted at PS upon sensing threat.</p>
        <div>
          <span className="font-bold">9. Particulars of properties involved / சொத்துக்களின் விவரம் : </span>
          <span className="text-gray-900">
            {props.length > 0 ? props.map(p => `${p.item} (${p.description})`).join("; ") : "Valuables stated in custody: Gold, Silver, Platinum"}
          </span>
        </div>
        <p><span className="font-bold">10. Total value of properties : </span>Under statutory valuation & enquiry (மதிப்பீடு செய்யப்படுகிறது)</p>
      </div>

      {/* 11. First Information Contents / Narrative */}
      <div className="py-4 border-b border-gray-300 text-xs space-y-2">
        <div className="font-bold font-sans">
          11. First Information contents / முதல் தகவல் அறிக்கை விவரம் :
        </div>
        
        {language === "ta" && fir.narrative_ta && (
          <div className="p-3 bg-gray-50 border border-gray-200 rounded font-sans leading-relaxed text-gray-900">
            <span className="font-bold text-[#0051d5] block text-[11px] mb-1">[தமிழ் வாக்குமூலம் / TAMIL STATEMENT]</span>
            <p>{fir.narrative_ta}</p>
          </div>
        )}

        {language === "hi" && fir.narrative_hi && (
          <div className="p-3 bg-gray-50 border border-gray-200 rounded font-sans leading-relaxed text-gray-900">
            <span className="font-bold text-[#0051d5] block text-[11px] mb-1">[हिंदी बयान / HINDI STATEMENT]</span>
            <p>{fir.narrative_hi}</p>
          </div>
        )}

        <div className="font-sans leading-relaxed text-gray-800 text-[11px]">
          <span className="font-bold text-gray-700 block mb-0.5">[ENGLISH RECORD]</span>
          <p>{fir.narrative}</p>
        </div>
      </div>

      {/* 12. Signatures & Official Police Seal */}
      <div className="grid grid-cols-2 gap-6 pt-6 text-xs font-sans">
        <div className="border border-gray-300 p-3 rounded bg-gray-50">
          <p className="font-bold">Signature / Thumb Impression of Complainant :</p>
          <p className="text-[10px] text-gray-600">குற்றமுறையீட்டாளர் / தகவல் தருபவரின் கையொப்பம்</p>
          <div className="mt-8 font-bold">
            [ {comp.name || "Deepan Nandakumar"} ]
          </div>
        </div>

        <div className="border border-gray-300 p-3 rounded bg-gray-50 text-right">
          <p className="font-bold">Signature of the Officer in-charge, PS :</p>
          <p className="text-[10px] text-gray-600">காவல் நிலைய பொறுப்பு அலுவலரின் கையொப்பம்</p>
          <div className="mt-6">
            <p className="font-bold">PARAMASIVAM</p>
            <p className="text-[10px] text-gray-700">Sub-Inspector of Police [SSI-339]</p>
            <p className="text-[10px] text-gray-700">{station}</p>
            <p className="font-bold text-xs text-[#0051d5] mt-1">
              {fir.verified ? "[ OFFICIALLY REGISTERED & SIGNED ]" : "[ PRELIMINARY DRAFT ]"}
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
