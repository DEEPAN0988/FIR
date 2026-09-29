const { v4: uuidv4 } = require("uuid");
const ragService = require("../services/ragService");
const { generateFIR } = require("../services/groqService");
const { generateFIRPDF } = require("../services/pdfService");
const { db, isFirebaseConnected } = require("../config/firebaseAdmin");

// In-memory store for instant persistence when Firestore is not configured
const inMemoryCases = new Map();
const inMemoryAuditLogs = [];

// Seed with demo cases for immediate dashboard inspection
const seedCases = [
  {
    firId: "FIR-2026-0001",
    createdBy: "officer_demo_001",
    policeStation: "Anna Nagar Police Station (K-4)",
    district: "Chennai City Police",
    language: "ta",
    languageName: "Tamil",
    nativeTranscript: "நேற்று இரவு சுமார் 10:30 மணியளவில் சென்னை அண்ணாநகர் 2-வது பிரதான சாலையில் உள்ள எனது வீட்டின் பின்பக்க பால்கனி பூட்டை உடைத்து உள்ளே புகுந்த மர்ம நபர்கள், பீரோவில் இருந்த 8 சவரன் தங்க நகைகள் மற்றும் ரூபாய் 45,000 ரொக்கப் பணத்தைத் திருடிச் சென்றுவிட்டனர்.",
    englishTranscript: "Yesterday night around 10:30 PM, unknown intruders broke the rear balcony lock of my residence at No. 14, 2nd Main Road, Anna Nagar, Chennai and stole 8 sovereigns of gold jewellery along with 45,000 rupees in cash.",
    complainant: {
      name: "K. Subramaniam",
      fatherOrHusbandName: "Krishnaswamy",
      age: "48",
      address: "No. 14, 2nd Main Road, Anna Nagar, Chennai",
      phone: "+91 94440 12345"
    },
    incident: {
      crimeType: "Housebreaking by Night and Theft",
      date: "2026-08-20",
      time: "22:30 hrs",
      location: "No. 14, 2nd Main Road, Anna Nagar, Chennai",
      description: "Intruders broke open rear balcony latch and stolen 8 sovereigns gold ornaments and cash."
    },
    accused: [
      { name: "Unknown intruder(s)", description: "Unidentified person(s)", relationship: "Stranger" }
    ],
    witnesses: [
      { name: "S. Murugan (Security)", address: "Anna Nagar 2nd Main Road" }
    ],
    evidence: [
      "Broken padlock latch",
      "CCTV footage from junction camera #4",
      "Fingerprints lifted from bedroom almirah"
    ],
    property: [
      { item: "Gold Jewellery", value: "8 Sovereigns (Approx. Rs. 4,80,000)", description: "Necklace & bangles" },
      { item: "Cash Currency", value: "Rs. 45,000", description: "INR Currency" }
    ],
    sections: ["IPC 457", "IPC 380", "BNS 331(4), 305"],
    narrative: "On 20-08-2026 at about 22:30 hours, complainant K. Subramaniam stated that unknown persons entered his residence by breaking the lock of the rear balcony door and stole 8 sovereigns of gold ornaments and cash.",
    narrative_ta: "20-08-2026 அன்று இரவு சுமார் 22:30 மணியளவில் சென்னை அண்ணா நகர் 2-வது மெயின் ரோட்டில் வசிக்கும் புகார்தாரர் கே. சுப்பிரமணியம் என்பவரின் வீட்டின் பின்பக்க பால்கனி பூட்டை மர்ம நபர்கள் உடைத்து 8 சவரன் தங்க நகைகள் மற்றும் ரூபாய் 45,000 பணத்தைத் திருடிச் சென்றுள்ளனர்.",
    narrative_hi: "दिनांक 20-08-2026 को रात लगभग 22:30 बजे शिकायतकर्ता के. सुब्रमण्यम के घर से 8 तोले सोने के जेवरात और 45,000 रुपये नकद चोरी कर लिए गए।",
    status: "approved",
    verified: true,
    verifiedBy: {
      name: "Insp. R. Subramaniam",
      rank: "Inspector of Police",
      badgeNumber: "TN-POL-8842",
      station: "Anna Nagar Police Station (K-4)"
    },
    verifiedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    firId: "FIR-2026-0002",
    createdBy: "officer_demo_001",
    policeStation: "Connaught Place Police Station",
    district: "New Delhi District Police",
    language: "hi",
    languageName: "Hindi",
    nativeTranscript: "कल रात लगभग 8:30 बजे कनॉट प्लेस मेट्रो स्टेशन गेट नंबर 2 के पास दो अज्ञात लड़कों ने काली पल्सर मोटरसाइकिल पर आकर मुझे रोका, गाली-गलौज की और मारपीट करके मेरा पर्स और मोबाइल फोन छीन लिया।",
    englishTranscript: "Yesterday night at around 8:30 PM near Gate No. 2 of Connaught Place Metro Station, two unknown youths on a black Pulsar motorcycle restrained me, physically assaulted me, and snatched my wallet and mobile phone.",
    complainant: {
      name: "Rajesh Sharma",
      fatherOrHusbandName: "O.P. Sharma",
      age: "34",
      address: "Connaught Place Outer Circle, New Delhi",
      phone: "+91 98110 54321"
    },
    incident: {
      crimeType: "Wrongful Restraint & Snatching",
      date: "2026-08-20",
      time: "20:30 hrs",
      location: "Near Metro Station Gate No. 2, Connaught Place, New Delhi",
      description: "Snatching of wallet and mobile phone by two motorcycle-borne unknown assailants."
    },
    accused: [
      { name: "Two Unknown Males", description: "Black Pulsar bike, no number plate", relationship: "Strangers" }
    ],
    witnesses: [
      { name: "Mohan Lal (Street vendor)", address: "Connaught Place Gate 2" }
    ],
    evidence: [
      "Delhi Metro CCTV recording",
      "MLC Report from RML Hospital"
    ],
    property: [
      { item: "Smartphone", value: "Rs. 28,000", description: "OnePlus Device" },
      { item: "Wallet & Cash", value: "Rs. 3,200", description: "Brown leather wallet" }
    ],
    sections: ["IPC 341", "IPC 323", "IPC 356", "BNS 126(2), 115(2), 304(1)"],
    narrative: "On 20-08-2026 at about 20:30 hrs, complainant Rajesh Sharma was attacked and robbed of his phone and wallet near Connaught Place Metro Station by two unidentified males.",
    narrative_ta: "20-08-2026 அன்று இரவு டெல்லி கன்னாட் பிளேஸ் மெட்ரோ நிலையம் அருகே ராஜேஷ் சர்மா என்பவரைத் தாக்கி செல்போன் பறிக்கப்பட்டது.",
    narrative_hi: "दिनांक 20-08-2026 को रात्रि लगभग 20:30 बजे कनॉट प्लेस मेट्रो स्टेशन गेट नंबर 2 के पास राजेश शर्मा को पीटकर उनका मोबाइल व पर्स छीना गया।",
    status: "draft",
    verified: false,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString()
  }
];

