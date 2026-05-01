// One-shot seeder: registers a demo Healthcare Professional account directly
// in Firestore, bypassing the .edu OTP flow so the presentation login is
// reliable. Run with:
//   node scripts/seed-demo-engineer.mjs
//
// Email:    demo.doctor@metu.edu.tr
// Password: Demo1234!

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
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

const main = async () => {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    const email = 'demo.doctor@metu.edu.tr';
    const password = 'Demo1234!';
    const id = 'usr-demo-doctor';

    const passwordHash = await hashPassword(password);
    const now = new Date().toISOString();

    const user = {
        id,
        name: 'Dr. Demo Yılmaz',
        email,
        passwordHash,
        role: 'Healthcare Professional',
        institution: 'Middle East Technical University',
        city: 'Ankara',
        country: 'Turkey',
        registeredAt: now,
        status: 'active',
        lastLogin: now,
    };

    const ref = doc(db, 'users', id);
    const existing = await getDoc(ref);
    if (existing.exists()) {
        console.log(`User ${id} already exists — overwriting with fresh credentials.`);
    }
    await setDoc(ref, user);

    // Clean up the previous Engineer demo account so logins don't get confused.
    try {
        await deleteDoc(doc(db, 'users', 'usr-demo-engineer'));
        console.log('Cleaned up old usr-demo-engineer record.');
    } catch {
        /* fine — record may not exist */
    }

    console.log('\n✅  Demo Healthcare Professional hesabı hazır.\n');
    console.log(`   Email:    ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role:     Healthcare Professional`);
    console.log(`   Doc ID:   ${id}\n`);

    process.exit(0);
};

main().catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
});
