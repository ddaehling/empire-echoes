module.exports = async ({ page, shot, log }) => {
  await page.waitForTimeout(2500);
  await page.locator('button:has-text("Start the lesson")').first().click();
  await page.waitForTimeout(1200);
  const l = page.locator('text=The other route, and what this one leaves out').first();
  await l.click({force:true});
  await page.waitForTimeout(1400);
  await shot('leaves');
  log((await page.evaluate(()=>{
    const c = Array.from(document.querySelectorAll('div,section,aside')).filter(n=>/leaves out|does not reach/i.test(n.innerText||''));
    c.sort((a,b)=>(a.innerText||'').length-(b.innerText||'').length);
    return c.length ? c[0].innerText : document.body.innerText;
  })).slice(0,7000));
};
