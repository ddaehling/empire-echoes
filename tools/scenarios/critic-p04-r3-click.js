/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2800);
  // find a visible unit whose centre is not covered by an overlay
  const found = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('[data-unit],path[data-id]'));
    const out = [];
    for (const e of els) {
      const b = e.getBoundingClientRect();
      if (b.width < 25 || b.height < 25) continue;
      const cx = b.x + b.width/2, cy = b.y + b.height/2;
      const top = document.elementFromPoint(cx, cy);
      out.push({ id: e.dataset.unit || e.dataset.id, cx, cy, topIsSelf: top === e, topCls: top ? (top.className||'').toString().slice(0,30) : 'null' });
      if (out.length > 400) break;
    }
    const clickable = out.filter(o => o.cy>60 && o.cx<960 && (o.topIsSelf || /map__/.test(o.topCls)));
    return { total: out.length, clickable: clickable.length, first: clickable.slice(0,5), blocked: out.filter(o=>!o.topIsSelf).slice(0,5) };
  });
  log('HIT:', JSON.stringify(found));
  if (found.first.length) {
    await page.mouse.click(found.first[0].cx, found.first[0].cy);
    await page.waitForTimeout(1400);
    await shot('clicked');
    log('URL', page.url());
    log('DOSSIER', await page.evaluate(()=>document.querySelector('.app__dossier').innerText.slice(0,500).replace(/\n/g,' | ')));
  }
};
