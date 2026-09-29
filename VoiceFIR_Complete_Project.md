# VoiceFIR — Complete Project Conversation / Implementation Plan

## 1. Project Overview

VoiceFIR is a GenAI-powered web application intended to help police officers convert recorded or uploaded victim complaints into structured FIR drafts.

### Core workflow

1. Police officer logs in.
2. Officer records or uploads a complaint audio file.
3. Audio may be in:
   - Tamil
   - Hindi
   - English
4. Whisper Large V3 detects/transcribes the audio.
5. The system produces:
   - Native-language transcript
   - English translation
6. The system extracts key information:
   - Complainant name
   - Date
   - Time
   - Location
   - Crime type
   - Accused details, if stated
   - Witnesses, if stated
   - Evidence, if stated
   - Stolen/damaged property, if stated
7. RAG retrieves relevant FIR format/reference information.
8. Groq Cloud `openai/gpt-oss-120b` structures the information into an FIR draft.
9. Police officer reviews and edits the generated FIR.
10. After approval, the system generates documents in:
    - Tamil
    - Hindi
    - English
11. Officer downloads the required document.

> **Important:** The generated FIR should be treated as a draft requiring police verification and approval. The AI must never invent facts, legal sections, names, dates, locations, evidence, or other information that is not supported by the complaint/reference material.

---

# 2. Important Model Correction

The originally proposed model:

`distilbert-base-uncased-finetuned-sst-2-english`

is a sentiment-analysis model. It is **not a RAG model and should not be used as the main FIR-generation model**.

The recommended architecture is:

```text
Audio
  ↓
Whisper Large V3
  ↓
Native Transcript + English Translation
  ↓
Information Extraction
  ↓
RAG Retrieval
  ↓
GPT-OSS-120B
  ↓
Structured FIR JSON
  ↓
Police Verification
  ↓
FIR Document
```

DistilBERT SST-2 could optionally be used for sentiment analysis, but sentiment analysis is not required for the core FIR-generation workflow.

---

# 3. Recommended Technology Stack

| Component | Technology |
|---|---|
| Frontend | React + Vite |
| Styling | Tailwind CSS |
| Backend | Node.js + Express |
| Authentication | Firebase Authentication |
| Police data | Firebase Firestore |
| Audio storage | Firebase Storage |
| Speech recognition | Groq Whisper Large V3 |
| Translation | Whisper Large V3 translation |
| LLM | Groq `openai/gpt-oss-120b` |
| RAG | Embeddings + Vector Database |
| PDF generation | PDFKit |
| FIR template | Official/reference FIR format |
| API security | Firebase ID Token verification |
| Deployment | Vercel/Firebase + Render/Railway or similar |

---

# 4. Overall Architecture

```text
                         ┌──────────────────────┐
                         │      POLICE USER      │
                         │                      │
                         │ Login / Register     │
                         │ Police ID             │
                         │ Name                  │
                         │ Station               │
                         │ Rank                  │
                         └──────────┬───────────┘
                                    │
                                    ▼
                     ┌──────────────────────────┐
                     │      REACT FRONTEND      │
                     │                          │
                     │ Login                    │
                     │ Dashboard                │
                     │ Audio Recorder            │
                     │ Audio Upload              │
                     │ Transcript Viewer         │
                     │ FIR Editor                │
                     │ FIR Preview               │
                     │ Download PDF              │
                     └────────────┬─────────────┘
                                  │
                                  ▼
                     ┌──────────────────────────┐
                     │     NODE.JS / EXPRESS    │
                     │        BACKEND           │
                     │                          │
                     │ /api/auth                 │
                     │ /api/transcribe           │
                     │ /api/analyze              │
                     │ /api/fir                  │
                     │ /api/pdf                  │
                     └───────┬─────────┬────────┘
                             │         │
                ┌────────────┘         └──────────────┐
                ▼                                     ▼
       ┌─────────────────┐                    ┌──────────────────┐
       │   GROQ CLOUD    │                    │     FIREBASE     │
       │                 │                    │                  │
       │ Whisper Large   │                    │ Authentication   │
       │ V3              │                    │ Firestore        │
       │                 │                    │ Storage           │
       │ GPT-OSS-120B    │                    │                  │
       └────────┬────────┘                    └──────────────────┘
                │
                ▼
       ┌─────────────────────┐
       │     RAG SYSTEM      │
       │                     │
       │ FIR format           │
       │ Police guidelines    │
       │ Field definitions    │
       │ Legal templates      │
       └──────────┬──────────┘
                  │
                  ▼
       ┌─────────────────────┐
       │ STRUCTURED FIR JSON │
       │                     │
       │ Crime               │
       │ Victim              │
       │ Accused             │
       │ Location             │
       │ Date/time            │
       │ Evidence             │
       │ Narrative            │
       └──────────┬──────────┘
                  │
             ┌────┴─────┐
             ▼          ▼
       ┌───────────┐ ┌───────────┐
       │ Regional  │ │ English   │
       │ FIR       │ │ FIR       │
       └─────┬─────┘ └─────┬─────┘
             │             │
             └──────┬──────┘
                    ▼
              ┌───────────┐
              │ PDF/DOCX  │
              │ DOWNLOAD  │
              └───────────┘
```

