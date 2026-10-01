/** p21/w6-print.js — the revision sheet, in print media. */
module.exports = async ({ page, shot, log }) => {
  const R = [];
  const t = (id, ok, got, want) => R.push((ok ? 'PASS' : 'FAIL') + '  ' + id + '  got ' + got + '  (' + want + ')');
  await page.goto('http://localhost:8777/app/#tour=thirty&step=9', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1600);
  await page.keyboard.press('Escape'); await page.waitForTimeout(140);
  await page.keyboard.press('Escape'); await page.waitForTimeout(1100);
  await page.evaluate(() => {
    const f = document.querySelector('.cl-sign__field');
    const n = document.querySelector('.cl-sign__name');
    if (f) { f.value = 'Britain’s empire started as sugar islands worked by enslaved Africans, became a company that ruled India on Indian revenue, and came apart when the people it ruled organised and Britain went broke.'; f.dispatchEvent(new Event('input', { bubbles: true })); }
    if (n) { n.value = 'A. Student'; n.dispatchEvent(new Event('input', { bubbles: true })); }
    const b = [...document.querySelectorAll('.cl-sign button')].find((x) => /Sign it/.test(x.textContent));
    if (b) b.click();
  });
  await page.waitForTimeout(300);
  const onScreen = await page.evaluate(() => {
    const b = [...document.querySelectorAll('.cl-actions button')].find((x) => /Print/.test(x.textContent));
    if (b) b.click();
    const p = document.querySelector('.tr-print');
    const r = p.getBoundingClientRect();
    return { armed: document.documentElement.dataset.p05print, drawn: r.width > 2 && r.height > 2, disp: getComputedStyle(p).display };
  });
  log('screen: ' + JSON.stringify(onScreen));
  t('P1 armed', onScreen.armed === 'on', onScreen.armed, 'on');
  t('P2 not drawn on screen', !onScreen.drawn && onScreen.disp === 'none', onScreen.disp, 'display none');
  await shot('screen-after-print');

  await page.emulateMedia({ media: 'print' });
  await page.waitForTimeout(400);
  const inPrint = await page.evaluate(() => {
    const p = document.querySelector('.tr-print');
    const app = document.getElementById('app');
    const r = p.getBoundingClientRect();
    return {
      sheet: getComputedStyle(p).display, app: getComputedStyle(app).display,
      h: Math.round(r.height), w: Math.round(r.width),
      h1: getComputedStyle(p.querySelector('h1')).fontSize,
      sections: p.querySelectorAll('section').length,
      text: p.innerText.replace(/\s+/g, ' ').slice(0, 160),
    };
  });
  log('print: ' + JSON.stringify(inPrint));
  t('P3 the sheet prints and the app does not', inPrint.sheet !== 'none' && inPrint.app === 'none',
    'sheet=' + inPrint.sheet + ' app=' + inPrint.app, 'block / none');
  t('P4 the signed sentence heads it', /sugar islands/.test(inPrint.text), inPrint.text.slice(0, 70), 'their sentence');
  await shot('print-page');
  /* THE REAL QUESTION IS HOW MANY SHEETS OF A4 IT IS. */
  try {
    const out = require('path').join(process.env.P21_OUT || '/tmp', 'revision-sheet.pdf');
    /* No margin option and `preferCSSPageSize`, so what is measured is the
       stylesheet's own `@page` — including the wide left margin for pencil. */
    await page.pdf({ path: out, format: 'A4', printBackground: true, preferCSSPageSize: true });
    const buf = require('fs').readFileSync(out);
    const pages = (buf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
    log('pdf: ' + out + '  pages=' + pages + '  bytes=' + buf.length);
    t('P5 it is one page of A4', pages === 1, pages + ' pages', '1');
  } catch (e) { log('pdf failed: ' + e.message); }
  await page.emulateMedia({ media: 'screen' });
  R.forEach((l) => log(l));
  log(R.some((l) => l.startsWith('FAIL')) ? '>>> SHEET BROKEN' : '>>> the sheet holds');
};
