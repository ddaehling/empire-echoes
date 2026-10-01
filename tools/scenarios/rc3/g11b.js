module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1919&sel=punjab-province&tour=core&step=11&filter=stage:working,pressure:off&view=7,0.2095,-0.0722');
  await page.waitForTimeout(2600);
  const t = page.getByText(/Neither on its own\. Dyer explains the decision/i).first();
  log('found ' + await t.count());
  await t.scrollIntoViewIfNeeded().catch(()=>{});
  // scroll up in that panel to see the whole question
  await page.evaluate(()=>{ const el=[...document.querySelectorAll('*')].find(e=>/Two men/.test(e.textContent)&&e.scrollHeight>e.clientHeight); if(el) el.scrollTop=0; });
  await page.waitForTimeout(500);
  await shot('gate11-top');
  await t.click({force:true}).catch(e=>log('click fail '+e.message));
  await page.waitForTimeout(700);
  await shot('gate11-chosen');
  const b = page.getByRole('button', { name: /Show me what they wrote/i }).first();
  log('reveal btn ' + await b.count() + ' enabled=' + (await b.isEnabled().catch(()=>'?')));
  await b.click({force:true}).catch(e=>log('reveal fail '+e.message));
  await page.waitForTimeout(1200);
  await shot('gate11-revealed');
  log('bar: ' + await page.evaluate(()=>document.querySelector('.tr-bar')?.innerText.replace(/\s+/g,' ').slice(0,100)));
  const txt = await page.evaluate(()=>{ const els=[...document.querySelectorAll('section,article,div')].filter(e=>/Dyer/.test(e.textContent)&&e.textContent.length<6000); return els.length?els[els.length-1].innerText:'x';});
  log(txt.slice(0,3500));
};
