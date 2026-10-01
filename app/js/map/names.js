/**
 * map/names.js — what to call a place in the year that is on the map.
 *
 * Round 1 labelled the 1913 plate with the names of 2026: Vanuatu for the New
 * Hebrides, Botswana for the Bechuanaland Protectorate, Kenya for the East
 * Africa Protectorate, United Arab Emirates for the Trucial States. That is not
 * a cosmetic slip. Naming is one of the things this subject is *about* — the
 * dataset carries `namesOverTime` with a `usedBy` field precisely so a student
 * can see who called a place what, and when — and a map that silently uses the
 * successor state's name teaches that the colony and the country are the same
 * object under one continuous title. They are not.
 *
 * The rule, in order:
 *   1  the name British officials used in this year, if the dataset records one;
 *   2  otherwise any contemporary English name in the window;
 *   3  otherwise the territory's own title in the dataset;
 *   4  and where the only contemporary name in the window is in another
 *      language, that name is carried alongside, because it is the one the
 *      people there used.
 *
 * The modern name is never dropped — it is what the student can find on a map
 * today — it just stops being the headline. Nothing here is invented: every
 * string returned comes out of the shard.
 *
 * ---------------------------------------------------------------------------
 * ROUND 5: THE RULE, STATED ONCE, AND THE OTHER END OF THE SAME ERROR.
 *
 *   A NAME PRINTED ON A PLATE FOR YEAR Y MUST BE DATEABLE TO Y BY THE DATASET.
 *
 * Round 1 fixed one half of this — the 1913 plate calling the New Hebrides
 * Vanuatu — and left the other half untouched, because every test it wrote ran
 * at one year. Swept across all 447 years the app can show, three paths were
 * still printing names the dataset itself dates outside the year on the plate:
 *
 *   · at 2020 the plate drew "Cape Colony" across the Republic of South
 *     Africa, and "Union of South Africa" across it in the group label.
 *     `usedBy: "modern"` entries were excluded from the headline ALWAYS, so a
 *     territory whose only recorded name for this year is the name it has
 *     today fell back to the atlas's own filing title — which for a colony is
 *     the colony's name, for ever;
 *   · the unit's own name was used whenever it was *attested* — meaning the
 *     string appears somewhere in the dataset — with no test of WHEN. That is
 *     how "Cape Colony" survived over ground the same record says has been the
 *     Republic since 1961;
 *   · and `shortName` — a modern index field with no dates on it at all — was
 *     substituted for any period name longer than 26 characters. At 1888 the
 *     Kenya plate resolved "Imperial British East Africa Company territory",
 *     which is right, and then printed "East Africa Protectorate", a name that
 *     did not exist until 1895.
 *
 * Three tests answer all three, and they are different strengths on purpose:
 *
 *   `dateable(name, year)`  — the dataset's own `namesOverTime` records for
 *      that string, anywhere in the dataset. true / false / null, where null
 *      means the dataset does not date the string and cannot judge it.
 *   `deadName(name, year)`  — the strong test, for a name that is a TERRITORY
 *      TITLE rather than a dated record: the title of a territory whose spans
 *      ended before `year`, where the dataset holds another name for `year`.
 *      "Cape Colony" in 2020 is dead. "New Hampshire" in 1784 is not — the
 *      colony ended, the name did not, and the dataset offers nothing else.
 *   `successorAt(territoryId, year)` — the name the dataset holds for that
 *      ground in `year` when the title is dead. It is never invented: if the
 *      shard has nothing for that year, the plate prints nothing, because a
 *      dead name is worse than a blank.
 * -------------------------------------------------------------------------*/

/**
 * Unit ids whose OWN name is younger than the geometry it labels.
 *
 * The geometry index is a modern file: it splits out the ground that is still
 * British today so the atlas can draw it, and it files that ground under the
 * name it acquired when it was split. `cy-akrotiri-dhekelia` is the case that
 * matters. The Sovereign Base Areas were created by the Treaty of
 * Establishment on 16 August 1960 — the same date the Cyprus record in this
 * dataset opens its "The Sovereign Base Areas stay British" span. Before that
 * date the ground existed and the name did not, so a 1913 plate that reads
 * "Akrotiri and Dhekelia, in Cyprus" is doing the exact thing this file exists
 * to stop: calling a place by its successor's name.
 *
 * `year` is the first year the name was in use; `was` is what to call the
 * ground before it, and `why` is printed to the student so the split is
 * legible as a decision of this atlas rather than as a fact about 1913.
 */
export const UNIT_NAME_FROM = {
  'cy-akrotiri-dhekelia': {
    year: 1960,
    was: null,          // fall back to the territory's own period name
    why: 'this atlas draws the two areas separately because they stayed British after 16 August 1960 as the Akrotiri and Dhekelia Sovereign Base Areas; before that date this ground had no separate name',
  },
};