---

# 5. Recommended Project Structure

```text
voicefir/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AudioRecorder.jsx
│   │   │   ├── AudioUploader.jsx
│   │   │   ├── FIRPreview.jsx
│   │   │   ├── FIRFields.jsx
│   │   │   └── Navbar.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── CreateFIR.jsx
│   │   │   └── FIRResult.jsx
│   │   │
│   │   ├── services/
│   │   │   ├── firebase.js
│   │   │   └── api.js
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── .env
│
├── server/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── transcriptionController.js
│   │   └── firController.js
│   │
│   ├── routes/
│   │   ├── transcriptionRoutes.js
│   │   └── firRoutes.js
│   │
│   ├── services/
│   │   ├── groqService.js
│   │   ├── whisperService.js
│   │   ├── ragService.js
│   │   └── pdfService.js
│   │
│   ├── middleware/
│   │   └── authMiddleware.js
│   │
│   ├── rag/
│   │   ├── documents/
│   │   │   ├── fir_template.txt
│   │   │   ├── field_definitions.txt
│   │   │   └── police_guidelines.txt
│   │   └── vectorStore.js
│   │
│   ├── config/
│   │   └── firebaseAdmin.js
│   │
│   ├── server.js
│   ├── package.json
│   └── .env
│
└── README.md
```

---

# 6. Phase 1 — Create React Application

```bash
mkdir voicefir
cd voicefir

npm create vite@latest client -- --template react

cd client
npm install
```

Install frontend dependencies:

```bash
npm install firebase axios react-router-dom
```

Tailwind:

```bash
npm install tailwindcss @tailwindcss/vite
```

---

# 7. Phase 2 — Create Backend

From the `voicefir` folder:

```bash
mkdir server
cd server

npm init -y
```

Install backend dependencies:

```bash
npm install express cors dotenv multer
npm install groq-sdk
npm install firebase-admin
npm install pdfkit
npm install uuid
```

Development dependency:

```bash
npm install -D nodemon
```

---

# 8. Phase 3 — Firebase Setup

Create a Firebase project.

Enable:

```text
Authentication
    ↓
Email/Password

Firestore Database
    ↓
Create Database

Storage
    ↓
Enable Storage
```

Firebase Authentication is used for police login.

---

# 9. Police Login

The login page should contain:

```text
POLICE LOGIN

Police Email
[________________]

Password
[________________]

[ LOGIN ]

Forgot Password?
```

For a real deployment, police registration should preferably be controlled by an administrator instead of allowing unrestricted public registration.

---

# 10. Police Data Model

Firebase Authentication stores authentication information.

Firestore stores police profile data:

```text
policeUsers/
   {firebaseUID}
       │
       ├── policeId
       ├── name
       ├── rank
       ├── station
       ├── district
       ├── badgeNumber
       ├── phone
       ├── role
       └── createdAt
```

Example:

