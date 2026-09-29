from services.pdf_service import generate_fir_pdf

mock_fir = {
    'firId': 'FIR-2026-0005',
    'policeStation': 'Anna Nagar Police Station (K-4)',
    'district': 'Chennai City Police',
    'language': 'ta',
    'complainant': {'name': 'Deepan Nandkumar', 'age': '24', 'phone': '9841012345', 'address': 'No. 12, Main St'},
    'incident': {'crimeType': 'Snatching & Theft', 'date': '2026-08-21', 'time': '12:30 hrs', 'location': 'Near Hometown'},
    'sections': ['IPC 356', 'IPC 379', 'BNS 304(1)'],
    'narrative': 'The complainant Deepan Nandkumar states that two unknown persons snatched his purse and went away towards the mosque.',
    'narrative_ta': 'புகார்தாரர் Deepan Nandkumar அளித்த வாக்குமூலம்: "வணக்கம், என் பெயர் தீபன். எனது சொந்த ஊருக்கு அருகில் 2 பேர் என்னைப் பின்தொடர்ந்து எனது பணப்பையை பறித்துக்கொண்டு சென்றனர்.". முதல் தகவல் அறிக்கை பதிவு செய்யப்பட்டது.',
    'narrative_hi': 'शिकायतकर्ता Deepan Nandkumar द्वारा दर्ज बयान: "नमस्ते, मेरा नाम दीपन है। मेरे गृहनगर के पास दो लोगों ने मेरा पर्स छीन लिया और चले गए।"। प्राथमिकी दर्ज की गई।',
    'verified': True,
    'verifiedAt': '2026-08-21'
}

pdf_ta = generate_fir_pdf(mock_fir, language='ta')
print('Tamil PDF bytes generated:', len(pdf_ta.getvalue()))

pdf_hi = generate_fir_pdf(mock_fir, language='hi')
print('Hindi PDF bytes generated:', len(pdf_hi.getvalue()))

with open('test_tamil_output.pdf', 'wb') as f:
    f.write(pdf_ta.getvalue())
print('Wrote test_tamil_output.pdf successfully')
