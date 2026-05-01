// Automated demo tour for HEALTH AI.
//
// Strategy: Firestore is pre-staged with all the demo state (Draft post,
// Active+NDA post with pending meeting request, seed feed, etc.) by
// `prepare-demo-state.mjs`. This script does NOT fight with custom dropdowns,
// modals, or React state — it just navigates, types into plain inputs, and
// clicks primary buttons by their visible text. Every step is wrapped so a
// single failure does not abort the rest of the tour.
//
// USAGE:
//   1. node scripts/prepare-demo-state.mjs        # one-time per session
//   2. Start OBS / screen recorder
//   3. node scripts/demo-walkthrough.mjs --port 5177
//
// ≈ 4 min 30 sec runtime.

import puppeteer from 'puppeteer';

const PORT = (() => {
    const i = process.argv.indexOf('--port');
    return i > -1 ? process.argv[i + 1] : '5177';
})();
const BASE = `http://localhost:${PORT}`;

const ACCOUNTS = {
    engineer: { email: 'demo.engineer@metu.edu.tr', password: 'Demo1234!' },
    doctor:   { email: 'demo.doctor@metu.edu.tr',   password: 'Demo1234!' },
    admin:    { email: 'admin@healthai.edu',        password: 'Demo1234!' },
};

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (label) => console.log(`\n▶ ${label}`);
const safe = async (label, fn) => {
    try { await fn(); }
    catch (e) { console.warn(`   ↪ "${label}" pas geçildi: ${e.message.slice(0, 80)}`); }
};

// ---- Tiny DOM helpers (run inside the page context) ----

