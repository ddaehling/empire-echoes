module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  await page.getByRole('button', { name: /Start the lesson/i }).first().click();
  await page.waitForTimeout(1500);
  const grab = async () => page.evaluate(() => {
    const p = document.querySelector('#sheet') || document.body;
    return p.innerText.replace(/\n{2,}/g, '\n').slice(0, 3000);
  });
  const pos = async () => page.evaluate(() => {
    const e = [...document.querySelectorAll('*')].find(x => /^\d+ \/ \d+$/.test((x.textContent||'').trim()) && x.children.length===0);
    return e ? e.textContent.trim() : '?';
  });
  for (let i = 1; i <= 26; i++) {
    log('\n========== STOP ' + i + ' (' + await pos() + ') ==========\n' + await grab());
    if (i % 3 === 1 || i > 20) await shot('s' + String(i).padStart(2, '0'));
    const n = page.locator('button.tr-bar__next');
    if (!await n.count()) { log('END: no next at', i); break; }
    await n.click({ force: true });
    await page.waitForTimeout(1100);
  }
  await shot('final');
};
