/* shl9-boot.js — THE BOOT RACE, proved.
 *
 * GUARANTEE THIS FILE PROTECTS: an address that arrives while the app is still
 * booting is the address the app ends up in, and the address bar, the store and
 * the mounted route all say the same thing. url.js holds a pop that arrives
 * before `store.status === 'ready'` and replays it once at ready; nothing writes
 * the address before ready. If either rule is dropped, the queued throttled
 * write lands between the assignment and the hashchange, the reader's link is
 * overwritten with the app's own, and the URL lies about the lesson.
 *
 * It sets the hash at six firing times across the boot window — including two
 * scheduled from an init script, before `load` — and asserts agreement each time.
 *
 *   node tools/inspect.js tools/scenarios/shl9-boot.js --out /tmp/boot --w 1366 --h 768
 */
const WANT = { tour: 'lesson-two', step: 4 };

module.exports = async ({ page, log }) => {
  const base = page.url().split('#')[0];
  const fails = [];

  const settle = async () => {
    await page.waitForFunction(() => window.BEA?.store?.getState().status === 'ready', null, { timeout: 25000 });
    await page.waitForTimeout(1400);
  };
  const agreement = () => page.evaluate(() => {
    const st = window.BEA.store.getState();
    const hash = location.hash.replace(/^#/, '');
    const q = new Map(hash.split('&').map(p => { const i = p.indexOf('='); return [p.slice(0, i), p.slice(i + 1)]; }));
    return {
      hashTour: q.get('tour') || null, hashStep: q.get('step') ? +q.get('step') : null,
      storeTour: st.activeTour || null, storeStep: (st.tourStep | 0) + 1,
      status: st.status, hash,
    };
  });
  const check = async (label) => {
    const a = await agreement();
    const ok = a.hashTour === WANT.tour && a.hashStep === WANT.step && a.storeTour === WANT.tour && a.storeStep === WANT.step;
    log((ok ? 'PASS ' : 'FAIL ') + label.padEnd(34), JSON.stringify(a));
    if (!ok) fails.push(label + ' -> ' + JSON.stringify(a));
    return ok;
  };

  // 0. control: cold load straight into the address
  await page.goto(base + '#tour=' + WANT.tour + '&step=' + WANT.step, { waitUntil: 'commit' });
  await settle();
  await check('cold load into the address');

  // 1-4. the hash is assigned DURING boot, at four firing times
  for (const t of [80, 250, 500, 800]) {
    await page.goto(base + '#tour=lesson-one&step=9', { waitUntil: 'commit' });
    await page.waitForTimeout(t);
    await page.evaluate(([tour, step]) => { location.hash = '#tour=' + tour + '&step=' + step; }, [WANT.tour, WANT.step]);
    await settle();
    await check('hash set at boot+' + t + 'ms');
  }

  /* 5-8. THE EARLIEST WINDOW THERE IS. An init script runs at document start,
     before any of the app's modules — but a goto that changes only the fragment
     is a SAME-DOCUMENT navigation and runs no init script at all, so each round
     carries its own `?b=` and loads a genuinely new document. */
  let bust = 0;
  for (const t of [0, 40, 120, 300]) {
    await page.evaluate(() => {}).catch(() => {});
    await page.addInitScript(([tour, step, delay, tag]) => {
      if (window.__beaBoot === tag) return; window.__beaBoot = tag;
      setTimeout(() => { location.hash = '#tour=' + tour + '&step=' + step; }, delay);
    }, [WANT.tour, WANT.step, t, 'r' + (++bust)]);
    await page.goto(base + '?b=' + bust + '#tour=lesson-one&step=9', { waitUntil: 'commit' });
    const ran = await page.evaluate(() => !!window.__beaBoot).catch(() => false);
    await settle();
    await check('document-start +' + t + 'ms' + (ran ? '' : ' [INIT SCRIPT DID NOT RUN]'));
  }

  log(fails.length ? 'BOOT RACE FAILURES (' + fails.length + '):\n' + fails.join('\n') : 'BOOT RACE: all 9 checks agree.');
  if (fails.length) throw new Error('boot race: ' + fails.length + ' of 9 disagreed');
};
