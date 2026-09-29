# 🚔 VoiceFIR — AI-Powered Multilingual Police First Information Report (FIR) Pipeline

VoiceFIR is a state-of-the-art Generative AI application engineered for police departments and investigating officers. It converts spoken victim or complainant statements in **Tamil (தமிழ்)**, **Hindi (हिंदी)**, or **English** into structured, legally aligned First Information Report (FIR) drafts using **Groq Whisper Large V3**, **RAG (Retrieval-Augmented Generation)** knowledge bases, **Groq LLM (`openai/gpt-oss-120b` / `llama-3.3-70b-versatile`)**, interactive police verification/approval workflows, and multi-language PDF generation.

---

## 🏛️ System Architecture

```text
Police Officer / Informant Spoken Voice
                  │
                  ▼
         [ WebRTC Recorder / Audio Upload ]
                  │
                  ▼
         [ Groq Whisper Large V3 ]
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
 Native Transcript   English Translation
 (Tamil/Hindi/Eng)          │
        │                   ▼
        │        [ RAG Knowledge Base ]
        │        - Official FIR Format
        │        - Police Guidelines & Sections
        │                   │
        └─────────┬─────────┘
                  ▼
        [ Groq GPT-OSS-120B ]
      (Strict Anti-Hallucination)
                  │
                  ▼
        [ Structured FIR JSON ]
                  │
                  ▼
        [ Police Review & Edit ]
                  │
                  ▼
        [ Official Sign-off & Seal ]
                  │
        ┌─────────┼─────────┐
        ▼         ▼         ▼
     English    Tamil     Hindi
       FIR       FIR       FIR
        │         │         │
        └─────────┼─────────┘
                  ▼
        [ Official PDF Export ]
```

---

## ✨ Key Features

1. **Groq Whisper Large V3 Speech-to-Text**: High-accuracy multilingual transcription supporting Tamil, Hindi, and English with automatic language detection and parallel English translation.
2. **RAG Legal Retrieval**: RAG knowledge store indexing statutory FIR formats (Section 154 Cr.P.C. / Section 173 BNSS), police operating procedures, and penal code cross-references.
3. **Anti-Hallucination Guardrails**: Unstated details (e.g. unknown suspects, unstated valuations) are strictly set to `null` or `"Not stated"`. The system never invents facts or sections.
4. **Interactive Police Workbench**: Investigating officers can review side-by-side native/English transcripts, modify all extracted fields, and add custom notes.
5. **Digital Verification & Official Seal**: Station House Officer (SHO) digital sign-off and official stamp generator.
6. **Multi-Language Document Generation**: Real-time rendering of FIR documents in English, Tamil, and Hindi with PDFKit export.
7. **Instant Local Mode**: Works immediately out of the box with realistic test cases even before adding live API credentials.

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Configure Environment Variables (Optional for Live Groq/Firebase)
In `server/.env`:
```env
PORT=5000
GROQ_API_KEY=your_groq_api_key_here
GROQ_LLM_MODEL=openai/gpt-oss-120b
```

In `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Run Application
Open two terminal windows:

**Backend Server (Port 5000):**
```bash
npm run dev:server
```

**Frontend Client (Port 5173):**
```bash
npm run dev:client
```

Open `http://localhost:5173` in your browser.

---

## 🛡️ Pre-Loaded Test Cases for Quick Evaluation

You can test VoiceFIR instantly with 1-click verified case samples on the New FIR screen:
1. 🇮🇳 **Tamil House Theft Case**: Night burglary in Anna Nagar, Chennai (8 Sovereigns gold + cash).
2. 🇮🇳 **Hindi Assault Case**: Motorcycle snatching and physical assault at Connaught Place Metro Station, New Delhi.
3. 🇮🇳 **English Cyber Fraud Case**: Online KYC impersonation and unauthorized bank debit in Indiranagar, Bengaluru.
