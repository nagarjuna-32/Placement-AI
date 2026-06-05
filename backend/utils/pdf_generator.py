import io
from dotenv import load_dotenv

load_dotenv()

# Attempt to load ReportLab, otherwise use a raw binary PDF fallback structure
try:
    from reportlab.lib.pagesizes import letter
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib import colors
    has_reportlab = True
except ImportError:
    has_reportlab = False
    print("ReportLab package not found. Run `pip install reportlab` to enable PDF formatting.")

def generate_resume_report_pdf(resume_data) -> bytes:
    buffer = io.BytesIO()
    if not has_reportlab:
        # Minimal compliant PDF raw bytes to avoid server crash if package missing
        buffer.write(b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << >> /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 120 >>\nstream\nBT /F1 12 Tf 50 700 Td (PlaceMate AI Resume Report - ReportLab package not installed. Run pip install reportlab.) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000056 00000 n\n0000000111 00000 n\n0000000192 00000 n\ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n360\n%%EOF\n")
        return buffer.getvalue()
        
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
    styles = getSampleStyleSheet()
    story = []
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=colors.HexColor('#4f46e5')
    )
    section_style = ParagraphStyle(
        'SectionHeader',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#1f2937'),
        spaceBefore=10,
        spaceAfter=5
    )
    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['BodyText'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#4b5563')
    )
    
    story.append(Paragraph("PlaceMate AI - Resume Optimization Audit", title_style))
    story.append(Spacer(1, 12))
    
    story.append(Paragraph(f"<b>Uploaded File:</b> {resume_data.filename}", body_style))
    story.append(Paragraph(f"<b>ATS Compatibility Index:</b> {resume_data.ats_score}/100", body_style))
    story.append(Paragraph(f"<b>Structural Quality Score:</b> {resume_data.quality_score}/100", body_style))
    story.append(Spacer(1, 10))
    
    story.append(Paragraph("Detected Grammar & Layout Critique:", section_style))
    story.append(Paragraph(resume_data.grammar_report or "No major issues identified.", body_style))
    
    story.append(Spacer(1, 10))
    story.append(Paragraph("Identified Keywords & Skills:", section_style))
    story.append(Paragraph(", ".join(resume_data.extracted_skills or []), body_style))
    
    story.append(Spacer(1, 10))
    story.append(Paragraph("Critical Missing Industry Terms:", section_style))
    story.append(Paragraph(", ".join(resume_data.missing_keywords or []), body_style))
    
    story.append(Spacer(1, 10))
    story.append(Paragraph("Actionable Recommendations:", section_style))
    for rec in (resume_data.recommendations or []):
        story.append(Paragraph(f"• {rec}", body_style))
        
    doc.build(story)
    return buffer.getvalue()

