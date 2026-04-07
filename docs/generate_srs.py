#!/usr/bin/env python3
"""Generate HEALTH AI SRS Document (Updated) with live screenshots."""

from docx import Document
from docx.shared import Inches, Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_ALIGN_VERTICAL
from docx.enum.section import WD_ORIENT
import os

doc = Document()

# ───────── PAGE SETUP ─────────
for section in doc.sections:
    section.top_margin = Cm(2.5)
    section.bottom_margin = Cm(2.5)
    section.left_margin = Cm(2.5)
    section.right_margin = Cm(2.5)

# ───────── STYLES ─────────
style = doc.styles['Normal']
font = style.font
font.name = 'Calibri'
font.size = Pt(11)
font.color.rgb = RGBColor(0x33, 0x33, 0x33)
style.paragraph_format.line_spacing = 1.15
style.paragraph_format.space_after = Pt(6)

for level in range(1, 4):
    h = doc.styles[f'Heading {level}']
    h.font.name = 'Calibri'
    h.font.color.rgb = RGBColor(0x1a, 0x1a, 0x2e)
    h.font.bold = True
    if level == 1:
        h.font.size = Pt(22)
        h.paragraph_format.space_before = Pt(24)
        h.paragraph_format.space_after = Pt(12)
    elif level == 2:
        h.font.size = Pt(16)
        h.paragraph_format.space_before = Pt(18)
        h.paragraph_format.space_after = Pt(8)
    else:
        h.font.size = Pt(13)
        h.paragraph_format.space_before = Pt(12)
        h.paragraph_format.space_after = Pt(6)

SCREENSHOTS_DIR = os.path.join(os.path.dirname(__file__), 'screenshots')

def add_screenshot(doc, filename, caption, width=Inches(5.8)):
    path = os.path.join(SCREENSHOTS_DIR, filename)
    if os.path.exists(path):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = p.add_run()
        run.add_picture(path, width=width)
        cap = doc.add_paragraph(f'Figure: {caption}')
        cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        cap.runs[0].font.size = Pt(9)
        cap.runs[0].font.italic = True
        cap.runs[0].font.color.rgb = RGBColor(0x66, 0x66, 0x66)
        doc.add_paragraph()
    else:
        doc.add_paragraph(f'[Screenshot not available: {filename}]')


def add_table_row(table, cells_data, bold=False):
    row = table.add_row()
    for i, text in enumerate(cells_data):
        cell = row.cells[i]
        cell.text = str(text)
        cell.paragraphs[0].runs[0].font.size = Pt(10)
        if bold:
            cell.paragraphs[0].runs[0].bold = True
    return row


# ══════════════════════════════════════════════════════════════════
#                     COVER PAGE
# ══════════════════════════════════════════════════════════════════

doc.add_paragraph()
doc.add_paragraph()
doc.add_paragraph()

title = doc.add_paragraph()
title.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = title.add_run('HEALTH AI')
run.font.size = Pt(36)
run.font.bold = True
run.font.color.rgb = RGBColor(0x3b, 0x3b, 0x98)

subtitle = doc.add_paragraph()
subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = subtitle.add_run('European HealthTech Co-Creation & Innovation Platform')
run.font.size = Pt(14)
run.font.color.rgb = RGBColor(0x55, 0x55, 0x55)

doc.add_paragraph()

doc_title = doc.add_paragraph()
doc_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = doc_title.add_run('Software Requirements Specification (SRS)')
run.font.size = Pt(20)
run.font.bold = True
run.font.color.rgb = RGBColor(0x1a, 0x1a, 0x2e)

doc.add_paragraph()

version = doc.add_paragraph()
version.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = version.add_run('Version 2.0 — Updated April 2026')
run.font.size = Pt(12)
run.font.color.rgb = RGBColor(0x88, 0x88, 0x88)

doc.add_paragraph()

# Group Info
group_title = doc.add_paragraph()
group_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
run = group_title.add_run('Group: Health Shield')
run.font.size = Pt(16)
run.font.bold = True
run.font.color.rgb = RGBColor(0x1a, 0x1a, 0x2e)

members_p = doc.add_paragraph()
members_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
for member in ['Cem Özal', 'Emre Kurubaş', 'Hasabu Can Eltayeb', 'Sertaç Ataç']:
    run = members_p.add_run(member + '\n')
    run.font.size = Pt(12)
    run.font.color.rgb = RGBColor(0x55, 0x55, 0x55)

doc.add_paragraph()

# Revision Info Table
info_table = doc.add_table(rows=1, cols=2)
info_table.style = 'Light Grid Accent 1'
info_table.columns[0].width = Inches(2)
info_table.columns[1].width = Inches(4)

info_data = [
    ('Document', 'Software Requirements Specification'),
    ('Project', 'HEALTH AI Platform'),
    ('Group', 'Health Shield'),
    ('Members', 'Cem Özal, Emre Kurubaş, Hasabu Can Eltayeb, Sertaç Ataç'),
    ('Version', '2.0'),
    ('Date', 'April 1, 2026'),
    ('Course', 'SENG 384'),
    ('Status', 'Final — Updated with Current UI'),
]
for label, value in info_data:
    row = info_table.add_row()
    row.cells[0].text = label
    row.cells[1].text = value
    row.cells[0].paragraphs[0].runs[0].bold = True
    row.cells[0].paragraphs[0].runs[0].font.size = Pt(10)
    row.cells[1].paragraphs[0].runs[0].font.size = Pt(10)

