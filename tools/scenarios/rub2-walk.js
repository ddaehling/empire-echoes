/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  // start lesson
  const btn = page.locator('button:has-text("Start the lesson")').first();
  await btn.click();
  await page.waitForTimeout(1200);
  let total = 0, steps = 0;
  const seen = [];
  for (let i = 0; i < 60; i++) {
    const info = await page.evaluate(() => {
      const bar = document.querySelector('.tour-bar, [data-tour-bar], .tourbar');
      const t = document.body.innerText;
      return { text: t, hash: location.hash };
    });
    const words = info.text.split(/\s+/).filter(Boolean).length;
    seen.push({ i, hash: info.hash, words });
    total += words;
    steps++;
    // find Next
    const next = page.locator('button:has-text("Next"), [data-act="next"], button[aria-label*="Next"]').first();
    const n = await next.count();
    if (!n) { log('no next at step', i, info.hash); break; }
    const dis = await next.isDisabled().catch(()=>false);
    if (dis) { log('NEXT DISABLED at', i, info.hash); 
      // try to satisfy gate: click first choice
      const ch = page.locator('.gate button, .prompt button, [data-choice]').first();
      if (await ch.count()) { await ch.click(); await page.waitForTimeout(400); }
    }
    try { await next.click({ timeout: 2000 }); } catch(e) { log('click fail', i, e.message); break; }
    await page.waitForTimeout(500);
  }
  log('STEPS', steps);
  log(JSON.stringify(seen.map(s=>s.hash)));
};
