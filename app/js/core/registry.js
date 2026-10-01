/**
 * registry.js — mounts feature modules and keeps any one of them from taking
 * the atlas down with it.
 *
 * A module is a file at app/js/<area>/index.js with a default export:
 *
 *   export default {
 *     id: 'map',                       // required, unique
 *     slot: 'map',                     // optional; defaults to id. Must match a
 *                                      // data-mount="…" element in index.html
 *     requires: ['geo'],               // optional: 'geo' | 'data'
 *     async mount({ root, store, data, bus, format, util, url, registry }) {},
 *     update(state, prev, changed) {}, // called at most once per frame
 *     destroy() {},                    // must remove listeners and DOM
 *   };
 *
 * Guarantees the registry makes to a module:
 *   • `root` is always a real element in the document.
 *   • mount() is awaited; a rejected promise disables only that module.
 *   • update() is never called before mount() resolves, nor after destroy().
 *   • A module that throws three times in update() is switched off, loudly,
 *     once — never on every frame.
 */

export function createRegistry(context = {}) {
  /** @type {Map<string, {id,path,slot,mod,status,error,fails,root}>} */
  const entries = new Map();
  const log = [];

  const note = (level, message, detail) => {
    log.push({ level, message, detail: detail ? String(detail && detail.stack || detail) : '', at: Date.now() });
    return log[log.length - 1];
  };

  /**
   * Load modules by path, skipping missing files silently (another agent has
   * simply not landed theirs yet) and reporting broken ones loudly.
   * `probe` must be a function (url) => Promise<boolean>.
   */
  async function discover(candidates, probe) {
    const found = [];
    await Promise.all(candidates.map(async (c) => {
      const path = typeof c === 'string' ? c : c.path;
      const url = new URL(path, context.baseUrl || location.href).href;
      const there = await probe(url);
      if (!there) { entries.set(path, { id: path, path, status: 'absent' }); return; }
      let mod;
      try { mod = await import(/* @vite-ignore */ url); }
      catch (err) {
        entries.set(path, { id: path, path, status: 'failed', error: err });
        note('error', 'Module failed to load: ' + path, err);
        console.error('[registry] could not import ' + path, err);
        return;
      }
      const def = mod && (mod.default || mod.module);
      if (!def || typeof def.mount !== 'function') {
        entries.set(path, { id: path, path, status: 'invalid' });
        note('error', 'Module has no default export with mount(): ' + path);
        console.error('[registry] ' + path + ' must default-export { id, mount }');
        return;
      }
      found.push({ path, def });
    }));
    // Deterministic order: the order the caller listed them in.
    const order = new Map(candidates.map((c, i) => [typeof c === 'string' ? c : c.path, i]));
    found.sort((a, b) => order.get(a.path) - order.get(b.path));
    for (const { path, def } of found) {
      const id = def.id || path.replace(/^.*\/([^/]+)\/index\.js$/, '$1');
      entries.set(id, { id, path, slot: def.slot || id, mod: def, status: 'loaded', fails: 0 });
    }
    return found.length;
  }

  /** Register an already-imported module (used by tests and by bundled modules). */
  function register(def, path = '(inline)') {
    if (!def || typeof def.mount !== 'function') throw new TypeError('registry.register needs { id, mount }');
    entries.set(def.id, { id: def.id, path, slot: def.slot || def.id, mod: def, status: 'loaded', fails: 0 });
    return def.id;
  }

  /**
   * ONE SLOT, MANY MODULES, ONE ROOT EACH.
   *
   * Three slots in index.html are claimed by more than one module: `toolbar`
   * (tours, layers), `chrome-end` (viz, mechanism, quiz, teacher) and `overlay`
   * (historiography, search, onboarding). Until this pass they all received the
   * SAME element as `root`, and the contract above says a module owns its root
   * — so a module that legitimately calls `fill(root, …)` or
   * `root.replaceChildren()` deleted its neighbours' controls.
   *
   * Measured: app/js/teacher/index.js does `fill(ctx.root, this.entry)` and is
   * the last module to mount, so at every viewport it wiped the search door,
   * the chart entry, the quiz button and the mechanism entry out of the
   * masthead. They came back only because four separate pieces carry a
   * defensive re-append on `app:ready`. That is a shared-mutable-DOM bug wearing
   * four workarounds, and it made the order of the masthead unpredictable.
   *
   * So: the first claimant of a slot keeps the slot element itself — nothing
   * about a single-module slot changes, and `.stage__map > *` and friends keep
   * matching what they always matched. Every later claimant gets its own child
   * root, `display: contents` (layout.css, `.mount--sub`), so it generates no
   * box, participates in no layout, and cannot be reached by a neighbour's
   * `replaceChildren`. The order of the roots is the order of `areas` in
   * modules.json, which makes the masthead's reading order a decision rather
   * than a race.
   */
  function resolveRoot(entry) {
    const doc = context.document || document;
    const slot = doc.querySelector('[data-mount="' + entry.slot + '"]');
    if (!slot) {
      const host = doc.querySelector('[data-mount="overlay"]') || doc.querySelector('.app') || doc.body;
      const orphan = doc.createElement('div');
      orphan.className = 'mount mount--orphan';
      orphan.dataset.mount = entry.slot;
      orphan.dataset.mounted = entry.id;
      host.appendChild(orphan);
      note('warn', 'No slot data-mount="' + entry.slot + '" in index.html; created one in the overlay layer.');
      return orphan;
    }
    // Already claimed by an earlier module? Then this one gets its own root.
    if (slot.dataset.mounted && slot.dataset.mounted !== entry.id) {
      let sub = slot.querySelector(':scope > .mount--sub[data-mount-of="' + entry.id + '"]');
      if (!sub) {
        sub = doc.createElement('div');
        sub.className = 'mount mount--sub';
        sub.dataset.mountOf = entry.id;
        slot.appendChild(sub);
      }
      slot.dataset.shares = String(slot.querySelectorAll(':scope > .mount--sub').length + 1);
      return sub;
    }
    slot.dataset.mounted = entry.id;
    return slot;
  }

  function unmet(entry) {
    const needs = entry.mod.requires || [];
    if (needs.includes('geo') && !(context.data && context.data.geoAvailable)) return 'geometry is not available';
    if (needs.includes('data') && !(context.data && context.data.territories.length)) return 'the dataset is empty';
    return null;
  }

  /**
   * ISOLATION, MEASURED AGAINST THE FAILURE MODES WE HAVE ACTUALLY SEEN.
   *
   * Modules mount in the order they are listed, and each one is awaited so a
   * later module can rely on an earlier one being on screen. That is right, and
   * it has one consequence worth naming: a module whose `mount()` never settles
   * used to hold the whole boot open, and the reader got the loading screen for
   * ever. `MOUNT_TIMEOUT` bounds the wait, not the work. A module that has not
   * finished by then is recorded as `slow`, the boot carries on without it, and
   * if it settles later it takes up its place quietly (or is recorded failed).
   * Nothing is killed, because we cannot kill it; the atlas simply stops
   * waiting.
   *
   * A module that throws leaves its slot emptied, so a half-rendered panel is
   * never left standing in the layout looking like a finished one.
   */
  const MOUNT_TIMEOUT = 6000;

  function fail(entry, err, phase) {
    entry.status = 'failed';
    entry.error = err;
    note('error', 'Module "' + entry.id + '" failed while ' + phase, err);
    console.error('[registry] "' + entry.id + '" failed while ' + phase, err);
    try { entry.mod.destroy && entry.mod.destroy(); } catch (_) { /* already broken */ }
    if (entry.root) { try { entry.root.replaceChildren(); delete entry.root.dataset.mounted; } catch (_) {} }
  }

  async function mountAll(onStep) {
    const list = [...entries.values()].filter(e => e.status === 'loaded');
    let i = 0;
    for (const entry of list) {
      i++;
      const blocked = unmet(entry);
      if (blocked) {
        entry.status = 'skipped'; entry.error = blocked;
        note('warn', 'Skipped "' + entry.id + '": ' + blocked);
        continue;
      }
      onStep && onStep(entry.id, i, list.length);
      let started;
      try {
        entry.root = resolveRoot(entry);
        started = Promise.resolve(entry.mod.mount({ ...context, root: entry.root, registry: api, id: entry.id }));
      } catch (err) { fail(entry, err, 'mounting'); continue; }

      const t0 = performance.now();
      let timer;
      const timeout = new Promise(r => { timer = setTimeout(() => r('__slow__'), MOUNT_TIMEOUT); });
      let outcome;
      try { outcome = await Promise.race([started.then(() => '__ok__'), timeout]); }
      catch (err) { clearTimeout(timer); fail(entry, err, 'mounting'); continue; }
      clearTimeout(timer);

      if (outcome === '__ok__') {
        entry.status = 'mounted';
        entry.ms = Math.round(performance.now() - t0);
        continue;
      }
      // Still running. Let the atlas open; adopt it if and when it lands.
      entry.status = 'slow';
      note('warn', 'Module "' + entry.id + '" did not finish mounting in ' + MOUNT_TIMEOUT + 'ms; the atlas opened without it.');
      started.then(
        () => { if (entry.status === 'slow') { entry.status = 'mounted'; entry.ms = Math.round(performance.now() - t0); } },
        (err) => { if (entry.status === 'slow') fail(entry, err, 'mounting'); },
      );
    }
    return api;
  }

  /** Fan a state change out to every mounted module. Never throws. */
  function update(state, prev, changed) {
    for (const entry of entries.values()) {
      if (entry.status !== 'mounted' || typeof entry.mod.update !== 'function') continue;
      try { entry.mod.update(state, prev, changed); }
      catch (err) {
        entry.fails = (entry.fails || 0) + 1;
        if (entry.fails <= 3) console.error('[registry] "' + entry.id + '" threw in update()', err);
        if (entry.fails === 3) {
          entry.status = 'disabled';
          note('error', 'Module "' + entry.id + '" disabled after three failures in update()', err);
          console.error('[registry] "' + entry.id + '" disabled after three failures');
        }
      }
    }
  }

  function destroyAll() {
    for (const entry of entries.values()) {
      if (entry.status !== 'mounted' && entry.status !== 'disabled') continue;
      try { entry.mod.destroy && entry.mod.destroy(); }
      catch (err) { note('warn', 'destroy() threw in "' + entry.id + '"', err); }
      entry.status = 'destroyed';
      if (entry.root) { entry.root.replaceChildren(); delete entry.root.dataset.mounted; }
    }
  }

  function get(id) { return entries.get(id); }
  function has(id) { const e = entries.get(id); return !!e && e.status === 'mounted'; }

  /** A compact picture of what actually happened. Shown in the status bar. */
  function report() {
    const by = { mounted: [], failed: [], absent: [], skipped: [], disabled: [], invalid: [], loaded: [], slow: [] };
    for (const e of entries.values()) (by[e.status] || (by[e.status] = [])).push(e.id);
    return { ...by, log: [...log], ok: by.failed.length === 0 && by.invalid.length === 0 && by.disabled.length === 0 };
  }

  const api = { discover, register, mountAll, update, destroyAll, get, has, report, entries, context };
  return api;
}

export default createRegistry;
