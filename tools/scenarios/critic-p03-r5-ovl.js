/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — page.evaluate: TypeError: Cannot read properties of null (reading 'children').
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(3000);
  const d = await page.evaluate(()=>{
    const ov = document.querySelector('[data-mount="overlay"]');
    const sw = document.querySelector('.map__switch');
    const btns = sw ? Array.from(sw.querySelectorAll('button')).map(b=>b.className+' | '+b.innerText.slice(0,30).replace(/\n/g,' ')) : [];
    return { overlayHTMLstart: ov ? ov.innerHTML.slice(0,400) : null, switchButtons: btns,
      switchRect: sw? sw.getBoundingClientRect().toJSON():null,
      railChildren: Array.from(document.querySelector('.map__rail').children).map(c=>c.className+' h'+Math.round(c.getBoundingClientRect().height)) };
  });
  log(JSON.stringify(d,null,1));
  // try pressing keys 2 then Escape to see if it collapses
  await page.keyboard.press('Escape'); await page.waitForTimeout(500);
  const after = await page.evaluate(()=>{const sw=document.querySelector('.map__switch'); return sw? sw.getBoundingClientRect().toJSON():'gone';});
  log('after Escape: '+JSON.stringify(after));
};
