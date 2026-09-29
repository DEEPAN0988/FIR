async function testNewDeepanStatement() {
  const statement = "Hello, my name is Deepan Nandakumar. I live in Tiruvarur near Tiruvarur bus stand, my phone number is 8015182880. On 19 Aug 2026 I saw 2 strangers roaming around in my house, I feel unsafe as my house has many valuables like 1 ton of gold, 2 silver, 3 ton of platinum.";
  
  const res = await fetch('http://localhost:5000/api/fir/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nativeTranscript: statement,
      englishTranscript: statement,
      language: 'en',
      languageName: 'English'
    })
  }).then(r => r.json());

  console.log('=== TEST RESULT FOR DEEPAN CASE ===');
  console.log('Complainant Name:', res.data.complainant.name);
  console.log('Contact Phone:', res.data.complainant.phone);
  console.log('Residential Address:', res.data.complainant.address);
  console.log('Incident Date:', res.data.incident.date);
  console.log('Incident Location:', res.data.incident.location);
  console.log('Crime Classification:', res.data.incident.crimeType);
  console.log('Statutory Sections:', res.data.sections);
  console.log('Property / Valuables:', JSON.stringify(res.data.property));
  console.log('\n--- TAMIL LEGAL NARRATIVE ---');
  console.log(res.data.narrative_ta);
}

testNewDeepanStatement().catch(console.error);
