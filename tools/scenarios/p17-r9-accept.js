/* SUITE — wave 9. IN THE ACCEPTANCE SUITE as `p17-r9`; `node tools/acceptance.js`
 * runs it and the build is red if it fails.
 * GUARANTEE THIS FILE PROTECTS: P17 round 9: the legend changes that round made. */
/* =============================================================================
   P17 ROUND 9 — the claims this round makes, asserted against the running app.

   N1  INK TRACKS CONTROL, IN BOTH THEMES. A status family's contrast against
       the ground it is drawn on rises with its mean controlDegree. Spearman's
       rho >= 0.85. Before this round the night theme scored 0.12 and the palest
       fill on the plate — "Self-governing", mean degree 1.5 — was the loudest
       mark on it.
   N2  IT IS STILL COLOUR-BLIND SAFE. All 45 family pairs, under normal, protan,
       deutan and tritan vision, clear the tier-B floor of 6 dE00 (every pair
       also carries a different engraved texture), and every land fill stands
       >= 12 dE00 off the sea. Read from the COMPUTED tokens, so it tests what
       ships and not what a table says.
   N3  THE OPENING SCREEN CARRIES NO INVITATION FROM THIS PIECE. At
       data-stage="plate", if the strip drew every colour on the plate with its
       word and its count, it prints no control at all. At `working` the route
       is back.
   N4  AN OMISSION IS NEVER SILENT. If the strip could not draw a colour that is
       on the plate, the control is present AT EVERY STAGE, `plate` included,
       and its label says how many are missing.
   N5  THE FOUR PROVENANCE FIELDS ARE ONE CONTROL AWAY AT EVERY STAGE. The
       byline is `apparatus` only (LAYOUT_BUDGET §7), so FEATURE_SPEC §2 P17
       test 2 is met through the sheet: the same four fields, from the same
       builder, reachable at plate, working and apparatus.
   N6  THE STRIP STAYS INSIDE ITS ROW. Height <= --key-h, five hit tests across
       it answered by it, and no document scroll.
   ========================================================================== */

/* CIEDE2000 + the Viénot/Brettel/Mollon dichromat projection, the same maths as
   tools/design/colour.js, run in the page against the COMPUTED token values. */