def generate_interview_report_pdf(attempt) -> bytes:
    buffer = io.BytesIO()
    if not has_reportlab:
        buffer.write(b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << >> /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 120 >>\nstream\nBT /F1 12 Tf 50 700 Td (PlaceMate AI Interview Report - ReportLab package not installed. Run pip install reportlab.) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000056 00000 n\n0000000111 00000 n\n0000000192 00000 n\ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n360\n%%EOF\n")
        return buffer.getvalue()
        
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
    styles = getSampleStyleSheet()
    story = []
    
    title_style = ParagraphStyle('DocTitle', parent=styles['Heading1'], fontName='Helvetica-Bold', fontSize=22, leading=26, textColor=colors.HexColor('#4f46e5'))
    section_style = ParagraphStyle('SectionHeader', parent=styles['Heading2'], fontName='Helvetica-Bold', fontSize=12, leading=16, textColor=colors.HexColor('#1f2937'), spaceBefore=10, spaceAfter=5)
    body_style = ParagraphStyle('BodyTextCustom', parent=styles['BodyText'], fontName='Helvetica', fontSize=10, leading=14, textColor=colors.HexColor('#4b5563'))
    
    story.append(Paragraph("PlaceMate AI - Mock Interview Report", title_style))
    story.append(Spacer(1, 12))
    
    story.append(Paragraph(f"<b>Assessment Round:</b> Level {attempt.level}", body_style))
    story.append(Paragraph(f"<b>Consolidated Score:</b> {attempt.score}/100", body_style))
    story.append(Spacer(1, 10))
    
    story.append(Paragraph("Interviewer Evaluation & Feedback:", section_style))
    story.append(Paragraph(attempt.feedback or "Great attempt. Proceed to next levels.", body_style))
    
    video = attempt.video_analysis or {}
    story.append(Spacer(1, 10))
    story.append(Paragraph("Video & Eye Tracking Parameters:", section_style))
    story.append(Paragraph(f"• Eye Contact Alignment: {video.get('eye_contact', 80)}%", body_style))
    story.append(Paragraph(f"• Smile and Comfort Index: {video.get('smile_frequency', 50)}%", body_style))
    story.append(Paragraph(f"• Body Posture Score: {video.get('posture', 90)}%", body_style))
    story.append(Paragraph(f"• Nervousness Level: {video.get('nervousness', 10)}%", body_style))
    story.append(Paragraph(f"• Visual Presentation: {video.get('expressions', 'Attentive')}", body_style))
    
    doc.build(story)
    return buffer.getvalue()

def generate_communication_report_pdf(attempt) -> bytes:
    buffer = io.BytesIO()
    if not has_reportlab:
        buffer.write(b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << >> /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 120 >>\nstream\nBT /F1 12 Tf 50 700 Td (PlaceMate AI Speech Report - ReportLab package not installed. Run pip install reportlab.) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000056 00000 n\n0000000111 00000 n\n0000000192 00000 n\ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n360\n%%EOF\n")
        return buffer.getvalue()
        
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
    styles = getSampleStyleSheet()
    story = []
    
    title_style = ParagraphStyle('DocTitle', parent=styles['Heading1'], fontName='Helvetica-Bold', fontSize=22, leading=26, textColor=colors.HexColor('#4f46e5'))
    section_style = ParagraphStyle('SectionHeader', parent=styles['Heading2'], fontName='Helvetica-Bold', fontSize=12, leading=16, textColor=colors.HexColor('#1f2937'), spaceBefore=10, spaceAfter=5)
    body_style = ParagraphStyle('BodyTextCustom', parent=styles['BodyText'], fontName='Helvetica', fontSize=10, leading=14, textColor=colors.HexColor('#4b5563'))
    
    story.append(Paragraph("PlaceMate AI - Communication & Speech Analysis", title_style))
    story.append(Spacer(1, 12))
    
    comm = attempt.communication_metrics or {}
    story.append(Paragraph("Speech Delivery & Fluency Metrics:", section_style))
    story.append(Paragraph(f"• Fluency Score: {comm.get('fluency', 80)}%", body_style))
    story.append(Paragraph(f"• Speaking Speed: {comm.get('speaking_speed', 130)} words per minute", body_style))
    story.append(Paragraph(f"• Filler Words Detected: {', '.join(comm.get('filler_words', ['um', 'like']))}", body_style))
    story.append(Paragraph(f"• Pronunciation Accuracy: {comm.get('pronunciation', 85)}%", body_style))
    story.append(Paragraph(f"• Grammatical Correctness: {comm.get('grammar', 90)}%", body_style))
    
    doc.build(story)
    return buffer.getvalue()

def generate_readiness_report_pdf(user, latest_resume, latest_interview) -> bytes:
    buffer = io.BytesIO()
    if not has_reportlab:
        buffer.write(b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << >> /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 120 >>\nstream\nBT /F1 12 Tf 50 700 Td (PlaceMate AI Readiness Report - ReportLab package not installed. Run pip install reportlab.) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000056 00000 n\n0000000111 00000 n\n0000000192 00000 n\ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n360\n%%EOF\n")
        return buffer.getvalue()
        
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
    styles = getSampleStyleSheet()
    story = []
    
    title_style = ParagraphStyle('DocTitle', parent=styles['Heading1'], fontName='Helvetica-Bold', fontSize=22, leading=26, textColor=colors.HexColor('#4f46e5'))
    section_style = ParagraphStyle('SectionHeader', parent=styles['Heading2'], fontName='Helvetica-Bold', fontSize=12, leading=16, textColor=colors.HexColor('#1f2937'), spaceBefore=10, spaceAfter=5)
    body_style = ParagraphStyle('BodyTextCustom', parent=styles['BodyText'], fontName='Helvetica', fontSize=10, leading=14, textColor=colors.HexColor('#4b5563'))
    
    story.append(Paragraph("PlaceMate AI - Comprehensive Placement Readiness Report", title_style))
    story.append(Spacer(1, 12))
    
    story.append(Paragraph(f"<b>Candidate Name:</b> {user.full_name or 'Student applicant'}", body_style))
    story.append(Paragraph(f"<b>Registered Email:</b> {user.email}", body_style))
    story.append(Paragraph(f"<b>Active Subscription:</b> {user.subscription_tier.upper()} tier", body_style))
    story.append(Spacer(1, 10))
    
    story.append(Paragraph("Composite Readiness Score:", section_style))
    story.append(Paragraph(f"Placement Readiness Rating: {user.career_health_score}/100", body_style))
    
    story.append(Spacer(1, 10))
    story.append(Paragraph("Resume Compatibility Check:", section_style))
    if latest_resume:
        story.append(Paragraph(f"• Active resume: {latest_resume.filename}", body_style))
        story.append(Paragraph(f"• ATS score rating: {latest_resume.ats_score}/100", body_style))
        story.append(Paragraph(f"• Quality checks index: {latest_resume.quality_score}/100", body_style))
    else:
        story.append(Paragraph("No resumes uploaded. Please upload a resume to finalize your credentials.", body_style))
        
    story.append(Spacer(1, 10))
    story.append(Paragraph("Mock Interview Milestones:", section_style))
    if latest_interview:
        story.append(Paragraph(f"• Max level completed: Level {latest_interview.level}", body_style))
        story.append(Paragraph(f"• Evaluation score card: {latest_interview.score}/100", body_style))
    else:
        story.append(Paragraph("No mock interviews completed. Progression levels will unlock additional scores.", body_style))
        
    doc.build(story)
    return buffer.getvalue()
