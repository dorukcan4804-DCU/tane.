"use strict";
/* =====================================================================
   AYARLAR — fiyatları, günleri ve bilgileri sadece buradan değiştir.
   ===================================================================== */
const CONFIG = {
  brand: "tane.",
  whatsapp: "905000000000",            // başında 90, boşluksuz
  minOrder: 1250,                      // teslimat için en az sepet (TL)
  ownMin: 1500,                        // kendi kutun için en az ürün tutarı (TL)
  vegAdd: 649,                         // meyve kutusuna sebze eki
  gift: 150,                           // hediye paketi
  freq: [ { id:"tek", label:"Tek sefer", off:0 }, { id:"iki", label:"2 haftada bir", off:.05 }, { id:"hafta", label:"Her hafta", off:.08 } ],
  // Teslimat günleri. cutDay: 0 Pazar … 6 Cumartesi. left = o gün için gerçekten kalan kapasite.
  days: [
    { id:"car", day:"Çarşamba",  cutDay:1, cutH:20, slots:["10:00–14:00","14:00–18:00","18:00–20:00"], cap:35, left:35 },
    { id:"cmt", day:"Cumartesi", cutDay:4, cutH:20, slots:["10:00–14:00","14:00–18:00"], cap:35, left:35 }
  ],
  semt: ["Karşıyaka","Bostanlı","Mavişehir","Bayraklı","Bornova","Alsancak","Göztepe","Güzelyalı","Balçova","Narlıdere","Buca"],
  // Erzak Barı: her siparişten ayrılan tutar, bir barın sipariş hedefi ve GERÇEK sayılar.
  erzak: { perOrder:15, target:100, current:0, given:0 },
  // Sosyal hesaplar: açınca tam adresini yaz. Boş olan görünmez.
  social: { instagram:"", youtube:"", tiktok:"" }
};

const BOXES = [
  { id:"sofra",  name:"Sofra",  kg:"7–8 kg",   kgN:7.5,  cesit:"13+ çeşit", kisi:"3–4 kişi",        price:1290, desc:"Haftanın en iyi mevsim meyveleri ve bir özel meyve. Bir ailenin bir haftası.", badge:"En çok seçilen", set:"mevsim" },
  { id:"bolluk", name:"Bolluk", kg:"11–12 kg", kgN:11.5, cesit:"15+ çeşit", kisi:"5+ kişi, ofis",   price:1790, desc:"Kalabalık sofralar ve ofis mutfakları için, aynı özenle.", set:"mevsim" },
  { id:"seckin", name:"Seçkin", kg:"5–6 kg",   kgN:5.5,  cesit:"12+ çeşit", kisi:"2–4 kişi, hediye", price:2290, desc:"Ejder meyvesi, mango, çarkıfelek, liçi, altın çilek ve mevsimin en iyileri.", badge:"Lüks", lux:true, set:"egzotik" }
];
const BOX_ITEMS = {
  mevsim:  ["Mandalina","Portakal","Nar","Elma","Armut","Kivi","Trabzon hurması","Ayva","Muz","Avokado"],
  egzotik: ["Ejder meyvesi","Mango","Çarkıfelek","Liçi","Altın çilek","Yaban mersini","Kumkuat","Avokado","Altın kivi","Nar"]
};

// Kendi kutun kataloğu. unit: kg | adet | paket | demet. w = tahmini ağırlık (kg). off:true = bu hafta yok.
const CATALOG = [
  { id:"mandalina", tab:"meyve",   name:"Mandalina",           from:"Seferihisar", unit:"kg",    step:.5, price:79,  d:["citrus","#E8832A"] },
  { id:"portakal",  tab:"meyve",   name:"Portakal",            from:"Köyceğiz",    unit:"kg",    step:.5, price:69,  d:["citrus","#F09A35"] },
  { id:"nar",       tab:"meyve",   name:"Nar",                 from:"Antalya",     unit:"kg",    step:.5, price:109, d:["nar"] },
  { id:"elma",      tab:"meyve",   name:"Starking elma",       from:"Isparta",     unit:"kg",    step:.5, price:89,  d:["elma"] },
  { id:"armut",     tab:"meyve",   name:"Deveci armut",        from:"Bursa",       unit:"kg",    step:.5, price:119, d:["armut"] },
  { id:"kivi",      tab:"meyve",   name:"Kivi",                from:"Yalova",      unit:"kg",    step:.5, price:139, d:["kivi","#8DB33E"] },
  { id:"hurma",     tab:"meyve",   name:"Trabzon hurması",     from:"Aydın",       unit:"kg",    step:.5, price:109, d:["hurma"] },
  { id:"ayva",      tab:"meyve",   name:"Ayva",                from:"Sakarya",     unit:"kg",    step:.5, price:89,  d:["citrus","#E2C13A"] },
  { id:"muz",       tab:"meyve",   name:"Yerli muz",           from:"Anamur",      unit:"kg",    step:.5, price:149, d:["muz"] },
  { id:"avokado",   tab:"meyve",   name:"Hass avokado",        from:"Alanya",      unit:"adet",  step:1,  price:59,  w:.25, d:["avokado"] },
  { id:"ejder",     tab:"egzotik", name:"Ejder meyvesi",       from:"Alanya",      unit:"adet",  step:1,  price:159, w:.4,  d:["ejder"] },
  { id:"mango",     tab:"egzotik", name:"Mango",               from:"İthal",       unit:"adet",  step:1,  price:169, w:.4,  d:["mango"] },
  { id:"cark",      tab:"egzotik", name:"Çarkıfelek",          from:"Antalya",     unit:"adet",  step:1,  price:39,  w:.08, d:["cark"] },
  { id:"lici",      tab:"egzotik", name:"Liçi, 250 g",         from:"İthal",       unit:"paket", step:1,  price:249, w:.25, d:["lici"] },
  { id:"physalis",  tab:"egzotik", name:"Altın çilek, 100 g",  from:"İthal",       unit:"paket", step:1,  price:119, w:.1,  d:["physalis"] },
  { id:"yaban",     tab:"egzotik", name:"Yaban mersini, 125 g",from:"Antalya",     unit:"paket", step:1,  price:179, w:.125,d:["berry","#3B4A8C"] },
  { id:"frambuaz",  tab:"egzotik", name:"Frambuaz, 125 g",     from:"Bursa",       unit:"paket", step:1,  price:179, w:.125,d:["berry","#C23A55"] },
  { id:"kumkuat",   tab:"egzotik", name:"Kumkuat, 250 g",      from:"Antalya",     unit:"paket", step:1,  price:139, w:.25, d:["kumkuat"] },
  { id:"karambola", tab:"egzotik", name:"Karambola",           from:"İthal",       unit:"adet",  step:1,  price:119, w:.15, d:["yildiz"] },
  { id:"ananas",    tab:"egzotik", name:"Ananas",              from:"İthal",       unit:"adet",  step:1,  price:239, w:1.2, d:["ananas"] },
  { id:"papaya",    tab:"egzotik", name:"Papaya",              from:"İthal",       unit:"adet",  step:1,  price:219, w:1,   d:["papaya"] },
  { id:"altinkivi", tab:"egzotik", name:"Altın kivi",          from:"İthal",       unit:"kg",    step:.5, price:229, d:["kivi","#E3C53A"] },
  { id:"domates",   tab:"sebze",   name:"Domates",             from:"Kumluca",     unit:"kg",    step:.5, price:69,  d:["domates"] },
  { id:"salatalik", tab:"sebze",   name:"Salatalık",           from:"Menemen",     unit:"kg",    step:.5, price:59,  d:["uzun","#4E8A3A"] },
  { id:"biber",     tab:"sebze",   name:"Çarliston biber",     from:"Antalya",     unit:"kg",    step:.5, price:89,  d:["uzun","#7DB04E"] },
  { id:"brokoli",   tab:"sebze",   name:"Brokoli",             from:"Menemen",     unit:"adet",  step:1,  price:69,  w:.5,  d:["brokoli"] },
  { id:"ispanak",   tab:"sebze",   name:"Ispanak",             from:"Torbalı",     unit:"kg",    step:.5, price:69,  d:["yaprak"] },
  { id:"havuc",     tab:"sebze",   name:"Havuç",               from:"Beypazarı",   unit:"kg",    step:.5, price:49,  d:["havuc"] },
  { id:"kabak",     tab:"sebze",   name:"Kabak",               from:"Demre",       unit:"kg",    step:.5, price:69,  d:["uzun","#5E8E3E"] },
  { id:"patlican",  tab:"sebze",   name:"Patlıcan",            from:"Demre",       unit:"kg",    step:.5, price:79,  d:["uzun","#3A1E3F"] },
  { id:"limon",     tab:"sebze",   name:"Limon",               from:"Mersin",      unit:"kg",    step:.5, price:79,  d:["citrus","#E9CF3A"] },
  { id:"roka",      tab:"sebze",   name:"Roka ve tere",        from:"Bayındır",    unit:"demet", step:1,  price:39,  w:.15, d:["yaprak"] }
];

