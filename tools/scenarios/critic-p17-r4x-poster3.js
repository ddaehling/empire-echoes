/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — locator.click: Timeout 30000ms exceeded..
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2800);
  await page.locator('button', { hasText: 'Open the full key' }).first().click();
  await page.waitForTimeout(1200);
  const wrong = page.locator('text=There is no way to tell from looking').first();
  await wrong.scrollIntoViewIfNeeded();
  await shot('poster-before');
  await wrong.click();
  await page.waitForTimeout(900);
  await shot('poster-wrong');
  let t = await page.locator('.app__overlay').innerText();
  log('AFTER WRONG (tail):\n' + t.slice(t.indexOf('NOW DO IT')));
  // now the right one
  const right = page.locator('text=Mercator — and the sheet never says so').first();
  if (await right.count()) { await right.click(); await page.waitForTimeout(800); }
  await page.locator('text=One flat red for everything British').first().click().catch(()=>{});
  await page.waitForTimeout(600);
  await page.locator('text=1886 in the title').first().click().catch(()=>{});
  await page.waitForTimeout(800);
  await shot('poster-answered');
  t = await page.locator('.app__overlay').innerText();
  log('AFTER ALL (tail):\n' + t.slice(t.indexOf('NOW DO IT')));
  // free text
  const ta = page.locator('.app__overlay textarea, .app__overlay input[type=text]');
  log('free-text fields:', String(await ta.count()));
  if (await ta.count()) {
    await ta.first().fill('Britannia and the lion are propaganda, not geography.');
    await page.waitForTimeout(400);
    const save = page.locator('.app__overlay button', { hasText: /keep|save|send|record|close/i });
    log('save buttons:', String(await save.count()), (await save.allInnerTexts()).join(' | '));
    if (await save.count()) { await save.first().click(); await page.waitForTimeout(900); }
  }
  await shot('poster-final');
  t = await page.locator('.app__overlay').innerText();
  log('FINAL (tail):\n' + t.slice(t.indexOf('NOW DO IT')));
};