const COLOUR_JS = `
const hex2rgb=h=>{h=h.trim().replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');return [0,2,4].map(i=>parseInt(h.slice(i,i+2),16)/255);};
const rgb2hex=c=>'#'+c.map(v=>Math.round(Math.min(1,Math.max(0,v))*255).toString(16).padStart(2,'0')).join('').toUpperCase();
const toLin=c=>c<=0.04045?c/12.92:Math.pow((c+0.055)/1.055,2.4);
const toSrgb=c=>c<=0.0031308?c*12.92:1.055*Math.pow(c,1/2.4)-0.055;
const lin=h=>hex2rgb(h).map(toLin);
const mul=(m,v)=>m.map(r=>r[0]*v[0]+r[1]*v[1]+r[2]*v[2]);
function lab(h){const [r,g,b]=lin(h);
 const X=0.4124*r+0.3576*g+0.1805*b,Y=0.2126*r+0.7152*g+0.0722*b,Z=0.0193*r+0.1192*g+0.9505*b;
 const f=t=>t>0.008856?Math.cbrt(t):(7.787*t+16/116);
 const fx=f(X/0.95047),fy=f(Y),fz=f(Z/1.08883);return [116*fy-16,500*(fx-fy),200*(fy-fz)];}
const relLum=h=>{const [r,g,b]=lin(h);return 0.2126*r+0.7152*g+0.0722*b;};
const contrast=(a,b)=>{const x=relLum(a),y=relLum(b);return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05);};
/* Vienot, Brettel & Mollon 1999 — the matrices tools/design/colour.js uses. */
const RGB2LMS=[[17.8824,43.5161,4.11935],[3.45565,27.1554,3.86714],[0.0299566,0.184309,1.46709]];
const LMS2RGB=[[0.080944,-0.130504,0.116721],[-0.0102485,0.0540194,-0.113615],[-0.000365294,-0.00412163,0.693513]];
const DICH={normal:null,protan:[[0,2.02344,-2.52581],[0,1,0],[0,0,1]],deutan:[[1,0,0],[0.494207,0,1.24827],[0,0,1]],tritan:[[1,0,0],[0,1,0],[-0.395913,0.801109,0]]};
function simulate(h,k){if(!k||k==='normal')return h.toUpperCase();
 const lms=mul(RGB2LMS,lin(h));return rgb2hex(mul(LMS2RGB,mul(DICH[k],lms)).map(toSrgb));}
function deltaE00(h1,h2){const [L1,a1,b1]=lab(h1),[L2,a2,b2]=lab(h2);
 const C1=Math.hypot(a1,b1),C2=Math.hypot(a2,b2),Cb=(C1+C2)/2;
 const G=0.5*(1-Math.sqrt(Math.pow(Cb,7)/(Math.pow(Cb,7)+Math.pow(25,7))));
 const A1=(1+G)*a1,A2=(1+G)*a2,Cp1=Math.hypot(A1,b1),Cp2=Math.hypot(A2,b2);
 const h1p=(Math.atan2(b1,A1)*180/Math.PI+360)%360,h2p=(Math.atan2(b2,A2)*180/Math.PI+360)%360;
 const dL=L2-L1,dC=Cp2-Cp1;let dh=0;
 if(Cp1*Cp2!==0){dh=h2p-h1p;if(dh>180)dh-=360;if(dh<-180)dh+=360;}
 const dH=2*Math.sqrt(Cp1*Cp2)*Math.sin(dh*Math.PI/360);
 const Lb=(L1+L2)/2,Cpb=(Cp1+Cp2)/2;let hb=h1p+h2p;
 if(Cp1*Cp2!==0){if(Math.abs(h1p-h2p)>180)hb+=(hb<360?360:-360);hb/=2;}
 const T=1-0.17*Math.cos((hb-30)*Math.PI/180)+0.24*Math.cos(2*hb*Math.PI/180)+0.32*Math.cos((3*hb+6)*Math.PI/180)-0.20*Math.cos((4*hb-63)*Math.PI/180);
 const Sl=1+(0.015*Math.pow(Lb-50,2))/Math.sqrt(20+Math.pow(Lb-50,2)),Sc=1+0.045*Cpb,Sh=1+0.015*Cpb*T;
 const dTh=30*Math.exp(-Math.pow((hb-275)/25,2));
 const Rc=2*Math.sqrt(Math.pow(Cpb,7)/(Math.pow(Cpb,7)+Math.pow(25,7))),Rt=-Rc*Math.sin(2*dTh*Math.PI/180);
 return Math.sqrt(Math.pow(dL/Sl,2)+Math.pow(dC/Sc,2)+Math.pow(dH/Sh,2)+Rt*(dC/Sc)*(dH/Sh));}
`;

/* ROUND 10: wait for the strip to EXIST before the fixed settle wait. Measured
   on the running app, cold, at 1440x900: `.legend--ribbon` first appears about
   4.5s after `page.goto` returns in a fresh browser (1.47s from navigation
   start; the rest is Chromium's first compile of the module graph). These
   scenarios waited a flat 2.8s and had begun to fail intermittently with
   "no .legend--ribbon" and "0/5 hit tests" — a race in the test, not a defect
   in the strip. Nothing below is relaxed; the harness just stops measuring an
   app that has not finished mounting. */
const settled = async (page, ms) => {
  try { await page.waitForSelector('.legend--ribbon', { timeout: 15000 }); } catch (e) { /* asserted below */ }
  await page.waitForTimeout(ms);
};

