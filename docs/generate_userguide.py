#!/usr/bin/env python3
"""Generate HEALTH AI User Guide with live screenshots."""

from docx import Document
from docx.shared import Inches, Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
import os

doc = Document()
for section in doc.sections:
    section.top_margin = Cm(2.5)
    section.bottom_margin = Cm(2.5)
    section.left_margin = Cm(2.5)
    section.right_margin = Cm(2.5)

style = doc.styles['Normal']
style.font.name = 'Calibri'
style.font.size = Pt(11)
style.font.color.rgb = RGBColor(0x33, 0x33, 0x33)
style.paragraph_format.line_spacing = 1.15
style.paragraph_format.space_after = Pt(6)

for lv in range(1, 4):
    h = doc.styles[f'Heading {lv}']
    h.font.name = 'Calibri'
    h.font.color.rgb = RGBColor(0x1a, 0x1a, 0x2e)
    h.font.bold = True
    h.font.size = Pt([0, 22, 16, 13][lv])

SDIR = os.path.join(os.path.dirname(__file__), 'screenshots')

def img(fn, cap, w=Inches(5.5)):
    fp = os.path.join(SDIR, fn)
    if os.path.exists(fp):
        p = doc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.add_run().add_picture(fp, width=w)
        c = doc.add_paragraph(f'Figure: {cap}'); c.alignment = WD_ALIGN_PARAGRAPH.CENTER
        c.runs[0].font.size = Pt(9); c.runs[0].font.italic = True
        c.runs[0].font.color.rgb = RGBColor(0x66, 0x66, 0x66)
        doc.add_paragraph()

def tbl(hdrs, rows):
    t = doc.add_table(rows=1, cols=len(hdrs)); t.style = 'Light Grid Accent 1'
    for i, h in enumerate(hdrs):
        t.rows[0].cells[i].text = h; t.rows[0].cells[i].paragraphs[0].runs[0].bold = True
        t.rows[0].cells[i].paragraphs[0].runs[0].font.size = Pt(9)
    for rd in rows:
        r = t.add_row()
        for i, tx in enumerate(rd):
            r.cells[i].text = str(tx); r.cells[i].paragraphs[0].runs[0].font.size = Pt(9)
    doc.add_paragraph()

# ═══════════════ COVER PAGE ═══════════════
for _ in range(3): doc.add_paragraph()
t = doc.add_paragraph(); t.alignment = WD_ALIGN_PARAGRAPH.CENTER
r = t.add_run('HEALTH AI'); r.font.size = Pt(36); r.font.bold = True; r.font.color.rgb = RGBColor(0x3b,0x3b,0x98)
s = doc.add_paragraph(); s.alignment = WD_ALIGN_PARAGRAPH.CENTER
s.add_run('European HealthTech Co-Creation & Innovation Platform').font.size = Pt(14)
doc.add_paragraph()
d = doc.add_paragraph(); d.alignment = WD_ALIGN_PARAGRAPH.CENTER
r = d.add_run('User Guide'); r.font.size = Pt(20); r.font.bold = True
doc.add_paragraph()
v = doc.add_paragraph(); v.alignment = WD_ALIGN_PARAGRAPH.CENTER
v.add_run('Version 2.0 — April 2026').font.size = Pt(12)
doc.add_paragraph()

# Group Info
gp = doc.add_paragraph(); gp.alignment = WD_ALIGN_PARAGRAPH.CENTER
gr = gp.add_run('Group: Health Shield'); gr.font.size = Pt(16); gr.font.bold = True; gr.font.color.rgb = RGBColor(0x1a,0x1a,0x2e)
mp = doc.add_paragraph(); mp.alignment = WD_ALIGN_PARAGRAPH.CENTER
for m in ['Cem Özal', 'Emre Kurubaş', 'Hasabu Can Eltayeb', 'Sertaç Ataç']:
    mr = mp.add_run(m + '\n'); mr.font.size = Pt(12); mr.font.color.rgb = RGBColor(0x55,0x55,0x55)

doc.add_paragraph()

it = doc.add_table(rows=0, cols=2); it.style = 'Light Grid Accent 1'
for lb, vl in [('Document','User Guide'),('Project','HEALTH AI Platform'),('Group','Health Shield'),('Members', 'Cem Özal, Emre Kurubaş, Hasabu Can Eltayeb, Sertaç Ataç'),('Version','2.0'),('Date','April 1, 2026'),('Course','SENG 384'),('Audience','All Platform Users')]:
    rw = it.add_row(); rw.cells[0].text = lb; rw.cells[1].text = vl; rw.cells[0].paragraphs[0].runs[0].bold = True

