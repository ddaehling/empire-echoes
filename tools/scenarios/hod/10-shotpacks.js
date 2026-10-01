module.exports = async ({ page, shot, log }) => {
  await page.addInitScript(()=>{window.print=()=>{};});
  await page.goto(page.url().split('#')[0] + '#panel=classroom', { waitUntil:'load' });
  await page.waitForTimeout(13000);
  await page.evaluate(()=>{const l=[...document.querySelectorAll('.tp-packs__i')].filter(x=>/Lesson One/.test(x.innerText)); if(l[0]) l[0].scrollIntoView({block:'center'});});
  await page.waitForTimeout(1500);
  await shot('dup-region');
};
