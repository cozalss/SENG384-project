import { 
    Activity, Cpu, Database, 
    Brain, Code, FlaskConical, Microscope, 
    Fingerprint, UserCheck, MessageSquare, Handshake 
} from 'lucide-react';

export const domains = [
    { name: 'AI & ML', icon: <Brain size={18} />, color: '#60a5fa' },
    { name: 'Medical Devices', icon: <Cpu size={18} />, color: '#22d3ee' },
    { name: 'Robotics', icon: <Code size={18} />, color: '#ec4899' },
    { name: 'Biosensors', icon: <Fingerprint size={18} />, color: '#f59e0b' },
    { name: 'Drug Discovery', icon: <FlaskConical size={18} />, color: '#8b5cf6' },
    { name: 'Genomics', icon: <Microscope size={18} />, color: '#ef4444' },
    { name: 'Health IT', icon: <Database size={18} />, color: '#3b82f6' }
];

export const compareItems = [
    { old: 'LinkedIn / Cold Outreach', now: 'Structured partner discovery' },
    { old: 'Unprotected early-stage talks', now: 'Mandatory NDA workflow' },
    { old: 'Scattered student forums', now: 'Verified .edu-only environment' },
    { old: 'Geographic limitations', now: 'Pan-European network' }
];

export const workflow = [
    { step: 1, title: 'Identity Verification', icon: <UserCheck size={18} />, desc: 'Register with your institutional .edu email. We verify you are a genuine professional or student.', accent: '#60a5fa' },
    { step: 2, title: 'Post or Browse', icon: <Activity size={18} />, desc: 'Engineers post tech capabilities; clinicians post unmet needs. Browse the feed with smart filters.', accent: '#22d3ee' },
    { step: 3, title: 'Express Interest', icon: <MessageSquare size={18} />, desc: 'Found a match? One click notifies the author. No contact info is shared yet.', accent: '#8b5cf6' },
    { step: 4, title: 'NDA Agreement', icon: <Fingerprint size={18} />, desc: 'Both parties accept a standard NDA. This creates a safe zone for the first meeting.', accent: '#f59e0b' },
    { step: 5, title: 'Meet & Innovate', icon: <Handshake size={18} />, desc: 'Propose a time and link your preferred meeting tool. Collaboration starts here.', accent: '#ec4899' }
];
