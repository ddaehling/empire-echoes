/* pk/45-matrix — the desk at whatever size, mode and motion the harness gives
   it: either the whole desk over the reading floor, or the refusal card with
   advice that is true of THIS window. Nothing in between. */
const { Checks } = require('../lib/routes.js');
module.exports = async ({ page, log, shot }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 25000 });
  await page.waitForTimeout(1500);
  const narrow = await page.evaluate(() => window.innerWidth < 992);
  if (narrow) {
    await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find(x => /Tools/.test(x.innerText)); if (b) b.click(); });
    await page.waitForTimeout(500);
  }
  await page.evaluate(() => {
    const e = document.querySelector('.tp-entry');
    if (e) e.click(); else location.hash = '#panel=classroom';
  });
  await page.waitForTimeout(1400);
  const C = Checks(log);
  const d = await page.evaluate(() => {
    const body = document.querySelector('.cx-sheet__body');
    const small = document.querySelector('.tp-small');
    return {
      w: innerWidth, h: innerHeight,
      read: body ? body.clientHeight : null,
      holds: body ? body.scrollHeight : null,
      small: !!small,
      lead: small ? (small.querySelector('.tp-small__lead') || {}).innerText || '' : '',
      why: small ? (small.querySelector('.tp-small__why') || {}).innerText || '' : '',
      addr: small ? (small.querySelector('.tp-small__addr') || {}).innerText || '' : '',
      lessons: small ? [...small.querySelectorAll('.tp-small__lesson')].map(x => x.innerText.replace(/\s+/g, ' ')) : [],
      sideways: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  log(JSON.stringify({ win: d.w + 'x' + d.h, read: d.read, holds: d.holds, small: d.small }));
  await shot('desk');

  C.t('S1 the desk is either readable or refused, never squeezed',
    d.read == null || (d.small ? d.read < 400 : d.read >= 400),
    (d.small ? 'refusal card at ' : 'the desk at ') + d.read + 'px', 'refused under 400, shown at or over it');
  C.t('S2 the page does not scroll sideways', !d.sideways, String(d.sideways), 'false');

  if (d.small) {
    /* THE ONE CLAUSE THE PHONE CRITIC CAUGHT. A rotation swaps the edges, so a
       window turned on its side is at most as tall as it is now WIDE. */
    const helps = d.w < d.h && d.w >= 400;
    C.t('S3 it advises turning the device only when turning it would work',
      /turn this device on its side/i.test(d.lead) === helps,
      helps ? 'advised, and the window is ' + d.w + ' wide' : 'not advised: ' + d.lead.slice(0, 80),
      helps ? 'advise it' : 'do not advise it');
    C.t('S4 it says what it is refusing and how much room it has',
      /\d+ pixels of reading height/.test(d.why), d.why.slice(0, 70), 'the measured number');
    C.t('S5 it carries the address in full', /#panel=classroom/.test(d.addr), d.addr, '#panel=classroom');
    C.t('S6 it names both lessons of the unit and what each covers',
      d.lessons.length === 2 && d.lessons.every(x => /It covers /.test(x)),
      d.lessons.length + ' lessons', '2, each with its coverage');
    C.t('S7 it offers a control that starts one',
      await page.evaluate(() => [...document.querySelectorAll('.tp-small a.cx-more')]
        .filter(a => /#tour=/.test(a.getAttribute('href') || '')).length) === 2,
      'start controls', '2');
    if (!helps && d.w >= d.h) {
      C.t('S8 it does not tell an already-landscape window to turn landscape',
        !/turn this device landscape/i.test(d.why + d.lead), d.lead.slice(0, 60), 'no such clause');
    }
  } else {
    C.t('S9 the desk carries both lessons’ packs',
      await page.evaluate(async () => {
        const t = [...document.querySelectorAll('[role="tab"]')].find(x => /Classroom/i.test(x.textContent));
        if (t) t.click();
        await new Promise(r => setTimeout(r, 900));
        return [...document.querySelectorAll('.tp-unit__b')].length;
      }) === 2, 'lesson controls', '2');
    await page.waitForTimeout(300);
    C.t('S10 no pack card prints its lesson name twice',
      await page.evaluate(() => [...document.querySelectorAll('.tp-packs__t')]
        .every(n => (n.innerText.match(/Lesson (One|Two)/g) || []).length <= 1)),
      'checked every card', 'at most one');
    await shot('classroom');
  }
  C.finish('pk/45 the desk at this size');
};
