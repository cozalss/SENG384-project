// Seeds three demo accounts (Engineer, Healthcare Professional, Admin)
// directly into Firestore so the demo flow can skip OTP. Idempotent — re-run
// any time to reset credentials.
//
//   node scripts/seed-demo-accounts.mjs

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
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

const accounts = [
    {
        id: 'usr-demo-engineer',
        name: 'Demo Engineer',
        email: 'demo.engineer@metu.edu.tr',
        role: 'Engineer',
        institution: 'Middle East Technical University',
        city: 'Ankara',
        country: 'Turkey',
    },
    {
        id: 'usr-demo-doctor',
        name: 'Dr. Demo Yılmaz',
        email: 'demo.doctor@metu.edu.tr',
        role: 'Healthcare Professional',
        institution: 'Middle East Technical University',
        city: 'Ankara',
        country: 'Turkey',
    },
    {
        id: 'usr-demo-admin',
        name: 'Demo Admin',
        email: 'admin@healthai.edu',
        role: 'Admin',
        institution: 'HEALTH AI',
        city: 'Ankara',
        country: 'Turkey',
    },
];

const main = async () => {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const password = 'Demo1234!';
    const passwordHash = await hashPassword(password);
    const now = new Date().toISOString();

    for (const acct of accounts) {
        const user = {
            ...acct,
            passwordHash,
            registeredAt: now,
            status: 'active',
            lastLogin: now,
        };
        await setDoc(doc(db, 'users', acct.id), user);
        console.log(`✓ ${acct.role.padEnd(24)} → ${acct.email}`);
    }

    console.log(`\nAll three demo accounts ready. Password for all: ${password}\n`);
    process.exit(0);
};

main().catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
});
