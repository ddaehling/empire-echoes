/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — locator.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  await page.getByText(/Open the full key/i).first().click();
  await page.waitForTimeout(1000);
  for (const name of ['Princely state','Protectorate','Company rule']) {
    const b = page.locator('.legend__entry', {hasText: new RegExp('^'+name)}).first();
    if (await b.count()) { await b.click(); await page.waitForTimeout(600); }
  }
  await shot('entries-open');
  const t = await page.evaluate(()=>{
    const out=[];
    document.querySelectorAll('.legend__entry').forEach(e=>{ if(e.getAttribute('aria-expanded')==='true'||/WATCH|trap|Source|—/i.test(e.innerText)) out.push(e.innerText.replace(/\s+/g,' ')); });
    return out.slice(0,20);
  });
  log('ENTRIES>>>\n' + t.join('\n---\n').slice(0,6000));
};