seedCases.forEach(c => inMemoryCases.set(c.firId, c));

/**
 * 1. Process Voice Complaint: Transcripts -> RAG Retrieval -> LLM Structuring
 */
async function generateFIRFromTranscripts(req, res) {
  try {
    const { nativeTranscript, englishTranscript, language, languageName, station, district } = req.body;

    if (!nativeTranscript && !englishTranscript) {
      return res.status(400).json({
        success: false,
        error: "Native or English transcript required for FIR generation"
      });
    }

    const officer = req.user || {};
    const stationInfo = {
      station: station || officer.station || "Anna Nagar Police Station (K-4)",
      district: district || officer.district || "Chennai City Police"
    };

    // Step A: RAG Retrieval from legal knowledge base
    const query = `${englishTranscript || nativeTranscript}`;
    const ragContext = await ragService.retrieveContext(query, 3);

    // Step B: Groq LLM Structuring
    const structuredFIR = await generateFIR(
      nativeTranscript || englishTranscript,
      englishTranscript || nativeTranscript,
      ragContext,
      stationInfo
    );

    // Step C: Generate Unique Case ID
    const year = new Date().getFullYear();
    const randNum = String(inMemoryCases.size + 1).padStart(4, "0");
    const firId = `FIR-${year}-${randNum}`;

    const newCase = {
      firId,
      ...structuredFIR,
      language: language || "en",
      languageName: languageName || "English",
      nativeTranscript,
      englishTranscript,
      createdBy: officer.uid || "officer_demo_001",
      policeStation: stationInfo.station,
      district: stationInfo.district,
      status: "draft",
      verified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save locally
    inMemoryCases.set(firId, newCase);

    // If Firebase is active, persist to Firestore
    if (isFirebaseConnected && db) {
      try {
        await db.collection("firCases").doc(firId).set(newCase);
      } catch (dbErr) {
        console.warn("Firestore save warning:", dbErr.message);
      }
    }

    // Log audit event
    inMemoryAuditLogs.push({
      action: "FIR_DRAFT_CREATED",
      firId,
      officer: officer.name || "Duty Officer",
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      data: newCase,
      ragContextPreview: ragContext.substring(0, 300) + "..."
    });
  } catch (error) {
    console.error("FIR Generation controller error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to generate FIR"
    });
  }
}

