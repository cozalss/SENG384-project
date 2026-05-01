// Prepares a fully-staged Firestore state for the automated demo walkthrough.
//
// Creates / overwrites:
//   • 3 demo users (Engineer, Healthcare Professional, Admin)
//   • ~7 seed posts across multiple domains (so the dashboard feed is rich)
//   • 1 Engineer-owned Draft post (for the Save-as-Draft → Publish demo)
//   • 1 Engineer-owned Active+NDA post that already has:
//       - 1 Healthcare interest entry
//       - 1 pending meeting request (so the Engineer can "Accept" it on demo)
//   • A handful of activity log entries so the Admin panel isn't empty
//
// Idempotent — re-run any time to reset the demo to a clean known state.
//
//   node scripts/prepare-demo-state.mjs

import { initializeApp } from 'firebase/app';
import {
    getFirestore, doc, setDoc, collection, addDoc, getDocs,
    deleteDoc, query, where,
} from 'firebase/firestore';
import { webcrypto } from 'node:crypto';

const firebaseConfig = {
    apiKey: 'AIzaSyD92ycXARM6NZhxXTNfqIVJ-Jes4GlfxUU',
    authDomain: 'health-ai-platform.firebaseapp.com',
    projectId: 'health-ai-platform',
    storageBucket: 'health-ai-platform.firebasestorage.app',
    messagingSenderId: '528868416080',
    appId: '1:528868416080:web:bb2538449bc7ff8d6ecf55',
};

const hashPassword = async (password) => {
    const data = new TextEncoder().encode(password);
    const buf = await webcrypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
};

const ENGINEER = {
    id: 'usr-demo-engineer',
    name: 'Demo Engineer',
    email: 'demo.engineer@metu.edu.tr',
    role: 'Engineer',
    institution: 'Middle East Technical University',
    city: 'Ankara',
    country: 'Turkey',
};
const DOCTOR = {
    id: 'usr-demo-doctor',
    name: 'Dr. Demo Yılmaz',
    email: 'demo.doctor@metu.edu.tr',
    role: 'Healthcare Professional',
    institution: 'Middle East Technical University',
    city: 'Ankara',
    country: 'Turkey',
};
const ADMIN = {
    id: 'usr-demo-admin',
    name: 'Demo Admin',
    email: 'admin@healthai.edu',
    role: 'Admin',
    institution: 'HEALTH AI',
    city: 'Ankara',
    country: 'Turkey',
};

const seedAccounts = async (db) => {
    const password = 'Demo1234!';
    const passwordHash = await hashPassword(password);
    const now = new Date().toISOString();
    for (const acct of [ENGINEER, DOCTOR, ADMIN]) {
        await setDoc(doc(db, 'users', acct.id), {
            ...acct, passwordHash,
            registeredAt: now, status: 'active', lastLogin: now,
        });
    }
    console.log('✓ 3 demo accounts ready');
};

const wipeOldDemoPosts = async (db) => {
    // Remove anything we previously seeded so re-runs leave a clean board.
    const ids = [
        'post-demo-draft', 'post-demo-active', 'post-seed-1',
        'post-seed-2', 'post-seed-3', 'post-seed-4', 'post-seed-5',
        'post-seed-6',
    ];
    for (const id of ids) {
        try { await deleteDoc(doc(db, 'posts', id)); } catch { /* not present */ }
    }
};

const buildPost = (overrides) => {
    const now = new Date().toISOString();
    const expiry = new Date(Date.now() + 30 * 86400000).toISOString();
    return {
        id: '',
        title: '',
        domain: 'AI Diagnostics',
        projectStage: 'idea',
        explanation: '',
        highLevelIdea: '',
        expertiseNeeded: '',
        collaborationType: 'co-development',
        commitmentLevel: 'co-development',
        city: 'Ankara',
        country: 'Turkey',
        confidentiality: 'overview-public',
        authorId: ENGINEER.id,
        authorName: ENGINEER.name,
        authorRole: ENGINEER.role,
        authorEmail: ENGINEER.email,
        createdAt: now,
        expiryDate: expiry,
        status: 'Active',
        interestCount: 0,
        meetingCount: 0,
        statusHistory: [{ status: 'Active', at: now, byUserId: ENGINEER.id, byUserName: ENGINEER.name }],
        ...overrides,
    };
};

