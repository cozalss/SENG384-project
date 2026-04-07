import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyD92ycXARM6NZhxXTNfqIVJ-Jes4GlfxUU",
    authDomain: "health-ai-platform.firebaseapp.com",
    projectId: "health-ai-platform",
    storageBucket: "health-ai-platform.firebasestorage.app",
    messagingSenderId: "528868416080",
    appId: "1:528868416080:web:bb2538449bc7ff8d6ecf55"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;
