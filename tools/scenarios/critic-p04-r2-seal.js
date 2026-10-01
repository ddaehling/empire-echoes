/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2400);
  for (const [id,y] of [['british-india',1700],['british-india',1800],['british-india',1850],['british-india',1860],['bengal-presidency',1800],['kenya',1900],['nigeria',1895]]) {
    await page.evaluate(([i,yy]) => { location.hash = '#year=' + yy + '&sel=' + i; }, [id,y]);
    await page.waitForTimeout(500);
    const s = await page.evaluate(() => {
      const e = document.querySelector('.dsr__seal');
      const t = document.querySelector('.dossier').innerText;
      const i = t.indexOf('LEGAL STATUS IN');
      return { seal: e ? e.dataset.seal : null, sealTitle: e ? e.getAttribute('title') : null, status: t.slice(i, i+90).replace(/\n/g,' | ') };
    });
    log(id + ' ' + y + ' -> seal=' + s.seal + ' | ' + s.status);
  }
  // chip rail overflow check
  await page.evaluate(() => { location.hash = '#year=1913&sel=british-india'; });
  await page.waitForTimeout(700);
  const rail = await page.evaluate(() => {
    const r = document.querySelector('.dsr__nav, [class*=rail], nav');
    const el = document.querySelector('.dossier');
    const cands = [...el.querySelectorAll('*')].filter(n => n.scrollWidth > n.clientWidth + 4);
    return cands.slice(0,4).map(n => ({cls: n.className, sw:n.scrollWidth, cw:n.clientWidth, txt:n.innerText.replace(/\n/g,' ').slice(0,120)}));
  });
  log('OVERFLOWING: ' + JSON.stringify(rail, null, 1));
  // keyboard: tab through
  await page.keyboard.press('Tab');
  const seq = [];
  for (let i=0;i<28;i++){ await page.keyboard.press('Tab'); seq.push(await page.evaluate(()=>{const a=document.activeElement;return (a.tagName)+':'+(a.className||'').slice(0,28)+':'+(a.innerText||a.getAttribute('aria-label')||'').replace(/\n/g,' ').slice(0,40);})); }
  log('TAB ORDER:\n' + seq.join('\n'));
  await shot('kbd');
};