# Remove first empty row
info_table._tbl.remove(info_table.rows[0]._tr)

doc.add_page_break()

# ══════════════════════════════════════════════════════════════════
#                  TABLE OF CONTENTS
# ══════════════════════════════════════════════════════════════════

doc.add_heading('Table of Contents', level=1)
toc_items = [
    '1. Introduction',
    '   1.1 Purpose',
    '   1.2 Scope',
    '   1.3 Definitions, Acronyms, and Abbreviations',
    '   1.4 References',
    '   1.5 Overview',
    '2. Overall Description',
    '   2.1 Product Perspective',
    '   2.2 Product Functions',
    '   2.3 User Characteristics',
    '   2.4 Constraints',
    '   2.5 Assumptions and Dependencies',
    '3. Specific Requirements',
    '   3.1 Functional Requirements',
    '   3.2 Non-Functional Requirements',
    '   3.3 User Interface Requirements',
    '4. System Architecture',
    '5. Data Model',
    '6. Appendix — UI Screenshots',
]
for item in toc_items:
    p = doc.add_paragraph(item)
    p.paragraph_format.space_after = Pt(2)
    p.runs[0].font.size = Pt(11)

doc.add_page_break()


# ══════════════════════════════════════════════════════════════════
#                1. INTRODUCTION
# ══════════════════════════════════════════════════════════════════

doc.add_heading('1. Introduction', level=1)

doc.add_heading('1.1 Purpose', level=2)
doc.add_paragraph(
    'This Software Requirements Specification (SRS) document provides a comprehensive and updated description '
    'of the HEALTH AI platform — a European HealthTech co-creation and innovation platform. It defines '
    'all functional and non-functional requirements for the current production version of the system. '
    'This document serves as the authoritative reference for development, testing, and stakeholder validation.'
)

doc.add_heading('1.2 Scope', level=2)
doc.add_paragraph(
    'HEALTH AI is a secure, GDPR-compliant web application that enables structured partner discovery '
    'between healthcare professionals and engineers/developers. The platform facilitates cross-disciplinary '
    'collaboration through a structured workflow: users post announcements describing their projects and '
    'expertise needs, browse complementary posts, express interest with NDA acceptance, propose meeting times, '
    'and schedule external meetings (Zoom/Teams). The platform never stores patient data, intellectual '
    'property documents, or meeting recordings.'
)
doc.add_paragraph('Key capabilities include:')
items = [
    'User registration and authentication with institutional .edu email validation',
    'Structured announcement creation with multi-step wizard (Core Details → Technical Info → Settings)',
    'Advanced search and filtering dashboard with domain, stage, country, city, and status filters',
    'NDA-gated interest expression and meeting scheduling workflow',
    'Real-time messaging system with typing indicators and read receipts (Firebase Firestore)',
    'User profile management with GDPR data export (Art. 20) and account deletion (Art. 17)',
    'Admin dashboard with user management, post moderation, and audit log export',
    'Notification system for interest expressions, meeting requests, and responses',
    'Dark/Light theme toggle with persistent state',
    'Bookmark/Save functionality for posts',
    'Responsive design for mobile and desktop viewports',
]
for item in items:
    doc.add_paragraph(item, style='List Bullet')

doc.add_heading('1.3 Definitions, Acronyms, and Abbreviations', level=2)
defs_table = doc.add_table(rows=1, cols=2)
defs_table.style = 'Light Grid Accent 1'
defs_table.rows[0].cells[0].text = 'Term'
defs_table.rows[0].cells[1].text = 'Definition'
defs_table.rows[0].cells[0].paragraphs[0].runs[0].bold = True
defs_table.rows[0].cells[1].paragraphs[0].runs[0].bold = True

defs = [
    ('SRS', 'Software Requirements Specification'),
    ('GDPR', 'General Data Protection Regulation (EU 2016/679)'),
    ('NDA', 'Non-Disclosure Agreement'),
    ('IP', 'Intellectual Property'),
    ('API', 'Application Programming Interface'),
    ('CRUD', 'Create, Read, Update, Delete'),
    ('SPA', 'Single Page Application'),
    ('JWT', 'JSON Web Token'),
    ('RT', 'Real-Time'),
    ('UI/UX', 'User Interface / User Experience'),
    ('RBAC', 'Role-Based Access Control'),
]
for term, definition in defs:
    row = defs_table.add_row()
    row.cells[0].text = term
    row.cells[1].text = definition
    row.cells[0].paragraphs[0].runs[0].font.size = Pt(10)
    row.cells[1].paragraphs[0].runs[0].font.size = Pt(10)

doc.add_paragraph()

doc.add_heading('1.4 References', level=2)
refs = [
    'IEEE Std 830-1998 — Recommended Practice for Software Requirements Specifications',
    'GDPR — Regulation (EU) 2016/679 of the European Parliament',
    'Firebase Firestore Documentation — https://firebase.google.com/docs/firestore',
    'React.js Documentation — https://react.dev',
    'Vite Build Tool — https://vitejs.dev',
]
for ref in refs:
    doc.add_paragraph(ref, style='List Bullet')