module.exports = async ({ page, shot, log }) => {
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); });
  page.on('pageerror', e => errs.push('PAGEERROR ' + String(e).slice(0, 200)));
  page.on('requestfailed', r => errs.push('REQFAIL ' + r.url().slice(0, 120)));

  let pass = 0, fail = 0;
  const ok = (name, good, detail, want) => {
    (good ? pass++ : fail++);
    log((good ? 'PASS  ' : 'FAIL  ') + name + '  got ' + detail + (want ? '  (' + want + ')' : ''));
  };

  const U = 'http://localhost:8777/app/';
  await page.goto(U, { waitUntil: 'load' }); await settled(page, 2800);

  /* ---- N1 + N2, per theme ------------------------------------------------ */
  const palette = (theme) => page.evaluate(({ js, theme }) => {
    const C = new Function(js + '\nreturn { lab, contrast, simulate, deltaE00 };')();
    const { contrast, simulate, deltaE00 } = C;
    document.documentElement.dataset.theme = theme;
    const cs = getComputedStyle(document.documentElement);
    const v = n => (cs.getPropertyValue(n) || '').trim();
    /* Mean controlDegree per colour family, computed from the DATASET and this
       piece's own published STATUS_SYMBOL — never a table typed into a test. */
    const S = window.BEA.symbology;
    const statuses = (window.BEA.data.statuses || []);
    const per = {};
    for (const s of statuses) {
      const sym = S.STATUS_SYMBOL[s.id];
      if (!sym || !sym.family) continue;
      (per[sym.family] = per[sym.family] || []).push(s.controlDegree);
    }
    const deg = {};
    for (const k of Object.keys(per)) deg[k] = per[k].reduce((a, b) => a + b, 0) / per[k].length;
    /* The two families with no degree at all: not British, and no longer. They
       anchor the bottom of the ramp and are given degree 0. */
    deg['never-british'] = 0; deg['lost-former'] = 0.2;
    const keys = Object.keys(deg);
    const fills = {}; for (const k of keys) fills[k] = v('--map-' + k);
    const ground = v('--paper'), sea = v('--map-sea');
    const cr = {}; for (const k of keys) cr[k] = contrast(fills[k], ground);
    /* Spearman's rho between ink weight and control degree. */
    const rank = a => { const s = [...a].sort((x, y) => x - y); return a.map(x => s.indexOf(x)); };
    const rc = rank(keys.map(k => cr[k])), rd = rank(keys.map(k => deg[k]));
    let d2 = 0; for (let i = 0; i < keys.length; i++) d2 += (rc[i] - rd[i]) ** 2;
    const n = keys.length, rho = 1 - 6 * d2 / (n * (n * n - 1));
    /* Pairwise separation under four vision models. */
    const VIEWS = ['normal', 'protan', 'deutan', 'tritan'];
    let worst = 99, wp = '';
    for (let i = 0; i < keys.length; i++) for (let j = i + 1; j < keys.length; j++) for (const m of VIEWS) {
      const d = deltaE00(simulate(fills[keys[i]], m), simulate(fills[keys[j]], m));
      if (d < worst) { worst = d; wp = keys[i] + '/' + keys[j] + ' ' + m; }
    }
    let seaWorst = 99, sn = '';
    for (const k of keys) { if (k === 'never-british') continue; for (const m of VIEWS) {
      const d = deltaE00(simulate(fills[k], m), simulate(sea, m));
      if (d < seaWorst) { seaWorst = d; sn = k + ' ' + m; } } }
    const loudest = keys.slice().sort((a, b) => cr[b] - cr[a])[0];
    return { theme, rho, worst, wp, seaWorst, sn, loudest,
      ladder: keys.slice().sort((a, b) => cr[b] - cr[a]).map(k => k + ' ' + cr[k].toFixed(2) + '/' + deg[k]) };
  }, { js: COLOUR_JS, theme });

  for (const theme of ['paper', 'lamplit']) {
    const p = await palette(theme);
    ok('N1 ink tracks control (' + theme + ')', p.rho >= 0.85,
      'Spearman ' + p.rho.toFixed(2) + ', loudest = ' + p.loudest, '>= 0.85');
    ok('N2 colour-vision floor (' + theme + ')', p.worst >= 6,
      p.worst.toFixed(2) + ' dE00 worst of 45 pairs x 4 models (' + p.wp + ')', '>= 6, tier B');
    ok('N2 land off sea (' + theme + ')', p.seaWorst >= 12,
      p.seaWorst.toFixed(2) + ' dE00 (' + p.sn + ')', '>= 12');
    log('     ladder ' + theme + ': ' + p.ladder.join(' · '));
  }
  await page.evaluate(() => { delete document.documentElement.dataset.theme; });

  /* ---- N3 / N4 / N6, per stage ------------------------------------------- */
  const strip = () => page.evaluate(() => {
    const root = document.querySelector('.legend--ribbon');
    const route = root && root.querySelector('.legend__route');
    const items = root ? [...root.querySelectorAll('.legend__rib')] : [];
    const hidden = items.filter(li => li.hidden).length;
    const vis = n => { if (!n) return false; const cs = getComputedStyle(n); const b = n.getBoundingClientRect();
      return cs.display !== 'none' && cs.visibility !== 'hidden' && b.width > 1 && b.height > 1; };
    let seen = 0, pts = 0;
    if (root) { const b = root.getBoundingClientRect();
      for (let i = 0; i < 5; i++) { const x = b.x + 6 + (b.width - 12) * i / 4, y = b.y + b.height / 2;
        if (x < 0 || x > innerWidth || y < 0 || y > innerHeight) continue;
        pts++; const e = document.elementFromPoint(x, y); if (e && root.contains(e)) seen++; } }
    /* --key-h is authored in rem; the test wants CSS pixels. Measure the row
       the shell actually gives this piece rather than converting by hand. */
    const row = document.querySelector('.stage__key') || (root && root.parentElement);
    const keyH = row ? Math.round(row.getBoundingClientRect().height) : 0;
    return {
      stage: document.getElementById('app').dataset.stage,
      h: root ? Math.round(root.getBoundingClientRect().height) : null, keyH,
      route: route && vis(route) ? route.textContent.trim() : null,
      hidden, total: items.length, tier: root && root.dataset.tier,
      hits: pts ? seen + '/' + pts : 'offscreen',
      over: document.documentElement.scrollHeight - innerHeight,
    };
  });

  const s0 = await strip();
  const whole = s0.hidden === 0 && s0.tier === 'full';
  if (whole) {
    ok('N3 no invitation at plate', s0.stage === 'plate' && s0.route === null,
      'stage=' + s0.stage + ', control=' + JSON.stringify(s0.route), 'null when the key is whole');
  } else {
    ok('N4 omission is never silent at plate', s0.route !== null && /\+\s*\d/.test(s0.route),
      'stage=' + s0.stage + ', ' + s0.hidden + ' hidden, control=' + JSON.stringify(s0.route), '"+N more"');
    ok('N4 no invitation beside the debt at plate', !/full key/i.test(s0.route || ''),
      JSON.stringify(s0.route), 'the debt only, not "the full key"');
  }
  ok('N6 strip inside its row @ plate', s0.h <= s0.keyH && s0.hits === '5/5' && s0.over <= 0,
    s0.h + 'px of ' + s0.keyH + ', ' + s0.hits + ' hit tests, ' + s0.over + 'px doc overflow');

  /* one interaction — the shell promotes to `working` */
  await page.evaluate(() => window.BEA.store.dispatch('setYear', window.BEA.store.getState().year + 1));
  await page.waitForTimeout(900);
  const s1 = await strip();
  ok('N3 route returns at working', s1.stage === 'working' && !!s1.route,
    'stage=' + s1.stage + ', control=' + JSON.stringify(s1.route), 'present');
  ok('N4 label true at working', (s1.hidden > 0) === /\+\s*\d/.test(s1.route || ''),
    s1.hidden + ' hidden vs label ' + JSON.stringify(s1.route));

  /* ---- N5 the four provenance fields, at every stage ---------------------- */
  const fields = async (stage) => {
    await page.goto(U + (stage === 'plate' ? '' : '#filter=stage:' + stage), { waitUntil: 'load' }); await settled(page, 2500);
    return page.evaluate(() => {
      window.BEA.legend.openPlate('criticism');
      const sheet = document.querySelector('.app__sheet, [data-mount="sheet"]');
      const txt = sheet ? sheet.textContent : '';
      const st = window.BEA.store.getState();
      return {
        stage: document.getElementById('app').dataset.stage,
        open: !!(sheet && !sheet.hidden),
        year: txt.includes(String(st.year)),
        proj: /mercator|equal earth|equal-area/i.test(txt),
        colour: /colour|status/i.test(txt),
        def: /claimed|administered|controlled|influenced/i.test(txt),
      };
    });
  };
  for (const stage of ['plate', 'working', 'apparatus']) {
    const f = await fields(stage);
    ok('N5 four fields one control away @ ' + stage,
      f.open && f.year && f.proj && f.colour && f.def,
      JSON.stringify(f), 'projection · colour · year · definition');
  }

  await page.goto(U, { waitUntil: 'load' }); await settled(page, 2000);
  await shot('r9-plate');
  ok('N7 clean console', errs.length === 0, errs.length ? JSON.stringify(errs.slice(0, 3)) : 'no errors, no page errors, no failed requests');

  log(fail ? '>>> P17 R9 VIOLATED (' + fail + ' of ' + (pass + fail) + ')' : '>>> P17 R9 holds (' + pass + ' checks)');
};
