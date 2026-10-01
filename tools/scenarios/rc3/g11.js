module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1919&sel=punjab-province&tour=core&step=11&filter=stage:working,pressure:off&view=7,0.2095,-0.0722');
  await page.waitForTimeout(2600);
  const jump = page.getByRole('button', { name: /the field/i }).first();
  if (await jump.count()) { await jump.click(); await page.waitForTimeout(800); }
  const panel = await page.evaluate(()=>{ const p=[...document.querySelectorAll('*')].find(e=>e.innerText&&e.innerText.includes('Two men')&&e.innerText.length<9000); return p?p.innerText:'none';});
  log(panel.slice(0,4500));
  log('--- inputs ---');
  log(JSON.stringify(await page.evaluate(()=>[...document.querySelectorAll('button,input,[role]')].filter(e=>e.offsetParent).map(e=>(e.tagName+'|'+(e.getAttribute('role')||'')+'|'+(e.getAttribute('aria-label')||e.innerText||'').replace(/\s+/g,' ').slice(0,70))).slice(0,45))));
};
