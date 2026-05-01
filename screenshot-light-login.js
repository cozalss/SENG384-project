import puppeteer from 'puppeteer';

const PORT = process.env.PORT || 5175;
const BASE = `http://localhost:${PORT}`;

(async () => {
    const browser = await puppeteer.launch({
        headless: 'new',
        defaultViewport: { width: 1440, height: 900 },
        args: ['--autoplay-policy=no-user-gesture-required'],
    });
    const page = await browser.newPage();

    // Visit landing first to set the theme via localStorage on this origin.
    await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
        localStorage.setItem('health_ai_theme', 'light');
    });

    // Now load the login page (no user → guest route works).
    await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
    await new Promise((r) => setTimeout(r, 3000));
    await page.screenshot({ path: 'docs/screenshots/light_login.png' });
    console.log('shot light_login.png');

    await browser.close();
})();
