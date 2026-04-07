#!/usr/bin/env python3
"""Generate HEALTH AI SDD Document with live screenshots — Part 1: Setup + Sections 1-5."""

from docx import Document
from docx.shared import Inches, Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
import os, sys

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

# COVER
for _ in range(3): doc.add_paragraph()
t = doc.add_paragraph(); t.alignment = WD_ALIGN_PARAGRAPH.CENTER
r = t.add_run('HEALTH AI'); r.font.size = Pt(36); r.font.bold = True; r.font.color.rgb = RGBColor(0x3b,0x3b,0x98)
s = doc.add_paragraph(); s.alignment = WD_ALIGN_PARAGRAPH.CENTER
s.add_run('European HealthTech Co-Creation & Innovation Platform').font.size = Pt(14)
doc.add_paragraph()
d = doc.add_paragraph(); d.alignment = WD_ALIGN_PARAGRAPH.CENTER
r = d.add_run('Software Design Document (SDD)'); r.font.size = Pt(20); r.font.bold = True
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
for lb, vl in [('Document','Software Design Document'),('Project','HEALTH AI Platform'),('Group','Health Shield'),('Members','Cem Özal, Emre Kurubaş, Hasabu Can Eltayeb, Sertaç Ataç'),('Version','2.0'),('Date','April 1, 2026'),('Course','SENG 384'),('Status','Final — Updated')]:
    rw = it.add_row(); rw.cells[0].text = lb; rw.cells[1].text = vl; rw.cells[0].paragraphs[0].runs[0].bold = True

doc.add_page_break()

# 1. INTRODUCTION
doc.add_heading('1. Introduction', level=1)
doc.add_heading('1.1 Purpose', level=2)
doc.add_paragraph('This Software Design Document (SDD) describes the internal architecture, component design, data structures, and interaction patterns of the HEALTH AI platform. It serves as the technical blueprint for understanding how the system is built, how modules interact, and how data flows through the application.')
doc.add_heading('1.2 Scope', level=2)
doc.add_paragraph('This document covers the complete design of the HEALTH AI platform including its React-based frontend architecture, Firebase Firestore backend integration, real-time communication patterns, component hierarchy, state management through custom hooks, routing strategy, security mechanisms, and deployment configuration. The design reflects the current production build (Version 5) as of April 2026.')
doc.add_page_break()

# 2. SYSTEM ARCHITECTURE
doc.add_heading('2. System Architecture Overview', level=1)
doc.add_heading('2.1 Architectural Style', level=2)
doc.add_paragraph('HEALTH AI follows a Client-Side Rendered (CSR) Single Page Application architecture with a serverless backend. Key decisions:')
for d in ['Component-Based Architecture: All UI elements are reusable React components.', 'Hooks-Based State Management: Business logic in custom hooks (useAuth, usePosts, useChat, useNotifications).', 'Service Layer Pattern: All Firestore ops abstracted in services/firestore.js.', 'Real-Time First: Firestore onSnapshot listeners for instant updates across clients.', 'Route-Level Code Organization: Each feature has its own page component.']:
    doc.add_paragraph(d, style='List Bullet')

doc.add_heading('2.2 Technology Stack', level=2)
tbl(['Layer','Technology','Purpose'], [
    ('UI Framework','React 18','Component-based rendering with virtual DOM'),
    ('Build Tool','Vite 7.x','Fast HMR dev server and optimized production builds'),
    ('Routing','React Router v6','Declarative client-side routing with guards'),
    ('Animation','Framer Motion 11.x','Physics-based animations and page transitions'),
    ('3D Effects','react-parallax-tilt','Card hover tilt effects on dashboard'),
    ('Icons','Lucide React','Tree-shakable SVG icon library'),
    ('Database','Firebase Firestore v10','NoSQL real-time document database'),
    ('Styling','Vanilla CSS + CSS Variables','Theme system with dark/light mode'),
    ('Hashing','Web Crypto API (Native)','SHA-256 password hashing'),
    ('Language','JavaScript (JSX, ES2022)','Modern JS with JSX syntax'),
])

doc.add_heading('2.3 Architecture Diagram', level=2)
p = doc.add_paragraph(); p.alignment = WD_ALIGN_PARAGRAPH.CENTER
r = p.add_run('PRESENTATION: React Components + Framer Motion + CSS Themes\n         ↕\nBUSINESS LOGIC: useAuth, usePosts, useChat, useNotifications\n         ↕\nDATA ACCESS: firestore.js — CRUD, Subscriptions, Chat, Presence\n         ↕\nINFRASTRUCTURE: Firebase Firestore (Cloud NoSQL)')
r.font.name = 'Consolas'; r.font.size = Pt(9)
doc.add_page_break()