```json
{
  "policeId": "TN-POL-001",
  "name": "Officer Name",
  "rank": "Inspector",
  "station": "Example Police Station",
  "district": "Example District",
  "role": "police",
  "createdAt": "serverTimestamp"
}
```

---

# 11. Firebase Frontend Configuration

Create:

```text
client/src/services/firebase.js
```

```javascript
import { initializeApp } from "firebase/app";

import {
  getAuth
} from "firebase/auth";

import {
  getFirestore
} from "firebase/firestore";

import {
  getStorage
} from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
```

Frontend `.env`:

```env
VITE_FIREBASE_API_KEY=YOUR_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_DOMAIN
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
```

Do not put the Groq API key in this file.

---

# 12. Login Implementation

`client/src/pages/Login.jsx`

```jsx
import { useState } from "react";

import {
  signInWithEmailAndPassword
} from "firebase/auth";

import { auth } from "../services/firebase";

export default function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async (e) => {

    e.preventDefault();

    try {

      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      window.location.href = "/dashboard";

    } catch (error) {

      alert(error.message);

    }
  };

  return (
    <div>

      <h1>VoiceFIR</h1>

      <h2>Police Login</h2>

      <form onSubmit={login}>

        <input
          type="email"
          placeholder="Police Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">
          Login
        </button>

      </form>

    </div>
  );
}
```

---

# 13. Backend Environment Variables

Create:

```text
server/.env
```

```env
PORT=5000

GROQ_API_KEY=YOUR_GROQ_KEY

FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
FIREBASE_CLIENT_EMAIL=YOUR_SERVICE_ACCOUNT_EMAIL
FIREBASE_PRIVATE_KEY="YOUR_PRIVATE_KEY"
```

The Groq key must stay on the backend.

Never do:

```text
React → Groq API
```

Use:

```text
React
  ↓
Express Backend
  ↓
Groq
```

---

# 14. Phase 4 — Whisper Large V3

Create:

```text
server/services/whisperService.js
```

```javascript
const Groq = require("groq-sdk");
const fs = require("fs");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

async function transcribeAudio(filePath) {

  const transcription =
    await groq.audio.transcriptions.create({

      file: fs.createReadStream(filePath),

      model: "whisper-large-v3",

      response_format: "verbose_json",

      temperature: 0

    });

  return transcription;
}

module.exports = {
  transcribeAudio
};
```

Whisper Large V3 is used for multilingual speech recognition.

---

# 15. Language Detection

The system should obtain the detected language from the transcription result.

Example:

```javascript
const result = await transcribeAudio(filePath);

console.log(result.language);
console.log(result.text);
```

Example output:

```json
{
  "language": "ta",
  "text": "நேற்று இரவு என் வீட்டில் திருட்டு நடந்தது..."
}
```

The expected flow is:

```text
Audio
 ↓
Whisper Large V3
 ↓
Language Detection
 ↓
Tamil / Hindi / English
 ↓
Native Transcript
```

---

# 16. English Translation

Use Whisper's translation endpoint to produce English.

```javascript
async function translateAudio(filePath) {

  const translation =
    await groq.audio.translations.create({

      file: fs.createReadStream(filePath),

      model: "whisper-large-v3",

      response_format: "json",

      temperature: 0

    });

  return translation.text;
}
```

Expected flow:

```text
Tamil Audio
      │
      ├──────────────► Tamil Transcript
      │
      └──────────────► English Translation
```

---

# 17. Audio Upload API

`server/routes/transcriptionRoutes.js`

```javascript
const express = require("express");
const multer = require("multer");

const {
  transcribeAudio
} = require("../services/whisperService");

const router = express.Router();

const upload = multer({
  dest: "uploads/"
});

router.post(
  "/transcribe",
  upload.single("audio"),
  async (req, res) => {

    try {

      const result =
        await transcribeAudio(req.file.path);

      res.json({
        success: true,
        language: result.language,
        transcript: result.text
      });

    } catch (error) {

      console.error(error);

      res.status(500).json({
        success: false,
        error: "Transcription failed"
      });

    }
  }
);

module.exports = router;
```

---

# 18. Audio Recorder

Create:

