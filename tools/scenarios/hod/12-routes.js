module.exports = async ({ page, log }) => {
  await page.waitForTimeout(9000);
  const r = await page.evaluate(()=>{
    const B = window.BEA||{};
    const out = {keys:Object.keys(B)};
    if(B.tourStepIndex) out.idx = JSON.parse(JSON.stringify(B.tourStepIndex));
    if(B.routes) out.routes = JSON.parse(JSON.stringify(B.routes));
    if(B.tours) out.tours = Object.keys(B.tours);
    return out;
  });
  log(JSON.stringify(r,null,1).slice(0,12000));
};