# 3. MODULE DECOMPOSITION
doc.add_heading('3. Module Decomposition', level=1)
doc.add_heading('3.1 Page Modules', level=2)
tbl(['Module','File','Responsibility'], [
    ('LandingPage','pages/LandingPage.jsx','Marketing hero, feature grid, workflow steps, DNA helix background'),
    ('Login','pages/Login.jsx','Sign In / Register form, .edu validation, SHA-256 hashing'),
    ('Dashboard','pages/Dashboard.jsx','Announcement feed with search/filter, 3D tilt cards, bookmarks'),
    ('CreatePost','pages/CreatePost.jsx','3-step wizard: Core Details → Technical Info → Settings'),
    ('PostDetail','pages/PostDetail.jsx','Two-column detail: content + sidebar. NDA modal, meetings'),
    ('MyPosts','pages/MyPosts.jsx','Author post management: stats, filter tabs, status transitions'),
    ('Profile','pages/Profile.jsx','User card, profile editor, GDPR export/delete'),
    ('AdminDashboard','pages/AdminDashboard.jsx','4-tab admin: Overview, Users, Posts, Audit Logs'),
    ('Chat','pages/Chat.jsx','Two-panel messaging with typing indicators and read receipts'),
])

doc.add_heading('3.2 Component Modules', level=2)
tbl(['Component','Responsibility'], [
    ('Navbar','Fixed nav bar with logo, links, theme toggle, notifications, user badge, logout'),
    ('Notifications','Dropdown notification panel with dismiss actions'),
    ('ThemeToggle','Dark/Light mode toggle via data-theme attribute'),
    ('HeroDNA','Canvas-based animated 3D DNA double helix for landing page'),
    ('PageTransition','Framer Motion wrapper for page route change animations'),
    ('SkeletonLoader','Animated placeholder cards during data loading'),
    ('NetworkStatus','Offline warning toast indicator'),
    ('GlobalErrorBoundary','React Error Boundary catching rendering crashes'),
    ('AnimatedCounter','Scroll-triggered number animation for statistics'),
])

doc.add_heading('3.3 Custom Hook Modules', level=2)
tbl(['Hook','State Managed','Key Operations'], [
    ('useAuth','user, allUsers, loading','login, register, logout, updateUser, deleteUser'),
    ('usePosts','posts, loading','addPost, updatePost, updatePostStatus, deletePost, expressInterest, proposeMeeting, respondToMeeting'),
    ('useChat','messages, conversations, activeRecipient, otherIsTyping','send, setTyping, clearHistory, deleteConvo'),
    ('useNotifications','notifications','addNotification, dismissNotification, dismissAllNotifications'),
])

doc.add_heading('3.4 Service Layer (firestore.js)', level=2)
for s in ['Posts CRUD: getPosts, addPostToFirestore, updatePostInFirestore, deletePostFromFirestore, subscribeToPostsRT',
          'Users CRUD: getUsers, getUserById, getUserByEmail, addUserToFirestore, updateUserInFirestore, subscribeToUsersRT',
          'Activity Logs: addActivityLog, subscribeToLogsRT',
          'Notifications: addNotificationToFirestore, deleteNotificationFromFirestore, subscribeToNotificationsRT',
          'Chat: getOrCreateConversation, sendMessage, subscribeToConversationsRT, subscribeToMessagesRT, setTypingStatus, markAsRead, deleteConversation',
          'Presence: updateUserStatus (online/offline), Security: hashPassword (SHA-256)']:
    doc.add_paragraph(s, style='List Bullet')
doc.add_page_break()

# 4. DATA DESIGN
doc.add_heading('4. Data Design', level=1)
doc.add_heading('4.1 Firestore Collections', level=2)
tbl(['Collection','Document ID','Key Fields','RT Listener'], [
    ('users','Custom (doc-1, eng-1)','name, email, passwordHash, role, institution, status, isOnline, savedPosts','subscribeToUsersRT'),
    ('posts','Custom (post-1)','title, domain, projectStage, explanation, confidentiality, status, interests[], meetings[]','subscribeToPostsRT'),
    ('conversations','Sorted member IDs joined by _','members[], memberData{}, lastMessage, updatedAt, unreadCount{}, isTyping{}','subscribeToConversationsRT'),
    ('conversations/{id}/messages','Auto-generated','senderId, senderName, text, timestamp, read','subscribeToMessagesRT'),
    ('activityLogs','Custom (log-1)','timestamp, userId, userName, role, actionType, targetEntity, result, details','subscribeToLogsRT'),
    ('notifications','Custom ID','type, message, postId, fromUser, timestamp, read','subscribeToNotificationsRT'),
])

doc.add_heading('4.2 Real-Time Data Flow', level=2)
for i, step in enumerate(['Component mounts → Hook initializes → Firestore onSnapshot listener established',
                           'External change occurs → Firestore pushes snapshot to all listeners',
                           'Listener callback fires → Hook updates React state via setState',
                           'React re-renders consuming components → UI reflects change instantly',
                           'Component unmounts → unsubscribe() called → Listener detached'], 1):
    doc.add_paragraph(f'{i}. {step}')
doc.add_page_break()

