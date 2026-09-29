async function testExactUserCase() {
  const statement = "Hi, my name is Deepan. When I was near my hometown I noticed 2 strange people was following me continuously and they tried to snatch my purse and finally they took my purse and went away. I couldn't identify them because they were going mosque.";
  
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

  console.log('=== EXTRACTED FIR RESULTS FOR USER CASE ===');
  console.log('Complainant Name:', res.data.complainant.name);
  console.log('Complainant Address:', res.data.complainant.address);
  console.log('Crime Type:', res.data.incident.crimeType);
  console.log('Incident Location:', res.data.incident.location);
  console.log('Stolen Property:', JSON.stringify(res.data.property));
  console.log('Accused Details:', JSON.stringify(res.data.accused));
  console.log('Penal Sections:', res.data.sections);
}

testExactUserCase().catch(console.error);
