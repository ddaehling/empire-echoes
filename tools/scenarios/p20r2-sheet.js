/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs, and PRINTS FAIL while exiting 0.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* p20r2-sheet — the revision sheet must carry what the student actually did:
 * the four in-lesson move commits, the three off-this-map placements, and the
 * frame in their own words. Print it after doing all three. */
module.exports = async ({ page, shot, log }) => {
  const R = [];
  const t = (id, ok, got) => R.push((ok ? 'PASS' : 'FAIL') + '  ' + id + '  ' + got);
  await page.waitForFunction(() => window.BEA && window.BEA.store, null, { timeout: 20000 });
  await page.waitForTimeout(1300);

  /* commit on all four move cards */
  for (const b of ['compensation', 'princely', 'egypt', 'exits']) {
    await page.evaluate((x) => window.BEA.bus.emit('tours:goBeat', { id: x }), b);
    await page.waitForTimeout(700);
    await page.evaluate(() => {
      const aux = document.querySelector('.tr-bar__auxb');
      if (aux && /^Move/.test(aux.textContent) && aux.getBoundingClientRect().height) aux.click();
      else { const e = document.querySelector('.tp-entry--move'); if (e) e.click(); }
    });
    await page.waitForTimeout(600);
    await page.evaluate(() => { const o = document.querySelectorAll('.tp-mv__opt')[0]; if (o) o.click(); });
    await page.waitForTimeout(250);
  }
  const picks = await page.evaluate(() => JSON.parse(localStorage.getItem('bea:teacher.path.v1') || '{}'));
  t('four commits are stored, and nothing else is', Object.keys(picks.picks || {}).length === 4
    && Object.keys(picks).join(',') === 'picks', JSON.stringify(picks));

  /* place the three off-map cases and write a frame */
  await page.goto(page.url().split('#')[0] + '#panel=workshop');
  /* WAIT FOR THE TAB, DO NOT GUESS AT IT. A fixed 2200ms passed when the desk
     was the only thing booting and stopped passing once the guided path, the
     ledger walk and the workshop's own corpus were all warming at the same
     time; the failure was a null textarea, which reads like a missing feature
     and was a missing second. */
  await page.waitForSelector('#tp-write-portable', { timeout: 20000 });
  await page.waitForSelector('.tp-port__case .tp-vote', { timeout: 20000 });
  await page.waitForTimeout(400);
  await page.evaluate(() => {
    document.querySelectorAll('.tp-port__case').forEach((c, i) => c.querySelectorAll('.tp-vote')[i % 3].click());
    const w = document.getElementById('tp-write-portable');
    w.value = 'An empire grows while its engine pays and somebody with power keeps feeding it. '
      + 'It ends when people in the colony make refusing them expensive and somebody in the '
      + 'ruling country who can decide is made to feel that cost. The cost is not always money. '
      + 'I would drop this if I found rulers who felt the cost and stayed anyway.';
    w.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await page.waitForTimeout(400);
  const unlocked = await page.evaluate(() => ({
    count: document.getElementById('tp-count-portable').textContent,
    disabled: document.querySelector('.tp-port__own .tp-reveal').disabled,
  }));
  t('forty words unlocks the model', unlocked.disabled === false, JSON.stringify(unlocked));

  /* print the revision sheet */
  await page.evaluate(() => window.BEA.store.dispatch('setPanel', { overlay: 'classroom' }));
  await page.waitForTimeout(1400);
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('.tp-packs__i button, .tp-packs__i .btn')]
      .find(x => /revision/i.test(x.closest('.tp-packs__i').textContent));
    if (b) b.click();
  });
  await page.waitForTimeout(900);
  const paper = await page.evaluate(() => {
    const p = document.querySelector('.tp-paper');
    if (!p) return null;
    const txt = p.textContent;
    return {
      moves: /The four moves, as you met them in the lesson/.test(txt),
      off: /The frame, off this map/.test(txt),
      cases: /Algeria \(France, 1830/.test(txt),
      ownWords: /somebody with power keeps feeding it/.test(txt),
      version: /700c5255|dataset 1/.test(txt),
      onScreen: getComputedStyle(p).display,
    };
  });
  t('the revision sheet carries the four commits', !!(paper && paper.moves), JSON.stringify(paper));
  t('the revision sheet carries the off-map placements and the frame',
    !!(paper && paper.off && paper.cases && paper.ownWords), JSON.stringify(paper));
  t('the sheet is print-only and carries the content version',
    !!(paper && paper.version && paper.onScreen === 'none'), JSON.stringify(paper && { v: paper.version, d: paper.onScreen }));
  await shot('after-print');

  log(R.join('\n'));
  log(R.some(r => r.startsWith('FAIL')) ? '>>> SOME FAILED' : '>>> all pass');
};
