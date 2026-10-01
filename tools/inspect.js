#!/usr/bin/env node
/**
 * Headless inspection harness. Each invocation launches its own Chromium,
 * so many agents can run this concurrently without colliding.
 *
 *   node tools/inspect.js <scenario.js> [--url URL] [--out DIR] [--w 1440] [--h 900] [--mobile] [--dark] [--slow]
 *
 * scenario.js must `module.exports = async ({page, shot, log, expect}) => { ... }`
 *   shot('name')            -> saves DIR/name.png, returns path
 *   shot('name', selector)  -> element screenshot
 *   log(...)                -> printed to stdout under LOG:
 *   page                    -> full Playwright Page API
 *
 * Prints a report: console errors, page errors, failed requests, screenshot paths.
 *
 * ============ A SCENARIO CANNOT GO GREEN BY DECLINING TO THROW ============
 * ROUND 2 OF WAVE 9. Twenty-six of the forty-two scenarios in the acceptance
 * suite print `FAIL` rows and return normally, so `node tools/inspect.js
 * <scenario>` exited 0 while the report on screen said the law was broken.
 * `tools/acceptance.js` was written around that — it reads the OUTPUT for this
 * project's own failure convention — but a critic reproducing a finding
 * standalone, or an agent running one file in a loop, got a zero exit and a
 * page full of FAIL. So the convention is enforced HERE, once, for every
 * scenario and every runner:
 *
 *   a line beginning `FAIL`, a line ending `-> FAIL`, a `>>> … BROKEN`,
 *   `>>> … FAILED`, `>>> … VIOLATED`, or `HAS FAILURES`
 *
 * makes the process exit 1. `--allow-fail` opts out, for a probe whose whole
 * subject is what a failure looks like. Both runners import the regex from
 * `tools/scenarios/lib/verdict.js`, so the two can never drift apart.
 */
const path = require('path'), fs = require('fs');
const { chromium } = require('playwright');

/** THIS PROJECT'S FAILURE CONVENTION, in one place both runners import. */
const { FAIL_LINE } = require('./scenarios/lib/verdict.js');

if (require.main === module) (async () => {
  const argv = process.argv.slice(2);
  const flag = (n, d) => { const i = argv.indexOf('--' + n); return i >= 0 ? argv[i + 1] : d; };
  const has = n => argv.includes('--' + n);
  const scenarioPath = argv.find(a => !a.startsWith('--') && (argv.indexOf(a) === 0 || !argv[argv.indexOf(a) - 1]?.startsWith('--')));
  const url = flag('url', 'http://localhost:8777/app/');
  const outDir = path.resolve(flag('out', path.join(require('os').tmpdir(), 'inspect-' + process.pid)));
  fs.mkdirSync(outDir, { recursive: true });
  const width = +flag('w', has('mobile') ? 390 : 1440), height = +flag('h', has('mobile') ? 844 : 900);

  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 2,
    colorScheme: has('dark') ? 'dark' : 'light',
    isMobile: has('mobile'), hasTouch: has('mobile'),
    reducedMotion: has('reduced') ? 'reduce' : 'no-preference',
  });
  const page = await ctx.newPage();
  const consoleErrors = [], pageErrors = [], failed = [], warns = [];
  page.on('console', m => { const t = m.type(); if (t === 'error') consoleErrors.push(m.text().slice(0, 400)); else if (t === 'warning') warns.push(m.text().slice(0, 200)); });
  page.on('pageerror', e => pageErrors.push(String(e).slice(0, 500)));
  page.on('requestfailed', r => failed.push(r.url().slice(0, 200) + ' :: ' + (r.failure()?.errorText || '')));
  page.on('response', r => { if (r.status() >= 400) failed.push('HTTP ' + r.status() + ' ' + r.url().slice(0, 200)); });

  const shots = [], logs = [];
  let n = 0;
  const shot = async (name, sel) => {
    const file = path.join(outDir, String(++n).padStart(2, '0') + '-' + String(name).replace(/[^\w.-]+/g, '_') + '.png');
    try {
      if (sel) await page.locator(sel).first().screenshot({ path: file });
      else await page.screenshot({ path: file, fullPage: !!has('fullpage') });
      shots.push(file);
    } catch (e) { logs.push('SHOT FAILED ' + name + ': ' + e.message); }
    return file;
  };
  const log = (...a) => logs.push(a.map(x => typeof x === 'string' ? x : JSON.stringify(x)).join(' '));

  let err = null;
  const t0 = Date.now();
  try {
    await page.goto(url, { waitUntil: 'load', timeout: 45000 });
    if (scenarioPath) {
      const fn = require(path.resolve(scenarioPath));
      await fn({ page, shot, log, url, outDir, ctx, browser });
    } else {
      await page.waitForTimeout(2500); await shot('default');
    }
  } catch (e) { err = e.stack || String(e); }
  const ms = Date.now() - t0;

  await browser.close();
  const out = [];
  out.push('=== INSPECTION REPORT ===');
  out.push('url: ' + url + '   viewport: ' + width + 'x' + height + (has('mobile') ? ' (mobile)' : '') + '   elapsed: ' + ms + 'ms');
  out.push('outDir: ' + outDir);
  if (err) out.push('\n!! SCENARIO ERROR:\n' + err);
  out.push('\n-- screenshots (' + shots.length + ') --'); shots.forEach(s => out.push(s));
  out.push('\n-- log (' + logs.length + ') --'); logs.forEach(l => out.push(l));
  out.push('\n-- console errors (' + consoleErrors.length + ') --'); [...new Set(consoleErrors)].slice(0, 40).forEach(l => out.push(l));
  out.push('\n-- uncaught page errors (' + pageErrors.length + ') --'); [...new Set(pageErrors)].slice(0, 20).forEach(l => out.push(l));
  out.push('\n-- failed requests (' + failed.length + ') --'); [...new Set(failed)].slice(0, 30).forEach(l => out.push(l));
  const report = out.join('\n');
  console.log(report);
  /* THE SCENARIO'S OWN VERDICT, read off its log. See the header. */
  const said = !has('allow-fail') && logs.some((l) => FAIL_LINE.test('\n' + l));
  if (said && !err) {
    const which = logs.filter((l) => FAIL_LINE.test('\n' + l)).slice(0, 6);
    console.log('\n!! THE SCENARIO REPORTED FAILURES AND DID NOT THROW — exiting non-zero anyway:');
    which.forEach((l) => console.log('   ' + String(l).trim().slice(0, 200)));
  }
  process.exit(err || pageErrors.length || said ? 1 : 0);
})();