doc.add_page_break()

# ═══════════════ TABLE OF CONTENTS ═══════════════
doc.add_heading('Table of Contents', level=1)
for item in ['1. Getting Started','   1.1 What is HEALTH AI?','   1.2 Who Can Use the Platform?','   1.3 Accessing the Platform',
             '2. Creating Your Account','   2.1 Registration Requirements','   2.2 Step-by-Step Registration','   2.3 Signing In',
             '3. Navigating the Platform','   3.1 Navigation Bar','   3.2 Theme Toggle',
             '4. Discovering Projects (Dashboard)','   4.1 Browsing the Feed','   4.2 Searching and Filtering','   4.3 Saving Projects',
             '5. Creating an Announcement','   5.1 Step 1: Core Details','   5.2 Step 2: Technical Info','   5.3 Step 3: Settings',
             '6. Viewing Announcement Details','   6.1 Post Information','   6.2 Expressing Interest (NDA)','   6.3 Proposing a Meeting',
             '7. Managing Your Announcements','8. Messaging','   8.1 Starting a Conversation','   8.2 Chat Features',
             '9. Profile Management','   9.1 Editing Your Profile','   9.2 GDPR Data Rights',
             '10. Admin Features','11. Troubleshooting & FAQ']:
    p = doc.add_paragraph(item); p.paragraph_format.space_after = Pt(2)
doc.add_page_break()

# ═══════════════ 1. GETTING STARTED ═══════════════
doc.add_heading('1. Getting Started', level=1)

doc.add_heading('1.1 What is HEALTH AI?', level=2)
doc.add_paragraph('HEALTH AI is a European HealthTech Co-Creation and Innovation Platform that connects healthcare professionals (doctors, clinicians, researchers) with engineers and developers. The platform enables structured partner discovery for health-tech innovation projects through a secure, GDPR-compliant workflow.')
doc.add_paragraph('Key Benefits:')
for b in ['Find the right partner for your health-tech project','Secure NDA-protected communication workflow','GDPR-compliant data handling with full user rights','Cross-disciplinary matching between healthcare and engineering','No intellectual property is stored on the platform — it facilitates contact only']:
    doc.add_paragraph(b, style='List Bullet')

doc.add_heading('1.2 Who Can Use the Platform?', level=2)
tbl(['Role','Description','Access'], [
    ('Healthcare Professional','Doctors, clinicians, researchers with clinical expertise and innovative ideas','Full platform access: create posts, browse, express interest, chat, profile'),
    ('Engineer / Developer','Software, hardware, and biomedical engineers with technical capabilities','Full platform access: create posts, browse, express interest, chat, profile'),
    ('Admin','Platform administrator','Full access + user management, post moderation, audit logs'),
])

doc.add_heading('1.3 Accessing the Platform', level=2)
doc.add_paragraph('Open your web browser (Chrome, Firefox, Safari, or Edge recommended) and navigate to the HEALTH AI platform URL. You will be greeted by the landing page:')
img('landing_page.png', 'HEALTH AI Landing Page')
doc.add_paragraph('Click "Join the Network" or "Access Platform" to create an account or sign in.')
doc.add_page_break()

# ═══════════════ 2. CREATING YOUR ACCOUNT ═══════════════
doc.add_heading('2. Creating Your Account', level=1)

doc.add_heading('2.1 Registration Requirements', level=2)
doc.add_paragraph('To register on HEALTH AI, you need:')
for r in ['An institutional email address ending with .edu (personal emails like Gmail, Yahoo, Hotmail are not accepted)','A password with at least 6 characters','Your full name (with professional title, e.g., "Dr.", "Prof.")','Your role: Healthcare Professional or Engineer/Developer','Your institution name','Your country and city']:
    doc.add_paragraph(r, style='List Bullet')

doc.add_heading('2.2 Step-by-Step Registration', level=2)
steps = [
    'Navigate to the Login page by clicking "Access Platform" on the landing page.',
    'Click the "Register" tab at the top of the form.',
    'Enter your institutional email address (must end with .edu).',
    'Enter a secure password (minimum 6 characters).',
    'Enter your full name with professional title.',
    'Select your role from the dropdown: "Healthcare Professional" or "Engineer / Developer".',
    'Enter your institution name (e.g., "MIT", "University of Zurich").',
    'Enter your country and city.',
    'Click "Create Account". You will be automatically redirected to the Dashboard.',
]
for i, step in enumerate(steps, 1):
    doc.add_paragraph(f'{i}. {step}')
