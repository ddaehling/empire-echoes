/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const popTxt = () => page.evaluate(()=>{const p=document.querySelector('.tl__pop'); return p? (p.hidden?'(hidden)':p.innerText.slice(0,300).replace(/\n/g,' | ')) : '(none)';});
  await page.evaluate(()=>{ document.querySelector('.tl-mark').focus(); });
  await page.waitForTimeout(400); log('focus: '+await popTxt());
  await page.keyboard.press('ArrowRight'); await page.waitForTimeout(400); log('arrow: '+await popTxt());
  await shot('rove-focus');
  await page.keyboard.press('Enter'); await page.waitForTimeout(700); log('enter: '+await popTxt());
  log('year: '+await page.evaluate(()=>document.querySelector('.time__slot').innerText.split('\n').filter(s=>/^\d{4}$/.test(s.trim()))[0]));
  await shot('rove-enter');
  // and clicking a reachable mark by mouse
  const reachable = await page.evaluate(()=>{ const ms=[...document.querySelectorAll('.tl-mark')]; for(const b of ms){const r=b.getBoundingClientRect(); const e=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2); if(e===b||b.contains(e)) return b.dataset.year;} return null;});
  log('first mouse-reachable mark year: '+reachable);
};
