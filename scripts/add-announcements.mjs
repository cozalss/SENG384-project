// Adds 3 fresh, varied announcements to the live Firestore feed.
//
//   node scripts/add-announcements.mjs

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: 'AIzaSyD92ycXARM6NZhxXTNfqIVJ-Jes4GlfxUU',
    authDomain: 'health-ai-platform.firebaseapp.com',
    projectId: 'health-ai-platform',
    storageBucket: 'health-ai-platform.firebasestorage.app',
    messagingSenderId: '528868416080',
    appId: '1:528868416080:web:bb2538449bc7ff8d6ecf55',
};

const buildPost = (overrides) => {
    const now = new Date().toISOString();
    const expiry = new Date(Date.now() + 30 * 86400000).toISOString();
    const { author = {}, ...rest } = overrides;
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
        authorId: author.id,
        authorName: author.name,
        authorRole: author.role,
        authorEmail: author.email,
        createdAt: now,
        expiryDate: expiry,
        status: 'Active',
        interestCount: 0,
        meetingCount: 0,
        statusHistory: [{ status: 'Active', at: now, byUserId: author.id, byUserName: author.name }],
        ...rest,
    };
};

const announcements = [
    {
        id: 'post-anno-1',
        title: 'Diabetic Retinopathy Screening AI — Need Ophthalmology Validation',
        domain: 'AI Diagnostics',
        projectStage: 'pilot testing',
        explanation: 'A CNN-based retinal image classifier (sensitivity 94%, specificity 91%) ready for prospective clinical validation in a primary-care setting. Looking for an ophthalmologist to lead the pilot at 2-3 partner clinics over 6 months.',
        highLevelIdea: 'EfficientNet-B4 backbone fine-tuned on EyePACS + Messidor-2 datasets. Quantized for Coral Edge TPU inference (~120ms / image).',
        expertiseNeeded: 'Board-certified ophthalmologist with at least 5 years of retinopathy screening experience. IRB navigation a plus.',
        confidentiality: 'meeting-only',
        city: 'İstanbul',
        author: {
            id: 'usr-anno-author-1',
            name: 'Dr. Alper Yıldırım',
            role: 'Engineer',
            email: 'alper.yildirim@example.edu',
        },
    },
    {
        id: 'post-anno-2',
        title: 'Smart Insulin Pump Closed-Loop Algorithm — Endocrinology Partner',
        domain: 'Wearable Tech',
        projectStage: 'concept validation',
        explanation: 'Open-source closed-loop insulin delivery algorithm targeting Type 1 diabetes. Bench-tested in simulation, ready for in-vivo pilot with paediatric or adult cohort. Need an endocrinologist to co-author the protocol and oversee patient safety.',
        expertiseNeeded: 'Endocrinologist (paediatric or adult T1D), comfortable with continuous glucose monitoring data review.',
        confidentiality: 'overview-public',
        city: 'Ankara',
        author: {
            id: 'usr-anno-author-2',
            name: 'Dr. Zeynep Aksoy',
            role: 'Healthcare Professional',
            email: 'zeynep.aksoy@example.edu',
        },
    },
    {
        id: 'post-anno-3',
        title: 'Rehabilitation Robotics — Stroke Recovery Gait Analysis',
        domain: 'Surgical Robotics',
        projectStage: 'prototype developed',
        explanation: 'Lower-limb exoskeleton for post-stroke gait rehabilitation. Force/torque telemetry collected from 12 healthy volunteers; need a physiatrist to design the patient-cohort protocol and co-author the outcome metric.',
        highLevelIdea: 'Series-elastic actuators at hip and knee, ROS 2 control stack, real-time kinematics streamed to a clinician dashboard.',
        expertiseNeeded: 'Physiatrist or rehabilitation specialist with stroke-recovery patient experience.',
        confidentiality: 'meeting-only',
        city: 'İzmir',
        author: {
            id: 'usr-anno-author-3',
            name: 'Prof. Burak Kaya',
            role: 'Engineer',
            email: 'burak.kaya@example.edu',
        },
    },
];

const main = async () => {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    for (const a of announcements) {
        const post = buildPost(a);
        await setDoc(doc(db, 'posts', a.id), post);
        console.log(`✓ ${post.title}`);
    }

    console.log(`\n✅ ${announcements.length} new announcement(s) added.\n`);
    process.exit(0);
};

main().catch((err) => {
    console.error('Failed:', err);
    process.exit(1);
});