img('login_page.png', 'Login / Registration Page')

doc.add_heading('2.3 Signing In', level=2)
doc.add_paragraph('If you already have an account:')
for s in ['Navigate to the Login page.','Ensure the "Sign In" tab is selected.','Enter your institutional email and password.','Click "Sign In". You will be redirected to the Dashboard.']:
    doc.add_paragraph(s, style='List Bullet')
doc.add_paragraph('Note: If you enter incorrect credentials, an error message will appear. All failed login attempts are logged for security.')
doc.add_page_break()

# ═══════════════ 3. NAVIGATING THE PLATFORM ═══════════════
doc.add_heading('3. Navigating the Platform', level=1)

doc.add_heading('3.1 Navigation Bar', level=2)
doc.add_paragraph('Once logged in, you will see the navigation bar at the top of every page. It contains:')
tbl(['Element','Description','Action'], [
    ('HEALTH AI Logo','Platform branding with gradient icon','Click to go to Dashboard'),
    ('Feed','Main announcement dashboard','Browse all project announcements'),
    ('My Posts','Your posted announcements','Manage your own announcements'),
    ('Messages','Real-time chat system','Send and receive messages'),
    ('Profile','Your user profile','Edit profile and manage data'),
    ('Admin Logs','Admin dashboard (Admin only)','System oversight and management'),
    ('☀️/🌙 Toggle','Theme switcher','Switch between dark and light mode'),
    ('🔔 Bell','Notifications','View interest and meeting notifications'),
    ('User Badge','Your name and role','Shows your identity and role'),
    ('↪️ Logout','Sign out button','Securely end your session'),
])

doc.add_heading('3.2 Theme Toggle', level=2)
doc.add_paragraph('HEALTH AI supports both dark and light modes. Click the sun/moon icon in the navigation bar to switch between themes. Your preference is saved automatically.')
doc.add_page_break()

# ═══════════════ 4. DISCOVERING PROJECTS ═══════════════
doc.add_heading('4. Discovering Projects (Dashboard)', level=1)

doc.add_heading('4.1 Browsing the Feed', level=2)
doc.add_paragraph('The Dashboard is your main hub for discovering projects. Here you will find announcements from users with complementary roles — if you are an Engineer, you will see Healthcare Professional posts, and vice versa.')
img('dashboard_page.png', 'Dashboard — Innovator Feed with project cards')
doc.add_paragraph('Each project card displays:')
for c in ['Role badge (Engineer or Healthcare Professional) indicating the author role','Domain badge (e.g., Cardiology, Neurology, Oncology)','Status badge (Active, Meeting Scheduled, Partner Found)','Project title and description excerpt','Match indicators (same city, complementary role)','Bookmark button to save projects for later']:
    doc.add_paragraph(c, style='List Bullet')

doc.add_heading('4.2 Searching and Filtering', level=2)
doc.add_paragraph('Use the search bar and filter dropdowns to find specific projects:')
for f in ['Search: Type keywords to search across titles, descriptions, domains, and expertise fields','Domain: Filter by medical domain (Cardiology, Neurology, Oncology, etc.)','Stage: Filter by project stage (Idea, Concept Validation, Prototype, Pilot, Pre-Deployment)','Country: Filter by the project country','City: Filter by the project city','Status: Filter by announcement status (Active, Meeting Scheduled, etc.)']:
    doc.add_paragraph(f, style='List Bullet')
doc.add_paragraph('The result counter in the top-right shows how many announcements match your filters.')

doc.add_heading('4.3 Saving Projects', level=2)
doc.add_paragraph('Click the bookmark icon on any project card to save it. Switch to the "Saved Projects" tab to view all your bookmarked projects.')
doc.add_page_break()

# ═══════════════ 5. CREATING AN ANNOUNCEMENT ═══════════════
doc.add_heading('5. Creating an Announcement', level=1)
doc.add_paragraph('Click the "+ New Announcement" button on the Dashboard to start creating a project announcement. The form uses a 3-step wizard.')

doc.add_heading('5.1 Step 1: Core Details', level=2)
for f in ['Title: Give your project a clear, descriptive title (e.g., "AI-Assisted ECG Analysis for Arrhythmia Detection")','Domain: Select the relevant medical/tech domain from the dropdown','Project Stage: Choose your current stage by clicking one of the cards (Idea, Concept Validation, Prototype Developed, Pilot Testing, Pre-Deployment)','Description: Describe the problem you are solving, initial outcomes, and the ideal partner profile']:
    doc.add_paragraph(f, style='List Bullet')
