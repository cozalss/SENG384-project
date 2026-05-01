#!/usr/bin/env python3
"""Generate UML and architecture diagrams for HEALTH AI documents using matplotlib."""

import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch, Circle, Rectangle, Ellipse, Polygon, ConnectionPatch
from matplotlib.lines import Line2D

OUT = os.path.join(os.path.dirname(__file__), 'diagrams')
os.makedirs(OUT, exist_ok=True)

# Editorial palette aligned with the platform UI
COL_BG = '#0f1020'
COL_PANEL = '#1a1a2e'
COL_ACCENT_WARM = '#f39a54'
COL_ACCENT_COOL = '#22d3ee'
COL_TEXT = '#1a1a2e'
COL_MUTED = '#5a5a7a'
COL_LINE = '#3b3b98'
COL_USER = '#fef3e2'
COL_SYSTEM = '#e0f2fe'
COL_DATA = '#fce7f3'
COL_EXTERNAL = '#ecfccb'
COL_ADMIN = '#ddd6fe'


def _save(fig, name):
    path = os.path.join(OUT, name)
    fig.savefig(path, dpi=160, bbox_inches='tight', facecolor='white')
    plt.close(fig)
    return path


def _box(ax, x, y, w, h, label, fc='#ffffff', ec=COL_LINE, fontsize=10, bold=False, radius=0.05):
    box = FancyBboxPatch((x, y), w, h,
                          boxstyle=f"round,pad=0.02,rounding_size={radius}",
                          fc=fc, ec=ec, lw=1.4)
    ax.add_patch(box)
    weight = 'bold' if bold else 'normal'
    ax.text(x + w / 2, y + h / 2, label, ha='center', va='center',
            fontsize=fontsize, color=COL_TEXT, weight=weight, wrap=True)


def _arrow(ax, x1, y1, x2, y2, label='', color=COL_LINE, style='-|>', dashed=False, fontsize=8):
    ls = '--' if dashed else '-'
    arr = FancyArrowPatch((x1, y1), (x2, y2),
                          arrowstyle=style, mutation_scale=14,
                          color=color, lw=1.2, linestyle=ls)
    ax.add_patch(arr)
    if label:
        mx, my = (x1 + x2) / 2, (y1 + y2) / 2
        ax.text(mx, my + 0.08, label, ha='center', va='bottom',
                fontsize=fontsize, color=COL_MUTED, style='italic',
                bbox=dict(boxstyle='round,pad=0.15', fc='white', ec='none', alpha=0.85))


def _setup(ax, w, h, title=None):
    ax.set_xlim(0, w)
    ax.set_ylim(0, h)
    ax.set_aspect('equal')
    ax.axis('off')
    if title:
        ax.text(w / 2, h - 0.25, title, ha='center', va='top',
                fontsize=13, weight='bold', color=COL_PANEL)


# ───────────────────────────────────────────────────────────
# 1. USE CASE DIAGRAM
# ───────────────────────────────────────────────────────────
def use_case_diagram():
    fig, ax = plt.subplots(figsize=(13, 9))
    _setup(ax, 13, 9, 'Use Case Diagram — HEALTH AI Platform')

    # System boundary
    sys_box = Rectangle((2.6, 0.4), 7.8, 7.5, fc='#fafbff', ec=COL_LINE, lw=1.6, ls='--')
    ax.add_patch(sys_box)
    ax.text(6.5, 7.7, 'HEALTH AI Platform — System Boundary', ha='center', va='center',
            fontsize=11, weight='bold', color=COL_LINE)

    # Actor stick figures
    def actor(x, y, name, color=COL_ACCENT_WARM):
        ax.add_patch(Circle((x, y + 0.55), 0.20, fc=color, ec=COL_TEXT, lw=1.2))
        ax.plot([x, x], [y + 0.35, y - 0.05], color=COL_TEXT, lw=1.4)
        ax.plot([x - 0.25, x + 0.25], [y + 0.18, y + 0.18], color=COL_TEXT, lw=1.4)
        ax.plot([x, x - 0.20], [y - 0.05, y - 0.45], color=COL_TEXT, lw=1.4)
        ax.plot([x, x + 0.20], [y - 0.05, y - 0.45], color=COL_TEXT, lw=1.4)
        ax.text(x, y - 0.7, name, ha='center', va='top', fontsize=9, weight='bold')

    actor(1.0, 6.0, 'Healthcare\nProfessional', '#fde68a')
    actor(1.0, 3.4, 'Engineer /\nDeveloper', '#bae6fd')
    actor(12.0, 4.7, 'Admin', '#ddd6fe')

    # Use cases — single column for cleaner anchor lines, plus admin column
    user_cases = [
        (5.3, 7.0, 'Register / Verify OTP'),
        (5.3, 6.2, 'Sign In / Sign Out'),
        (5.3, 5.4, 'Browse & Filter Posts'),
        (5.3, 4.6, 'Create Announcement'),
        (5.3, 3.8, 'Express Interest (NDA)'),
        (5.3, 3.0, 'Propose / Accept Meeting'),
        (5.3, 2.2, 'Real-Time Chat'),
        (5.3, 1.4, 'Edit Profile / Bookmarks'),
        (5.3, 0.8, 'GDPR Export & Delete'),
    ]
    admin_cases = [
        (8.7, 5.4, 'Manage Users (Freeze)'),
        (8.7, 4.6, 'Moderate Posts'),
        (8.7, 3.8, 'View / Export Audit Logs'),
    ]

    def use_case(cx, cy, label, w=2.6, h=0.5, fc=COL_USER):
        ax.add_patch(Ellipse((cx, cy), w, h, fc=fc, ec=COL_LINE, lw=1.1))
        ax.text(cx, cy, label, ha='center', va='center', fontsize=8.5)

    for cx, cy, lab in user_cases:
        use_case(cx, cy, lab)
    for cx, cy, lab in admin_cases:
        use_case(cx, cy, lab, fc=COL_ADMIN)

    # Connections — single anchor per actor
    for cx, cy, _ in user_cases:
        ax.plot([1.2, cx - 1.3], [5.5, cy], color=COL_MUTED, lw=0.7)
        ax.plot([1.2, cx - 1.3], [3.0, cy], color=COL_MUTED, lw=0.7)
    for cx, cy, _ in admin_cases:
        ax.plot([11.8, cx + 1.3], [4.6, cy], color=COL_LINE, lw=1.0)
    # Admin extends user via dashed «include»
    for cx, cy, _ in user_cases[:3]:
        ax.plot([11.8, cx + 1.3], [4.6, cy], color=COL_LINE, lw=0.6, ls=':', alpha=0.6)
    ax.text(10.3, 7.4, '«inherits user\ncapabilities»', fontsize=7, style='italic', color=COL_MUTED)

    return _save(fig, 'use_case_diagram.png')


