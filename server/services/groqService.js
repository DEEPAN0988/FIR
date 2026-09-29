const Groq = require("groq-sdk");

function getGroqClient(customKey) {
  const apiKey = customKey || process.env.GROQ_API_KEY;
  if (apiKey) {
    try {
      return new Groq({ apiKey });
    } catch (err) {
      console.warn("Groq LLM init warning:", err.message);
    }
  }
  return null;
}

const PRIMARY_MODEL = process.env.GROQ_LLM_MODEL || "openai/gpt-oss-120b";
const FALLBACK_MODEL = "llama-3.3-70b-versatile";

async function generateFIR(nativeTranscript, englishTranscript, context, stationInfo = {}, customApiKey = null) {
  const client = getGroqClient(customApiKey);

  if (client) {
    try {
      const prompt = `
You are an expert First Information Report (FIR) document structuring assistant for law enforcement.
Extract factual details from the complainant's statement and organize them strictly into an official FIR JSON structure.

CRITICAL ANTI-HALLUCINATION & LEGAL COMPLIANCE RULES:
1. NEVER invent or fabricate facts, names, dates, addresses, contact details, weapons, property valuations, or evidence.
2. If any piece of information was NOT explicitly stated in the transcript, you MUST set its value to null or "Not stated".
3. Extract ONLY the exact person name for complainant without capturing trailing sentences or punctuation.
4. Extract accused particulars accurately (e.g., number of suspects, vehicles, descriptions).
5. Extract stolen items accurately (e.g., purse, wallet, phone, gold).
6. Suggest standard legal statutory sections (IPC / BNS) that correspond to the reported crime type.
7. Generate a clear, formal police narrative based solely on the facts provided.

Police Station Context:
Station: ${stationInfo.station || "Jurisdictional Police Station"}
District: ${stationInfo.district || "Metropolitan Police"}

Native-Language Complaint Transcript:
"""
${nativeTranscript}
"""

English Translation of Complaint:
"""
${englishTranscript}
"""

Retrieved Legal Guidelines & Reference Knowledge Base:
"""
${context}
"""

Respond ONLY with a valid JSON object matching:
{
  "complainant": {
    "name": "string (or null)",
    "fatherOrHusbandName": "string (or null)",
    "age": "string (or null)",
    "address": "string (or null)",
    "phone": "string (or null)"
  },
  "incident": {
    "crimeType": "string",
    "date": "string",
    "time": "string",
    "location": "string",
    "description": "string"
  },
  "accused": [
    {
      "name": "string",
      "description": "string",
      "relationship": "string"
    }
  ],
  "witnesses": [
    {
      "name": "string",
      "address": "string"
    }
  ],
  "evidence": [
    "string"
  ],
  "property": [
    {
      "item": "string",
      "value": "string",
      "description": "string"
    }
  ],
  "policeStation": "${stationInfo.station || "Anna Nagar Police Station"}",
  "district": "${stationInfo.district || "Chennai City Police"}",
  "sections": [
    "string"
  ],
  "narrative": "string (Formal English FIR narrative)",
  "narrative_ta": "string (Formal Tamil FIR narrative)",
  "narrative_hi": "string (Formal Hindi FIR narrative)",
  "verified": false,
  "status": "draft"
}
`;

      let modelToUse = PRIMARY_MODEL;
      let completion;

      try {
        completion = await client.chat.completions.create({
          model: modelToUse,
          messages: [
            { role: "system", content: "You are an official police FIR structuring engine. You never hallucinate." },
            { role: "user", content: prompt }
          ],
          temperature: 0,
          response_format: { type: "json_object" }
        });
      } catch (primaryErr) {
        console.warn(`Primary model ${PRIMARY_MODEL} failed, trying ${FALLBACK_MODEL}:`, primaryErr.message);
        modelToUse = FALLBACK_MODEL;
        completion = await client.chat.completions.create({
          model: modelToUse,
          messages: [
            { role: "system", content: "You are an official police FIR structuring engine. You never hallucinate." },
            { role: "user", content: prompt }
          ],
          temperature: 0,
          response_format: { type: "json_object" }
        });
      }

      const content = completion.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      console.error("Groq LLM FIR structuring error:", error.message);
    }
  }

  return parseSpokenStatementDynamically(nativeTranscript, englishTranscript, stationInfo);
}

