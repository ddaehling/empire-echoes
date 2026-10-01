/**
 * p21/w6-close.js — the Close, read end to end, and the things round 2 named:
 * "after 0 minutes", the dead keyboard instructions in the doors, the off-map
 * cases that were offered nowhere, and the writing field under the keyboard.
 */
module.exports = async ({ page, shot, log }) => {
  const R = [];
  const t = (id, ok, got, want) => R.push((ok ? 'PASS' : 'FAIL') + '  ' + id + '  got ' + got + '  (' + want + ')');

  await page.goto('http://localhost:8777/app/#tour=thirty&step=9', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1800);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(150);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1200);

  const m = await page.evaluate(() => {
    const n = document.querySelector('.cl-close');
    const txt = n ? n.innerText.replace(/\s+/g, ' ') : '';
    const sc = document.querySelector('.app__sheet .cx-sheet__body') || document.querySelector('.sheet__body');
    return {
      open: !!n,
      chars: txt.length,
      stand: (document.querySelector('.cl-close__stand') || {}).innerText || '',
      zero: /after 0 minutes/.test(txt),
      pressKeys: /Press 4|Press H/.test(txt),
      congo: /Congo/.test(txt), lumumba: /Lumumba/.test(txt), offmap: /off this map/i.test(txt),
      algeria: /Algeria/.test(txt), lusophone: /Angola/.test(txt),
      doorGo: [...document.querySelectorAll('.cl-door__go')].map((b) => b.textContent),
      offGo: [...document.querySelectorAll('.cl-offmap__go')].map((b) => b.textContent),
      scH: sc ? Math.round(sc.clientHeight) : 0, scAll: sc ? Math.round(sc.scrollHeight) : 0,
      signAt: (() => { const f = document.querySelector('.cl-sign'); if (!f || !sc) return null; return Math.round(f.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop); })(),
    };
  });
  log('close: ' + JSON.stringify(m));
  t('C1 no "after 0 minutes"', !m.zero, m.stand.slice(0, 90), 'a said duration');
  t('C2 no dead key instruction', !m.pressKeys, m.pressKeys ? 'Press 4 / Press H still printed' : 'none', 'none');
  t('C3 the Congo is offered', m.congo && m.offGo.length >= 1, 'congo=' + m.congo + ' controls=' + m.offGo.length, 'named, with a control');
  t('C4 all three off-map cases', m.congo && m.algeria && m.lusophone, 'congo/algeria/angola = ' + [m.congo, m.algeria, m.lusophone].join(','), 'all three');
  t('C5 the doors have controls', m.doorGo.length >= 2, m.doorGo.join(' | '), 'two');
  await shot('close-top');

  /* read the whole panel, screen by screen */
  const shots = Math.min(9, Math.ceil(m.scAll / Math.max(120, m.scH)));
  for (let i = 1; i <= shots; i += 1) {
    await page.evaluate((k) => {
      const sc = document.querySelector('.app__sheet .cx-sheet__body') || document.querySelector('.sheet__body');
      if (sc) sc.scrollTop = k * (sc.clientHeight - 24);
    }, i);
    await page.waitForTimeout(220);
    await shot('close-' + i);
  }

  /* the writing surface */
  await page.evaluate(() => { const f = document.querySelector('.cl-sign__field'); if (f) f.scrollIntoView({ block: 'center' }); });
  await page.waitForTimeout(200);
  await page.evaluate(() => { const f = document.querySelector('.cl-sign__field'); if (f) f.focus(); });
  await page.waitForTimeout(350);
  /* SIMULATE THE KEYBOARD. Playwright cannot shrink the visual viewport, so the
     harness sets the one number the browser would have set — 336px, an iPhone
     14 keyboard on a 844px window — and then asks whether the field is still
     on screen above it, which is the whole question. */
  await page.evaluate(() => {
    const b = document.querySelector('.cl-sign');
    if (b) { b.style.setProperty('--cl-vv-bottom', '336px'); b.style.setProperty('--cl-vv-h', '508px'); }
  });
  await page.waitForTimeout(200);
  const c = await page.evaluate(() => {
    const box = document.querySelector('.cl-sign');
    const f = document.querySelector('.cl-sign__field');
    if (!box || !f) return null;
    const r = f.getBoundingClientRect();
    const b = box.getBoundingClientRect();
    const top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
    return {
      compose: box.dataset.compose || '', mode: document.documentElement.dataset.p05compose || '',
      field: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)],
      box: [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)],
      reach: !!top && (f === top || f.contains(top)),
      done: !!document.querySelector('.cl-sign__ok') && getComputedStyle(document.querySelector('.cl-sign__ok')).display !== 'none',
      vh: innerHeight, vw: innerWidth,
      /* does the writing surface stand on the plate? */
      onMap: (() => {
        /* the DRAWN map, clipped by its own plate: `.stage__map` has
           overflow hidden and the canvas inside it is a few pixels taller. */
        const clip = document.querySelector('.stage__map');
        const m = (clip && clip.querySelector('canvas')) || clip;
        if (!m || !clip) return 0;
        const cr = clip.getBoundingClientRect();
        const raw = m.getBoundingClientRect();
        const mr = { left: Math.max(raw.left, cr.left), right: Math.min(raw.right, cr.right),
          top: Math.max(raw.top, cr.top), bottom: Math.min(raw.bottom, cr.bottom) };
        const ox = Math.max(0, Math.min(b.right, mr.right) - Math.max(b.left, mr.left));
        const oy = Math.max(0, Math.min(b.bottom, mr.bottom) - Math.max(b.top, mr.top));
        return Math.round(ox * oy);
      })(),
      keyboardTop: 508,
    };
  });
  log('compose: ' + JSON.stringify(c));
  await page.evaluate(() => { const f = document.querySelector('.cl-sign__field'); if (f) f.value = 'It started as sugar islands worked by enslaved people, became a company that ruled India on Indian money, and came apart when the people it ruled organised.'; });
  await shot('compose');
  const narrow = c && c.vw <= 736;
  t('C6 the field clears the keyboard', !!c && (narrow ? (c.compose === 'on' && c.field[1] + c.field[3] <= c.keyboardTop) : c.compose !== 'on'),
    c ? ('compose=' + c.compose + ' field ' + c.field[1] + '..' + (c.field[1] + c.field[3]) + ' of ' + c.vh) : 'no field',
    narrow ? 'entirely above y=508' : 'not composed');
  if (narrow) t('C6b the writing surface leaves the plate alone', !!c && c.onMap === 0, c ? c.onMap + 'px2' : '-', '0');
  t('C7 the field is the topmost thing at its own centre', !!c && c.reach, c ? String(c.reach) : '-', 'true');

  /* leaving compose puts it back */
  await page.evaluate(() => { const b = document.querySelector('.cl-sign__ok'); if (b) b.click(); });
  await page.waitForTimeout(250);
  const back = await page.evaluate(() => ({
    compose: (document.querySelector('.cl-sign') || {}).dataset ? document.querySelector('.cl-sign').dataset.compose : 'gone',
    root: document.documentElement.dataset.p05compose || '',
  }));
  t('C8 Done leaves compose', back.compose !== 'on' && !back.root, JSON.stringify(back), 'off');
  await shot('after-done');

  /* the draft survives a trip out of the Close and back */
  await page.evaluate(() => { const b = document.querySelector('.cl-offmap__go'); if (b) b.click(); });
  await page.waitForTimeout(1500);
  const gone = await page.evaluate(() => ({
    close: !!document.querySelector('.cl-close'),
    beat: (document.querySelector('.tr-panel__title') || document.querySelector('.cx-sheet__title') || {}).textContent || '',
    path: document.getElementById('app').dataset.path,
  }));
  log('after the congo offer: ' + JSON.stringify(gone));
  await shot('congo');
  t('C9 the Congo offer lands on the Congo', /congo/i.test(gone.beat), gone.beat.slice(0, 60), 'the Congo beat');

  await page.keyboard.press('Escape');
  await page.waitForTimeout(150);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(900);
  const draft = await page.evaluate(() => (document.querySelector('.cl-sign__field') || {}).value || '');
  t('C10 the draft comes back', /sugar islands/.test(draft), draft.slice(0, 50) || 'empty', 'the sentence they were writing');
  await shot('back');

  /* the doors do what they say */
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('.cl-door__go')].find((x) => /Widen/.test(x.textContent));
    if (b) b.click();
  });
  await page.waitForTimeout(900);
  const def = await page.evaluate(() => ({
    hash: location.hash,
    readout: (document.querySelector('.tl-readout') || document.body).innerText.slice(0, 160),
    body: document.body.innerText.slice(0, 4000),
  }));
  log('definition door -> ' + def.hash);
  t('C11 the informal door widens the map', /def[:=]influenced/.test(def.hash),
    def.hash + ' | ' + def.readout.replace(/\s+/g, ' ').slice(0, 60), 'definition = influenced');
  await shot('door-definition');

  await page.keyboard.press('Escape');
  await page.waitForTimeout(120);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(900);
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('.cl-door__go')].find((x) => /cannot tell/.test(x.textContent));
    if (b) b.click();
  });
  await page.waitForTimeout(1200);
  const sil = await page.evaluate(() => {
    const sheet = document.querySelector('.app__sheet');
    return { text: sheet ? sheet.innerText.replace(/\s+/g, ' ').slice(0, 220) : '', close: !!document.querySelector('.cl-close') };
  });
  log('archive door -> ' + JSON.stringify(sil));
  t('C12 the archive door opens the silences', !sil.close && sil.text.length > 40, sil.text.slice(0, 80), 'a surface about what was destroyed');
  await shot('door-silences');

  R.forEach((l) => log(l));
  log(R.some((l) => l.startsWith('FAIL')) ? '>>> CLOSE BROKEN' : '>>> the Close holds');
};
