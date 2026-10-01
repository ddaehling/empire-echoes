module.exports = async ({ page, shot, log }) => {
  await page.waitForFunction(() => document.documentElement.dataset.boot === 'ready', {timeout:30000}).catch(()=>{});
  await page.waitForTimeout(1200);
  const cases = [
    ['british-india', 1846], ['punjab-province', 1849], ['british-burma', 1886],
    ['nepal', 1820], ['bhutan', 1870], ['mysore', 1800], ['assam-province', 1830],
    ['kenya', 1920], ['egypt', 1900], ['jamaica', 1700], ['new-zealand', 1860],
    ['ireland', 1848], ['hong-kong', 1900], ['sokoto-caliphate', 1905],
    ['cape-colony', 1900], ['rajputana-agency', 1900]
  ];
  for (const [id, yr] of cases) {
    await page.evaluate(([i,y]) => { window.BEA.store.act.setYear(y); window.BEA.store.act.select(i); }, [id, yr]);
    await page.waitForTimeout(700);
    const t = await page.evaluate(() => (document.querySelector('[data-mount=dossier]')||{}).innerText||'(none)');
    log('#### '+id+' @'+yr+' ####\n'+t.replace(/\n{3,}/g,'\n\n').slice(0,2600));
  }
};
