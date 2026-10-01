/* AUDIT 2026-09-06 (wave 9) — ONE-SHOT PROBE from an earlier round. NOT in the
 * acceptance suite: `tools/acceptance.js` does not run it and nothing depends on
 * it staying green. It protects no standing guarantee — it was written to measure
 * one thing once. Status when the whole directory was run: ERRORS — TypeError: fn is not a function.
 * Before trusting anything it prints, check its selectors and its route against
 * the app as it is now; most of this directory predates the two-lesson unit and
 * walks `#tour=thirty`, which has not been the default since wave 8. */
/* Shared helper: computed accessible name + role for every element matching a
   selector, straight out of Chromium's own accname implementation via CDP.
   (Playwright 1.62 removed page.accessibility.) */
async function axSession(page) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('DOM.enable');
  await cdp.send('Accessibility.enable');
  return cdp;
}

/** [{ tag, cls, role, name, text }] for every element matching `sel`. */
async function axFor(cdp, sel) {
  const { root } = await cdp.send('DOM.getDocument', { depth: -1, pierce: true });
  let nodeIds = [];
  try {
    ({ nodeIds } = await cdp.send('DOM.querySelectorAll', { nodeId: root.nodeId, selector: sel }));
  } catch (e) { return [{ error: String(e.message || e) }]; }
  const out = [];
  for (const nodeId of nodeIds) {
    let ax = null;
    try { ax = await cdp.send('Accessibility.getPartialAXTree', { nodeId, fetchRelatives: false }); } catch (e) { /* detached */ }
    const n = ax && ax.nodes && ax.nodes[0];
    const { node } = await cdp.send('DOM.describeNode', { nodeId });
    const attrs = {};
    for (let i = 0; node.attributes && i < node.attributes.length; i += 2) attrs[node.attributes[i]] = node.attributes[i + 1];
    out.push({
      tag: (node.nodeName || '').toLowerCase(),
      cls: attrs.class || '',
      role: n && n.role ? n.role.value : null,
      name: n && n.name ? String(n.name.value) : '',
      desc: n && n.description ? String(n.description.value) : '',
      ignored: n ? !!n.ignored : null,
      title: attrs.title || null,
      ariaLabel: attrs['aria-label'] || null,
    });
  }
  return out;
}

module.exports = { axSession, axFor };