doc.add_heading('1.5 Overview', level=2)
doc.add_paragraph(
    'The remainder of this document is organized as follows: Section 2 provides an overall description '
    'of the product including its functions, user characteristics, and constraints. Section 3 details '
    'specific functional and non-functional requirements. Section 4 describes the system architecture. '
    'Section 5 covers the data model. Section 6 provides an appendix with current UI screenshots.'
)

doc.add_page_break()

# ══════════════════════════════════════════════════════════════════
#             2. OVERALL DESCRIPTION
# ══════════════════════════════════════════════════════════════════

doc.add_heading('2. Overall Description', level=1)

doc.add_heading('2.1 Product Perspective', level=2)
doc.add_paragraph(
    'HEALTH AI is a standalone web application built as a React Single Page Application (SPA) '
    'with Firebase Firestore as the backend database. The system is designed to operate independently '
    'without requiring integration with external hospital or university systems. It serves as a neutral '
    'intermediary that facilitates first-contact between healthcare professionals and engineers.'
)
doc.add_paragraph(
    'The platform is deployed as a static web application with real-time database capabilities provided '
    'by Firebase Firestore subscriptions. All data synchronization happens through Firestore\'s real-time '
    'listeners, enabling instant updates across connected clients.'
)

doc.add_heading('2.2 Product Functions', level=2)
doc.add_paragraph('The HEALTH AI platform provides the following major functions:')

functions = [
    ('Authentication & Registration', 'Institutional .edu email-based registration with SHA-256 password hashing. Login/logout with session management. Personal email providers (Gmail, Yahoo, etc.) are blocked.'),
    ('Announcement Management', 'Multi-step announcement creation wizard with fields for title, domain, project stage, description, technical blueprint, required expertise, collaboration type, confidentiality level, location, and expiry. Posts support editing and status transitions (Active → Meeting Scheduled → CLOSED/Partner Found).'),
    ('Discovery & Filtering', 'Advanced dashboard with real-time search across titles, descriptions, domains, and expertise fields. Multi-dimensional filtering by domain, project stage, country, city, and status. Feed tabs for All Channels and Saved Projects.'),
    ('Interest & Meeting Workflow', 'NDA acceptance modal before expressing interest with optional message. Time slot proposal system with auto-generated weekday slots. Author can accept/decline meeting requests. Meeting confirmed state links to external platforms (Zoom/Teams).'),
    ('Real-Time Messaging', 'Firebase-backed 1-on-1 chat system with conversation list, message search, typing indicators, read receipts (single/double check), date-grouped messages, and conversation management (clear history, delete).'),
    ('Profile & GDPR', 'User profile with editable fields (name, institution, country, city). GDPR-compliant data export (JSON, Art. 20) and account deletion (Art. 17). Post statistics display.'),
    ('Admin Dashboard', 'System overview with user/post/log counts. User management table with freeze/unfreeze capability. Post moderation with delete. Audit log viewer with search, role filter, action filter, and CSV export.'),
    ('Notifications', 'Real-time notification bell with count badge. Notifications for interest expressions, meeting requests, and responses. Individual and bulk dismiss.'),
    ('UI/UX Features', 'Dark/light theme toggle. Animated page transitions (Framer Motion). 3D parallax tilt cards on dashboard. Animated DNA helix on landing page. Skeleton loaders. Network status indicator. Global error boundary.'),
]
for title, desc in functions:
    p = doc.add_paragraph()
    run = p.add_run(f'{title}: ')
    run.bold = True
    run.font.size = Pt(11)
    p.add_run(desc).font.size = Pt(11)

doc.add_heading('2.3 User Characteristics', level=2)
doc.add_paragraph('The system supports three distinct user roles:')

roles_table = doc.add_table(rows=1, cols=3)
roles_table.style = 'Light Grid Accent 1'
roles_table.rows[0].cells[0].text = 'Role'
roles_table.rows[0].cells[1].text = 'Description'
roles_table.rows[0].cells[2].text = 'Capabilities'
for cell in roles_table.rows[0].cells:
    cell.paragraphs[0].runs[0].bold = True

roles_data = [
    ('Healthcare Professional', 'Doctors, clinicians, researchers with clinical expertise who have innovative ideas needing engineering support.', 'Create/manage posts, browse engineer posts, express interest, propose meetings, manage profile, use messaging, export/delete data'),
    ('Engineer / Developer', 'Software engineers, hardware engineers, biomedical engineers with technical capabilities seeking clinical validation.', 'Create/manage posts, browse healthcare posts, express interest, propose meetings, manage profile, use messaging, export/delete data'),
    ('Admin', 'Platform administrator with full oversight capabilities.', 'All user capabilities + user management (freeze/unfreeze), post moderation (delete any post), audit log viewer with filtering and CSV export'),
]
for role, desc, caps in roles_data:
    row = roles_table.add_row()
    row.cells[0].text = role
    row.cells[1].text = desc
    row.cells[2].text = caps
    for cell in row.cells:
        cell.paragraphs[0].runs[0].font.size = Pt(9)

doc.add_paragraph()

