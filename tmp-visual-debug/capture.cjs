const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const search = page.locator('input[placeholder="搜索软件、文章..."]').locator('xpath=ancestor::div[contains(@class,"relative")][1]');
  const carousel = page.locator('text=浏览软件库').locator('xpath=ancestor::div[contains(@class,"rounded-xl")][1]');
  const searchBox = await search.boundingBox();
  const carouselBox = await carousel.boundingBox();
  const out = path.resolve('tmp-visual-debug');
  require('fs').mkdirSync(out, { recursive: true });
  await page.screenshot({ path: path.join(out, 'page-static.png'), fullPage: false });
  if (searchBox) await page.screenshot({ path: path.join(out, 'search-static.png'), clip: { x: Math.max(0, searchBox.x - 70), y: Math.max(0, searchBox.y - 70), width: searchBox.width + 140, height: searchBox.height + 140 } });
  if (carouselBox) await page.screenshot({ path: path.join(out, 'carousel-static.png'), clip: { x: Math.max(0, carouselBox.x - 80), y: Math.max(0, carouselBox.y - 80), width: carouselBox.width + 160, height: carouselBox.height + 160 } });
  await search.hover();
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(out, 'search-hover.png'), clip: { x: Math.max(0, searchBox.x - 70), y: Math.max(0, searchBox.y - 70), width: searchBox.width + 140, height: searchBox.height + 140 } });
  await carousel.hover();
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(out, 'carousel-hover.png'), clip: { x: Math.max(0, carouselBox.x - 80), y: Math.max(0, carouselBox.y - 80), width: carouselBox.width + 160, height: carouselBox.height + 160 } });
  const info = await page.evaluate(() => {
    const input = document.querySelector('input[placeholder="搜索软件、文章..."]');
    const searchRoot = input?.closest('.relative.w-full');
    const buttonText = [...document.querySelectorAll('button')].find(b => b.textContent?.includes('浏览软件库'));
    const carouselRoot = buttonText?.closest('.rounded-xl');
    return {
      searchHTML: searchRoot?.outerHTML.slice(0, 1500),
      carouselHTML: carouselRoot?.outerHTML.slice(0, 2500),
      searchRect: searchRoot?.getBoundingClientRect().toJSON(),
      carouselRect: carouselRoot?.getBoundingClientRect().toJSON(),
    };
  });
  console.log(JSON.stringify({ out, searchBox, carouselBox, info }, null, 2));
  await browser.close();
})();
