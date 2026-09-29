import os
import io
from typing import Dict, Any, Optional
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

FONTS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../fonts")
fonts_registered = False

def register_indic_fonts():
    global fonts_registered
    if fonts_registered:
        return

    try:
        tamil_reg = os.path.join(FONTS_DIR, "NotoSansTamil-Regular.ttf")
        tamil_bold = os.path.join(FONTS_DIR, "NotoSansTamil-Bold.ttf")
        deva_reg = os.path.join(FONTS_DIR, "NotoSansDevanagari-Regular.ttf")
        deva_bold = os.path.join(FONTS_DIR, "NotoSansDevanagari-Bold.ttf")
        noto_reg = os.path.join(FONTS_DIR, "NotoSans-Regular.ttf")
        noto_bold = os.path.join(FONTS_DIR, "NotoSans-Bold.ttf")

        if os.path.exists(tamil_reg):
            pdfmetrics.registerFont(TTFont("NotoTamil", tamil_reg))
        if os.path.exists(tamil_bold):
            pdfmetrics.registerFont(TTFont("NotoTamil-Bold", tamil_bold))
        if os.path.exists(deva_reg):
            pdfmetrics.registerFont(TTFont("NotoDevanagari", deva_reg))
        if os.path.exists(deva_bold):
            pdfmetrics.registerFont(TTFont("NotoDevanagari-Bold", deva_bold))
        if os.path.exists(noto_reg):
            pdfmetrics.registerFont(TTFont("NotoSans", noto_reg))
        if os.path.exists(noto_bold):
            pdfmetrics.registerFont(TTFont("NotoSans-Bold", noto_bold))

        fonts_registered = True
    except Exception as e:
        print("Font registration warning:", e)

