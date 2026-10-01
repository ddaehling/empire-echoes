/* pk/44-paper — every lesson sheet as real A4, page-counted and screenshotted,
   with the three agreements a teacher's folder depends on asserted:
   the plan's step links, the task sheet's own numbers and screen anchors, and
   the key's headings must all name the same tasks at the same stops. */
const fs = require('fs');
const { Checks } = require('../lib/routes.js');
module.exports = async ({ page, log, shot }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.tourStepIndex,
    null, { timeout: 30000 });
  await page.waitForTimeout(1600);
  await page.evaluate(() => { window.print = () => {}; });
  await page.getByRole('button', { name: /Teaching desk|Move \d/i }).click();
  await page.waitForTimeout(800);
  await page.getByRole('tab', { name: /Classroom/i }).click();
  await page.waitForTimeout(1400);

  const dir = process.env.OUTDIR || '/tmp/pk44';
  fs.mkdirSync(dir, { recursive: true });
  const C = Checks(log);
  const ids = ['plan', 'tasks-core', 'tasks-supported', 'tasks-extension', 'key', 'board', 'lesson'];

  for (const n of [1, 2]) {
    const ok = await page.evaluate((k) => {
      const b = [...document.querySelectorAll('.tp-unit__b')][k - 1];
      if (!b) return false; b.click(); return true;
    }, n);
    C.t('L' + n + ' the desk offers this lesson', ok, String(ok), 'true');
    if (!ok) continue;
    await page.waitForTimeout(900);
    const text = {};
    for (const id of ids) {
      const pid = id + '@' + n;
      const hit = await page.evaluate((p) => {
        const e = [...document.querySelectorAll('[data-pack]')].find(x => x.dataset.pack === p);
        if (!e) return false;
        (e.tagName === 'BUTTON' ? e : e.querySelector('button')).click();
        return true;
      }, pid);
      C.t('L' + n + ' ' + id + ' has a print control', hit, String(hit), 'true');
      if (!hit) continue;
      await page.waitForTimeout(400);
      text[id] = await page.evaluate(() => {
        const p2 = document.querySelector('.tp-paper');
        return {
          text: p2.innerText,
          /* STRUCTURED, NOT SCRAPED. `innerText` runs inline spans together —
             the key's segment heading reads "8 minTask 1 · …" — so every
             agreement below is read off the element that carries it. */
          segHeads: [...p2.querySelectorAll('.tp-paper__segd')].map(x => x.innerText.trim()),
          writes: [...p2.querySelectorAll('.tp-paper__write')].map(x => x.innerText.trim()),
          taskNos: [...p2.querySelectorAll('.tp-paper__taskno')].map(x => x.innerText.trim()),
          anchors: [...p2.querySelectorAll('.tp-paper__task')].map(x => {
            const c = x.querySelector('.tp-paper__taskstep');
            const n = x.querySelector('.tp-paper__taskno');
            return { task: (n ? n.innerText : '').trim(), chip: c ? c.innerText.trim() : null };
          }),
        };
      });
      const file = dir + '/L' + n + '-' + id + '.pdf';
      await page.pdf({ path: file, printBackground: true, preferCSSPageSize: true });
      const buf = fs.readFileSync(file);
      const pages = (buf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
      log('  L' + n + ' ' + id.padEnd(17) + pages + ' A4 side' + (pages === 1 ? '' : 's')
        + '   ' + text[id].text.length + ' chars');
      await shot('L' + n + '-' + id);
      /* WHAT A DEPARTMENTAL PHOTOCOPIER GETS USED FOR, measured on this build
         and set one side above it, so a sheet that grows a side goes red before
         a teacher finds out at the copier. Not a rule from anywhere: a ceiling
         against silent growth. */
      const cap = { plan: 6, key: 9, board: 2, lesson: 2 }[id] || 4;
      C.t('L' + n + ' ' + id + ' fits its paper', pages >= 1 && pages <= cap,
        pages + ' sides', '1-' + cap);
    }

    /* THE THREE AGREEMENTS a teacher's folder depends on: the plan, the three
       task sheets and the key must name the same tasks at the same stops. */
    const nums = (list) => [...new Set(list.join(' ').match(/\d+/g) || [])].map(Number).sort((a, b) => a - b);
    const sheetNums = nums((text['tasks-core'] || { taskNos: [] }).taskNos);
    const planNums = nums((text.plan || { writes: [] }).writes
      .map(w => (w.match(/Tasks? \d+(?:(?:,| and) \d+)*/g) || []).join(' ')));
    /* The heading is "Tasks 2 and 3 · Four engines, and the first one": the
       numbers are everything before the middot, and "and" sits between them. */
    const keyNums = nums((text.key || { segHeads: [] }).segHeads
      .map(h => (/^Tasks? /.test(h) ? h.split('\u00b7')[0] : '')));

    C.t('L' + n + ' the plan names only tasks the sheets carry',
      planNums.length > 0 && planNums.every(x => sheetNums.includes(x)),
      'plan ' + planNums.join(','), 'sheet ' + sheetNums.join(','));
    C.t('L' + n + ' the key heads only tasks the sheets carry',
      keyNums.length > 0 && keyNums.every(x => sheetNums.includes(x)),
      'key ' + keyNums.join(','), 'sheet ' + sheetNums.join(','));
    C.t('L' + n + ' the key heads every task the sheets carry',
      sheetNums.every(x => keyNums.includes(x)),
      'key ' + keyNums.join(','), 'sheet ' + sheetNums.join(','));

    /* THE SCREEN ANCHOR. The charge: "Task 3 prints screen: 2/9 for a beat the
       plan lists at step 3, and shares that anchor with Task 2." */
    for (const tier of ['tasks-core', 'tasks-supported', 'tasks-extension']) {
      const a = (text[tier] || { anchors: [] }).anchors;
      const chips = a.filter(x => x.chip).map(x => x.chip);
      const got = chips.map(c => (c.match(/screen: (\d+) \/ (\d+)/) || []).slice(1).map(Number));
      C.t('L' + n + ' ' + tier + ': every screen anchor is inside the route',
        got.length > 0 && got.every(([i2, of2]) => i2 >= 1 && i2 <= of2),
        JSON.stringify(chips), 'all 1..of');
      C.t('L' + n + ' ' + tier + ': no two tasks share one screen anchor',
        new Set(got.map(x => x[0])).size === got.length,
        JSON.stringify(got.map(x => x[0])), 'all different');
    }

    /* AND THE PLAN MUST NOT CONTRADICT ITS OWN STEP LIST. A segment that lists
       a beat at a numbered step and then says the lesson does not run it is the
       defect round two reported, and it is checkable on the page. */
    const contra = await page.evaluate(() => {
      const out = [];
      for (const seg of document.querySelectorAll('.tp-paper__seg')) {
        const on = [...seg.querySelectorAll('.tp-paper__beat')]
          .filter(li => li.querySelector('.tp-paper__beatn')
            && !li.querySelector('.tp-paper__beato'))
          .map(li => (li.querySelector('.tp-paper__beath') || {}).innerText || '');
        const w = seg.querySelector('.tp-paper__warn');
        const said = w ? w.innerText : '';
        for (const h of on) if (h && said.includes(h)) out.push(h);
      }
      return out;
    });
    C.t('L' + n + ' no segment says the lesson skips a beat it has numbered',
      contra.length === 0, JSON.stringify(contra), 'none');
  }
  C.finish('pk/44 the printed pack');
};
