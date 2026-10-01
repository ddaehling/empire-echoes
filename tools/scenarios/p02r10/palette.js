/**
 * p02r10/palette.js — the ten fills, the ground and the sea, measured in the
 * live document: relative luminance, and ΔE00 against the ground under normal
 * vision and under a Brettel/Viénot protanope and deuteranope transform.
 */
module.exports = async ({ page, log }) => {
  await page.waitForFunction(() => window.__map && window.__map.plate, null, { timeout: 30000 });
  await page.waitForTimeout(800);
  const r = await page.evaluate(() => {
    const el = document.querySelector('.map') || document.documentElement;
    const cs = getComputedStyle(el);
    const probe = document.createElement('canvas').getContext('2d');
    const rgb = (v) => { probe.fillStyle = '#000'; probe.fillStyle = v; const h = probe.fillStyle;
      if (h[0] === '#') return [parseInt(h.slice(1,3),16), parseInt(h.slice(3,5),16), parseInt(h.slice(5,7),16)];
      const m = h.match(/[\d.]+/g); return m ? [ +m[0], +m[1], +m[2] ] : [0,0,0]; };
    const lin = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
    const lum = ([r,g,b]) => 0.2126*lin(r) + 0.7152*lin(g) + 0.0722*lin(b);
    // sRGB -> LMS (Hunt-Pointer-Estevez, via linear RGB), Viénot 1999 dichromat sim
    const toLMS = ([r,g,b]) => { const R=lin(r),G=lin(g),B=lin(b);
      return [17.8824*R+43.5161*G+4.11935*B, 3.45565*R+27.1554*G+3.86714*B, 0.0299566*R+0.184309*G+1.46709*B]; };
    const fromLMS = ([L,M,S]) => { const R=0.0809444479*L-0.130504409*M+0.116721066*S,
      G=-0.0102485335*L+0.0540193266*M-0.113614708*S, B=-0.000365296938*L-0.00412161469*M+0.693511405*S;
      const g2=(c)=>{ c=Math.max(0,Math.min(1,c)); return 255*(c<=0.0031308?12.92*c:1.055*Math.pow(c,1/2.4)-0.055); };
      return [g2(R),g2(G),g2(B)]; };
    const prot = (c) => { const [L,M,S]=toLMS(c); return fromLMS([2.02344*M-2.52581*S, M, S]); };
    const deut = (c) => { const [L,M,S]=toLMS(c); return fromLMS([L, 0.494207*L+1.24827*S, S]); };
    const xyz = ([r,g,b]) => { const R=lin(r),G=lin(g),B=lin(b);
      return [R*0.4124+G*0.3576+B*0.1805, R*0.2126+G*0.7152+B*0.0722, R*0.0193+G*0.1192+B*0.9505]; };
    const lab = (c) => { const [X,Y,Z]=xyz(c); const wx=0.95047,wy=1,wz=1.08883;
      const f=(t)=>t>0.008856?Math.cbrt(t):(7.787*t+16/116);
      const fx=f(X/wx),fy=f(Y/wy),fz=f(Z/wz); return [116*fy-16, 500*(fx-fy), 200*(fy-fz)]; };
    const dE = (a,b) => { const A=lab(a),B=lab(b); // CIE76 is enough to rank
      return Math.sqrt((A[0]-B[0])**2 + (A[1]-B[1])**2 + (A[2]-B[2])**2); };
    const KEYS = ['never-british','lost-former','dominion','settlement','crown-conquered','company-rule','lease','protectorate','mandate','occupied'];
    const out = {};
    const ground = rgb(cs.getPropertyValue('--map-ground') || cs.getPropertyValue('--map-never-british'));
    const sea = rgb(cs.getPropertyValue('--map-sea'));
    for (const k of KEYS) {
      const c = rgb(cs.getPropertyValue('--map-' + k));
      out[k] = { hex: c.map(v=>Math.round(v)).join(','), lum: +lum(c).toFixed(4),
        dEground: +dE(c, ground).toFixed(1),
        dEgroundProt: +dE(prot(c), prot(ground)).toFixed(1),
        dEgroundDeut: +dE(deut(c), deut(ground)).toFixed(1) };
    }
    const sym = (window.BEA && window.BEA.symbology && window.BEA.symbology.STATUS_SYMBOL) || null;
    const tex = {};
    if (sym) for (const s of Object.keys(sym)) tex[sym[s].family] = (tex[sym[s].family] || new Set()), tex[sym[s].family].add(sym[s].texture || 'plain');
    const texOut = {}; for (const f of Object.keys(tex)) texOut[f] = [...tex[f]];
    return { theme: document.documentElement.dataset.theme || 'system',
      ground: ground.map(v=>Math.round(v)).join(','), sea: sea.map(v=>Math.round(v)).join(','),
      groundLum: +lum(ground).toFixed(4), fills: out, textures: texOut };
  });
  log('theme ' + r.theme + '  ground ' + r.ground + ' lum ' + r.groundLum + '  sea ' + r.sea);
  const rows = Object.entries(r.fills).sort((a,b) => b[1].lum - a[1].lum);
  for (const [k, v] of rows) log('  ' + k.padEnd(17) + ' rgb ' + v.hex.padEnd(12) + ' lum ' + String(v.lum).padEnd(8)
    + ' dE(ground) normal ' + String(v.dEground).padStart(5) + '  protan ' + String(v.dEgroundProt).padStart(5) + '  deutan ' + String(v.dEgroundDeut).padStart(5));
  log('textures by family: ' + JSON.stringify(r.textures));
};