doc.add_heading('2.4 Constraints', level=2)
constraints = [
    'Only institutional .edu email addresses are accepted for registration.',
    'No patient data, medical records, or clinical datasets are stored on the platform.',
    'No intellectual property documents are uploaded or stored — the platform facilitates contact only.',
    'Meetings take place on external platforms (Zoom, Teams); the platform does not host video calls.',
    'The platform requires an active internet connection for all Firebase real-time features.',
    'Password hashing uses SHA-256 via the Web Crypto API (client-side).',
    'Firebase Firestore imposes rate limits and document size constraints.',
]
for c in constraints:
    doc.add_paragraph(c, style='List Bullet')

doc.add_heading('2.5 Assumptions and Dependencies', level=2)
assumptions = [
    'Users have access to a modern web browser (Chrome, Firefox, Safari, Edge).',
    'Firebase Firestore remains available with current API compatibility.',
    'Users possess valid institutional .edu email addresses.',
    'External meeting platforms (Zoom, Teams) are available for scheduled meetings.',
    'Network connectivity is available for real-time collaboration features.',
]
for a in assumptions:
    doc.add_paragraph(a, style='List Bullet')

doc.add_page_break()

# ══════════════════════════════════════════════════════════════════
#             3. SPECIFIC REQUIREMENTS
# ══════════════════════════════════════════════════════════════════

doc.add_heading('3. Specific Requirements', level=1)

doc.add_heading('3.1 Functional Requirements', level=2)

# FR Table
fr_table = doc.add_table(rows=1, cols=4)
fr_table.style = 'Light Grid Accent 1'
headers = ['ID', 'Requirement', 'Description', 'Priority']
for i, h in enumerate(headers):
    fr_table.rows[0].cells[i].text = h
    fr_table.rows[0].cells[i].paragraphs[0].runs[0].bold = True
    fr_table.rows[0].cells[i].paragraphs[0].runs[0].font.size = Pt(9)

fr_data = [
    # Authentication
    ('FR-01', 'User Registration', 'Users register with .edu email, password (min 6 chars), full name with title, role selection (Healthcare Professional / Engineer), institution, country, and city. Personal email providers are blocked.', 'High'),
    ('FR-02', 'User Login', 'Registered users login with email and SHA-256 hashed password. Failed attempts are logged to audit trail.', 'High'),
    ('FR-03', 'User Logout', 'Users can log out via navbar button. Session is cleared from local state.', 'High'),
    ('FR-04', 'Admin Auto-Detection', 'Registration with admin@healthai.edu automatically assigns the Admin role.', 'Medium'),
    # Posts
    ('FR-05', 'Create Announcement', 'Multi-step wizard (3 steps): Step 1: Title, Domain, Project Stage, Description. Step 2: Technical Blueprint (optional, NDA-gated), Required Expertise, Collaboration Type. Step 3: Country, City, Confidentiality Level, Expiry Days.', 'High'),
    ('FR-06', 'Browse Announcements', 'Dashboard displays all non-deleted posts with search, domain filter, stage filter, country filter, city filter, and status filter. Default filter shows Active posts.', 'High'),
    ('FR-07', 'View Post Detail', 'Two-column layout: main content (status badges, title, metadata chips, executive overview, technical blueprint, required expertise) and sidebar (target counterparty info, workflow actions, author card).', 'High'),
    ('FR-08', 'Edit Announcement', 'Post authors can edit title and description via modal dialog.', 'Medium'),
    ('FR-09', 'Close Announcement', 'Authors can mark posts as "Partner Found" (CLOSED status).', 'High'),
    ('FR-10', 'Bookmark Posts', 'Users can bookmark/save posts. Saved posts appear in "Saved Projects" tab.', 'Medium'),
    ('FR-11', 'Post Expiry', 'Each post has a configurable expiry date (15/30/60/90 days).', 'Low'),
    # Interest & Meeting
    ('FR-12', 'Express Interest', 'Cross-role users can express interest after accepting NDA terms. Optional message can be included.', 'High'),
    ('FR-13', 'NDA Modal', 'Interest expression requires explicit NDA acceptance via interactive checkbox modal with custom styling.', 'High'),
    ('FR-14', 'Propose Meeting', 'After expressing interest, users see auto-generated weekday time slots (10:00, 14:00, 16:00) for the next 5 business days.', 'High'),
    ('FR-15', 'Respond to Meeting', 'Post authors can accept or decline meeting requests. Acceptance triggers status update to "Meeting Scheduled".', 'High'),
    ('FR-16', 'Confidential Posts', 'Posts with "meeting-only" confidentiality hide the Technical Blueprint section for non-authors until NDA is signed.', 'High'),
    # Chat
    ('FR-17', 'Real-Time Messaging', 'Firebase-backed 1-on-1 chat with conversation list, message history, and real-time updates.', 'High'),
    ('FR-18', 'Typing Indicators', 'Real-time typing status shown to the other participant via Firestore field updates.', 'Medium'),
    ('FR-19', 'Read Receipts', 'Messages display single check (sent) or double check (read) indicators.', 'Medium'),
    ('FR-20', 'User Discovery', 'Chat sidebar allows discovering and starting conversations with any registered user.', 'Medium'),
    ('FR-21', 'Chat Management', 'Users can clear message history or delete entire conversations.', 'Low'),
    ('FR-22', 'Message from Post', 'PostDetail page includes a "Message" button to initiate chat with the post author directly.', 'Medium'),
    # Profile & GDPR
    ('FR-23', 'Edit Profile', 'Users can edit name, institution, country, and city via inline editing form.', 'Medium'),
    ('FR-24', 'GDPR Data Export', 'Users can export their complete data (profile + posts) as a JSON file per GDPR Art. 20.', 'High'),
    ('FR-25', 'GDPR Account Deletion', 'Users can permanently delete their account with confirmation modal per GDPR Art. 17.', 'High'),
    # Admin
    ('FR-26', 'Admin Overview', 'Dashboard overview cards showing total users, total announcements, active projects, and monitored events.', 'Medium'),
    ('FR-27', 'User Management', 'Admin can view all users in a table and freeze/unfreeze accounts.', 'High'),
    ('FR-28', 'Post Moderation', 'Admin can view all posts in a table and delete any post.', 'High'),
    ('FR-29', 'Audit Log Viewer', 'Filterable/searchable audit log table with timestamp, user, action type, and details. Supports CSV export.', 'High'),
    # Notifications
    ('FR-30', 'Notification System', 'Real-time notifications for interest expressions, meeting requests, and responses. Bell icon with count badge.', 'Medium'),
    ('FR-31', 'Notification Dismissal', 'Individual notification dismiss and "dismiss all" functionality.', 'Low'),
    # UI
    ('FR-32', 'Theme Toggle', 'Dark/Light mode toggle accessible from the navbar.', 'Low'),
    ('FR-33', 'Responsive Design', 'Application adapts to mobile and desktop viewports with responsive grids and collapsible navigation.', 'Medium'),
    ('FR-34', 'Page Transitions', 'Animated page transitions using Framer Motion AnimatePresence.', 'Low'),
    ('FR-35', 'Match Indicators', 'Dashboard cards show match indicators (same city, complementary role) to help users find relevant partners.', 'Medium'),
]

