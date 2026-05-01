// Lists every post currently in Firestore with its status — used to diagnose
// "why is the dashboard only showing N posts?" situations.
//
//   node scripts/list-posts.mjs

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: 'AIzaSyD92ycXARM6NZhxXTNfqIVJ-Jes4GlfxUU',
    authDomain: 'health-ai-platform.firebaseapp.com',
    projectId: 'health-ai-platform',
    storageBucket: 'health-ai-platform.firebasestorage.app',
    messagingSenderId: '528868416080',
    appId: '1:528868416080:web:bb2538449bc7ff8d6ecf55',
};

const main = async () => {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const snap = await getDocs(collection(db, 'posts'));
    const posts = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const byStatus = {};
    for (const p of posts) {
        byStatus[p.status] = (byStatus[p.status] || 0) + 1;
    }
    console.log(`\nTotal posts: ${posts.length}`);
    console.log('By status:', byStatus);
    console.log('\n--- Active posts ---');
    posts.filter((p) => p.status === 'Active').forEach((p) => {
        console.log(`  ${p.id.padEnd(28)} ${p.domain.padEnd(20)} ${p.city || '-'}`);
    });
    console.log('\n--- Other statuses ---');
    posts.filter((p) => p.status !== 'Active').forEach((p) => {
        console.log(`  ${p.id.padEnd(28)} ${(p.status || '?').padEnd(12)} ${p.domain || '-'}`);
    });
    process.exit(0);
};

main().catch((err) => { console.error(err); process.exit(1); });
