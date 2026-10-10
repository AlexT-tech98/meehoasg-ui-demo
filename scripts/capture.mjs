import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';

const root = 'https://alext-tech98.github.io/meehoasg-ui-demo/';
const pages = [
  ['dashboard', 'tong-quan'], ['production', 'san-xuat'],
  ['orders', 'don-hang'], ['debt', 'cong-no'],
  ['payment', 'payment-check'], ['kpi', 'bao-cao-kpi'],
  ['flowers', 'nguyen-lieu'], ['admin', 'cai-dat']
];
const widths = [320, 375, 390, 430, 768, 1024, 1440];
const browser = await chromium.launch({ headless: true });
const findings = [];
mkdirSync('evidence', { recursive: true });
try {
  for (const version of ['baseline', 'after']) {
    for (const width of widths) {
      const height = width >= 1024 ? 900 : width >= 768 ? 1024 : 844;
      const tab = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
      const errors = [];
      tab.on('pageerror', error => errors.push(error.message));
      await tab.goto(version === 'baseline' ? `${root}baseline/?capture=1` : `${root}?capture=1`, { waitUntil: 'networkidle' });
      await tab.waitForFunction(() => window.MEEOPS7 && document.querySelector('#app:not(.hidden)'), { timeout: 15000 });
      for (const [key, slug] of pages) {
        await tab.evaluate(async module => { await window.MEEOPS7.go(module); }, key);
        await tab.waitForTimeout(350);
        const metrics = await tab.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          viewportWidth: innerWidth,
          heading: document.querySelector('#content h1,#content h2,#content h3')?.textContent?.trim() || '',
          contentLength: document.querySelector('#content')?.innerText?.length || 0
        }));
        const finding = { version, width, height, module: key, ...metrics, errors: errors.splice(0) };
        findings.push(finding);
        if (width === 390 || width === 1440) {
          await tab.screenshot({ path: `evidence/${version}-${slug}-${width}.png`, animations: 'disabled' });
        }
      }
      await tab.close();
    }
  }
} finally { await browser.close(); }
writeFileSync('evidence/results.json', JSON.stringify(findings, null, 2));
const bad = findings.filter(x => x.scrollWidth > x.viewportWidth + 1 || x.contentLength < 30 || x.errors.length);
console.log(JSON.stringify({ states: findings.length, bad: bad.length, examples: bad.slice(0, 12) }, null, 2));
if (bad.length) process.exitCode = 1;