/**
 * 2. Get All FIR Cases
 */
async function getAllFIRs(req, res) {
  try {
    const list = Array.from(inMemoryCases.values()).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    const stats = {
      total: list.length,
      approved: list.filter(c => c.verified || c.status === "approved").length,
      drafts: list.filter(c => !c.verified && c.status !== "approved").length
    };

    res.json({
      success: true,
      data: list,
      stats
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * 3. Get FIR by ID
 */
async function getFIRById(req, res) {
  try {
    const { id } = req.params;
    let firRecord = inMemoryCases.get(id);

    if (!firRecord && isFirebaseConnected && db) {
      const doc = await db.collection("firCases").doc(id).get();
      if (doc.exists) {
        firRecord = doc.data();
      }
    }

    if (!firRecord) {
      return res.status(404).json({ success: false, error: "FIR record not found" });
    }

    res.json({ success: true, data: firRecord });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * 4. Update FIR (Police Officer Field Edit)
 */
async function updateFIR(req, res) {
  try {
    const { id } = req.params;
    let existing = inMemoryCases.get(id);

    if (!existing) {
      return res.status(404).json({ success: false, error: "FIR not found" });
    }

    const updated = {
      ...existing,
      ...req.body,
      firId: id,
      updatedAt: new Date().toISOString()
    };

    inMemoryCases.set(id, updated);

    if (isFirebaseConnected && db) {
      try {
        await db.collection("firCases").doc(id).update(updated);
      } catch (dbErr) {
        console.warn("Firestore update error:", dbErr.message);
      }
    }

    inMemoryAuditLogs.push({
      action: "FIR_UPDATED",
      firId: id,
      officer: (req.user && req.user.name) || "Officer",
      timestamp: new Date().toISOString()
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * 5. Approve FIR (Official Sign-Off)
 */
async function approveFIR(req, res) {
  try {
    const { id } = req.params;
    let existing = inMemoryCases.get(id);

    if (!existing) {
      return res.status(404).json({ success: false, error: "FIR not found" });
    }

    const officer = req.user || {
      name: "Insp. R. Subramaniam",
      rank: "Inspector of Police",
      badgeNumber: "TN-POL-8842",
      station: existing.policeStation || "Anna Nagar Police Station"
    };

    const approved = {
      ...existing,
      status: "approved",
      verified: true,
      verifiedBy: {
        name: officer.name,
        rank: officer.rank,
        badgeNumber: officer.badgeNumber,
        station: officer.station
      },
      verifiedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    inMemoryCases.set(id, approved);

    if (isFirebaseConnected && db) {
      try {
        await db.collection("firCases").doc(id).update(approved);
      } catch (dbErr) {
        console.warn("Firestore approve error:", dbErr.message);
      }
    }

    inMemoryAuditLogs.push({
      action: "FIR_APPROVED",
      firId: id,
      officer: officer.name,
      timestamp: new Date().toISOString()
    });

    res.json({ success: true, data: approved });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * 6. Export / Stream FIR PDF Document
 */
async function exportFIRPDF(req, res) {
  try {
    const { id } = req.params;
    const language = req.query.language || "en";
    let fir = inMemoryCases.get(id);

    if (!fir && isFirebaseConnected && db) {
      const doc = await db.collection("firCases").doc(id).get();
      if (doc.exists) {
        fir = doc.data();
      }
    }

    if (!fir) {
      return res.status(404).json({ success: false, error: "FIR not found" });
    }

    const officer = req.user || fir.verifiedBy || {};
    const pdfDoc = generateFIRPDF(fir, language, officer);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=FIR_${id}_${language}.pdf`);

    pdfDoc.pipe(res);
    pdfDoc.end();
  } catch (error) {
    console.error("PDF export error:", error);
    res.status(500).json({ success: false, error: "Failed to generate PDF document" });
  }
}

module.exports = {
  generateFIRFromTranscripts,
  getAllFIRs,
  getFIRById,
  updateFIR,
  approveFIR,
  exportFIRPDF
};
