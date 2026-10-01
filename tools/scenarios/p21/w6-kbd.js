/** p21/w6-kbd.js — the Close from a keyboard only. */
module.exports = async ({ page, shot, log }) => {
  const R = [];
  const t = (id, ok, got, want) => R.push((ok ? 'PASS' : 'FAIL') + '  ' + id + '  got ' + got + '  (' + want + ')');
  await page.goto('http://localhost:8777/app/#tour=thirty&step=9', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(1600);
  await page.keyboard.press('Escape'); await page.waitForTimeout(140);
  await page.keyboard.press('Escape'); await page.waitForTimeout(1100);

  /* Stable identity for the walk: the scroller moves under focus, so a
     rectangle is not an identity and two controls with the same label are not
     the same control. */
  await page.evaluate(() => {
    document.querySelectorAll('.cl-close button, .cl-close input, .cl-close textarea, .cl-close [tabindex]')
      .forEach((n, i) => { n.dataset.kbd = String(i); });
  });
  const seen = [];
  for (let i = 0; i < 90; i += 1) {
    await page.keyboard.press('Tab');
    await page.waitForTimeout(25);
    const cur = await page.evaluate(() => {
      const a = document.activeElement;
      if (!a || a === document.body) return null;
      const r = a.getBoundingClientRect();
      const cs = getComputedStyle(a);
      const mid = document.elementFromPoint(Math.round(r.x + r.width / 2), Math.round(r.y + r.height / 2));
      return {
        id: a.dataset ? (a.dataset.kbd || '') : '',
        cls: (a.className || '').toString().slice(0, 44), tag: a.tagName,
        text: (a.innerText || a.value || a.getAttribute('aria-label') || '').replace(/\s+/g, ' ').slice(0, 44),
        inClose: !!a.closest('.cl-close'),
        onScreen: r.top >= -1 && r.bottom <= innerHeight + 1 && r.width > 0,
        topmost: !!mid && (a === mid || a.contains(mid) || mid.contains(a)),
        ring: cs.outlineStyle !== 'none' || cs.boxShadow !== 'none',
        w: Math.round(r.width), h: Math.round(r.height), y: Math.round(r.y),
      };
    });
    if (cur) seen.push(cur);
  }
  const mine = seen.filter((s) => s.inClose);
  const uniq = [];
  for (const m of mine) if (!uniq.some((u) => u.id === m.id)) uniq.push(m);
  uniq.forEach((m) => log('  tab: ' + m.tag + '.' + m.cls + ' "' + m.text + '" ' + m.w + 'x' + m.h
    + (m.onScreen ? '' : ' OFFSCREEN') + (m.topmost ? '' : ' COVERED')));
  const has = (c) => uniq.some((m) => m.cls.includes(c));
  t('K1 the greyed lines route out', has('cl-line__go'), String(has('cl-line__go')), 'reachable');
  t('K2 the off-map offers are reachable', uniq.filter((m) => m.cls.includes('cl-offmap__go')).length >= 3,
    uniq.filter((m) => m.cls.includes('cl-offmap__go')).length + ' of 3', '3');
  t('K3 the doors are reachable', uniq.filter((m) => m.cls.includes('cl-door__go')).length >= 2,
    uniq.filter((m) => m.cls.includes('cl-door__go')).length + ' of 2', '2');
  t('K4 the field and the sign are reachable', has('cl-sign__field') && has('cl-sign__name'),
    'field=' + has('cl-sign__field') + ' name=' + has('cl-sign__name'), 'both');
  t('K5 nothing in the Close is focused while covered', mine.every((m) => m.topmost),
    mine.filter((m) => !m.topmost).map((m) => m.cls).join(',') || 'none covered', 'none');
  t('K6 nothing in the Close is focused off screen', mine.every((m) => m.onScreen),
    mine.filter((m) => !m.onScreen).map((m) => m.cls).join(',') || 'none', 'none');
  t('K7 every focused control shows a ring', mine.every((m) => m.ring),
    mine.filter((m) => !m.ring).map((m) => m.cls).join(',') || 'all', 'all');
  await shot('kbd');
  R.forEach((l) => log(l));
  log(R.some((l) => l.startsWith('FAIL')) ? '>>> KEYBOARD BROKEN' : '>>> the keyboard holds');
};
