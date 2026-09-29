const Groq = require("groq-sdk");
const fs = require("fs");

function getGroqClient(customKey) {
  const apiKey = customKey || process.env.GROQ_API_KEY;
  if (apiKey) {
    try {
      return new Groq({ apiKey });
    } catch (err) {
      console.warn("Groq initialization error:", err.message);
    }
  }
  return null;
}

const languageNames = {
  ta: "Tamil",
  hi: "Hindi",
  en: "English",
  te: "Telugu",
  kn: "Kannada",
  ml: "Malayalam",
  mr: "Marathi",
  bn: "Bengali",
  gu: "Gujarati"
};

/**
 * Transcribes audio file using Groq Whisper Large V3 or dynamic captured speech
 */
async function transcribeAudio(filePath, forcedLanguage = null, customApiKey = null, clientTranscript = null) {
  const client = getGroqClient(customApiKey);

  // If live Groq API Key is configured and we have an uploaded audio file
  if (client && filePath && fs.existsSync(filePath)) {
    try {
      const options = {
        file: fs.createReadStream(filePath),
        model: "whisper-large-v3",
        response_format: "verbose_json",
        temperature: 0
      };

      if (forcedLanguage) {
        options.language = forcedLanguage;
      }

      console.log("⚡ Transcribing live audio with Groq Whisper Large V3...");
      const transcription = await client.audio.transcriptions.create(options);
      const detectedLang = transcription.language || forcedLanguage || "en";

      return {
        language: detectedLang,
        languageName: languageNames[detectedLang] || detectedLang,
        text: transcription.text || "",
        duration: transcription.duration || 0,
        segments: transcription.segments || []
      };
    } catch (error) {
      console.error("Groq Whisper transcription error:", error.message);
      // If Groq fails (e.g. invalid key or network), fallback to client transcript if available
      if (clientTranscript) {
        return {
          language: forcedLanguage || "en",
          languageName: languageNames[forcedLanguage] || "English",
          text: clientTranscript,
          duration: 10,
          segments: []
        };
      }
      throw error;
    }
  }

  // If client provided live in-browser speech recognition transcript from their mic
  if (clientTranscript && clientTranscript.trim().length > 0) {
    console.log("🎤 Using live captured microphone transcript from browser speech engine.");
    const lang = forcedLanguage || "en";
    return {
      language: lang,
      languageName: languageNames[lang] || lang,
      text: clientTranscript.trim(),
      duration: 12.0,
      segments: []
    };
  }

  // Built-in sample presets
  return getMockTranscription(filePath, forcedLanguage);
}

/**
 * Translates audio file or text to English
 */
async function translateAudio(filePath, customApiKey = null, textToTranslate = null) {
  const client = getGroqClient(customApiKey);

  if (client && filePath && fs.existsSync(filePath)) {
    try {
      const translation = await client.audio.translations.create({
        file: fs.createReadStream(filePath),
        model: "whisper-large-v3",
        response_format: "json",
        temperature: 0
      });
      return translation.text || "";
    } catch (error) {
      console.warn("Whisper translation error:", error.message);
    }
  }

  if (textToTranslate) {
    return textToTranslate;
  }

  return "Yesterday night around 10:30 PM, unknown intruders broke into the residence and stole jewellery and cash. I request police investigation and immediate action.";
}

function getMockTranscription(filePath, forcedLanguage) {
  if (forcedLanguage === "ta") {
    return {
      language: "ta",
      languageName: "Tamil",
      text: "நேற்று இரவு சுமார் 10:30 மணியளவில் சென்னை அண்ணாநகர் 2-வது பிரதான சாலையில் உள்ள எனது வீட்டின் பின்பக்க பால்கனி பூட்டை உடைத்து உள்ளே புகுந்த மர்ம நபர்கள், பீரோவில் இருந்த 8 சவரன் தங்க நகைகள் மற்றும் ரூபாய் 45,000 ரொக்கப் பணத்தைத் திருடிச் சென்றுவிட்டனர். எனது பெயர் கே. சுப்பிரமணியம், வயது 48. குற்றவாளிகள் மீது உரிய நடவடிக்கை எடுக்க வேண்டுகிறேன்.",
      duration: 18.5,
      segments: []
    };
  }

  if (forcedLanguage === "hi") {
    return {
      language: "hi",
      languageName: "Hindi",
      text: "कल रात लगभग 8:30 बजे कनॉट प्लेस मेट्रो स्टेशन गेट नंबर 2 के पास दो अज्ञात लड़कों ने काली पल्सर मोटरसाइकिल पर आकर मुझे रोका, गाली-गलौज की और मारपीट करके मेरा पर्स और मोबाइल फोन छीन लिया। मेरा नाम राजेश शर्मा है, उम्र 34 वर्ष। कृपया इस मामले में उचित कार्रवाई करें।",
      duration: 16.2,
      segments: []
    };
  }

  return {
    language: "en",
    languageName: "English",
    text: "Yesterday night around 10:30 PM, unknown intruders broke the rear balcony lock of my residence at No. 14, 2nd Main Road, Anna Nagar, Chennai and stole 8 sovereigns of gold jewellery along with 45,000 rupees in cash. My name is K. Subramaniam, age 48. I request the police department to take necessary legal action.",
    duration: 17.8,
    segments: []
  };
}

module.exports = {
  transcribeAudio,
  translateAudio,
  getGroqClient,
  languageNames
};