const clickExactText = (page, text) =>
    page.evaluate((t) => {
        const trim = (s) => (s || '').trim();
        const exact = [...document.querySelectorAll('button, a, [role="button"]')]
            .find((el) => trim(el.innerText) === t);
        if (exact) { exact.click(); return; }
        const partial = [...document.querySelectorAll('button, a, [role="button"]')]
            .find((el) => new RegExp(`\\b${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(trim(el.innerText)));
        if (partial) { partial.click(); return; }
        throw new Error(`No clickable element with text "${t}"`);
    }, text);

const clickInsideForm = (page, regexSrc) =>
    page.evaluate((src) => {
        const re = new RegExp(src, 'i');
        const all = [...document.querySelectorAll('button')];
        const inForm = all.find((b) => (b.type === 'submit' || b.closest('form')) && re.test((b.innerText || '').trim()));
        const any = all.find((b) => re.test((b.innerText || '').trim()));
        const target = inForm || any;
        if (target) target.click();
        else throw new Error(`No form button matching ${re}`);
    }, regexSrc);

const fillInput = async (page, selector, value) => {
    const el = await page.waitForSelector(selector, { visible: true, timeout: 6000 });
    await el.click({ clickCount: 3 });
    await el.type(value, { delay: 22 });
};

const goto = async (page, path) => {
    await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle2' });
};

const login = async (page, account) => {
    // Force a hard reload by navigating to root first, then /login. This
    // resets any leftover Register-mode state from the .edu error demo and
    // guarantees the form starts on the Sign In tab.
    await goto(page, '/');
    await wait(400);
    await goto(page, '/login');
    await wait(1200);

    // Default mode is Sign In — DO NOT click any "Sign In" text, because the
    // submit button is also labelled "Sign In" and could be hit instead of
    // the mode tab, submitting an empty form and triggering an error state.

    await fillInput(page, 'input[type="email"]', account.email);
    await wait(300);
    await fillInput(page, 'input[type="password"]', account.password);
    await wait(400);

    // Submit by pressing Enter on the focused password field — the most
    // reliable submit path that bypasses every clickability concern with the
    // visible Sign In button.
    await page.keyboard.press('Enter');

    const t0 = Date.now();
    while (Date.now() - t0 < 15000) {
        if (page.url().includes('/dashboard')) {
            await wait(1000);
            return;
        }
        await wait(200);
    }
    throw new Error(`Login timed out for ${account.email} — still on ${page.url()}`);
};

const logout = async (page) => {
    // Hit the URL directly — App.jsx's logout is just clearing local user; if
    // a dedicated logout route doesn't exist, falling back to /login wipes the
    // session via the route guard.
    await safe('open user menu', async () => {
        await page.evaluate(() => {
            const t = [...document.querySelectorAll('button')]
                .find((b) => /menu|profile|account|user/i.test(b.getAttribute('aria-label') || ''));
            if (t) t.click();
        });
        await wait(500);
        await clickExactText(page, 'Logout');
    });
    await wait(800);
    // Whatever happened, force-navigate so the next login is clean.
    await goto(page, '/login');
    await wait(700);
};

// =================================================================
// SCENE FUNCTIONS
// =================================================================

const sceneOpening = async (page) => {
    log('AÇILIŞ — Landing');
    await goto(page, '/');
    await wait(4500);
};

const scene1 = async (page) => {
    log('SAHNE 1 — .edu validasyon + Engineer login');
    // Click Create Account on landing
    await safe('Create Account', () => clickExactText(page, 'Create Account'));
    await wait(1500);

    // Switch to Register tab
    await safe('Register tab', () => clickExactText(page, 'Register'));
    await wait(900);

    // Type a non-.edu email — should trigger validation error
    await safe('email demo@gmail.com', () => fillInput(page, 'input[type="email"]', 'demo@gmail.com'));
    await safe('password', () => fillInput(page, 'input[type="password"]', 'Demo1234!'));
    await wait(700);
    // In Register mode, submit button text is literally "Create Account"
    // (matches Login.jsx line ~700 — `mode === 'login' ? 'Sign In' : 'Create Account'`).
    await safe('submit register', () => clickInsideForm(page, 'create account|continue|register|sign up'));
    await wait(3000); // Camera lingers on the .edu error

    // Reset and log in cleanly with the seeded engineer.
    await login(page, ACCOUNTS.engineer);
    await wait(800);
};

const scene2 = async (page) => {
    log('SAHNE 2 — Draft → Publish, Edit, Delete butonu, feed');
    // Show My Posts with the pre-seeded Draft visible
    await goto(page, '/my-posts');
    await wait(2500);

    // Filter by Draft tab to highlight the rozet
    await safe('Draft tab', () => clickExactText(page, 'Draft'));
    await wait(2200);

    // Click Publish on the draft (only Draft cards have it)
    await safe('Publish draft', () => clickExactText(page, 'Publish'));
    await wait(2500); // The card flips Draft → Active live

    // All filter — show full list
    await safe('All tab', () => clickExactText(page, 'All'));
    await wait(2000);

    // Hover an Edit / Delete button visually by scrolling slowly
    await page.evaluate(() => window.scrollBy({ top: 150, behavior: 'smooth' }));
    await wait(2000);

    // Back to dashboard to show the rich seed feed
    await goto(page, '/dashboard');
    await wait(3500);
};

const scene3 = async (page) => {
    log('SAHNE 3 — Search + filters + clear');
    await goto(page, '/dashboard');
    await wait(1500);

    // Search for ECG
    await safe('search ECG', async () => {
        const sel = 'input[type="search"], input[placeholder*="Search" i]';
        await fillInput(page, sel, 'ECG');
    });
    await wait(2800);

    // Clear the search box
    await safe('clear search', async () => {
        const sel = 'input[type="search"], input[placeholder*="Search" i]';
        const el = await page.$(sel);
        if (el) {
            await el.click({ clickCount: 3 });
            await el.press('Backspace');
        }
    });
    await wait(2000);
};

const scene4 = async (page, browser) => {
    log('SAHNE 4 — Doctor logs in, opens Engineer post, Engineer accepts pre-staged meeting');

    // ---- Doctor side ----
    // Use a second tab so we don't dirty the Engineer session.
    const docPage = await browser.newPage();
    await login(docPage, ACCOUNTS.doctor);
    await wait(1500);

    // Navigate straight to the staged post
    await goto(docPage, '/post/post-demo-active');
    await wait(4000); // Lingering on the post detail UI for the camera

    // Show the (already-recorded in Firestore) interest panel — scroll a bit
    await docPage.evaluate(() => window.scrollBy({ top: 220, behavior: 'smooth' }));
    await wait(2500);

    await docPage.close();

    // ---- Engineer side ----
    await page.bringToFront();
    await goto(page, '/post/post-demo-active');
    await wait(3000);

    // Workflow Action Panel should show the pending meeting — click Accept.
    await safe('Accept meeting', () => clickExactText(page, 'Accept'));
    await wait(3000);
};

const scene5 = async (page, browser) => {
    log('SAHNE 5 — Admin paneli');
    const adminPage = await browser.newPage();
    await login(adminPage, ACCOUNTS.admin);
    await wait(1200);
    await goto(adminPage, '/admin');
    await wait(3000);

    // Cycle through tabs
    for (const tab of ['Users', 'Posts', 'Logs']) {
        await safe(`tab ${tab}`, () => clickExactText(adminPage, tab));
        await wait(2800);
    }

    // Hover the Export CSV button
    await safe('Export CSV', () => clickExactText(adminPage, 'Export CSV'));
    await wait(2500);

    await adminPage.close();
};

const scene6 = async (page, browser) => {
    log('SAHNE 6 — Profile & GDPR');
    const profPage = await browser.newPage();
    await login(profPage, ACCOUNTS.engineer);
    await wait(1200);
    await goto(profPage, '/profile');
    await wait(2800);

    await safe('Edit Profile', () => clickExactText(profPage, 'Edit Profile'));
    await wait(2200);
    await safe('Cancel edit', () => clickExactText(profPage, 'Cancel'));
    await wait(1500);

    // Export My Data — primary GDPR action
    await safe('Export My Data', () => clickExactText(profPage, 'Export My Data'));
    await wait(3000);

    // Delete Account flow (we open and immediately cancel)
    await safe('Delete Account', () => clickExactText(profPage, 'Delete Account'));
    await wait(2400);
    await safe('Cancel delete', () => clickExactText(profPage, 'Cancel'));
    await wait(1500);

    // Notifications bell on navbar
    await safe('Notifications bell', async () => {
        await profPage.evaluate(() => {
            const bell = [...document.querySelectorAll('button')]
                .find((b) => /notification|bell/i.test(b.getAttribute('aria-label') || ''));
            if (bell) bell.click();
        });
    });
    await wait(3000);

    await profPage.close();
};

const sceneClosing = async (page) => {
    log('KAPANIŞ — Landing');
    await page.bringToFront();
    await goto(page, '/');
    await wait(3000);
};

// =================================================================
// MAIN
// =================================================================

(async () => {
    console.log(`\nDriving demo against ${BASE}\n`);
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized'],
    });
    const [page] = await browser.pages();

    // Force dark theme for the entire demo. useTheme.js reads
    // localStorage['health_ai_theme'] synchronously at module load, so we
    // inject this BEFORE any navigation so the very first paint is dark.
    const forceDarkTheme = async (target) => {
        await target.evaluateOnNewDocument(() => {
            try { localStorage.setItem('health_ai_theme', 'dark'); } catch { /* ignore */ }
        });
    };
    await forceDarkTheme(page);
    // Also force it on every new tab opened later in the demo.
    browser.on('targetcreated', async (t) => {
        try {
            const p = await t.page();
            if (p) await forceDarkTheme(p);
        } catch { /* not a page target */ }
    });

    try {
        await sceneOpening(page);
        await scene1(page);
        await scene2(page);
        await scene3(page);
        await scene4(page, browser);
        await scene5(page, browser);
        await scene6(page, browser);
        await sceneClosing(page);

        console.log('\n✅ Demo turu tamamlandı. OBS kaydını durdurabilirsin.');
        console.log('   Tarayıcı açık kalıyor — manuel inceleme yapabilirsin.\n');
    } catch (err) {
        console.error('\n❌ Beklenmeyen hata:', err.message);
        console.error('Tarayıcı açık kalıyor.');
    }
})();