```text
client/src/components/AudioRecorder.jsx
```

```jsx
import { useRef, useState } from "react";

export default function AudioRecorder({ onRecording }) {

  const recorderRef = useRef(null);

  const [recording, setRecording] =
    useState(false);

  const chunksRef = useRef([]);

  const startRecording = async () => {

    const stream =
      await navigator.mediaDevices.getUserMedia({
        audio: true
      });

    const recorder =
      new MediaRecorder(stream);

    recorderRef.current = recorder;

    chunksRef.current = [];

    recorder.ondataavailable = (event) => {
      chunksRef.current.push(event.data);
    };

    recorder.onstop = () => {

      const blob = new Blob(
        chunksRef.current,
        { type: "audio/webm" }
      );

      onRecording(blob);
    };

    recorder.start();

    setRecording(true);
  };

  const stopRecording = () => {

    recorderRef.current.stop();

    setRecording(false);
  };

  return (
    <div>

      {!recording ? (

        <button onClick={startRecording}>
          🎙 Start Recording
        </button>

      ) : (

        <button onClick={stopRecording}>
          ⏹ Stop Recording
        </button>

      )}

    </div>
  );
}
```

---

# 19. Main FIR Workflow

The dashboard should allow:

```text
CREATE NEW FIR

        ┌─────────────────────────────┐
        │                             │
        │     🎙 Record Complaint      │
        │                             │
        │              OR             │
        │                             │
        │     📁 Upload Audio         │
        │                             │
        └─────────────────────────────┘

Supported languages:
Tamil • Hindi • English

        [ Process Complaint ]
```

---

# 20. Complete AI Processing Pipeline

```text
Audio
  ↓
Whisper Large V3
  ↓
Language Detection
  ↓
Native Transcript
  ↓
English Translation
  ↓
Information Extraction
  ↓
RAG Retrieval
  ↓
GPT-OSS-120B
  ↓
Structured FIR JSON
  ↓
Police Verification
  ↓
FIR Document
```

---

# 21. FIR Information to Extract

The structured output should contain:

```javascript
const firSchema = {
  complainant: {
    name: "",
    fatherOrHusbandName: "",
    age: "",
    address: "",
    phone: ""
  },

  incident: {
    crimeType: "",
    date: "",
    time: "",
    location: "",
    description: ""
  },

  accused: [
    {
      name: "",
      description: "",
      relationship: ""
    }
  ],

  witnesses: [
    {
      name: "",
      address: ""
    }
  ],

  evidence: [
    ""
  ],

  property: [
    {
      item: "",
      value: "",
      description: ""
    }
  ],

  policeStation: "",
  district: "",

  sections: [],

  narrative: ""
};
```

---

# 22. Anti-Hallucination Rules

The LLM prompt must explicitly contain rules such as:

```text
Never invent facts.

If information is not present in the complaint,
return null or "Not stated".

Do not infer:

- names
- dates
- locations
- accused persons
- evidence
- witnesses
- crime sections
- addresses
- phone numbers
- monetary values

Only extract information supported by the transcript
or retrieved reference documents.

The police officer must verify the final document.
```

This is critical because the application deals with police and legal records.

---

# 23. RAG Architecture

Do not use:

```text
Transcript → GPT
```

Use:

```text
                 ┌──────────────────────┐
                 │ FIR reference docs   │
                 │                      │
                 │ FIR format           │
                 │ Field definitions    │
                 │ Police guidelines    │
                 │ Approved templates   │
                 └──────────┬───────────┘
                            │
                            ▼
                     Chunk documents
                            │
                            ▼
                       Embeddings
                            │
                            ▼
                       Vector DB
                            │
                            │
Complaint ──► Retrieval ────┘
                  │
                  ▼
             GPT-OSS-120B
                  │
                  ▼
             FIR JSON
```

---

# 24. RAG Documents

Create:

```text
server/rag/documents/
```

Recommended files:

```text
fir_template.txt
field_definitions.txt
police_guidelines.txt
approved_fir_examples.txt
```

The actual FIR format should be based on the official/reference format applicable to the jurisdiction.

