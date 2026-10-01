#!/usr/bin/env node
'use strict';
/* Independent observational audit. No app data is modified outside an isolated browser context. */
const { chromium } = require('playwright');
const fs = require('node:fs/promises');
const path = require('node:path');
const URL = process.env.BASE_URL || 'http://127.0.0.1:8777/app/journey/';
const OUT = process.env.QA_ARTIFACT_DIR || '/tmp/learning-accessibility/final';
const AXE = process.env.AXE_PATH || '/tmp/journey-teacher-qa/node_modules/axe-core/axe.min.js';
const report = { url: URL, observedAt: new Date().toISOString(), pages: [], errors: [] };
const banned = /\b(?:marks|\d+ mark|rubrics?|scores?|scoring|word counts?|minimum words?|maximum words?|\d+[–-]\d+ words|\d+ words (?:minimum|maximum))\b/ig;
async function snapshot(page, name, axe = false) {
  const content = page.locator('#rallye-view');
  const item = {name, viewport: page.viewportSize(), metrics: await page.evaluate(() => ({
    width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
    active: document.activeElement?.outerHTML?.slice(0,700),
  }))};
  const rendered = await content.innerText();
  const accessible = await content.ariaSnapshot();
  const textToCheck = rendered + '\n' + accessible;
  item.bannedMatches = [...textToCheck.matchAll(banned)].map(m=>textToCheck.slice(Math.max(0,m.index-55),m.index+100));
  item.responseFields = await content.locator('textarea:visible').count();
  await fs.writeFile(path.join(OUT, name+'.txt'), rendered);
  await fs.writeFile(path.join(OUT, name+'.aria.yml'), accessible);
  await page.screenshot({path:path.join(OUT,name+'.png'),fullPage:true});
  if (axe) item.axe = await page.evaluate(async () => {
    const result = await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});
    return {violations:result.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})), incomplete:result.incomplete.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))};
  });
  report.pages.push(item);
}
async function doubleText(page) {
  await page.evaluate(()=>{
    const sizes=[...document.querySelectorAll('body *')].map(e=>[e,getComputedStyle(e).fontSize]);
    sizes.forEach(([e,size])=>e.style.setProperty('font-size',`${parseFloat(size)*2}px`,'important'));
  });
}
(async()=>{
  await fs.mkdir(OUT,{recursive:true});
  const browser=await chromium.launch();
  try {
    const page=await browser.newPage({viewport:{width:1440,height:1000}});
    page.on('pageerror',error=>report.errors.push(error.message));
    await page.goto(URL+'#rallye');
    await page.locator('html[data-ready=true]').waitFor({timeout:30000});
    await page.evaluate(()=>document.fonts.ready);
    await page.addScriptTag({path:AXE});
    await snapshot(page,'intro-1440',true);
    await page.locator('#ry-name').fill('Accessibility QA');
    await page.locator('[data-ry-start] button[type=submit]').click();
    const stages=await page.locator('[data-ry-stage]').evaluateAll(es=>[...new Set(es.map(e=>e.dataset.ryStage))]);
    report.stageIds=stages;
    for (const width of [320,390,768,1440]) {
      await page.setViewportSize({width,height:1000});
      for (const [index,id] of stages.entries()) {
        await page.locator(`[data-ry-stage="${id}"]`).first().click();
        await snapshot(page,`task-${index+1}-${width}`,width===1440);
        if(width===1440){
          await page.locator('#rallye-view details').evaluateAll(es=>es.forEach(e=>e.open=true));
          await snapshot(page,`task-${index+1}-${width}-expanded`,true);
        }
      }
    }
    for (const width of [320,768,1440]) {
      await page.setViewportSize({width,height:1000});
      for(const [index,id] of stages.entries()) {
        await page.locator(`[data-ry-stage="${id}"]`).first().click();
        await doubleText(page);
        await snapshot(page,`task-${index+1}-${width}-200pct`,false);
        await page.reload();
        await page.locator('html[data-ready=true]').waitFor({timeout:30000});
      }
    }
    const review=page.locator('[data-ry-action="review"]');
    if(await review.count()) {
      await review.click();
      await page.addScriptTag({path:AXE});
      await snapshot(page,'review-1440',true);
    }
  } finally {
    await browser.close();
    await fs.writeFile(path.join(OUT,'report.json'),JSON.stringify(report,null,2));
  }
  console.log(JSON.stringify({pages:report.pages.length,overflow:report.pages.filter(p=>p.metrics.scrollWidth>p.metrics.width+1).map(p=>p.name),banned:report.pages.filter(p=>p.bannedMatches.length).map(p=>({page:p.name,matches:p.bannedMatches})),axe:report.pages.filter(p=>p.axe?.violations.length).map(p=>({page:p.name,violations:p.axe.violations})),errors:report.errors},null,2));
})().catch(error=>{console.error(error);process.exitCode=1;});
