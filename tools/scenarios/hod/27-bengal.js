module.exports = async ({ page, shot, log }) => {
  await page.goto(page.url().split('#')[0] + '#year=1765&sel=bengal-presidency', { waitUntil:'load' });
  await page.waitForTimeout(12000);
  await shot('bengal');
  const t = await page.evaluate(()=>{const d=document.querySelector('.ds, [class*=dossier], aside[aria-label="Territory dossier"]'); return d?d.innerText.slice(0,2500):'NO DOSSIER';});
  log(t);
};
