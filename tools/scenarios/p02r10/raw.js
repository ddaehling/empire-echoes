module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.__map && window.__map.plate, null, { timeout: 30000 });
  await page.waitForTimeout(600);
  const r = await page.evaluate(() => {
    const el = document.querySelector('.map');
    const cs = getComputedStyle(el), rs = getComputedStyle(document.documentElement);
    const KEYS = ['never-british','lost-former','dominion','settlement','crown-conquered','company-rule','lease','protectorate','mandate','occupied'];
    const o = {};
    for (const k of KEYS) o[k] = [cs.getPropertyValue('--map-'+k).trim(), rs.getPropertyValue('--map-'+k).trim()];
    o.__ground = [cs.getPropertyValue('--map-ground').trim()];
    o.__tokens = JSON.stringify(window.__map.module.tokens.fills);
    o.__theme = document.documentElement.dataset.theme || '(none)';
    return o;
  });
  for (const k of Object.keys(r)) log(k + ' :: ' + JSON.stringify(r[k]).slice(0, 300));
};