If a specific FIR reference PDF is available, its exact fields should be mapped into the implementation instead of inventing a format.

---

# 25. GPT-OSS-120B Service

Create:

```text
server/services/groqService.js
```

```javascript
const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

async function generateFIR(
  nativeTranscript,
  englishTranscript,
  context
) {

  const prompt = `
You are an FIR document structuring assistant.

Your job is to extract information from the
complainant's statement and create a structured
FIR draft.

IMPORTANT RULES:

1. Never invent information.
2. Never assume missing information.
3. Use null when information is unavailable.
4. Preserve names exactly as spoken when possible.
5. Preserve dates and times accurately.
6. Identify the location.
7. Identify the reported crime type.
8. Extract accused information only when stated.
9. Extract witnesses only when stated.
10. Extract evidence only when stated.
11. Do not independently determine criminal liability.
12. Do not fabricate legal sections.
13. The police officer must verify the final document.

Native-language transcript:

${nativeTranscript}

English translation:

${englishTranscript}

Retrieved FIR reference:

${context}

Return structured FIR information.
`;

  const completion =
    await groq.chat.completions.create({

      model: "openai/gpt-oss-120b",

      messages: [
        {
          role: "system",
          content:
            "You are a legal-document structuring assistant. Never fabricate facts."
        },
        {
          role: "user",
          content: prompt
        }
      ],

      temperature: 0,

      response_format: {
        type: "json_object"
      }

    });

  return JSON.parse(
    completion.choices[0].message.content
  );
}

module.exports = {
  generateFIR
};
```

---

# 26. Example Complaint

Example Tamil complaint:

```text
நேற்று இரவு சுமார் 10 மணியளவில்
என் வீட்டில் திருட்டு நடந்தது.
சென்னை அண்ணாநகரில் உள்ள என் வீட்டில்
இருந்து தங்க நகைகள் மற்றும் பணம்
திருடப்பட்டுள்ளது.
```

Whisper output:

```text
Language: Tamil
```

Native transcript:

```text
நேற்று இரவு சுமார் 10 மணியளவில்
என் வீட்டில் திருட்டு நடந்தது...
```

English translation:

```text
A theft occurred at my house at around
10 PM yesterday. Gold jewellery and cash
were stolen from my house in Anna Nagar,
Chennai.
```

Structured extraction:

```json
{
  "crimeType": "Theft",
  "time": "Approximately 10 PM",
  "location": "Anna Nagar, Chennai",
  "property": [
    {
      "item": "Gold jewellery"
    },
    {
      "item": "Cash"
    }
  ]
}
```

The model should not invent the value of the jewellery if the victim did not state it.

---

# 27. FIR Review Page

Do not immediately download the generated FIR.

Show an editable review screen:

```text
┌─────────────────────────────────────────────┐
│              FIR REVIEW                     │
├─────────────────────────────────────────────┤
│                                             │
│ Language: Tamil                             │
│                                             │
│ Complainant                                 │
│ Name:        [......................]       │
│ Address:     [......................]       │
│                                             │
│ Incident                                     │
│ Crime Type:  [Theft................]        │
│ Date:        [......................]       │
│ Time:        [......................]       │
│ Location:    [......................]       │
│                                             │
│ Narrative                                   │
│ ┌─────────────────────────────────────────┐ │
│ │ Generated FIR narrative                 │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ [ Edit ]                                    │
│                                             │
│ ⚠ Verify all information before approval   │
│                                             │
│ [ Approve FIR ]                             │
└─────────────────────────────────────────────┘
```

---

# 28. FIR PDF Generation

Use PDFKit:

```javascript
const PDFDocument = require("pdfkit");
const fs = require("fs");

function createFIRPDF(fir, outputPath) {

  const doc = new PDFDocument();

  doc.pipe(
    fs.createWriteStream(outputPath)
  );

  doc.fontSize(18)
     .text("FIRST INFORMATION REPORT", {
       align: "center"
     });

  doc.moveDown();

  doc.fontSize(11);

  doc.text(
    `Police Station: ${fir.policeStation || ""}`
  );

  doc.text(
    `Crime Type: ${fir.incident.crimeType || ""}`
  );

  doc.text(
    `Date: ${fir.incident.date || ""}`
  );

  doc.text(
    `Time: ${fir.incident.time || ""}`
  );

  doc.text(
    `Location: ${fir.incident.location || ""}`
  );

  doc.moveDown();

  doc.text(
    `Complainant: ${fir.complainant.name || ""}`
  );

  doc.moveDown();

  doc.text(
    fir.incident.description || ""
  );

  doc.end();
}

module.exports = {
  createFIRPDF
};
```

---

# 29. Regional Language PDF

Tamil and Hindi require Unicode-compatible fonts.

Recommended structure:

```text
server/assets/fonts/

TamilFont.ttf
DevanagariFont.ttf
EnglishFont.ttf
```

The PDF generator should embed the correct font for each language.

```text
Tamil FIR
  ↓
Tamil Unicode font
  ↓
PDF
```

```text
Hindi FIR
  ↓
Devanagari Unicode font
  ↓
PDF
```

---

# 30. Download Options

Final page:

```text
FIR GENERATED

┌─────────────────────────────┐
│ ✓ FIR successfully created  │
└─────────────────────────────┘

Language

[ தமிழ் FIR ]

[ हिंदी FIR ]

[ English FIR ]

Documents

[ Download Tamil PDF ]

[ Download Hindi PDF ]

[ Download English PDF ]
```

---

# 31. Firestore Database Design

Recommended collections:

```text
policeUsers/
    {uid}

firCases/
    {firId}

transcriptions/
    {transcriptionId}

auditLogs/
    {logId}
```

Example `firCases` document:

```json
{
  "firId": "FIR-2026-00001",

  "createdBy": "firebaseUID",

  "policeStation": "Station",

  "language": "ta",

  "nativeTranscript": "...",

  "englishTranscript": "...",

  "complainant": {
    "name": "...",
    "address": "..."
  },

  "incident": {
    "crimeType": "Theft",
    "date": "...",
    "time": "...",
    "location": "..."
  },

  "status": "draft",

  "verified": false,

  "createdAt": "timestamp",

  "updatedAt": "timestamp"
}
```

---

# 32. Security Architecture

Sensitive police/complaint information requires a secure architecture.

```text
Police Browser
      │
      │ Firebase Authentication
      ▼
Firebase Auth
      │
      │ ID Token
      ▼
Express Backend
      │
      ├──── Verify Token
      │
      ├──── Verify Police Role
      │
      ├──── Process Audio
      │
      └──── Call Groq
```

Never expose the Groq API key in the browser.

Correct:

```text
Browser
   ↓
Backend
   ↓
Groq
```

Incorrect:

```text
Browser
   ↓
GROQ_API_KEY
```

---

# 33. Firestore Security Concept

A basic example:

```javascript
rules_version = '2';

service cloud.firestore {

  match /databases/{database}/documents {

    match /policeUsers/{userId} {

      allow read:
        if request.auth != null
        && request.auth.uid == userId;

    }

    match /firCases/{firId} {

      allow read, write:
        if request.auth != null
        && resource.data.createdBy == request.auth.uid;

    }

  }
}
```

For production, use a stronger role/station/supervisor-based authorization design and carefully protect immutable audit records.

---

# 34. API Design

Recommended API endpoints:

```text
POST
/api/transcription

POST
/api/translation

POST
/api/fir/extract

POST
/api/fir/generate

PUT
/api/fir/:id

GET
/api/fir/:id

GET
/api/fir

POST
/api/fir/:id/approve

GET
/api/fir/:id/pdf?language=ta

GET
/api/fir/:id/pdf?language=hi

GET
/api/fir/:id/pdf?language=en
```

---

# 35. Complete Processing Function

The backend can eventually combine the pipeline:

