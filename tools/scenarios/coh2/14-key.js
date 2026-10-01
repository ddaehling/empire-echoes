module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2400);
  const btns = await page.evaluate(() => [...document.querySelectorAll('button,[role=button]')].map(b=>({t:(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,50), c:b.className.slice(0,40)})).filter(b=>b.t));
  log('BUTTONS', JSON.stringify(btns, null, 0).slice(0, 2500));
  const k = page.locator('.byline__keybtn, button:has-text("Open the full key")').first();
  await k.click({ force: true }); await page.waitForTimeout(1200); await shot('fullkey');
  log('after', JSON.stringify(await page.evaluate(()=>{const s=window.BEA.store.getState();return {overlay:s.panelState.overlay, hash:location.hash};})));
  log('classes', await page.evaluate(()=>[...document.querySelectorAll('[data-mount="overlay"] > *')].map(e=>e.className)));
};
