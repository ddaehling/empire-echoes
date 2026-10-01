module.exports = async ({ page, log }) => {
  await page.goto('http://localhost:8777/app/#tour=thirty&step=9', { waitUntil: 'load' });
  await page.waitForFunction(() => window.BEA && window.BEA.store && window.BEA.store.getState().status === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(2200);
  const r = await page.evaluate(() => {
    const out = {};
    const t = document.querySelector('.app__time');
    const inner = document.querySelector('.time__slot');
    const tl = document.querySelector('.tl');
    out.time = t ? { h: t.clientHeight, sh: t.scrollHeight } : null;
    out.slot = inner ? { h: inner.clientHeight, sh: inner.scrollHeight } : null;
    out.tl = tl ? { h: Math.round(tl.getBoundingClientRect().height), sh: tl.scrollHeight, cls: tl.className } : null;
    // children of .tl and their heights
    out.kids = tl ? [...tl.children].map(c => ({ c: String(c.className).slice(0,30), h: Math.round(c.getBoundingClientRect().height), y: Math.round(c.getBoundingClientRect().top), b: Math.round(c.getBoundingClientRect().bottom) })) : [];
    const lede = document.querySelector('.app__lede');
    out.lede = lede ? { h: lede.clientHeight, sh: lede.scrollHeight } : null;
    out.ledeKids = lede ? [...lede.querySelectorAll('*')].slice(0,10).map(c => ({ c: String(c.className).slice(0,26), h: Math.round(c.getBoundingClientRect().height) })) : [];
    // the through-line
    const foot = document.querySelector('.app__foot');
    const cl = document.querySelector('.cl-bar');
    out.foot = foot ? { h: foot.clientHeight, disp: getComputedStyle(foot).display, sh: foot.scrollHeight } : null;
    out.cl = cl ? { h: Math.round(cl.getBoundingClientRect().height), sh: cl.scrollHeight, sw: cl.scrollWidth, cw: cl.clientWidth, parent: cl.parentElement.className, txt: cl.textContent.trim() } : null;
    out.blanks = [...document.querySelectorAll('.cl-say__blank')].map(b => ({ t: b.textContent.trim().slice(0,20), w: Math.round(b.getBoundingClientRect().width), vis: b.getBoundingClientRect().width > 0 }));
    // legend ribbon
    const key = document.querySelector('.stage__key');
    out.key = key ? { h: Math.round(key.getBoundingClientRect().height), w: Math.round(key.getBoundingClientRect().width), sw: key.scrollWidth } : null;
    const chips = [...document.querySelectorAll('.stage__key .legend__chip, .byline .legend__chip')];
    out.chips = chips.map(c => ({ w: Math.round(c.getBoundingClientRect().width), t: c.textContent.trim().slice(0,24), aria: c.getAttribute('aria-label') || (c.querySelector('[aria-label]') ? c.querySelector('[aria-label]').getAttribute('aria-label') : null) }));
    return out;
  });
  log(JSON.stringify(r, null, 1));
};
