const fs = require("fs");
const { transcribeAudio, translateAudio } = require("../services/whisperService");

async function handleTranscription(req, res) {
  try {
    let filePath = null;
    const forcedLang = req.body.language || null;
    const customApiKey = req.headers["x-groq-api-key"] || req.body.groqApiKey || null;
    const clientTranscript = req.body.clientTranscript || null;

    if (req.file) {
      filePath = req.file.path;
    }

    if (!filePath && !req.body.sampleType && !clientTranscript) {
      return res.status(400).json({
        success: false,
        error: "No audio file, client transcript, or sample type provided"
      });
    }

    // 1. Multilingual Transcription
    const transcription = await transcribeAudio(
      filePath, 
      forcedLang || req.body.sampleType, 
      customApiKey, 
      clientTranscript
    );
    
    // 2. English Translation
    let englishTranslation = "";
    if (transcription.language === "en") {
      englishTranslation = transcription.text;
    } else {
      englishTranslation = await translateAudio(filePath, customApiKey, transcription.text);
    }

    // Cleanup uploaded file safely
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (cleanupErr) {
        console.warn("Failed to remove temp upload file:", cleanupErr.message);
      }
    }

    res.json({
      success: true,
      language: transcription.language,
      languageName: transcription.languageName,
      nativeTranscript: transcription.text,
      englishTranscript: englishTranslation,
      duration: transcription.duration
    });
  } catch (error) {
    console.error("Transcription controller error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Audio transcription pipeline failed"
    });
  }
}

module.exports = {
  handleTranscription
};
