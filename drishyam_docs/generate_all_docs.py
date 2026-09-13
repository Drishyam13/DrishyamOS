#!/usr/bin/env python3
"""
Drishyam - Complete Development Documentation Generator
Generates separate professional PDFs for all required documents.
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch, mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor, white, black
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY, TA_RIGHT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, 
    PageBreak, HRFlowable, ListFlowable, ListItem, KeepTogether, Preformatted
)
from reportlab.lib import colors
from datetime import datetime
import os

OUTPUT_DIR = "/home/workdir/artifacts/drishyam_docs"

# Colors
PRIMARY = HexColor('#0A2540')
ACCENT = HexColor('#1565C0')
SUCCESS = HexColor('#2E7D32')
WARNING = HexColor('#F9A825')
DANGER = HexColor('#C62828')
LIGHT_BG = HexColor('#F5F7FA')
LIGHT_BLUE = HexColor('#E3F2FD')
LIGHT_GREEN = HexColor('#E8F5E9')
GRAY = HexColor('#546E7A')
DARK = HexColor('#263238')
CODE_BG = HexColor('#263238')

def get_styles():
    styles = getSampleStyleSheet()
    
    styles.add(ParagraphStyle(name='DocTitle', fontName='Helvetica-Bold', fontSize=22, textColor=PRIMARY, alignment=TA_CENTER, spaceAfter=8, leading=26))
    styles.add(ParagraphStyle(name='DocSubtitle', fontName='Helvetica', fontSize=11, textColor=GRAY, alignment=TA_CENTER, spaceAfter=6, leading=14))
    styles.add(ParagraphStyle(name='Section', fontName='Helvetica-Bold', fontSize=14, textColor=PRIMARY, spaceBefore=16, spaceAfter=8, leading=18))
    styles.add(ParagraphStyle(name='SubSection', fontName='Helvetica-Bold', fontSize=11, textColor=ACCENT, spaceBefore=10, spaceAfter=5, leading=14))
    styles.add(ParagraphStyle(name='Body', fontName='Helvetica', fontSize=9, textColor=DARK, alignment=TA_JUSTIFY, spaceBefore=2, spaceAfter=5, leading=12))
    styles.add(ParagraphStyle(name='BulletText', fontName='Helvetica', fontSize=9, textColor=DARK, leftIndent=12, spaceBefore=1, spaceAfter=2, leading=11.5))
    styles.add(ParagraphStyle(name='CodeBlock', fontName='Courier', fontSize=7.5, textColor=DARK, backColor=LIGHT_BG, leftIndent=5, rightIndent=5, spaceBefore=3, spaceAfter=3, leading=10))
    styles.add(ParagraphStyle(name='TableHeader', fontName='Helvetica-Bold', fontSize=8, textColor=white, alignment=TA_CENTER, leading=10))
    styles.add(ParagraphStyle(name='TableCell', fontName='Helvetica', fontSize=8, textColor=DARK, leading=10))
    styles.add(ParagraphStyle(name='Small', fontName='Helvetica', fontSize=8, textColor=GRAY, alignment=TA_CENTER))
    styles.add(ParagraphStyle(name='Highlight', fontName='Helvetica-Bold', fontSize=9, textColor=SUCCESS, spaceBefore=4, spaceAfter=4))
    styles.add(ParagraphStyle(name='Warning', fontName='Helvetica-Bold', fontSize=9, textColor=DANGER, spaceBefore=4, spaceAfter=4))
    styles.add(ParagraphStyle(name='Label', fontName='Helvetica-Bold', fontSize=9, textColor=PRIMARY, spaceBefore=6, spaceAfter=2))
    return styles

def header_footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(ACCENT)
    canvas.setLineWidth(1.2)
    canvas.line(0.6*inch, A4[1] - 0.45*inch, A4[0] - 0.6*inch, A4[1] - 0.45*inch)
    canvas.setFont('Helvetica', 7.5)
    canvas.setFillColor(GRAY)
    canvas.drawString(0.6*inch, A4[1] - 0.35*inch, "Drishyam – Real-time AI Surveillance | Confidential")
    canvas.setStrokeColor(HexColor('#E0E0E0'))
    canvas.setLineWidth(0.5)
    canvas.line(0.6*inch, 0.5*inch, A4[0] - 0.6*inch, 0.5*inch)
    canvas.setFont('Helvetica', 7.5)
    canvas.drawString(0.6*inch, 0.32*inch, f"{datetime.now().strftime('%d %b %Y')}")
    canvas.drawRightString(A4[0] - 0.6*inch, 0.32*inch, f"Page {doc.page}")
    canvas.restoreState()

def make_table(data, col_widths):
    style = TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.4, HexColor('#B0BEC5')),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('BACKGROUND', (0, 1), (-1, -1), LIGHT_BG),
    ])
    for i in range(1, len(data)):
        if i % 2 == 0:
            style.add('BACKGROUND', (0, i), (-1, i), white)
    t = Table(data, colWidths=col_widths, repeatRows=1)
    t.setStyle(style)
    return t

def cover_page(story, styles, title, subtitle, doc_id):
    story.append(Spacer(1, 1.8*inch))
    story.append(Paragraph("DRISHYAM", styles['DocTitle']))
    story.append(Paragraph("From Footage to Action", styles['DocSubtitle']))
    story.append(Spacer(1, 0.25*inch))
    story.append(HRFlowable(width="50%", thickness=2, color=ACCENT, spaceBefore=5, spaceAfter=15, hAlign='CENTER'))
    story.append(Paragraph(title, styles['DocTitle']))
    story.append(Paragraph(subtitle, styles['DocSubtitle']))
    story.append(Spacer(1, 0.4*inch))
    story.append(Paragraph(f"Document ID: {doc_id}", styles['Small']))
    story.append(Paragraph(f"Version: 1.0 | {datetime.now().strftime('%d %B %Y')}", styles['Small']))
    story.append(Paragraph("Confidential – For Development Use Only", styles['Small']))
    story.append(PageBreak())

# ============================================================
# 1. PRD
# ============================================================
def generate_prd():
    styles = get_styles()
    story = []
    cover_page(story, styles, "Product Requirements Document (PRD)", "Real-time AI Surveillance Platform", "DRISHYAM-PRD-001")
    
    story.append(Paragraph("1. Product Overview", styles['Section']))
    story.append(Paragraph(
        "Drishyam is a real-time AI-powered video surveillance platform that converts passive CCTV cameras into an active security system. "
        "It continuously analyzes live video streams, detects threats (weapons, violence, intrusion, suspicious behavior), triggers immediate alerts, "
        "and enables rapid response — moving from “footage” to “action” within seconds.",
        styles['Body']
    ))
    
    story.append(Paragraph("2. Problem Statement", styles['Section']))
    story.append(Paragraph(
        "Traditional CCTV systems only record events. Human operators suffer attention decay after ~20 minutes. Motion-based alerts generate 90–98% false alarms. "
        "By the time a real threat is noticed, the incident is often over. Security teams waste resources, and preventable crimes continue under cameras.",
        styles['Body']
    ))
    
    story.append(Paragraph("3. Target Users & Personas", styles['Section']))
    story.append(Paragraph("<b>Primary:</b>", styles['Label']))
    story.append(Paragraph("• Facility / Security Managers (mid-market commercial, industrial, warehouses, schools, hospitals)", styles['BulletText']))
    story.append(Paragraph("• Security Operators / Control Room Staff", styles['BulletText']))
    story.append(Paragraph("• Organization Admins (multi-site businesses)", styles['BulletText']))
    story.append(Paragraph("<b>Secondary:</b>", styles['Label']))
    story.append(Paragraph("• Business Owners / CFOs (ROI & cost control)", styles['BulletText']))
    story.append(Paragraph("• System Integrators / Installers", styles['BulletText']))
    story.append(Paragraph("• Government / Smart City operators (later phase)", styles['BulletText']))
    
    story.append(Paragraph("4. Core Value Proposition", styles['Section']))
    story.append(Paragraph("• Detect real threats in < 2–5 seconds on live streams", styles['BulletText']))
    story.append(Paragraph("• Reduce false alarms by 80–95% compared to motion detection", styles['BulletText']))
    story.append(Paragraph("• Deliver verified alerts with evidence clips to the right people instantly", styles['BulletText']))
    story.append(Paragraph("• Work with existing IP cameras (camera-agnostic where possible)", styles['BulletText']))
    story.append(Paragraph("• Privacy-first design (edge processing options, face blur, DPDP alignment)", styles['BulletText']))
    
    story.append(Paragraph("5. Feature List (Prioritized)", styles['Section']))
    
    story.append(Paragraph("5.1 MVP (Must Have)", styles['SubSection']))
    mvp_features = [
        "Live RTSP/ONVIF camera ingestion (multi-camera)",
        "Real-time AI detection: Weapon (gun/knife), Violence/Fight, Intrusion / Zone breach, Loitering",
        "Confidence scoring + false-positive filtering",
        "Instant alert generation with short evidence clip (5–15 sec)",
        "Push notification + in-app alert feed (Web + Mobile)",
        "Alert acknowledgment + basic status workflow (New → Acknowledged → Resolved)",
        "Simple multi-tenant organization + site + camera hierarchy",
        "Basic dashboard: live grid, alert list, camera health",
        "User roles: Org Admin, Site Manager, Operator, Viewer",
        "Privacy blur option for faces in stored clips",
        "Audit log of alerts and user actions",
    ]
    for f in mvp_features:
        story.append(Paragraph(f"• {f}", styles['BulletText']))
    
    story.append(Paragraph("5.2 Phase 2 (Should Have)", styles['SubSection']))
    for f in ["Facial recognition (blacklist / VIP) with explicit consent & compliance controls", "Crowd density & traffic monitoring", "Natural language search on historical events", "Automated response actions (trigger alarm, lock door via IoT, PA announcement)", "Multi-site unified view & reporting", "Mobile app with live view + two-way audio", "Advanced analytics & heatmaps"]:
        story.append(Paragraph(f"• {f}", styles['BulletText']))
    
    story.append(Paragraph("5.3 Future", styles['SubSection']))
    for f in ["SOS / Medical emergency detection", "Fire / smoke / environmental hazard detection", "Full IoT automation (lights, power cut, access control)", "Public announcement integration", "Predictive risk scoring"]:
        story.append(Paragraph(f"• {f}", styles['BulletText']))
    
    story.append(Paragraph("6. High-Level User Flows", styles['Section']))
    story.append(Paragraph("<b>Operator Alert Flow:</b> Alert appears → Operator opens clip → Reviews context → Acknowledges / Escalates / Marks False Positive → System learns (optional feedback loop)", styles['Body']))
    story.append(Paragraph("<b>Admin Setup Flow:</b> Create Org → Add Site → Add Cameras (RTSP/ONVIF) → Configure Detection Zones & Rules → Invite Users → Go Live", styles['Body']))
    story.append(Paragraph("<b>Incident Response Flow:</b> Threat detected → Alert + Clip generated → Notified users → Optional automated action → Evidence stored → Report generated", styles['Body']))
    
    story.append(Paragraph("7. Business Rules", styles['Section']))
    rules = [
        "Only users belonging to an organization can see that organization’s cameras and alerts.",
        "Alerts are scoped to the site/camera the user has permission for.",
        "False-positive feedback can be used to improve model thresholds (opt-in).",
        "Clips older than configured retention period are auto-deleted (default 30 days, configurable).",
        "High-severity alerts (weapon, violence) cannot be auto-dismissed.",
        "All sensitive actions (user invite, camera delete, role change) are audit-logged.",
        "Edge inference is preferred; cloud fallback only when edge is unavailable or for heavy models.",
    ]
    for r in rules:
        story.append(Paragraph(f"• {r}", styles['BulletText']))
    
    story.append(Paragraph("8. MVP Scope (In / Out)", styles['Section']))
    story.append(Paragraph("<b>IN:</b> Real-time detection of 4 core classes, alerting, evidence clips, basic multi-tenant dashboard, roles, privacy blur, RTSP ingestion.", styles['Body']))
    story.append(Paragraph("<b>OUT (MVP):</b> Full facial recognition, complex IoT actuation, advanced search, white-label, offline-first mobile, public API marketplace, multi-language UI.", styles['Body']))
    
    story.append(Paragraph("9. Success Metrics (MVP)", styles['Section']))
    for m in ["Detection latency < 5 seconds (end-to-end)", "False positive rate < 10% on core classes in pilot environments", "Alert-to-acknowledgment median time < 60 seconds", "Pilot-to-paid conversion ≥ 40%", "System uptime ≥ 99.5% for ingestion + detection"]:
        story.append(Paragraph(f"• {m}", styles['BulletText']))
    
    story.append(Paragraph("10. Assumptions & Dependencies", styles['Section']))
    for a in ["Customers have existing IP cameras with RTSP/ONVIF support", "Network bandwidth sufficient for at least low-resolution analysis streams", "Edge devices (or capable cameras) available for production deployments", "Team can fine-tune models on Indian-context video data"]:
        story.append(Paragraph(f"• {a}", styles['BulletText']))
    
    doc = SimpleDocTemplate(f"{OUTPUT_DIR}/01_PRD_Product_Requirements.pdf", pagesize=A4,
                            rightMargin=0.6*inch, leftMargin=0.6*inch, topMargin=0.6*inch, bottomMargin=0.6*inch)
    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
    print("Generated: 01_PRD_Product_Requirements.pdf")

# ============================================================
# 2. SRS
# ============================================================
def generate_srs():
    styles = get_styles()
    story = []
    cover_page(story, styles, "Software Requirements Specification (SRS)", "Functional & Non-Functional Requirements", "DRISHYAM-SRS-001")
    
    story.append(Paragraph("1. Introduction", styles['Section']))
    story.append(Paragraph("This document specifies the functional and non-functional requirements for the Drishyam real-time AI surveillance platform. It serves as the contract between product and engineering.", styles['Body']))
    
    story.append(Paragraph("2. Functional Requirements", styles['Section']))
    
    story.append(Paragraph("2.1 Camera & Stream Management", styles['SubSection']))
    for r in [
        "FR-CAM-01: System shall support RTSP and ONVIF camera discovery/addition.",
        "FR-CAM-02: System shall maintain continuous health status (online/offline/degraded) for each camera.",
        "FR-CAM-03: System shall allow configuration of analysis resolution and FPS per camera or site.",
        "FR-CAM-04: System shall support at least 50 concurrent streams per edge node (MVP target).",
        "FR-CAM-05: System shall allow defining polygonal detection zones on camera views.",
    ]:
        story.append(Paragraph(r, styles['BulletText']))
    
    story.append(Paragraph("2.2 AI Detection Engine", styles['SubSection']))
    for r in [
        "FR-AI-01: System shall detect the following classes in real time: Weapon (firearm/knife), Violence/Fight, Intrusion (zone breach), Loitering.",
        "FR-AI-02: Each detection shall carry a confidence score (0–1).",
        "FR-AI-03: System shall apply temporal filtering (minimum frames / duration) to reduce transient false positives.",
        "FR-AI-04: System shall generate a short evidence clip (configurable 5–15 seconds) around the detection timestamp.",
        "FR-AI-05: System shall support per-site / per-camera enable/disable of detection classes and confidence thresholds.",
        "FR-AI-06: System shall preferentially run inference on edge devices; fall back to cloud only when necessary.",
    ]:
        story.append(Paragraph(r, styles['BulletText']))
    
    story.append(Paragraph("2.3 Alerting & Notification", styles['SubSection']))
    for r in [
        "FR-ALT-01: On confirmed detection, system shall create an Alert record with severity, type, camera, timestamp, confidence, and clip reference.",
        "FR-ALT-02: System shall push real-time notification via WebSocket to all eligible online users.",
        "FR-ALT-03: System shall send push notification (FCM/APNs) to mobile devices of eligible users.",
        "FR-ALT-04: Alert severity levels: Critical (weapon/violence), High (intrusion), Medium (loitering), Low (info).",
        "FR-ALT-05: Users shall be able to Acknowledge, Escalate, Mark False Positive, or Resolve an alert.",
        "FR-ALT-06: System shall record time-to-acknowledge and time-to-resolve metrics.",
    ]:
        story.append(Paragraph(r, styles['BulletText']))
    
    story.append(Paragraph("2.4 User & Organization Management", styles['SubSection']))
    for r in [
        "FR-USR-01: Multi-tenant hierarchy: Organization → Site(s) → Camera(s).",
        "FR-USR-02: Roles: SuperAdmin (platform), OrgAdmin, SiteManager, Operator, Viewer.",
        "FR-USR-03: Permissions are role-based and optionally scope-limited to specific sites.",
        "FR-USR-04: OrgAdmin can invite users by email and assign roles.",
        "FR-USR-05: All authentication actions and privilege changes are audit-logged.",
    ]:
        story.append(Paragraph(r, styles['BulletText']))
    
    story.append(Paragraph("2.5 Dashboard & Visualization", styles['SubSection']))
    for r in [
        "FR-UI-01: Live camera grid view with status indicators.",
        "FR-UI-02: Real-time alert feed with filtering by severity, site, type, status.",
        "FR-UI-03: Single alert detail view with video clip player, timeline, and action buttons.",
        "FR-UI-04: Basic reporting: alerts over time, false-positive rate, response times.",
    ]:
        story.append(Paragraph(r, styles['BulletText']))
    
    story.append(Paragraph("3. Non-Functional Requirements", styles['Section']))
    
    story.append(Paragraph("3.1 Performance", styles['SubSection']))
    for r in [
        "NFR-PERF-01: End-to-end detection latency (frame → alert) ≤ 5 seconds for 95th percentile under normal load.",
        "NFR-PERF-02: Alert notification delivery ≤ 1 second after alert creation for online WebSocket clients.",
        "NFR-PERF-03: Dashboard initial load ≤ 3 seconds on standard broadband.",
        "NFR-PERF-04: System shall support at least 200 concurrent cameras across edge nodes in MVP architecture.",
    ]:
        story.append(Paragraph(r, styles['BulletText']))
    
    story.append(Paragraph("3.2 Reliability & Availability", styles['SubSection']))
    for r in [
        "NFR-REL-01: Target uptime 99.5% for core ingestion + detection path.",
        "NFR-REL-02: Camera disconnection shall be detected within 30 seconds and surfaced as health event.",
        "NFR-REL-03: Alert and clip data shall be durably stored; no silent loss of Critical alerts.",
    ]:
        story.append(Paragraph(r, styles['BulletText']))
    
    story.append(Paragraph("3.3 Security", styles['SubSection']))
    for r in [
        "NFR-SEC-01: All API traffic over TLS 1.2+.",
        "NFR-SEC-02: Authentication via JWT (access + refresh) or session tokens.",
        "NFR-SEC-03: Role-based access control enforced on every protected endpoint.",
        "NFR-SEC-04: Secrets (DB, API keys, model endpoints) stored in environment / secret manager, never in code.",
        "NFR-SEC-05: Input validation and output encoding to prevent injection attacks.",
        "NFR-SEC-06: Clip access requires authentication and authorization; signed short-lived URLs preferred.",
    ]:
        story.append(Paragraph(r, styles['BulletText']))
    
    story.append(Paragraph("3.4 Privacy & Compliance", styles['SubSection']))
    for r in [
        "NFR-PRI-01: Face blur option available for stored clips (configurable per organization).",
        "NFR-PRI-02: Data retention configurable; default 30 days for clips.",
        "NFR-PRI-03: Design aligned with DPDP principles (purpose limitation, minimal retention, auditability).",
        "NFR-PRI-04: Prefer edge processing to keep raw video local when possible.",
    ]:
        story.append(Paragraph(r, styles['BulletText']))
    
    story.append(Paragraph("3.5 Scalability", styles['SubSection']))
    story.append(Paragraph("Architecture shall allow horizontal scaling of edge inference nodes and backend services independently. Database and object storage shall support growth to tens of thousands of cameras over time.", styles['Body']))
    
    story.append(Paragraph("4. Roles & Permissions Matrix (Summary)", styles['Section']))
    perm_data = [
        [Paragraph("<b>Action</b>", styles['TableHeader']), Paragraph("<b>OrgAdmin</b>", styles['TableHeader']),
         Paragraph("<b>SiteMgr</b>", styles['TableHeader']), Paragraph("<b>Operator</b>", styles['TableHeader']),
         Paragraph("<b>Viewer</b>", styles['TableHeader'])],
        [Paragraph("Manage Org / Users", styles['TableCell']), Paragraph("Yes", styles['TableCell']),
         Paragraph("No", styles['TableCell']), Paragraph("No", styles['TableCell']), Paragraph("No", styles['TableCell'])],
        [Paragraph("Add/Edit Cameras", styles['TableCell']), Paragraph("Yes", styles['TableCell']),
         Paragraph("Own sites", styles['TableCell']), Paragraph("No", styles['TableCell']), Paragraph("No", styles['TableCell'])],
        [Paragraph("Configure Detection Rules", styles['TableCell']), Paragraph("Yes", styles['TableCell']),
         Paragraph("Own sites", styles['TableCell']), Paragraph("No", styles['TableCell']), Paragraph("No", styles['TableCell'])],
        [Paragraph("View Live + Alerts", styles['TableCell']), Paragraph("Yes", styles['TableCell']),
         Paragraph("Yes", styles['TableCell']), Paragraph("Yes", styles['TableCell']), Paragraph("Yes", styles['TableCell'])],
        [Paragraph("Acknowledge / Resolve Alerts", styles['TableCell']), Paragraph("Yes", styles['TableCell']),
         Paragraph("Yes", styles['TableCell']), Paragraph("Yes", styles['TableCell']), Paragraph("No", styles['TableCell'])],
        [Paragraph("Mark False Positive", styles['TableCell']), Paragraph("Yes", styles['TableCell']),
         Paragraph("Yes", styles['TableCell']), Paragraph("Yes", styles['TableCell']), Paragraph("No", styles['TableCell'])],
        [Paragraph("View Audit Logs", styles['TableCell']), Paragraph("Yes", styles['TableCell']),
         Paragraph("Limited", styles['TableCell']), Paragraph("No", styles['TableCell']), Paragraph("No", styles['TableCell'])],
    ]
    story.append(make_table(perm_data, [2.0*inch, 1.1*inch, 1.1*inch, 1.1*inch, 1.0*inch]))
    
    story.append(Paragraph("5. Error Handling Principles", styles['Section']))
    for e in [
        "All API errors return structured JSON with code, message, and optional details.",
        "Camera stream failures generate health events, not silent drops.",
        "AI inference failures on a single frame/stream do not crash the pipeline; they are logged and skipped.",
        "Critical alerts that fail to deliver push notification are retried with exponential backoff.",
        "User-facing errors are human-readable; internal details go to logs only.",
    ]:
        story.append(Paragraph(f"• {e}", styles['BulletText']))
    
    story.append(Paragraph("6. Validations", styles['Section']))
    for v in [
        "Camera RTSP URL format and reachability checked on add/update.",
        "Email format and uniqueness within organization for invites.",
        "Role assignment only to valid roles for the tenant.",
        "Detection zone coordinates must form a valid polygon within frame bounds.",
        "Confidence threshold inputs clamped to [0.1, 0.99].",
    ]:
        story.append(Paragraph(f"• {v}", styles['BulletText']))
    
    doc = SimpleDocTemplate(f"{OUTPUT_DIR}/02_SRS_Software_Requirements.pdf", pagesize=A4,
                            rightMargin=0.6*inch, leftMargin=0.6*inch, topMargin=0.6*inch, bottomMargin=0.6*inch)
    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
    print("Generated: 02_SRS_Software_Requirements.pdf")

# ============================================================
# 3. Architecture Document
# ============================================================
def generate_architecture():
    styles = get_styles()
    story = []
    cover_page(story, styles, "System Architecture Document", "High-level Design for Real-time Operation", "DRISHYAM-ARCH-001")
    
    story.append(Paragraph("1. Architecture Goals", styles['Section']))
    for g in ["Real-time detection with low latency", "Camera-agnostic ingestion (RTSP/ONVIF)", "Prefer edge inference for cost, privacy, and resilience", "Multi-tenant isolation", "Horizontal scalability of inference and backend", "Observability and auditability"]:
        story.append(Paragraph(f"• {g}", styles['BulletText']))
    
    story.append(Paragraph("2. High-Level Components", styles['Section']))
    
    story.append(Paragraph("2.1 Edge Layer", styles['SubSection']))
    story.append(Paragraph(
        "Edge Node / Gateway (or AI-capable camera): Ingests RTSP streams, runs optimized detection models (YOLO-based + custom heads for weapon/violence), applies temporal filtering, generates event candidates + short clips, and forwards confirmed events + metadata to the cloud backend via secure channel. Can operate with limited connectivity (store-and-forward for critical events).",
        styles['Body']
    ))
    
    story.append(Paragraph("2.2 Backend Services", styles['SubSection']))
    story.append(Paragraph("• API Gateway / Backend (REST + WebSocket): Authentication, authorization, camera/site/org management, alert lifecycle, user management.", styles['BulletText']))
    story.append(Paragraph("• Ingestion & Event Service: Receives events from edge, persists alerts, triggers notifications.", styles['BulletText']))
    story.append(Paragraph("• Notification Service: WebSocket fan-out, FCM/APNs push, optional email/SMS.", styles['BulletText']))
    story.append(Paragraph("• Media Service: Stores and serves evidence clips (object storage + signed URLs).", styles['BulletText']))
    story.append(Paragraph("• Optional Cloud Inference Service: Heavy models or fallback when edge is unavailable.", styles['BulletText']))
    
    story.append(Paragraph("2.3 Data Layer", styles['SubSection']))
    story.append(Paragraph("• PostgreSQL: Primary relational store (orgs, users, sites, cameras, alerts, audit logs, configs).", styles['BulletText']))
    story.append(Paragraph("• Redis: Real-time presence, pub/sub for WebSocket, short-lived caches, rate limiting.", styles['BulletText']))
    story.append(Paragraph("• Object Storage (S3-compatible): Evidence clips and optional thumbnails.", styles['BulletText']))
    
    story.append(Paragraph("2.4 Frontend", styles['SubSection']))
    story.append(Paragraph("• Web Dashboard (React / Next.js): Live grid, alert management, configuration, reporting.", styles['BulletText']))
    story.append(Paragraph("• Mobile App (React Native or Flutter): Alert notifications, clip review, basic live view, acknowledge actions.", styles['BulletText']))
    
    story.append(Paragraph("3. Data Flow (Happy Path)", styles['Section']))
    story.append(Paragraph("1. Camera streams RTSP to Edge Node.", styles['BulletText']))
    story.append(Paragraph("2. Edge runs inference continuously → detection + confidence + tracking.", styles['BulletText']))
    story.append(Paragraph("3. Temporal filter confirms event → Edge packages metadata + short clip.", styles['BulletText']))
    story.append(Paragraph("4. Edge posts event to Backend Event Service (authenticated).", styles['BulletText']))
    story.append(Paragraph("5. Backend creates Alert record, stores clip reference, publishes to Redis pub/sub.", styles['BulletText']))
    story.append(Paragraph("6. Notification Service pushes to connected WebSocket clients and mobile push services.", styles['BulletText']))
    story.append(Paragraph("7. Operator opens alert, reviews clip, acknowledges / resolves / marks FP.", styles['BulletText']))
    story.append(Paragraph("8. Status update persisted + audit log written.", styles['BulletText']))
    
    story.append(Paragraph("4. Technology Mapping (Recommended)", styles['Section']))
    tech_data = [
        [Paragraph("<b>Layer</b>", styles['TableHeader']), Paragraph("<b>Choice</b>", styles['TableHeader']), Paragraph("<b>Rationale</b>", styles['TableHeader'])],
        [Paragraph("Frontend Web", styles['TableCell']), Paragraph("Next.js (React) + TypeScript", styles['TableCell']), Paragraph("SSR/SSG, strong ecosystem, type safety", styles['TableCell'])],
        [Paragraph("Mobile", styles['TableCell']), Paragraph("React Native or Flutter", styles['TableCell']), Paragraph("Cross-platform, good push support", styles['TableCell'])],
        [Paragraph("Backend API", styles['TableCell']), Paragraph("NestJS (Node) or FastAPI (Python)", styles['TableCell']), Paragraph("NestJS: structured, WS friendly; FastAPI: excellent for AI-adjacent services", styles['TableCell'])],
        [Paragraph("AI / Edge", styles['TableCell']), Paragraph("Python + YOLO (Ultralytics) / TensorRT / ONNX Runtime", styles['TableCell']), Paragraph("Mature CV stack, edge optimization available", styles['TableCell'])],
        [Paragraph("Primary DB", styles['TableCell']), Paragraph("PostgreSQL 15+", styles['TableCell']), Paragraph("Relational integrity, JSONB, reliability", styles['TableCell'])],
        [Paragraph("Cache / PubSub", styles['TableCell']), Paragraph("Redis 7+", styles['TableCell']), Paragraph("Speed, pub/sub, presence", styles['TableCell'])],
        [Paragraph("Object Storage", styles['TableCell']), Paragraph("S3 / MinIO / Cloudflare R2", styles['TableCell']), Paragraph("Durable clip storage, signed URLs", styles['TableCell'])],
        [Paragraph("Auth", styles['TableCell']), Paragraph("JWT (access+refresh) + optional SSO later", styles['TableCell']), Paragraph("Stateless, mobile-friendly", styles['TableCell'])],
        [Paragraph("Realtime", styles['TableCell']), Paragraph("WebSocket (Socket.IO or native)", styles['TableCell']), Paragraph("Low-latency alert delivery", styles['TableCell'])],
        [Paragraph("Deployment", styles['TableCell']), Paragraph("Docker + Kubernetes / Docker Compose (early)", styles['TableCell']), Paragraph("Reproducible, scalable", styles['TableCell'])],
    ]
    story.append(make_table(tech_data, [1.4*inch, 2.2*inch, 3.0*inch]))
    
    story.append(Paragraph("5. Deployment Topology (MVP)", styles['Section']))
    story.append(Paragraph("• Edge nodes deployed on-site (NVIDIA Jetson / industrial PC / capable NVR) or co-located with cameras.", styles['BulletText']))
    story.append(Paragraph("• Backend services in a single cloud region (or on-prem for high-security customers) behind load balancer.", styles['BulletText']))
    story.append(Paragraph("• PostgreSQL managed or self-hosted with daily backups.", styles['BulletText']))
    story.append(Paragraph("• Object storage in same region for low latency.", styles['BulletText']))
    story.append(Paragraph("• CI/CD pipeline for backend, frontend, and edge model packages.", styles['BulletText']))
    
    story.append(Paragraph("6. Security Architecture Highlights", styles['Section']))
    for s in ["mTLS or strong token auth between Edge and Cloud", "Network isolation of edge management plane", "Least-privilege IAM for object storage", "Encryption at rest for database and clips", "Regular dependency scanning and model supply-chain checks"]:
        story.append(Paragraph(f"• {s}", styles['BulletText']))
    
    story.append(Paragraph("7. Observability", styles['Section']))
    story.append(Paragraph("Metrics: detection latency, alert volume, false-positive rate, camera online %, API latency, error rates. Logging: structured JSON logs. Tracing: request IDs across edge → backend → notification. Alerting on pipeline health and error budgets.", styles['Body']))
    
    doc = SimpleDocTemplate(f"{OUTPUT_DIR}/03_Architecture_Document.pdf", pagesize=A4,
                            rightMargin=0.6*inch, leftMargin=0.6*inch, topMargin=0.6*inch, bottomMargin=0.6*inch)
    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
    print("Generated: 03_Architecture_Document.pdf")

# ============================================================
# 4. Database Schema
# ============================================================
def generate_db_schema():
    styles = get_styles()
    story = []
    cover_page(story, styles, "Database Schema Document", "PostgreSQL Schema for Multi-tenant Real-time System", "DRISHYAM-DB-001")
    
    story.append(Paragraph("1. Design Principles", styles['Section']))
    for p in ["Multi-tenant isolation via organization_id on all tenant data", "Soft deletes where auditability is required", "JSONB for flexible config and metadata", "Timestamps (created_at, updated_at) on all major tables", "UUID primary keys for distributed-friendly IDs"]:
        story.append(Paragraph(f"• {p}", styles['BulletText']))
    
    story.append(Paragraph("2. Core Tables", styles['Section']))
    
    tables = [
        ("organizations", [
            "id UUID PK",
            "name VARCHAR(255) NOT NULL",
            "slug VARCHAR(100) UNIQUE",
            "settings JSONB DEFAULT '{}'",
            "retention_days INT DEFAULT 30",
            "created_at, updated_at TIMESTAMPTZ"
        ]),
        ("users", [
            "id UUID PK",
            "email VARCHAR(255) UNIQUE NOT NULL",
            "password_hash VARCHAR(255)",
            "full_name VARCHAR(255)",
            "is_active BOOLEAN DEFAULT true",
            "last_login_at TIMESTAMPTZ",
            "created_at, updated_at TIMESTAMPTZ"
        ]),
        ("organization_members", [
            "id UUID PK",
            "organization_id UUID FK → organizations",
            "user_id UUID FK → users",
            "role VARCHAR(50) NOT NULL  -- OrgAdmin, SiteManager, Operator, Viewer",
            "site_ids UUID[]  -- optional scope; null = all sites",
            "created_at TIMESTAMPTZ",
            "UNIQUE(organization_id, user_id)"
        ]),
        ("sites", [
            "id UUID PK",
            "organization_id UUID FK → organizations",
            "name VARCHAR(255) NOT NULL",
            "address TEXT",
            "timezone VARCHAR(50) DEFAULT 'Asia/Kolkata'",
            "settings JSONB DEFAULT '{}'",
            "created_at, updated_at TIMESTAMPTZ"
        ]),
        ("cameras", [
            "id UUID PK",
            "site_id UUID FK → sites",
            "organization_id UUID FK → organizations",
            "name VARCHAR(255) NOT NULL",
            "rtsp_url TEXT NOT NULL",
            "onvif_host VARCHAR(255)",
            "status VARCHAR(30) DEFAULT 'unknown'  -- online, offline, degraded",
            "last_seen_at TIMESTAMPTZ",
            "config JSONB DEFAULT '{}'  -- zones, thresholds, enabled_classes",
            "edge_node_id UUID  -- optional",
            "created_at, updated_at TIMESTAMPTZ"
        ]),
        ("alerts", [
            "id UUID PK",
            "organization_id UUID FK",
            "site_id UUID FK",
            "camera_id UUID FK",
            "alert_type VARCHAR(50) NOT NULL  -- weapon, violence, intrusion, loitering",
            "severity VARCHAR(20) NOT NULL  -- critical, high, medium, low",
            "confidence FLOAT",
            "status VARCHAR(30) DEFAULT 'new'  -- new, acknowledged, resolved, false_positive",
            "detected_at TIMESTAMPTZ NOT NULL",
            "clip_path TEXT",
            "thumbnail_path TEXT",
            "metadata JSONB DEFAULT '{}'",
            "acknowledged_by UUID FK → users",
            "acknowledged_at TIMESTAMPTZ",
            "resolved_at TIMESTAMPTZ",
            "created_at TIMESTAMPTZ"
        ]),
        ("alert_actions", [
            "id UUID PK",
            "alert_id UUID FK → alerts",
            "user_id UUID FK → users",
            "action VARCHAR(50)  -- acknowledge, resolve, false_positive, escalate, comment",
            "note TEXT",
            "created_at TIMESTAMPTZ"
        ]),
        ("audit_logs", [
            "id UUID PK",
            "organization_id UUID",
            "user_id UUID",
            "action VARCHAR(100) NOT NULL",
            "resource_type VARCHAR(50)",
            "resource_id UUID",
            "details JSONB",
            "ip_address INET",
            "created_at TIMESTAMPTZ"
        ]),
        ("edge_nodes", [
            "id UUID PK",
            "organization_id UUID FK",
            "name VARCHAR(255)",
            "last_heartbeat_at TIMESTAMPTZ",
            "status VARCHAR(30)",
            "config JSONB",
            "created_at, updated_at TIMESTAMPTZ"
        ]),
    ]
    
    for tname, fields in tables:
        story.append(Paragraph(f"<b>{tname}</b>", styles['SubSection']))
        for f in fields:
            story.append(Paragraph(f"• {f}", styles['BulletText']))
    
    story.append(Paragraph("3. Key Indexes", styles['Section']))
    for i in [
        "alerts (organization_id, detected_at DESC)",
        "alerts (site_id, status, detected_at DESC)",
        "alerts (camera_id, detected_at DESC)",
        "cameras (site_id)",
        "organization_members (user_id)",
        "audit_logs (organization_id, created_at DESC)",
    ]:
        story.append(Paragraph(f"• {i}", styles['BulletText']))
    
    story.append(Paragraph("4. Relationships Summary", styles['Section']))
    story.append(Paragraph("Organization 1—N Sites 1—N Cameras. Organization N—N Users via organization_members. Alerts belong to Org + Site + Camera. Alert actions and audit logs reference users and resources.", styles['Body']))
    
    doc = SimpleDocTemplate(f"{OUTPUT_DIR}/04_Database_Schema.pdf", pagesize=A4,
                            rightMargin=0.6*inch, leftMargin=0.6*inch, topMargin=0.6*inch, bottomMargin=0.6*inch)
    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
    print("Generated: 04_Database_Schema.pdf")

# ============================================================
# 5. API Specification
# ============================================================
def generate_api_spec():
    styles = get_styles()
    story = []
    cover_page(story, styles, "API Specification", "REST + WebSocket Endpoints", "DRISHYAM-API-001")
    
    story.append(Paragraph("1. General Conventions", styles['Section']))
    story.append(Paragraph("• Base URL: https://api.drishyam.example/v1", styles['BulletText']))
    story.append(Paragraph("• Auth: Bearer JWT in Authorization header", styles['BulletText']))
    story.append(Paragraph("• Content-Type: application/json", styles['BulletText']))
    story.append(Paragraph("• Error format: { \"error\": { \"code\": \"STRING\", \"message\": \"Human readable\", \"details\": {} } }", styles['BulletText']))
    story.append(Paragraph("• Pagination: ?page=1&limit=20 → { data: [], meta: { page, limit, total } }", styles['BulletText']))
    
    story.append(Paragraph("2. Authentication Endpoints", styles['Section']))
    auth_eps = [
        ("POST /auth/login", "email, password → access_token, refresh_token, user"),
        ("POST /auth/refresh", "refresh_token → new access_token"),
        ("POST /auth/logout", "Invalidate refresh token"),
        ("POST /auth/forgot-password", "email → send reset link"),
        ("POST /auth/reset-password", "token, new_password"),
        ("GET /auth/me", "Current user profile + memberships"),
    ]
    for ep, desc in auth_eps:
        story.append(Paragraph(f"<b>{ep}</b> — {desc}", styles['BulletText']))
    
    story.append(Paragraph("3. Organization & Site", styles['Section']))
    for ep, desc in [
        ("GET /organizations/current", "Current org details + settings"),
        ("PATCH /organizations/current", "Update org settings (Admin)"),
        ("GET /sites", "List sites for current org"),
        ("POST /sites", "Create site"),
        ("GET /sites/:id", "Site detail"),
        ("PATCH /sites/:id", "Update site"),
        ("DELETE /sites/:id", "Soft delete / archive"),
    ]:
        story.append(Paragraph(f"<b>{ep}</b> — {desc}", styles['BulletText']))
    
    story.append(Paragraph("4. Cameras", styles['Section']))
    for ep, desc in [
        ("GET /cameras", "List cameras (filter by site_id)"),
        ("POST /cameras", "Add camera (rtsp_url, name, site_id, config)"),
        ("GET /cameras/:id", "Camera detail + health"),
        ("PATCH /cameras/:id", "Update name, config, zones, thresholds"),
        ("DELETE /cameras/:id", "Remove camera"),
        ("POST /cameras/:id/test", "Test RTSP connectivity"),
        ("GET /cameras/:id/snapshot", "Latest snapshot (if available)"),
    ]:
        story.append(Paragraph(f"<b>{ep}</b> — {desc}", styles['BulletText']))
    
    story.append(Paragraph("5. Alerts", styles['Section']))
    for ep, desc in [
        ("GET /alerts", "List alerts (filters: site, type, severity, status, from, to)"),
        ("GET /alerts/:id", "Alert detail + clip signed URL"),
        ("POST /alerts/:id/acknowledge", "Acknowledge alert"),
        ("POST /alerts/:id/resolve", "Resolve with optional note"),
        ("POST /alerts/:id/false-positive", "Mark as FP with optional feedback"),
        ("POST /alerts/:id/escalate", "Escalate to higher role / external"),
    ]:
        story.append(Paragraph(f"<b>{ep}</b> — {desc}", styles['BulletText']))
    
    story.append(Paragraph("6. Users & Members", styles['Section']))
    for ep, desc in [
        ("GET /members", "List org members"),
        ("POST /members/invite", "Invite by email + role"),
        ("PATCH /members/:id", "Change role or site scope"),
        ("DELETE /members/:id", "Remove member"),
    ]:
        story.append(Paragraph(f"<b>{ep}</b> — {desc}", styles['BulletText']))
    
    story.append(Paragraph("7. Edge / Internal (Service Auth)", styles['Section']))
    for ep, desc in [
        ("POST /internal/events", "Edge posts detection event + clip metadata"),
        ("POST /internal/heartbeats", "Edge node heartbeat"),
        ("GET /internal/cameras/:id/config", "Pull latest config for edge"),
    ]:
        story.append(Paragraph(f"<b>{ep}</b> — {desc}", styles['BulletText']))
    
    story.append(Paragraph("8. WebSocket", styles['Section']))
    story.append(Paragraph("Endpoint: wss://api.drishyam.example/ws?token=<access_token>", styles['Body']))
    story.append(Paragraph("Events server → client: alert.created, alert.updated, camera.health, system.notification", styles['Body']))
    story.append(Paragraph("Client can send: subscribe.site, unsubscribe.site (optional room pattern)", styles['Body']))
    
    story.append(Paragraph("9. Example: Create Alert Event (Internal)", styles['Section']))
    story.append(Paragraph(
        '{"camera_id":"uuid","alert_type":"weapon","severity":"critical","confidence":0.91,'
        '"detected_at":"2026-09-13T15:30:00Z","clip_path":"clips/org/site/uuid.mp4",'
        '"metadata":{"bbox":[100,200,300,400],"duration_ms":1200}}',
        styles['CodeBlock']
    ))
    
    story.append(Paragraph("10. Status Codes", styles['Section']))
    for c in ["200 OK", "201 Created", "400 Bad Request (validation)", "401 Unauthorized", "403 Forbidden", "404 Not Found", "409 Conflict", "429 Too Many Requests", "500 Internal Server Error"]:
        story.append(Paragraph(f"• {c}", styles['BulletText']))
    
    doc = SimpleDocTemplate(f"{OUTPUT_DIR}/05_API_Specification.pdf", pagesize=A4,
                            rightMargin=0.6*inch, leftMargin=0.6*inch, topMargin=0.6*inch, bottomMargin=0.6*inch)
    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
    print("Generated: 05_API_Specification.pdf")

# ============================================================
# 6. AI Requirements
# ============================================================
def generate_ai_requirements():
    styles = get_styles()
    story = []
    cover_page(story, styles, "AI Requirements Document", "Real-time Detection Pipeline Specification", "DRISHYAM-AI-001")
    
    story.append(Paragraph("1. Purpose of AI in Drishyam", styles['Section']))
    story.append(Paragraph(
        "AI continuously analyzes live video to detect security-relevant events that humans cannot reliably monitor at scale. "
        "The output is not just a label but a verified, actionable alert with evidence.",
        styles['Body']
    ))
    
    story.append(Paragraph("2. Detection Classes (MVP)", styles['Section']))
    classes = [
        ("Weapon", "Firearm (handgun, rifle) and bladed weapons (knife, machete) held or brandished by a person."),
        ("Violence / Fight", "Physical altercation between two or more people involving punches, kicks, grappling, or weapon use."),
        ("Intrusion", "Person entering a restricted polygonal zone (after hours or always-restricted)."),
        ("Loitering", "Person remaining in a defined zone longer than a configurable threshold (e.g., 60–120 seconds)."),
    ]
    for name, desc in classes:
        story.append(Paragraph(f"<b>{name}</b>: {desc}", styles['Body']))
    
    story.append(Paragraph("3. Input / Output Contract", styles['Section']))
    story.append(Paragraph("<b>Input:</b> Continuous video frames (or short segments) from RTSP stream, typically analyzed at 5–15 FPS and 640–1280 px width depending on edge capacity.", styles['Body']))
    story.append(Paragraph("<b>Output (per confirmed event):</b>", styles['Body']))
    for o in ["alert_type", "confidence (0–1)", "bounding boxes / tracks", "start and end timestamps", "optional keypoints or attributes", "reference to generated evidence clip"]:
        story.append(Paragraph(f"• {o}", styles['BulletText']))
    
    story.append(Paragraph("4. Model Strategy", styles['Section']))
    story.append(Paragraph("• Primary detector: YOLO-family (YOLOv8/v10/v11 or equivalent) fine-tuned for weapon and person detection.", styles['BulletText']))
    story.append(Paragraph("• Pose / action: Lightweight pose estimator or action recognition head for violence.", styles['BulletText']))
    story.append(Paragraph("• Tracking: ByteTrack or BoT-SORT for temporal consistency.", styles['BulletText']))
    story.append(Paragraph("• Deployment format: ONNX / TensorRT / OpenVINO for edge performance.", styles['BulletText']))
    story.append(Paragraph("• Fallback: Cloud GPU inference for complex cases or when edge is offline (optional).", styles['BulletText']))
    
    story.append(Paragraph("5. Temporal & Business Logic Filters", styles['Section']))
    for f in [
        "Minimum consecutive detections (e.g., 5–10 frames) before confirming.",
        "Minimum duration for loitering.",
        "Zone membership check for intrusion.",
        "Confidence threshold per class (configurable).",
        "Cooldown / de-duplication window to avoid alert storms for the same incident.",
    ]:
        story.append(Paragraph(f"• {f}", styles['BulletText']))
    
    story.append(Paragraph("6. Privacy Controls", styles['Section']))
    story.append(Paragraph("• Optional face blurring on stored clips (OpenCV or model-based).", styles['BulletText']))
    story.append(Paragraph("• Prefer on-edge processing so raw video does not leave the premises unnecessarily.", styles['BulletText']))
    story.append(Paragraph("• No permanent facial identity database in MVP unless explicitly required and consented.", styles['BulletText']))
    
    story.append(Paragraph("7. Fallback & Error Handling", styles['Section']))
    for f in [
        "If model fails on a frame → skip and log; do not crash pipeline.",
        "If edge node is offline → camera marked degraded; optional cloud fallback if configured.",
        "If confidence is borderline → still create alert but flag as “low confidence” for operator review.",
        "Always preserve the evidence clip even if later marked false positive.",
    ]:
        story.append(Paragraph(f"• {f}", styles['BulletText']))
    
    story.append(Paragraph("8. Performance Targets", styles['Section']))
    for t in [
        "Inference latency on edge (Jetson-class): ≤ 100–200 ms per frame at chosen resolution.",
        "End-to-end (frame to alert record): ≤ 5 seconds for 95th percentile.",
        "False positive rate target in pilot: < 10% after tuning.",
        "False negative rate for Critical classes (weapon/violence): as low as practically achievable; prioritize recall for safety.",
    ]:
        story.append(Paragraph(f"• {t}", styles['BulletText']))
    
    doc = SimpleDocTemplate(f"{OUTPUT_DIR}/06_AI_Requirements.pdf", pagesize=A4,
                            rightMargin=0.6*inch, leftMargin=0.6*inch, topMargin=0.6*inch, bottomMargin=0.6*inch)
    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
    print("Generated: 06_AI_Requirements.pdf")

# ============================================================
# 7. Tech Stack Decision
# ============================================================
def generate_tech_stack():
    styles = get_styles()
    story = []
    cover_page(story, styles, "Tech Stack Decision Document", "Recommended Technologies & Rationale", "DRISHYAM-TECH-001")
    
    story.append(Paragraph("1. Decision Summary", styles['Section']))
    story.append(Paragraph(
        "We recommend a pragmatic, production-proven stack optimized for real-time video + AI workloads, multi-tenant SaaS, and Indian deployment realities (edge preference, cost control, DPDP).",
        styles['Body']
    ))
    
    story.append(Paragraph("2. Frontend", styles['Section']))
    story.append(Paragraph("<b>Web:</b> Next.js 14+ (App Router) + TypeScript + Tailwind CSS + shadcn/ui", styles['Body']))
    story.append(Paragraph("Why: Excellent DX, SSR for dashboard shells, strong TypeScript support, large ecosystem, easy deployment (Vercel or self-host).", styles['Body']))
    story.append(Paragraph("<b>Mobile:</b> React Native (Expo) or Flutter", styles['Body']))
    story.append(Paragraph("Why: Single codebase for iOS/Android, mature push notification support, good performance for alert + clip review flows.", styles['Body']))
    
    story.append(Paragraph("3. Backend", styles['Section']))
    story.append(Paragraph("<b>Primary API:</b> NestJS (Node.js + TypeScript) or FastAPI (Python)", styles['Body']))
    story.append(Paragraph("NestJS preferred if team is stronger in TypeScript and wants unified language with frontend + excellent WebSocket support. FastAPI preferred if AI team wants seamless Python model integration and rapid ML endpoint development. Both are acceptable; pick one and stay consistent.", styles['Body']))
    
    story.append(Paragraph("4. AI / Edge", styles['Section']))
    story.append(Paragraph("• Language: Python 3.10+", styles['BulletText']))
    story.append(Paragraph("• Core: Ultralytics YOLO + custom fine-tunes, OpenCV, ByteTrack", styles['BulletText']))
    story.append(Paragraph("• Runtime: ONNX Runtime / TensorRT / OpenVINO depending on hardware", styles['BulletText']))
    story.append(Paragraph("• Hardware target: NVIDIA Jetson Orin / Xavier, industrial PCs with GPU, or AI cameras with NPU", styles['BulletText']))
    
    story.append(Paragraph("5. Data", styles['Section']))
    story.append(Paragraph("• PostgreSQL 15+ (primary)", styles['BulletText']))
    story.append(Paragraph("• Redis 7+ (cache, pub/sub, rate limit, presence)", styles['BulletText']))
    story.append(Paragraph("• S3-compatible object storage (AWS S3, MinIO, Cloudflare R2, or Indian cloud equivalent)", styles['BulletText']))
    
    story.append(Paragraph("6. Auth & Security", styles['Section']))
    story.append(Paragraph("• JWT access + refresh tokens (httpOnly cookies for web optional)", styles['BulletText']))
    story.append(Paragraph("• bcrypt or argon2 for password hashing", styles['BulletText']))
    story.append(Paragraph("• Role-based access control (RBAC) middleware", styles['BulletText']))
    
    story.append(Paragraph("7. Real-time", styles['Section']))
    story.append(Paragraph("• WebSocket (Socket.IO or native ws) for alert push", styles['BulletText']))
    story.append(Paragraph("• FCM + APNs for mobile push", styles['BulletText']))
    
    story.append(Paragraph("8. DevOps", styles['Section']))
    story.append(Paragraph("• Docker for all services", styles['BulletText']))
    story.append(Paragraph("• Docker Compose for local + early staging", styles['BulletText']))
    story.append(Paragraph("• Kubernetes or managed container service for production scale", styles['BulletText']))
    story.append(Paragraph("• GitHub Actions or equivalent CI/CD", styles['BulletText']))
    story.append(Paragraph("• Structured logging (JSON) + metrics (Prometheus/Grafana or cloud equivalent)", styles['BulletText']))
    
    story.append(Paragraph("9. Why Not Alternatives (Brief)", styles['Section']))
    story.append(Paragraph("• Pure serverless for core detection path → cold starts and latency unpredictability hurt real-time guarantees.", styles['Body']))
    story.append(Paragraph("• MongoDB as primary → relational integrity and complex queries around orgs/sites/alerts are better in PostgreSQL.", styles['Body']))
    story.append(Paragraph("• Heavy microservices from day 1 → unnecessary complexity for MVP; start modular monolith + clear edge boundary.", styles['Body']))
    
    doc = SimpleDocTemplate(f"{OUTPUT_DIR}/07_Tech_Stack_Decision.pdf", pagesize=A4,
                            rightMargin=0.6*inch, leftMargin=0.6*inch, topMargin=0.6*inch, bottomMargin=0.6*inch)
    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
    print("Generated: 07_Tech_Stack_Decision.pdf")

# ============================================================
# 8. Auth Document
# ============================================================
def generate_auth_doc():
    styles = get_styles()
    story = []
    cover_page(story, styles, "Authentication & Authorization", "Login, Roles, Sessions, Protected Routes", "DRISHYAM-AUTH-001")
    
    story.append(Paragraph("1. Authentication Flow", styles['Section']))
    story.append(Paragraph("<b>Login:</b> POST /auth/login with email + password → returns access_token (short-lived, e.g. 15–60 min) + refresh_token (long-lived, e.g. 7–30 days) + user profile.", styles['Body']))
    story.append(Paragraph("<b>Refresh:</b> POST /auth/refresh with refresh_token → new access_token. Refresh tokens rotated on use (recommended).", styles['Body']))
    story.append(Paragraph("<b>Logout:</b> Invalidate refresh token server-side (token denylist or family revocation).", styles['Body']))
    
    story.append(Paragraph("2. Password Handling", styles['Section']))
    for p in ["Hash with argon2id or bcrypt (cost factor appropriate for hardware)", "Never log or return password hashes", "Password reset via time-limited single-use token sent by email", "Optional: force password change on first login for invited users"]:
        story.append(Paragraph(f"• {p}", styles['BulletText']))
    
    story.append(Paragraph("3. Roles", styles['Section']))
    roles = [
        ("SuperAdmin", "Platform-level (internal only). Manage all orgs."),
        ("OrgAdmin", "Full control within one organization: users, sites, cameras, billing settings."),
        ("SiteManager", "Manage cameras and rules for assigned sites; view and act on alerts."),
        ("Operator", "View live feeds and alerts for permitted sites; acknowledge / resolve / mark FP."),
        ("Viewer", "Read-only access to permitted sites and alerts."),
    ]
    for name, desc in roles:
        story.append(Paragraph(f"<b>{name}</b>: {desc}", styles['Body']))
    
    story.append(Paragraph("4. Authorization Model", styles['Section']))
    story.append(Paragraph("Every protected endpoint checks: (1) valid JWT, (2) user is active member of the organization, (3) role permits the action, (4) optional site scope allows the resource.", styles['Body']))
    story.append(Paragraph("Implementation: middleware / guards that load membership + role and attach to request context. Resource-level checks (e.g., camera belongs to allowed site) performed in service layer.", styles['Body']))
    
    story.append(Paragraph("5. Session / Token Handling", styles['Section']))
    for s in [
        "Access token: JWT containing user_id, org memberships summary or role claims, exp.",
        "Refresh token: opaque or JWT stored server-side (or hashed) for revocation.",
        "Web: prefer httpOnly secure cookie for refresh; access token in memory or short-lived cookie.",
        "Mobile: secure storage (Keychain / Keystore) for tokens.",
        "Edge nodes: long-lived service credentials or mTLS, not user JWTs.",
    ]:
        story.append(Paragraph(f"• {s}", styles['BulletText']))
    
    story.append(Paragraph("6. Protected Routes (Examples)", styles['Section']))
    for r in [
        "All /cameras, /alerts, /sites, /members require authentication.",
        "Write operations on cameras/sites/members require OrgAdmin or SiteManager.",
        "Alert action endpoints require Operator or higher.",
        "Internal /internal/* endpoints require service authentication (API key or mTLS).",
    ]:
        story.append(Paragraph(f"• {r}", styles['BulletText']))
    
    story.append(Paragraph("7. Invite Flow", styles['Section']))
    story.append(Paragraph("OrgAdmin invites by email → system creates pending membership + sends magic link or temporary password → user sets password / accepts → becomes active member with assigned role.", styles['Body']))
    
    doc = SimpleDocTemplate(f"{OUTPUT_DIR}/08_Authentication_Authorization.pdf", pagesize=A4,
                            rightMargin=0.6*inch, leftMargin=0.6*inch, topMargin=0.6*inch, bottomMargin=0.6*inch)
    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
    print("Generated: 08_Authentication_Authorization.pdf")

# ============================================================
# 9. User Flow
# ============================================================
def generate_user_flow():
    styles = get_styles()
    story = []
    cover_page(story, styles, "User Flow Document", "Key Journeys, Success & Failure Paths", "DRISHYAM-FLOW-001")
    
    story.append(Paragraph("1. First-Time Org Admin Setup", styles['Section']))
    story.append(Paragraph("Start → Sign up / Accept invite → Create Organization → Create first Site → Add Camera (RTSP URL + test) → Configure detection classes & zones → Invite Operator → Go Live.", styles['Body']))
    story.append(Paragraph("<b>Success:</b> Camera shows Online, test detection fires (or simulated), Operator receives invite.", styles['Body']))
    story.append(Paragraph("<b>Failure paths:</b> Invalid RTSP → clear error + retry. Invite email fails → show resend. Zone drawing invalid → validation message.", styles['Body']))
    
    story.append(Paragraph("2. Operator Daily Alert Handling", styles['Section']))
    story.append(Paragraph("Login → Dashboard (alert feed + live grid) → New Critical alert appears (sound/badge) → Open alert → Play evidence clip → Decide:", styles['Body']))
    story.append(Paragraph("• Real threat → Acknowledge → Escalate or Resolve after action → Optional note.", styles['BulletText']))
    story.append(Paragraph("• False positive → Mark FP → Optional reason → Alert closed, feedback recorded.", styles['BulletText']))
    story.append(Paragraph("<b>Edge cases:</b> Multiple simultaneous alerts → priority by severity + time. Clip not yet available → show “processing” + retry. Network drop → queue action and sync later.", styles['Body']))
    
    story.append(Paragraph("3. Camera Offline Handling", styles['Section']))
    story.append(Paragraph("Edge or backend detects no frames / heartbeat timeout → Camera status = offline → Health event created → Optional notification to SiteManager → When stream returns → status = online, event logged.", styles['Body']))
    
    story.append(Paragraph("4. Multi-Site Manager View", styles['Section']))
    story.append(Paragraph("Login as SiteManager → See only assigned sites → Filter alerts by site → Configure cameras only within scope → Cannot invite OrgAdmins or change org settings.", styles['Body']))
    
    story.append(Paragraph("5. Mobile Alert Path", styles['Section']))
    story.append(Paragraph("Push notification received → Tap → App opens alert detail (clip + metadata) → Acknowledge / Resolve / FP with one tap → Optional short note → Returns to feed.", styles['Body']))
    
    story.append(Paragraph("6. Failure & Recovery Patterns", styles['Section']))
    for f in [
        "API 401 → redirect to login / refresh token flow.",
        "API 403 → show “You don’t have permission” and stay on current page.",
        "Clip load failure → retry button + fallback thumbnail.",
        "WebSocket disconnect → auto-reconnect with exponential backoff + missed-alert poll on reconnect.",
        "Empty states: No cameras → CTA to add camera. No alerts → “All clear” illustration.",
    ]:
        story.append(Paragraph(f"• {f}", styles['BulletText']))
    
    doc = SimpleDocTemplate(f"{OUTPUT_DIR}/09_User_Flow_Document.pdf", pagesize=A4,
                            rightMargin=0.6*inch, leftMargin=0.6*inch, topMargin=0.6*inch, bottomMargin=0.6*inch)
    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
    print("Generated: 09_User_Flow_Document.pdf")

# ============================================================
# 10. Security Requirements
# ============================================================
def generate_security():
    styles = get_styles()
    story = []
    cover_page(story, styles, "Security Requirements Document", "Application, API, Data & Infrastructure Security", "DRISHYAM-SEC-001")
    
    story.append(Paragraph("1. Input & Output Security", styles['Section']))
    for s in [
        "Validate and sanitize all user inputs (length, type, format).",
        "Parameterized queries / ORM only — no raw SQL concatenation.",
        "Output encoding for any user-generated content displayed in UI.",
        "RTSP URLs validated for scheme and basic reachability; credentials stored encrypted.",
    ]:
        story.append(Paragraph(f"• {s}", styles['BulletText']))
    
    story.append(Paragraph("2. API Security", styles['Section']))
    for s in [
        "TLS 1.2+ everywhere.",
        "JWT signature verification on every protected request.",
        "Rate limiting per user / IP (login, invite, general API).",
        "CORS restricted to known frontend origins.",
        "Internal edge endpoints isolated by network policy + service auth.",
    ]:
        story.append(Paragraph(f"• {s}", styles['BulletText']))
    
    story.append(Paragraph("3. Data Protection", styles['Section']))
    for s in [
        "Encryption at rest for database and object storage.",
        "Signed, short-lived URLs for clip access.",
        "PII (emails, names) minimized in logs.",
        "Configurable retention and secure deletion of clips.",
        "Face blur option to reduce biometric exposure in stored media.",
    ]:
        story.append(Paragraph(f"• {s}", styles['BulletText']))
    
    story.append(Paragraph("4. Secrets Management", styles['Section']))
    story.append(Paragraph("All secrets (DB URLs, JWT secrets, cloud keys, model endpoints) via environment variables or secret manager. Never committed to git. Rotate periodically.", styles['Body']))
    
    story.append(Paragraph("5. Access Control", styles['Section']))
    story.append(Paragraph("RBAC enforced server-side. Principle of least privilege for service accounts. Audit log for privilege changes and sensitive actions.", styles['Body']))
    
    story.append(Paragraph("6. Edge Security", styles['Section']))
    for s in [
        "Edge nodes authenticate to cloud with unique credentials.",
        "Prefer outbound-only connections from edge.",
        "Model and software updates signed and verified.",
        "Local storage of clips encrypted if retained on edge.",
    ]:
        story.append(Paragraph(f"• {s}", styles['BulletText']))
    
    doc = SimpleDocTemplate(f"{OUTPUT_DIR}/10_Security_Requirements.pdf", pagesize=A4,
                            rightMargin=0.6*inch, leftMargin=0.6*inch, topMargin=0.6*inch, bottomMargin=0.6*inch)
    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
    print("Generated: 10_Security_Requirements.pdf")

# ============================================================
# 11. Edge Cases
# ============================================================
def generate_edge_cases():
    styles = get_styles()
    story = []
    cover_page(story, styles, "Edge Cases Document", "Invalid Inputs, Failures & Recovery", "DRISHYAM-EDGE-001")
    
    cases = [
        ("Invalid / Malicious Input", [
            "Malformed RTSP URL → 400 with clear message",
            "Extremely large JSON body → reject with 413",
            "SQL/NoSQL injection attempts → blocked by parameterization",
            "XSS in alert notes → escaped on output",
        ]),
        ("Empty / Missing Data", [
            "Org with zero cameras → empty state CTA",
            "Alert list empty → “All clear” message",
            "Clip not yet uploaded → “Processing…” with retry",
            "User has no site scope → see nothing or limited view",
        ]),
        ("Duplicates & Concurrency", [
            "Double-click acknowledge → idempotent action",
            "Two operators acknowledge same alert → first wins, second sees already-acked state",
            "Duplicate camera RTSP → warn or reject",
        ]),
        ("Network & API Failure", [
            "Backend unreachable from edge → local queue + retry with backoff",
            "WebSocket drop → reconnect + catch-up poll",
            "Push notification failure → retry + fallback to in-app only",
            "Partial form submit → preserve user input, show error",
        ]),
        ("Auth & Authorization", [
            "Expired access token → silent refresh or redirect to login",
            "User removed from org while session active → 403 on next request",
            "Role downgraded → UI and API both enforce new permissions immediately",
        ]),
        ("AI / Pipeline Specific", [
            "Model returns no detections for long period → health still OK if frames flowing",
            "Sudden burst of detections → rate-limit alerts per camera / cooldown",
            "Corrupt frame → skip and log",
            "Edge disk full → stop local clip write, still send metadata if possible, alert admin",
        ]),
        ("Timeouts", [
            "Long-running report → async job + notification when ready",
            "Camera test timeout → “Could not connect” after N seconds",
        ]),
    ]
    
    for title, items in cases:
        story.append(Paragraph(title, styles['SubSection']))
        for i in items:
            story.append(Paragraph(f"• {i}", styles['BulletText']))
    
    doc = SimpleDocTemplate(f"{OUTPUT_DIR}/11_Edge_Cases_Document.pdf", pagesize=A4,
                            rightMargin=0.6*inch, leftMargin=0.6*inch, topMargin=0.6*inch, bottomMargin=0.6*inch)
    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
    print("Generated: 11_Edge_Cases_Document.pdf")

# ============================================================
# 12. Business Logic
# ============================================================
def generate_business_logic():
    styles = get_styles()
    story = []
    cover_page(story, styles, "Business Logic Document", "Rules, Workflows & Scenario Handling", "DRISHYAM-BL-001")
    
    story.append(Paragraph("1. Alert Lifecycle", styles['Section']))
    story.append(Paragraph("States: new → acknowledged → resolved | false_positive. Critical alerts cannot skip acknowledgment. Time-to-ack and time-to-resolve are recorded for metrics.", styles['Body']))
    
    story.append(Paragraph("2. Severity Assignment", styles['Section']))
    story.append(Paragraph("• weapon, violence → critical", styles['BulletText']))
    story.append(Paragraph("• intrusion (restricted zone) → high", styles['BulletText']))
    story.append(Paragraph("• loitering → medium (configurable)", styles['BulletText']))
    story.append(Paragraph("Severity can be overridden by site policy in future.", styles['Body']))
    
    story.append(Paragraph("3. Notification Rules", styles['Section']))
    story.append(Paragraph("Notify all Operators and SiteManagers with scope over the camera’s site. OrgAdmins can opt in to all critical alerts. Quiet hours optional per user (future).", styles['Body']))
    
    story.append(Paragraph("4. False Positive Feedback", styles['Section']))
    story.append(Paragraph("When marked FP, store reason code + free text. Optionally feed into threshold tuning or model retraining pipeline (offline). Do not auto-delete the clip.", styles['Body']))
    
    story.append(Paragraph("5. Retention", styles['Section']))
    story.append(Paragraph("Clips and alert media deleted after organization.retention_days (default 30). Alert metadata may be retained longer for reporting (configurable). Soft-deleted cameras hide from UI but keep historical alerts.", styles['Body']))
    
    story.append(Paragraph("6. Multi-tenancy Isolation", styles['Section']))
    story.append(Paragraph("Every query for tenant data must filter by organization_id derived from the authenticated user’s membership. Cross-org access is impossible by design except for SuperAdmin.", styles['Body']))
    
    doc = SimpleDocTemplate(f"{OUTPUT_DIR}/12_Business_Logic_Document.pdf", pagesize=A4,
                            rightMargin=0.6*inch, leftMargin=0.6*inch, topMargin=0.6*inch, bottomMargin=0.6*inch)
    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
    print("Generated: 12_Business_Logic_Document.pdf")

# ============================================================
# 13. README / Developer Setup
# ============================================================
def generate_readme():
    styles = get_styles()
    story = []
    cover_page(story, styles, "Developer Setup & README", "Installation, Structure, Commands", "DRISHYAM-DEV-001")
    
    story.append(Paragraph("1. Repository Structure (Suggested)", styles['Section']))
    structure = """drishyam/
