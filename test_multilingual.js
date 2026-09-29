async function testMultilingualGeneration() {
  const statement = "Hi, my name is Deepan. When I was near my hometown I noticed 2 strange people was following me continuously and they tried to snatch my purse and finally they took my purse and went away. I couldn't identify them because they were going towards the mosque.";
  
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

  console.log('=== MULTILINGUAL GENERATED NARRATIVES ===');
  console.log('ENGLISH NARRATIVE:');
  console.log(res.data.narrative);
  console.log('\nTAMIL NARRATIVE (narrative_ta):');
  console.log(res.data.narrative_ta);
  console.log('\nHINDI NARRATIVE (narrative_hi):');
  console.log(res.data.narrative_hi);
}

testMultilingualGeneration().catch(console.error);