# ───────────────────────────────────────────────────────────
# 2. CONTEXT (SYSTEM BOUNDARY) DIAGRAM
# ───────────────────────────────────────────────────────────
def context_diagram():
    fig, ax = plt.subplots(figsize=(11, 7))
    _setup(ax, 11, 7, 'System Context Diagram — HEALTH AI')

    # Central system
    ax.add_patch(Circle((5.5, 3.5), 1.4, fc=COL_PANEL, ec=COL_LINE, lw=2))
    ax.text(5.5, 3.7, 'HEALTH AI', ha='center', va='center',
            fontsize=14, weight='bold', color='white')
    ax.text(5.5, 3.2, 'Web Platform', ha='center', va='center',
            fontsize=9, color='#cbd5e1')

    # External entities
    entities = [
        (1.1, 5.5, 'Healthcare\nProfessional', COL_USER, 'creates posts /\nbrowses engineers'),
        (1.1, 1.5, 'Engineer /\nDeveloper', '#bae6fd', 'creates posts /\nbrowses clinicians'),
        (9.9, 5.5, 'Admin', COL_ADMIN, 'moderates users\nand audit logs'),
        (9.9, 1.5, 'Firebase\nFirestore', COL_SYSTEM, 'real-time data\npersistence'),
        (5.5, 6.5, 'EmailJS', COL_EXTERNAL, 'OTP & meeting\nemails'),
        (5.5, 0.6, 'Zoom / Teams', COL_DATA, 'external video\nmeeting host'),
    ]
    for x, y, name, color, _ in entities:
        _box(ax, x - 0.85, y - 0.45, 1.7, 0.9, name, fc=color, fontsize=9, bold=True)

    # Arrows
    arrows = [
        (1.95, 5.5, 4.1, 3.85, 'HTTPS / Auth'),
        (1.95, 1.5, 4.1, 3.15, 'HTTPS / Auth'),
        (9.05, 5.5, 6.9, 3.85, 'HTTPS / RBAC'),
        (6.9, 3.15, 9.05, 1.5, 'Firestore SDK\n(WebSocket)'),
        (9.05, 1.5, 6.9, 3.15, 'snapshots'),
        (5.5, 6.05, 5.5, 4.9, 'OTP send'),
        (5.5, 2.1, 5.5, 1.05, 'meeting link'),
    ]
    for x1, y1, x2, y2, lab in arrows:
        _arrow(ax, x1, y1, x2, y2, lab, fontsize=7)

    return _save(fig, 'context_diagram.png')


# ───────────────────────────────────────────────────────────
# 3. DATA FLOW DIAGRAM (Level 1)
# ───────────────────────────────────────────────────────────
def dfd_level1():
    fig, ax = plt.subplots(figsize=(12, 8))
    _setup(ax, 12, 8, 'Data Flow Diagram (Level 1) — HEALTH AI')

    # External entities (rectangles)
    ext_rect = lambda x, y, w, h, n: _box(ax, x, y, w, h, n, fc='#fef3e2', radius=0.0)
    ext_rect(0.3, 6.5, 1.8, 0.7, 'User (HCP/Eng)')
    ext_rect(0.3, 0.3, 1.8, 0.7, 'Admin')
    ext_rect(9.9, 6.5, 1.8, 0.7, 'EmailJS Service')
    ext_rect(9.9, 0.3, 1.8, 0.7, 'External Meeting\nPlatform')

    # Processes (circles)
    procs = [
        (3.5, 6.7, 'P1\nAuth &\nRegistration'),
        (6.0, 6.7, 'P2\nAnnouncement\nManagement'),
        (8.5, 6.7, 'P3\nDiscovery\nFiltering'),
        (3.5, 4.0, 'P4\nInterest &\nNDA'),
        (6.0, 4.0, 'P5\nMeeting\nScheduling'),
        (8.5, 4.0, 'P6\nReal-Time\nChat'),
        (3.5, 1.5, 'P7\nNotifications'),
        (6.0, 1.5, 'P8\nProfile &\nGDPR'),
        (8.5, 1.5, 'P9\nAdmin &\nAudit'),
    ]
    for x, y, label in procs:
        ax.add_patch(Circle((x, y), 0.55, fc='#e0e7ff', ec=COL_LINE, lw=1.2))
        ax.text(x, y, label, ha='center', va='center', fontsize=7.5, weight='bold')

    # Data stores (open rectangles - represented with two parallel lines)
    def datastore(x, y, w, n):
        ax.plot([x, x + w], [y + 0.15, y + 0.15], color=COL_LINE, lw=1.4)
        ax.plot([x, x + w], [y - 0.15, y - 0.15], color=COL_LINE, lw=1.4)
        ax.text(x + 0.15, y, n, ha='left', va='center', fontsize=8, weight='bold')

    datastore(2.0, 5.4, 2.0, 'D1 users')
    datastore(5.0, 5.4, 2.0, 'D2 posts')
    datastore(8.0, 5.4, 2.4, 'D3 interests/meetings')
    datastore(2.0, 2.7, 2.0, 'D4 notifications')
    datastore(5.0, 2.7, 2.0, 'D5 messages')
    datastore(8.0, 2.7, 2.4, 'D6 activityLogs')

    # Some flows (subset for clarity)
    flows = [
        (2.1, 6.85, 2.95, 6.8, 'creds + OTP'),
        (4.05, 6.55, 2.1, 6.85, 'session'),
        (3.5, 6.15, 3.5, 5.55, 'user data'),
        (6.0, 6.15, 6.0, 5.55, 'post fields'),
        (6.55, 6.7, 7.95, 6.7, 'list req'),
        (8.5, 6.15, 8.5, 5.55, 'query'),
        (3.5, 5.25, 3.5, 4.55, 'NDA + interest'),
        (6.0, 5.25, 6.0, 4.55, 'meeting slot'),
        (8.5, 5.25, 8.5, 4.55, 'msg payload'),
        (3.5, 3.45, 3.5, 2.05, 'notif fanout'),
        (6.0, 3.45, 6.0, 2.05, 'profile updates'),
        (8.5, 3.45, 8.5, 2.05, 'audit events'),
        (4.05, 1.5, 5.45, 1.5, 'GDPR export'),
        (8.5, 6.15, 9.85, 6.85, 'OTP send req'),
        (6.0, 4.55, 9.85, 0.65, 'meeting link'),
        (2.1, 0.65, 8.0, 1.5, 'admin actions'),
    ]
    for x1, y1, x2, y2, lab in flows:
        _arrow(ax, x1, y1, x2, y2, lab, fontsize=6.5)

    return _save(fig, 'dfd_level1.png')


