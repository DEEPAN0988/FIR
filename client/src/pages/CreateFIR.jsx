import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function CreateFIR() {
  const { officer } = useAuth();
  const navigate = useNavigate();

  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en"); // "ta" | "hi" | "en"
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [statusText, setStatusText] = useState("Ready to Record");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [transcriptSource, setTranscriptSource] = useState(null); // "mic" | "translated" | "manual" | "sample"
  const [errorMessage, setErrorMessage] = useState(null);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [showSampleDrawer, setShowSampleDrawer] = useState(false);
  const [formConsent, setFormConsent] = useState(true);
  const [apiKeyInput, setApiKeyInput] = useState(() => localStorage.getItem("voicefir_groq_api_key") || "");

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const fileInputRef = useRef(null);
  const speechRecognitionRef = useRef(null);

  // Initialize in-browser real-time speech recognition
  const startSpeechRecognition = (lang) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        
        const langMap = {
          ta: "ta-IN",
          hi: "hi-IN",
          en: "en-IN"
        };
        recognition.lang = langMap[lang || selectedLanguage] || "en-US";

        recognition.onresult = (event) => {
          let currentTranscript = "";
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript + " ";
          }
          const cleaned = currentTranscript.trim();
          if (cleaned) {
            setLiveTranscript(cleaned);
            setTranscriptSource("mic");
          }
        };

        recognition.onerror = (e) => {
          console.warn("Speech recognition notice:", e.error);
        };

        recognition.start();
        speechRecognitionRef.current = recognition;
      } catch (err) {
        console.warn("Speech recognition initialization warning:", err);
      }
    }
  };

  const stopSpeechRecognition = () => {
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (e) {}
    }
  };

  // Instant Multilingual Translation when switching language tabs
  const handleLanguageChange = async (targetLang) => {
    const previousLang = selectedLanguage;
    setSelectedLanguage(targetLang);

    // If there is existing spoken or typed text, translate it live into target language
    if (liveTranscript && liveTranscript.trim().length > 0 && targetLang !== previousLang) {
      setIsTranslating(true);
      try {
        const res = await api.translateText(liveTranscript.trim(), targetLang);
        if (res.success && res.translatedText) {
          setLiveTranscript(res.translatedText);
          setTranscriptSource("translated");
        }
      } catch (err) {
        console.warn("Language translation warning:", err);
      } finally {
        setIsTranslating(false);
      }
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      stopSpeechRecognition();
      setIsRecording(false);
      setStatusText("Audio Captured");
    } else {
      // Start recording
      try {
        setErrorMessage(null);
        setAudioFile(null);
        setLiveTranscript("");
        setTranscriptSource("mic");

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          setAudioBlob(blob);
          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorder.start(250);
        startSpeechRecognition(selectedLanguage);
        setIsRecording(true);
        setStatusText("Recording... Speak into microphone");
      } catch (err) {
        console.error("Microphone error:", err);
        setErrorMessage("Microphone access was denied or not available. You can upload audio or use sample cases.");
      }
    }
  };

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAudioFile(file);
      setAudioBlob(null);
      setLiveTranscript("");
      setTranscriptSource("file");
      setStatusText(`Uploaded: ${file.name}`);
    }
  };

  const handleSelectSample = (langKey, label, sampleText) => {
    setSelectedLanguage(langKey);
    setLiveTranscript(sampleText);
    setTranscriptSource("sample");
    setAudioFile(null);
    setAudioBlob(null);
    setShowSampleDrawer(false);
    setStatusText(`Loaded Sample: ${label}`);
  };

  const handleClearTranscript = () => {
    setLiveTranscript("");
    setAudioBlob(null);
    setAudioFile(null);
    setTranscriptSource(null);
    setStatusText("Ready to Record");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSaveApiKey = () => {
    localStorage.setItem("voicefir_groq_api_key", apiKeyInput.trim());
    setShowKeyModal(false);
    alert("Groq API Key saved for cloud Whisper Large V3 & LLM processing!");
  };

  const handleProcess = async () => {
    if (!audioBlob && !audioFile && !liveTranscript) {
      alert("Please record audio or type your complaint first.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const storedKey = localStorage.getItem("voicefir_groq_api_key");
      const formData = new FormData();

      if (audioBlob) {
        formData.append("audio", audioBlob, "complaint.webm");
        formData.append("language", selectedLanguage);
      } else if (audioFile) {
        formData.append("audio", audioFile);
        formData.append("language", selectedLanguage);
      }

      if (liveTranscript) {
        formData.append("clientTranscript", liveTranscript);
      }

      if (storedKey) {
        formData.append("groqApiKey", storedKey);
      }

      // Step 1: Transcribe
      const transcribeRes = await api.transcribeAudio(formData);
      if (!transcribeRes.success) {
        throw new Error(transcribeRes.error || "Speech transcription failed");
      }

      // Step 2: RAG + LLM Structuring
      const firRes = await api.generateFIR({
        nativeTranscript: transcribeRes.nativeTranscript || liveTranscript,
        englishTranscript: transcribeRes.englishTranscript || liveTranscript,
        language: transcribeRes.language || selectedLanguage,
        languageName: transcribeRes.languageName,
        station: officer?.station,
        district: officer?.district,
        groqApiKey: storedKey
      });

      if (!firRes.success) {
        throw new Error(firRes.error || "FIR structuring failed");
      }

      navigate(`/fir/${firRes.data.firId}/review`);
    } catch (err) {
      console.error("Pipeline error:", err);
      setErrorMessage(err.message || "Failed to process audio complaint");
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    handleClearTranscript();
    setIsRecording(false);
    stopSpeechRecognition();
  };

  const hasContentReady = isRecording || !!audioBlob || !!audioFile || !!liveTranscript;

  return (
    <main className="flex-1 md:ml-64 p-4 md:p-8 lg:p-12 max-w-[1280px] mx-auto w-full flex flex-col items-center justify-center min-h-[calc(100vh-64px)] relative overflow-hidden font-['Inter']">
      
      {/* Atmospheric Background Glow */}
      <div className="absolute inset-0 pointer-events-none opacity-40 z-0 flex items-center justify-center">
        <div className="w-[700px] h-[700px] bg-[#dbe1ff] rounded-full blur-[130px] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>

      <div className="z-10 w-full max-w-3xl flex flex-col gap-6 items-center">
        
        {/* Title & API Key Status */}
        <div className="text-center w-full relative">
          <button
            type="button"
            onClick={() => setShowKeyModal(true)}
            className="absolute right-0 top-0 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white border border-[#E2E8F0] text-[#0051d5] hover:bg-[#f2f4f6] flex items-center gap-1 shadow-xs"
          >
            <span className="material-symbols-outlined text-[14px]">key</span>
            {localStorage.getItem("voicefir_groq_api_key") ? "Groq Key: Configured" : "Add Groq API Key"}
          </button>

          <h1 className="font-['Hanken_Grotesk'] text-2xl md:text-4xl font-bold text-[#191c1e] mb-1 tracking-tight">
            Create New FIR
          </h1>
          <p className="text-sm text-[#45464d]">
            Select your language below, then press the microphone to record your voice complaint.
          </p>
        </div>

        {errorMessage && (
          <div className="w-full p-3.5 rounded-xl bg-[#ffdad6] border border-[#ba1a1a]/30 text-[#93000a] text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Recording Interface Card */}
        <div className="w-full bg-white border border-[#E2E8F0] rounded-xl shadow-[0_10px_15px_-3px_rgba(15,23,42,0.08)] p-6 md:p-10 flex flex-col items-center gap-6 glass-panel relative overflow-hidden">
          
          {/* Prominent Language Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between w-full pb-4 border-b border-[#E2E8F0] gap-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#000000]">
              <span className="material-symbols-outlined text-[#0051d5] text-[18px]">translate</span>
              Language / மொழி / भाषा:
            </div>

            <div className="flex items-center gap-2">
              {isTranslating && (
                <span className="text-[11px] font-bold text-[#0051d5] animate-pulse flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0051d5] animate-ping"></span>
                  Translating...
                </span>
              )}
              <div className="flex gap-1.5 bg-[#f2f4f6] p-1 rounded-xl border border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => handleLanguageChange("ta")}
                  disabled={isTranslating}
                  className={`text-xs font-bold px-3.5 py-1.5 rounded-lg transition-all ${
                    selectedLanguage === "ta"
                      ? "bg-[#0051d5] text-white shadow-xs"
                      : "text-[#191c1e] hover:bg-white"
                  }`}
                >
                  Tamil (தமிழ்)
                </button>
                <button
                  type="button"
                  onClick={() => handleLanguageChange("hi")}
                  disabled={isTranslating}
                  className={`text-xs font-bold px-3.5 py-1.5 rounded-lg transition-all ${
                    selectedLanguage === "hi"
                      ? "bg-[#0051d5] text-white shadow-xs"
                      : "text-[#191c1e] hover:bg-white"
                  }`}
                >
                  Hindi (हिंदी)
                </button>
                <button
                  type="button"
                  onClick={() => handleLanguageChange("en")}
                  disabled={isTranslating}
                  className={`text-xs font-bold px-3.5 py-1.5 rounded-lg transition-all ${
                    selectedLanguage === "en"
                      ? "bg-[#0051d5] text-white shadow-xs"
                      : "text-[#191c1e] hover:bg-white"
                  }`}
                >
                  English
                </button>
              </div>
            </div>
          </div>

          {!isProcessing ? (
            /* Main Record Action Area */
            <div className="flex flex-col items-center justify-center py-4 w-full">
              
              {/* Mic Circle Button */}
              <button
                type="button"
                onClick={toggleRecording}
                className={`w-32 h-32 rounded-full border flex items-center justify-center shadow-xs hover:shadow-md transition-all duration-300 group relative mb-6 ${
                  isRecording
                    ? "bg-[#ffdad6] border-[#ba1a1a]"
                    : "bg-[#f7f9fb] border-[#E2E8F0]"
                }`}
              >
                <div className="absolute inset-0 rounded-full border-2 border-transparent group-hover:border-[#b4c5ff] transition-colors duration-300"></div>
                
                <span
                  className={`material-symbols-outlined text-[48px] group-hover:scale-110 transition-transform duration-300 ${
                    isRecording ? "text-[#ba1a1a] fill-icon" : "text-[#0051d5]"
                  }`}
                >
                  mic
                </span>

                {/* Pulse Ring when active */}
                {isRecording && (
                  <div className="absolute inset-0 rounded-full bg-[#ba1a1a] opacity-20 audio-pulse"></div>
                )}
              </button>

              <h2 className={`font-['Hanken_Grotesk'] text-2xl font-bold mb-1 ${
                isRecording ? "text-[#ba1a1a]" : "text-[#191c1e]"
              }`}>
                {statusText}
              </h2>
              
              <p className="text-sm text-[#45464d] text-center max-w-sm mb-4">
                {isRecording
                  ? `Dictating in ${selectedLanguage === 'ta' ? 'Tamil' : selectedLanguage === 'hi' ? 'Hindi' : 'English'}... Speak into your mic:`
                  : `Press the microphone to begin recording in ${selectedLanguage === 'ta' ? 'Tamil (தமிழ்)' : selectedLanguage === 'hi' ? 'Hindi (हिंदी)' : 'English'}.`}
              </p>

              {/* Real-time Spoken Words Box with Live Translation */}
              {(isRecording || liveTranscript) && (
                <div className="w-full max-w-lg mb-2 p-3.5 rounded-xl bg-[#f7f9fb] border border-[#E2E8F0] text-left relative">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold uppercase text-[#0051d5] flex items-center gap-1.5">
                      {isRecording && <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping"></span>}
                      {transcriptSource === "sample"
                        ? "📋 Sample Case (Demo):"
                        : transcriptSource === "translated"
                        ? `🌐 Translated to ${selectedLanguage === 'ta' ? 'Tamil (தமிழ்)' : selectedLanguage === 'hi' ? 'Hindi (हिंदी)' : 'English'}:`
                        : "🎤 Your Spoken Voice Transcript:"}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[#76777d]">Editable</span>
                      <button
                        type="button"
                        onClick={handleClearTranscript}
                        className="text-[10px] text-[#ba1a1a] hover:underline font-bold"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                  <textarea
                    rows={3}
                    value={liveTranscript}
                    onChange={(e) => {
                      setLiveTranscript(e.target.value);
                      setTranscriptSource("manual");
                    }}
                    placeholder="Your spoken words appear here in real-time as you speak..."
                    className="w-full text-xs text-[#191c1e] bg-white p-2.5 rounded-lg border border-[#E2E8F0] focus:outline-none focus:border-[#0051d5] leading-relaxed"
                  />
                </div>
              )}

              {/* Audio Visualizer Waves */}
              <div className={`h-8 w-full max-w-md flex items-center justify-center gap-1.5 transition-opacity duration-300 ${
                isRecording ? "opacity-100" : "opacity-0 h-1 pointer-events-none"
              }`}>
                <div className="w-1.5 h-3 bg-[#0051d5] rounded-full animate-[bounce_1s_infinite_100ms]"></div>
                <div className="w-1.5 h-7 bg-[#0051d5] rounded-full animate-[bounce_1.2s_infinite_200ms]"></div>
                <div className="w-1.5 h-11 bg-[#0051d5] rounded-full animate-[bounce_0.8s_infinite_300ms]"></div>
                <div className="w-1.5 h-5 bg-[#0051d5] rounded-full animate-[bounce_1.1s_infinite_400ms]"></div>
                <div className="w-1.5 h-9 bg-[#0051d5] rounded-full animate-[bounce_0.9s_infinite_500ms]"></div>
                <div className="w-1.5 h-4 bg-[#0051d5] rounded-full animate-[bounce_1.3s_infinite_600ms]"></div>
                <div className="w-1.5 h-12 bg-[#0051d5] rounded-full animate-[bounce_0.7s_infinite_700ms]"></div>
                <div className="w-1.5 h-6 bg-[#0051d5] rounded-full animate-[bounce_1s_infinite_800ms]"></div>
              </div>

            </div>
          ) : (
            /* Processing State */
            <div className="flex flex-col items-center justify-center py-12 w-full h-[300px]">
              <div className="relative w-24 h-24 mb-6">
                <svg className="animate-spin w-full h-full text-[#b4c5ff]" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor"></path>
                </svg>
                <span className="material-symbols-outlined absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[#0051d5] text-[32px]">
                  memory
                </span>
              </div>
              <h2 className="font-['Hanken_Grotesk'] text-2xl font-bold text-[#191c1e] mb-1">
                Processing Audio...
              </h2>
              <p className="text-sm text-[#45464d] text-center max-w-sm">
                Whisper Large V3 transcription & RAG legal report structuring in progress.
              </p>
              <div className="w-full max-w-sm bg-[#f2f4f6] rounded-full h-2 mt-6 overflow-hidden border border-[#E2E8F0]">
                <div className="bg-[#0051d5] h-2 rounded-full w-2/3 animate-pulse"></div>
              </div>
            </div>
          )}

          {/* DPDP Act 2023 Statutory Consent */}
          <div className="w-full mt-6 p-3.5 bg-[#f7f9fb] rounded-xl border border-[#E2E8F0] text-xs text-[#45464d] flex items-start gap-3">
            <input
              id="fir-form-consent"
              type="checkbox"
              checked={formConsent}
              onChange={(e) => setFormConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 text-[#0051d5] border-[#E2E8F0] rounded cursor-pointer shrink-0 focus:ring-[#0051d5]"
            />
            <label htmlFor="fir-form-consent" className="cursor-pointer leading-relaxed text-[11px]">
              <strong className="text-[#191c1e]">Statutory Declaration (DPDP Act 2023 & BNSS Sec 173):</strong> I confirm that I am an authorized police officer processing this audio/statement for official criminal procedure documentation. Personal data is handled strictly under Section 7 of DPDP Act 2023 for law enforcement functions.
            </label>
          </div>

          {/* Footer Actions */}
          <div className="w-full flex flex-col sm:flex-row items-center justify-between border-t border-[#E2E8F0] pt-6 gap-4">
            <input
              type="file"
              ref={fileInputRef}
              accept="audio/*,.wav,.mp3,.webm,.m4a"
              onChange={handleFileUpload}
              className="hidden"
            />
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Upload Audio File"
                className="text-[#45464d] hover:text-[#191c1e] font-semibold text-xs flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-[#f2f4f6] transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">upload_file</span>
                Upload Audio
              </button>

              <button
                type="button"
                onClick={() => setShowSampleDrawer(!showSampleDrawer)}
                aria-label="Toggle Demo Case Samples"
                className="text-[#0051d5] hover:underline font-semibold text-xs flex items-center gap-1 px-2 py-2"
              >
                <span className="material-symbols-outlined text-[16px]" aria-hidden="true">folder</span>
                {showSampleDrawer ? "Hide Demo Samples" : "Load Demo Sample"}
              </button>
            </div>

            <div className="flex gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleCancel}
                aria-label="Cancel or Reset Input"
                className="flex-1 sm:flex-none px-6 py-2.5 border border-[#E2E8F0] text-[#191c1e] font-semibold text-sm rounded-lg hover:bg-[#f2f4f6] transition-colors"
              >
                Cancel / Reset
              </button>

              <button
                type="button"
                onClick={handleProcess}
                disabled={isProcessing || !hasContentReady || isTranslating || !formConsent}
                aria-label="Process Audio and Generate Draft FIR"
                className={`flex-1 sm:flex-none px-8 py-2.5 bg-[#0051d5] text-white font-semibold text-sm rounded-lg hover:bg-[#316bf3] transition-all shadow-xs ${
                  !hasContentReady || isProcessing || isTranslating || !formConsent ? "opacity-50 cursor-not-allowed" : "cursor-pointer active:scale-95"
                }`}
              >
                {isProcessing ? "Processing Speech..." : "Process & Generate FIR"}
              </button>
            </div>
          </div>

          {/* Collapsible Sample Cases Drawer */}
          {showSampleDrawer && (
            <div className="w-full pt-4 border-t border-[#E2E8F0] bg-[#f7f9fb] p-4 rounded-xl">
              <p className="text-[11px] font-bold text-[#45464d] uppercase tracking-wider mb-2 text-center">
                Select a benchmark test case:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectSample("ta", "Tamil House Theft (Chennai)", "நேற்று இரவு சுமார் 10:30 மணியளவில் சென்னை அண்ணாநகர் 2-வது பிரதான சாலையில் உள்ள எனது வீட்டின் பின்பக்க பால்கனி பூட்டை உடைத்து உள்ளே புகுந்த மர்ம நபர்கள், பீரோவில் இருந்த 8 சவரன் தங்க நகைகள் மற்றும் ரூபாய் 45,000 ரொக்கப் பணத்தைத் திருடிச் சென்றுவிட்டனர். எனது பெயர் கே. சுப்பிரமணியம், வயது 48.")}
                  className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-white hover:bg-[#e0e3e5] text-xs font-semibold text-[#191c1e]"
                >
                  🇮🇳 Tamil Theft Case
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectSample("hi", "Hindi Snatching Case (Delhi)", "कल रात लगभग 8:30 बजे कनॉट प्लेस मेट्रो स्टेशन गेट नंबर 2 के पास दो अज्ञात लड़कों ने काली पल्सर मोटरसाइकिल पर आकर मुझे रोका, गाली-गलौज की और मारपीट करके मेरा पर्स और मोबाइल फोन छीन लिया। मेरा नाम राजेश शर्मा है, उम्र 34 वर्ष।")}
                  className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-white hover:bg-[#e0e3e5] text-xs font-semibold text-[#191c1e]"
                >
                  🇮🇳 Hindi Assault Case
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectSample("en", "English Cyber Fraud (Bengaluru)", "On 21st August at 14:15 hrs, I received a fraudulent phone call from an unknown individual claiming to update my bank KYC. They induced me to download a link and debited 85,000 rupees fraudulently. My name is Pooja Hegde.")}
                  className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-white hover:bg-[#e0e3e5] text-xs font-semibold text-[#191c1e]"
                >
                  🇬🇧 English Cyber Case
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Groq Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-2xl max-w-md w-full">
            <h3 className="font-['Hanken_Grotesk'] text-lg font-bold text-[#191c1e] mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0051d5]">vpn_key</span>
              Configure Groq Cloud API Key
            </h3>
            <p className="text-xs text-[#45464d] mb-4 leading-relaxed">
              Enter your Groq API key (from <a href="https://console.groq.com" target="_blank" rel="noreferrer" className="text-[#0051d5] underline">console.groq.com</a>) to use live Groq Whisper Large V3 neural speech transcription and LLM legal structuring.
            </p>
            
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="gsk_..."
              className="w-full px-3.5 py-2.5 bg-[#f7f9fb] border border-[#E2E8F0] rounded-xl text-xs text-[#191c1e] font-mono focus:outline-none focus:border-[#0051d5] mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowKeyModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-[#45464d] hover:bg-[#f2f4f6]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveApiKey}
                className="px-5 py-2 rounded-lg bg-[#0051d5] hover:bg-[#316bf3] text-white text-xs font-bold"
              >
                Save Key
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
