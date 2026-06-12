const fs = require('fs');
const puppeteer = require('puppeteer');

(async () => {
  const url = process.argv[2] || 'http://localhost:3001/dashboard';
  const out = [];
  let browser;
  try {
    // try to locate a Chromium/Chrome executable on Windows
    const candidates = [
      process.env.CHROME_PATH,
      process.env.CHROMIUM_PATH,
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
    ].filter(Boolean);

    let execPath = null;
    for (const p of candidates) {
      if (p && fs.existsSync(p)) {
        execPath = p;
        break;
      }
    }

    const launchOpts = { headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] };
    if (execPath) launchOpts.executablePath = execPath;

    if (!execPath) {
      console.warn('No local Chrome/Chromium executable found. Puppeteer may fail to launch if Chromium was not installed during package install. Trying default launch (may fail).');
    } else {
      console.log('Using browser executable:', execPath);
    }

    browser = await puppeteer.launch(launchOpts);
    const page = await browser.newPage();

    page.on('console', msg => {
      const args = msg.args();
      Promise.all(args.map(a => a.jsonValue().catch(() => a.toString())))
        .then(vals => out.push({ type: 'console', level: msg.type(), text: msg.text(), args: vals, timestamp: Date.now() }));
    });

    page.on('pageerror', err => {
      out.push({ type: 'pageerror', error: err.message, stack: err.stack, timestamp: Date.now() });
    });

    page.on('requestfailed', req => {
      out.push({ type: 'requestfailed', url: req.url(), method: req.method(), timestamp: Date.now(), failure: req.failure() });
    });

    page.on('response', async res => {
      const status = res.status();
      if (status >= 400) {
        out.push({ type: 'response', url: res.url(), status, timestamp: Date.now() });
      }
    });

    console.log('Opening', url);
    const res = await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 }).catch(e => ({ error: e.message }));
    if (res && res.error) {
      console.error('Navigation error:', res.error);
    } else {
      console.log('Page loaded, waiting for additional activity (5s)...');
      await page.waitForTimeout(5000);
    }

    // Optionally take a screenshot for visual debug
    const screenshotPath = 'capture-dashboard.png';
    await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {});
    console.log('Saved screenshot to', screenshotPath);

    const outPath = 'capture-logs.json';
    fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
    console.log('Wrote logs to', outPath);
    // print summary
    console.log('Collected', out.length, 'events');
    out.slice(0, 200).forEach((ev, i) => console.log(i + 1, ev.type, ev.level || '', ev.text || ev.error || ev.url || ''));
  } catch (err) {
    console.error('Script error:', err);
    console.error('If this mentions missing Chrome/Chromium, either install Chromium with `npx puppeteer install` or set CHROME_PATH to your Chrome executable.');
  } finally {
    if (browser) await browser.close();
  }
})();
