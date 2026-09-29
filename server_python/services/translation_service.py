import os
import json
import urllib.request
import urllib.parse
from typing import Optional
from .whisper_service import get_groq_client

async def translate_text(text: str, target_lang: str, custom_api_key: Optional[str] = None) -> str:
    if not text or not text.strip():
        return ""

    cleaned_text = text.strip()

    # 1. Try Groq LLM if API key available
    client = get_groq_client(custom_api_key)
    if client:
        try:
            target_name = "Tamil" if target_lang == "ta" else "Hindi" if target_lang == "hi" else "English"
            prompt = f"""
Translate the following statement accurately into {target_name}.
Preserve all names, numbers, phone numbers, locations, dates, and factual details exactly as stated.
Do not summarize, add, remove, or change any facts. Output ONLY the translated text.

Statement:
\"\"\"
{cleaned_text}
\"\"\"
"""
            completion = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": "You are a precise, factual multilingual translator. You translate text directly without modifying any facts or adding commentary."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.0
            )
            res = completion.choices[0].message.content.strip()
            if res:
                return res.replace('"', '').strip()
        except Exception as e:
            print("Groq LLM translation fallback notice:", e)

    # 2. Neural Translation API (Factual, direct sentence-by-sentence translation)
    try:
        url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl={target_lang}&dt=t&q=" + urllib.parse.quote(cleaned_text)
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=8) as response:
            data = json.loads(response.read().decode('utf-8'))
            translated_pieces = [piece[0] for piece in data[0] if piece[0]]
            direct_translation = "".join(translated_pieces).strip()
            if direct_translation:
                return direct_translation
    except Exception as err:
        print("Neural translation error:", err)

    return cleaned_text