for fr_id, name, desc, priority in fr_data:
    row = fr_table.add_row()
    row.cells[0].text = fr_id
    row.cells[1].text = name
    row.cells[2].text = desc
    row.cells[3].text = priority
    for cell in row.cells:
        cell.paragraphs[0].runs[0].font.size = Pt(8)

doc.add_paragraph()

doc.add_heading('3.2 Non-Functional Requirements', level=2)

nfr_table = doc.add_table(rows=1, cols=3)
nfr_table.style = 'Light Grid Accent 1'
for i, h in enumerate(['ID', 'Category', 'Requirement']):
    nfr_table.rows[0].cells[i].text = h
    nfr_table.rows[0].cells[i].paragraphs[0].runs[0].bold = True
    nfr_table.rows[0].cells[i].paragraphs[0].runs[0].font.size = Pt(9)

nfrs = [
    ('NFR-01', 'Performance', 'Pages should load within 2 seconds on standard broadband. Real-time updates (messages, notifications) should appear within 500ms.'),
    ('NFR-02', 'Security', 'Passwords hashed with SHA-256. No plaintext passwords stored. Only .edu emails accepted. Personal email providers blocked. Failed login attempts logged.'),
    ('NFR-03', 'Privacy (GDPR)', 'Minimal data collection. No patient data stored. Right to export (Art. 20). Right to delete (Art. 17). Right to access (Art. 15). No IP documents stored on platform.'),
    ('NFR-04', 'Scalability', 'Firebase Firestore automatically scales. Client-side rendering with React ensures frontend scalability.'),
    ('NFR-05', 'Usability', 'Intuitive navigation with max 3 clicks to any feature. Multi-step wizard guides announcement creation. Visual feedback for all actions.'),
    ('NFR-06', 'Reliability', 'Global error boundary catches rendering errors. Network status indicator warns of connectivity issues. Graceful degradation when Firebase is unavailable.'),
    ('NFR-07', 'Accessibility', 'Semantic HTML5 elements. Unique IDs on interactive elements. Keyboard-navigable forms. Sufficient color contrast ratios.'),
    ('NFR-08', 'Maintainability', 'Modular React component architecture. Custom hooks for business logic separation (useAuth, useChat, useNotifications, usePosts). Centralized Firestore service layer.'),
    ('NFR-09', 'Compatibility', 'Supports Chrome, Firefox, Safari, and Edge (latest 2 versions). Responsive from 320px to 2560px viewport width.'),
]
for nfr_id, cat, req in nfrs:
    row = nfr_table.add_row()
    row.cells[0].text = nfr_id
    row.cells[1].text = cat
    row.cells[2].text = req
    for cell in row.cells:
        cell.paragraphs[0].runs[0].font.size = Pt(9)

doc.add_paragraph()

doc.add_heading('3.3 User Interface Requirements', level=2)
doc.add_paragraph(
    'The HEALTH AI platform features a premium dark-mode interface with glassmorphism design elements, '
    'gradient accents, and smooth micro-animations. The following screenshots represent the current '
    'production state of the application as of April 2026.'
)

doc.add_heading('3.3.1 Landing Page', level=3)
doc.add_paragraph(
    'The landing page serves as the primary entry point for unauthenticated users. It features a full-viewport '
    'hero section with an animated 3D DNA helix background, gradient text headings ("Where Healthcare Meets Engineering"), '
    'trust indicators (GDPR Compliant, NDA Protected, .edu Only), animated counters for platform statistics, '
    'a feature grid with hover-effect cards, a 5-step workflow visualization, dual persona cards (Engineer/Doctor), '
    'and a call-to-action section. The floating navbar includes the HEALTH AI logo and an "Access Platform" button.'
)
add_screenshot(doc, 'landing_page.png', 'Landing Page — Hero section with animated DNA helix and platform statistics')