const seedPosts = async (db) => {
    // 6 background seed posts across domains so the feed looks alive.
    const seeds = [
        {
            id: 'post-seed-1',
            title: 'Wearable EEG Pattern Recognition for Epilepsy Alerts',
            domain: 'Wearable Tech',
            projectStage: 'prototype developed',
            explanation: 'Looking for a partner clinic with paediatric epilepsy patients to validate an on-device seizure forerunner alert.',
            expertiseNeeded: 'Paediatric neurologist with IRB experience.',
            authorId: 'usr-seed-author-1',
            authorName: 'Prof. Aylin Kaya',
            authorRole: 'Healthcare Professional',
            authorEmail: 'aylin.kaya@example.edu',
            city: 'İstanbul',
            confidentiality: 'overview-public',
        },
        {
            id: 'post-seed-2',
            title: 'CT Imaging Anomaly Detection — Multi-Modal Fusion',
            domain: 'AI Diagnostics',
            projectStage: 'concept validation',
            explanation: 'Dataset (de-identified) for 12k chest CT scans available; need a radiology partner to label edge cases.',
            expertiseNeeded: 'Thoracic radiologist comfortable reviewing 200 scans/week.',
            authorId: 'usr-seed-author-2',
            authorName: 'Dr. Mert Şahin',
            authorRole: 'Engineer',
            authorEmail: 'mert.sahin@example.edu',
            city: 'İzmir',
            confidentiality: 'meeting-only',
        },
        {
            id: 'post-seed-3',
            title: 'Wearable ECG Patch — Continuous Cardiac Monitoring Trial',
            domain: 'Wearable Tech',
            projectStage: 'pilot testing',
            explanation: 'Single-lead ECG patch validated in lab; ready for 30-patient ambulatory trial. Looking for cardiology partner to lead protocol.',
            expertiseNeeded: 'Cardiologist with ambulatory ECG monitoring (Holter) experience.',
            authorId: 'usr-seed-author-3',
            authorName: 'Dr. Selin Demir',
            authorRole: 'Healthcare Professional',
            authorEmail: 'selin.demir@example.edu',
            city: 'Ankara',
            confidentiality: 'overview-public',
        },
        {
            id: 'post-seed-4',
            title: 'Genomics Cohort Pre-screening Pipeline',
            domain: 'Genomics',
            projectStage: 'pre-deployment',
            explanation: 'Federated pre-screening pipeline ready for clinical pilot. Looking for medical geneticist input.',
            expertiseNeeded: 'Medical geneticist with rare-disease expertise.',
            authorId: 'usr-seed-author-4',
            authorName: 'Dr. Cem Aksoy',
            authorRole: 'Engineer',
            authorEmail: 'cem.aksoy@example.edu',
            city: 'Ankara',
            confidentiality: 'meeting-only',
        },
        {
            id: 'post-seed-5',
            title: 'Telemedicine Triage Bot for Rural Clinics',
            domain: 'Telemedicine',
            projectStage: 'idea',
            explanation: 'Open-source triage layer; need primary-care clinician input on intake symptoms.',
            expertiseNeeded: 'Primary-care physician with rural-clinic experience.',
            authorId: 'usr-seed-author-5',
            authorName: 'Dr. Naz Yıldız',
            authorRole: 'Engineer',
            authorEmail: 'naz.yildiz@example.edu',
            city: 'Antalya',
            confidentiality: 'overview-public',
        },
        {
            id: 'post-seed-6',
            title: 'Mental Health Tele-Counselling Outcome Tracker',
            domain: 'Mental Health Tech',
            projectStage: 'prototype developed',
            explanation: 'Long-term outcome tracking instrument; partner therapists in 3-month pilot.',
            expertiseNeeded: 'Licensed clinical psychologist (CBT specialty).',
            authorId: 'usr-seed-author-6',
            authorName: 'Dr. Eren Polat',
            authorRole: 'Healthcare Professional',
            authorEmail: 'eren.polat@example.edu',
            city: 'İstanbul',
            confidentiality: 'overview-public',
        },
    ];
    for (const p of seeds) await setDoc(doc(db, 'posts', p.id), buildPost(p));
    console.log(`✓ ${seeds.length} background seed posts created`);

    // Engineer-owned Draft post (for Sahne 2 — Publish demo).
    const draftId = 'post-demo-draft';
    const draftNow = new Date().toISOString();
    await setDoc(doc(db, 'posts', draftId), buildPost({
        id: draftId,
        title: 'Bedside ECG Anomaly Detection — ML Co-development',
        domain: 'AI Diagnostics',
        projectStage: 'idea',
        explanation: 'Looking for an ML engineer to co-develop an ECG anomaly detector for bedside monitors. IRB-cleared dataset, hospital pilot ready.',
        expertiseNeeded: 'ML / Signal Processing engineer with time-series anomaly detection experience.',
        confidentiality: 'meeting-only',
        status: 'Draft',
        statusHistory: [{ status: 'Draft', at: draftNow, byUserId: ENGINEER.id, byUserName: ENGINEER.name }],
    }));
    console.log('✓ Engineer-owned Draft post ready (post-demo-draft)');

    // Engineer-owned Active+NDA post that the Doctor will engage with.
    const activeId = 'post-demo-active';
    const activeNow = new Date().toISOString();
    await setDoc(doc(db, 'posts', activeId), buildPost({
        id: activeId,
        title: 'Cardiology AI Pilot — ECG Anomaly Detection Lead Wanted',
        domain: 'AI Diagnostics',
        projectStage: 'concept validation',
        explanation: 'A retrospective cardiology dataset (35k 12-lead ECG cases) is ready; we need a cardiology lead for prospective validation of our ECG anomaly detector.',
        expertiseNeeded: 'Cardiologist with ECG interpretation expertise, comfortable advising on validation methodology.',
        highLevelIdea: 'Architecture: ResNet-50 backbone fine-tuned on the EU cardiology benchmark, with on-device ECG signal inference via TFLite.',
        confidentiality: 'meeting-only',
        status: 'Active',
        interestCount: 1,
        meetingCount: 1,
        statusHistory: [{ status: 'Active', at: activeNow, byUserId: ENGINEER.id, byUserName: ENGINEER.name }],
    }));
    console.log('✓ Engineer-owned Active post ready (post-demo-active)');

    // Pre-create a Healthcare interest on this post (so when Engineer goes to
    // the post detail, the Workflow Action Panel already shows a request).
    await setDoc(doc(db, 'posts', activeId, 'interests', 'int-demo'), {
        id: 'int-demo',
        userId: DOCTOR.id,
        userName: DOCTOR.name,
        userRole: DOCTOR.role,
        userEmail: DOCTOR.email,
        message: 'Bu projeye katkı sağlamak isterim. ECG sahasında 10+ yıl klinik deneyimim var.',
        ndaAccepted: true,
        ndaAcceptedAt: activeNow,
        createdAt: activeNow,
    });

    // Pre-create a pending meeting request — Engineer can demo-accept this.
    const meetIso = new Date(Date.now() + 2 * 86400000); // 2 days out
    meetIso.setHours(14, 0, 0, 0);
    await setDoc(doc(db, 'posts', activeId, 'meetings', 'meet-demo'), {
        id: 'meet-demo',
        proposedBy: DOCTOR.id,
        proposedByName: DOCTOR.name,
        proposedByEmail: DOCTOR.email,
        slotIso: meetIso.toISOString(),
        slotLabel: meetIso.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) + ' at 14:00',
        status: 'pending',
        createdAt: activeNow,
    });
    console.log('✓ Pre-staged interest + pending meeting request from Doctor');
};