# ───────────────────────────────────────────────────────────
# 4. ENTITY-RELATIONSHIP DIAGRAM
# ───────────────────────────────────────────────────────────
def er_diagram():
    fig, ax = plt.subplots(figsize=(15, 12))
    _setup(ax, 15, 12, None)
    ax.text(7.5, 11.7, 'Entity-Relationship Diagram — HEALTH AI Firestore Model',
            ha='center', va='top', fontsize=14, weight='bold', color=COL_PANEL)

    def entity(x, y, w, h, title, fields, color=COL_USER):
        # Title bar
        title_bar = FancyBboxPatch((x, y + h - 0.5), w, 0.5,
                                   boxstyle="round,pad=0.0,rounding_size=0.05",
                                   fc=COL_LINE, ec=COL_LINE, lw=1.2)
        ax.add_patch(title_bar)
        ax.text(x + w / 2, y + h - 0.25, title, ha='center', va='center',
                fontsize=10, weight='bold', color='white')
        # Body
        body = FancyBboxPatch((x, y), w, h - 0.5,
                              boxstyle="round,pad=0.0,rounding_size=0.05",
                              fc=color, ec=COL_LINE, lw=1.2)
        ax.add_patch(body)
        for i, f in enumerate(fields):
            ax.text(x + 0.12, y + h - 0.75 - i * 0.30, f, ha='left', va='top', fontsize=8.5)

    # Users — top-left
    entity(0.3, 6.5, 3.4, 4.3, 'users',
           ['PK id : string', 'name : string', 'email : string',
            'passwordHash : string', 'role : enum',
            'institution : string', 'city, country : string',
            'status : active|frozen', 'isOnline : bool',
            'lastSeen : ts', 'savedPosts : array',
            'registeredAt : ISO'])

    # Posts — top-center
    entity(5.5, 5.8, 4.0, 5.0, 'posts',
           ['PK id : string', 'FK authorId → users.id',
            'title : string', 'domain : string',
            'projectStage : enum',
            'explanation : text',
            'highLevelIdea : text',
            'expertiseNeeded : text',
            'collaborationType : enum',
            'confidentiality : enum',
            'city, country : string',
            'status : enum', 'createdAt : ISO',
            'expiryDate : ISO',
            'interestCount : int',
            'meetingCount : int'])

    # Interests — top-right
    entity(11.0, 8.6, 3.7, 2.2, 'posts/{id}/interests',
           ['FK postId  •  FK userId',
            'message : string',
            'ndaAccepted : bool',
            'createdAt : serverTs'], color=COL_DATA)

    # Meetings — middle-right
    entity(11.0, 5.8, 3.7, 2.4, 'posts/{id}/meetings',
           ['FK postId',
            'FK proposedBy → users',
            'slot : ISO',
            'status : pending|accepted|declined',
            'createdAt : serverTs'], color=COL_DATA)

    # Conversations — bottom-left
    entity(0.3, 0.4, 3.4, 3.5, 'conversations',
           ['PK id (sorted member ids)',
            'members : array<userId>',
            'memberData : map',
            'lastMessage : string',
            'updatedAt : ts',
            'unreadCount : map',
            'isTyping : map'], color=COL_SYSTEM)

    # Messages — bottom-center-left
    entity(4.0, 0.4, 3.5, 3.5, 'conversations/{id}/messages',
           ['FK conversationId',
            'FK senderId → users',
            'text : string',
            'timestamp : ts',
            'read : bool',
            'reactions : map',
            'replyTo : map'], color=COL_SYSTEM)

    # Notifications — bottom-center-right
    entity(7.8, 0.4, 3.3, 3.5, 'notifications',
           ['PK id',
            'FK userId → users',
            'type : string',
            'title : string',
            'message : string',
            'postId : string',
            'fromUser : string',
            'timestamp : ts',
            'read : bool'], color=COL_EXTERNAL)

    # Activity logs — bottom-right
    entity(11.4, 0.4, 3.3, 3.5, 'activityLogs',
           ['PK id',
            'FK userId',
            'userName : string',
            'role : string',
            'actionType : enum',
            'targetEntity : string',
            'result : string',
            'details : string',
            'timestamp : ISO'], color=COL_ADMIN)

    # Relationships
    rels = [
        # users → posts (authors)
        (3.7, 8.5, 5.5, 8.0, '1', 'N', 'authors'),
        # posts → interests
        (9.5, 9.5, 11.0, 9.6, '1', 'N', 'has'),
        # posts → meetings
        (9.5, 7.0, 11.0, 7.0, '1', 'N', 'has'),
        # users → conversations
        (1.7, 6.5, 1.7, 3.9, '1', 'N', 'member of'),
        # conversations → messages
        (3.7, 2.0, 4.0, 2.0, '1', 'N', 'contains'),
        # users → notifications
        (3.0, 6.5, 8.5, 3.9, '1', 'N', 'receives'),
        # users → activityLogs
        (3.5, 6.5, 12.5, 3.9, '1', 'N', 'logged by'),
    ]
    for x1, y1, x2, y2, c1, c2, label in rels:
        _arrow(ax, x1, y1, x2, y2, label, color=COL_ACCENT_WARM, style='-', fontsize=8)
        ax.text(x1 + 0.05, y1 + 0.2, c1, fontsize=9, color=COL_ACCENT_WARM, weight='bold')
        ax.text(x2 - 0.15, y2 + 0.2, c2, fontsize=9, color=COL_ACCENT_WARM, weight='bold')

    # Legend
    legend_y = 11.1
    ax.text(0.3, 0.05, 'PK = Primary Key   •   FK = Foreign Key   •   ts = timestamp   •   ISO = ISO 8601 string',
            fontsize=8, color=COL_MUTED, style='italic')

    return _save(fig, 'er_diagram.png')


# ───────────────────────────────────────────────────────────
# 5. POST STATE TRANSITION DIAGRAM
# ───────────────────────────────────────────────────────────
def state_diagram():
    fig, ax = plt.subplots(figsize=(11, 5.5))
    _setup(ax, 11, 5.5, 'Post Lifecycle — State Transition Diagram')

    # Initial state
    ax.add_patch(Circle((0.7, 2.7), 0.15, fc=COL_TEXT))

    states = [
        (1.8, 2.4, 1.6, 0.7, 'Active', '#bae6fd'),
        (4.2, 2.4, 2.0, 0.7, 'Active +\nInterest Received', '#fde68a'),
        (7.0, 2.4, 2.1, 0.7, 'Meeting\nScheduled', '#fbcfe8'),
        (9.4, 2.4, 1.4, 0.7, 'CLOSED\n(Partner Found)', '#bbf7d0'),
        (4.2, 0.6, 1.8, 0.7, 'Expired', '#fecaca'),
        (7.0, 0.6, 1.8, 0.7, 'DELETED', '#e5e7eb'),
    ]
    for x, y, w, h, label, color in states:
        _box(ax, x, y, w, h, label, fc=color, bold=True, radius=0.1)

    # Final
    ax.add_patch(Circle((10.7, 0.95), 0.18, fc='white', ec=COL_TEXT, lw=1.2))
    ax.add_patch(Circle((10.7, 0.95), 0.10, fc=COL_TEXT))

    transitions = [
        (0.85, 2.7, 1.8, 2.7, 'create()'),
        (3.4, 2.75, 4.2, 2.75, 'addInterest()'),
        (6.2, 2.75, 7.0, 2.75, 'acceptMeeting()'),
        (9.1, 2.75, 9.4, 2.75, 'closePost()'),
        (4.2, 2.4, 4.5, 1.3, 'expiryDate < now'),
        (5.2, 0.95, 7.0, 0.95, 'admin delete'),
        (8.8, 0.95, 10.5, 0.95, ''),
        (10.1, 2.4, 10.7, 1.13, 'export'),
    ]
    for x1, y1, x2, y2, lab in transitions:
        _arrow(ax, x1, y1, x2, y2, lab, fontsize=7)

    return _save(fig, 'state_diagram.png')


# ───────────────────────────────────────────────────────────
# 6. ARCHITECTURE LAYERED DIAGRAM
# ───────────────────────────────────────────────────────────
def architecture_diagram():
    fig, ax = plt.subplots(figsize=(11, 8))
    _setup(ax, 11, 8, 'System Architecture — Layered View')

    layers = [
        (0.4, 6.4, 10.2, 1.2, 'PRESENTATION LAYER\nReact 19 Pages • Framer Motion 12 • Three.js / Spline • liquid-glass.css', '#fde68a'),
        (0.4, 4.8, 10.2, 1.2, 'BUSINESS LOGIC LAYER (Custom Hooks)\nuseAuth • usePosts • useChat • useNotifications • usePostEngagement • useToast', '#bae6fd'),
        (0.4, 3.2, 10.2, 1.2, 'DATA ACCESS LAYER\nservices/firestore.js — CRUD • Subscriptions • Transactions • Presence • Logging', '#fbcfe8'),
        (0.4, 1.6, 10.2, 1.2, 'INFRASTRUCTURE LAYER\nFirebase Firestore (real-time NoSQL) • EmailJS • External: Zoom/Teams', '#bbf7d0'),
        (0.4, 0.0, 10.2, 1.2, 'CLIENT RUNTIME\nVite 7.3 build • Static SPA • Browser (Chrome/Firefox/Safari/Edge)', '#e5e7eb'),
    ]
    for x, y, w, h, label, color in layers:
        _box(ax, x, y, w, h, label, fc=color, bold=True, radius=0.08)

    # Connecting arrows between layers
    for y in [6.4, 4.8, 3.2, 1.6]:
        _arrow(ax, 5.5, y, 5.5, y - 0.4, '', color=COL_LINE)

    # Side annotation
    ax.text(10.8, 7.0, 'Routing\n+ Guards', fontsize=8, ha='left', color=COL_MUTED)

    return _save(fig, 'architecture_diagram.png')