# 5. INTERFACE DESIGN
doc.add_heading('5. Interface Design', level=1)
doc.add_heading('5.1 Design System', level=2)
doc.add_paragraph('The UI uses a premium glassmorphism design with CSS custom properties for theming:')
tbl(['Variable','Dark Value','Purpose'], [
    ('--background','#0f0f1a','Main page background'),
    ('--surface','rgba(22,22,42,0.6)','Card/panel backgrounds'),
    ('--primary','#6366f1','Primary accent (Indigo)'),
    ('--accent','#a855f7','Secondary accent (Purple)'),
    ('--secondary','#10b981','Success/healthcare green'),
    ('--error','#ef4444','Error and danger states'),
    ('--glass-bg','rgba(22,22,42,0.7)','Glassmorphism panel fill'),
])
img('landing_page.png', 'Landing Page — Glassmorphism design with gradient accents')

doc.add_heading('5.2 Navigation Architecture', level=2)
tbl(['Nav Item','Route','Visibility'], [
    ('Feed','/dashboard','All authenticated users'),
    ('My Posts','/my-posts','All authenticated users'),
    ('Messages','/chat','All authenticated users'),
    ('Profile','/profile','All authenticated users'),
    ('Admin Logs','/admin','Admin role only'),
])
img('dashboard_page.png', 'Dashboard — Navbar with active route indicator')
doc.add_page_break()

# 6. DETAILED COMPONENT DESIGN
doc.add_heading('6. Detailed Component Design', level=1)

doc.add_heading('6.1 Authentication Module', level=2)
doc.add_paragraph('Sign In: Email (.edu validation) → SHA-256 hash → getUserByEmail() → verify hash → addActivityLog')
doc.add_paragraph('Register: Email + Password + Name + Role + Institution + Country + City → emailExists() → hashPassword() → addUserToFirestore() → seedCollection()')
img('login_page.png', 'Login — Sign In with .edu validation')

doc.add_heading('6.2 Announcement Module', level=2)
doc.add_paragraph('Post lifecycle: Draft → (Publish) → Active → (Interest) → Active+Interests → (Propose Meeting) → Meeting Scheduled → (Close) → CLOSED/Partner Found')
tbl(['Step','Fields','Validation'], [
    ('1. Core Details','Title, Domain, Project Stage, Description','All required'),
    ('2. Technical Info','Technical Blueprint, Required Expertise, Collaboration Type','Expertise + type required'),
    ('3. Settings','Country, City, Confidentiality, Expiry Days','Location + privacy required'),
])
img('create_post_page.png', 'Create Announcement — Step 1 wizard')

doc.add_heading('6.3 Interest & Meeting Module', level=2)
doc.add_paragraph('Workflow: View Post → Express Interest (NDA modal) → Propose Meeting (time slots) → Author Accept/Decline → Meeting Scheduled → Close (Partner Found)')
img('post_detail_page.png', 'Post Detail — NDA-gated content with Express Interest')

doc.add_heading('6.4 Chat Module', level=2)
doc.add_paragraph('Three-layer Firestore structure: conversations/ (deterministic IDs) → messages/ (sub-collection, timestamp ordered) → presence (isTyping map field)')
img('chat_page.png', 'Messages — Two-panel chat interface')

doc.add_heading('6.5 Admin Module', level=2)
doc.add_paragraph('4-tab interface: Overview (stats) | Users (freeze/unfreeze) | Posts (delete) | Audit Logs (search + filter + CSV export). Access restricted to Admin role.')
doc.add_page_break()

# 7. SECURITY
doc.add_heading('7. Security Design', level=1)
tbl(['Layer','Mechanism','Detail'], [
    ('Password','SHA-256 hashing','Client-side via Web Crypto API, no plaintext stored'),
    ('Email','.edu enforcement','Personal providers (gmail, yahoo, etc.) blocked'),
    ('Routes','Guard components','ProtectedRoute + GuestRoute wrappers'),
    ('IP Protection','NDA workflow','Confidential posts gated behind NDA acceptance'),
    ('RBAC','Role-based access','Cross-role discovery + admin-only routes'),
    ('Audit','Activity logging','All login/post/meeting actions logged'),
    ('GDPR','Data rights','Export (Art. 20), Delete (Art. 17), Access (Art. 15)'),
])

# 8. ERROR HANDLING
doc.add_heading('8. Error Handling Strategy', level=1)
tbl(['Error Type','Mechanism','UX'], [
    ('Render Crash','GlobalErrorBoundary','Recovery UI instead of blank screen'),
    ('Network Loss','NetworkStatus + navigator.onLine','Offline warning banner'),
    ('Auth Failure','Try-catch in handlers','Animated error message'),
    ('Firestore Error','Try-catch + console.error','Graceful degradation'),
    ('Form Validation','Client-side checks','Contextual error messages'),
])

# 9. DEPLOYMENT
doc.add_heading('9. Deployment Architecture', level=1)
doc.add_paragraph('Static SPA build: Source → Vite build → dist/ (HTML, CSS, JS bundles) → Static hosting')
doc.add_paragraph('Runtime: Browser (React SPA) ↔ Firestore SDK (WebSocket) ↔ Firebase Firestore (Google Cloud)')
doc.add_paragraph('Environment: .env file with VITE_FIREBASE_API_KEY, AUTH_DOMAIN, PROJECT_ID, STORAGE_BUCKET, MESSAGING_SENDER_ID, APP_ID')

output = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'HEALTH_AI_SDD_Document.docx')
doc.save(output)
print(f"SDD saved to: {output}")