```javascript
async function processComplaint(audioFile) {

  // 1. Whisper
  const transcription =
    await transcribeAudio(audioFile);

  // 2. Detect language
  const language =
    transcription.language;

  // 3. Native transcript
  const nativeText =
    transcription.text;

  // 4. English translation
  const englishText =
    await translateAudio(audioFile);

  // 5. RAG
  const context =
    await retrieveFIRContext(
      englishText
    );

  // 6. GPT
  const fir =
    await generateFIR(
      nativeText,
      englishText,
      context
    );

  return {
    language,
    nativeText,
    englishText,
    fir
  };
}
```

---

# 36. Final Page Flow

```text
1. Login
      ↓
2. Police Dashboard
      ↓
3. New FIR
      ↓
4. Record / Upload Audio
      ↓
5. Processing
      ↓
6. Transcript
      ↓
7. Extracted Information
      ↓
8. FIR Review & Edit
      ↓
9. FIR Preview
      ↓
10. Police Approval
      ↓
11. Download
      ├── Tamil
      ├── Hindi
      └── English
```

---

# 37. Dashboard Concept

```text
┌───────────────────────────────────────────────────┐
│ VoiceFIR                           Officer Profile │
├───────────────────────────────────────────────────┤
│                                                   │
│  Welcome, Officer                                 │
│                                                   │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐    │
│  │ Total FIR  │ │ Drafts     │ │ Approved   │    │
│  │    128     │ │     7      │ │    121     │    │
│  └────────────┘ └────────────┘ └────────────┘    │
│                                                   │
│              [ + CREATE NEW FIR ]                 │
│                                                   │
│ Recent FIRs                                       │
│                                                   │
│ FIR-001   Theft       Tamil     Approved          │
│ FIR-002   Assault     Hindi     Draft             │
│ FIR-003   Fraud       English   Approved          │
│                                                   │
└───────────────────────────────────────────────────┘
```

---

# 38. Final AI Engine

```text
              VOICEFIR AI ENGINE
                     │
          ┌──────────┴──────────┐
          │                     │
       AUDIO                 REFERENCE
          │                     │
          ▼                     ▼
   WHISPER LARGE V3          FIR DOCUMENTS
          │                     │
          ▼                     ▼
     TRANSCRIPTION            RAG
          │                     │
          ├───────┐             │
          │       │             │
       Native   English         │
       Text     Text            │
          │       │             │
          └───┬───┘             │
              └────────┬────────┘
                       ▼
                GPT-OSS-120B
                       │
                       ▼
                  FIR JSON
                       │
                       ▼
                POLICE REVIEW
                       │
                       ▼
                APPROVED FIR
                       │
             ┌─────────┼─────────┐
             ▼         ▼         ▼
           Tamil     Hindi     English
             │         │         │
             └─────────┼─────────┘
                       ▼
                    PDF/DOCX
```

---

# 39. Recommended Development Phases

Do not build the entire system at once.

## Phase 1 — Basic Web Application

```text
React
 ↓
Login
 ↓
Dashboard
```

## Phase 2 — Firebase

```text
Firebase Auth
 ↓
Firestore
 ↓
Police profiles
```

## Phase 3 — Audio

```text
Record audio
 +
Upload audio
```

## Phase 4 — Whisper

```text
Audio
 ↓
Whisper Large V3
 ↓
Language
 ↓
Native transcript
```

## Phase 5 — Translation

```text
Native audio
 ↓
Whisper translation
 ↓
English transcript
```

## Phase 6 — GPT

```text
Transcript
 ↓
GPT-OSS-120B
 ↓
Structured JSON
```

## Phase 7 — RAG

```text
FIR references
 ↓
Embedding
 ↓
Vector database
 ↓
Relevant context
 ↓
GPT
```

## Phase 8 — FIR UI

```text
Extracted fields
 ↓
Editable FIR
 ↓
Preview
```

## Phase 9 — Documents

```text
Tamil PDF
Hindi PDF
English PDF
```

## Phase 10 — Security

```text
Authentication
Authorization
Firestore rules
Backend token verification
API key protection
Audit logs
```

---

# 40. Recommended Final Architecture