# ───────────────────────────────────────────────────────────
# 7. COMPONENT DIAGRAM
# ───────────────────────────────────────────────────────────
def component_diagram():
    fig, ax = plt.subplots(figsize=(15, 11))
    _setup(ax, 15, 11, None)
    ax.text(7.5, 10.7, 'Component Diagram — React Module Composition',
            ha='center', va='top', fontsize=14, weight='bold', color=COL_PANEL)

    def cluster(x, y, w, h, title, color_fill, color_edge):
        box = FancyBboxPatch((x, y), w, h,
                             boxstyle="round,pad=0.0,rounding_size=0.1",
                             fc=color_fill, ec=color_edge, lw=1.6)
        ax.add_patch(box)
        # Title bar
        title_bar = FancyBboxPatch((x, y + h - 0.45), w, 0.45,
                                    boxstyle="round,pad=0.0,rounding_size=0.06",
                                    fc=color_edge, ec=color_edge, lw=1.0)
        ax.add_patch(title_bar)
        ax.text(x + w / 2, y + h - 0.225, title, ha='center', va='center',
                fontsize=10, weight='bold', color='white')

    def fill_grid(x, y, items, cols, item_w=1.7, item_h=0.42, gap_x=0.12, gap_y=0.12):
        for i, it in enumerate(items):
            cx = x + (i % cols) * (item_w + gap_x)
            cy = y - (i // cols) * (item_h + gap_y)
            _box(ax, cx, cy, item_w, item_h, it, fc='white', fontsize=8)

    # Pages
    cluster(0.2, 6.8, 4.4, 3.6, 'Pages', '#fff7ed', COL_ACCENT_WARM)
    pages = ['LandingPage', 'Login', 'Dashboard', 'CreatePost',
             'PostDetail', 'MyPosts', 'Profile', 'AdminDashboard', 'Chat']
    fill_grid(0.4, 9.5, pages, cols=2, item_w=1.95, item_h=0.42)

    # Hooks
    cluster(5.0, 6.8, 4.4, 3.6, 'Custom Hooks', '#eff6ff', COL_LINE)
    hooks = ['useAuth', 'usePosts', 'useChat', 'useNotifications',
             'usePostEngagement', 'useToast', 'useAnimReady', 'useInteractiveFX']
    fill_grid(5.2, 9.5, hooks, cols=2, item_w=1.95, item_h=0.42)

    # Services
    cluster(9.8, 6.8, 4.9, 3.6, 'Service Layer', '#fdf2f8', '#be185d')
    services = ['firestore.js (CRUD)', 'subscriptions',
                'auth helpers', 'transactions',
                'EmailJS adapter', 'presence',
                'activity logging', 'OTP utils']
    fill_grid(10.0, 9.5, services, cols=2, item_w=2.25, item_h=0.42)

    # Shell components
    cluster(0.2, 3.0, 7.0, 3.5, 'Shell / UI Components', '#f5f3ff', '#6d28d9')
    shell = ['Navbar', 'CommandPalette', 'ToastProvider', 'UserMenu',
             'Notifications', 'ShortcutsModal', 'SkeletonLoader', 'NetworkStatus',
             'GlobalErrorBoundary', 'PageTransition', 'WizardProgress', 'PxSelect']
    fill_grid(0.4, 5.7, shell, cols=4, item_w=1.55, item_h=0.42)

    # Landing components
    cluster(7.6, 3.0, 7.1, 3.5, 'Landing Components', '#ecfeff', COL_ACCENT_COOL)
    land = ['Hero', 'BigTextReveal', 'StickyShowcase', 'HowItWorks',
            'TwoSides', 'BentoFeatures', 'SectionLabel', 'SectionNavDots',
            'FinalCTA', 'Footer', 'ProductMockups', 'LandingBackground']
    fill_grid(7.8, 5.7, land, cols=4, item_w=1.6, item_h=0.42)

    # External services
    cluster(0.2, 0.3, 4.6, 2.3, 'External Services', '#fef9c3', '#a16207')
    _box(ax, 0.4, 1.6, 4.2, 0.45, 'Firebase Firestore (Cloud NoSQL)', fc='white', fontsize=8)
    _box(ax, 0.4, 1.0, 4.2, 0.45, 'EmailJS (OTP + meeting emails)', fc='white', fontsize=8)
    _box(ax, 0.4, 0.4, 4.2, 0.45, 'Zoom / Microsoft Teams (external host)', fc='white', fontsize=8)

    # Routing
    cluster(5.2, 0.3, 4.6, 2.3, 'Routing', '#fdf4ff', '#a21caf')
    _box(ax, 5.4, 1.6, 4.2, 0.45, 'AppRoutes (React Router v7)', fc='white', fontsize=8)
    _box(ax, 5.4, 1.0, 4.2, 0.45, 'ProtectedRoute • GuestRoute', fc='white', fontsize=8)
    _box(ax, 5.4, 0.4, 4.2, 0.45, 'lazy() + Suspense + AnimatePresence', fc='white', fontsize=8)

    # Build & deploy
    cluster(10.2, 0.3, 4.5, 2.3, 'Build & Deploy', '#dcfce7', '#15803d')
    _box(ax, 10.4, 1.6, 4.1, 0.45, 'Vite 7.3 build → dist/', fc='white', fontsize=8)
    _box(ax, 10.4, 1.0, 4.1, 0.45, 'Static SPA (CSR) hosting', fc='white', fontsize=8)
    _box(ax, 10.4, 0.4, 4.1, 0.45, '.env: VITE_FIREBASE_*', fc='white', fontsize=8)

    # Connectors between clusters
    _arrow(ax, 4.6, 8.6, 5.0, 8.6, '', color=COL_LINE)
    _arrow(ax, 9.4, 8.6, 9.8, 8.6, '', color='#be185d')
    _arrow(ax, 12.2, 6.8, 2.5, 2.6, '', color='#a16207', dashed=True)
    _arrow(ax, 2.4, 6.8, 2.4, 6.5, '', color='#6d28d9')
    _arrow(ax, 11.0, 6.8, 11.0, 2.6, '', color='#15803d', dashed=True)

    return _save(fig, 'component_diagram.png')


# ───────────────────────────────────────────────────────────
# 8. SEQUENCE DIAGRAM HELPER
# ───────────────────────────────────────────────────────────
def _sequence(filename, title, lifelines, messages, height=8, width=14):
    """Generic sequence diagram drawer.
    lifelines: list of (label, x_pos)
    messages:  list of (from_x, to_x, y, label, dashed)
    """
    fig, ax = plt.subplots(figsize=(width, height))
    _setup(ax, width, height, None)
    # Title pulled higher to clear lifeline boxes
    ax.text(width / 2, height - 0.15, title, ha='center', va='top',
            fontsize=13, weight='bold', color=COL_PANEL)

    head_top = height - 0.55
    head_bottom = head_top - 0.7
    # Lifelines
    for label, x in lifelines:
        head = FancyBboxPatch((x - 0.95, head_bottom), 1.9, 0.7,
                              boxstyle="round,pad=0.0,rounding_size=0.05",
                              fc=COL_PANEL, ec=COL_LINE, lw=1.2)
        ax.add_patch(head)
        ax.text(x, head_bottom + 0.35, label, ha='center', va='center',
                fontsize=9, weight='bold', color='white')
        ax.plot([x, x], [0.3, head_bottom], color=COL_MUTED, lw=0.7, ls='--')

    # Messages
    for fx, tx, y, label, dashed in messages:
        ls = '--' if dashed else '-'
        color = '#16a34a' if dashed else COL_LINE
        arr = FancyArrowPatch((fx, y), (tx, y),
                              arrowstyle='-|>', mutation_scale=12,
                              color=color, lw=1.2, linestyle=ls)
        ax.add_patch(arr)
        ax.text((fx + tx) / 2, y + 0.12, label, ha='center', va='bottom',
                fontsize=8, color=COL_TEXT,
                bbox=dict(boxstyle='round,pad=0.2', fc='white', ec='none', alpha=0.9))

    return _save(fig, filename)


def sequence_login():
    lifelines = [
        ('User',          1.2),
        ('Login.jsx',     3.4),
        ('useAuth',       5.6),
        ('firestore.js',  7.8),
        ('Firestore',    10.0),
        ('EmailJS',      12.4),
    ]
    msgs = [
        (1.2, 3.4, 6.6, 'submit credentials', False),
        (3.4, 5.6, 6.2, 'login(email, pw)', False),
        (5.6, 7.8, 5.8, 'getUserByEmail()', False),
        (7.8, 10.0, 5.4, 'query users', False),
        (10.0, 7.8, 5.0, 'user doc', True),
        (7.8, 5.6, 4.6, 'verify SHA-256', True),
        (5.6, 7.8, 4.2, 'addActivityLog(LOGIN)', False),
        (5.6, 3.4, 3.8, 'session', True),
        (3.4, 1.2, 3.4, 'redirect /dashboard', True),
        (1.2, 3.4, 2.8, 'register submit', False),
        (3.4, 12.4, 2.4, 'sendConfirmationEmail()', False),
        (12.4, 1.2, 2.0, 'OTP email', True),
        (1.2, 3.4, 1.6, 'enter 6-digit OTP', False),
        (3.4, 7.8, 1.2, 'addUserToFirestore()', False),
        (7.8, 10.0, 0.8, 'create doc', False),
    ]
    return _sequence('seq_login.png', 'Sequence — Registration with OTP & Login', lifelines, msgs, height=8, width=14)


def sequence_create_post():
    lifelines = [
        ('User',           1.2),
        ('CreatePost',     3.4),
        ('WizardProgress', 5.6),
        ('usePosts',       7.8),
        ('firestore.js',  10.0),
        ('Firestore',     12.4),
    ]
    msgs = [
        (1.2, 3.4, 6.2, 'open /create-post', False),
        (3.4, 5.6, 5.8, 'render Step 1', False),
        (1.2, 3.4, 5.4, 'fill Core Details', False),
        (3.4, 5.6, 5.0, 'next() → Step 2', False),
        (1.2, 3.4, 4.6, 'fill Technical Info', False),
        (3.4, 5.6, 4.2, 'next() → Step 3', False),
        (1.2, 3.4, 3.8, 'fill Settings + submit', False),
        (3.4, 7.8, 3.4, 'addPost(payload)', False),
        (7.8, 10.0, 3.0, 'addPostToFirestore()', False),
        (10.0, 12.4, 2.6, 'setDoc posts/{id}', False),
        (12.4, 10.0, 2.2, 'ack', True),
        (10.0, 7.8, 1.8, 'post id', True),
        (7.8, 3.4, 1.4, 'state updated (RT)', True),
        (3.4, 1.2, 1.0, 'redirect /dashboard', True),
    ]
    return _sequence('seq_create_post.png', 'Sequence — Create Announcement Wizard', lifelines, msgs, height=7.5, width=14)


def sequence_interest():
    lifelines = [
        ('User B',             1.2),
        ('PostDetail',         3.4),
        ('NDAModal',           5.6),
        ('usePostEngagement',  7.8),
        ('firestore.js',      10.0),
        ('Notifications',     12.4),
    ]
    msgs = [
        (1.2, 3.4, 6.2, 'click Express Interest', False),
        (3.4, 5.6, 5.8, 'open NDA modal', False),
        (1.2, 5.6, 5.4, 'check NDA + message', False),
        (5.6, 3.4, 5.0, 'confirm', True),
        (3.4, 7.8, 4.6, 'addInterest(postId)', False),
        (7.8, 10.0, 4.2, 'addInterestToSubcol (transaction)', False),
        (10.0, 12.4, 3.8, 'addNotificationToFirestore()', False),
        (12.4, 10.0, 3.4, 'fanout to author', True),
        (10.0, 7.8, 3.0, 'commit + interestCount++', True),
        (7.8, 3.4, 2.6, 'subscription update', True),
        (3.4, 1.2, 2.2, 'show Propose Meeting', True),
        (1.2, 3.4, 1.6, 'pick slot → propose', False),
        (3.4, 7.8, 1.2, 'addMeetingRequest()', False),
        (7.8, 10.0, 0.8, 'addMeetingToSubcol()', False),
    ]
    return _sequence('seq_interest.png', 'Sequence — Interest Expression with NDA & Meeting Proposal', lifelines, msgs, height=7.5, width=14)


def sequence_chat():
    lifelines = [
        ('User A',         1.2),
        ('Chat.jsx',       3.4),
        ('useChat',        5.6),
        ('firestore.js',   7.8),
        ('Firestore',     10.0),
        ('User B browser',12.4),
    ]
    msgs = [
        (1.2, 3.4, 6.2, 'type message', False),
        (3.4, 5.6, 5.8, 'setTyping(true)', False),
        (5.6, 7.8, 5.4, 'setTypingStatus()', False),
        (7.8, 10.0, 5.0, 'update conversation.isTyping', False),
        (10.0, 12.4, 4.6, 'snapshot → animated dots', True),
        (1.2, 3.4, 4.0, 'press Enter (send)', False),
        (3.4, 5.6, 3.6, 'send(text)', False),
        (5.6, 7.8, 3.2, 'sendMessage()', False),
        (7.8, 10.0, 2.8, 'addDoc messages/', False),
        (10.0, 12.4, 2.4, 'snapshot → render', True),
        (10.0, 5.6, 2.0, 'snapshot → A', True),
        (12.4, 10.0, 1.6, 'markAsRead()', False),
        (10.0, 5.6, 1.2, 'read=true', True),
        (5.6, 3.4, 0.8, 'double check', True),
    ]
    return _sequence('seq_chat.png', 'Sequence — Real-Time Chat (Typing, Send, Read Receipts)', lifelines, msgs, height=7.5, width=14)


# ───────────────────────────────────────────────────────────
# 9. CLASS DIAGRAM (HOOKS + SERVICE)
# ───────────────────────────────────────────────────────────
def class_diagram():
    fig, ax = plt.subplots(figsize=(15, 11))
    _setup(ax, 15, 11, None)
    ax.text(7.5, 10.7, 'Class Diagram — Hooks, Services, and Data Contracts',
            ha='center', va='top', fontsize=14, weight='bold', color=COL_PANEL)

    def cls(x, y, w, h, name, attrs, methods, color=COL_USER):
        # Title bar
        title_bar = FancyBboxPatch((x, y + h - 0.45), w, 0.45,
                                   boxstyle="round,pad=0.0,rounding_size=0.04",
                                   fc=COL_LINE, ec=COL_LINE, lw=1.0)
        ax.add_patch(title_bar)
        ax.text(x + w / 2, y + h - 0.225, name, ha='center', va='center',
                fontsize=9.5, weight='bold', color='white')
        attr_h = 0.24 * max(len(attrs), 1) + 0.12
        body_attr = FancyBboxPatch((x, y + h - 0.45 - attr_h), w, attr_h,
                                   boxstyle="round,pad=0.0,rounding_size=0.0",
                                   fc=color, ec=COL_LINE, lw=1.0)
        ax.add_patch(body_attr)
        for i, a in enumerate(attrs):
            ax.text(x + 0.1, y + h - 0.6 - i * 0.24, a, ha='left', va='top', fontsize=7.5)
        meth_h = h - 0.45 - attr_h
        body_meth = FancyBboxPatch((x, y), w, meth_h,
                                   boxstyle="round,pad=0.0,rounding_size=0.0",
                                   fc='white', ec=COL_LINE, lw=1.0)
        ax.add_patch(body_meth)
        for i, m in enumerate(methods):
            ax.text(x + 0.1, y + meth_h - 0.20 - i * 0.24, m, ha='left', va='top', fontsize=7.5)

    # Hooks row
    cls(0.2, 6.0, 3.5, 4.0, 'useAuth (hook)',
        ['user : User | null', 'isAdmin : bool', 'session : Session'],
        ['login(email, pw)', 'logout()', 'updateUser(patch)',
         'deleteUser()', 'startSessionTimer()'])

    cls(4.0, 6.0, 3.5, 4.0, 'usePosts (hook)',
        ['posts : Post[]', 'postsLoading : bool'],
        ['addPost(p)', 'updatePost(id, p)',
         'updatePostStatus(id, s)',
         'addInterest(postId, msg)',
         'addMeetingRequest()', 'respondToMeeting()'])

    cls(7.8, 6.0, 3.5, 4.0, 'useChat (hook)',
        ['conversations : Conv[]', 'messages : Msg[]',
         'activeRecipient', 'otherIsTyping : bool'],
        ['send(text)', 'setTyping(b)', 'clearHistory()',
         'deleteConvo()', 'toggleReaction()', 'reply()'])

    cls(11.6, 6.0, 3.2, 4.0, 'useNotifications',
        ['notifications : Notif[]', 'unreadCount : int'],
        ['addNotification(n)', 'dismiss(id)',
         'dismissAll()', 'onNew(cb)'])

    # Service layer
    cls(0.2, 0.4, 5.6, 5.4, 'firestore.js (service)',
        ['db : Firestore', 'app : FirebaseApp'],
        ['hashPassword(pw) — SHA-256',
         'Users CRUD + emailExists()',
         'Posts CRUD',
         'addInterestToSubcol  [transaction]',
         'addMeetingToSubcol  [transaction]',
         'updateMeetingStatus(id, s)',
         'Chat: getOrCreate / sendMessage',
         '       markAsRead / setTyping',
         'updateUserStatus (presence)',
         'addActivityLog(event)',
         'subscribeToPostsRT → unsub',
         'subscribeTo  Messages / Convs / Users',
         '             Logs / Notifications'])

    # Entities
    cls(6.2, 3.3, 3.7, 2.5, '<<entity>> User',
        ['id, name, email', 'passwordHash, role',
         'institution, city, country',
         'status, isOnline, lastSeen',
         'savedPosts[]', 'registeredAt'],
        [], color='#fef3e2')

    cls(10.2, 3.3, 4.6, 2.5, '<<entity>> Post',
        ['id, title, domain, projectStage',
         'explanation, highLevelIdea',
         'expertiseNeeded, collaborationType',
         'confidentiality, status, expiryDate',
         'authorId, interestCount, meetingCount'],
        [], color='#fef3e2')

    cls(6.2, 0.4, 3.7, 2.4, '<<entity>> Message',
        ['id, conversationId',
         'senderId, senderName',
         'text, timestamp',
         'read, reactions, replyTo'],
        [], color='#fef3e2')

    cls(10.2, 0.4, 4.6, 2.4, '<<entity>> ActivityLog',
        ['id, timestamp',
         'userId, role',
         'actionType, targetEntity',
         'result, details'],
        [], color='#fef3e2')

    # Dependencies
    # Hook → service (no labels; "uses" implied)
    for x1 in [1.95, 5.75, 9.55, 13.2]:
        _arrow(ax, x1, 6.0, 3.0, 5.85, '', color=COL_ACCENT_WARM, style='-|>', dashed=True)

    # Service → entities (with labels offset to clear titles)
    for x2, y2, lab in [(6.2, 4.5, 'reads/writes'), (10.2, 3.8, 'reads/writes'),
                        (6.2, 1.5, 'persists'), (10.2, 1.0, 'persists')]:
        _arrow(ax, 5.8, y2, x2, y2, lab, color=COL_ACCENT_WARM, style='-|>', dashed=True, fontsize=7)

    return _save(fig, 'class_diagram.png')


# ───────────────────────────────────────────────────────────
# 10. DEPLOYMENT DIAGRAM
# ───────────────────────────────────────────────────────────
def deployment_diagram():
    fig, ax = plt.subplots(figsize=(14, 9))
    _setup(ax, 14, 9, None)
    ax.text(7.0, 8.7, 'Deployment Diagram — HEALTH AI Runtime',
            ha='center', va='top', fontsize=14, weight='bold', color=COL_PANEL)

    # User device
    _box(ax, 0.3, 2.5, 4.0, 5.0, '', fc='#fff7ed', ec=COL_ACCENT_WARM, radius=0.08)
    ax.text(2.3, 7.2, '<<device>>  User Browser', ha='center', fontsize=10, weight='bold')
    _box(ax, 0.5, 6.0, 3.6, 1.0, '<<environment>>\nChrome / Firefox / Safari / Edge', fc='white', fontsize=9)
    _box(ax, 0.5, 4.5, 3.6, 1.3, '<<artifact>>\nReact SPA (dist/)\nVite-bundled JS / CSS / HTML', fc='white', fontsize=9)
    _box(ax, 0.5, 2.8, 3.6, 1.5, '<<runtime>>\nFirebase JS SDK v12\nFramer Motion / Three.js\nliquid-glass design system', fc='white', fontsize=9)

    # Static host
    _box(ax, 4.7, 4.5, 3.3, 3.0, '', fc='#dcfce7', ec='#15803d', radius=0.08)
    ax.text(6.35, 7.2, '<<server>>  Static Host', ha='center', fontsize=10, weight='bold')
    _box(ax, 4.9, 5.8, 2.9, 1.1, 'Static SPA bundle\n(HTML / CSS / JS)', fc='white', fontsize=9)
    _box(ax, 4.9, 4.7, 2.9, 0.9, 'Asset cache + HTTPS', fc='white', fontsize=9)

    # Firebase / Google Cloud
    _box(ax, 8.4, 2.5, 5.3, 5.0, '', fc='#eff6ff', ec=COL_LINE, radius=0.08)
    ax.text(11.05, 7.2, '<<cloud>>  Google Firebase', ha='center', fontsize=10, weight='bold')
    _box(ax, 8.6, 6.0, 4.9, 1.0, 'Firebase Auth (gateway / RBAC)', fc='white', fontsize=9)
    _box(ax, 8.6, 4.6, 4.9, 1.2, 'Firestore (NoSQL real-time DB)\nusers • posts • messages • logs', fc='white', fontsize=9)
    _box(ax, 8.6, 3.5, 4.9, 1.0, 'Cloud Functions (optional / cron)', fc='white', fontsize=9)
    _box(ax, 8.6, 2.7, 4.9, 0.7, 'Hosting CDN (alternative deploy)', fc='white', fontsize=9)

    # External services
    _box(ax, 0.3, 0.3, 6.5, 1.7, '', fc='#fef9c3', ec='#a16207', radius=0.08)
    ax.text(3.55, 1.7, '<<external service>>', ha='center', fontsize=9, style='italic')
    _box(ax, 0.5, 0.5, 6.1, 0.9, 'EmailJS — OTP and meeting notification emails (HTTPS REST)', fc='white', fontsize=9)

    _box(ax, 7.2, 0.3, 6.5, 1.7, '', fc='#fdf4ff', ec='#a21caf', radius=0.08)
    ax.text(10.45, 1.7, '<<external service>>', ha='center', fontsize=9, style='italic')
    _box(ax, 7.4, 0.5, 6.1, 0.9, 'Zoom / Microsoft Teams — meeting link host', fc='white', fontsize=9)

    # Connections
    _arrow(ax, 4.1, 6.5, 4.7, 6.5, 'HTTPS GET (initial load)', color=COL_LINE)
    _arrow(ax, 4.1, 3.5, 8.4, 5.2, 'WebSocket / HTTPS\nFirestore SDK', color=COL_LINE)
    _arrow(ax, 2.3, 2.5, 3.5, 1.4, 'REST POST', color='#a16207')
    _arrow(ax, 4.1, 2.8, 10.45, 1.4, 'launch link', color='#a21caf')

    return _save(fig, 'deployment_diagram.png')


# ───────────────────────────────────────────────────────────
# 11. USER WORKFLOW (USER GUIDE)
# ───────────────────────────────────────────────────────────
def user_workflow_diagram():
    fig, ax = plt.subplots(figsize=(12, 5.5))
    _setup(ax, 12, 5.5, 'User Journey — From Registration to Partnership')

    steps = [
        (0.4, 2.3, 1.6, 0.9, '1. Register\n(.edu + OTP)', '#fde68a'),
        (2.3, 2.3, 1.6, 0.9, '2. Sign In', '#fde68a'),
        (4.2, 2.3, 1.6, 0.9, '3. Browse\n& Filter', '#bae6fd'),
        (6.1, 2.3, 1.6, 0.9, '4. Open\nPost Detail', '#bae6fd'),
        (8.0, 2.3, 1.6, 0.9, '5. Express\nInterest + NDA', '#fbcfe8'),
        (9.9, 2.3, 1.7, 0.9, '6. Propose\nMeeting', '#fbcfe8'),
        (4.2, 0.6, 1.6, 0.9, '7. Author\nAccepts', '#bbf7d0'),
        (6.1, 0.6, 1.6, 0.9, '8. Meeting\nScheduled', '#bbf7d0'),
        (8.0, 0.6, 1.6, 0.9, '9. Zoom /\nTeams Call', '#bbf7d0'),
        (9.9, 0.6, 1.7, 0.9, '10. Close as\nPartner Found', '#bbf7d0'),
    ]
    for x, y, w, h, label, color in steps:
        _box(ax, x, y, w, h, label, fc=color, bold=True, radius=0.1)

    # Arrows
    pairs = [(0, 1), (1, 2), (2, 3), (3, 4), (4, 5), (5, 9), (9, 8), (8, 7), (7, 6), (6, 2)]
    for a, b in pairs:
        x1 = steps[a][0] + steps[a][2]
        y1 = steps[a][1] + steps[a][3] / 2
        x2 = steps[b][0]
        y2 = steps[b][1] + steps[b][3] / 2
        if a == 5 and b == 9:
            _arrow(ax, steps[a][0] + steps[a][2] / 2, steps[a][1], steps[b][0] + steps[b][2] / 2, steps[b][1] + steps[b][3])
        elif a == 6 and b == 2:
            _arrow(ax, steps[a][0] + steps[a][2] / 2, steps[a][1] + steps[a][3], steps[b][0] + steps[b][2] / 2, steps[b][1])
        elif b < a:
            _arrow(ax, x2 + steps[b][2], y1, x1, y1 if a != b + 1 else y2)
        else:
            _arrow(ax, x1, y1, x2, y2)

    return _save(fig, 'user_workflow.png')


# ───────────────────────────────────────────────────────────
# 12. NAVIGATION TREE (USER GUIDE)
# ───────────────────────────────────────────────────────────
def navigation_tree():
    fig, ax = plt.subplots(figsize=(12, 7))
    _setup(ax, 12, 7, 'Navigation Map — Where to Find Each Feature')

    _box(ax, 5.0, 5.7, 2.0, 0.8, 'HEALTH AI\n(Logged In)', fc=COL_PANEL, bold=True, fontsize=10)
    ax.text(6.0, 6.1, 'HEALTH AI\n(Logged In)', ha='center', va='center',
            fontsize=10, weight='bold', color='white')

    items = [
        (0.2, 4.3, 1.8, 0.7, 'Feed\n/dashboard', '#bae6fd'),
        (2.2, 4.3, 1.8, 0.7, 'My Posts\n/my-posts', '#bae6fd'),
        (4.2, 4.3, 1.8, 0.7, 'Messages\n/chat', '#bae6fd'),
        (6.2, 4.3, 1.8, 0.7, 'Profile\n/profile', '#bae6fd'),
        (8.2, 4.3, 1.8, 0.7, 'Notifications\nbell dropdown', '#fde68a'),
        (10.2, 4.3, 1.7, 0.7, 'Admin\n/admin', '#ddd6fe'),
    ]
    for x, y, w, h, lab, color in items:
        _box(ax, x, y, w, h, lab, fc=color, bold=True, radius=0.08)
        _arrow(ax, 6.0, 5.7, x + w / 2, y + h, '', color=COL_MUTED)

    leaves = [
        (0.2, 2.8, 1.8, 0.6, 'Search & Filter'),
        (0.2, 2.1, 1.8, 0.6, 'Bookmark'),
        (0.2, 1.4, 1.8, 0.6, 'Open Detail'),
        (2.2, 2.8, 1.8, 0.6, 'Status Stats'),
        (2.2, 2.1, 1.8, 0.6, 'Publish Drafts'),
        (2.2, 1.4, 1.8, 0.6, 'Close Posts'),
        (4.2, 2.8, 1.8, 0.6, 'New Chat'),
        (4.2, 2.1, 1.8, 0.6, 'Reactions / Reply'),
        (4.2, 1.4, 1.8, 0.6, 'Clear / Delete'),
        (6.2, 2.8, 1.8, 0.6, 'Edit Profile'),
        (6.2, 2.1, 1.8, 0.6, 'Export JSON'),
        (6.2, 1.4, 1.8, 0.6, 'Delete Account'),
        (8.2, 2.8, 1.8, 0.6, 'Interest alerts'),
        (8.2, 2.1, 1.8, 0.6, 'Meeting alerts'),
        (8.2, 1.4, 1.8, 0.6, 'Dismiss all'),
        (10.2, 2.8, 1.7, 0.6, 'Manage Users'),
        (10.2, 2.1, 1.7, 0.6, 'Moderate Posts'),
        (10.2, 1.4, 1.7, 0.6, 'Audit CSV'),
    ]
    for x, y, w, h, lab in leaves:
        _box(ax, x, y, w, h, lab, fc='white', fontsize=8, radius=0.04)

    # Cmd+K / Shortcuts
    _box(ax, 1.5, 0.2, 4.0, 0.7, 'Cmd+K — Command Palette (any page)', fc=COL_ACCENT_WARM, bold=True)
    _box(ax, 6.5, 0.2, 4.0, 0.7, 'Shift+? — Keyboard Shortcuts Modal', fc=COL_ACCENT_COOL, bold=True)

    return _save(fig, 'navigation_tree.png')


# ───────────────────────────────────────────────────────────
# 13. NDA DECISION FLOW (USER GUIDE)
# ───────────────────────────────────────────────────────────
def nda_decision_flow():
    fig, ax = plt.subplots(figsize=(11, 6.5))
    _setup(ax, 11, 6.5, 'NDA Visibility Decision Flow')

    # Start
    ax.add_patch(Ellipse((1.0, 5.5), 1.4, 0.55, fc=COL_USER, ec=COL_LINE, lw=1.2))
    ax.text(1.0, 5.5, 'View Post', ha='center', va='center', fontsize=9, weight='bold')

    # Decision diamond
    diamond = Polygon([(3.5, 5.5), (4.7, 4.9), (5.9, 5.5), (4.7, 6.1)],
                      fc='#fde68a', ec=COL_LINE, lw=1.2)
    ax.add_patch(diamond)
    ax.text(4.7, 5.5, 'Confidentiality\n= NDA?', ha='center', va='center', fontsize=8, weight='bold')

    # Branch: Public Info
    _box(ax, 7.0, 5.2, 3.4, 0.7, 'Show full content\n(Tech Blueprint visible)', fc='#bbf7d0', bold=True)

    # Branch: NDA path
    diamond2 = Polygon([(3.5, 3.5), (4.7, 2.9), (5.9, 3.5), (4.7, 4.1)],
                       fc='#fde68a', ec=COL_LINE, lw=1.2)
    ax.add_patch(diamond2)
    ax.text(4.7, 3.5, 'Did user accept\nNDA?', ha='center', va='center', fontsize=8, weight='bold')

    _box(ax, 7.0, 3.2, 3.4, 0.7, 'Show full content\n(NDA accepted, blueprint open)', fc='#bbf7d0', bold=True)

    _box(ax, 0.2, 1.5, 3.4, 0.8, 'Show Executive Overview only\n(Blueprint locked + NDA prompt)', fc='#fecaca', bold=True)
    _box(ax, 4.0, 1.5, 3.0, 0.8, 'Click "Express\nInterest" → NDA Modal', fc='#bae6fd', bold=True)
    _box(ax, 7.4, 1.5, 3.0, 0.8, 'Accept NDA →\nUnlock Blueprint', fc='#bbf7d0', bold=True)

    # Arrows
    _arrow(ax, 1.7, 5.5, 3.5, 5.5, '')
    _arrow(ax, 5.9, 5.5, 7.0, 5.5, 'No')
    _arrow(ax, 4.7, 4.9, 4.7, 4.1, 'Yes')
    _arrow(ax, 5.9, 3.5, 7.0, 3.5, 'Yes')
    _arrow(ax, 4.7, 2.9, 1.9, 2.3, 'No')
    _arrow(ax, 3.6, 1.9, 4.0, 1.9, '')
    _arrow(ax, 7.0, 1.9, 7.4, 1.9, '')
    _arrow(ax, 8.9, 2.3, 8.7, 3.2, 'returns to top')

    return _save(fig, 'nda_decision_flow.png')


# ───────────────────────────────────────────────────────────
# 14. PACKAGE / DIRECTORY OVERVIEW
# ───────────────────────────────────────────────────────────
def package_diagram():
    fig, ax = plt.subplots(figsize=(11, 7))
    _setup(ax, 11, 7, 'Package / Folder Structure')

    folders = [
        (0.3, 4.5, 4.0, 2.0, 'src/', '#fef3e2'),
        (0.6, 5.6, 1.6, 0.6, 'pages/', 'white'),
        (2.4, 5.6, 1.6, 0.6, 'components/', 'white'),
        (0.6, 4.8, 1.6, 0.6, 'hooks/', 'white'),
        (2.4, 4.8, 1.6, 0.6, 'services/', 'white'),

        (4.6, 4.5, 3.5, 2.0, 'src/components/', '#bae6fd'),
        (4.8, 5.6, 1.5, 0.6, 'landing/', 'white'),
        (6.4, 5.6, 1.5, 0.6, 'shell/', 'white'),
        (4.8, 4.8, 1.5, 0.6, 'shared/', 'white'),
        (6.4, 4.8, 1.5, 0.6, 'modals/', 'white'),

        (8.4, 4.5, 2.4, 2.0, 'src/pages/', '#fbcfe8'),
        (8.6, 5.6, 2.0, 0.6, 'PostDetailParts/', 'white'),
        (8.6, 4.8, 2.0, 0.6, 'AdminParts/', 'white'),

        (0.3, 1.7, 4.0, 2.4, 'public/', '#bbf7d0'),
        (0.6, 3.0, 1.6, 0.6, 'screenshots/', 'white'),
        (2.4, 3.0, 1.6, 0.6, 'videos/', 'white'),
        (0.6, 2.2, 1.6, 0.6, 'icons/', 'white'),
        (2.4, 2.2, 1.6, 0.6, 'fonts/', 'white'),

        (4.6, 1.7, 3.5, 2.4, 'docs/', '#ddd6fe'),
        (4.8, 3.0, 1.5, 0.6, 'screenshots/', 'white'),
        (6.4, 3.0, 1.5, 0.6, 'diagrams/', 'white'),
        (4.8, 2.2, 1.5, 0.6, 'generators/', 'white'),
        (6.4, 2.2, 1.5, 0.6, 'output/', 'white'),

        (8.4, 1.7, 2.4, 2.4, 'root/', '#e5e7eb'),
        (8.6, 3.0, 2.0, 0.6, 'package.json', 'white'),
        (8.6, 2.2, 2.0, 0.6, 'vite.config.js', 'white'),
    ]
    for x, y, w, h, lab, color in folders:
        bold = color != 'white'
        _box(ax, x, y, w, h, lab if bold else lab, fc=color, bold=bold, fontsize=9 if bold else 8, radius=0.04)

    return _save(fig, 'package_diagram.png')


def generate_all():
    paths = []
    paths.append(use_case_diagram())
    paths.append(context_diagram())
    paths.append(dfd_level1())
    paths.append(er_diagram())
    paths.append(state_diagram())
    paths.append(architecture_diagram())
    paths.append(component_diagram())
    paths.append(sequence_login())
    paths.append(sequence_create_post())
    paths.append(sequence_interest())
    paths.append(sequence_chat())
    paths.append(class_diagram())
    paths.append(deployment_diagram())
    paths.append(user_workflow_diagram())
    paths.append(navigation_tree())
    paths.append(nda_decision_flow())
    paths.append(package_diagram())
    return paths


if __name__ == '__main__':
    for p in generate_all():
        print(f'Generated: {p}')