├── apps/
│   ├── web/                 # Next.js dashboard
│   ├── mobile/              # React Native / Flutter
│   └── edge-agent/          # Python edge inference service
├── services/
│   ├── api/                 # NestJS or FastAPI backend
│   └── notification/        # Optional separate worker
├── packages/
│   └── shared/              # Shared types, utils
├── infra/
│   ├── docker/
│   └── k8s/
├── docs/                    # These PDFs + OpenAPI
└── README.md"""
    story.append(Preformatted(structure, styles['CodeBlock']))
    
    story.append(Paragraph("2. Prerequisites", styles['Section']))
    for p in ["Node.js 20+", "Python 3.10+", "Docker & Docker Compose", "PostgreSQL 15 (or Docker)", "Redis 7 (or Docker)", "Git"]:
        story.append(Paragraph(f"• {p}", styles['BulletText']))
    
    story.append(Paragraph("3. Local Setup (High Level)", styles['Section']))
    story.append(Paragraph("1. Clone repo && copy .env.example to .env (api, web, edge)", styles['BulletText']))
    story.append(Paragraph("2. docker compose up -d postgres redis minio", styles['BulletText']))
    story.append(Paragraph("3. Install API deps, run migrations, seed demo org", styles['BulletText']))
    story.append(Paragraph("4. Start API + Web in dev mode", styles['BulletText']))
    story.append(Paragraph("5. (Optional) Start edge-agent against a sample RTSP or file source", styles['BulletText']))
    
    story.append(Paragraph("4. Key Environment Variables (Examples)", styles['Section']))
    envs = [
        "DATABASE_URL=postgresql://...",
        "REDIS_URL=redis://...",
        "JWT_SECRET=...",
        "JWT_REFRESH_SECRET=...",
        "S3_ENDPOINT=... S3_BUCKET=... S3_ACCESS_KEY=... S3_SECRET_KEY=...",
        "EDGE_SERVICE_TOKEN=...",
        "FCM_SERVER_KEY=... (mobile push)",
    ]
    for e in envs:
        story.append(Paragraph(f"• {e}", styles['BulletText']))
    
    story.append(Paragraph("5. Common Commands", styles['Section']))
    for c in ["npm run dev (web)", "npm run start:dev (api)", "python -m edge_agent (edge)", "npm run db:migrate", "npm run test", "docker compose -f docker-compose.prod.yml up"]:
        story.append(Paragraph(f"• {c}", styles['BulletText']))
    
    story.append(Paragraph("6. Development Workflow", styles['Section']))
    story.append(Paragraph("Feature branches → PR → CI (lint, typecheck, unit tests) → Review → Merge to main → Auto deploy to staging. Production deploy via tagged release or manual approval.", styles['Body']))
    
    doc = SimpleDocTemplate(f"{OUTPUT_DIR}/13_Developer_Setup_README.pdf", pagesize=A4,
                            rightMargin=0.6*inch, leftMargin=0.6*inch, topMargin=0.6*inch, bottomMargin=0.6*inch)
    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
    print("Generated: 13_Developer_Setup_README.pdf")

# ============================================================
# 14. Testing Document
# ============================================================
def generate_testing():
    styles = get_styles()
    story = []
    cover_page(story, styles, "Testing Document", "Unit, Integration, E2E & AI Evaluation", "DRISHYAM-TEST-001")
    
    story.append(Paragraph("1. Testing Strategy", styles['Section']))
    story.append(Paragraph("Pyramid: many fast unit tests, solid integration tests for API + DB, fewer critical E2E flows, dedicated AI evaluation suite on labeled video.", styles['Body']))
    
    story.append(Paragraph("2. Unit Tests", styles['Section']))
    for u in ["Auth token generation/validation", "Permission checks for each role", "Alert state machine transitions", "Severity mapping", "Input validation helpers", "Temporal filter logic (AI side)"]:
        story.append(Paragraph(f"• {u}", styles['BulletText']))
    
    story.append(Paragraph("3. Integration / API Tests", styles['Section']))
    for i in ["Login → access protected route", "Create site → add camera → list cameras", "Simulate internal event → alert created → appears in list", "Acknowledge flow updates status and audit log", "Cross-org access returns 403"]:
        story.append(Paragraph(f"• {i}", styles['BulletText']))
    
    story.append(Paragraph("4. E2E Critical Flows", styles['Section']))
    for e in ["Full admin setup (org → site → camera → invite)", "Operator receives alert (mock event) → acknowledges", "Camera offline → status reflects", "Role restriction prevents unauthorized action"]:
        story.append(Paragraph(f"• {e}", styles['BulletText']))
    
    story.append(Paragraph("5. AI Evaluation", styles['Section']))
    story.append(Paragraph("Maintain a labeled test set of Indian-context videos for weapon, violence, intrusion, loitering. Track precision, recall, F1, and latency. Gate model updates on regression thresholds. Include hard negatives (tools that look like weapons, sports, etc.).", styles['Body']))
    
    story.append(Paragraph("6. Performance / Load", styles['Section']))
    story.append(Paragraph("Load test API with concurrent alert creation and WebSocket connections. Measure edge pipeline FPS and latency under multiple streams.", styles['Body']))
    
    doc = SimpleDocTemplate(f"{OUTPUT_DIR}/14_Testing_Document.pdf", pagesize=A4,
                            rightMargin=0.6*inch, leftMargin=0.6*inch, topMargin=0.6*inch, bottomMargin=0.6*inch)
    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
    print("Generated: 14_Testing_Document.pdf")

# ============================================================
# 15. Deployment Document
# ============================================================
def generate_deployment():
    styles = get_styles()
    story = []
    cover_page(story, styles, "Deployment Document", "Environments, Config, CI/CD, Production", "DRISHYAM-DEPLOY-001")
    
    story.append(Paragraph("1. Environments", styles['Section']))
    story.append(Paragraph("• local (Docker Compose)", styles['BulletText']))
    story.append(Paragraph("• staging (cloud or on-prem)", styles['BulletText']))
    story.append(Paragraph("• production", styles['BulletText']))
    
    story.append(Paragraph("2. Required Secrets / Env", styles['Section']))
    story.append(Paragraph("DATABASE_URL, REDIS_URL, JWT secrets, S3 credentials, EDGE_SERVICE_TOKEN, push notification keys, any third-party AI keys. Managed via secret manager or sealed env files — never in image layers.", styles['Body']))
    
    story.append(Paragraph("3. Database Setup", styles['Section']))
    story.append(Paragraph("Run migrations on deploy. Seed only in non-prod. Automated daily backups + point-in-time recovery preferred. Connection pooling (PgBouncer or built-in).", styles['Body']))
    
    story.append(Paragraph("4. Edge Deployment", styles['Section']))
    story.append(Paragraph("Package edge-agent as Docker image or systemd service. Provision with org/site credentials and camera list (or pull config). Monitor heartbeats. Support remote config update and model hot-swap where possible.", styles['Body']))
    
    story.append(Paragraph("5. CI/CD Outline", styles['Section']))
    story.append(Paragraph("On PR: lint, typecheck, unit tests. On main: build images, push to registry, deploy to staging. Production: manual approval or tagged release → rolling update.", styles['Body']))
    
    story.append(Paragraph("6. Production Checklist", styles['Section']))
    for c in ["TLS certificates valid", "Backups verified", "Monitoring & alerting live", "Rate limits configured", "CORS origins correct", "Edge nodes enrolled and healthy", "Retention job scheduled", "Incident runbook available"]:
        story.append(Paragraph(f"• {c}", styles['BulletText']))
    
    doc = SimpleDocTemplate(f"{OUTPUT_DIR}/15_Deployment_Document.pdf", pagesize=A4,
                            rightMargin=0.6*inch, leftMargin=0.6*inch, topMargin=0.6*inch, bottomMargin=0.6*inch)
    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
    print("Generated: 15_Deployment_Document.pdf")

# ============================================================
# 16. AI Cost & Evaluation (combined short)
# ============================================================
def generate_ai_cost_eval():
    styles = get_styles()
    story = []
    cover_page(story, styles, "AI Evaluation & Cost Document", "Accuracy Targets, Test Cases, Cost Control", "DRISHYAM-AI-COST-001")
    
    story.append(Paragraph("1. Accuracy Requirements (MVP Targets)", styles['Section']))
    story.append(Paragraph("• Weapon detection: high recall preferred (minimize missed weapons); precision after temporal filter ≥ 0.85 in pilot environments.", styles['BulletText']))
    story.append(Paragraph("• Violence: balanced precision/recall; prioritize reduction of obvious false positives (sports, play).", styles['BulletText']))
    story.append(Paragraph("• Intrusion / Loitering: high precision once zones and thresholds are tuned per site.", styles['BulletText']))
    story.append(Paragraph("• Overall false positive rate for operator-facing alerts < 10% after initial tuning.", styles['BulletText']))
    
    story.append(Paragraph("2. Evaluation Protocol", styles['Section']))
    story.append(Paragraph("Maintain a golden set of labeled clips (positive + hard negative). Run offline evaluation on every model candidate. Record precision, recall, F1, latency, and confusion examples. Human review of FP/FN samples before promotion to production.", styles['Body']))
    
    story.append(Paragraph("3. Hallucination / Bad Output Handling", styles['Section']))
    story.append(Paragraph("AI does not generate free text in MVP; outputs are structured classes + scores + boxes. “Bad outputs” = wrong class or spurious detection. Mitigated by temporal filters, confidence thresholds, and operator FP feedback.", styles['Body']))
    
    story.append(Paragraph("4. Cost Drivers & Control", styles['Section']))
    story.append(Paragraph("• Dominant cost: edge hardware (CapEx) or cloud GPU (OpEx) if used heavily.", styles['BulletText']))
    story.append(Paragraph("• Prefer edge inference → predictable cost per camera, better privacy.", styles['BulletText']))
    story.append(Paragraph("• Analyze at reduced FPS/resolution where acceptable.", styles['BulletText']))
    story.append(Paragraph("• Clip storage: short clips only; aggressive retention; compressed codec.", styles['BulletText']))
    story.append(Paragraph("• Cloud fallback: rate-limited and used only when edge unavailable or for rare heavy models.", styles['BulletText']))
    
    story.append(Paragraph("5. Rough Cost Guidance (Order of Magnitude)", styles['Section']))
    story.append(Paragraph("Edge node capable of 8–16 streams: hardware cost amortized over years. Cloud GPU inference if used 24/7 for many streams becomes expensive quickly — hence edge-first strategy. Object storage for clips is relatively cheap if retention is short.", styles['Body']))
    
    doc = SimpleDocTemplate(f"{OUTPUT_DIR}/16_AI_Evaluation_and_Cost.pdf", pagesize=A4,
                            rightMargin=0.6*inch, leftMargin=0.6*inch, topMargin=0.6*inch, bottomMargin=0.6*inch)
    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
    print("Generated: 16_AI_Evaluation_and_Cost.pdf")

# ============================================================
# 17. UI/UX Spec (condensed but useful)
# ============================================================
def generate_uiux():
    styles = get_styles()
    story = []
    cover_page(story, styles, "UI/UX Specification", "Screens, Components, States, Navigation", "DRISHYAM-UI-001")
    
    story.append(Paragraph("1. Primary Screens (Web)", styles['Section']))
    screens = [
        ("Login / Accept Invite", "Email + password or invite token. Error states for invalid credentials."),
        ("Dashboard Home", "Alert feed (real-time), summary KPIs (open critical, cameras online), quick live grid."),
        ("Live View", "Multi-camera grid or single expanded view with status badges."),
        ("Alerts List", "Filterable table/cards: severity, type, site, status, time. Click → detail."),
        ("Alert Detail", "Video player (clip), metadata, timeline, action buttons (Ack / Resolve / FP / Escalate), activity log."),
        ("Cameras", "List + status. Add/Edit drawer or page with RTSP, zones overlay, class toggles."),
        ("Sites & Organization", "Site list, org settings, retention, members management."),
        ("Members", "Invite, role assignment, deactivate."),
        ("Settings / Profile", "User profile, notification preferences, password change."),
    ]
    for name, desc in screens:
        story.append(Paragraph(f"<b>{name}</b>: {desc}", styles['Body']))
    
    story.append(Paragraph("2. Key Components", styles['Section']))
    for c in ["AlertCard / AlertRow", "SeverityBadge", "CameraStatusDot", "LiveGridTile", "ZoneDrawer (canvas overlay)", "ClipPlayer", "EmptyState", "LoadingSkeleton", "ConfirmDialog", "Toast / Notification"]:
        story.append(Paragraph(f"• {c}", styles['BulletText']))
    
    story.append(Paragraph("3. States", styles['Section']))
    story.append(Paragraph("Every data view must define: Loading (skeleton), Empty (illustration + CTA), Error (retry), Success/Populated. Buttons: default, loading, disabled. Forms: validation inline + summary.", styles['Body']))
    
    story.append(Paragraph("4. Navigation", styles['Section']))
    story.append(Paragraph("Left sidebar (collapsible): Dashboard, Live, Alerts, Cameras, Sites, Members, Settings. Top bar: org switcher (if multi-org later), user menu, notification bell. Mobile: bottom tab or hamburger + push-driven alert entry.", styles['Body']))
    
    story.append(Paragraph("5. Responsive Behavior", styles['Section']))
    story.append(Paragraph("Desktop-first for control room use. Tablet: usable grid and alert handling. Mobile: optimized for alert review and quick actions; live grid secondary.", styles['Body']))
    
    story.append(Paragraph("6. Accessibility & Visual", styles['Section']))
    story.append(Paragraph("Sufficient contrast for severity colors. Keyboard navigable critical actions. Clear focus states. Avoid relying on color alone for status.", styles['Body']))
    
    doc = SimpleDocTemplate(f"{OUTPUT_DIR}/17_UI_UX_Specification.pdf", pagesize=A4,
                            rightMargin=0.6*inch, leftMargin=0.6*inch, topMargin=0.6*inch, bottomMargin=0.6*inch)
    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
    print("Generated: 17_UI_UX_Specification.pdf")

# ============================================================
# MAIN
# ============================================================
if __name__ == "__main__":
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print("Generating all Drishyam development documents...\n")
    generate_prd()
    generate_srs()
    generate_architecture()
    generate_db_schema()
    generate_api_spec()
    generate_ai_requirements()
    generate_tech_stack()
    generate_auth_doc()
    generate_user_flow()
    generate_security()
    generate_edge_cases()
    generate_business_logic()
    generate_readme()
    generate_testing()
    generate_deployment()
    generate_ai_cost_eval()
    generate_uiux()
    print("\n✅ All documents generated successfully in:", OUTPUT_DIR)