doc.add_heading('3.3.2 Login / Registration Page', level=3)
doc.add_paragraph(
    'The authentication page supports both Sign In and Register modes via a tab switcher. The login mode '
    'requires institutional .edu email and password. The registration mode adds fields for full name with title, '
    'role selection (Healthcare Professional / Engineer), institution, country, and city. The form features '
    'inline field icons, animated error messages, a verifying spinner, password visibility toggle, and '
    'GDPR/NDA trust indicators at the bottom.'
)
add_screenshot(doc, 'login_page.png', 'Login Page — Secure sign-in form with .edu email validation')

doc.add_heading('3.3.3 Dashboard (Innovator Feed)', level=3)
doc.add_paragraph(
    'The main dashboard displays all announcements in a responsive grid layout with 3D parallax tilt cards. '
    'The header shows "Innovator Feed" with a "New Announcement" button. Tabs allow switching between '
    '"All Channels" and "Saved Projects". The advanced filter panel supports real-time text search, domain filter, '
    'stage filter, country filter, city filter, and status filter with a result counter. Each card shows '
    'role badge (Engineer/Healthcare Professional), domain badge, status badge, title, description excerpt, '
    'match indicators (same city, complementary role), required partner type, author avatar, and bookmark button.'
)
add_screenshot(doc, 'dashboard_page.png', 'Dashboard — Innovator Feed with filtering and announcement cards')

doc.add_heading('3.3.4 Create Announcement (Multi-Step Wizard)', level=3)
doc.add_paragraph(
    'The announcement creation form uses a 3-step wizard with visual progress indicators. '
    'Step 1 (Core Details) includes title, domain selector, project stage cards (Idea, Concept Validation, '
    'Prototype Developed, Pilot Testing, Pre-Deployment) with icons and descriptions, and project description textarea. '
    'Step 2 (Technical Info) includes technical blueprint textarea (NDA-gated), required expertise, and collaboration type. '
    'Step 3 (Settings) includes country/city, confidentiality level cards (Public Info / NDA Protected), and expiry selector. '
    'Navigation buttons allow going back/forward between steps, with the final step showing a "Publish Announcement" button.'
)
add_screenshot(doc, 'create_post_page.png', 'Create Announcement — Step 1: Core Details with project stage selection')

doc.add_heading('3.3.5 Post Detail Page', level=3)
doc.add_paragraph(
    'The post detail page uses a two-column layout. The main content panel shows status badges, post title, '
    'metadata chips (stage, location, date, expiry), executive overview section, technical blueprint section '
    '(locked if confidential), and required expertise section. The sidebar shows the target counterparty card '
    '(required role, collaboration type, data sharing level), workflow action buttons (Express Interest → '
    'Propose Meeting → Meeting Confirmed), and a "Posted By" author card with a direct message button.'
)
add_screenshot(doc, 'post_detail_page.png', 'Post Detail — Two-column layout with NDA-gated technical blueprint')

doc.add_heading('3.3.6 Chat / Messages Page', level=3)
doc.add_paragraph(
    'The messaging interface uses a two-panel layout. The left sidebar shows the conversation list with '
    'search functionality, user avatars, last messages, timestamps, unread badges, and delete options. '
    'A "New Chat" button opens a user discovery list. The main chat area displays date-grouped messages '
    'with sender-specific bubble alignment, typing indicators (animated dots), read receipts (single/double check), '
    'and a message input with conditional send button. An options menu provides "Clear History" and "Delete Conversation" actions.'
)
add_screenshot(doc, 'chat_page.png', 'Messages Page — Real-time chat with conversation sidebar')

doc.add_heading('3.3.7 Profile Page', level=3)
doc.add_paragraph(
    'The profile page uses a two-column layout. The left card displays user avatar (gradient initial), '
    'name, role badge, email, institution, location, join date, and post statistics (total/active/closed). '
    'The right panel has two sections: Profile Settings (editable fields for name, institution, country, city '
    'with edit/save/cancel controls) and Data Privacy (GDPR) section with "Export My Data (JSON)" button '
    'and "Delete My Account (Art. 17)" button with confirmation modal.'
)
add_screenshot(doc, 'profile_page.png', 'Profile Page — User info, settings, and GDPR data privacy controls')

doc.add_page_break()

# ══════════════════════════════════════════════════════════════════
#             4. SYSTEM ARCHITECTURE
# ══════════════════════════════════════════════════════════════════

doc.add_heading('4. System Architecture', level=1)

doc.add_paragraph(
    'The HEALTH AI platform follows a client-side rendered (CSR) architecture with Firebase as the backend service. '
    'The following diagram illustrates the high-level architecture:'
)

doc.add_heading('4.1 Technology Stack', level=2)

tech_table = doc.add_table(rows=1, cols=3)
tech_table.style = 'Light Grid Accent 1'
for i, h in enumerate(['Layer', 'Technology', 'Purpose']):
    tech_table.rows[0].cells[i].text = h
    tech_table.rows[0].cells[i].paragraphs[0].runs[0].bold = True

