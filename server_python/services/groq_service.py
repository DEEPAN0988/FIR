import os
import json
import re
from datetime import datetime
from typing import Dict, Any, Optional
from .whisper_service import get_groq_client
from .translation_service import translate_text

PRIMARY_MODEL = os.getenv("GROQ_LLM_MODEL", "openai/gpt-oss-120b")
FALLBACK_MODEL = "llama-3.3-70b-versatile"

async def generate_fir(
    native_transcript: str,
    english_transcript: str,
    context: str,
    station_info: Dict[str, Any],
    custom_api_key: Optional[str] = None
) -> Dict[str, Any]:
    client = get_groq_client(custom_api_key)

    if client:
        try:
            prompt = f"""
You are an expert First Information Report (FIR) document structuring assistant for law enforcement.
Extract factual details from the complainant's statement and organize them strictly into an official FIR JSON structure.

CRITICAL ANTI-HALLUCINATION & EXTRACTION RULES:
1. Extract the full Complainant Name (e.g. Deepan Nandakumar).
2. Extract the Contact Phone Number (e.g. 8015182880) if mentioned.
3. Extract the Residential Address (e.g. Tiruvarur near Tiruvarur bus stand).
4. Extract the exact Date of occurrence (e.g. 19 Aug 2026).
5. Extract Accused particulars (e.g. 2 strangers roaming around house).
6. Extract all listed Valuables / Property (e.g. gold, silver, platinum).
7. If any information is genuinely missing, set to "Not stated" or null.
8. Suggest standard legal statutory sections (IPC / BNS).
9. Output accurate formal narratives in English, Tamil (தமிழ்), and Hindi (हिंदी).

Police Station Context:
Station: {station_info.get("station", "Anna Nagar Police Station (K-4)")}
District: {station_info.get("district", "Chennai City Police")}

Native-Language Complaint Transcript:
\"\"\"
{native_transcript}
\"\"\"

English Translation of Complaint:
\"\"\"
{english_transcript}
\"\"\"

Retrieved Legal Guidelines & Reference Knowledge Base:
\"\"\"
{context}
\"\"\"

Respond ONLY with a valid JSON object matching:
{{
  "complainant": {{
    "name": "string (or null)",
    "fatherOrHusbandName": "string (or null)",
    "age": "string (or null)",
    "address": "string (or null)",
    "phone": "string (or null)"
  }},
  "incident": {{
    "crimeType": "string",
    "date": "string",
    "time": "string",
    "location": "string",
    "description": "string"
  }},
  "accused": [
    {{
      "name": "string",
      "description": "string",
      "relationship": "string"
    }}
  ],
  "witnesses": [
    {{
      "name": "string",
      "address": "string"
    }}
  ],
  "evidence": [
    "string"
  ],
  "property": [
    {{
      "item": "string",
      "value": "string",
      "description": "string"
    }}
  ],
  "policeStation": "{station_info.get("station", "Anna Nagar Police Station (K-4)")}",
  "district": "{station_info.get("district", "Chennai City Police")}",
  "sections": [
    "string"
  ],
  "narrative": "string (Formal English FIR narrative)",
  "narrative_ta": "string (Formal Tamil FIR narrative)",
  "narrative_hi": "string (Formal Hindi FIR narrative)",
  "verified": false,
  "status": "draft"
}}
"""
            model_to_use = PRIMARY_MODEL
            try:
                completion = client.chat.completions.create(
                    model=model_to_use,
                    messages=[
                        {"role": "system", "content": "You are an official legal and police FIR structuring engine. You strictly adhere to truth and never hallucinate."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0,
                    response_format={"type": "json_object"}
                )
            except Exception as primary_err:
                print(f"Primary model {PRIMARY_MODEL} failed, using {FALLBACK_MODEL}:", primary_err)
                model_to_use = FALLBACK_MODEL
                completion = client.chat.completions.create(
                    model=model_to_use,
                    messages=[
                        {"role": "system", "content": "You are an official legal and police FIR structuring engine. You strictly adhere to truth and never hallucinate."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0,
                    response_format={"type": "json_object"}
                )

            raw_json = completion.choices[0].message.content
            return json.loads(raw_json)
        except Exception as e:
            print("Groq LLM FIR structuring error:", e)

    return await parse_spoken_statement_dynamically(native_transcript, english_transcript, station_info, custom_api_key)

def clean_extracted_entity(s: str) -> str:
    if not s:
        return ""
    s = re.sub(r'^[,\.\s\:\-]+', '', s)
    s = re.sub(r'[,\.\s\:\-]+$', '', s)
    return s.strip()

async def parse_spoken_statement_dynamically(
    native_transcript: str,
    english_transcript: str,
    station_info: Dict[str, Any],
    custom_api_key: Optional[str] = None
) -> Dict[str, Any]:
    text = (english_transcript or native_transcript or "").strip()
    lower = text.lower()
    today = datetime.now().strftime("%Y-%m-%d")

    # 1. Full Complainant Name
    complainant_name = "Not stated"
    name_match = re.search(r'(?:my name is|i am|this is|i\'m|name:\s*)\s+([A-Za-z]+(?:\s+[A-Za-z]+){0,3})', text, re.IGNORECASE)
    if name_match:
        cand = name_match.group(1).strip()
        cand = re.split(r'[\.,\n]|\b(?:when|and|living|residing|who|live|resident)\b|\bi\s', cand, flags=re.IGNORECASE)[0].strip()
        if len(cand) > 1:
            complainant_name = cand.title()

    # 2. Contact Phone Number
    phone_number = "Not stated"
    phone_match = re.search(r'(?:phone(?:\s*number)?|mobile(?:\s*number)?|contact(?:\s*number)?|cell(?:\s*no)?|tel)?(?:\s*(?:is|:|\-)?\s*)?(\+?91[\-\s]?)?([6-9]\d{9})\b', text, re.IGNORECASE)
    if phone_match:
        country_code = phone_match.group(1) or ""
        main_digits = phone_match.group(2)
        phone_number = f"{country_code.strip()} {main_digits}".strip()

    # 3. Residential Address
    residential_address = "Not stated"
    addr_match = re.search(r'(?:i live in|living in|living at|residing at|residence in|resident of|address is|house in|home in)\s+([^.,;\n]+)', text, re.IGNORECASE)
    if addr_match:
        raw_addr = addr_match.group(1).strip()
        clean_addr = re.split(r'\b(?:my phone|phone|mobile|on \d|on august|on jan|when|i saw|i noticed|my house)\b', raw_addr, flags=re.IGNORECASE)[0]
        clean_addr = clean_extracted_entity(clean_addr)
        if len(clean_addr) > 2:
            residential_address = clean_addr.title()

    # 4. Occurrence Date
    incident_date = today
    date_match = re.search(r'(?:on|dated|date)?\s*(\d{1,2}\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{4})', text, re.IGNORECASE)
    if not date_match:
        date_match = re.search(r'(\d{1,2}[/-]\d{1,2}[/-]\d{4})', text)
    if date_match:
        incident_date = date_match.group(1).strip()
    elif "yesterday" in lower or "நேற்று" in text or "कल" in text:
        incident_date = "Yesterday (Prior Date)"

    # 5. Incident Location
    incident_location = residential_address if residential_address != "Not stated" else "Jurisdictional Area"
    loc_match = re.search(r'(?:near|at|in|around|opposite|outside)\s+([^.,;\n]+)', text, re.IGNORECASE)
    if loc_match:
        raw_loc = loc_match.group(1).strip()
        clean_loc = re.split(r'\b(?:i noticed|i saw|two|2|they|someone|unknown|my phone|phone|was|were|where)\b', raw_loc, flags=re.IGNORECASE)[0]
        clean_loc = clean_extracted_entity(clean_loc)
        if len(clean_loc) > 2:
            incident_location = clean_loc.title() if not clean_loc.lower().startswith("near ") else f"Near {clean_loc[5:].title()}"

    # 6. Property / Valuables
    stolen_items = []
    valuable_matches = re.findall(r'(\d+\s+(?:ton|grams?|sovereigns?|soverign|tola|kg|rupees?|rs\.?)?\s*(?:of\s+)?(?:gold|silver|platinum|cash|jewellery|diamond|purse|wallet|mobile|laptop))', text, re.IGNORECASE)
    for v in valuable_matches:
        stolen_items.append({
            "item": clean_extracted_entity(v).title(),
            "value": "Under valuation",
            "description": "Valuables stated in victim residence/custody"
        })

    if not stolen_items:
        for common_item in ["purse", "wallet", "gold", "silver", "platinum", "mobile", "phone", "chain", "laptop", "cash"]:
            if common_item in lower:
                stolen_items.append({
                    "item": common_item.capitalize(),
                    "value": "Not stated",
                    "description": f"Valuable ({common_item}) claimed by complainant"
                })

    # 7. Accused Extraction
    accused_list = []
    accused_match = re.search(r'(\d+|two|three|four|unknown|two strange|strange)\s+(?:strangers|people|persons|men|boys|individuals|suspects|culprits|intruders)', text, re.IGNORECASE)
    if accused_match:
        desc = f"{accused_match.group(0).title()} seen roaming / trespassing"
        accused_list.append({
            "name": f"{accused_match.group(0).title()} (Unidentified)",
            "description": desc,
            "relationship": "Stranger / Suspicious Persons"
        })
    else:
        accused_list.append({
            "name": "Unknown person(s)",
            "description": "Unidentified individual(s)",
            "relationship": "Stranger / Under Investigation"
        })

    # 8. Crime Classification & Statutory Penal Sections
    crime_type = "Cognizable Offence"
    sections = ["IPC 154 (Information in cognizable cases)"]

    if any(k in lower for k in ["roaming", "roam", "unsafe", "stranger", "valuables", "trespass", "entering", "intrude"]):
        crime_type = "Criminal Trespass & Attempted Housebreaking"
        sections = [
            "IPC 448 (Punishment for house-trespass)",
            "IPC 511 (Punishment for attempting to commit offences)",
            "BNS 329, 331 (House-trespass & Lurking House-trespass)"
        ]
    elif any(k in lower for k in ["purse", "snatch", "wallet", "chain", "following me", "took my"]):
        crime_type = "Snatching & Theft"
        sections = ["IPC 356 (Assault in attempt to commit theft)", "IPC 379 (Punishment for theft)", "BNS 304(1), 303(2)"]
    elif any(k in lower for k in ["break", "broke", "latch", "balcony", "lock", "house", "dwelling"]):
        crime_type = "Housebreaking by Night & Theft"
        sections = ["IPC 457 (Lurking house-trespass by night)", "IPC 380 (Theft in dwelling house)", "BNS 331(4), 305"]
    elif any(k in lower for k in ["assault", "beat", "hit", "attack", "fight"]):
        crime_type = "Physical Assault & Voluntarily Causing Hurt"
        sections = ["IPC 323 (Voluntarily causing hurt)", "IPC 341 (Wrongful restraint)", "BNS 115(2), 126(2)"]
    elif any(k in lower for k in ["cyber", "fraud", "kyc", "bank", "otp", "debit", "upi"]):
        crime_type = "Cyber Financial Fraud & Impersonation"
        sections = ["IT Act Section 66D", "IPC 420 (Cheating)", "BNS 318(4)"]

    # 9. Direct Translation of the Actual Spoken Narrative (No Template Override)
    english_narrative = f"The complainant {complainant_name} (Phone: {phone_number}), residing at {residential_address}, states that: \"{text}\". The duty officer has recorded the statement for preliminary registration and statutory enquiry under Cr.P.C. / BNSS."
    
    tamil_body = await translate_text(text, "ta", custom_api_key)
    hindi_body = await translate_text(text, "hi", custom_api_key)

    addr_ta = await translate_text(residential_address, "ta", custom_api_key) if residential_address != "Not stated" else "குறிப்பிடப்படவில்லை"
    addr_hi = await translate_text(residential_address, "hi", custom_api_key) if residential_address != "Not stated" else "उल्लेखित नहीं"

    tamil_narrative = f"மனுதாரர் {complainant_name} (தொலைபேசி எண்: {phone_number}), முகவரி: {addr_ta} அவர்கள் அளித்த வாக்குமூலம்:\n\"{tamil_body}\"\n\nமேற்படி தகவலின் பேரில் முதல் தகவல் அறிக்கை பதிவு செய்யப்பட்டு சட்டப்பிரிவுகளின் கீழ் புலன் விசாரணை மேற்கொள்ளப்படுகிறது."
    hindi_narrative = f"शिकायतकर्ता {complainant_name} (दूरभाष: {phone_number}), पता: {addr_hi} द्वारा प्रस्तुत मौखिक/लिखित बयान:\n\"{hindi_body}\"\n\nउक्त सूचना के आधार पर प्राथमिकी दर्ज कर संबंधित विधिक धाराओं के अंतर्गत अग्रिम विवेचना की जा रही है।"

    return {
        "complainant": {
            "name": complainant_name,
            "fatherOrHusbandName": None,
            "age": "Not stated",
            "address": residential_address,
            "phone": phone_number
        },
        "incident": {
            "crimeType": crime_type,
            "date": incident_date,
            "time": "Not stated / As observed",
            "location": incident_location,
            "description": text
        },
        "accused": accused_list,
        "witnesses": [],
        "evidence": [
            "Complainant voice statement recording",
            "CCTV enquiry & Beat officer area patrol verification"
        ],
        "property": stolen_items,
        "policeStation": station_info.get("station", "Anna Nagar Police Station (K-4)"),
        "district": station_info.get("district", "Chennai City Police"),
        "sections": sections,
        "narrative": english_narrative,
        "narrative_ta": tamil_narrative,
        "narrative_hi": hindi_narrative,
        "verified": False,
        "status": "draft"
    }
