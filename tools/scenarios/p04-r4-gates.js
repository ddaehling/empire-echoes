/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'click').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });
  const path = require('path'); const out = process.env.INSPECT_OUT || '/tmp';
  await page.goto('http://localhost:8777/app/#year=1857&sel=british-india', { waitUntil: 'load' });
  await page.waitForTimeout(1600);
  const clip = await page.evaluate(() => {
    const r = document.querySelector('.app__dossier').getBoundingClientRect();
    return { x: Math.floor(r.x), y: Math.floor(r.y), width: Math.ceil(r.width), height: Math.ceil(r.height) };
  });
  const goTo = async (sel, off = -70) => {
    const ok = await page.evaluate(([s, o]) => {
      const h = document.querySelector('.app__dossier'); const n = document.querySelector(s);
      if (!n) return false;
      h.scrollTop = n.getBoundingClientRect().top - h.getBoundingClientRect().top + h.scrollTop + o;
      return true;
    }, [sel, off]);
    await page.waitForTimeout(300); return ok;
  };
  log('purpose gate found: ' + await goTo('[data-ask="purpose"]'));
  await page.screenshot({ path: path.join(out, 'gate-open.png'), clip });
  await page.evaluate(() => document.querySelector('[data-ask="purpose"] .dsr__choice[data-ok="no"]').click());
  await page.waitForTimeout(500);
  await goTo('[data-ask="purpose"]');
  await page.screenshot({ path: path.join(out, 'gate-answered.png'), clip });
  log('gate state: ' + await page.evaluate(() => { const b = document.querySelector('[data-ask="purpose"]'); return b ? b.dataset.state + ' :: ' + b.innerText.replace(/\s+/g,' ').slice(0,220) : 'gone'; }));

  log('brief step found: ' + await goTo('.dsr__record[data-short="yes"]'));
  await page.screenshot({ path: path.join(out, 'brief.png'), clip });
  const beforeH = await page.evaluate(() => document.querySelector('.app__dossier').scrollHeight);
  await page.evaluate(() => document.querySelector('.dsr__record[data-short="yes"] [data-act="expand"]').click());
  await page.waitForTimeout(500);
  const afterH = await page.evaluate(() => document.querySelector('.app__dossier').scrollHeight);
  log('expand grew scrollHeight ' + beforeH + ' -> ' + afterH);
  await page.screenshot({ path: path.join(out, 'expanded.png'), clip });

  await goTo('#dsr-think', -60);
  await page.screenshot({ path: path.join(out, 'think.png'), clip });
  log('ERRORS ' + JSON.stringify(errs));
};
