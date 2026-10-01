module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1955&sel=kenya', { waitUntil: 'domcontentloaded' });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  await page.click('.hgx-card__go');
  await page.waitForTimeout(1200);
  await shot('hgx-open');
  const info = await page.evaluate(() => {
    const q = (s) => document.querySelector(s);
    const b = q('.cx-sheet__body');
    const c = q('.hgx-choice[data-value="elkins"]');
    const r = c ? c.getBoundingClientRect() : null;
    const cs = c ? getComputedStyle(c) : null;
    let anc = [];
    let el = c;
    while (el && el !== document.body) {
      const s = getComputedStyle(el);
      const rr = el.getBoundingClientRect();
      anc.push([el.className || el.tagName, Math.round(rr.width)+'x'+Math.round(rr.height), 'disp='+s.display, 'vis='+s.visibility, 'op='+s.opacity, 'ovf='+s.overflow, 'h='+s.height, 'maxh='+s.maxHeight]);
      el = el.parentElement;
    }
    return {
      bodyText: b ? b.innerText.slice(0, 3000) : '(no body)',
      choiceRect: r ? {w:Math.round(r.width),h:Math.round(r.height),x:Math.round(r.x),y:Math.round(r.y)} : null,
      choiceStyle: cs ? {disp:cs.display, vis:cs.visibility, op:cs.opacity} : null,
      positions: document.querySelectorAll('.hgx-pos').length,
      choices: document.querySelectorAll('.hgx-choice').length,
      ancestors: anc.slice(0, 6),
      windowH: window.innerHeight,
    };
  });
  log(JSON.stringify(info, null, 1));
};
