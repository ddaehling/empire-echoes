module.exports = async ({ page, log, shot }) => {
  const base = 'http://localhost:8777/app/';
  await page.goto(base + '#tour=period&step=10', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', { timeout: 30000 });
  await page.waitForTimeout(1800);
  await page.locator('.tr-panel__foot button:has-text("Finish")').first().click({ force: true }).catch(()=>{});
  await page.waitForTimeout(2000);
  await page.locator('button:has-text("Sign it")').first().click({ force: true }).catch(e => log('sign ' + e.message));
  await page.waitForTimeout(1500);
  await shot('01-signed');
  await page.locator("button:has-text(\"Print my revision sheet\")").first().click({force:true}).catch(e=>log("rev "+e.message)); await page.waitForTimeout(2500); await page.emulateMedia({ media: "print" });
  await page.waitForTimeout(1200);
  await shot('02-print-media');
  const t = await page.evaluate(() => {
    const vis = [...document.querySelectorAll('body *')].filter(e => {
      const cs = getComputedStyle(e); const b = e.getBoundingClientRect();
      return cs.display !== 'none' && cs.visibility !== 'hidden' && b.height > 4 && b.width > 4;
    });
    return { count: vis.length, h: document.documentElement.scrollHeight, text: document.body.innerText.slice(0, 6000) };
  });
  log('PRINT MEDIA: docHeight=' + t.h + ' visible=' + t.count);
  log('PRINT TEXT>>>\n' + t.text + '\n<<<');
  await page.emulateMedia({ media: 'screen' });
};