const yearOf = (v) => {
  if (v == null) return null;
  const raw = typeof v === 'object' ? (v.value != null ? v.value : v.display) : v;
  const m = String(raw == null ? '' : raw).match(/-?\d{3,4}/);
  return m ? Number(m[0]) : null;
};

export function makeNamer(data) {
  const cache = new Map();          // territoryId -> normalised entries
  const out = new Map();            // territoryId + '@' + year -> resolved

  const entries = (t) => {
    let list = cache.get(t.id);
    if (list) return list;
    list = (t.namesOverTime || [])
      .filter((n) => n && n.name)
      .map((n) => ({
        name: String(n.name),
        from: yearOf(n.from), to: yearOf(n.to),
        usedBy: n.usedBy || '', language: n.language || '',
      }));
    cache.set(t.id, list);
    return list;
  };

  const norm = (s) => String(s || '').toLowerCase().replace(/^the\s+/, '').replace(/[^a-z]/g, '');

  /* =======================================================================
     ROUND 11 — THREE MORE WAYS A NAME CAN BE WRONG IN A YEAR, ALL SWEPT.

     `tools/scenarios/p02r11/anach.js` and `cover.js` walk 1580-2026, every
     painted unit, every string this module can put on a plate or in a screen
     reader's ear. Three classes survived rounds 5 and 10:

       F · THE TERRITORY DOES NOT HOLD THIS GROUND IN THIS YEAR, and its name
           was printed over it anyway. Eleven pairs, 385 unit-years. The
           dataset says so itself, in `geoCoverage`: Quebec held the Ohio
           country from 1 May 1775 to 3 September 1783 and no longer, so
           "Canada East" was printed across the American Old Northwest at
           every year from 1783 to 1867; Connacht, Leinster and Munster —
           three provinces of the Irish Free State — were labelled "Northern
           Ireland" from 1922; French Cameroun read "The British Cameroons"
           for forty-six years, French Togoland "British Togoland" for
           forty-two, and the Seychelles outer islands stayed "British Indian
           Ocean Territory" for half a century after they were given back in
           1976. A NAME IS A CLAIM ABOUT GROUND. If the record says the ground
           is not in the territory, the territory's name is not its name.

       G · A HISTORIC NAME THE DATASET LEFT OPEN, PRINTED AT THE PRESENT DAY.
           Round 10 refused a rule of thumb ("an open record goes stale after
           a century") and was right to: the Somers Isles in 1733 and Terra
           Nova in 1729 are the right names for those plates. But at 2020 the
           plate still read "The Somers Isles" over Bermuda and "Pitcairn's
           Island" over the Pitcairn Islands. The boundary is not the age of
           the record, it is where THE DATASET'S OWN ACCOUNT OF THAT GROUND
           RUNS OUT: past the last year anything in the territory's record is
           dated to, the plate is not a historical plate of that place any
           more, and a record with nothing after it is not evidence that
           anyone still uses the name. Then, and only then, and only when the
           geometry index and the atlas's filing title agree with each other
           and not with the record, the title wins and the old name moves to
           the hover card with its date on it.

       H · "(now X)", WHERE X IS NOT WHAT IT IS CALLED NOW. At 2020 a unit's
           accessible name read "Soomaaliya (Somalia) (now Italian
           Somaliland)": the headline was the modern name and the parenthesis
           printed the colonial one, so the sentence ran backwards. Same for
           "Oregon, Washington and Idaho (now Oregon Country)". The connector
           is chosen by direction now, and where one name contains the other
           there is no parenthesis at all.
     ==================================================================== */

  /** Two names for the same place? Containment either way, ignoring case,
      accents, punctuation and a leading "the". */
  const sameName = (a, b) => {
    const x = norm(a), y = norm(b);
    return !!x && !!y && (x === y || x.includes(y) || y.includes(x));
  };

  /* --- F · what ground a territory actually holds, in this year --------- */

  const covCache = new Map();
  /**
   * The units this territory holds in `year`, from the dataset's own dated
   * `geoCoverage`. When the territory is not active in this year — a ghost on
   * the plate, drawn as formerly British — the answer is the ground it held
   * when it ended, because that is the ground its successor name is about.
   */
  function coverAt(tid, year) {
    const key = tid + '@' + year;
    if (covCache.has(key)) return covCache.get(key);
    let list = [];
    /* `.active` MATTERS. `territoryAt` returns a record whatever the year: when
       no span covers the year its `units` field falls back to every unit the
       territory ever held, so an inactive territory appeared to cover
       everything and this test passed for the American Old Northwest in 1930.
       Ask for the span, not for the record. */
    const at = data.territoryAt ? data.territoryAt(tid, year) : null;
    const live = at && at.active && data.unitsOf ? data.unitsOf(tid, year) : null;
    if (live && live.length) list = live;
    else {
      const t = data.byId && data.byId.get(tid);
      const gc = (t && t.geoCoverage) || [];
      list = gc.length ? (gc[gc.length - 1].units || []) : ((t && t.units) || []);
    }
    covCache.set(key, list);
    return list;
  }

  /** No coverage statement is no objection; a statement that omits the unit is. */
  function covers(tid, unitId, year) {
    if (!tid || !unitId) return true;
    const list = coverAt(tid, year);
    return !list || !list.length || list.indexOf(unitId) >= 0;
  }

  /**
   * The last stretch during which the dataset says this territory held this
   * ground: `{ to, mid }`. `mid` is the year the "in X until Y" clause is
   * named from, and it is the middle of the stretch rather than its last day
   * on purpose — a name often changes on the same date the ground goes, so
   * asking at the boundary gets the successor's name. Measured: Connacht left
   * `ireland` in 1922 and the record's next name, "Northern Ireland", starts
   * in 1921, so the boundary answered "in Northern Ireland until 1922" about
   * three counties of Connacht. The middle of 1801-1922 answers "Ireland".
   */
  function lastCovered(tid, unitId) {
    const t = data.byId && data.byId.get(tid);
    const gc = (t && t.geoCoverage) || [];
    let best = null;
    for (const g of gc) {
      if (!g || !(g.units || []).includes(unitId)) continue;
      const a = yearOf(g.from), e = yearOf(g.to);
      const to = e == null ? Infinity : e;
      if (best && best.to > to) continue;
      best = { to, mid: a != null && e != null ? Math.round((a + e) / 2) : (a != null ? a : e) };
    }
    return best;
  }

  /** Another territory in this atlas that DOES hold this ground in `year`. */
  function holderOf(unitId, year, notTid) {
    const list = (data.territoriesForUnit ? data.territoriesForUnit(unitId) : []) || [];
    let fallback = null;
    for (const t of list) {
      const id = t && (t.id || t);
      if (!id || id === notTid) continue;
      if (!covers(id, unitId, year)) continue;
      const at = data.territoryAt ? data.territoryAt(id, year) : null;
      if (at) return id;
      if (!fallback) fallback = id;
    }
    return fallback;
  }

  /* --- G · where the dataset's account of this ground runs out ---------- */

  const horizons = new Map();
  /**
   * The last year anything in this territory's own record is dated to —
   * a name, a span, an acquisition, a departure, a referendum. Past it the
   * atlas has nothing further to say about the place, so a plate of that year
   * is the present day rather than a year in this territory's history.
   */
  function horizon(tid) {
    if (horizons.has(tid)) return horizons.get(tid);
    const t = data.byId && data.byId.get(tid);
    let mx = 0;
    const seen = new Set();
    const walk = (o, depth) => {
      if (!o || typeof o !== 'object' || depth > 8 || seen.has(o)) return;
      seen.add(o);
      if (Array.isArray(o)) { for (const v of o) walk(v, depth + 1); return; }
      for (const [k, v] of Object.entries(o)) {
        if (k === 'from' || k === 'to' || k === 'date' || k === 'signed' || k === 'start' || k === 'end') {
          const y = yearOf(v);
          if (y && y < 2100 && y > mx) mx = y;
        }
        if (k === 'year' && typeof v === 'number' && v < 2100 && v > mx) mx = v;
        walk(v, depth + 1);
      }
    };
    walk(t, 0);
    horizons.set(tid, mx);
    return mx;
  }

  /**
   * Is the headline a historic name the dataset left open, printed past the
   * end of its own account, over ground whose modern name the geometry index
   * and the atlas's filing title agree on? Returns the name to print instead,
   * or null. Deliberately narrow: measured across 1580-2026 it fires on
   * Bermuda from 2011 and the Pitcairn Islands from 2009 and on nothing that
   * was right before.
   */
  function staleHeadline(p, unitName, tid, year) {
    if (!p || !p.pickedRec || !unitName) return null;
    const r = p.pickedRec;
    if (r.to != null) return null;
    if (r.usedBy !== 'british-official' && r.usedBy !== 'other-european') return null;
    if (year <= horizon(tid)) return null;
    const t = data.byId && data.byId.get(tid);
    if (!t || !t.name) return null;
    if (sameName(p.name, unitName)) return null;
    if (!sameName(t.name, unitName)) return null;
    if (deadName(unitName, year) || deadName(t.name, year)) return null;
    return t.name;
  }

  /**
   * H — WHAT THIS GROUND IS CALLED NOW, for the "(now X)" parenthesis.
   *
   * "now" is a promise about the present day, and it was being kept with
   * whatever string the geometry index happened to file the ground under: at
   * 1795 the plate said "Cape of Good Hope (now Cape Colony)" — a colony that
   * ended in 1910 — and at 1968 "Mayyun (now Perim)", a name the dataset's own
   * record closes in 1967. The dataset holds the answer for every year,
   * including this one, so it is asked for the answer at TODAY. Where it has
   * none and the unit's own title cannot be dated to today either, there is no
   * parenthesis: a sentence with no "now" clause teaches less than one with a
   * wrong "now" clause teaches wrongly.
   */
  const TODAY = (data.bounds && data.bounds.max) || 2026;
  function nowName(territoryId, unitName, headline) {
    const succ = successorAt(territoryId, TODAY);
    if (succ && !sameName(succ, headline)) return succ;
    if (succ && sameName(succ, headline)) return null;
    if (unitName && dateable(unitName, TODAY) !== false && !deadName(unitName, TODAY)
      && !sameName(unitName, headline)) return unitName;
    return null;
  }

  /** "Quebec / Quebec" is one name written twice. */
  const oneName = (s) => {
    if (!s || s.indexOf(' / ') < 0) return s;
    const parts = String(s).split(' / ');
    const out = [];
    for (const part of parts) if (!out.some((o) => norm(o) === norm(part))) out.push(part);
    return out.join(' / ');
  };

  /* ---------------------------------------------------------------------
     THE THREE DATE TESTS. Built once, lazily, from the shards themselves.

     `dated`   every string the dataset puts a DATE on — every namesOverTime
               record, anywhere in the dataset, because a name recorded on one
               territory dates that name for the neighbour that shares it.
     `titles`  every string the dataset uses as a territory TITLE, with the
               union of that territory's own spans and its own dated names.
               A title is not a dated name: it is this atlas's filing label,
               and the only thing that can kill it is the dataset saying, in
               the same record, that the ground is called something else now.
     -------------------------------------------------------------------- */
  let dated = null, titles = null;
  const buildIndex = () => {
    if (dated) return;
    dated = new Map();
    titles = new Map();
    for (const t of data.territories || []) {
      const list = entries(t);
      for (const n of list) {
        /* A SLASH LIST IS A LIST OF NAMES. The shards record several of these
           — "Mauritius / Maurice / Moris", British-official from 3 December
           1810 — and indexing only the whole string meant the plain word
           "Mauritius" was dated ONLY by the Dutch record that ends in 1715, so
           the strict test called it dead in 1900 and the plate stopped saying
           it. Each alternative is indexed as the name it is. */
        for (const part of [n.name, ...String(n.name).split(' / ')]) {
          const k = norm(part);
          if (!k) continue;
          if (!dated.has(k)) dated.set(k, []);
          dated.get(k).push({ from: n.from, to: n.to });
        }
      }
      let last = null;
      for (const sp of t.spans || []) {
        const b = yearOf(sp.end);
        if (b == null) last = Infinity; else if (last !== Infinity) last = last == null ? b : Math.max(last, b);
      }
      for (const title of [t.name, t.shortName, t.formalName]) {
        const k = norm(title);
        if (!k) continue;
        if (!titles.has(k)) titles.set(k, []);
        titles.get(k).push({ id: t.id, last, list });
      }
    }
  };

  /**
   * dateable(name, year) -> true | false | null
   * Does the dataset date this string, and does that dating cover `year`?
   * null means it does not date the string and has no opinion.
   */
  function dateable(name, year) {
    buildIndex();
    const recs = dated.get(norm(name));
    if (!recs || !recs.length) return null;
    return recs.some((r) => (r.from == null || year >= r.from) && (r.to == null || year <= r.to));
  }

  /**
   * deadName(name, year) -> boolean — the strong test, for a TITLE.
   *
   * True when the dataset dates the string and `year` is outside those dates;
   * or when the string is the title of a territory whose spans had ended
   * before `year` AND that territory's own record holds a different name for
   * `year`. "Cape Colony" in 2020 is dead: the record says Cape Province, then
   * Republic of South Africa. "New Hampshire" in 1784 is not: the colony ended
   * in 1783, the name did not, and the dataset offers nothing in its place.
   * A name is never called dead because this atlas has nothing better to say.
   */
  function deadName(name, year) {
    if (!name) return false;
    const d = dateable(name, year);
    if (d === true) return false;
    if (d === false) return true;
    buildIndex();
    const rows = titles.get(norm(name));
    if (!rows) return false;
    /* Every territory that files under this title has to agree it is over, AND
       the record has to hold the name the ground has NOW. Anything weaker
       fires on every title in the atlas the moment Britain leaves: almost
       every shard carries an open-ended endonym, so "Bhutan" after 1949 would
       have become "Druk Yul", "Kuwait" after 1961 "Al-Kuwait" and the Bahamas
       after 1973 "Islas de Bajamar" — measured, all three, on the sweep. A
       colony ending is not a name dying. */
    return rows.every((row) => {
      if (row.last == null || row.last === Infinity || year <= row.last) return false;
      return row.list.some((n) => n.usedBy === 'modern' && norm(oneName(n.name)) !== norm(oneName(name))
        && (n.from == null || year >= n.from) && (n.to == null || year <= n.to));
    });
  }

  /**
   * supersededTitle(name, year) -> boolean.
   *
   * The narrower question the multi-unit branch of `short()` asks, and the one
   * "Cape Colony over the Republic of South Africa" needed: is this string the
   * title of a colony that had ENDED by `year`, on ground the dataset itself
   * records as being called something else now? It differs from `deadName` in
   * one way — the successor name need not still be current in `year`, because
   * the caller already has a name for `year` (the enclosing territory's) and is
   * only asking whether the sub-unit's colonial title may stand instead of it.
   * "Cape Colony" is superseded from 1911; "New Hampshire" in 1784 is not,
   * because nothing in that shard says the place is called anything else.
   */
  function supersededTitle(name, year) {
    if (!name) return false;
    buildIndex();
    const rows = titles.get(norm(name));
    if (!rows || !rows.length) return false;
    /* AND "Quebec / Quebec" IS NOT A DIFFERENT NAME FROM "Quebec". The shard
       records the province's modern name in French and English and the two are
       the same word, so a raw string comparison read it as a successor and the
       plate's screen reader said "Dominion of Canada (the former Quebec)" in
       1900 about a province that is still there. Compare the names, not the
       punctuation between them. */
    return rows.every((row) => row.last != null && row.last !== Infinity && year > row.last
      && row.list.some((n) => n.usedBy === 'modern' && norm(oneName(n.name)) !== norm(oneName(name))));
  }

  /**
   * supersededOpen(list, rec, year) -> boolean.
   *
   * ROUND 10. THE OTHER END OF "NO START DATE, NO HEADLINE".
   *
   * A `namesOverTime` record with no `to` is not a claim that the name is
   * still in use; it is the dataset declining to say when it stopped. Round 5
   * read it as permanence, and at 2020 the South Atlantic carried Cook's 1775
   * name — "Isle of Georgia", `usedBy: british-official`, `from` 17 January
   * 1775, no end — as the headline for the island, on the mark beside a second
   * mark reading "South Georgia". One island, two names, in the same frame,
   * one of them eighteenth-century, on a plate of the twenty-first.
   *
   * The temptation is a rule of thumb — "an open record goes stale after a
   * century" — and it was measured before it was written: swept across 1580 to
   * 2026 it moved 26 headlines, and it was WRONG on most of them. The Somers
   * Isles in 1733, Terra Nova in 1729, Buganda in 1890 and Lemain Island in
   * 1823 are the right names for those plates, and every one of them is an
   * open record more than a century old. A century is not evidence.
   *
   * What IS evidence is the dataset's own next record. Where a territory's
   * shard opens a LATER name — in any language, used by anyone — the earlier
   * open record has stopped being the last thing the dataset knows about what
   * this place is called, and from that later year it no longer supplies the
   * headline. It still supplies the hover and the dossier, with its date and
   * its note on it, which is where "named by Cook for George III" teaches
   * something. For South Georgia the later record is Argentina's, from 1927;
   * so the plate says Isle of Georgia in 1900 and South Georgia in 2020, and
   * neither year is told the other's name.
   *
   * It can only ever fire on a record the dataset left open. A record with an
   * end date is bounded already and this function never sees it.
   */
  function supersededOpen(list, rec, year) {
    if (!rec || rec.to != null || rec.from == null) return false;
    return list.some((n) => n !== rec && n.from != null && n.from > rec.from && n.from <= year
      && norm(n.name) !== norm(rec.name)
      /* AND THE LATER RECORD HAS TO STILL BE IN FORCE. Measured: without this
         clause the rule fired on every year after a later record OPENED, even
         where that record had since closed, and it took four names off the
         plate that nothing replaced. Perim is the clean case — "Mayyun",
         local Arabic, from 1500 and never closed; "Perim", British official,
         1799 to 1967 — and the island went unnamed from 1968, in the years
         when Mayyun is the only name anyone uses. New York was worse: "New
         Orange", the Dutch name for fifteen months in 1673-74, silenced the
         English record for two and a half centuries and the plate labelled the
         colony "Vermont". A name is superseded while something else is being
         used, not for ever because something else once was. */
      && (n.to == null || year <= n.to));
  }

  /**
   * successorAt(territoryId, year) -> the name the DATASET holds for this
   * ground in this year when the filing title is dead, or null. Preference:
   * the name in use today, then a British-official or English name, then the
   * name the people there used. Nothing is invented; null means the plate
   * prints nothing, which is the honest answer and better than a dead name.
   */
  function successorAt(territoryId, year) {
    const t = data.byId && data.byId.get(territoryId);
    if (!t) return null;
    const all = entries(t);
    const win = all.filter((n) => (n.from == null || year >= n.from) && (n.to == null || year <= n.to))
      .filter((n) => !supersededOpen(all, n, year));
    if (!win.length) return null;
    const rank = (n) => (n.usedBy === 'modern' ? 0 : n.usedBy === 'british-official' ? 1 : n.language === 'English' ? 2 : 3);
    return win.slice().sort((a, b) => rank(a) - rank(b) || (b.from || 0) - (a.from || 0))[0].name;
  }

  /**
   * periodName(territoryId, year) ->
   *   { name, modern, local, formal, source } | null
   * `name` is what the map should say. `local` is set only when the only
   * contemporary name recorded is not English.
   */
  function periodName(territoryId, year) {
    if (!territoryId) return null;
    const key = territoryId + '@' + year;
    if (out.has(key)) return out.get(key);
    const t = data.byId && data.byId.get(territoryId);
    if (!t) { out.set(key, null); return null; }
    const list = entries(t);
    const inWindow = list.filter((n) => (n.from == null || year >= n.from) && (n.to == null || year <= n.to))
      .filter((n) => !supersededOpen(list, n, year));
    const official = inWindow.find((n) => n.usedBy === 'british-official');
    const english = inWindow.find((n) => n.language === 'English' && n.usedBy !== 'modern');
    const modernEntry = list.find((n) => n.usedBy === 'modern');
    const nonEnglish = inWindow.find((n) => n.language && n.language !== 'English' && n.usedBy !== 'modern');
    /* THE NAME A PLACE HAS TODAY IS A CONTEMPORARY NAME IN A YEAR THAT IS
       TODAY. `modern` entries were excluded from the headline at every year,
       which is right for 1913 — a plate of 1913 must not say Zambia — and
       wrong for 2020, where it is the ONLY name the dataset records as in use.
       With nothing else in the window the fallback was the atlas's own filing
       title, so the 2020 plate printed "Union of South Africa" and, unit by
       unit, "Cape Colony", over the Republic. A modern name is taken only when
       no British-official and no contemporary English name covers the year,
       and only from the year the dataset says it starts. */
    /* AND IT NEEDS A DATE OF ITS OWN. An undated `modern` entry — and the
       shards hold plenty, "Mauritius / Maurice / Moris" among them — covers
       every year there is, so accepting one without a `from` would put the
       name of 2026 on the plate of 1810: round 1's defect, re-entering by the
       door round 1 built. No start date, no headline. */
    const modernNow = (!official && !english && modernEntry && modernEntry.from != null
      && year >= modernEntry.from
      && (modernEntry.to == null || year <= modernEntry.to)) ? modernEntry : null;
    const picked = official || english || modernNow || null;
    const rec = {
      name: oneName(picked ? picked.name : (t.name || null)),
      /* The record the headline came from, so a caller can ask what KIND of
         name it is holding — dated or open, whose, and from when. Round 11's
         present-day test (G) needs all three. */
      pickedRec: picked || null,
      source: picked ? (picked.usedBy === 'british-official' ? 'the name British officials used'
        : picked.usedBy === 'modern' ? 'the name this place has today'
        : 'a name in use in this year')
        : 'the title this atlas files the territory under',
      // Only worth saying when it is actually a different word.
      local: nonEnglish && nonEnglish.name !== (picked ? picked.name : (t.name || '')) ? nonEnglish : null,
      picked: !!picked,               // was a CONTEMPORARY name found for this year?
      modern: modernEntry ? modernEntry.name : null,
      formal: t.formalName || null,
      territoryName: t.name || null,
      unitCount: (t.units || []).length,
      /* Set only when `picked` is false: the atlas's filing title is a name
         this dataset's own dates contradict in this year, and here is what it
         holds instead — or null, in which case the plate says nothing. */
      dead: !picked && deadName(t.name, year),
      successor: !picked ? oneName(successorAt(territoryId, year)) : null,
    };
    out.set(key, rec);
    return rec;
  }

  /**
   * Every place name this dataset can DATE.
   *
   * The geometry index is a modern file: it calls a shape `in-odisha`,
   * `in-maharashtra`, `zm-northern-rhodesia` and prints Odisha, Maharashtra
   * and Zambia. Those are the names of 2026. The only names this atlas can put
   * a year on are the ones in the shards — a territory's own title, its formal
   * name, and every entry in `namesOverTime`. So the rule for a unit inside a
   * larger territory is: use the unit's own name only if the dataset attests
   * it somewhere as a name for a place; otherwise say what the territory was
   * called in this year, which is a name with a date on it. "Odisha" in 1913
   * becomes "Bengal Presidency"; "Assam", "Mysore", "Sindh" and "Elmina" are
   * attested and stay.
   */
  let attested = null;
  const isAttested = (name) => {
    if (!attested) {
      attested = new Set();
      for (const t of data.territories || []) {
        for (const n of [t.name, t.formalName, t.shortName]) if (n) attested.add(norm(n));
        for (const n of t.namesOverTime || []) if (n && n.name) attested.add(norm(n.name));
      }
    }
    return attested.has(norm(name));
  };

  /**
   * label(unitId, territoryId, year) -> the words on the focus ring and in the
   * screen reader's ear, in this year's language.
   */
  function label(unitId, territoryId, year) {
    const unitName = (data.unitName ? data.unitName(unitId) : null) || unitId;
    const p = periodName(territoryId, year);
    const anach = UNIT_NAME_FROM[unitId];
    if (anach && year < anach.year) {
      // The ground is here; the name is not yet. Say the territory's own
      // period name, and carry the reason so the dossier and the screen
      // reader can explain the split rather than hide it.
      const base = anach.was || (p && p.name) || unitName;
      return { text: base, period: p, modern: unitName, anachronism: anach.why, notYet: unitName };
    }
    if (!p || !p.name) return { text: unitName, period: null, modern: null };
    /* F — THE TERRITORY DOES NOT HOLD THIS GROUND IN THIS YEAR. Spoken, this
       was the worst of the three: "Connacht, in Northern Ireland" in 1930,
       "Old Northwest, in Canada East" in 1847. The ground is named, and the
       territory it once belonged to is dated rather than asserted. */
    if (!covers(territoryId, unitId, year)) {
      const alt = holderOf(unitId, year, territoryId);
      if (alt) return label(unitId, alt, year);
      const back = lastCovered(territoryId, unitId);
      const then = back && back.to !== Infinity ? periodName(territoryId, back.mid) : null;
      if (then && then.name && !sameName(then.name, unitName)) {
        return { text: `${unitName}, in ${then.name} until ${back.to}`, period: p, modern: null, until: back.to };
      }
      return { text: unitName, period: p, modern: null, until: back ? back.to : null };
    }
    /* G — a historic name the dataset left open, printed past the end of its
       own account. The old name is carried on `stale` so the hover card can
       still teach it, with its date. */
    const stale = staleHeadline(p, unitName, territoryId, year);
    if (stale) return { text: stale, period: p, modern: null, stale: { name: p.name, from: p.pickedRec.from } };
    /* AND THE SPOKEN NAME TAKES THE SAME SUCCESSOR THE PLATE DOES. `short()`
       drops a filing title the dataset's own dates contradict and prints what
       the record holds instead; `label()` did not, so the plate read
       "Abeokuta" and the screen reader "Egba United Government (now Southern
       Nigeria)" over the same ground in the same second. */
    const headline = (!p.picked && p.dead && p.successor) ? p.successor : p.name;
    const same = sameName(headline, unitName);
    if (same) return { text: unitName, period: p, modern: null };
    // One unit, one territory: the period name is the headline and the modern
    // name is the parenthesis. A unit inside a larger territory keeps its own
    // geography and takes the period name as the answer to "whose was it".
    /* AND THE SPOKEN NAME IS A NAME TOO. "Cape Colony, in Republic of South
       Africa" is a present tense about a colony that ended in 1910. Where the
       sub-unit's own title is superseded, the sentence says so instead: the
       ground first, the dead name second, and the word that dates it. */
    /* H — AND THE CONNECTOR IS CHOSEN BY DIRECTION. "now" is a promise that
       what follows is the name today. Where the headline is ALREADY the
       modern name, the unit's own title is the older one and the sentence has
       to run the other way: at 2020 this said "Soomaaliya (Somalia) (now
       Italian Somaliland)" and "Oregon, Washington and Idaho (now Oregon
       Country)". */
    const headlineIsNow = !!(p.pickedRec && p.pickedRec.usedBy === 'modern')
      || (p.modern && sameName(p.modern, p.name));
    const now = headlineIsNow ? null : nowName(territoryId, unitName, headline);
    const text = p.unitCount <= 1
      ? (headlineIsNow ? `${headline} (formerly ${unitName})` : (now ? `${headline} (now ${now})` : headline))
      : (supersededTitle(unitName, year) ? `${headline} (the former ${unitName})` : `${unitName}, in ${headline}`);
    return { text, period: p, modern: now || unitName };
  }

  /**
   * short(unitId, territoryId, year) -> the words that fit ON the plate.
   *
   * A label drawn on a map has room for a name and nothing else, so the
   * parentheses that `label()` carries for the screen reader are dropped here.
   * The rule is unchanged: the name in use in this year wins, and where the
   * unit's own name is younger than the year it is not used at all.
   */
  function short(unitId, territoryId, year, opts = {}) {
    const unitName = (data.unitName ? data.unitName(unitId) : null) || unitId;
    const anach = UNIT_NAME_FROM[unitId];
    const p = periodName(territoryId, year);
    if (anach && year < anach.year) return (anach.was || (p && p.name) || unitName);
    /* THE UNIT'S OWN NAME IS ALSO A NAME, AND IT IS ALSO DATED. Every branch
       below that can return `unitName` goes through this first: the geometry
       index is a modern file and the strings in it are the strings of 2026. */
    const unitDead = deadName(unitName, year);
    const fallback = () => {
      if (!unitDead) return unitName;
      const succ = successorAt(territoryId, year);
      // Nothing dateable to say. A blank is honest; a dead name is not.
      return succ && norm(succ) !== norm(unitName) ? succ : null;
    };
    if (!p || !p.name) return fallback();
    /* F — THE TERRITORY DOES NOT HOLD THIS GROUND IN THIS YEAR. Measured
       across 1580-2026: eleven (territory, unit) pairs and 385 unit-years,
       including "Canada East" over the American Old Northwest at every year
       from 1783, "Northern Ireland" over Connacht, Leinster and Munster from
       1922, "The British Cameroons" over French Cameroun for forty-six years
       and "British Indian Ocean Territory" over the Seychelles outer islands
       for half a century after they were handed back. The ground's own name
       comes first here, because it is the ground that is being named; the
       territory it used to be in is dated in the spoken label instead. */
    if (!covers(territoryId, unitId, year)) {
      const alt = holderOf(unitId, year, territoryId);
      if (alt) return short(unitId, alt, year, opts);
      if (!unitDead) return oneName(unitName);
      const back = lastCovered(territoryId, unitId);
      const then = back && back.to !== Infinity ? periodName(territoryId, back.mid) : null;
      return then && then.name ? oneName(then.name) : null;
    }
    /* G — the present-day plate: a historic name the dataset left open,
       printed past the end of its own account of this ground. */
    const stale = staleHeadline(p, unitName, territoryId, year);
    if (stale) return oneName(stale);
    // A unit that is no longer held is named by the territory this atlas files
    // it under — which is right for South West Africa in 1960 and wrong for the
    // Anglo-Egyptian Sudan in 1960, four years after it stopped existing. So
    // when the caller says the territory is only a fallback, the period name
    // is used ONLY if the dataset records that name as in use in this year.
    if (opts.strict && !p.picked) return fallback();
    /* THE TERRITORY'S NAME, AND ONE GATE IN FRONT OF ALL THREE WAYS TO IT.
       `periodName` falls back to the atlas's filing title when no dated name
       covers the year, and for a colony that title is the colony's name for
       ever: at 2020 this printed "Cape Colony" over the Republic of South
       Africa, and at 1898 "Anglo-Egyptian Sudan" over the Mahdist state, a
       year before the condominium existed. Where the dataset holds a name for
       the year, that name is printed; where it holds none, nothing is. */
    const territoryName = () => oneName((p.picked || !p.dead) ? p.name : (p.successor || fallback()));
    // One unit, one territory: the territory's period name IS the place.
    if (p.unitCount <= 1) return territoryName();
    // A unit inside a bigger territory keeps its own geography — Bengal inside
    // British India is Bengal — as long as the dataset can date the name.
    if (p.modern && norm(p.modern) === norm(unitName)) return territoryName();
    /* ATTESTED IS NOT DATED — the round-5 correction. `isAttested` asks only
       whether the string appears somewhere in the dataset, so "Cape Colony"
       passed it in every year from 1580 to 2026. It has to pass the date too. */
    if (!isAttested(unitName) || unitDead || (p.picked && supersededTitle(unitName, year))) return territoryName();
    /* ONE TERRITORY, ONE NAME — the round-10 rule, and the other half of the
       South Georgia defect.

       The geometry index files one unit of a territory under the territory's
       own title: `south-georgia` inside "South Georgia", `quebec` inside
       "Quebec". That unit therefore printed the atlas's filing title while
       every sibling with no dated name of its own printed the territory's
       PERIOD name — two names for one territory, side by side, and a reader
       who sees two places. Measured across 1580-2026 it happened to twenty
       territories: "South Georgia" beside "Isle of Georgia" in 1908, "Quebec"
       beside "Canada East" in 1842, "Quebec" beside "Province of Quebec" in
       1763, "Massachusetts" beside "Massachusetts Bay Colony" in 1691.

       A title is not a name for a part. Where the dataset has a dated name for
       the territory in this year, the part takes it too, and `_drawLabels`
       de-duplicates the pair down to one label — so the plate says "Canada
       East" once in 1842, and "South Georgia" once in 2020, and never both. */
    if (p.picked && p.territoryName && norm(unitName) === norm(p.territoryName)
      && norm(p.name) !== norm(unitName)) return territoryName();
    return oneName(unitName);
  }

  return { periodName, label, short, dateable: (tid, name, year) => dateable(name, year), deadName, supersededTitle, successorAt, covers, coverAt, lastCovered, holderOf, horizon, staleHeadline, sameName, oneName };
}

export default { makeNamer, UNIT_NAME_FROM };
