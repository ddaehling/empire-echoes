/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: runs clean.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/** p10r3-source — the source-reasoning item: the document with nothing said
 *  about it, the student's own four sentences, then the atlas's four. */
module.exports = async ({ page, shot, log }) => {
  await page.goto('http://localhost:8777/app/#year=1835&sel=bengal-presidency', { waitUntil: 'load' });
  await page.waitForTimeout(2600);
  const opened = await page.evaluate(() => window.BEA.quiz.open('src-macaulay-1835'));
  log('opened: ' + opened);
  if (!opened) { log('ITEM DID NOT RESOLVE — dropped: ' + JSON.stringify(await page.evaluate(() => window.BEA.quiz.dropped()))); return; }
  await page.waitForTimeout(600);
  const before = await page.evaluate(() => {
    const g = (s) => { const e = document.querySelector(s); return e ? e.textContent.replace(/\s+/g, ' ').trim() : null; };
    return {
      question: g('.qz .cx-ask__q'), quote: g('.qz-doc__q'), by: g('.qz-doc__by'),
      leaks: /nature|origin|purpose|cannot tell/i.test(document.querySelector('.qz').textContent) ? 'ATLAS FIELDS VISIBLE BEFORE COMMIT' : 'none visible',
      h: Math.round(document.querySelector('.qz').getBoundingClientRect().height),
    };
  });
  log('QUESTION: ' + before.question);
  log('QUOTE: ' + String(before.quote).slice(0, 140) + '…');
  log('BY: ' + before.by);
  log('leak check: ' + before.leaks);
  await shot('source-asked');
  await page.evaluate(() => {
    const ta = document.querySelector('.qz-ta');
    ta.value = 'A letter from a king. Written in 1889 after the concession. He wanted it cancelled. It cannot tell you what was actually said at the signing.';
    ta.dispatchEvent(new Event('input', { bubbles: true }));
    document.querySelector('.qz__commit').click();
  });
  await page.waitForTimeout(900);
  const after = await page.evaluate(() => {
    const g = (s) => { const e = document.querySelector(s); return e ? e.textContent.replace(/\s+/g, ' ').trim() : null; };
    return {
      wrote: g('.qz__said'), model: g('.qz__truth'),
      checks: [...document.querySelectorAll('.qz-check__o span')].map((e) => e.textContent.trim()),
      heads: [...document.querySelectorAll('.qz__truth .qz__modelhead')].map((e) => e.textContent.trim()),
    };
  });
  log('WROTE: ' + after.wrote);
  log('HEADS: ' + JSON.stringify(after.heads));
  log('MODEL: ' + String(after.model).slice(0, 420) + '…');
  log('CHECKLIST: ' + after.checks.length + ' — ' + after.checks.join(' | ').slice(0, 260));
  await shot('source-answered');
};