```text
                         ┌─────────────────────┐
                         │     POLICE USER     │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   REACT + VITE      │
                         │                     │
                         │ Login               │
                         │ Dashboard           │
                         │ Recorder            │
                         │ Upload              │
                         │ FIR Review          │
                         │ FIR Preview         │
                         └──────────┬──────────┘
                                    │
                             Firebase Auth
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   NODE + EXPRESS    │
                         └──────────┬──────────┘
                                    │
                 ┌──────────────────┼──────────────────┐
                 │                  │                  │
                 ▼                  ▼                  ▼
           Firebase             Groq Cloud           RAG
           Firestore                 │                 │
           Storage                   │                 │
                                ┌────┴────┐            │
                                │         │            │
                                ▼         ▼            ▼
                            Whisper    GPT-OSS     FIR Reference
                            Large V3    120B        Documents
                                │         │            │
                                └────┬────┘            │
                                     │                 │
                                     └────────┬────────┘
                                              ▼
                                       FIR JSON
                                              │
                                              ▼
                                      POLICE REVIEW
                                              │
                                              ▼
                                          APPROVE
                                              │
                              ┌───────────────┼───────────────┐
                              ▼               ▼               ▼
                           Tamil            Hindi          English
                              │               │               │
                              └───────────────┼───────────────┘
                                              ▼
                                         PDF / DOCX
```

---

# 41. Key Design Principles

1. **Whisper Large V3** handles speech recognition.
2. **Whisper translation** provides English output.
3. **RAG** supplies official/reference FIR structure and field definitions.
4. **GPT-OSS-120B** converts extracted information into structured FIR data.
5. **Do not use SST-2 as the FIR generator.**
6. **Never allow the model to invent missing information.**
7. **Use structured JSON output rather than free-form AI text.**
8. **Require police review before approval.**
9. **Keep Groq API keys on the backend.**
10. **Use Firebase Authentication for police accounts.**
11. **Use Firestore for metadata and FIR records.**
12. **Use Firebase Storage for audio/document files where appropriate.**
13. **Embed Unicode fonts for Tamil/Hindi PDFs.**
14. **Maintain audit logs for important actions.**
15. **Use the actual official FIR reference/template for the jurisdiction instead of creating a fictional legal format.**

---

# 42. Suggested Implementation Order

The most practical implementation order is:

```text
STEP 1
Create React + Vite project

        ↓

STEP 2
Create Node + Express backend

        ↓

STEP 3
Connect Firebase Authentication

        ↓

STEP 4
Create police login

        ↓

STEP 5
Create dashboard

        ↓

STEP 6
Build audio recorder

        ↓

STEP 7
Build audio upload

        ↓

STEP 8
Connect Groq Whisper Large V3

        ↓

STEP 9
Implement language detection

        ↓

STEP 10
Implement English translation

        ↓

STEP 11
Create FIR JSON schema

        ↓

STEP 12
Create RAG knowledge base

        ↓

STEP 13
Connect GPT-OSS-120B

        ↓

STEP 14
Generate structured FIR

        ↓

STEP 15
Create editable FIR review page

        ↓

STEP 16
Add police approval

        ↓

STEP 17
Generate Tamil/Hindi/English documents

        ↓

STEP 18
Add Firebase Storage

        ↓

STEP 19
Add audit logs

        ↓

STEP 20
Security testing

        ↓

STEP 21
Deployment
```

---

# 43. Final Project Goal

The completed VoiceFIR system should behave like:

```text
Police Officer
      │
      ▼
Login
      │
      ▼
VoiceFIR Dashboard
      │
      ▼
Record / Upload Complaint
      │
      ▼
Whisper Large V3
      │
      ├──────────────► Native Transcript
      │
      └──────────────► English Translation
                              │
                              ▼
                         RAG Retrieval
                              │
                              ▼
                       GPT-OSS-120B
                              │
                              ▼
                       Structured FIR
                              │
                              ▼
                       Police Review
                              │
                              ▼
                          Approval
                              │
                 ┌────────────┼────────────┐
                 ▼            ▼            ▼
               Tamil        Hindi       English
                 │            │            │
                 └────────────┼────────────┘
                              ▼
                         PDF / DOCX
                              │
                              ▼
                          Download
```

This is the recommended complete architecture for the VoiceFIR project.