tech_data = [
    ('Frontend Framework', 'React 18 (JSX)', 'Component-based UI rendering'),
    ('Build Tool', 'Vite 7.x', 'Fast development server and production bundling'),
    ('Routing', 'React Router v6', 'Client-side routing with protected/guest routes'),
    ('Animation', 'Framer Motion', 'Page transitions, scroll reveals, micro-animations'),
    ('3D Effects', 'react-parallax-tilt', '3D card tilt effects on dashboard'),
    ('Icons', 'Lucide React', 'Consistent icon library'),
    ('Database', 'Firebase Firestore', 'Real-time NoSQL document database'),
    ('Authentication', 'Custom (Firestore + SHA-256)', 'Client-side auth with hashed passwords'),
    ('Styling', 'Vanilla CSS + CSS Variables', 'Theme system with dark/light mode support'),
    ('State Management', 'React Hooks (Custom)', 'useAuth, useChat, useNotifications, usePosts'),
]
for layer, tech, purpose in tech_data:
    row = tech_table.add_row()
    row.cells[0].text = layer
    row.cells[1].text = tech
    row.cells[2].text = purpose
    for cell in row.cells:
        cell.paragraphs[0].runs[0].font.size = Pt(9)

doc.add_paragraph()

doc.add_heading('4.2 Component Architecture', level=2)
doc.add_paragraph('The application is organized into the following module structure:')

comp_items = [
    'Pages: LandingPage, Login, Dashboard, CreatePost, PostDetail, MyPosts, Profile, AdminDashboard, Chat',
    'Components: Navbar, Notifications, ThemeToggle, HeroDNA, PageTransition, SkeletonLoader, NetworkStatus, GlobalErrorBoundary, AnimatedCounter',
    'Hooks: useAuth (authentication state), usePosts (CRUD + real-time), useChat (messaging), useNotifications (notification management)',
    'Services: firestore.js (all Firestore operations: CRUD, subscriptions, chat, presence, activity logs)',
    'Routes: AppRoutes.jsx (ProtectedRoute, GuestRoute wrappers with AnimatePresence)',
]
for item in comp_items:
    doc.add_paragraph(item, style='List Bullet')

doc.add_heading('4.3 Real-Time Data Flow', level=2)
doc.add_paragraph(
    'The platform uses Firestore real-time listeners (onSnapshot) for the following collections: '
    'posts (subscribeToPostsRT), users (subscribeToUsersRT), activityLogs (subscribeToLogsRT), '
    'notifications (subscribeToNotificationsRT), conversations (subscribeToConversationsRT), '
    'and messages (subscribeToMessagesRT). This ensures all connected clients receive immediate '
    'updates without polling.'
)

doc.add_page_break()

# ══════════════════════════════════════════════════════════════════
#             5. DATA MODEL
# ══════════════════════════════════════════════════════════════════

doc.add_heading('5. Data Model', level=1)
doc.add_paragraph('The Firestore database uses the following collections:')

doc.add_heading('5.1 Users Collection', level=2)
users_fields = [
    ('id', 'string', 'Unique user identifier'),
    ('name', 'string', 'Full name with title'),
    ('email', 'string', 'Institutional .edu email'),
    ('passwordHash', 'string', 'SHA-256 hashed password'),
    ('role', 'string', 'Healthcare Professional | Engineer | Admin'),
    ('institution', 'string', 'University or organization'),
    ('city', 'string', 'User city'),
    ('country', 'string', 'User country'),
    ('registeredAt', 'string (ISO)', 'Registration timestamp'),
    ('status', 'string', 'active | frozen'),
    ('lastLogin', 'string (ISO)', 'Last login timestamp'),
    ('isOnline', 'boolean', 'Current online status'),
    ('lastSeen', 'timestamp', 'Server timestamp of last activity'),
    ('savedPosts', 'array', 'List of bookmarked post IDs'),
]
ut = doc.add_table(rows=1, cols=3)
ut.style = 'Light Grid Accent 1'
for i, h in enumerate(['Field', 'Type', 'Description']):
    ut.rows[0].cells[i].text = h
    ut.rows[0].cells[i].paragraphs[0].runs[0].bold = True
for field, ftype, desc in users_fields:
    row = ut.add_row()
    row.cells[0].text = field
    row.cells[1].text = ftype
    row.cells[2].text = desc
    for cell in row.cells:
        cell.paragraphs[0].runs[0].font.size = Pt(9)

doc.add_paragraph()

doc.add_heading('5.2 Posts Collection', level=2)
posts_fields = [
    ('id', 'string', 'Unique post identifier'),
    ('title', 'string', 'Announcement title'),
    ('domain', 'string', 'Medical/tech domain'),
    ('projectStage', 'string', 'idea | concept validation | prototype developed | pilot testing | pre-deployment'),
    ('explanation', 'string', 'Project description'),
    ('highLevelIdea', 'string', 'Technical blueprint (NDA-gated if confidential)'),
    ('expertiseNeeded', 'string', 'Required partner expertise'),
    ('collaborationType', 'string', 'co-development | advisory | licensing | joint research | pilot partnership'),
    ('commitmentLevel', 'string', 'Collaboration commitment type'),
    ('confidentiality', 'string', 'overview-public | meeting-only'),
    ('city', 'string', 'Project city'),
    ('country', 'string', 'Project country'),
    ('authorId', 'string', 'Author user ID'),
    ('authorName', 'string', 'Author display name'),
    ('authorRole', 'string', 'Author role'),
    ('createdAt', 'string (ISO)', 'Creation timestamp'),
    ('expiryDate', 'string (ISO)', 'Expiry timestamp'),
    ('status', 'string', 'Active | Meeting Scheduled | CLOSED | Expired | DELETED'),
    ('interests', 'array', 'Express interest records'),
    ('meetings', 'array', 'Meeting request records'),
]
pt = doc.add_table(rows=1, cols=3)
pt.style = 'Light Grid Accent 1'
for i, h in enumerate(['Field', 'Type', 'Description']):
    pt.rows[0].cells[i].text = h
    pt.rows[0].cells[i].paragraphs[0].runs[0].bold = True
