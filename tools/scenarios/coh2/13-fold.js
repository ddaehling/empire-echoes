module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2400);
  const b = page.locator('button:has-text("FOLD")').first();
  log('fold count', await b.count());
  await b.click(); await page.waitForTimeout(900); await shot('folded');
  log('geom', JSON.stringify(await page.evaluate(()=>{const r=s=>{const e=document.querySelector(s);if(!e)return null;const x=e.getBoundingClientRect();return [Math.round(x.x),Math.round(x.y),Math.round(x.width),Math.round(x.height)];};return {note:r('.stage__note'),legend:r('.stage__legend'),plate:r('.map__frame')};})));
  log('legendtext', (await page.evaluate(()=>document.querySelector('.stage__legend')?.innerText||'')).replace(/\n+/g,' | '));
  // open the full key plate
  const k = page.locator('button:has-text("Open the full key")').first();
  if (await k.count()) { await k.click(); await page.waitForTimeout(1100); await shot('fullkey'); }
  log('after key geom', JSON.stringify(await page.evaluate(()=>{const r=s=>{const e=document.querySelector(s);if(!e)return null;const x=e.getBoundingClientRect();return [Math.round(x.x),Math.round(x.y),Math.round(x.width),Math.round(x.height)];};return {plate:r('.map__frame'), lplate:r('.lplate, [class*=lplate]')};})));
};
