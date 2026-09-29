import os
from typing import Optional, Dict, Any
from groq import Groq

LANGUAGE_NAMES = {
    "ta": "Tamil",
    "hi": "Hindi",
    "en": "English",
    "te": "Telugu",
    "kn": "Kannada",
    "ml": "Malayalam",
    "mr": "Marathi",
    "bn": "Bengali",
    "gu": "Gujarati"
}

def get_groq_client(custom_key: Optional[str] = None) -> Optional[Groq]:
    api_key = custom_key or os.getenv("GROQ_API_KEY")
    if api_key:
        try:
            return Groq(api_key=api_key)
        except Exception as e:
            print("Groq Python initialization warning:", e)
    return None

async def transcribe_audio(
    file_path: Optional[str] = None,
    forced_language: Optional[str] = None,
    custom_api_key: Optional[str] = None,
    client_transcript: Optional[str] = None
) -> Dict[str, Any]:
    client = get_groq_client(custom_api_key)

    if client and file_path and os.path.exists(file_path):
        try:
            with open(file_path, "rb") as f:
                transcription = client.audio.transcriptions.create(
                    file=f,
                    model="whisper-large-v3",
                    response_format="verbose_json",
                    temperature=0,
                    language=forced_language if forced_language else None
                )
            
            detected_lang = getattr(transcription, "language", forced_language or "en")
            text = getattr(transcription, "text", "")
            duration = getattr(transcription, "duration", 0)

            return {
                "language": detected_lang,
                "languageName": LANGUAGE_NAMES.get(detected_lang, detected_lang),
                "text": text,
                "duration": duration,
                "segments": []
            }
        except Exception as e:
            print("Python Groq Whisper transcription error:", e)
            if client_transcript:
                return {
                    "language": forced_language or "en",
                    "languageName": LANGUAGE_NAMES.get(forced_language, "English"),
                    "text": client_transcript,
                    "duration": 10.0,
                    "segments": []
                }
            raise e

    if client_transcript and len(client_transcript.strip()) > 0:
        lang = forced_language or "en"
        return {
            "language": lang,
            "languageName": LANGUAGE_NAMES.get(lang, "English"),
            "text": client_transcript.strip(),
            "duration": 12.0,
            "segments": []
        }

    return get_mock_transcription(forced_language)

async def translate_audio(
    file_path: Optional[str] = None,
    custom_api_key: Optional[str] = None,
    text_to_translate: Optional[str] = None
) -> str:
    client = get_groq_client(custom_api_key)

    if client and file_path and os.path.exists(file_path):
        try:
            with open(file_path, "rb") as f:
                translation = client.audio.translations.create(
                    file=f,
                    model="whisper-large-v3",
                    response_format="json",
                    temperature=0
                )
            return getattr(translation, "text", "")
        except Exception as e:
            print("Python Whisper translation error:", e)

    if text_to_translate:
        return text_to_translate

    return "Yesterday night around 10:30 PM, unknown intruders broke into the residence and stole jewellery and cash. I request police investigation and immediate action."

def get_mock_transcription(forced_language: Optional[str]) -> Dict[str, Any]:
    if forced_language == "ta":
        return {
            "language": "ta",
            "languageName": "Tamil",
            "text": "நேற்று இரவு சுமார் 10:30 மணியளவில் சென்னை அண்ணாநகர் 2-வது பிரதான சாலையில் உள்ள எனது வீட்டின் பின்பக்க பால்கனி பூட்டை உடைத்து உள்ளே புகுந்த மர்ம நபர்கள், பீரோவில் இருந்த 8 சவரன் தங்க நகைகள் மற்றும் ரூபாய் 45,000 ரொக்கப் பணத்தைத் திருடிச் சென்றுவிட்டனர். எனது பெயர் கே. சுப்பிரமணியம், வயது 48. குற்றவாளிகள் மீது உரிய நடவடிக்கை எடுக்க வேண்டுகிறேன்.",
            "duration": 18.5,
            "segments": []
        }
    elif forced_language == "hi":
        return {
            "language": "hi",
            "languageName": "Hindi",
            "text": "कल रात लगभग 8:30 बजे कनॉट प्लेस मेट्रो स्टेशन गेट नंबर 2 के पास दो अज्ञात लड़कों ने काली पल्सर मोटरसाइकिल पर आकर मुझे रोका, गाली-गलौज की और मारपीट करके मेरा पर्स और मोबाइल फोन छीन लिया। मेरा नाम राजेश शर्मा है, उम्र 34 वर्ष। कृपया इस मामले में उचित कार्रवाई करें।",
            "duration": 16.2,
            "segments": []
        }
    return {
        "language": "en",
        "languageName": "English",
        "text": "Yesterday night around 10:30 PM, unknown intruders broke the rear balcony lock of my residence at No. 14, 2nd Main Road, Anna Nagar, Chennai and stole 8 sovereigns of gold jewellery along with 45,000 rupees in cash. My name is K. Subramaniam, age 48. I request the police department to take necessary legal action.",
        "duration": 17.8,
        "segments": []
    }