img('create_post_page.png', 'Create Announcement — Step 1: Core Details')

doc.add_heading('5.2 Step 2: Technical Info', level=2)
for f in ['Technical Blueprint (optional): Describe your technical approach. If you set the post as NDA-protected, this section will only be visible after NDA acceptance.','Required Expertise: Describe what kind of partner you are looking for.','Collaboration Type: Select the type of partnership (Co-Development, Advisory, Licensing, Joint Research, Pilot Partnership).']:
    doc.add_paragraph(f, style='List Bullet')

doc.add_heading('5.3 Step 3: Settings', level=2)
for f in ['Country and City: Set the project location.','Confidentiality Level: Choose "Public Info" (visible to all) or "NDA Protected" (technical blueprint hidden until NDA acceptance).','Expiry: Set how long the announcement stays active (15, 30, 60, or 90 days).']:
    doc.add_paragraph(f, style='List Bullet')
doc.add_paragraph('Click "Publish Announcement" to make your post live on the platform.')
doc.add_page_break()

# ═══════════════ 6. VIEWING ANNOUNCEMENT DETAILS ═══════════════
doc.add_heading('6. Viewing Announcement Details', level=1)
doc.add_paragraph('Click on any project card from the Dashboard to view its full details.')

doc.add_heading('6.1 Post Information', level=2)
doc.add_paragraph('The detail page shows:')
for i in ['Status badges, domain, and author role','Project metadata: stage, location, posting date, expiry date','Executive Overview: Full project description','Technical Blueprint: Detailed technical approach (may be NDA-gated)','Required Expertise: What the author is looking for in a partner','Sidebar: Target counterparty info, collaboration type, and data sharing level','Author card with a "Message" button for direct communication']:
    doc.add_paragraph(i, style='List Bullet')
img('post_detail_page.png', 'Post Detail — Two-column layout with sidebar')

doc.add_heading('6.2 Expressing Interest (NDA)', level=2)
doc.add_paragraph('To express interest in a project:')
for s in ['Click the "Express Interest" button in the sidebar.','An NDA acceptance modal will appear. Read the non-disclosure terms carefully.','Check the agreement checkbox to accept the NDA terms.','Optionally add a personal message to the post author.','Click "Confirm Interest". The post author will receive a notification.']:
    doc.add_paragraph(s, style='List Bullet')
doc.add_paragraph('Important: For NDA-protected posts, the Technical Blueprint section will only become visible after you express interest and accept the NDA terms.')

doc.add_heading('6.3 Proposing a Meeting', level=2)
doc.add_paragraph('After expressing interest, you can propose a meeting:')
for s in ['Click "Propose Meeting" on the post detail page.','Select from the auto-generated time slots (weekday options for the next 5 business days at 10:00, 14:00, and 16:00).','The post author will receive a notification and can Accept or Decline your meeting request.','If accepted, the post status changes to "Meeting Scheduled" with instructions to use Zoom or Teams for the actual meeting.']:
    doc.add_paragraph(s, style='List Bullet')
doc.add_page_break()

# ═══════════════ 7. MANAGING YOUR ANNOUNCEMENTS ═══════════════
doc.add_heading('7. Managing Your Announcements', level=1)
doc.add_paragraph('Navigate to "My Posts" in the navigation bar to manage your announcements.')
doc.add_paragraph('Features available:')
for f in ['Statistics Dashboard: See your total posts, drafts, active, in-meeting, and closed counts at a glance.','Filter Tabs: Filter your posts by status (All, Draft, Active, Meeting Scheduled, Partner Found).','Publish: Draft posts can be published to make them visible on the platform.','Close: Active posts can be closed and marked as "Partner Found" when you have found a partner.','View: Click "View" to go to the full post detail page.']:
    doc.add_paragraph(f, style='List Bullet')
doc.add_page_break()

# ═══════════════ 8. MESSAGING ═══════════════
doc.add_heading('8. Messaging', level=1)
doc.add_paragraph('HEALTH AI includes a built-in real-time messaging system for secure communication between users.')

doc.add_heading('8.1 Starting a Conversation', level=2)
doc.add_paragraph('There are two ways to start a conversation:')
for w in ['From a Post: Click the "Message" button on the author card in the post detail page.','From Messages Page: Click the chat icon in the sidebar header, then select a user from the discovery list.']:
    doc.add_paragraph(w, style='List Bullet')
img('chat_page.png', 'Messages Page — Chat interface')

