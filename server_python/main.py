import os
import io
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, UploadFile, File, Form, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse, FileResponse
from fastapi.staticfiles import StaticFiles

from services.rag_service import rag_service
from services.whisper_service import transcribe_audio, translate_audio
from services.translation_service import translate_text
from services.groq_service import generate_fir
from services.pdf_service import generate_fir_pdf
from models.fir_models import FIRCase, GenerateFIRRequest

@asynccontextmanager
async def lifespan(app: FastAPI):
    rag_service.initialize()
    print("====================================================")
    print("VoiceFIR Python FastAPI Service running on port 5000")
    print("Health Check: http://localhost:5000/api/health")
    print("====================================================")
    yield

app = FastAPI(
    title="VoiceFIR FastAPI Backend",
    description="Multilingual Voice-to-FIR Generation & Legal Extraction Pipeline",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Preset Police Officers
OFFICERS = [
    {
        "uid": "officer_demo_001",
        "name": "Insp. R. Subramaniam",
        "badgeNumber": "TN-POL-8842",
        "rank": "Inspector of Police",
        "station": "Anna Nagar Police Station (K-4)",
        "district": "Chennai City Police",
        "email": "officer@precinct.gov"
    },
    {
        "uid": "officer_demo_002",
        "name": "SI Rajesh Sharma",
        "badgeNumber": "DL-POL-4109",
        "rank": "Sub-Inspector",
        "station": "Connaught Place Police Station",
        "district": "New Delhi Police",
        "email": "sharma@delhipolice.gov.in"
    },
    {
        "uid": "officer_demo_003",
        "name": "Insp. Suresh Rao",
        "badgeNumber": "KA-POL-1082",
        "rank": "Inspector of Police",
        "station": "Indiranagar Police Station",
        "district": "Bengaluru City Police",
        "email": "suresh@ksp.gov.in"
    }
]

# In-memory database store with benchmark mock cases
FIR_STORE: Dict[str, Dict[str, Any]] = {
    "FIR-2026-0001": {
        "firId": "FIR-2026-0001",
        "createdBy": "officer_demo_001",
        "policeStation": "Anna Nagar Police Station (K-4)",
        "district": "Chennai City Police",
        "language": "ta",
        "languageName": "Tamil",
        "nativeTranscript": "நேற்று இரவு சுமார் 10:30 மணியளவில் எனது வீட்டின் பூட்டை உடைத்து 8 சவரன் தங்க நகை திருடப்பட்டது.",
        "englishTranscript": "Yesterday night around 10:30 PM, unknown intruders broke into the residence and stole 8 sovereigns of gold jewellery.",
        "complainant": {
            "name": "K. Subramaniam",
            "fatherOrHusbandName": "Krishnan",
            "age": "48",
            "address": "No. 14, 2nd Main Road, Anna Nagar, Chennai",
            "phone": "+91 98410 12345"
        },
        "incident": {
            "crimeType": "Housebreaking by Night and Theft",
            "date": "2026-08-20",
            "time": "22:30 hrs",
            "location": "No. 14, 2nd Main Road, Anna Nagar, Chennai",
            "description": "Intruders broke rear balcony latch and stolen 8 sovereigns gold ornaments from almirah."
        },
        "accused": [{"name": "Unknown person(s)", "description": "Unidentified", "relationship": "Stranger"}],
        "witnesses": [{"name": "V. Ramani", "address": "No. 16, 2nd Main Road, Anna Nagar"}],
        "evidence": ["Broken balcony lock lever", "Fingerprint lifts"],
        "property": [{"item": "Gold Ornaments (8 Sovereigns)", "value": "Rs. 4,80,000", "description": "Necklace & bangles"}],
        "sections": ["IPC 457 (Lurking house-trespass by night)", "IPC 380 (Theft in dwelling house)", "BNS 331(4), 305"],
        "narrative": "The complainant states that on 20-08-2026 around 22:30 hrs, unknown culprits committed housebreaking by night and stole 8 sovereigns of gold jewellery.",
        "narrative_ta": "20-08-2026 இரவு 22:30 மணியளவில் அண்ணாநகர் இல்லத்தில் 8 சவரன் தங்க நகைகள் திருடப்பட்டதாக புகார் அளிக்கப்பட்டது.",
        "narrative_hi": "शिकायतकर्ता के अनुसार 20-08-2026 को रात में घर में घुसकर 8 तोले सोने के गहने चोरी कर लिए गए।",
        "status": "approved",
        "verified": True,
        "verifiedBy": {
            "name": "Insp. R. Subramaniam",
            "rank": "Inspector of Police",
            "badgeNumber": "TN-POL-8842"
        },
        "verifiedAt": "2026-08-21T02:30:00Z",
        "createdAt": "2026-08-20T23:00:00Z"
    },
    "FIR-2026-0002": {
        "firId": "FIR-2026-0002",
        "createdBy": "officer_demo_002",
        "policeStation": "Connaught Place Police Station",
        "district": "New Delhi Police",
        "language": "hi",
        "languageName": "Hindi",
        "nativeTranscript": "कल रात लगभग 8:30 बजे दो लड़कों ने मेरा पर्स और मोबाइल छीन लिया।",
        "englishTranscript": "Yesterday night around 8:30 PM, two unidentified boys snatched my purse and mobile phone.",
        "complainant": {
            "name": "Rajesh Sharma",
            "fatherOrHusbandName": "Mohan Sharma",
            "age": "34",
            "address": "B-42, Janpath Road, New Delhi",
            "phone": "+91 98110 54321"
        },
        "incident": {
            "crimeType": "Wrongful Restraint, Assault & Snatching",
            "date": "2026-08-20",
            "time": "20:30 hrs",
            "location": "Near Gate No. 2, Connaught Place Metro Station",
            "description": "Two individuals on black pulsar motorcycle assaulted complainant and snatched Samsung phone and wallet."
        },
        "accused": [{"name": "Two Unknown Youths", "description": "Riding Black Pulsar Bike", "relationship": "Stranger"}],
        "witnesses": [],
        "evidence": ["Metro CCTV footage request sent"],
        "property": [{"item": "Samsung Galaxy S23 & Wallet", "value": "Rs. 75,000", "description": "Black colour mobile"}],
        "sections": ["IPC 356 (Assault in attempting theft)", "IPC 379 (Theft)", "BNS 304(1)"],
        "narrative": "The complainant states that on 20-08-2026 at 20:30 hrs near Metro Gate No. 2, two unidentified individuals snatched his mobile and wallet.",
        "status": "approved",
        "verified": True,
        "verifiedBy": {
            "name": "SI Rajesh Sharma",
            "rank": "Sub-Inspector",
            "badgeNumber": "DL-POL-4109"
        },
        "verifiedAt": "2026-08-21T03:00:00Z",
        "createdAt": "2026-08-20T21:15:00Z"
    },
    "FIR-2026-0003": {
        "firId": "FIR-2026-0003",
        "createdBy": "officer_demo_003",
        "policeStation": "Indiranagar Police Station",
        "district": "Bengaluru City Police",
        "language": "en",
        "languageName": "English",
        "nativeTranscript": "Received phishing call and debited Rs 85,000 via fake bank KYC update link.",
        "englishTranscript": "Received phishing call and debited Rs 85,000 via fake bank KYC update link.",
        "complainant": {
            "name": "Pooja Hegde",
            "fatherOrHusbandName": "Anand Hegde",
            "age": "29",
            "address": "402, Palm Meadows, 100ft Road, Indiranagar, Bengaluru",
            "phone": "+91 97420 88888"
        },
        "incident": {
            "crimeType": "Cyber Financial Fraud & Impersonation",
            "date": "2026-08-21",
            "time": "14:15 hrs",
            "location": "Online / Indiranagar residence",
            "description": "Complainant received SMS link for KYC and Rs 85,000 was transferred in two unauthorized UPI transactions."
        },
        "accused": [{"name": "Unknown caller (+91 70012 34567)", "description": "Impersonator", "relationship": "Cyber fraudster"}],
        "witnesses": [],
        "evidence": ["Bank SMS alerts", "UPI transaction reference IDs"],
        "property": [{"item": "Cash defrauded via UPI", "value": "Rs. 85,000", "description": "Two transactions"}],
        "sections": ["IT Act Section 66D (Cheating by impersonation using computer)", "IPC 420 (Cheating)", "BNS 318(4)"],
        "narrative": "The complainant states that on 21-08-2026 she was deceived by an unknown caller posing as a bank representative resulting in fraudulent withdrawal of Rs 85,000.",
        "status": "draft",
        "verified": False,
        "createdAt": "2026-08-21T05:00:00Z"
    }
}

# --- 1. HEALTH CHECK ---
@app.get("/api/health")
async def health_check():
    return {
        "status": "online",
        "system": "VoiceFIR Python FastAPI Pipeline",
        "groqLive": bool(os.getenv("GROQ_API_KEY")),
        "ragIndexed": rag_service.initialized,
        "totalRecords": len(FIR_STORE),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

# --- 2. AUTH ROUTES ---
@app.get("/api/auth/officers")
async def get_officers():
    return {"success": True, "data": OFFICERS}

@app.get("/api/auth/profile")
async def get_profile():
    return {"success": True, "data": OFFICERS[0]}

@app.post("/api/auth/login")
async def login(request: Request):
    body = await request.json() if request.headers.get("content-type") == "application/json" else {}
    email = body.get("email", "")
    for off in OFFICERS:
        if off["email"].lower() == email.lower():
            return {"success": True, "data": off, "token": f"token_{off['uid']}"}
    return {"success": True, "data": OFFICERS[0], "token": "token_demo"}

# --- 3. TRANSCRIPTION & SPEECH ---
@app.post("/api/transcription/transcribe")
async def transcribe_endpoint(
    request: Request,
    audio: Optional[UploadFile] = File(None),
    language: Optional[str] = Form(None),
    sampleType: Optional[str] = Form(None),
    clientTranscript: Optional[str] = Form(None),
    groqApiKey: Optional[str] = Form(None),
    x_groq_api_key: Optional[str] = Header(None)
):
    temp_path = None
    custom_key = x_groq_api_key or groqApiKey

    # Check if JSON payload was sent instead of FormData
    if request.headers.get("content-type", "").startswith("application/json"):
        try:
            body = await request.json()
            language = body.get("language") or language
            sampleType = body.get("sampleType") or sampleType
            clientTranscript = body.get("clientTranscript") or clientTranscript
            custom_key = custom_key or body.get("groqApiKey")
        except Exception:
            pass

    if audio:
        os.makedirs("temp_uploads", exist_ok=True)
        temp_path = os.path.join("temp_uploads", f"upload_{uuid.uuid4()}_{audio.filename}")
        with open(temp_path, "wb") as buffer:
            content = await audio.read()
            buffer.write(content)

    transcription = await transcribe_audio(
        file_path=temp_path,
        forced_language=language or sampleType,
        custom_api_key=custom_key,
        client_transcript=clientTranscript
    )

    english_text = ""
    if transcription["language"] == "en":
        english_text = transcription["text"]
    else:
        english_text = await translate_text(transcription["text"], "en", custom_key)

    if temp_path and os.path.exists(temp_path):
        try:
            os.remove(temp_path)
        except Exception:
            pass

    return {
        "success": True,
        "language": transcription["language"],
        "languageName": transcription["languageName"],
        "nativeTranscript": transcription["text"],
        "englishTranscript": english_text,
        "duration": transcription["duration"]
    }

@app.post("/api/transcription/translate")
async def translate_endpoint(request: Request):
    body = await request.json()
    text = body.get("text", "")
    target_lang = body.get("targetLang", "en")
    custom_key = body.get("groqApiKey") or request.headers.get("x-groq-api-key")

    translated = await translate_text(text, target_lang, custom_key)
    return {
        "success": True,
        "translatedText": translated,
        "targetLang": target_lang
    }

# --- 4. FIR GENERATION & CRUD ---
@app.post("/api/fir/generate")
async def generate_fir_endpoint(req: GenerateFIRRequest):
    # 1. RAG context retrieval
    context = rag_service.retrieve_context(req.englishTranscript or req.nativeTranscript)

    # 2. LLM structuring
    station_info = {
        "station": req.station or "Anna Nagar Police Station (K-4)",
        "district": req.district or "Chennai City Police"
    }

    fir_data = await generate_fir(
        native_transcript=req.nativeTranscript,
        english_transcript=req.englishTranscript,
        context=context,
        station_info=station_info,
        custom_api_key=req.groqApiKey
    )

    # 3. Create case record
    seq_num = len(FIR_STORE) + 1
    fir_id = f"FIR-2026-{seq_num:04d}"
    now_iso = datetime.now(timezone.utc).isoformat()

    record = {
        "firId": fir_id,
        "createdBy": "officer_demo_001",
        "policeStation": station_info["station"],
        "district": station_info["district"],
        "language": req.language or "en",
        "languageName": req.languageName or "English",
        "nativeTranscript": req.nativeTranscript,
        "englishTranscript": req.englishTranscript,
        "complainant": fir_data.get("complainant", {}),
        "incident": fir_data.get("incident", {}),
        "accused": fir_data.get("accused", []),
        "witnesses": fir_data.get("witnesses", []),
        "evidence": fir_data.get("evidence", []),
        "property": fir_data.get("property", []),
        "sections": fir_data.get("sections", []),
        "narrative": fir_data.get("narrative", ""),
        "narrative_ta": fir_data.get("narrative_ta", ""),
        "narrative_hi": fir_data.get("narrative_hi", ""),
        "status": "draft",
        "verified": False,
        "createdAt": now_iso,
        "updatedAt": now_iso
    }

    FIR_STORE[fir_id] = record
    return {"success": True, "data": record}

@app.get("/api/fir")
async def list_firs():
    items = list(FIR_STORE.values())
    items.sort(key=lambda x: x.get("createdAt", ""), reverse=True)
    
    total = len(items)
    approved = len([x for x in items if x.get("verified") or x.get("status") == "approved"])
    drafts = total - approved

    return {
        "success": True,
        "data": items,
        "stats": {
            "total": total,
            "approved": approved,
            "drafts": drafts
        }
    }

@app.get("/api/fir/{fir_id}")
async def get_fir(fir_id: str):
    if fir_id not in FIR_STORE:
        raise HTTPException(status_code=404, detail="FIR case record not found")
    return {"success": True, "data": FIR_STORE[fir_id]}

@app.put("/api/fir/{fir_id}")
async def update_fir(fir_id: str, request: Request):
    if fir_id not in FIR_STORE:
        raise HTTPException(status_code=404, detail="FIR case record not found")
    
    body = await request.json()
    FIR_STORE[fir_id].update(body)
    FIR_STORE[fir_id]["updatedAt"] = datetime.now(timezone.utc).isoformat()

    return {"success": True, "data": FIR_STORE[fir_id]}

@app.post("/api/fir/{fir_id}/approve")
async def approve_fir(fir_id: str):
    if fir_id not in FIR_STORE:
        raise HTTPException(status_code=404, detail="FIR case record not found")

    FIR_STORE[fir_id]["status"] = "approved"
    FIR_STORE[fir_id]["verified"] = True
    FIR_STORE[fir_id]["verifiedAt"] = datetime.now(timezone.utc).isoformat()
    FIR_STORE[fir_id]["verifiedBy"] = {
        "name": OFFICERS[0]["name"],
        "rank": OFFICERS[0]["rank"],
        "badgeNumber": OFFICERS[0]["badgeNumber"]
    }

    return {"success": True, "data": FIR_STORE[fir_id]}

@app.get("/api/fir/{fir_id}/pdf")
async def download_fir_pdf(fir_id: str, language: str = "en"):
    if fir_id not in FIR_STORE:
        raise HTTPException(status_code=404, detail="FIR case record not found")

    fir_record = FIR_STORE[fir_id]
    pdf_buffer = generate_fir_pdf(fir_record, language=language, officer=OFFICERS[0])

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={fir_id}_{language}.pdf"
        }
    )

# Serve compiled React frontend SPA if dist folder exists
DIST_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "client", "dist"))
if os.path.exists(DIST_PATH):
    app.mount("/assets", StaticFiles(directory=os.path.join(DIST_PATH, "assets")), name="static_assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api"):
            raise HTTPException(status_code=404, detail="API route not found")
        file_path = os.path.join(DIST_PATH, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(DIST_PATH, "index.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
