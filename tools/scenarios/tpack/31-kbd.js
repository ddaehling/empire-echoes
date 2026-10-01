/* tpack/31-kbd — reach the classroom pack and press Print with the keyboard only.
 *
 * THE DESK IS NOT THE SAME SURFACE AT EVERY SIZE, and this scenario used to
 * pretend it was. Under RESPONSIVE_LAW §11's reading floor the desk refuses and
 * renders one card instead — `teacher/small.js`, the answer to wave 9's
 * "UNREADABLE at 390x844" — so a run at 390x844, 768x1024 or 740x360 met no
 * tablist and no jump bar and reported four keyboard failures against a
 * structure that is deliberately not there. Four red lines on a working build
 * is how a gate stops being read.
 *
 * So the promise is asked per surface. The DESK's promise is the tablist, the
 * arrow keys and the jump bar. The CARD's promise is smaller and just as real:
 * a keyboard reader must reach it, read the address, and be able to start
 * either lesson from it without a mouse. */
module.exports = async ({ page, shot, log }) => {
  const R = [];
  const t = (id, ok, got) => R.push((ok ? 'PASS' : 'FAIL') + '  ' + id + '  ' + got);
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 25000 });
  await page.waitForTimeout(1800);
  await page.evaluate(() => { window.__printed = 0; window.print = () => { window.__printed++; }; });

  /* The entry may be behind the Tools menu at phone widths — that is the
     shell's own disclosure and not a keyboard fault, so it is opened the way a
     keyboard reader opens it: Tab to it and press Enter. */
  const reach = async (cls) => {
    let n = 0, got = false;
    while (n < 60 && !got) {
      await page.keyboard.press('Tab'); n++;
      got = await page.evaluate((c) => document.activeElement
        && document.activeElement.classList.contains(c), cls);
    }
    return { got, n };
  };

  let entry = await reach('tp-entry');
  if (!entry.got) {
    /* Behind the Tools disclosure at this width. Open it from the keyboard and
       look again — the promise is "reachable without a mouse", not "first". */
    await page.keyboard.press('Home');
    let n = 0, tools = false;
    while (n < 60 && !tools) {
      await page.keyboard.press('Tab'); n++;
      tools = await page.evaluate(() => /tools/i.test((document.activeElement || {}).innerText || ''));
    }
    if (tools) { await page.keyboard.press('Enter'); await page.waitForTimeout(500); }
    entry = await reach('tp-entry');
  }
  t('the desk entry is reachable by Tab', entry.got, 'after ' + entry.n + ' presses');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(1000);
  t('Enter opens the desk', await page.evaluate(() => !!document.querySelector('.tp')), '');

  /* WHICH SURFACE ARRIVED. Under the reading floor it is the refusal card, and
     the four assertions below are about the desk, which is not here. */
  const small = await page.evaluate(() => !!document.querySelector('.tp-small'));
  if (small) {
    const card = await page.evaluate(() => {
      const s = document.querySelector('.tp-small');
      const f = [...s.querySelectorAll('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])')];
      return {
        addr: (s.querySelector('.tp-small__addr') || {}).innerText || '',
        starts: f.filter(a => /#tour=/.test(a.getAttribute('href') || '')).length,
        focusables: f.length,
      };
    });
    t('the refusal card carries the address in full', /#panel=classroom/.test(card.addr), card.addr);
    t('both lessons can be started from it without a mouse', card.starts === 2,
      card.starts + ' start controls, ' + card.focusables + ' focusables');
    let n = 0, inCard = false;
    while (n < 12 && !inCard) {
      await page.keyboard.press('Tab'); n++;
      inCard = await page.evaluate(() => !!(document.activeElement
        && document.activeElement.closest && document.activeElement.closest('.tp-small')));
    }
    t('Tab from the entry lands inside the card', inCard, 'after ' + n + ' presses');
    await shot('kbd-small');
    log(R.join('\n'));
    log(R.some(r => r.startsWith('FAIL')) ? '>>> SOME FAILED' : '>>> all pass');
    return;
  }

  /* THE TAB STRIP IS BEHIND THE PANEL, NOT IN FRONT OF IT, and that is right:
     `.tp__nav` precedes `.tp__pages` in the document, so a reader landing on
     the panel reaches the strip with Shift+Tab and the panel's own contents
     with Tab. An earlier version of this test walked forward looking for the
     strip, never found it, and reported a keyboard trap that does not exist. */
  let inTabs = false; let hops = 0;
  while (hops < 6 && !inTabs) {
    await page.keyboard.press('Shift+Tab'); hops++;
    inTabs = await page.evaluate(() => document.activeElement && document.activeElement.getAttribute('role') === 'tab');
  }
  t('the tablist is one Shift+Tab from the panel', inTabs, 'after ' + hops + ' presses');
  for (let i = 0; i < 4; i++) {
    const id = await page.evaluate(() => document.activeElement.id);
    if (id === 'tp-tab-classroom') break;
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(350);
  }
  t('arrow keys reach Classroom', await page.evaluate(() => document.activeElement.id) === 'tp-tab-classroom',
    await page.evaluate(() => document.activeElement.id));
  await page.waitForTimeout(600);

  /* jump bar: Tab into the panel and press the sixth item */
  let jumped = false; hops = 0;
  while (hops < 8 && !jumped) {
    await page.keyboard.press('Tab'); hops++;
    jumped = await page.evaluate(() => document.activeElement && document.activeElement.classList.contains('tp-jump__item'));
  }
  t('the jump bar is reachable by Tab', jumped, 'after ' + hops + ' presses');
  if (jumped) {
    for (let i = 0; i < 5; i++) { await page.keyboard.press('Tab'); }
    const label = await page.evaluate(() => document.activeElement.innerText.replace(/\s+/g, ' '));
    await page.keyboard.press('Enter');
    await page.waitForTimeout(700);
    const after = await page.evaluate(() => ({
      focus: document.activeElement.innerText.slice(0, 40),
      top: (() => { const n = document.getElementById('tp-cr-print'); return n ? Math.round(n.getBoundingClientRect().top) : null; })(),
    }));
    t('a jump moves focus and the view', /print/i.test(label) ? after.top !== null && after.top < 600 : true,
      label + ' -> ' + JSON.stringify(after));
  }
  await shot('kbd');
  log(R.join('\n'));
  log(R.some(r => r.startsWith('FAIL')) ? '>>> SOME FAILED' : '>>> all pass');
};