const KILER = [
  { id:"gul",    name:"Gül reçeli",          note:"Isparta · 380 g",  price:329, jar:"#C2416B" },
  { id:"incir",  name:"İncir reçeli",        note:"Aydın · 380 g",    price:289, jar:"#7A4A2A" },
  { id:"visne",  name:"Vişne reçeli",        note:"Afyon · 380 g",    price:279, jar:"#7A1424" },
  { id:"ayva",   name:"Ayva reçeli",         note:"Sakarya · 380 g",  price:279, jar:"#D9952F" },
  { id:"dut",    name:"Dut pekmezi",         note:"Malatya · 650 g",  price:349, jar:"#3A1426" },
  { id:"keci",   name:"Keçiboynuzu pekmezi", note:"Mersin · 650 g",   price:299, jar:"#4A2A12" },
  { id:"eksi",   name:"Nar ekşisi",          note:"Antalya · 250 ml", price:219, jar:"#5A1424", bottle:true },
  { id:"bal",    name:"Çam balı",            note:"Muğla · 450 g",    price:649, jar:"#C8862A" },
  { id:"set",    name:"Kiler seti",          note:"2 reçel, 1 pekmez, çam balı · hediye kutusunda", price:1390, jar:"#9E2B3A", set:true }
];
/* ===================================================================== */