for field, ftype, desc in posts_fields:
    row = pt.add_row()
    row.cells[0].text = field
    row.cells[1].text = ftype
    row.cells[2].text = desc
    for cell in row.cells:
        cell.paragraphs[0].runs[0].font.size = Pt(9)

doc.add_paragraph()

doc.add_heading('5.3 Conversations Collection', level=2)
conv_fields = [
    ('id', 'string', 'Deterministic ID from sorted member IDs'),
    ('members', 'array', 'Two user IDs'),
    ('memberData', 'map', 'Member name/role for each user'),
    ('lastMessage', 'string', 'Last message preview'),
    ('updatedAt', 'timestamp', 'Last activity server timestamp'),
    ('unreadCount', 'map', 'Per-user unread message count'),
    ('isTyping', 'map', 'Per-user typing status'),
]
ct = doc.add_table(rows=1, cols=3)
ct.style = 'Light Grid Accent 1'
for i, h in enumerate(['Field', 'Type', 'Description']):
    ct.rows[0].cells[i].text = h
    ct.rows[0].cells[i].paragraphs[0].runs[0].bold = True
for field, ftype, desc in conv_fields:
    row = ct.add_row()
    row.cells[0].text = field
    row.cells[1].text = ftype
    row.cells[2].text = desc
    for cell in row.cells:
        cell.paragraphs[0].runs[0].font.size = Pt(9)

doc.add_paragraph()

doc.add_heading('5.4 Activity Logs Collection', level=2)
log_fields = [
    ('id', 'string', 'Log entry identifier'),
    ('timestamp', 'string (ISO)', 'Event timestamp'),
    ('userId', 'string', 'Acting user ID'),
    ('userName', 'string', 'Acting user name'),
    ('role', 'string', 'Acting user role'),
    ('actionType', 'string', 'LOGIN | LOGIN_FAILED | POST_CREATE | POST_CLOSE | MEETING_REQUEST | LOGOUT etc.'),
    ('targetEntity', 'string', 'Target resource identifier'),
    ('result', 'string', 'success | failure'),
    ('details', 'string', 'Human-readable event description'),
]
lt = doc.add_table(rows=1, cols=3)
lt.style = 'Light Grid Accent 1'
for i, h in enumerate(['Field', 'Type', 'Description']):
    lt.rows[0].cells[i].text = h
    lt.rows[0].cells[i].paragraphs[0].runs[0].bold = True
for field, ftype, desc in log_fields:
    row = lt.add_row()
    row.cells[0].text = field
    row.cells[1].text = ftype
    row.cells[2].text = desc
    for cell in row.cells:
        cell.paragraphs[0].runs[0].font.size = Pt(9)

doc.add_page_break()

# ══════════════════════════════════════════════════════════════════
#             6. APPENDIX — UI SCREENSHOTS
# ══════════════════════════════════════════════════════════════════

doc.add_heading('6. Appendix — UI Screenshots', level=1)
doc.add_paragraph(
    'The following screenshots were captured from the live production application on April 1, 2026 '
    'and represent the current state of the HEALTH AI platform user interface.'
)

screenshots = [
    ('landing_page.png', 'Landing Page — Hero section with animated DNA helix, "Where Healthcare Meets Engineering" headline, trust badges, and animated counters'),
    ('login_page.png', 'Authentication Page — Sign In / Register dual-mode form with .edu email validation, password security, role selection, and GDPR indicators'),
    ('dashboard_page.png', 'Dashboard (Innovator Feed) — Multi-filter announcement grid with 3D tilt cards, match indicators, role badges, and bookmark functionality'),
    ('create_post_page.png', 'Create Announcement Wizard — Step 1 "Core Details" showing domain selection, project stage cards, and description input'),
    ('post_detail_page.png', 'Post Detail — Two-column layout with executive overview, NDA-gated technical blueprint, target counterparty sidebar, and express interest workflow'),
    ('chat_page.png', 'Messages — Real-time chat interface with conversation sidebar, user discovery, typing indicators, and read receipts'),
    ('profile_page.png', 'Profile — User card with role badge, profile settings editor, post statistics, and GDPR data privacy controls (export & deletion)'),
]

for filename, caption in screenshots:
    add_screenshot(doc, filename, caption, width=Inches(5.5))

# ═══════════════ SAVE ═══════════════
output_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'HEALTH_AI_SRS_Document.docx')
doc.save(output_path)
print(f"✅ SRS Document saved to: {output_path}")
