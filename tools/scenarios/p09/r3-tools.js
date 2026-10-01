/** Below the shell's collapse breakpoint, is the control reachable from Tools? */
module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => window.BEA && window.BEA.store
    && window.BEA.store.getState().status === 'ready', null, { timeout: 20000 });
  await page.waitForTimeout(600);

  const r = await page.evaluate(async () => {
    const w = () => { const e = document.querySelector('.mx-entry'); const b = e && e.getBoundingClientRect(); return b ? Math.round(b.width) : 0; };
    const before = w();
    const tools = [...document.querySelectorAll('button')].find((b) => /tools/i.test(b.textContent));
    if (!tools) return { before, tools: false };
    tools.click();
    await new Promise((r2) => setTimeout(r2, 400));
    const after = w();
    const e = document.querySelector('.mx-entry');
    const rect = e ? e.getBoundingClientRect() : null;
    return {
      before, after, tools: true,
      inView: rect ? (rect.x >= -1 && rect.x + rect.width <= innerWidth + 1 && rect.width > 0) : false,
      label: e ? e.textContent.trim() : null,
      stage: document.getElementById('app').dataset.stage,
    };
  });
  log(JSON.stringify(r));
  await shot('tools-open');
};