const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const esc = v => String(v == null ? "" : v).replace(/[&<>"'`]/g, ch => "&#" + ch.charCodeAt(0) + ";");
const tl = n => Math.round(n).toLocaleString("tr-TR") + " TL";
const store = { get(k){ try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }, set(k,v){ try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const DAYS = ["Pazar","Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi"];
const offOf = id => (CONFIG.freq.find(f => f.id === id) || CONFIG.freq[0]).off;
const freqLabel = id => (CONFIG.freq.find(f => f.id === id) || CONFIG.freq[0]).label;

/* ---------- drawings (no images needed) ---------- */
function rng(seed){ return () => (seed = (seed * 16807) % 2147483647) / 2147483647; }
const DRAW = {
  citrus:(x,y,r,c)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/><circle cx="${x-r*.32}" cy="${y-r*.32}" r="${r*.3}" fill="#fff" opacity=".2"/>`,
  nar:(x,y,r)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="#A3202F"/><circle cx="${x-r*.3}" cy="${y-r*.3}" r="${r*.28}" fill="#fff" opacity=".14"/><path d="M${x-r*.22} ${y-r*.1} l${r*.22} ${-r*.3} l${r*.22} ${r*.3}z" fill="#6E1220"/>`,
  elma:(x,y,r)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="#B8262B"/><path d="M${x} ${y} q${r*.5} ${-r*.5} ${r*.85} ${-r*.3}" stroke="#E6B04A" stroke-width="${r*.12}" fill="none" opacity=".5"/><circle cx="${x}" cy="${y}" r="${r*.1}" fill="#4A2A12"/>`,
  armut:(x,y,r)=>`<ellipse cx="${x}" cy="${y}" rx="${r*.82}" ry="${r}" fill="#CDB848"/><circle cx="${x-r*.25}" cy="${y-r*.3}" r="${r*.26}" fill="#fff" opacity=".22"/>`,
  avokado:(x,y,r,_,a)=>`<ellipse cx="${x}" cy="${y}" rx="${r*.7}" ry="${r}" fill="#2F4A22" transform="rotate(${a} ${x} ${y})"/>`,
  kivi:(x,y,r,c)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="#6E4F2C"/><circle cx="${x}" cy="${y}" r="${r*.8}" fill="${c}"/><circle cx="${x}" cy="${y}" r="${r*.24}" fill="#F3EFCB"/>`,
  hurma:(x,y,r)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="#E46A1E"/><path d="M${x-r*.4} ${y} L${x} ${y-r*.16} L${x+r*.4} ${y} L${x} ${y+r*.16}Z" fill="#4E5A2A"/>`,
  muz:(x,y,r,_,a)=>`<g transform="rotate(${a} ${x} ${y})"><path d="M${x-r*1.3} ${y-r*.2} Q${x} ${y+r*.9} ${x+r*1.3} ${y-r*.2} Q${x} ${y+r*.35} ${x-r*1.3} ${y-r*.2}Z" fill="#F2D13C"/></g>`,
  ejder:(x,y,r,_,a)=>`<g transform="rotate(${a} ${x} ${y})"><ellipse cx="${x}" cy="${y}" rx="${r*.85}" ry="${r}" fill="#E0457B"/><path d="M${x-r*.7} ${y-r*.2} l${-r*.35} ${-r*.25} M${x+r*.7} ${y-r*.1} l${r*.35} ${-r*.3} M${x-r*.5} ${y+r*.6} l${-r*.3} ${r*.25} M${x+r*.5} ${y+r*.6} l${r*.3} ${r*.25} M${x} ${y-r} l0 ${-r*.3}" stroke="#7DB04E" stroke-width="${r*.16}" stroke-linecap="round"/></g>`,
  mango:(x,y,r,_,a)=>`<g transform="rotate(${a} ${x} ${y})"><ellipse cx="${x}" cy="${y}" rx="${r*.8}" ry="${r}" fill="#F0A833"/><ellipse cx="${x+r*.3}" cy="${y+r*.25}" rx="${r*.45}" ry="${r*.55}" fill="#D9542A" opacity=".55"/></g>`,
  cark:(x,y,r)=>`<circle cx="${x}" cy="${y}" r="${r*.85}" fill="#5B2A4E"/><circle cx="${x-r*.25}" cy="${y-r*.25}" r="${r*.22}" fill="#fff" opacity=".15"/>`,
  lici:(x,y,r)=>`<circle cx="${x}" cy="${y}" r="${r*.8}" fill="#C8394A"/><circle cx="${x}" cy="${y}" r="${r*.8}" fill="none" stroke="#8A1F2E" stroke-width="${r*.08}" stroke-dasharray="${r*.12} ${r*.12}"/>`,
  physalis:(x,y,r)=>`<path d="M${x} ${y-r} C${x+r} ${y-r*.4} ${x+r} ${y+r*.6} ${x} ${y+r} C${x-r} ${y+r*.6} ${x-r} ${y-r*.4} ${x} ${y-r}Z" fill="#D9C38A"/><circle cx="${x}" cy="${y+r*.1}" r="${r*.45}" fill="#F0A21E"/>`,
  berry:(x,y,r,c)=>{ let s = ""; for (let i = 0; i < 7; i++){ const a = i * 0.9, dd = r * .5 * (i % 3 ? 1 : .2); s += `<circle cx="${x+Math.cos(a)*dd}" cy="${y+Math.sin(a)*dd}" r="${r*.32}" fill="${c}"/>`; } return s; },
  kumkuat:(x,y,r,_,a)=>`<ellipse cx="${x}" cy="${y}" rx="${r*.55}" ry="${r*.75}" fill="#F08A1E" transform="rotate(${a} ${x} ${y})"/>`,
  yildiz:(x,y,r)=>{ let p = ""; for (let i = 0; i < 10; i++){ const rr = i % 2 ? r*.45 : r, a = -Math.PI/2 + i*Math.PI/5; p += `${i ? "L" : "M"}${x+Math.cos(a)*rr} ${y+Math.sin(a)*rr}`; } return `<path d="${p}Z" fill="#E9CF3A"/>`; },
  ananas:(x,y,r)=>`<ellipse cx="${x}" cy="${y+r*.15}" rx="${r*.7}" ry="${r*.85}" fill="#D9A42E"/><path d="M${x-r*.5} ${y-r*.3} l${r} ${r*.9} M${x+r*.5} ${y-r*.3} l${-r} ${r*.9}" stroke="#A9781E" stroke-width="${r*.06}"/><path d="M${x} ${y-r*.65} l${-r*.35} ${-r*.5} M${x} ${y-r*.65} l0 ${-r*.6} M${x} ${y-r*.65} l${r*.35} ${-r*.5}" stroke="#3F7A3A" stroke-width="${r*.18}" stroke-linecap="round"/>`,
  papaya:(x,y,r,_,a)=>`<g transform="rotate(${a} ${x} ${y})"><ellipse cx="${x}" cy="${y}" rx="${r*.65}" ry="${r}" fill="#8CB04A"/><ellipse cx="${x}" cy="${y+r*.2}" rx="${r*.45}" ry="${r*.6}" fill="#F08A3A" opacity=".75"/></g>`,
  domates:(x,y,r)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="#D23A28"/><circle cx="${x-r*.3}" cy="${y-r*.3}" r="${r*.26}" fill="#fff" opacity=".18"/><circle cx="${x}" cy="${y}" r="${r*.2}" fill="#3F6B35"/>`,
  brokoli:(x,y,r)=>{ let s = ""; for (let i = 0; i < 7; i++){ const a = i * 0.9; s += `<circle cx="${x+Math.cos(a)*r*.45}" cy="${y+Math.sin(a)*r*.45}" r="${r*.45}" fill="${i % 2 ? "#3D7536" : "#4C8A44"}"/>`; } return s; },
  havuc:(x,y,r,_,a)=>`<g transform="rotate(${a} ${x} ${y})"><path d="M${x-r*1.2} ${y-r*.22} L${x+r*1.2} ${y} L${x-r*1.2} ${y+r*.22}Z" fill="#E8832A"/><path d="M${x-r*1.2} ${y} l${-r*.5} ${-r*.3} M${x-r*1.2} ${y} l${-r*.5} ${r*.3}" stroke="#3F6B35" stroke-width="${r*.14}" stroke-linecap="round"/></g>`,
  yaprak:(x,y,r,_,a)=>`<g transform="rotate(${a} ${x} ${y})"><ellipse cx="${x}" cy="${y}" rx="${r*1.3}" ry="${r*.7}" fill="#4F8A3E"/><path d="M${x-r*1.2} ${y} L${x+r*1.2} ${y}" stroke="#2F5A26" stroke-width="${r*.08}"/></g>`,
  uzun:(x,y,r,c,a)=>`<g transform="rotate(${a} ${x} ${y})"><ellipse cx="${x}" cy="${y}" rx="${r*1.25}" ry="${r*.45}" fill="${c}"/><ellipse cx="${x-r*.3}" cy="${y-r*.15}" rx="${r*.6}" ry="${r*.1}" fill="#fff" opacity=".18"/></g>`
};
const icon = d => `<svg viewBox="0 0 100 100" aria-hidden="true">${DRAW[d[0]](50, 50, 34, d[1], 30)}</svg>`;
function boxArt(set, seed, W = 520, H = 400, density = 1, animate = false, dark = false){
  const R = rng(seed), pad = W * .07, iw = W - pad*2, ih = H - pad*2;
  const pool = set === "egzotik" ? CATALOG.filter(c => c.tab === "egzotik" || c.id === "avokado" || c.id === "nar")
             : set === "sebze" ? CATALOG.filter(c => c.tab === "sebze") : CATALOG.filter(c => c.tab === "meyve");
  const cols = Math.max(3, Math.round(6 * density)), rows = Math.max(2, Math.round(cols * ih / iw)), cw = iw/cols, ch = ih/rows;
  const cells = []; for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) cells.push([r,c]);
  for (let i = cells.length - 1; i > 0; i--){ const j = Math.floor(R()*(i+1)); [cells[i], cells[j]] = [cells[j], cells[i]]; }
  const items = cells.map(([r,c], i) => {
    const it = pool[Math.floor(R()*pool.length)].d;
    const x = pad + cw*(c+.5) + (R()-.5)*cw*.28, y = pad + ch*(r+.5) + (R()-.5)*ch*.28;
    return `<g${animate ? ` class="it" style="animation-delay:${i*28}ms"` : ""}>${DRAW[it[0]](x, y, Math.min(cw,ch)*(.5 + R()*.08), it[1], Math.round(R()*180))}</g>`;
  }).join("");
  const wall = dark ? "#4A2A30" : "#E2C7C0", inner = dark ? "#F1E3DC" : "#FBF3EE";
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg"><rect width="${W}" height="${H}" rx="12" fill="${wall}"/><rect x="${pad*.45}" y="${pad*.45}" width="${W-pad*.9}" height="${H-pad*.9}" rx="7" fill="${inner}"/>${items}</svg>`;
}
function ownArt(q, W = 420, H = 260){
  const R = rng(41), pad = W*.07, iw = W - pad*2, ih = H - pad*2;
  let shapes = [];
  CATALOG.forEach(c => { const n = q[c.id]; if (!n) return; const k = c.unit === "kg" ? Math.max(1, Math.round(n*2.4)) : Math.min(n, 6); for (let i = 0; i < k; i++) shapes.push(c.d); });
  if (shapes.length > 72){ const all = shapes; shapes = Array.from({length:72}, (_,i) => all[Math.floor(i*all.length/72)]); }
  for (let i = shapes.length - 1; i > 0; i--){ const j = Math.floor(R()*(i+1)); [shapes[i], shapes[j]] = [shapes[j], shapes[i]]; }
  const N = shapes.length, cols = Math.max(5, Math.ceil(Math.sqrt(N * iw / ih))), rows = Math.max(3, Math.ceil(N / cols)), cw = iw/cols, ch = ih/rows;
  const items = shapes.map((d,i) => { const r0 = Math.floor(i/cols), c0 = i % cols; return DRAW[d[0]](pad + cw*(c0+.5), pad + ih - ch*(r0+.5), Math.min(cw,ch)*.48, d[1], (i*47) % 180); }).join("");
  const empty = N ? "" : `<text x="${W/2}" y="${H/2+6}" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="22" fill="#A08A86">Boş kutu · ilk taneyi seç</text>`;
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg"><rect width="${W}" height="${H}" rx="12" fill="#E2C7C0"/><rect x="${pad*.45}" y="${pad*.45}" width="${W-pad*.9}" height="${H-pad*.9}" rx="7" fill="#FBF3EE"/>${items}${empty}</svg>`;
}
const jarSVG = k => k.set
  ? `<svg viewBox="0 0 120 100" aria-hidden="true"><rect x="8" y="30" width="104" height="62" rx="8" fill="${k.jar}"/><rect x="8" y="30" width="104" height="14" fill="#000" opacity=".12"/><rect x="54" y="30" width="12" height="62" fill="#F6EEDC"/><text x="60" y="76" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="13" fill="#F6EEDC">tane.</text></svg>`
  : k.bottle
  ? `<svg viewBox="0 0 60 100" aria-hidden="true"><path d="M24 6h12v18l8 10v56a6 6 0 0 1-6 6H22a6 6 0 0 1-6-6V34l8-10z" fill="${k.jar}"/><rect x="16" y="52" width="28" height="22" fill="#F6EEDC"/><text x="30" y="67" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="9" fill="#2A1A1C">tane.</text></svg>`
  : `<svg viewBox="0 0 70 100" aria-hidden="true"><rect x="14" y="8" width="42" height="14" rx="3" fill="#2A1A1C"/><rect x="8" y="20" width="54" height="74" rx="12" fill="${k.jar}"/><rect x="14" y="26" width="8" height="58" rx="4" fill="#fff" opacity=".18"/><rect x="12" y="48" width="46" height="24" rx="3" fill="#F6EEDC"/><text x="35" y="64" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-size="11" fill="#2A1A1C">tane.</text></svg>`;

/* ---------- top bar: next cutoff ---------- */
function nextCut(d){ const now = new Date(), t = new Date(now); t.setHours(d.cutH,0,0,0); let add = (d.cutDay - now.getDay() + 7) % 7; if (add === 0 && now >= t) add = 7; t.setDate(t.getDate() + add); return t; }
function soonestDay(){ return CONFIG.days.map(d => ({ d, t: nextCut(d) })).sort((a,b) => a.t - b.t)[0]; }
function renderBar(){
  const { d, t } = soonestDay(), h = Math.max(0, Math.floor((t - new Date()) / 3.6e6));
  const left = h >= 24 ? `${Math.floor(h/24)} gün ${h%24} saat` : `${h} saat`;
  $("#bar").innerHTML = `İzmir · <b>${DAYS[t.getDay()]} ${d.cutH}:00</b>'ye kadar sipariş ver, ${esc(d.day)} kapında · Teslimat ücretsiz <span class="muted" style="color:inherit;opacity:.7">· kapanışa ${left}</span>`;
}

/* ---------- boxes ---------- */
let freq = "tek";
function renderFreq(){ $("#freq").innerHTML = CONFIG.freq.map(f => `<button aria-pressed="${f.id === freq}" data-freq="${f.id}">${f.label}${f.off ? `<small>−%${Math.round(f.off*100)}</small>` : ""}</button>`).join(""); }
$("#freq").addEventListener("click", e => { const b = e.target.closest("[data-freq]"); if (b){ freq = b.dataset.freq; renderFreq(); renderBoxes(); } });
function renderBoxes(){
  $("#boxes").innerHTML = BOXES.map((b,i) => {
    const p = b.price * (1 - offOf(freq));
    return `<article class="box${b.lux ? " lux" : ""}">
      <div class="art">${b.badge ? `<span class="badge">${b.badge}</span>` : ""}${boxArt(b.set, 31 + i*13, 420, 280, b.kgN > 10 ? 1.2 : 1, false, !!b.lux)}</div>
      <div class="body"><h3>${b.name}</h3><div class="facts"><span>${b.kg}</span><span>${b.cesit}</span><span>${b.kisi}</span></div><p class="muted">${b.desc}</p>
      <div class="price-row"><span class="price">${offOf(freq) ? `<s>${tl(b.price)}</s>` : ""}${tl(p)}</span><button class="btn sm" data-cfg="${b.id}">Kutunu hazırla</button></div></div></article>`;
  }).join("");
}
$("#boxes").addEventListener("click", e => { const b = e.target.closest("[data-cfg]"); if (b) openCfg(b.dataset.cfg); });

/* ---------- kiler grid ---------- */
function renderKiler(){
  $("#kilerGrid").innerHTML = KILER.filter(k => !k.set).map(k => `<div class="jar-card"><div class="jar">${jarSVG(k)}</div><b>${k.name}</b><small>${k.note}</small><div class="r"><span>${tl(k.price)}</span><button class="btn sm line" data-kiler="${k.id}">Ekle</button></div></div>`).join("");
}
$("#kilerGrid").addEventListener("click", e => { const b = e.target.closest("[data-kiler]"); if (!b) return; const k = KILER.find(x => x.id === b.dataset.kiler); addToCart({ type:"kiler", id:k.id, name:k.name, price:k.price, lines:[] }, b); if (!hasBox()) toast("Kiler ürünleri kutuyla birlikte gelir. Bir kutu da seç"); });

/* ---------- box configurator ---------- */
const C = {};
let shownCfg = 0;
function openCfg(id){
  Object.assign(C, { box:id, freq, veg:false, kiler:{}, out:[], taste:"Dengeli", ripe:"Hemen yenecek" });
  $("#cfgGift").checked = false; $("#cfgNote").value = ""; $$("#cfg details").forEach(d => d.open = false);
  shownCfg = 0; renderCfg(true); openSheet("cfg");
}
function cfgPrice(){
  const b = BOXES.find(x => x.id === C.box), off = offOf(C.freq);
  let p = b.price * (1 - off) + (C.veg ? CONFIG.vegAdd * (1 - off) : 0);
  Object.entries(C.kiler).forEach(([k,q]) => p += KILER.find(x => x.id === k).price * q);
  if ($("#cfgGift").checked) p += CONFIG.gift;
  return Math.round(p);
}
function renderCfg(redraw){
  const b = BOXES.find(x => x.id === C.box);
  $("#cfgTitle").textContent = `${b.name} · ${b.kg}`;
  if (redraw || $("#cfgPreview").dataset.box !== b.id){ $("#cfgPreview").dataset.box = b.id; $("#cfgPreview").classList.toggle("dark", !!b.lux); $("#cfgPreview").innerHTML = boxArt(b.set, 7 + BOXES.indexOf(b)*5, 420, 260, b.kgN > 10 ? 1.2 : 1, !reduce, !!b.lux); }
  $("#cfgSize").innerHTML = BOXES.map(x => `<button aria-pressed="${x.id === C.box}" data-size="${x.id}">${x.name}<small>${tl(x.price)}</small></button>`).join("");
  $("#cfgFreq").innerHTML = CONFIG.freq.map(f => `<button aria-pressed="${f.id === C.freq}" data-cfreq="${f.id}">${f.label}<small>${f.off ? "−%" + Math.round(f.off*100) : "esnek"}</small></button>`).join("");
  $("#cfgVeg").checked = C.veg; $("#vegToggle").classList.toggle("on", C.veg); $("#vegPrice").textContent = "+" + tl(CONFIG.vegAdd);
  $("#cfgKiler").innerHTML = KILER.map(k => { const q = C.kiler[k.id] || 0; return `<div class="row${q ? " has" : ""}">${jarSVG(k)}<span><b>${k.name}</b><small>${tl(k.price)}</small></span><span class="qty"><button aria-label="${k.name} azalt" data-kdec="${k.id}" ${q ? "" : "disabled"}>−</button><span>${q}</span><button aria-label="${k.name} artır" data-kinc="${k.id}">+</button></span></div>`; }).join("");
  const items = BOX_ITEMS[b.set];
  $("#cfgOut").innerHTML = items.map(i => `<button class="chip" aria-pressed="${C.out.includes(i)}" data-out="${i}" ${!C.out.includes(i) && C.out.length >= 3 ? "disabled" : ""}>${i}</button>`).join("");
  $("#cfgTaste").innerHTML = ["Daha tatlı","Dengeli","Ekşimsi"].map(x => `<button aria-pressed="${C.taste === x}" data-taste="${x}">${x}</button>`).join("");
  $("#cfgRipe").innerHTML = ["Hemen yenecek","Hafta boyunca olgunlaşsın"].map(x => `<button aria-pressed="${C.ripe === x}" data-ripe="${x}">${x}</button>`).join("");
  $("#giftPrice").textContent = "+" + tl(CONFIG.gift);
  $("#cfgFreqLbl").textContent = freqLabel(C.freq) + (C.veg ? " · meyve + sebze" : "");
  tween($("#cfgTotal"), shownCfg, cfgPrice(), v => shownCfg = v);
}
$("#cfg").addEventListener("click", e => {
  const t = e.target.closest("button"); if (!t || t.disabled) return; const d = t.dataset;
  if (d.size) C.box = d.size;
  else if (d.cfreq) C.freq = d.cfreq;
  else if (d.kinc) C.kiler[d.kinc] = Math.min(5, (C.kiler[d.kinc] || 0) + 1);
  else if (d.kdec){ C.kiler[d.kdec] = Math.max(0, (C.kiler[d.kdec] || 0) - 1); if (!C.kiler[d.kdec]) delete C.kiler[d.kdec]; }
  else if (d.out) C.out = C.out.includes(d.out) ? C.out.filter(x => x !== d.out) : [...C.out, d.out];
  else if (d.taste) C.taste = d.taste;
  else if (d.ripe) C.ripe = d.ripe;
  else return;
  renderCfg();
});
$("#cfgVeg").addEventListener("change", e => { C.veg = e.target.checked; renderCfg(); });
$("#cfgGift").addEventListener("change", () => tween($("#cfgTotal"), shownCfg, cfgPrice(), v => shownCfg = v));
$("#cfgAdd").addEventListener("click", e => {
  const b = BOXES.find(x => x.id === C.box), l = [];
  if (C.veg) l.push("+ Sebze eki");
  Object.entries(C.kiler).forEach(([k,q]) => l.push(`+ ${q} × ${KILER.find(x => x.id === k).name}`));
  if (C.out.length) l.push("Çıkar: " + C.out.join(", "));
  if (C.taste !== "Dengeli") l.push("Tat: " + C.taste);
  if (C.ripe !== "Hemen yenecek") l.push("Olgunluk: " + C.ripe);
  if ($("#cfgGift").checked) l.push("Hediye paketi");
  const n = $("#cfgNote").value.trim().slice(0, 180); if (n) l.push(`Kart: “${n}”`);
  addToCart({ type:"box", id:b.id, name:b.name, freq:C.freq, price:cfgPrice(), lines:l }, e.currentTarget);
  setTimeout(closeAll, 250);
});

/* ---------- own box ---------- */
const O = { tab:"meyve", q:{}, ripe:"Hemen yenecek" };
let shownOwn = 0;
const wOf = c => c.unit === "kg" ? 1 : (c.w || .3);
const ownSum = () => CATALOG.reduce((s,c) => s + (O.q[c.id] || 0) * c.price, 0);
const ownKg = () => CATALOG.reduce((s,c) => s + (O.q[c.id] || 0) * wOf(c), 0);
const fmtQ = (c,q) => c.unit === "kg" ? String(q).replace(".", ",") + " kg" : `${q} ${c.unit}`;
function renderOwn(){
  $$("#ownTabs [data-tab]").forEach(b => b.setAttribute("aria-pressed", b.dataset.tab === O.tab));
  $("#ownList").innerHTML = CATALOG.filter(c => c.tab === O.tab).map(c => { const q = O.q[c.id] || 0, max = c.unit === "kg" ? 5 : 10;
    return `<div class="row${q ? " has" : ""}${c.off ? " off" : ""}">${icon(c.d)}<span><b>${c.name}</b><small>${c.off ? "Bu hafta yok" : `${c.from} · ${tl(c.price)} / ${c.unit}`}</small></span>
      <span class="qty"><button aria-label="${c.name} azalt" data-odec="${c.id}" ${q ? "" : "disabled"}>−</button><span>${q ? fmtQ(c,q) : "—"}</span><button aria-label="${c.name} artır" data-oinc="${c.id}" ${c.off || q >= max ? "disabled" : ""}>+</button></span></div>`; }).join("");
  $("#ownRipe").innerHTML = ["Hemen yenecek","Hafta boyunca olgunlaşsın"].map(x => `<button aria-pressed="${O.ripe === x}" data-oripe="${x}">${x}</button>`).join("");
  const s = ownSum(), kg = ownKg(), n = CATALOG.filter(c => O.q[c.id]).length, ok = s >= CONFIG.ownMin && kg <= 14;
  $("#ownPreview").innerHTML = ownArt(O.q);
  $("#ownKg").textContent = "~" + kg.toFixed(1).replace(".", ",") + " kg";
  $("#ownMinTxt").textContent = kg > 14 ? "Bir kutu en fazla 14 kg alır" : s >= CONFIG.ownMin ? "Kutun hazır" : `Kutuyu tamamlamak için ${tl(CONFIG.ownMin - s)} daha`;
  $("#ownBar").style.width = Math.min(100, s / CONFIG.ownMin * 100) + "%";
  $("#ownCount").textContent = `${n} ürün`;
  $("#ownAdd").disabled = !ok;
  tween($("#ownTotal"), shownOwn, s, v => shownOwn = v);
}
$("#own").addEventListener("click", e => {
  const t = e.target.closest("button"); if (!t || t.disabled) return; const d = t.dataset;
  if (d.tab) O.tab = d.tab;
  else if (d.oinc){ const c = CATALOG.find(x => x.id === d.oinc); O.q[c.id] = +((O.q[c.id] || 0) + c.step).toFixed(1); }
  else if (d.odec){ const c = CATALOG.find(x => x.id === d.odec); O.q[c.id] = +((O.q[c.id] || 0) - c.step).toFixed(1); if (O.q[c.id] <= 0) delete O.q[c.id]; }
  else if (d.oripe) O.ripe = d.oripe;
  else return;
  renderOwn();
});
$("#openOwn").addEventListener("click", () => { shownOwn = ownSum(); renderOwn(); openSheet("own"); });
$("#ownAdd").addEventListener("click", e => {
  const l = [CATALOG.filter(c => O.q[c.id]).map(c => `${c.name} ${fmtQ(c, O.q[c.id])}`).join(", ")];
  if (O.ripe !== "Hemen yenecek") l.push("Olgunluk: " + O.ripe);
  const n = $("#ownNote").value.trim().slice(0, 180); if (n) l.push(`Not: “${n}”`);
  addToCart({ type:"own", id:"own", name:"Kendi kutun · ~" + ownKg().toFixed(1).replace(".", ",") + " kg", price:ownSum(), lines:l }, e.currentTarget);
  O.q = {}; $("#ownNote").value = ""; shownOwn = 0;
  setTimeout(closeAll, 250);
});

/* ---------- cart ---------- */
const validItem = c => c && typeof c === "object" && ["box","own","kiler"].includes(c.type) && typeof c.name === "string" && c.name.length <= 80
  && Number.isFinite(c.price) && c.price > 0 && c.price < 100000
  && (c.type !== "box" || BOXES.some(b => b.id === c.id)) && (c.type !== "kiler" || KILER.some(k => k.id === c.id))
  && (c.freq === undefined || CONFIG.freq.some(f => f.id === c.freq))
  && Array.isArray(c.lines) && c.lines.length <= 14 && c.lines.every(x => typeof x === "string" && x.length <= 600);
let cart = (() => { const c = store.get("tane_cart3"); return Array.isArray(c) ? c.filter(validItem).slice(0, 20) : []; })();
let step = 1, form = {};
const hasBox = () => cart.some(c => c.type === "box" || c.type === "own");
const subtotal = () => cart.reduce((s,c) => s + c.price, 0);
function save(){ store.set("tane_cart3", cart); $("#cartCount").textContent = cart.length; }
function addToCart(item, from){ cart.push(item); save(); fly(from); toast(item.name + " sepete eklendi"); }
function fly(from){
  if (reduce || !from) return;
  const r = from.getBoundingClientRect(), t = $("#cartBtn").getBoundingClientRect(), dot = document.createElement("div");
  Object.assign(dot.style, { position:"fixed", zIndex:130, width:"14px", height:"14px", borderRadius:"50%", background:"var(--accent)", left:(r.left + r.width/2 - 7) + "px", top:(r.top + r.height/2 - 7) + "px", pointerEvents:"none", transition:"transform .7s cubic-bezier(.5,-.4,.5,1), opacity .7s" });
  document.body.appendChild(dot);
  requestAnimationFrame(() => requestAnimationFrame(() => { dot.style.transform = `translate(${t.left + t.width/2 - r.left - r.width/2}px, ${t.top + t.height/2 - r.top - r.height/2}px) scale(.6)`; dot.style.opacity = ".3"; }));
  setTimeout(() => { dot.remove(); $("#cartBtn").classList.add("bump"); setTimeout(() => $("#cartBtn").classList.remove("bump"), 500); }, 720);
}
const FIELDS = ["fDay","fSlot","fSemt","fName","fTel","fAddr","fHeard","fDoor","fVideo","fCrate"];
function keepForm(){ FIELDS.forEach(f => { const el = $("#" + f); if (el) form[f] = el.type === "checkbox" ? el.checked : el.value; }); }
function restoreForm(){ FIELDS.forEach(f => { const el = $("#" + f); if (!el || form[f] === undefined) return; if (el.type === "checkbox") el.checked = form[f]; else if (el.tagName !== "SELECT" || [...el.options].some(o => o.value === form[f])) el.value = form[f]; }); }
function renderCart(){
  ["#st1","#st2","#st3"].forEach((x,i) => $(x).classList.toggle("on", i < step));
  const body = $("#cartBody"), foot = $("#cartFoot");
  if (!cart.length){ body.innerHTML = `<p class="empty">Sepetin boş.<br><a href="#kutular" data-close>Kutulara göz at</a></p>`; foot.innerHTML = ""; return; }
  const s = subtotal(), short = CONFIG.minOrder - s;
  if (step === 1){
    const missing = KILER.filter(k => !k.set && !cart.some(c => c.id === k.id)).slice(0, 2);
    body.innerHTML = cart.map((c,i) => `<div class="ci"><div class="t"><span>${esc(c.name)}${c.freq ? " · " + freqLabel(c.freq) : ""}</span><span class="num">${tl(c.price)}</span></div>${c.lines.length ? `<span class="muted">${c.lines.map(esc).join(" · ")}</span>` : ""}<button class="rm" data-rm="${i}">Kaldır</button></div>`).join("")
      + (!hasBox() ? `<p class="hint warn">Kiler ürünleri kutuyla birlikte gelir. Sepete bir kutu ekle.</p>` : short > 0 ? `<p class="hint warn">Ücretsiz teslimat için ${tl(short)} daha ekle.</p>` : "")
      + (missing.length ? `<div><p class="sub">Kilerden</p><div class="rows">${missing.map(k => `<div class="row">${jarSVG(k)}<span><b>${k.name}</b><small>${tl(k.price)}</small></span><button class="btn sm line" data-quick="${k.id}">Ekle</button></div>`).join("")}</div></div>` : "");
    foot.innerHTML = `<div class="total"><span>Ara toplam<br><small>Teslimat ücretsiz</small></span><b>${tl(s)}</b></div><button class="btn block" data-step="2" ${!hasBox() || short > 0 ? "disabled" : ""}>Teslimat bilgileri</button>`;
  } else if (step === 2){
    const di = Math.max(0, CONFIG.days.findIndex(d => d.id === form.fDay)), day = CONFIG.days[di];
    body.innerHTML = `<div class="two"><label class="field" for="fDay">Teslimat günü<select id="fDay">${CONFIG.days.map(d => `<option value="${d.id}" ${d.left <= 0 ? "disabled" : ""}>${d.day}${d.left <= 0 ? " · dolu" : ""}</option>`).join("")}</select></label>
      <label class="field" for="fSlot">Saat<select id="fSlot">${day.slots.map(x => `<option>${x}</option>`).join("")}</select></label></div>
      <label class="field" for="fSemt">Semt (İzmir)<select id="fSemt">${CONFIG.semt.map(x => `<option>${esc(x)}</option>`).join("")}</select></label>
      <div class="two"><label class="field" for="fName">Ad soyad<input id="fName" autocomplete="name" maxlength="60"></label><label class="field" for="fTel">Telefon<input id="fTel" type="tel" inputmode="tel" autocomplete="tel" maxlength="20" placeholder="05xx xxx xx xx"></label></div>
      <label class="field" for="fAddr">Açık adres<textarea id="fAddr" maxlength="240" placeholder="Mahalle, sokak, bina, daire"></textarea></label>
      <label class="field" for="fHeard">Bizi nereden duydun?<select id="fHeard"><option>Instagram</option><option>TikTok</option><option>YouTube</option><option>Google</option><option>Arkadaş tavsiyesi</option><option>Diğer</option></select></label>
      <label class="check" for="fDoor"><input type="checkbox" id="fDoor" checked><span>Evde yoksam sandık kapıya ya da kapıcıya bırakılabilir</span></label>
      <label class="check" for="fCrate"><input type="checkbox" id="fCrate"><span>Meyvelerim kapaklı tane. sandığında gelir. Sandığı bir sonraki teslimatta geri vereceğim; iade etmezsem 750 TL ödeyeceğim.</span></label>
      <label class="check" for="fVideo"><input type="checkbox" id="fVideo"><span>Teslimatımın videosu yüzüm ve adresim görünmeden paylaşılabilir</span></label>`;
    foot.innerHTML = `<div class="total"><span>Toplam<br><small>Teslimat ücretsiz</small></span><b>${tl(s)}</b></div><div style="display:grid;grid-template-columns:auto 1fr;gap:8px"><button class="btn line sm" data-step="1">Geri</button><button class="btn" data-step="3">Devam</button></div>`;
    $("#fDay").value = day.id; restoreForm(); $("#fDay").value = day.id;
    $("#fDay").addEventListener("change", () => { keepForm(); delete form.fSlot; renderCart(); });
  } else {
    const day = CONFIG.days.find(d => d.id === form.fDay) || CONFIG.days[0];
    body.innerHTML = `<div class="ci"><div class="t"><span>Teslimat</span><span>${esc(day.day)} · ${esc(form.fSlot)}</span></div><span class="muted">${esc(form.fSemt)}, İzmir<br>${esc(form.fName)} · ${esc(form.fTel)}<br>${esc(form.fAddr)}</span></div>
      <div class="totals"><div><span>${cart.length} ürün</span><span>${tl(s)}</span></div><div><span>Teslimat</span><span>Ücretsiz</span></div><div style="font-family:var(--display);font-size:26px"><span>Toplam</span><span>${tl(s)}</span></div></div>
      <p class="hint">Bu siparişle Erzak Barı'na ${tl(CONFIG.erzak.perOrder)} eklenir. Bizden, senden değil.</p>
      <label class="check" for="fOk"><input type="checkbox" id="fOk"><span>Ön bilgilendirme formunu ve mesafeli satış sözleşmesini okudum, onaylıyorum.</span></label>`;
    foot.innerHTML = `<a class="btn block" id="sendWa" href="#" target="_blank" rel="noopener noreferrer">WhatsApp ile siparişi gönder</a><button class="btn line sm" data-step="2">Geri</button><small class="muted">Sipariş özetin WhatsApp'a hazır mesaj olarak düşer. Ödemeyi teslimatta ya da göndereceğimiz linkle yaparsın.</small>`;
    $("#sendWa").href = waLink(day);
    $("#sendWa").addEventListener("click", e => { if (!$("#fOk").checked){ e.preventDefault(); toast("Önce sözleşme onayını işaretle"); } });
  }
}
function waLink(day){
  const F = form, L = [`Merhaba ${CONFIG.brand}, sipariş vermek istiyorum.`, ""];
  cart.forEach((c,i) => { L.push(`${i+1}. ${c.name}${c.freq ? " (" + freqLabel(c.freq) + ")" : ""} – ${tl(c.price)}`); c.lines.forEach(x => L.push("   " + x)); });
  L.push("", `Toplam: ${tl(subtotal())} (teslimat ücretsiz)`, `Teslimat: ${day.day} ${F.fSlot} · ${F.fSemt}, İzmir`, `Ad: ${F.fName}`, `Tel: ${F.fTel}`, `Adres: ${F.fAddr}`, `Kapıya bırakılabilir: ${F.fDoor ? "Evet" : "Hayır"}`, `Sandık: iade kuralını onayladı`, `Video paylaşımı: ${F.fVideo ? "İzin veriyorum" : "İzin vermiyorum"}`, `Bizi buradan duydum: ${F.fHeard}`);
  return "https://wa.me/" + encodeURIComponent(CONFIG.whatsapp) + "?text=" + encodeURIComponent(L.join("\n").slice(0, 3500));
}
$("#cart").addEventListener("click", e => {
  const rm = e.target.closest("[data-rm]"), q = e.target.closest("[data-quick]"), st = e.target.closest("[data-step]");
  if (rm){ cart.splice(+rm.dataset.rm, 1); save(); renderCart(); return; }
  if (q){ const k = KILER.find(x => x.id === q.dataset.quick); addToCart({ type:"kiler", id:k.id, name:k.name, price:k.price, lines:[] }, q); renderCart(); return; }
  if (st && !st.disabled){
    const to = +st.dataset.step;
    if (step === 2){
      keepForm();
      if (to === 3){
        const miss = [];
        if (!form.fName.trim()) miss.push("ad soyad");
        if (!/^[0-9 +()-]{10,20}$/.test(form.fTel.trim())) miss.push("geçerli bir telefon");
        if (form.fAddr.trim().length < 10) miss.push("açık adres");
        if (!form.fCrate) miss.push("sandık onayı");
        if (miss.length){ toast("Eksik: " + miss.join(", ")); return; }
      }
    }
    step = to; renderCart(); $("#cartBody").scrollTop = 0;
  }
});

/* ---------- sheets, modals ---------- */
function openSheet(id){ $$(".sheet.on").forEach(s => s.classList.remove("on")); $("#" + id).classList.add("on"); $("#scrim").classList.add("on"); }
function closeAll(){ $$(".sheet.on,.modal.on").forEach(s => s.classList.remove("on")); $("#scrim").classList.remove("on"); }
function openModal(id){ $("#" + id).classList.add("on"); $("#scrim").classList.add("on"); }
$("#cartBtn").addEventListener("click", () => { step = 1; renderCart(); openSheet("cart"); });
$("#menuBtn").addEventListener("click", () => openSheet("menu"));
$("#scrim").addEventListener("click", closeAll);
document.addEventListener("click", e => { if (e.target.closest("[data-close]")) closeAll(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") closeAll(); });

/* ---------- quiz (only on request) ---------- */
const QUIZ = [
  { q:"Kaç kişisiniz?", a:[["Bir, iki","2"],["Üç, dört","4"],["Beş ve üstü, ofis","6"]] },
  { q:"Kutu kimin için?", a:[["Kendim ve evim","ev"],["Birine hediye","hediye"],["Ofis","ofis"]] },
  { q:"Ne arıyorsun?", a:[["Mevsimin en iyileri","mevsim"],["Egzotik ve farklı","egzotik"],["Meyve ve sebze birlikte","karma"]] },
  { q:"Ne sıklıkla?", a:[["Bir deneyeyim","tek"],["İki haftada bir","iki"],["Her hafta","hafta"]] }
];
let qi = -1, qa = [], qname = "";
function renderQuiz(){
  const prog = `<div class="qprog">${[0,1,2,3,4].map(i => `<i class="${i <= qi ? "on" : ""}"></i>`).join("")}</div>`;
  const top = t => `<div class="qtop"><p class="eyebrow" style="margin:0">${t}</p><button class="xbtn" data-close aria-label="Kapat">×</button></div>`;
  if (qi === -1){
    $("#quizCard").innerHTML = prog + top("Sana hangi kutu?") + `<h2 id="qTitle" style="font-size:34px;margin:14px 0 8px">Dört soruda kutunu bulalım.</h2><p class="muted">Yarım dakika sürer.</p>
      <label class="field" for="qName" style="margin-top:20px">Sana nasıl hitap edelim? <span class="muted" style="font-weight:600">· isteğe bağlı</span><input id="qName" maxlength="30"></label>
      <button class="btn block" id="qStart" style="margin-top:18px">Başlayalım</button>`;
    $("#qName").value = qname; $("#qStart").onclick = () => { qname = $("#qName").value.trim().slice(0,30); qi = 0; renderQuiz(); };
    return;
  }
  if (qi < QUIZ.length){
    const s = QUIZ[qi];
    $("#quizCard").innerHTML = prog + top(`Soru ${qi+1} / ${QUIZ.length}`) + `<h2 id="qTitle" style="font-size:32px;margin-top:14px">${s.q}</h2><div class="qopts">${s.a.map(([l,v]) => `<button data-qa="${v}">${l}</button>`).join("")}</div>`;
    $$("[data-qa]").forEach(b => b.onclick = () => { qa[qi] = b.dataset.qa; qi++; renderQuiz(); });
    return;
  }
  const [kisi, kim, tur, fr] = qa;
  const rec = tur === "egzotik" || kim === "hediye" ? "seckin" : (kisi === "6" || kim === "ofis") ? "bolluk" : "sofra";
  const b = BOXES.find(x => x.id === rec), name = qname ? esc(qname) + ", " : "";
  $("#quizCard").innerHTML = prog + top("Senin kutun") + `<h2 id="qTitle" style="font-size:38px;margin:14px 0 10px">${name}${b.name}${tur === "karma" ? " + sebze" : ""}.</h2>
    <p class="muted">${b.kg}, ${b.cesit}, ${b.kisi}. ${b.desc}</p>
    <button class="btn block" id="qGo" style="margin-top:22px">Kutumu hazırla</button>`;
  store.set("tane_name", qname); greet();
  $("#qGo").onclick = () => { freq = fr; renderFreq(); renderBoxes(); closeAll(); openCfg(rec); C.freq = fr; C.veg = tur === "karma"; if (kim === "hediye"){ $("#cfgGift").checked = true; $("#giftDet").open = true; } renderCfg(); };
}
$("#openQuiz").addEventListener("click", () => { qi = -1; qa = []; renderQuiz(); openModal("quiz"); });
function greet(){ const n = store.get("tane_name"); const el = $("#hello"); if (typeof n === "string" && n){ el.textContent = `Merhaba ${n.slice(0,30)}, bu hafta senin için ayırdık.`; el.hidden = false; } else el.hidden = true; }

/* ---------- erzak, footer, legal ---------- */
function renderErzak(){
  const E = CONFIG.erzak, pct = Math.min(100, E.current / E.target * 100);
  $("#erzakTxt").textContent = `Her siparişten ${E.perOrder} TL bu bara eklenir. Bar ${E.target} siparişte dolar ve ihtiyacı olan bir aileye, mahalle muhtarlığı aracılığıyla bir erzak kolisi gider: un, pirinç, bakliyat, yağ, çay ve o haftanın meyvesi.`;
  $("#erzakNum").textContent = `${E.current} / ${E.target}`;
  $("#erzakSub").textContent = E.given ? `Bugüne kadar ${E.given} koli teslim edildi.` : "İlk bar ilk siparişle dolmaya başlıyor.";
  requestAnimationFrame(() => setTimeout(() => $("#erzakFill").style.width = Math.max(pct, E.current ? 2 : 0) + "%", 200));
}
const LEGAL = {
  mesafeli:["Mesafeli satış sözleşmesi","Bu alan, avukat tarafından hazırlanacak mesafeli satış sözleşmesi ve ön bilgilendirme formu içindir. Taze meyve ve sebze çabuk bozulabilen ürün olduğundan Mesafeli Sözleşmeler Yönetmeliği md. 15/c uyarınca cayma hakkı kapsamı dışındadır."],
  kvkk:["KVKK aydınlatma metni","Bu alan, kişisel verilerin işlenmesine ilişkin aydınlatma metni içindir. Ad, telefon ve adres yalnızca siparişin teslimi için kullanılır; site bu bilgileri bir sunucuya göndermez."],
  cerez:["Çerezler","Bu site sepetini ve tercihlerini yalnızca senin tarayıcında saklar. Reklam ölçümü eklendiğinde bu metin güncellenecektir."]
};
$$("[data-legal]").forEach(b => b.addEventListener("click", () => { const [t,x] = LEGAL[b.dataset.legal]; $("#lTitle").textContent = t; $("#lBody").textContent = x; openModal("legal"); }));
function renderFooter(){
  $("#waText").textContent = "+" + CONFIG.whatsapp.replace(/^(\d{2})(\d{3})(\d{3})(\d{2})(\d{2})$/, "$1 $2 $3 $4 $5");
  const names = { instagram:"Instagram", youtube:"YouTube", tiktok:"TikTok" };
  $("#footSoc").innerHTML = Object.entries(CONFIG.social).filter(([,u]) => /^https:\/\//.test(u)).map(([k,u]) => `<a href="${esc(u)}" target="_blank" rel="noopener noreferrer">${names[k]}</a>`).join(" · ");
}

/* ---------- small helpers ---------- */
function tween(el, from, to, done){
  if (reduce || from === to){ el.textContent = tl(to); done(to); return; }
  const t0 = performance.now();
  requestAnimationFrame(function st(t){ const k = Math.min(1, (t - t0) / 360), v = from + (to - from) * (1 - Math.pow(1 - k, 3)); el.textContent = tl(v); if (k < 1) requestAnimationFrame(st); else done(to); });
}
function toast(m){ const t = $("#toast"); t.textContent = m; t.classList.add("on"); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove("on"), 2400); }

/* ---------- reveal on scroll (content is visible at rest) ---------- */
if ("IntersectionObserver" in window && !reduce){
  const io = new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting){ x.target.classList.remove("pre"); io.unobserve(x.target); } }), { threshold:.15 });
  $$(".reveal").forEach(r => { if (r.getBoundingClientRect().top > innerHeight) r.classList.add("pre"); io.observe(r); });
}

/* ---------- init ---------- */
$("#heroArt").innerHTML = boxArt("mevsim", 7, 520, 400, 1.15, !reduce, true) + `<span class="tag">Sofra · 7–8 kg</span>`;
$("#ownIco").innerHTML = ownArt({ mandalina:1, ejder:2, mango:1, kivi:.5, nar:1 }, 300, 200);
$("#minNote").textContent = `Teslimat ücretsiz, en az sepet ${tl(CONFIG.minOrder)}. Sebze ve kiler ürünlerini kutunu hazırlarken ekleyebilirsin.`;
$("#ownTxt").textContent = `${CATALOG.length} meyve ve sebzeden seç, mandalinadan ejder meyvesine. En az ${tl(CONFIG.ownMin)}.`;
$("#stepTxt1").textContent = CONFIG.days.map(d => `${d.day} için ${DAYS[d.cutDay]} ${d.cutH}:00`).join(", ") + "'ye kadar.";
renderBar(); setInterval(renderBar, 60000);
renderFreq(); renderBoxes(); renderKiler(); renderErzak(); renderFooter(); save(); greet();
