import puppeteer from 'puppeteer';

const PORT = process.env.PORT || 5175;
const BASE = `http://localhost:${PORT}`;
const mockUser = {
    id: 'admin-1',
    email: 'test@admin.edu',
    role: 'Admin',
    name: 'Test Administrator',
    institution: 'Test University',
    status: 'active',
};

(async () => {
    const browser = await puppeteer.launch({
        headless: 'new',
        defaultViewport: { width: 1440, height: 900 },
        args: ['--autoplay-policy=no-user-gesture-required'],
    });
    const page = await browser.newPage();

    // First navigate to seed localStorage on the right origin.
    await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
    await page.evaluate((u) => {
        localStorage.setItem('health_ai_user', JSON.stringify(u));
        localStorage.setItem('health_ai_theme', 'light');
    }, mockUser);

    const grab = async (path, name, delay = 2000) => {
        await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' });
        await new Promise((r) => setTimeout(r, delay));
        await page.screenshot({ path: `docs/screenshots/${name}` });
        console.log('shot', name);
    };

    await grab('/dashboard', 'light_dashboard.png', 3000);
    await grab('/profile', 'light_profile.png', 1500);
    await grab('/chat', 'light_chat.png', 1500);

    await browser.close();
})();
