import puppeteer from 'puppeteer';

const BASE = process.env.SCREENSHOT_BASE_URL || 'http://localhost:5174';

const mockUser = {
  id: 'admin-1',
  email: 'test@admin.edu',
  role: 'Admin',
  name: 'Test Administrator',
  institution: 'Test University',
  status: 'active'
};

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 1440, height: 900 },
    args: ['--autoplay-policy=no-user-gesture-required']
  });
  const page = await browser.newPage();

  const takeShot = async (path, name, delay = 2000) => {
    const url = `${BASE}${path}`;
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    if (delay) await new Promise(r => setTimeout(r, delay));
    console.log(`Capturing ${name}...`);
    await page.screenshot({ path: `docs/screenshots/${name}` });
  };

  await takeShot('/', 'landing_page.png', 5000);
  await takeShot('/login', 'login_page.png', 2000);

  await page.evaluate((user) => {
    localStorage.setItem('health_ai_user', JSON.stringify(user));
  }, mockUser);

  await takeShot('/dashboard', 'dashboard_page.png', 2500);
  await takeShot('/create-post', 'create_post_page.png', 1500);
  await takeShot('/profile', 'profile_page.png', 1500);
  await takeShot('/chat', 'chat_page.png', 2000);
  await takeShot('/my-posts', 'my_posts_page.png', 1500);
  await takeShot('/admin', 'admin_page.png', 2000);

  console.log('Navigating to dashboard to click a post...');
  await page.goto(`${BASE}/dashboard`, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1500));

  const postLink = await page.$('a[href^="/post/"]');
  if (postLink) {
    console.log('Clicking post link...');
    await postLink.click();
    await new Promise(r => setTimeout(r, 2500));
    console.log('Capturing post_detail_page.png...');
    await page.screenshot({ path: `docs/screenshots/post_detail_page.png` });
  } else {
    console.log('No post found to click. Trying default route...');
    await takeShot('/post/post-1', 'post_detail_page.png', 2000);
  }

  await browser.close();
  console.log('Screenshots generated successfully.');
})();
