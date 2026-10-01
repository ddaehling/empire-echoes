/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1913&sel=kenya', { waitUntil: 'load' });
  await page.waitForTimeout(2500);
  await shot('view');
  const g = await page.evaluate(() => {
    const d = document.getElementById('dossier');
    const b = d.getBoundingClientRect();
    const cs = getComputedStyle(d);
    // contrast check on a few text nodes
    const samples = [...d.querySelectorAll('h2,p,span,div')].slice(0, 200).filter(e=>e.children.length===0&&e.textContent.trim()).slice(0,8)
      .map(e => ({ txt: e.textContent.trim().slice(0,30), color: getComputedStyle(e).color, size: getComputedStyle(e).fontSize }));
    return { rect: b.toJSON(), bg: cs.backgroundColor, overflow: cs.overflowY, samples, vw: innerWidth, vh: innerHeight };
  });
  log(JSON.stringify(g, null, 1));
  // fold check: is the status/taken/ended visible without scrolling?
  const fold = await page.evaluate(() => {
    const d = document.getElementById('dossier'); const t = d.innerText;
    const find = re => { const e=[...d.querySelectorAll('*')].filter(x=>x.children.length===0&&re.test(x.textContent.trim()))[0]; return e? Math.round(e.getBoundingClientRect().bottom):null; };
    return { status: find(/^Legal status/i), taken: find(/^How it was taken/i), ended: find(/^How it ended/i), vote: find(/^Who could vote/i), vh: innerHeight, panelBottom: Math.round(d.getBoundingClientRect().bottom) };
  });
  log('FOLD:', JSON.stringify(fold));
};
