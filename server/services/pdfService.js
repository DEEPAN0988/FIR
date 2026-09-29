const PDFDocument = require("pdfkit");

/**
 * Creates an official formatted First Information Report (FIR) PDF
 * @param {Object} fir - The structured FIR object
 * @param {string} language - "en" | "ta" | "hi"
 * @param {Object} officer - Reviewing/Approving Police Officer details
 * @returns {PDFDocument} - PDF stream
 */
function generateFIRPDF(fir, language = "en", officer = {}) {
  const doc = new PDFDocument({
    size: "A4",
    margin: 40,
    info: {
      Title: `FIR-${fir.firId || "DRAFT"}.pdf`,
      Author: "VoiceFIR Automated Police System",
      Subject: "Official First Information Report",
      Keywords: "FIR, Police, Legal, Crime Report"
    }
  });

  const primaryColor = "#0f172a"; // Deep Slate/Navy
  const secondaryColor = "#1e3a8a"; // Police Blue
  const accentGold = "#b45309"; // Gold Seal
  const textDark = "#1e293b";
  const textMuted = "#475569";
  const borderColor = "#cbd5e1";

  // --- HEADER SECTION ---
  doc.rect(40, 40, 515, 75).fillAndStroke("#f8fafc", secondaryColor);

  doc.fontSize(16).fillColor(secondaryColor).font("Helvetica-Bold")
     .text("FIRST INFORMATION REPORT (F.I.R.)", 50, 50, { align: "center" });

  doc.fontSize(9).fillColor(textMuted).font("Helvetica")
     .text("(Under Section 154 Cr.P.C. / Section 173 Bharatiya Nagarik Suraksha Sanhita - BNSS)", 50, 70, { align: "center" });

  doc.fontSize(10).fillColor(primaryColor).font("Helvetica-Bold")
     .text(`STATE POLICE DEPARTMENT - ${fir.district ? fir.district.toUpperCase() : "METROPOLITAN POLICE"}`, 50, 85, { align: "center" });

  doc.moveDown(3);

  // --- METADATA BAR ---
  const startY = 125;
  doc.rect(40, startY, 515, 45).fillAndStroke("#f1f5f9", borderColor);

  doc.fontSize(9).fillColor(textDark).font("Helvetica-Bold");
  doc.text(`1. FIR No: `, 50, startY + 8);
  doc.font("Helvetica").text(fir.firId || "FIR-2026-DRAFT", 100, startY + 8);

  doc.font("Helvetica-Bold").text(`Police Station: `, 250, startY + 8);
  doc.font("Helvetica").text(fir.policeStation || "Central Station", 330, startY + 8);

  doc.font("Helvetica-Bold").text(`Date & Time: `, 50, startY + 25);
  doc.font("Helvetica").text(fir.registeredAt || new Date().toLocaleString(), 120, startY + 25);

  doc.font("Helvetica-Bold").text(`Status: `, 250, startY + 25);
  const statusColor = fir.verified ? "#15803d" : "#b45309";
  doc.fillColor(statusColor).font("Helvetica-Bold").text(fir.verified ? "APPROVED & REGISTERED" : "PRELIMINARY DRAFT", 295, startY + 25);

  // Helper function for section banners
  let currentY = startY + 55;

  function renderSectionHeader(title) {
    if (currentY > 720) {
      doc.addPage();
      currentY = 45;
    }
    doc.rect(40, currentY, 515, 18).fill(secondaryColor);
    doc.fontSize(9).fillColor("#ffffff").font("Helvetica-Bold").text(title, 46, currentY + 4);
    currentY += 24;
  }

  function renderRow(label, value) {
    if (currentY > 730) {
      doc.addPage();
      currentY = 45;
    }
    doc.fontSize(8.5).font("Helvetica-Bold").fillColor(textDark).text(label, 48, currentY, { width: 140 });
    doc.font("Helvetica").fillColor(textDark).text(value || "Not stated", 195, currentY, { width: 350 });
    currentY += 15;
  }

  // --- 2. ACTS & SECTIONS ---
  renderSectionHeader("2. ACTS & STATUTORY SECTIONS");
  const sectionsList = (fir.sections && fir.sections.length > 0)
    ? fir.sections.join(", ")
    : "Sections under verification by Investigating Officer";
  renderRow("Penal Sections:", sectionsList);
  currentY += 4;

  // --- 3. OCCURRENCE OF OFFENCE ---
  renderSectionHeader("3. OCCURRENCE OF OFFENCE & INFORMATION RECEIVED");
  renderRow("Crime Category:", fir.incident ? fir.incident.crimeType : "Cognizable Offence");
  renderRow("Date of Occurrence:", fir.incident ? fir.incident.date : "Not stated");
  renderRow("Time of Occurrence:", fir.incident ? fir.incident.time : "Not stated");
  renderRow("Place of Occurrence:", fir.incident ? fir.incident.location : "Not stated");
  currentY += 4;

  // --- 4. COMPLAINANT DETAILS ---
  renderSectionHeader("4. COMPLAINANT / INFORMANT DETAILS");
  const comp = fir.complainant || {};
  renderRow("Full Name:", comp.name);
  renderRow("Father / Spouse Name:", comp.fatherOrHusbandName);
  renderRow("Age / Gender:", comp.age ? `${comp.age} Years` : "Not stated");
  renderRow("Residential Address:", comp.address);
  renderRow("Contact Number:", comp.phone);
  currentY += 4;

  // --- 5. ACCUSED DETAILS ---
  renderSectionHeader("5. DETAILS OF KNOWN / SUSPECTED / UNKNOWN ACCUSED");
  if (fir.accused && fir.accused.length > 0) {
    fir.accused.forEach((acc, idx) => {
      renderRow(`Accused #${idx + 1} Name:`, acc.name);
      renderRow(`Description / Alias:`, acc.description);
      renderRow(`Relation to Victim:`, acc.relationship);
      currentY += 2;
    });
  } else {
    renderRow("Accused Particulars:", "Unknown person(s) - Subject to police investigation");
  }
  currentY += 4;

  // --- 6. PROPERTY / EVIDENCE ---
  renderSectionHeader("6. PROPERTIES INVOLVED & EVIDENCE RECORDED");
  if (fir.property && fir.property.length > 0) {
    fir.property.forEach((p, idx) => {
      renderRow(`Property #${idx + 1}:`, `${p.item || "Item"} | Value: ${p.value || "Not stated"} | ${p.description || ""}`);
    });
  } else {
    renderRow("Stolen / Damaged Property:", "Nil / Not applicable");
  }

  if (fir.evidence && fir.evidence.length > 0) {
    renderRow("Material / Digital Evidence:", fir.evidence.join("; "));
  } else {
    renderRow("Evidence Material:", "Physical inspection / CCTV analysis under process");
  }
  currentY += 4;

  // --- 7. FIRST INFORMATION CONTENTS / STATEMENT ---
  renderSectionHeader("7. STATEMENT & NARRATIVE OF THE COMPLAINANT");
  let narrativeText = fir.narrative || "No statement recorded.";
  if (language === "ta" && fir.narrative_ta) {
    narrativeText = `[English Translation]\n${fir.narrative}\n\n[தமிழ் வாக்குமூலம் / Tamil Statement]\n${fir.narrative_ta}`;
  } else if (language === "hi" && fir.narrative_hi) {
    narrativeText = `[English Translation]\n${fir.narrative}\n\n[हिंदी बयान / Hindi Statement]\n${fir.narrative_hi}`;
  }

  if (currentY > 640) {
    doc.addPage();
    currentY = 45;
  }

  doc.fontSize(8.5).font("Helvetica").fillColor(textDark)
     .text(narrativeText, 48, currentY, { width: 500, align: "justify" });

  currentY += doc.heightOfString(narrativeText, { width: 500 }) + 15;

  // --- 8. POLICE VERIFICATION & SEAL ---
  if (currentY > 650) {
    doc.addPage();
    currentY = 45;
  }

  doc.rect(40, currentY, 515, 80).stroke(borderColor);

  doc.fontSize(8.5).font("Helvetica-Bold").fillColor(secondaryColor)
     .text("POLICE VERIFICATION & STATION HOUSE OFFICER APPROVAL", 48, currentY + 8);

  const offName = officer.name || (fir.verifiedBy ? fir.verifiedBy.name : "Inspecting Duty Officer");
  const offRank = officer.rank || (fir.verifiedBy ? fir.verifiedBy.rank : "Inspector of Police");
  const offBadge = officer.badgeNumber || (fir.verifiedBy ? fir.verifiedBy.badgeNumber : "TN-POL-772");
  const offStation = officer.station || fir.policeStation || "Central PS";

  doc.fontSize(8).font("Helvetica").fillColor(textDark)
     .text(`Recorded & Structured by: VoiceFIR AI Pipeline (Whisper Large V3 + RAG + LLM)`, 48, currentY + 24)
     .text(`Verified & Signed by: ${offName}, ${offRank} [Badge: ${offBadge}]`, 48, currentY + 38)
     .text(`Station: ${offStation} | Jurisdiction: ${fir.district || "City Police"}`, 48, currentY + 52)
     .text(`Digital Verification Timestamp: ${fir.verifiedAt || new Date().toISOString()}`, 48, currentY + 64);

  doc.rect(420, currentY + 12, 120, 56).stroke(accentGold);
  doc.fontSize(7.5).fillColor(accentGold).font("Helvetica-Bold")
     .text("OFFICIAL SEAL", 420, currentY + 20, { width: 120, align: "center" })
     .text("VERIFIED BY POLICE", 420, currentY + 34, { width: 120, align: "center" })
     .text(fir.verified ? "[ DIGITALLY SIGNED ]" : "[ PENDING SIGNATURE ]", 420, currentY + 48, { width: 120, align: "center" });

  return doc;
}

module.exports = {
  generateFIRPDF
};