function cleanEntity(s) {
  if (!s) return "";
  return s.replace(/^[,\.\s\:\-]+/, "").replace(/[,\.\s\:\-]+$/, "").trim();
}

function parseSpokenStatementDynamically(nativeTranscript, englishTranscript, stationInfo) {
  const text = (englishTranscript || nativeTranscript || "").trim();
  const lower = text.toLowerCase();
  const today = new Date().toISOString().split("T")[0];

  // 1. Precise Name Extraction
  let complainantName = "Not stated";
  const namePatterns = [
    /(?:my name is|i am|this is|i'm)\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?)/i,
    /(?:பெயர்|नाम है)\s+([A-Za-z\u0B80-\u0BFF\u0900-\u097F]+(?:\s+[A-Za-z\u0B80-\u0BFF\u0900-\u097F]+)?)/i
  ];
  for (const pat of namePatterns) {
    const m = text.match(pat);
    if (m) {
      let candidate = m[1].trim();
      candidate = candidate.split(/[\.,\n]|when|and|living|who|i\s/i)[0].trim();
      if (candidate && candidate.length > 1) {
        complainantName = candidate.charAt(0).toUpperCase() + candidate.slice(1);
        break;
      }
    }
  }

  // 2. Incident Location
  let incidentLocation = "Jurisdictional Area";
  const locMatch = text.match(/(?:near|at|in|around|opposite|outside)\s+([^.,;\n]+)/i);
  if (locMatch) {
    const rawLoc = locMatch[1].trim();
    let cleanLoc = rawLoc.split(/\b(?:i\s+noticed|i\s+saw|two|2|they|someone|unknown|was|were|and|where)\b/i)[0];
    cleanLoc = cleanEntity(cleanLoc);
    if (cleanLoc && cleanLoc.length > 2) {
      incidentLocation = cleanLoc.charAt(0).toUpperCase() + cleanLoc.slice(1);
    }
  }

  // 3. Address
  let residentialAddress = "Not stated";
  const addrMatch = text.match(/(?:residing at|living at|house no|resident of|residence at)\s+([^.,;\n]+)/i);
  if (addrMatch) {
    residentialAddress = cleanEntity(addrMatch[1]);
  }

  // 4. Stolen Property
  const stolenItems = [];
  const propMatches = text.matchAll(/(?:took|stole|snatched|robbed|debited|lost|stolen|took away)\s+(?:my\s+|the\s+)?([a-zA-Z0-9\s,\-]+?)(?:\s+and\s+went|\s+and\s+fled|\.|\,|$)/gi);
  for (const p of propMatches) {
    const cleaned = cleanEntity(p[1]);
    if (cleaned && !["away", "off", "action", "police"].some(k => cleaned.toLowerCase().includes(k))) {
      stolenItems.push({
        item: cleaned.charAt(0).toUpperCase() + cleaned.slice(1),
        value: "Not stated",
        description: `Victim personal ${cleaned} reported taken`
      });
    }
  }

  if (stolenItems.length === 0) {
    for (const commonItem of ["purse", "wallet", "mobile", "phone", "chain", "gold", "laptop", "bag", "cash", "motorcycle", "bike"]) {
      if (lower.includes(commonItem)) {
        stolenItems.push({
          item: commonItem.charAt(0).toUpperCase() + commonItem.slice(1),
          value: "Not stated",
          description: `Victim ${commonItem} involved in offence`
        });
        break;
      }
    }
  }

  // 5. Accused
  const accusedList = [];
  const accusedMatch = text.match(/(\d+|two|three|four|unknown|two strange|strange)\s+(?:people|persons|men|boys|individuals|suspects|culprits|intruders)/i);
  if (accusedMatch) {
    accusedList.push({
      name: `${accusedMatch[0]} (Unidentified)`,
      description: `${accusedMatch[0]} involved in occurrence`,
      relationship: "Stranger / Under Investigation"
    });
  } else {
    accusedList.push({
      name: "Unknown person(s)",
      description: "Unidentified individual(s)",
      relationship: "Stranger / Under Investigation"
    });
  }

  // 6. Crime Type
  let crimeType = "Cognizable Offence";
  let sections = ["IPC 154 (Information in cognizable cases)"];

  if (["purse", "snatch", "wallet", "chain", "following me", "took my", "छीना", "பறிப்பு"].some(k => lower.includes(k))) {
    crimeType = "Snatching & Theft";
    sections = ["IPC 356 (Assault or criminal force in attempt to commit theft)", "IPC 379 (Punishment for theft)", "BNS 304(1), 303(2)"];
  } else if (["break", "broke", "latch", "balcony", "lock", "house", "dwelling"].some(k => lower.includes(k))) {
    crimeType = "Housebreaking by Night & Theft";
    sections = ["IPC 457 (Lurking house-trespass by night)", "IPC 380 (Theft in dwelling house)", "BNS 331(4), 305"];
  } else if (["assault", "beat", "hit", "attack", "fight"].some(k => lower.includes(k))) {
    crimeType = "Physical Assault & Voluntarily Causing Hurt";
    sections = ["IPC 323 (Voluntarily causing hurt)", "IPC 341 (Wrongful restraint)", "BNS 115(2), 126(2)"];
  } else if (["cyber", "fraud", "kyc", "bank", "otp", "debit", "upi"].some(k => lower.includes(k))) {
    crimeType = "Cyber Financial Fraud & Impersonation";
    sections = ["IT Act Section 66D (Cheating by impersonation using computer)", "IPC 420 (Cheating)", "BNS 318(4)"];
  }

  // 7. Time Window
  let timeWindow = "Not stated";
  if (["night", "pm", "இரவு", "रात"].some(k => lower.includes(k))) {
    timeWindow = "Night hours (Approx. 21:00 - 23:00 hrs)";
  } else if (["morning", "am", "காலை", "सुबह"].some(k => lower.includes(k))) {
    timeWindow = "Morning hours (Approx. 08:00 - 11:00 hrs)";
  } else if (["afternoon", "noon", "பிற்பகல்", "दोपहर"].some(k => lower.includes(k))) {
    timeWindow = "Afternoon hours (Approx. 13:00 - 16:00 hrs)";
  }

  return {
    complainant: {
      name: complainantName,
      fatherOrHusbandName: null,
      age: "Not stated",
      address: residentialAddress,
      phone: "Not stated"
    },
    incident: {
      crimeType,
      date: today,
      time: timeWindow,
      location: incidentLocation,
      description: text
    },
    accused: accusedList,
    witnesses: [],
    evidence: [
      "Complainant voice statement audio recording",
      "Area inspection & CCTV enquiry under process"
    ],
    property: stolenItems,
    policeStation: stationInfo.station || "Anna Nagar Police Station (K-4)",
    district: stationInfo.district || "Chennai City Police",
    sections,
    narrative: `The complainant ${complainantName} states that: "${text}". The duty officer has taken down the statement for preliminary registration and statutory enquiry under Cr.P.C. / BNSS.`,
    narrative_ta: `புகார்தாரர் ${complainantName} அளித்த வாக்குமூலம்: "${nativeTranscript || text}". உரிய சட்டப் பிரிவுகளின் கீழ் விசாரணை மேற்கொள்ளப்படுகிறது.`,
    narrative_hi: `शिकायतकर्ता ${complainantName} द्वारा दर्ज बयान: "${nativeTranscript || text}"। मामले में नियमानुसार अग्रिम कार्रवाई की जा रही है।`,
    verified: false,
    status: "draft"
  };
}

module.exports = {
  generateFIR
};
