const R = require('../lib/routes.js');
const TARGETS = [['lesson-one',3,'flow'],['lesson-one',9,'dots'],['lesson-two',8,'twin']];
module.exports = async ({ page, shot, log }) => {
  await R.ready(page);
  for (const [route, step, want] of TARGETS) {
    await page.goto('http://localhost:8777/app/#tour=' + route + '&step=' + step);
    await R.ready(page); await page.waitForTimeout(1800);
    const a = await page.evaluate(() => ({
      title: document.querySelector('.cx-sheet__title')?.textContent,
      aux: document.querySelector('.tr-bar__auxb')?.textContent?.trim(),
      viz: [...document.querySelectorAll('.viz')].map(n=>String(n.className)),
    }));
    log('--- ' + route + ' step ' + step + ' (' + want + ') title="' + a.title + '" aux="' + a.aux + '"');
    // press the aux "Count it"
    await page.evaluate(() => document.querySelector('.tr-bar__auxb')?.click());
    await page.waitForTimeout(1400);
    const b = await page.evaluate(() => {
      const v = document.querySelector('.viz'); if (!v) return { viz: null };
      const r = v.getBoundingClientRect();
      const ctrls = [...v.querySelectorAll('button, input')].filter(n=>{const q=n.getBoundingClientRect();return q.width>2&&q.height>2;});
      return { viz: String(v.className), w:Math.round(r.width), h:Math.round(r.height), top:Math.round(r.top),
        ctrls: ctrls.map(n=>{const q=n.getBoundingClientRect(); const cx=q.left+q.width/2, cy=q.top+q.height/2;
          const t=(cx>0&&cy>0&&cx<innerWidth&&cy<innerHeight)?document.elementFromPoint(cx,cy):null;
          return {txt:(n.textContent||n.type||'').trim().slice(0,22), top:Math.round(q.top), hit: t?(n===t||n.contains(t)?'ok':'OCCL:'+String(t.className).slice(0,20)):'offscreen'};}),
        text: v.innerText.replace(/\s+/g,' ').slice(0,600) };
    });
    log('   ' + JSON.stringify(b).slice(0, 1400));
    await shot(route + '-' + step + '-' + want);
    // scroll the figure into view and re-hit-test its commit
    const c = await page.evaluate(() => {
      const btn = document.querySelector('.viz button:not([disabled])');
      if (!btn) return 'no-btn';
      btn.scrollIntoView({block:'center'});
      const q = btn.getBoundingClientRect(); const t = document.elementFromPoint(q.left+q.width/2, q.top+q.height/2);
      return (btn===t||btn.contains(t)) ? 'reachable-after-scroll@'+Math.round(q.top) : 'STILL-OCCLUDED:'+String(t&&t.className).slice(0,30);
    });
    log('   commit: ' + c);
    await shot(route + '-' + step + '-' + want + '-scrolled');
  }
};
