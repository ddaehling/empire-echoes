module.exports = async ({ page, log, shot }) => {
  await page.waitForTimeout(2200);
  const dump = () => page.evaluate(() => {
    const out = [];
    const walk = (el, d) => {
      const b = el.getBoundingClientRect();
      out.push(' '.repeat(d) + el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : '') + ` [${b.x.toFixed(0)},${b.y.toFixed(0)} ${b.width.toFixed(0)}x${b.height.toFixed(0)} bot=${b.bottom.toFixed(0)}]` + (el.children.length ? '' : ' "' + (el.textContent || '').trim().slice(0, 24) + '"'));
      if (d < 6) [...el.children].forEach(c => walk(c, d + 1));
    };
    const t = document.querySelector('.app__time');
    if (t) walk(t, 0);
    return { stage: document.documentElement.dataset.stage, appStage: document.getElementById('app')?.dataset.stage, tree: out.join('\n') };
  });
  const a = await dump();
  log('=== PLATE stage=' + a.stage + '/' + a.appStage + '\n' + a.tree);
  await page.evaluate(() => window.BEA?.bus?.emit?.('ask:stage', { level: 'apparatus' }));
  await page.waitForTimeout(1200);
  const b = await dump();
  log('=== APPARATUS stage=' + b.stage + '/' + b.appStage + '\n' + b.tree);
};