doc.add_heading('8.2 Chat Features', level=2)
for f in ['Real-Time Messages: Messages appear instantly for both participants.','Typing Indicators: See animated dots when the other person is typing.','Read Receipts: Single check (✓) means sent; double check (✓✓) means read.','Date Groups: Messages are organized by date for easy navigation.','Search: Search through your conversations using the search bar.','Chat Management: Click the three-dot menu for options to clear history or delete the conversation.','Unread Badges: Unread message count shown on conversation items.']:
    doc.add_paragraph(f, style='List Bullet')
doc.add_page_break()

# ═══════════════ 9. PROFILE MANAGEMENT ═══════════════
doc.add_heading('9. Profile Management', level=1)
doc.add_paragraph('Navigate to "Profile" in the navigation bar to view and manage your account.')
img('profile_page.png', 'Profile Page — User info, settings, and GDPR controls')

doc.add_heading('9.1 Editing Your Profile', level=2)
for s in ['Click the "Edit" button in the Profile Settings section.','Update your Full Name, Institution, Country, or City.','Click "Save" to apply changes, or "Cancel" to discard.','A success message will confirm your profile has been updated.']:
    doc.add_paragraph(s, style='List Bullet')

doc.add_heading('9.2 GDPR Data Rights', level=2)
doc.add_paragraph('HEALTH AI is fully GDPR-compliant. You have the following data rights:')
tbl(['Right','GDPR Article','How to Use'], [
    ('Right to Access','Article 15','Your profile page shows all your stored data'),
    ('Right to Data Portability','Article 20','Click "Export My Data (JSON)" to download all your data as a JSON file'),
    ('Right to Erasure','Article 17','Click "Delete My Account (Art. 17)" to permanently delete your account and all associated data'),
])
doc.add_paragraph('Warning: Account deletion is permanent and cannot be undone. All your posts and data will be removed from the platform.')
doc.add_page_break()

# ═══════════════ 10. ADMIN FEATURES ═══════════════
doc.add_heading('10. Admin Features', level=1)
doc.add_paragraph('If you have the Admin role, you can access the Admin Dashboard via the "Admin Logs" link in the navigation bar. The admin panel provides:')
tbl(['Tab','Features'], [
    ('Overview','Dashboard cards showing total users, total announcements, active projects, and monitored events'),
    ('Users','User management table with name, email, role, status (Active/Frozen), and freeze/unfreeze action'),
    ('Announcements','Post moderation table with title, author, status, privacy level, and delete action'),
    ('Audit Logs','Searchable and filterable audit log table with timestamp, user, action type, and details. Supports CSV export for compliance reporting.'),
])
doc.add_paragraph('Admin capabilities:')
for c in ['Freeze/Unfreeze Users: Temporarily disable or re-enable user accounts.','Delete Posts: Remove any announcement from the platform.','Export Audit Logs: Download all activity logs as a CSV file for compliance purposes.','Monitor Activity: View all system events including logins, post creation, meeting requests, and failed attempts.']:
    doc.add_paragraph(c, style='List Bullet')
doc.add_page_break()

# ═══════════════ 11. FAQ ═══════════════
doc.add_heading('11. Troubleshooting & FAQ', level=1)
tbl(['Question','Answer'], [
    ('I cannot register with my email','Only institutional .edu email addresses are accepted. Personal emails (Gmail, Yahoo, Hotmail, Outlook) are blocked for security.'),
    ('I forgot my password','Currently, password recovery must be done through platform administrators. Contact the system admin.'),
    ('I cannot see the Technical Blueprint','The post author has set it as NDA-protected. Express interest and accept the NDA terms to unlock it.'),
    ('My post is not showing on the Dashboard','Check the status filters. The default filter shows only "Active" posts. Your post may be in "Draft" status.'),
    ('I am offline and features are not working','HEALTH AI requires an internet connection for real-time features. An offline indicator will appear when you lose connectivity.'),
    ('How do I delete my account?','Go to Profile → Data Privacy (GDPR) → Click "Delete My Account (Art. 17)". This is permanent.'),
    ('Can I change my role?','Role changes are not supported through the UI. Contact an administrator for role updates.'),
    ('Where do meetings take place?','The platform does not host video calls. Use external tools like Zoom or Teams. The platform only facilitates scheduling.'),
    ('Is my data secure?','Yes. Passwords are SHA-256 hashed. No patient data or IP documents are stored. The platform is fully GDPR-compliant.'),
    ('How do I become an Admin?','Register with admin@healthai.edu email to automatically receive Admin role.'),
])

# ═══════════════ SAVE ═══════════════
output = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'HEALTH_AI_User_Guide.docx')
doc.save(output)
print(f"User Guide saved to: {output}")
