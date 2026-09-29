async function runComprehensiveTestSuite() {
  console.log('===============================================================');
  console.log('🐍 TESTING PYTHON FASTAPI VOICEFIR SYSTEM');
  console.log('===============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log('  [PASS] ' + testName + (details ? ' (' + details + ')' : ''));
      passed++;
    } else {
      console.error('  [FAIL] ' + testName + (details ? ' -> ' + details : ''));
      failed++;
    }
  }

  // TEST 1: Backend Health & RAG Indexing
  console.log('--- 1. Python FastAPI Health & RAG Knowledge Base ---');
  try {
    const health = await fetch('http://localhost:5000/api/health').then(r => r.json());
    assert(health.status === 'online', 'Python FastAPI health check status is online', health.system);
    assert(health.ragIndexed === true, 'Python RAG Knowledge base is fully indexed');
  } catch (err) {
    assert(false, 'Python backend health check reachable', err.message);
  }

  // TEST 2: Officer Auth & Profile Endpoints
  console.log('\n--- 2. Officer Authentication & Profile Profiles ---');
  try {
    const officersRes = await fetch('http://localhost:5000/api/auth/officers').then(r => r.json());
    assert(officersRes.success && officersRes.data.length >= 3, 'Fetched available officer profiles', 'Count: ' + officersRes.data.length);
    
    const profileRes = await fetch('http://localhost:5000/api/auth/profile').then(r => r.json());
    assert(profileRes.success && profileRes.data.badgeNumber, 'Retrieved active officer badge', profileRes.data.name + ' [' + profileRes.data.badgeNumber + ']');
  } catch (err) {
    assert(false, 'Officer auth check', err.message);
  }

  // TEST 3: Multilingual Transcription & Translation Pipeline
  console.log('\n--- 3. Speech Transcription & Translation Pipeline ---');
  let createdTamilFirId = null;
  try {
    // 3A: Tamil Ingestion
    const taRes = await fetch('http://localhost:5000/api/transcription/transcribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sampleType: 'ta', language: 'ta' })
    }).then(r => r.json());
    assert(taRes.success && taRes.language === 'ta', 'Tamil audio transcription succeeded', 'Language: ' + taRes.languageName);
    assert(taRes.englishTranscript && taRes.englishTranscript.length > 20, 'Parallel English translation generated');

    // 3B: Hindi Ingestion
    const hiRes = await fetch('http://localhost:5000/api/transcription/transcribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sampleType: 'hi', language: 'hi' })
    }).then(r => r.json());
    assert(hiRes.success && hiRes.language === 'hi', 'Hindi audio transcription succeeded', 'Language: ' + hiRes.languageName);

    // 3C: Live Client Transcript Ingestion
    const clientSpokenText = 'My name is Dr. Ramesh Kumar. Yesterday at 11 PM near Anna Arch, my laptop bag containing Dell laptop and 15,000 cash was stolen by two unknown persons on a bike.';
    const customRes = await fetch('http://localhost:5000/api/transcription/transcribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientTranscript: clientSpokenText, language: 'en' })
    }).then(r => r.json());
    assert(customRes.success && customRes.nativeTranscript.includes('Ramesh Kumar'), 'Custom live speech transcript captured verbatim');
  } catch (err) {
    assert(false, 'Transcription pipeline check', err.message);
  }

  // TEST 4: Structured FIR Generation & Anti-Hallucination
  console.log('\n--- 4. Python LLM Legal Structuring & Anti-Hallucination ---');
  try {
    const firGen = await fetch('http://localhost:5000/api/fir/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nativeTranscript: 'நேற்று இரவு சுமார் 10:30 மணியளவில் சென்னை அண்ணாநகர் 2-வது பிரதான சாலையில் உள்ள எனது வீட்டின் பின்பக்க பால்கனி பூட்டை உடைத்து உள்ளே புகுந்த மர்ம நபர்கள், பீரோவில் இருந்த 8 சவரன் தங்க நகைகள் மற்றும் ரூபாய் 45,000 ரொக்கப் பணத்தைத் திருடிச் சென்றுவிட்டனர்.',
        englishTranscript: 'Yesterday night around 10:30 PM, unknown intruders broke the rear balcony lock of my residence at No. 14, 2nd Main Road, Anna Nagar, Chennai and stole 8 sovereigns of gold jewellery along with 45,000 rupees in cash. My name is K. Subramaniam, age 48.',
        language: 'ta',
        languageName: 'Tamil'
      })
    }).then(r => r.json());

    assert(firGen.success, 'FIR Generation API returned success');
    const fir = firGen.data;
    createdTamilFirId = fir.firId;
    assert(fir.complainant && fir.complainant.name === 'K. Subramaniam', 'Extracted Complainant name correctly', fir.complainant.name);
    assert(fir.incident && fir.incident.crimeType, 'Categorized Crime Type', fir.incident.crimeType);
    assert(fir.property && fir.property.length > 0, 'Extracted Stolen Property items', 'Count: ' + fir.property.length);
    assert(fir.sections && fir.sections.length > 0, 'Recommended statutory penal sections', fir.sections.join(', '));
    assert(fir.status === 'draft' && fir.verified === false, 'New FIR starts in unverified DRAFT status');
  } catch (err) {
    assert(false, 'FIR Generation check', err.message);
  }

  // TEST 5: FIR CRUD & Field Editing
  console.log('\n--- 5. FIR Case Management & Police Field Editing ---');
  try {
    const listRes = await fetch('http://localhost:5000/api/fir').then(r => r.json());
    assert(listRes.success && listRes.data.length >= 3, 'Listed all FIR records in database', 'Total: ' + listRes.data.length);
    assert(listRes.stats && typeof listRes.stats.total === 'number', 'Calculated dashboard metrics', 'Total: ' + listRes.stats.total + ', Drafts: ' + listRes.stats.drafts);

    const getRes = await fetch('http://localhost:5000/api/fir/' + createdTamilFirId).then(r => r.json());
    assert(getRes.success && getRes.data.firId === createdTamilFirId, 'Retrieved specific FIR by ID', createdTamilFirId);

    // Edit field: Update complainant contact phone
    const updateRes = await fetch('http://localhost:5000/api/fir/' + createdTamilFirId, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        complainant: {
          ...getRes.data.complainant,
          phone: '+91 94440 99999'
        }
      })
    }).then(r => r.json());
    assert(updateRes.success && updateRes.data.complainant.phone === '+91 94440 99999', 'Police officer field update persisted', updateRes.data.complainant.phone);
  } catch (err) {
    assert(false, 'FIR CRUD check', err.message);
  }

  // TEST 6: Official Police Approval & Digital Sign-off
  console.log('\n--- 6. Police Officer Verification & Sign-off ---');
  try {
    const approveRes = await fetch('http://localhost:5000/api/fir/' + createdTamilFirId + '/approve', {
      method: 'POST'
    }).then(r => r.json());

    assert(approveRes.success, 'FIR Approval API executed');
    assert(approveRes.data.status === 'approved' && approveRes.data.verified === true, 'Case marked verified & officially approved');
    assert(approveRes.data.verifiedBy && approveRes.data.verifiedBy.name, 'Officer seal & credentials stamped', approveRes.data.verifiedBy.name + ' [' + approveRes.data.verifiedBy.badgeNumber + ']');
  } catch (err) {
    assert(false, 'FIR Approval check', err.message);
  }

  // TEST 7: Multilingual PDF Document Generation
  console.log('\n--- 7. Multilingual ReportLab PDF Document Generation ---');
  try {
    // English PDF
    const enPdf = await fetch('http://localhost:5000/api/fir/' + createdTamilFirId + '/pdf?language=en');
    assert(enPdf.status === 200 && enPdf.headers.get('content-type') === 'application/pdf', 'Generated English ReportLab PDF (200 OK)');

    // Tamil PDF
    const taPdf = await fetch('http://localhost:5000/api/fir/' + createdTamilFirId + '/pdf?language=ta');
    assert(taPdf.status === 200 && taPdf.headers.get('content-type') === 'application/pdf', 'Generated Tamil ReportLab PDF (200 OK)');

    // Hindi PDF
    const hiPdf = await fetch('http://localhost:5000/api/fir/' + createdTamilFirId + '/pdf?language=hi');
    assert(hiPdf.status === 200 && hiPdf.headers.get('content-type') === 'application/pdf', 'Generated Hindi ReportLab PDF (200 OK)');
  } catch (err) {
    assert(false, 'PDF Generation check', err.message);
  }

  // SUMMARY
  console.log('\n===============================================================');
  console.log('PYTHON FASTAPI SUMMARY: ' + passed + ' PASSED, ' + failed + ' FAILED');
  if (failed === 0) {
    console.log('ALL PYTHON SYSTEM MODULES ARE FUNCTIONING 100% CORRECTLY!');
  } else {
    console.log('Some tests encountered issues.');
  }
  console.log('===============================================================');
}

runComprehensiveTestSuite().catch(console.error);