const seedActivityLogs = async (db) => {
    // Old logs are not deleted (project relies on them for history); we add a
    // few fresh entries so the Admin "Logs" tab shows actual activity at top.
    const now = Date.now();
    const log = (action, role, byName, target) => ({
        id: `log-${now}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date(now - Math.random() * 600000).toISOString(),
        userId: role === 'Admin' ? ADMIN.id : (role === 'Engineer' ? ENGINEER.id : DOCTOR.id),
        userName: byName,
        role,
        actionType: action,
        targetEntity: target,
        result: 'success',
        details: `${action} on ${target}`,
    });
    const entries = [
        log('LOGIN_SUCCESS', 'Engineer', ENGINEER.name, ENGINEER.id),
        log('POST_CREATE', 'Engineer', ENGINEER.name, 'post-demo-active'),
        log('LOGIN_SUCCESS', 'Healthcare Professional', DOCTOR.name, DOCTOR.id),
        log('INTEREST_EXPRESSED', 'Healthcare Professional', DOCTOR.name, 'post-demo-active'),
        log('NDA_ACCEPTED', 'Healthcare Professional', DOCTOR.name, 'post-demo-active'),
        log('MEETING_REQUESTED', 'Healthcare Professional', DOCTOR.name, 'post-demo-active'),
    ];
    for (const e of entries) {
        await setDoc(doc(db, 'activityLogs', e.id), e);
    }
    console.log(`✓ ${entries.length} fresh activity log entries seeded`);
};

const main = async () => {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    console.log('Preparing demo state…\n');
    await seedAccounts(db);
    await wipeOldDemoPosts(db);
    await seedPosts(db);
    await seedActivityLogs(db);

    console.log('\n✅ Demo state ready. Now run:');
    console.log('     node scripts/demo-walkthrough.mjs --port 5177\n');
    process.exit(0);
};

main().catch((err) => {
    console.error('Demo state preparation failed:', err);
    process.exit(1);
});