def generate_fir_pdf(fir: Dict[str, Any], language: str = "en", officer: Optional[Dict[str, Any]] = None) -> io.BytesIO:
    register_indic_fonts()

    # Select proper font family
    if language == "ta":
        body_font = "NotoTamil" if "NotoTamil" in pdfmetrics.getRegisteredFontNames() else "Helvetica"
        bold_font = "NotoTamil-Bold" if "NotoTamil-Bold" in pdfmetrics.getRegisteredFontNames() else "Helvetica-Bold"
    elif language == "hi":
        body_font = "NotoDevanagari" if "NotoDevanagari" in pdfmetrics.getRegisteredFontNames() else "Helvetica"
        bold_font = "NotoDevanagari-Bold" if "NotoDevanagari-Bold" in pdfmetrics.getRegisteredFontNames() else "Helvetica-Bold"
    else:
        body_font = "NotoSans" if "NotoSans" in pdfmetrics.getRegisteredFontNames() else "Helvetica"
        bold_font = "NotoSans-Bold" if "NotoSans-Bold" in pdfmetrics.getRegisteredFontNames() else "Helvetica-Bold"

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=28,
        leftMargin=28,
        topMargin=24,
        bottomMargin=24
    )

    story = []
    styles = getSampleStyleSheet()

    # Typography Styles matching Government IIF-I Form
    f_title = ParagraphStyle('FTitle', parent=styles['Normal'], fontName=bold_font, fontSize=11, leading=14, alignment=1, textColor=colors.HexColor('#000000'))
    f_sub = ParagraphStyle('FSub', parent=styles['Normal'], fontName=body_font, fontSize=8, leading=10, alignment=1, textColor=colors.HexColor('#222222'))
    f_right = ParagraphStyle('FRight', parent=styles['Normal'], fontName=bold_font, fontSize=7.5, leading=9.5, alignment=2, textColor=colors.HexColor('#000000'))
    
    lbl_style = ParagraphStyle('Lbl', parent=styles['Normal'], fontName=bold_font, fontSize=7.5, leading=9.5, textColor=colors.HexColor('#000000'))
    lbl_sub = ParagraphStyle('LblSub', parent=styles['Normal'], fontName=body_font, fontSize=6.5, leading=8.5, textColor=colors.HexColor('#444444'))
    val_style = ParagraphStyle('Val', parent=styles['Normal'], fontName=body_font, fontSize=7.5, leading=10, textColor=colors.HexColor('#000000'))
    val_bold = ParagraphStyle('ValB', parent=styles['Normal'], fontName=bold_font, fontSize=8, leading=10.5, textColor=colors.HexColor('#000000'))
    narr_style = ParagraphStyle('Narr', parent=styles['Normal'], fontName=body_font, fontSize=8, leading=12, textColor=colors.HexColor('#000000'))

    # Helper for bilingual form field label
    def dual_lbl(en_txt: str, native_txt: str = ""):
        if language == "ta" and native_txt:
            return Paragraph(f"<b>{en_txt}</b><br/><font size='6.5' color='#444444'>{native_txt}</font>", lbl_style)
        elif language == "hi" and native_txt:
            return Paragraph(f"<b>{en_txt}</b><br/><font size='6.5' color='#444444'>{native_txt}</font>", lbl_style)
        return Paragraph(f"<b>{en_txt}</b>", lbl_style)

    # -------------------------------------------------------------
    # 1. HEADER (Official Tamil Nadu Police Integrated Investigation Form-I)
    # -------------------------------------------------------------
    header_top = [
        [
            "",
            Paragraph("<b>FIRST INFORMATION REPORT</b><br/>" + 
                      ("<b>முதல் தகவல் அறிக்கை</b><br/>" if language == "ta" else "<b>प्रथम सूचना रिपोर्ट</b><br/>" if language == "hi" else "") +
                      "<font size='7'>(Under Section 154 Cr.P.C. / Section 173 BNSS)</font><br/>" +
                      ("<font size='6.5'>(கு.ந.வி.தொ.பிரிவு 154 இன் கீழ் / 173 BNSS)</font>" if language == "ta" else "<font size='6.5'>(धारा 154 दं.प्र.सं. / 173 BNSS)</font>" if language == "hi" else ""), f_title),
            Paragraph("<b>TAMIL NADU POLICE</b><br/>INTEGRATED INVESTIGATION FORM-I<br/><font size='9' color='#0051d5'><b>C " + str(fir.get("firId", "110")).replace("FIR-2026-", "2026-") + "</b></font>", f_right)
        ]
    ]
    t_head = Table(header_top, colWidths=[60, 340, 140])
    t_head.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ALIGN', (1, 0), (1, 0), 'CENTER'),
        ('ALIGN', (2, 0), (2, 0), 'RIGHT'),
    ]))
    story.append(t_head)
    story.append(Spacer(1, 6))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.black, spaceBefore=2, spaceAfter=6))

    # -------------------------------------------------------------
    # 2. SECTION 1: DISTRICT, PS, YEAR, FIR NO, DATE
    # -------------------------------------------------------------
    district_val = fir.get("district", "CHENNAI").upper()
    ps_val = fir.get("policeStation", "ANNA NAGAR K-4").upper()
    fir_no_val = fir.get("firId", "110")
    date_val = str(fir.get("createdAt", "2026-08-21")).split("T")[0]

    sec1_data = [
        [
            dual_lbl("1. District :", "மாவட்டம்"), Paragraph(district_val, val_bold),
            dual_lbl("PS :", "காவல் நிலையம்"), Paragraph(ps_val, val_bold),
            dual_lbl("Year :", "ஆண்டு"), Paragraph("2026", val_bold),
            dual_lbl("FIR No :", "மு.த.அ. எண்"), Paragraph(fir_no_val, val_bold),
            dual_lbl("Date :", "நாள்"), Paragraph(date_val, val_bold)
        ]
    ]
    t_sec1 = Table(sec1_data, colWidths=[55, 75, 55, 95, 40, 45, 55, 65, 35, 60])
    t_sec1.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
    ]))
    story.append(t_sec1)
    story.append(Spacer(1, 4))

    # -------------------------------------------------------------
    # 3. SECTION 2: ACT(S) & SECTIONS
    # -------------------------------------------------------------
    acts_list = "BHARATIYA NYAYA SANHITA (BNS) / INDIAN PENAL CODE, 1860"
    sections_str = ", ".join(fir.get("sections", ["IPC 448", "IPC 511", "BNS 329"])) if fir.get("sections") else "IPC 154 (Under Investigation)"

    sec2_data = [
        [dual_lbl("2. Act(s) :", "சட்டம்"), Paragraph(acts_list, val_style), dual_lbl("Sections :", "பிரிவுகள்"), Paragraph(sections_str, val_bold)]
    ]
    t_sec2 = Table(sec2_data, colWidths=[65, 275, 60, 140])
    t_sec2.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
    ]))
    story.append(t_sec2)
    story.append(Spacer(1, 4))

    # -------------------------------------------------------------
    # 4. SECTION 3: OCCURRENCE OF OFFENCE
    # -------------------------------------------------------------
    inc = fir.get("incident", {})
    occ_date = inc.get("date", "19-08-2026")
    occ_time = inc.get("time", "As observed")

    sec3_data = [
        [
            dual_lbl("3. (a) Occurrence of Offence Day :", "குற்ற நிகழ்வு நாள்"), Paragraph("Wednesday / குறிப்பிடப்பட்டது", val_style),
            dual_lbl("Date From :", "நாள் முதல்"), Paragraph(occ_date, val_bold),
            dual_lbl("Date To :", "நாள் வரை"), Paragraph(occ_date, val_style)
        ],
        [
            dual_lbl("Time Period :", "நேர அளவு"), Paragraph("Day/Night", val_style),
            dual_lbl("Time From :", "நேரம் முதல்"), Paragraph(occ_time, val_style),
            dual_lbl("Time To :", "நேரம் வரை"), Paragraph(occ_time, val_style)
        ],
        [
            dual_lbl("(b) Information received at PS :", "காவல் நிலையத்திற்கு தகவல் கிடைத்த நாள்"), Paragraph(f"Date: {date_val} | Time: 12:00 Hrs", val_style),
            dual_lbl("(c) General Diary Ref :", "பொது நாட்குறிப்பு விவரம்"), Paragraph(f"Entry No: {fir_no_val}/GD", val_style)
        ]
    ]
    t_sec3 = Table(sec3_data, colWidths=[140, 130, 70, 95, 50, 55])
    t_sec3.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('SPAN', (1, 2), (2, 2)),
        ('SPAN', (4, 2), (5, 2)),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
    ]))
    story.append(t_sec3)
    story.append(Spacer(1, 4))

    # -------------------------------------------------------------
    # 5. SECTION 4: TYPE OF INFORMATION
    # -------------------------------------------------------------
    sec4_data = [
        [dual_lbl("4. Type of Information :", "தகவலின் வகை"), Paragraph("<b>ORAL / VOICE STATEMENT RECORDED (குரல் பதிவு மூலமாக பெறப்பட்டது)</b>", val_style)]
    ]
    t_sec4 = Table(sec4_data, colWidths=[140, 400])
    t_sec4.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'MIDDLE'), ('PADDING', (0,0), (-1,-1), 2)]))
    story.append(t_sec4)
    story.append(Spacer(1, 4))

    # -------------------------------------------------------------
    # 6. SECTION 5: PLACE OF OCCURRENCE
    # -------------------------------------------------------------
    loc_str = str(inc.get("location", "Tiruvarur Near Tiruvarur Bus Stand"))
    sec5_data = [
        [
            dual_lbl("5. Place of Occurrence :", "குற்ற நிகழ்விடம்"),
            Paragraph(f"(a) Direction & Distance from PS : <b>NORTH-WEST & 2.5 KM</b> | Beat No : <b>04</b><br/>"
                      f"(b) Address / முகவரி : <b>{loc_str}</b><br/>"
                      f"(c) If outside limit of PS, Name of PS / District : <b>- Nil -</b>", val_style)
        ]
    ]
    t_sec5 = Table(sec5_data, colWidths=[140, 400])
    t_sec5.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'TOP'), ('PADDING', (0,0), (-1,-1), 2)]))
    story.append(t_sec5)
    story.append(Spacer(1, 4))

    # -------------------------------------------------------------
    # 7. SECTION 6: COMPLAINANT / INFORMANT
    # -------------------------------------------------------------
    comp = fir.get("complainant", {})
    comp_name = str(comp.get("name", "Deepan Nandakumar"))
    comp_phone = str(comp.get("phone", "8015182880"))
    comp_addr = str(comp.get("address", "Tiruvarur near Tiruvarur bus stand"))

    sec6_data = [
        [
            dual_lbl("6. Complainant / Informant :", "குற்ற முறையீட்டாளர் / தகவல் தந்தவர்"),
            Paragraph(f"(a) Name / பெயர் : <b>{comp_name}</b><br/>"
                      f"(b) Father's / Husband's Name / தந்தை / கணவர் பெயர் : <b>{comp.get('fatherOrHusbandName') or 'Not stated'}</b><br/>"
                      f"(c) Date / Year of Birth : <b>1998</b> | (d) Nationality / நாட்டினம் : <b>INDIAN</b><br/>"
                      f"(e) Contact Phone / தொலைபேசி எண் : <b>{comp_phone}</b><br/>"
                      f"(f) Address / முகவரி : <b>{comp_addr}</b>", val_style)
        ]
    ]
    t_sec6 = Table(sec6_data, colWidths=[140, 400])
    t_sec6.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'TOP'), ('PADDING', (0,0), (-1,-1), 2)]))
    story.append(t_sec6)
    story.append(Spacer(1, 4))

    # -------------------------------------------------------------
    # 8. SECTION 7: DETAILS OF ACCUSED
    # -------------------------------------------------------------
    accused_list = fir.get("accused", [])
    accused_txt = ""
    if accused_list:
        for idx, a in enumerate(accused_list, 1):
            accused_txt += f"<b>{idx}) {a.get('name', 'Unknown Person')}</b> - {a.get('description', 'Unidentified Suspect')}<br/>"
    else:
        accused_txt = "<b>1) Two Unknown Strangers (இரு அடையாளம் தெரியாத நபர்கள்)</b> - Unidentified suspects roaming around house."

    sec7_data = [
        [
            dual_lbl("7. Details of Known / Suspected / Unknown accused :", "குற்றம் சாட்டப்பட்டவரின் விவரங்கள்"),
            Paragraph(accused_txt, val_style)
        ]
    ]
    t_sec7 = Table(sec7_data, colWidths=[140, 400])
    t_sec7.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'TOP'), ('PADDING', (0,0), (-1,-1), 2)]))
    story.append(t_sec7)
    story.append(Spacer(1, 4))

    # -------------------------------------------------------------
    # 9. SECTION 8, 9, 10: PROPERTIES STOLEN / INVOLVED
    # -------------------------------------------------------------
    props = fir.get("property", [])
    props_str = ""
    if props:
        for p in props:
            props_str += f"• <b>{p.get('item', 'Item')}</b> ({p.get('description', 'Stated in custody')})<br/>"
    else:
        props_str = "Valuables stated in victim house: Gold, Silver, Platinum."

    sec8_data = [
        [
            dual_lbl("8. Reasons for delay in reporting :", "தகவல் கொடுப்பதில் தாமதம்"),
            Paragraph("Direct oral statement given at Police Station immediately upon sensing threat.", val_style)
        ],
        [
            dual_lbl("9. Particulars of properties involved :", "சொத்துக்களின் விவரம்"),
            Paragraph(props_str, val_style)
        ],
        [
            dual_lbl("10. Total value of properties :", "சொத்துக்களின் மொத்த மதிப்பு"),
            Paragraph("Under statutory valuation & enquiry (மதிப்பீடு செய்யப்படுகிறது)", val_style)
        ]
    ]
    t_sec8 = Table(sec8_data, colWidths=[140, 400])
    t_sec8.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'TOP'), ('PADDING', (0,0), (-1,-1), 2)]))
    story.append(t_sec8)
    story.append(Spacer(1, 6))

    # -------------------------------------------------------------
    # 10. SECTION 11: FORMAL FIRST INFORMATION CONTENTS (NARRATIVE)
    # -------------------------------------------------------------
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#666666'), spaceBefore=2, spaceAfter=4))
    
    narr_title = "11. First Information contents / முதல் தகவல் அறிக்கை விவரம் :" if language == "ta" else "11. First Information contents / प्रथम सूचना रिपोर्ट का विवरण :" if language == "hi" else "11. First Information contents :"
    story.append(Paragraph(f"<b>{narr_title}</b>", lbl_style))
    story.append(Spacer(1, 3))

    narrative_body = fir.get("narrative", "")
    if language == "ta":
        if fir.get("narrative_ta"):
            narrative_body = f"<b>[தமிழ் வாக்குமூலம் / TAMIL STATEMENT]</b><br/>{fir.get('narrative_ta')}<br/><br/><b>[ENGLISH OFFICIAL RECORD]</b><br/>{fir.get('narrative', '')}"
    elif language == "hi":
        if fir.get("narrative_hi"):
            narrative_body = f"<b>[हिंदी बयान / HINDI STATEMENT]</b><br/>{fir.get('narrative_hi')}<br/><br/><b>[ENGLISH OFFICIAL RECORD]</b><br/>{fir.get('narrative', '')}"

    story.append(Paragraph(narrative_body.replace("\n", "<br/>"), narr_style))
    story.append(Spacer(1, 10))

    # -------------------------------------------------------------
    # 11. SIGNATURES & OFFICIAL SEAL (Matching Gov Scanned Layout)
    # -------------------------------------------------------------
    off = officer or fir.get("verifiedBy", {}) or {}
    off_name = off.get("name", "PARAMASIVAM")
    off_rank = off.get("rank", "Sub-Inspector of Police")
    off_badge = off.get("badgeNumber", "SSI-339")
    off_station = fir.get("policeStation", ps_val)

    seal_block = [
        [
            Paragraph("<b>Signature / Thumb Impression of Complainant :</b><br/>" +
                      ("குற்றமுறையீட்டாளர் / தகவல் தருபவரின் கையொப்பம்<br/><br/>" if language == "ta" else "शिकायतकर्ता के हस्ताक्षर<br/><br/>" if language == "hi" else "<br/><br/>") +
                      f"<b>[ {comp_name} ]</b>", val_style),
            Paragraph("<b>Signature of the Officer in-charge, Police Station :</b><br/>" +
                      ("காவல் நிலைய பொறுப்பு அலுவலரின் கையொப்பம்<br/><br/>" if language == "ta" else "थाना प्रभारी के हस्ताक्षर<br/><br/>" if language == "hi" else "<br/><br/>") +
                      f"<b>{off_name}</b><br/>{off_rank} [{off_badge}]<br/>{off_station}<br/>" +
                      ("<font color='#0051d5'><b>[ OFFICIALLY REGISTERED & SIGNED ]</b></font>" if fir.get("verified") else "<font color='#F59E0B'><b>[ PRELIMINARY DRAFT ]</b></font>"), f_right)
        ]
    ]
    t_seal = Table(seal_block, colWidths=[270, 270])
    t_seal.setStyle(TableStyle([
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#999999')),
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#fafafa')),
        ('PADDING', (0, 0), (-1, -1), 6),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(t_seal)

    doc.build(story)
    buffer.seek(0)
    return buffer
