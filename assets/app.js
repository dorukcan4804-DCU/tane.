"use strict";
/* Site baska bir sayfanin icine gomulurse acilmaz (clickjacking korumasi). */
if (window.top !== window.self) { try { window.top.location = window.self.location; } catch (e) { document.documentElement.style.display = "none"; } }

/* ================= AYARLAR: fiyatları ve bilgileri buradan güncelle ================= */
const CONFIG = {
  brand: "tane.",
  whatsapp: "905000000000",                 // başında 90, boşluksuz
  heroPhoto: { meyve: "img/hero-meyve.jpg", yesil: "img/hero-yesil.jpg" }, // fotoğraf yoksa çizim görünür
  vegAddPrice: 599, vegAlonePrice: 749,
  giftPrice: 150, boxReturnCredit: 30,
  freq: [ { id:"tek", label:"Tek sefer", off:0 }, { id:"iki", label:"2 haftada bir", off:.05 }, { id:"hafta", label:"Her hafta", off:.08 } ],
  firstOrderGift: "İlk aboneliğe taze sıkılmış portakal suyu (1 L) hediye",
  // Sosyal hesaplar: açınca tam adresi yaz (ör. "https://instagram.com/tane.kutu"). Boş olan görünmez.
  social: { instagram: "", youtube: "", tiktok: "" },
  // Sepet bu tutarı geçince hediye. 0 yaparsan kapanır.
  giftThreshold: 1800, giftLabel: "Taze sıkılmış portakal suyu (1 L)",
  // Okula bir tane: kutu başına ayrılan tutar, bugüne kadar dağıtılan meyve paketi (gerçek sayı), ilk dağıtım.
  school: { perBox: 10, given: 0, next: "Ocak 2027" },
  referral: 100
};
const BOXES = [
  { id:"tadim",  line:"meyve", name:"Tadım",  kg:"4–5 kg",   kgN:4.5,  cesit:"10+", kisi:"1–2 kişi",      people:2, price:849,  desc:"Haftanın en iyi on tanesi. İlk kutu için ideal." },
  { id:"sofra",  line:"meyve", name:"Sofra",  kg:"7–8 kg",   kgN:7.5,  cesit:"13+", kisi:"3–4 kişi",      people:4, price:1249, desc:"13+ çeşit ve haftanın özel meyvesi. Bir ailenin bir haftası.", hot:"En çok seçilen" },
  { id:"bolluk", line:"meyve", name:"Bolluk", kg:"11–12 kg", kgN:11.5, cesit:"15+", kisi:"5+ kişi, ofis", people:6, price:1749, desc:"Kalabalık sofralar ve ofis mutfakları için." },
  { id:"mutfak", line:"yesil", name:"Mutfak", kg:"6–7 kg",   kgN:6.5,  cesit:"12+", kisi:"3–4 kişi",      people:4, price:749,  desc:"Haftanın sebzesi ve yeşilliği. Meyve kutusuna eklersen 599 TL." }
];
const LIMITED = { id:"yilbasi", name:"Yılbaşı Sofrası", price:2490, stock:60, desc:"Sofra kutusu, iki kilo nar, süzme bal, hediye kutusu ve el yazısı kart." };
const ADDONS = [
  { id:"yumurta", icon:"yumurta", label:"Köy yumurtası, 30'lu", note:"Fethiye", price:249 },
  { id:"suyu",    icon:"suyu",    label:"Taze sıkılmış portakal suyu, 1 L", note:"Salı sabahı sıkılır", price:179 },
  { id:"avo",     icon:"avokado", label:"Avokado, 4'lü", note:"Alanya", price:229 },
  { id:"eksi",    icon:"eksi",    label:"Nar ekşisi, 250 ml", note:"Katkısız", price:189 },
  { id:"yesil",   icon:"yaprak",  label:"Yeşillik demeti", note:"Roka, tere, maydanoz", price:99 },
  { id:"narsuyu", icon:"narsuyu", label:"Taze sıkılmış nar suyu, 500 ml", note:"Kış sezonu", price:199 },
  { id:"kuru",    icon:"kuru",    label:"Kuru incir ve ceviz, 400 g", note:"Aydın · Denizli", price:289 },
  { id:"limon",   icon:"limon",   label:"Limon filesi, 1 kg", note:"Mersin", price:99 }
];
const WEEK = {
  meyve: [["mandalina","Mandalina","Seferihisar","12,4"],["mandalina","Portakal","Köyceğiz","11,8"],["nar","Nar","Antalya","15,1"],["avokado","Avokado","Alanya",""],["armut","Deveci armut","Bursa","13,0"],["kivi","Kivi","Yalova","14,2"],["hurma","Trabzon hurması","Aydın","18,5"],["elma","Starking elma","Isparta","13,6"]],
  yesil: [["domates","Domates","Kumluca",""],["biber","Çarliston biber","Antalya",""],["brokoli","Brokoli","Menemen",""],["yaprak","Ispanak","Torbalı",""],["havuc","Havuç","Beypazarı",""],["yaprak","Pırasa","Bayındır",""],["biber","Kabak","Demre",""],["yaprak","Roka ve tere","Bayındır",""]]
};
const STYLES = ["Dengeli","Çocuklu ev","Sporcu","Smoothie","Kahvaltı","Ofis"];
const TASTES = ["Daha tatlı","Dengeli","Ekşimsi"];
const SIZEPREF = ["Karışık","Küçük boy","İri"];
// cap = o teslimat günü hazırlanabilecek kutu, left = gerçekte kalan kutu. Siparişler geldikçe güncelle; sayı uydurma.
const CITIES = [
  { name:"İzmir",   day:"Çarşamba",  hours:"10:00–20:00", cutDay:1, cutH:20, cap:60, left:42, from:"Köyceğiz", semt:["Karşıyaka","Bostanlı","Mavişehir","Bayraklı","Bornova","Alsancak","Göztepe","Güzelyalı","Balçova","Narlıdere","Buca"] },
  { name:"Fethiye", day:"Cuma",      hours:"10:00–18:00", cutDay:3, cutH:20, cap:30, left:24, from:"Köyceğiz", semt:["Merkez","Çalış","Ölüdeniz","Ovacık","Hisarönü","Göcek","Karaçulha"] },
  { name:"Antalya", day:"Cumartesi", hours:"10:00–18:00", cutDay:3, cutH:20, cap:30, left:27, from:"Kumluca",  semt:["Konyaaltı","Lara","Muratpaşa","Kepez","Döşemealtı","Hurma","Kundu"] }
];
// Sıfırdan kutu: ürün fiyatları kilo/adet başına. Hazır kutular bilerek ~%15 daha avantajlı tutulur.
const OWN = {
  boxFee: 199, min: 600, maxKg: 14,
  products: {
    meyve: [
      { id:"mandalina", name:"Mandalina", origin:"Seferihisar", unit:"kg", step:.5, kg:1, price:129, icon:"mandalina", draw:["citrus","#E8832A"] },
      { id:"portakal",  name:"Portakal", origin:"Köyceğiz", unit:"kg", step:.5, kg:1, price:119, icon:"mandalina", draw:["citrus","#F09A35"] },
      { id:"nar",       name:"Nar", origin:"Antalya", unit:"kg", step:.5, kg:1, price:169, icon:"nar", draw:["nar"] },
      { id:"avokado",   name:"Avokado", origin:"Alanya", unit:"adet", step:1, kg:.25, price:69, icon:"avokado", draw:["avokado"] },
      { id:"armut",     name:"Deveci armut", origin:"Bursa", unit:"kg", step:.5, kg:1, price:179, icon:"armut", draw:["armut"] },
      { id:"kivi",      name:"Kivi", origin:"Yalova", unit:"kg", step:.5, kg:1, price:189, icon:"kivi", draw:["kivi"] },
      { id:"hurma",     name:"Trabzon hurması", origin:"Aydın", unit:"kg", step:.5, kg:1, price:169, icon:"hurma", draw:["hurma"] },
      { id:"elma",      name:"Starking elma", origin:"Isparta", unit:"kg", step:.5, kg:1, price:139, icon:"elma", draw:["elma"] }
    ],
    yesil: [
      { id:"domates", name:"Domates", origin:"Kumluca", unit:"kg", step:.5, kg:1, price:119, icon:"domates", draw:["domates"] },
      { id:"biber",   name:"Çarliston biber", origin:"Antalya", unit:"kg", step:.5, kg:1, price:129, icon:"biber", draw:["biber"] },
      { id:"brokoli", name:"Brokoli", origin:"Menemen", unit:"adet", step:1, kg:.5, price:89, icon:"brokoli", draw:["brokoli"] },
      { id:"ispanak", name:"Ispanak", origin:"Torbalı", unit:"demet", step:1, kg:.5, price:69, icon:"yaprak", draw:["yaprak"] },
      { id:"havuc",   name:"Havuç", origin:"Beypazarı", unit:"kg", step:.5, kg:1, price:79, icon:"havuc", draw:["havuc"] },
      { id:"pirasa",  name:"Pırasa", origin:"Bayındır", unit:"kg", step:.5, kg:1, price:89, icon:"yaprak", draw:["biber"] },
      { id:"kabak",   name:"Kabak", origin:"Demre", unit:"kg", step:.5, kg:1, price:99, icon:"biber", draw:["patlican"] },
      { id:"roka",    name:"Roka ve tere", origin:"Bayındır", unit:"demet", step:1, kg:.2, price:59, icon:"yaprak", draw:["yaprak"] }
    ]
  }
};
/* ==================================================================================== */

const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const esc = v => String(v == null ? "" : v).replace(/[&<>"'`]/g, ch => "&#" + ch.charCodeAt(0) + ";");
const tl = n => Math.round(n).toLocaleString("tr-TR") + " TL";
const store = { get(k){ try{ return JSON.parse(localStorage.getItem(k)) }catch(e){ return null } }, set(k,v){ try{ localStorage.setItem(k, JSON.stringify(v)) }catch(e){} } };
const sess = { get(k){ try{ return sessionStorage.getItem(k) }catch(e){ return null } }, set(k,v){ try{ sessionStorage.setItem(k,v) }catch(e){} } };
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const DAYS = ["Pazar","Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi"];

/* ---------- top-down open box illustration ---------- */
function rng(seed){ return () => (seed = (seed * 16807) % 2147483647) / 2147483647; }
const DRAW = {
  citrus:(x,y,r,c)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/><circle cx="${x-r*.3}" cy="${y-r*.3}" r="${r*.32}" fill="#fff" opacity=".18"/><circle cx="${x+r*.1}" cy="${y+r*.05}" r="${r*.08}" fill="#000" opacity=".2"/>`,
  nar:(x,y,r)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="#A3202F"/><circle cx="${x-r*.3}" cy="${y-r*.3}" r="${r*.3}" fill="#fff" opacity=".14"/><path d="M${x-r*.25} ${y-r*.15} l${r*.25} ${-r*.3} l${r*.25} ${r*.3} l${-r*.25} ${r*.12}z" fill="#6E1220"/>`,
  elma:(x,y,r)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="#B8262B"/><path d="M${x} ${y} q${r*.5} ${-r*.5} ${r*.9} ${-r*.3}" stroke="#E6B04A" stroke-width="${r*.12}" fill="none" opacity=".5"/><circle cx="${x}" cy="${y}" r="${r*.1}" fill="#4A2A12"/>`,
  armut:(x,y,r)=>`<ellipse cx="${x}" cy="${y}" rx="${r*.85}" ry="${r}" fill="#CDB848"/><circle cx="${x-r*.25}" cy="${y-r*.3}" r="${r*.28}" fill="#fff" opacity=".2"/><rect x="${x-r*.06}" y="${y-r*1.15}" width="${r*.12}" height="${r*.35}" fill="#5A3A1A"/>`,
  avokado:(x,y,r,_,a)=>`<ellipse cx="${x}" cy="${y}" rx="${r*.7}" ry="${r}" fill="#2F4A22" transform="rotate(${a} ${x} ${y})"/>`,
  kivi:(x,y,r)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="#6E4F2C"/><circle cx="${x}" cy="${y}" r="${r*.8}" fill="#8DB33E"/><circle cx="${x}" cy="${y}" r="${r*.25}" fill="#EFEBC4"/>`,
  hurma:(x,y,r)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="#E46A1E"/><path d="M${x-r*.4} ${y} L${x} ${y-r*.15} L${x+r*.4} ${y} L${x} ${y+r*.15}Z M${x} ${y-r*.4} L${x+r*.15} ${y} L${x} ${y+r*.4} L${x-r*.15} ${y}Z" fill="#4E5A2A"/>`,
  uzum:(x,y,r)=>{ let s=""; for(let i=0;i<9;i++){ const a=i*0.9, d=r*.55*(i%3?1:.3); s+=`<circle cx="${x+Math.cos(a)*d}" cy="${y+Math.sin(a)*d}" r="${r*.32}" fill="#5B2A4E"/>`; } return s; },
  domates:(x,y,r)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="#D23A28"/><circle cx="${x-r*.3}" cy="${y-r*.3}" r="${r*.28}" fill="#fff" opacity=".18"/><path d="M${x} ${y-r*.35} l${r*.12} ${r*.25} l${r*.28} ${r*.02} l${-r*.22} ${r*.16} l${r*.08} ${r*.28} l${-r*.26} ${-r*.16} l${-r*.26} ${r*.16} l${r*.08} ${-r*.28} l${-r*.22} ${-r*.16} l${r*.28} ${-r*.02}z" fill="#3F6B35"/>`,
  brokoli:(x,y,r)=>{ let s=""; for(let i=0;i<7;i++){ const a=i*0.9; s+=`<circle cx="${x+Math.cos(a)*r*.45}" cy="${y+Math.sin(a)*r*.45}" r="${r*.45}" fill="${i%2?"#3D7536":"#4C8A44"}"/>`; } return s; },
  havuc:(x,y,r,_,a)=>`<g transform="rotate(${a} ${x} ${y})"><path d="M${x-r*1.3} ${y-r*.22} L${x+r*1.2} ${y-r*.05} Q${x+r*1.4} ${y} ${x+r*1.2} ${y+r*.05} L${x-r*1.3} ${y+r*.22}Z" fill="#E8832A"/><path d="M${x-r*1.3} ${y} l${-r*.6} ${-r*.3} M${x-r*1.3} ${y} l${-r*.7} 0 M${x-r*1.3} ${y} l${-r*.6} ${r*.3}" stroke="#3F6B35" stroke-width="${r*.14}" stroke-linecap="round"/></g>`,
  yaprak:(x,y,r,_,a)=>`<g transform="rotate(${a} ${x} ${y})"><ellipse cx="${x}" cy="${y}" rx="${r*1.4}" ry="${r*.75}" fill="#4F8A3E"/><path d="M${x-r*1.3} ${y} L${x+r*1.3} ${y}" stroke="#2F5A26" stroke-width="${r*.08}"/></g>`,
  biber:(x,y,r,_,a)=>`<g transform="rotate(${a} ${x} ${y})"><ellipse cx="${x}" cy="${y}" rx="${r*1.3}" ry="${r*.45}" fill="#5DA247"/><ellipse cx="${x-r*.3}" cy="${y-r*.15}" rx="${r*.6}" ry="${r*.1}" fill="#fff" opacity=".2"/></g>`,
  patlican:(x,y,r,_,a)=>`<g transform="rotate(${a} ${x} ${y})"><ellipse cx="${x}" cy="${y}" rx="${r*1.25}" ry="${r*.6}" fill="#3A1E3F"/><path d="M${x-r*1.25} ${y} l${-r*.35} ${-r*.2} l0 ${r*.4}z" fill="#3F6B35"/></g>`,
  ayva:(x,y,r)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="#E2C13A"/><circle cx="${x-r*.3}" cy="${y-r*.3}" r="${r*.3}" fill="#fff" opacity=".2"/><circle cx="${x+r*.15}" cy="${y+r*.1}" r="${r*.12}" fill="#6B5A1A" opacity=".5"/>`,
  muz:(x,y,r,_,a)=>`<g transform="rotate(${a} ${x} ${y})"><path d="M${x-r*1.3} ${y-r*.2} Q${x} ${y+r*.9} ${x+r*1.3} ${y-r*.2} Q${x} ${y+r*.35} ${x-r*1.3} ${y-r*.2}Z" fill="#F2D13C"/><circle cx="${x-r*1.3}" cy="${y-r*.2}" r="${r*.12}" fill="#4A3A12"/></g>`,
  limon:(x,y,r)=>`<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r*.8}" fill="#E9CF3A"/><circle cx="${x-r*.3}" cy="${y-r*.2}" r="${r*.22}" fill="#fff" opacity=".25"/>`
};
const SETS = {
  meyve: [["citrus","#E8832A"],["citrus","#F09A35"],["nar"],["elma"],["armut"],["avokado"],["kivi"],["hurma"],["uzum"],["citrus","#F4B23C"],["elma"]],
  yesil: [["domates"],["brokoli"],["havuc"],["yaprak"],["biber"],["patlican"],["domates"],["limon"],["yaprak"],["brokoli"]]
};
function boxSVG(ln, seed, W, H, density = 1, animate = false){
  const R = rng(seed), pad = W*.07, iw = W - pad*2, ih = H - pad*2;
  const cols = Math.max(3, Math.round(6*density)), rows = Math.max(2, Math.round(cols*ih/iw)), cw = iw/cols, ch = ih/rows;
  const order = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) order.push([r,c]);
  for (let i = order.length - 1; i > 0; i--){ const j = Math.floor(R()*(i+1)); [order[i], order[j]] = [order[j], order[i]]; }
  let items = "";
  order.forEach(([r,c], i) => {
    const set = SETS[ln], it = set[Math.floor(R()*set.length)];
    const x = pad + cw*(c+.5) + (R()-.5)*cw*.3, y = pad + ch*(r+.5) + (R()-.5)*ch*.3;
    const rad = Math.min(cw,ch)*(.5 + R()*.1);
    items += `<g${animate ? ` class="it" style="animation-delay:${i*30}ms"` : ""}>${DRAW[it[0]](x, y, rad, it[1], Math.round(R()*180))}</g>`;
  });
  const t = ln === "meyve" ? "#F4D9D5" : "#DCE6D2", inner = ln === "meyve" ? "#D9AFA8" : "#B5C9A8";
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${W}" height="${H}" rx="10" fill="${inner}"/>
    <rect x="${pad*.45}" y="${pad*.45}" width="${W-pad*.9}" height="${H-pad*.9}" rx="6" fill="${t}"/>
    <rect x="${pad}" y="${pad}" width="${iw}" height="${ih}" fill="#FBF3EE" opacity=".5"/>
    ${items}
    <g transform="rotate(-6 ${W*.15} ${H*.17})"><rect x="${W*.05}" y="${H*.09}" width="${W*.2}" height="${H*.16}" rx="4" fill="#F8F1E6"/><text x="${W*.075}" y="${H*.19}" font-family="Fraunces, Georgia, serif" font-size="${H*.06}" fill="#1F1A17">tane.</text></g>
  </svg>`;
}

/* ---------- state ---------- */
let line = "meyve", freq = "tek", city = 0;
// Tarayıcıda saklanan sepet güvenilmez veridir: biçimi tutmayan kayıt atılır.
const validItem = c => c && typeof c === "object" && typeof c.name === "string" && c.name.length <= 80 && Number.isFinite(c.price) && c.price > 0 && c.price < 100000
  && ["box","addon","limited","own","scratch"].includes(c.type) && (c.lines === undefined || (Array.isArray(c.lines) && c.lines.length <= 12 && c.lines.every(l => typeof l === "string" && l.length <= 400)))
  && (c.freq === undefined || CONFIG.freq.some(f => f.id === c.freq)) && (c.type !== "box" || BOXES.some(b => b.id === c.id));
let cart = (() => { const c = store.get("tane_cart2"); return Array.isArray(c) ? c.filter(validItem).slice(0, 20) : []; })();

function setLine(l){
  line = l; document.documentElement.dataset.line = l;
  $$("[data-set-line]").forEach(b => b.setAttribute("aria-pressed", b.dataset.setLine === l));
  $("#heroArt").innerHTML = boxSVG(l, l === "meyve" ? 7 : 11, 1200, 720, 1.6, !reduce);
  $("#h1").innerHTML = l === "meyve" ? "Daldan kapına, <em>24 saatte.</em>" : "Tarladan mutfağına, <em>24 saatte.</em>";
  $("#lead").textContent = l === "meyve"
    ? "Salı sabahı bahçedeydi, Çarşamba kapında. Tane tane seçilmiş mevsim meyveleri, numaralı mühürlü kutuda. Kutular 849 TL'den, teslimat dahil."
    : "Sabah tarladaydı, ertesi gün mutfağında. Haftanın sebzesi ve yeşilliği tek kutuda. 749 TL; meyve kutusuna eklersen 599 TL.";
  $("#boxEyebrow").textContent = l === "meyve" ? "Meyve kutuları" : "Sebze kutusu";
  $("#boxTitle").textContent = l === "meyve" ? "Üç boy, bir standart." : "Mutfağın haftalığı.";
  loadPhoto(); renderBoxes(); renderWeekList(); renderLabel();
}
function loadPhoto(){
  const src = CONFIG.heroPhoto[line], hero = $("#hero"); hero.classList.remove("has-photo");
  if (!src) return; const img = new Image();
  img.onload = () => { $("#heroPhoto").style.backgroundImage = `url("${src}")`; hero.classList.add("has-photo"); };
  img.src = src;
}
$$("[data-set-line]").forEach(b => b.addEventListener("click", () => setLine(b.dataset.setLine)));

/* ---------- week card ---------- */
function nextCut(c){ const now = new Date(), d = new Date(now); d.setHours(c.cutH,0,0,0); let add = (c.cutDay - now.getDay() + 7) % 7; if (add === 0 && now >= d) add = 7; d.setDate(d.getDate() + add); return d; }
function renderCity(){
  const c = CITIES[city];
  $("#cityTabs").innerHTML = CITIES.map((x,i) => `<button aria-pressed="${i===city}" data-city="${i}">${x.name}</button>`).join("");
  $("#wkDay").textContent = `${c.day} · ${c.hours}`;
  $("#wkCut").textContent = `Sipariş kapanışı ${DAYS[c.cutDay]} ${c.cutH}:00 · teslimat dahil`;
  $("#capTxt").textContent = `${c.left} / ${c.cap} kaldı`;
  $("#capBar").style.width = Math.round((1 - c.left / c.cap) * 100) + "%";
  $("#bar").innerHTML = `${c.name} · <b>${DAYS[c.cutDay]} ${c.cutH}:00</b>'ye kadar sipariş ver, ${c.day} kapında · Teslimat dahil`;
  renderLabel(); tick();
}
$("#cityTabs").addEventListener("click", e => { const b = e.target.closest("[data-city]"); if (b){ city = +b.dataset.city; renderCity(); } });
function tick(){
  const c = CITIES[city], ms = nextCut(c) - new Date(), h = Math.floor(ms/3.6e6), m = Math.floor(ms%3.6e6/6e4);
  const txt = h >= 24 ? `${Math.floor(h/24)} gün ${h%24} sa` : `${h} sa ${m} dk`;
  $("#countdown").textContent = `Kapanışa ${txt} kaldı`;
}
setInterval(tick, 30000);

/* ---------- boxes ---------- */
const offOf = id => CONFIG.freq.find(f => f.id === id).off;
function renderFreq(){
  $("#freq").innerHTML = CONFIG.freq.map(f => `<button aria-pressed="${f.id===freq}" data-freq="${f.id}">${f.label}${f.off ? `<small>−%${Math.round(f.off*100)}</small>` : ""}</button>`).join("");
}
$("#freq").addEventListener("click", e => { const b = e.target.closest("[data-freq]"); if (b){ freq = b.dataset.freq; renderFreq(); renderBoxes(); } });
const perDay = b => Math.round(b.price * (1 - offOf(freq)) / b.people / 7);
function renderBoxes(){
  const list = BOXES.filter(b => b.line === line);
  $("#boxes").style.gridTemplateColumns = list.length === 1 ? "minmax(0,1fr)" : "";
  $("#boxes").innerHTML = list.map((b,i) => {
    const p = b.price * (1 - offOf(freq));
    return `<article class="box ${b.hot ? "hot" : ""}">
      <div class="art">${b.hot ? `<span class="badge">${b.hot}</span>` : ""}${boxSVG(b.line, 31 + i*13, 420, 280, b.kgN > 10 ? 1.25 : b.kgN > 6 ? 1 : .75)}</div>
      <div class="body">
        <h3>${b.name}</h3>
        <div class="facts"><span>${b.kg}</span><span>${b.cesit} çeşit</span><span>${b.kisi}</span></div>
        <p class="muted">${b.desc}</p>
        <p class="per">Kişi başı günde ~${perDay(b)} TL</p>
        <div class="pricerow"><span class="price">${offOf(freq) ? `<s>${tl(b.price)}</s>` : ""}${tl(p)}</span><button class="btn sm" data-cfg="${b.id}">Kutunu hazırla</button></div>
      </div></article>`;
  }).join("");
  $("#extraRow").innerHTML = line === "meyve"
    ? `<div class="limited"><span class="rib" aria-hidden="true"></span><div class="left"><p class="eyebrow" style="color:var(--warm)">Sınırlı · ${LIMITED.stock} adet</p><h3>${LIMITED.name}</h3><p class="muted">${LIMITED.desc}</p></div><div style="display:grid;gap:10px;justify-items:end;position:relative"><span class="price">${tl(LIMITED.price)}</span><button class="btn warm sm" data-limited>Ayır</button></div></div>`
    : `<div class="veg-note"><span><b>En iyisi ikisi bir arada.</b> <span class="muted">Sofra + Mutfak aynı teslimatla ${tl(1249 + CONFIG.vegAddPrice)}. Ayrı ayrı ${tl(1249 + CONFIG.vegAlonePrice)}.</span></span><button class="btn sm" data-cfg="sofra" data-withveg>Birlikte hazırla</button></div>`;
  $("#extraRow").innerHTML += `<div class="own-cta"><div class="mini" aria-hidden="true">${ownSVG({ [OWN.products[line][0].id]:2, [OWN.products[line][2].id]:1 }, 300, 200)}</div>
    <div><p class="eyebrow">Sıfırdan</p><h3>Kendi kutunu kur.</h3><p class="muted">Meyveyi ve sebzeyi tek tek, kilosuyla seç. Kutun gözünün önünde dolsun. En az ${tl(OWN.min)}.</p></div>
    <button class="btn" data-own>Kutunu doldur</button></div>`;
}
$("#kutular").addEventListener("click", e => {
  const c = e.target.closest("[data-cfg]"); if (c) openCfg(c.dataset.cfg, c.hasAttribute("data-withveg"));
  if (e.target.closest("[data-own]")) openOwn();
  const l = e.target.closest("[data-limited]"); if (l) addToCart({ type:"limited", id:LIMITED.id, price:LIMITED.price, name:LIMITED.name, lines:["Hediye kutusu ve kart dahil"] }, l);
});

/* ---------- configurator ---------- */
const C = {};
function openCfg(id, withVeg = false){
  const b = BOXES.find(x => x.id === id);
  Object.assign(C, { box:id, freq, veg: withVeg && b.line === "meyve", add:{}, out:[], fav:[], ripe:"Hemen yenecek", style:"Dengeli", taste:"Dengeli", szp:"Karışık" });
  $("#cfgGift").checked = false; $("#cfgNote").value = ""; $("#cfgSeal").value = "";
  $$("#cfg details").forEach(d => d.open = false);
  shown = 0; renderCfg(true); openSheet("cfg");
}
function cfgPrice(){
  const b = BOXES.find(x => x.id === C.box), off = offOf(C.freq);
  let p = b.price * (1 - off);
  if (C.veg) p += CONFIG.vegAddPrice * (1 - off);
  Object.entries(C.add).forEach(([k,q]) => p += ADDONS.find(a => a.id === k).price * q);
  if ($("#cfgGift").checked) p += CONFIG.giftPrice;
  return Math.round(p);
}
let shown = 0;
function tween(el, to){
  if (reduce){ el.textContent = tl(to); shown = to; return; }
  const from = shown, t0 = performance.now();
  const step = t => { const k = Math.min(1, (t - t0) / 380), v = from + (to - from) * (1 - Math.pow(1-k, 3)); el.textContent = tl(v); if (k < 1) requestAnimationFrame(step); else shown = to; };
  requestAnimationFrame(step);
}
function renderCfg(full){
  const b = BOXES.find(x => x.id === C.box), meyve = b.line === "meyve";
  $("#cfgTitle").textContent = `${b.name} · ${b.kg}`;
  const sizes = BOXES.filter(x => x.line === b.line);
  $("#sizeWrap").hidden = sizes.length < 2;
  $("#cfgSize").innerHTML = sizes.map(x => `<button aria-pressed="${x.id===C.box}" data-size="${x.id}">${x.name}<small>${x.kg}</small></button>`).join("");
  $("#cfgFreq").innerHTML = CONFIG.freq.map(f => `<button aria-pressed="${f.id===C.freq}" data-cfreq="${f.id}">${f.label}<small>${f.off ? "−%" + Math.round(f.off*100) : "esnek"}</small></button>`).join("");
  $("#vegToggle").hidden = !meyve; $("#cfgVeg").checked = C.veg; $("#vegToggle").classList.toggle("on", C.veg);
  $("#cfgAdd").innerHTML = ADDONS.filter(a => meyve || a.id !== "yesil").map(a => `<div class="ad"><svg aria-hidden="true"><use href="#i-${a.icon}"/></svg><span><b>${a.label}</b><small>${a.note} · ${tl(a.price)}</small></span>
    <span class="qty"><button aria-label="${a.label} azalt" data-dec="${a.id}">−</button><span>${C.add[a.id]||0}</span><button aria-label="${a.label} artır" data-inc="${a.id}">+</button></span></div>`).join("");
  const items = WEEK[b.line].map(w => w[1]);
  $("#cfgOut").innerHTML = items.map(i => `<button class="chip" aria-pressed="${C.out.includes(i)}" data-out="${i}" ${!C.out.includes(i) && C.out.length >= 3 ? "disabled" : ""}>${i}</button>`).join("");
  $("#cfgFav").innerHTML = items.filter(i => !C.out.includes(i)).map(i => `<button class="chip fav" aria-pressed="${C.fav.includes(i)}" data-fav="${i}" ${!C.fav.includes(i) && C.fav.length >= 2 ? "disabled" : ""}>${i}</button>`).join("");
  $("#cfgRipe").innerHTML = ["Hemen yenecek","Hafta boyunca olgunlaşsın"].map(r => `<button aria-pressed="${C.ripe===r}" data-ripe="${r}">${r}</button>`).join("");
  $("#cfgStyle").innerHTML = STYLES.map(x => `<button class="chip fav" aria-pressed="${C.style===x}" data-style="${x}">${x}</button>`).join("");
  $("#cfgTaste").innerHTML = TASTES.map(x => `<button aria-pressed="${C.taste===x}" data-taste="${x}">${x}</button>`).join("");
  $("#cfgSizePref").innerHTML = SIZEPREF.map(x => `<button aria-pressed="${C.szp===x}" data-szp="${x}">${x}</button>`).join("");
  const kg = b.kgN + Object.values(C.add).reduce((s,q) => s + q*.8, 0) + (C.veg ? 6.5 : 0);
  if (full || $("#cfgPreview").dataset.box !== C.box){
    $("#cfgPreview").dataset.box = C.box;
    $("#cfgPreview").innerHTML = boxSVG(b.line, 5 + sizes.indexOf(b)*3, 420, 260, b.kgN > 10 ? 1.25 : b.kgN > 6 ? 1 : .75, !reduce) +
      `<div class="fill"><span>Kutun</span><div class="meter"><i id="kgBar"></i></div><span class="num" id="kgTxt"></span></div>`;
  }
  requestAnimationFrame(() => { $("#kgBar").style.width = Math.min(100, kg/22*100) + "%"; });
  $("#kgTxt").textContent = "~" + kg.toFixed(1).replace(".", ",") + " kg";
  $("#cfgFreqLbl").textContent = CONFIG.freq.find(f => f.id === C.freq).label + (C.veg ? " · meyve + sebze" : "");
  $("#cfgPer").textContent = C.freq !== "tek" ? "İstediğin hafta atla, istediğin zaman bırak" : "Abone olursan %5–8 daha az ödersin";
  tween($("#cfgTotal"), cfgPrice());
}
$("#cfg").addEventListener("click", e => {
  const t = e.target.closest("button"); if (!t || t.disabled) return; const d = t.dataset;
  if (d.size) C.box = d.size;
  else if (d.cfreq) C.freq = d.cfreq;
  else if (d.inc) C.add[d.inc] = Math.min(5, (C.add[d.inc]||0) + 1);
  else if (d.dec){ C.add[d.dec] = Math.max(0, (C.add[d.dec]||0) - 1); if (!C.add[d.dec]) delete C.add[d.dec]; }
  else if (d.out){ C.out = C.out.includes(d.out) ? C.out.filter(x => x !== d.out) : [...C.out, d.out]; C.fav = C.fav.filter(x => x !== d.out); }
  else if (d.fav) C.fav = C.fav.includes(d.fav) ? C.fav.filter(x => x !== d.fav) : [...C.fav, d.fav];
  else if (d.ripe) C.ripe = d.ripe;
  else if (d.style) C.style = d.style;
  else if (d.taste) C.taste = d.taste;
  else if (d.szp) C.szp = d.szp;
  else return;
  renderCfg();
});
$("#cfgVeg").addEventListener("change", e => { C.veg = e.target.checked; renderCfg(); });
$("#cfgGift").addEventListener("change", () => tween($("#cfgTotal"), cfgPrice()));
function describeCfg(){
  const l = [];
  if (C.veg) l.push("+ Mutfak sebze kutusu");
  Object.entries(C.add).forEach(([k,q]) => l.push(`+ ${q} × ${ADDONS.find(a => a.id === k).label}`));
  if (C.out.length) l.push("Çıkar: " + C.out.join(", "));
  if (C.fav.length) l.push("Favori: " + C.fav.join(", "));
  if (C.ripe !== "Hemen yenecek") l.push("Olgunluk: " + C.ripe);
  if (C.style !== "Dengeli") l.push("Karakter: " + C.style);
  if (C.taste !== "Dengeli") l.push("Tat: " + C.taste);
  if (C.szp !== "Karışık") l.push("Boy: " + C.szp);
  const sl = $("#cfgSeal").value.trim(); if (sl) l.push(`Mühürde: “${sl}”`);
  if ($("#cfgGift").checked) l.push("Hediye paketi");
  const n = $("#cfgNote").value.trim(); if (n) l.push(`Not: “${n}”`);
  return l;
}

/* ---------- build your own box ---------- */
const O = { tab:"meyve", q:{}, ripe:"Hemen yenecek" };
const allProducts = () => [...OWN.products.meyve, ...OWN.products.yesil];
const prod = id => allProducts().find(p => p.id === id);
const ownKg = () => Object.entries(O.q).reduce((s,[id,q]) => s + q * prod(id).kg, 0);
const ownItems = () => Object.entries(O.q).reduce((s,[id,q]) => s + q * prod(id).price, 0);
const ownTotal = () => Math.round(ownItems() + (ownItems() ? OWN.boxFee : 0) + ($("#ownGift").checked ? CONFIG.giftPrice : 0));
const fmtQ = p => { const q = O.q[p.id] || 0; return p.unit === "kg" ? q.toString().replace(".", ",") + " kg" : q + " " + p.unit; };
function ownSVG(q, W = 420, H = 260, animate = false){
  const pad = W*.07, iw = W - pad*2, ih = H - pad*2, cols = 7, rows = 4, cw = iw/cols, ch = ih/rows;
  const kg = Object.entries(q).reduce((s,[id,n]) => s + n * prod(id).kg, 0);
  const cells = Math.min(cols*rows, Math.round(kg / OWN.maxKg * cols*rows * 1.4));
  const pool = []; const tot = kg || 1;
  Object.entries(q).forEach(([id,n]) => { const k = Math.max(1, Math.round(n * prod(id).kg / tot * cells)); for (let i = 0; i < k; i++) pool.push(prod(id).draw); });
  const R = rng(17); let items = "";
  for (let i = 0; i < Math.min(cells, pool.length); i++){
    const c = i % cols, r = rows - 1 - Math.floor(i / cols), d = pool[i];
    const x = pad + cw*(c+.5) + (R()-.5)*cw*.25, y = pad + ch*(r+.5) + (R()-.5)*ch*.25;
    items += `<g${animate && i === pool.length - 1 ? ` class="it"` : ""}>${DRAW[d[0]](x, y, Math.min(cw,ch)*.52, d[1], Math.round(R()*180))}</g>`;
  }
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg"><rect width="${W}" height="${H}" rx="10" fill="#D9C5BC"/><rect x="${pad*.45}" y="${pad*.45}" width="${W-pad*.9}" height="${H-pad*.9}" rx="6" fill="#F6ECE6"/>
    <rect x="${pad}" y="${pad}" width="${iw}" height="${ih}" fill="#FBF3EE" stroke="#E6D3CB" stroke-dasharray="6 6"/>${items}</svg>`;
}
function openOwn(){ O.tab = line; renderOwn(true); openSheet("own"); }
function renderOwn(full){
  $("#ownTabs").innerHTML = [["meyve","Meyve"],["yesil","Sebze"]].map(([k,l]) => `<button aria-pressed="${O.tab===k}" data-otab="${k}">${l}<small>${OWN.products[k].filter(p => O.q[p.id]).length} çeşit seçili</small></button>`).join("");
  $("#ownList").innerHTML = OWN.products[O.tab].map(p => `<div class="pr ${O.q[p.id] ? "on" : ""}"><svg aria-hidden="true"><use href="#i-${p.icon}"/></svg><span><b>${p.name}</b><small>${p.origin} · ${tl(p.price)} / ${p.unit}</small></span>
    <span class="qty"><button aria-label="${p.name} azalt" data-odec="${p.id}">−</button><span>${fmtQ(p)}</span><button aria-label="${p.name} artır" data-oinc="${p.id}">+</button></span></div>`).join("");
  $("#ownRipe").innerHTML = ["Hemen yenecek","Hafta boyunca olgunlaşsın"].map(r => `<button aria-pressed="${O.ripe===r}" data-oripe="${r}">${r}</button>`).join("");
  const kg = ownKg(), items = ownItems(), tot = ownTotal();
  $("#ownPreview").innerHTML = ownSVG(O.q, 420, 260, !reduce && !full) + `<div class="fill"><span>Kutun</span><div class="meter"><i id="ownBar"></i></div><span class="num">${kg.toFixed(1).replace(".", ",")} / ${OWN.maxKg} kg</span></div>`;
  requestAnimationFrame(() => { const b = $("#ownBar"); if (b) b.style.width = Math.min(100, kg / OWN.maxKg * 100) + "%"; });
  $("#ownKg").textContent = `~${kg.toFixed(1).replace(".", ",")} kg · ${Object.keys(O.q).length} çeşit`;
  $("#ownFee").textContent = items ? `Ürünler ${tl(items)} + kutu, mühür ve teslimat ${tl(OWN.boxFee)}` : "Ürün seçtikçe kutun dolar";
  tweenTo($("#ownTotal"), tot);
  const warn = !items ? "Kutuna ilk ürünü ekle." : items < OWN.min ? `En az ${tl(OWN.min)} ürün gerekli, ${tl(OWN.min - items)} kaldı.` : kg > OWN.maxKg ? `Bir kutuya en fazla ${OWN.maxKg} kg sığar.` : "";
  $("#ownWarn").textContent = warn; $("#ownAdd").disabled = !!warn; $("#ownAdd").style.opacity = warn ? .5 : 1;
  const onlyFruit = Object.keys(O.q).every(id => OWN.products.meyve.some(p => p.id === id));
  const sofra = BOXES.find(b => b.id === "sofra"), bolluk = BOXES.find(b => b.id === "bolluk");
  const ref = kg >= 6 && kg < 9.5 ? sofra : kg >= 9.5 ? bolluk : null;
  if (ref && onlyFruit && tot > ref.price){
    $("#ownCompare").hidden = false;
    $("#ownCompare").innerHTML = `<span>Seçimin <b>${ref.name}</b> kutusuna yakın (${ref.kg}, ${ref.cesit} çeşit). ${ref.name} ile <b>${tl(tot - ref.price)} daha az</b> ödersin; istemediklerini orada da çıkarabilirsin.</span><button class="btn sm line" data-toref="${ref.id}">${ref.name} kutusuna geç</button>`;
  } else $("#ownCompare").hidden = true;
}
let ownShown = 0;
function tweenTo(el, to){
  if (reduce){ el.textContent = tl(to); ownShown = to; return; }
  const from = ownShown, t0 = performance.now();
  const step = t => { const k = Math.min(1, (t - t0) / 360), v = from + (to - from) * (1 - Math.pow(1-k, 3)); el.textContent = tl(v); if (k < 1) requestAnimationFrame(step); else ownShown = to; };
  requestAnimationFrame(step);
}
$("#own").addEventListener("click", e => {
  const t = e.target.closest("button"); if (!t || t.disabled) return; const d = t.dataset;
  if (d.otab) O.tab = d.otab;
  else if (d.oinc){ const p = prod(d.oinc); if (ownKg() + p.step * p.kg > OWN.maxKg + .01){ toast(`Bir kutuya en fazla ${OWN.maxKg} kg sığar`); return; } O.q[p.id] = Math.round(((O.q[p.id]||0) + p.step) * 10) / 10; }
  else if (d.odec){ const p = prod(d.odec); O.q[p.id] = Math.round(((O.q[p.id]||0) - p.step) * 10) / 10; if (O.q[p.id] <= 0) delete O.q[p.id]; }
  else if (d.oripe) O.ripe = d.oripe;
  else if (d.toref){ closeSheets(); setTimeout(() => openCfg(d.toref), 200); return; }
  else return;
  renderOwn();
});
$("#ownGift").addEventListener("change", () => renderOwn(true));
$("#ownAdd").addEventListener("click", e => {
  const lines = Object.entries(O.q).map(([id]) => `${fmtQ(prod(id))} ${prod(id).name}`);
  if (O.ripe !== "Hemen yenecek") lines.push("Olgunluk: " + O.ripe);
  const sl = $("#ownSeal").value.trim(); if (sl) lines.push(`Mühürde: “${sl}”`);
  if ($("#ownGift").checked) lines.push("Hediye paketi");
  const n = $("#ownNote").value.trim(); if (n) lines.push(`Not: “${n}”`);
  addToCart({ type:"own", id:"own", name:"Kendi kutun · ~" + ownKg().toFixed(1).replace(".", ",") + " kg", price:ownTotal(), lines }, e.currentTarget);
  O.q = {}; $("#ownSeal").value = ""; $("#ownNote").value = ""; $("#ownGift").checked = false; ownShown = 0;
  setTimeout(closeSheets, 250);
});
$("#cfgAddBtn").addEventListener("click", e => {
  const b = BOXES.find(x => x.id === C.box);
  addToCart({ type:"box", id:b.id, name:b.name, freq:C.freq, price:cfgPrice(), lines:describeCfg() }, e.currentTarget);
  setTimeout(closeSheets, 250);
});

/* ---------- side products, journal, school ---------- */
function renderSide(){
  $("#sideGrid").innerHTML = ADDONS.slice(0,4).map(a => `<div class="sp"><svg aria-hidden="true"><use href="#i-${a.icon}"/></svg><b>${a.label}</b><small>${a.note}</small><div class="r"><span>${tl(a.price)}</span><button class="btn sm line" data-side="${a.id}">Ekle</button></div></div>`).join("");
  const T = CONFIG.giftThreshold;
  $("#giftLine").hidden = !T;
  $("#giftLine").innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M20 12v8H4v-8M2 7h20v5H2zM12 22V7M12 7c-2-4-6-4-6-1s6 1 6 1zm0 0c2-4 6-4 6-1s-6 1-6 1z"/></svg><span><b>${tl(T)} ve üzeri sepete ${CONFIG.giftLabel} hediye.</b> </span>`;
}
$("#sideGrid").addEventListener("click", e => { const b = e.target.closest("[data-side]"); if (!b) return; const a = ADDONS.find(x => x.id === b.dataset.side); addToCart({ type:"addon", id:a.id, name:a.label, price:a.price, lines:[] }, b); });
function renderCommunity(){
  const names = { instagram:"Instagram", youtube:"YouTube", tiktok:"TikTok" };
  const links = Object.entries(CONFIG.social).filter(([,u]) => u).map(([k,u]) => `<a class="btn sm line" href="${u}" target="_blank" rel="noopener">${names[k]}</a>`);
  ($("#socials") || {}).innerHTML = links.length ? `<span class="muted" style="font-weight:700">Takip et:</span>` + links.join("") : `<span class="muted">Instagram, YouTube ve TikTok hesaplarımız açılıyor. İlk bölüm lansman haftasında.</span>`;
  $("#footSoc").innerHTML = Object.entries(CONFIG.social).filter(([,u]) => u).map(([k,u]) => `<a href="${u}" target="_blank" rel="noopener">${names[k]}</a>`).join(" · ");
  const sc = CONFIG.school;
  $("#schoolTxt").textContent = `Sattığımız her kutudan ${sc.perBox} TL ayırıyoruz. Ayda bir kez bir ilkokula gidip öğrencilere mevsim meyvesi dağıtıyoruz. Hangi okula gittiğimizi ve kaç meyve dağıttığımızı burada yazacağız.`;
  $("#schoolStat").textContent = sc.given ? sc.given.toLocaleString("tr-TR") : sc.next;
  $("#schoolSub").textContent = sc.given ? "meyve paketi bugüne kadar dağıtıldı" : "ilk okul ziyaretimiz";
  ($("#refAmt") || {}).textContent = tl(CONFIG.referral);
  ($("#ofisBtn") || {}).href = "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(`Merhaba ${CONFIG.brand}, ofisimiz için haftalık meyve kutusu teklifi almak istiyorum.`);
}

/* ---------- cart ---------- */
let stepN = 1, form = {};
function save(){ store.set("tane_cart2", cart); $("#cartCount").textContent = cart.length; }
function fly(from){
  if (reduce || !from) return;
  const r = from.getBoundingClientRect(), t = $("#cartBtn").getBoundingClientRect();
  const d = document.createElement("div");
  d.innerHTML = `<svg width="34" height="34"><use href="#i-${line === "meyve" ? "mandalina" : "domates"}"/></svg>`;
  Object.assign(d.style, { position:"fixed", zIndex:130, left:(r.left + r.width/2 - 17)+"px", top:(r.top + r.height/2 - 17)+"px", pointerEvents:"none", transition:"transform .75s cubic-bezier(.5,-.4,.5,1), opacity .75s" });
  document.body.appendChild(d);
  requestAnimationFrame(() => requestAnimationFrame(() => { d.style.transform = `translate(${t.left + t.width/2 - r.left - r.width/2}px, ${t.top + t.height/2 - r.top - r.height/2}px) scale(.4) rotate(220deg)`; d.style.opacity = ".3"; }));
  setTimeout(() => { d.remove(); $("#cartBtn").classList.add("bump"); setTimeout(() => $("#cartBtn").classList.remove("bump"), 500); }, 760);
}
function addToCart(item, from){ cart.push(item); save(); fly(from); toast(item.name + " sepete eklendi"); }
const subtotal = () => cart.reduce((s,c) => s + c.price, 0);
const finalTotal = () => subtotal() - (form.retBox ? CONFIG.boxReturnCredit : 0);
const shield = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z"/><path d="M9 12l2 2 4-4"/></svg>`;
const hasBox = () => cart.some(c => c.type !== "addon");
const giftOn = () => CONFIG.giftThreshold > 0 && hasBox() && subtotal() >= CONFIG.giftThreshold;
function giftBar(){
  const T = CONFIG.giftThreshold; if (!T) return "";
  const s = subtotal(), left = T - s;
  return `<div class="giftbar"><span>${left > 0 ? `${tl(left)} daha ekle, ${CONFIG.giftLabel} hediye` : `Hediyen kutuda: ${CONFIG.giftLabel}`}</span><div class="meter"><i style="width:${Math.min(100, s / T * 100)}%"></i></div></div>`;
}
function renderCart(){
  ["#st1","#st2","#st3"].forEach((x,i) => $(x).classList.toggle("on", i < stepN));
  const body = $("#cartBody"), foot = $("#cartFoot");
  if (!cart.length){ body.innerHTML = `<p class="empty">Sepetin boş.<br><a href="#kutular" data-closesheet>Kutulara göz at</a></p>`; foot.innerHTML = ""; return; }
  if (stepN === 1){
    const hasVeg = cart.some(c => (c.lines||[]).includes("+ Mutfak sebze kutusu") || c.id === "mutfak");
    const hasMeyve = cart.some(c => (c.type === "box" && BOXES.find(b => b.id === c.id).line === "meyve") || c.type === "limited");
    body.innerHTML = giftBar() + cart.map((c,i) => `<div class="ci"><div class="t"><span>${esc(c.name)}${c.freq ? " · " + CONFIG.freq.find(f => f.id === c.freq).label : ""}</span><span class="num">${tl(c.price)}</span></div>${c.lines && c.lines.length ? `<span class="muted">${c.lines.map(esc).join(" · ")}</span>` : ""}<button class="rm" data-rm="${i}">Kaldır</button></div>`).join("")
      + (hasMeyve && !hasVeg ? `<div class="bumpbox"><b>Sebze kutusunu da ekle, 150 TL kazan.</b><span class="muted">Aynı teslimatla gelir: 749 yerine 599 TL.</span><button class="btn sm" data-bumpveg>Mutfak kutusunu ekle · 599 TL</button></div>` : "")
      + `<div class="bumpbox" style="border-style:solid;border-color:var(--line)"><b>Kutunun yanına</b><div class="addons">${ADDONS.filter(a => !cart.some(c => c.type === "addon" && c.id === a.id)).slice(0,4).map(a => `<div class="ad"><svg aria-hidden="true"><use href="#i-${a.icon}"/></svg><span><b>${a.label}</b><small>${tl(a.price)}</small></span><button class="btn sm line" data-quickadd="${a.id}">Ekle</button></div>`).join("")}</div></div>`;
    foot.innerHTML = `<div class="total"><span>Ara toplam<br><small class="muted">Teslimat dahil</small></span><b class="num">${tl(subtotal())}</b></div><button class="btn" data-step="2">Teslimat bilgileri</button><div class="guarantee">${shield}Tane garantisi · bağlılık yok · kapıda ya da linkle ödeme</div>`;
  } else if (stepN === 2){
    const c = CITIES[city];
    body.innerHTML = `<div class="two"><label class="field" for="fCity">Şehir<select id="fCity">${CITIES.map((x,i) => `<option value="${i}" ${i===city?"selected":""}>${x.name}</option>`).join("")}</select></label>
      <label class="field" for="fSlot">${c.day} · saat<select id="fSlot"><option>10:00–14:00</option><option>14:00–18:00</option>${c.name === "İzmir" ? "<option>18:00–20:00</option>" : ""}</select></label></div>
      <label class="field" for="fSemt">Semt<select id="fSemt">${c.semt.map(s => `<option>${s}</option>`).join("")}</select></label>
      <div class="two"><label class="field" for="fName">Ad soyad<input id="fName" autocomplete="name" maxlength="60" placeholder="Elif Yılmaz"></label><label class="field" for="fTel">Telefon<input id="fTel" type="tel" inputmode="tel" autocomplete="tel" maxlength="20" placeholder="05xx xxx xx xx"></label></div>
      <label class="field" for="fAddr">Açık adres<textarea id="fAddr" maxlength="240" placeholder="Mahalle, sokak, bina, daire"></textarea></label>
      <label class="field" for="fHeard">Bizi nereden duydun?<select id="fHeard"><option>Instagram</option><option>TikTok</option><option>YouTube</option><option>Google</option><option>Arkadaş tavsiyesi</option><option>Diğer</option></select></label>
      <label class="check" for="retBox"><input type="checkbox" id="retBox"> Önceki boş kutumu teslimatta geri vereceğim (−${CONFIG.boxReturnCredit} TL)</label>
      <label class="check" for="fDoor"><input type="checkbox" id="fDoor" checked> Evde yoksam kutu kapıya ya da kapıcıya bırakılabilir</label>
      <label class="field" for="fRef">Seni davet eden <span class="muted" style="font-weight:600">· varsa, ikinize de ${tl(CONFIG.referral)}</span><input id="fRef" maxlength="60" placeholder="Arkadaşının adı soyadı"></label>
      <label class="check" for="fVideo"><input type="checkbox" id="fVideo"> Teslimatımın videosu sosyal medyada paylaşılabilir (yüzüm ve adresim görünmeden)</label>`;
    foot.innerHTML = `<div class="total"><span>Toplam<br><small class="muted">Teslimat dahil</small></span><b class="num" id="ttl">${tl(finalTotal())}</b></div><div style="display:grid;grid-template-columns:auto 1fr;gap:8px"><button class="btn line sm" data-step="1">Geri</button><button class="btn" data-step="3">Devam</button></div>`;
    restoreForm();
    $("#fCity").addEventListener("change", e => { keepForm(); city = +e.target.value; delete form.fSemt; delete form.fSlot; renderCity(); renderCart(); });
    $("#retBox").addEventListener("change", e => { form.retBox = e.target.checked; $("#ttl").textContent = tl(finalTotal()); });
  } else {
    const c = CITIES[city], F = form;
    body.innerHTML = `<div class="ci"><div class="t"><span>Teslimat</span><span>${c.name}</span></div><span class="muted">${esc(F.fSemt)} · ${c.day} ${esc(F.fSlot)}<br>${esc(F.fName)} · ${esc(F.fTel)}<br>${esc(F.fAddr)}</span></div>
      <div class="totals"><div><span>Kutular</span><span>${tl(subtotal())}</span></div>${F.retBox ? `<div><span>Kutu iadesi</span><span>−${tl(CONFIG.boxReturnCredit)}</span></div>` : ""}${giftOn() ? `<div><span>Hediye: ${CONFIG.giftLabel}</span><span>0 TL</span></div>` : ""}<div><span>Teslimat</span><span>Dahil</span></div><div style="font-family:var(--display);font-size:26px"><span>Toplam</span><span>${tl(finalTotal())}</span></div></div>
      ${cart.some(x => x.freq && x.freq !== "tek") ? `<p class="guarantee">${shield}${CONFIG.firstOrderGift}</p>` : ""}
      <label class="check" for="fOk"><input type="checkbox" id="fOk"> Ön bilgilendirme formunu ve mesafeli satış sözleşmesini okudum, onaylıyorum.</label>`;
    foot.innerHTML = `<a class="btn" id="sendWa" href="#" target="_blank" rel="noopener">WhatsApp ile siparişi gönder</a><button class="btn line sm" data-step="2">Geri</button><small class="muted">Sipariş özetin WhatsApp'a hazır mesaj olarak düşer. Ödeme kapıda ya da göndereceğimiz linkle.</small>`;
    $("#sendWa").href = waLink();
    $("#sendWa").addEventListener("click", e => { if (!$("#fOk").checked){ e.preventDefault(); toast("Önce sözleşme onayını işaretle"); } else toast("Sipariş mesajın WhatsApp'ta hazır"); });
  }
}
const FIELDS = ["fSemt","fSlot","fName","fTel","fAddr","fHeard","retBox","fDoor","fRef","fVideo"];
function keepForm(){ FIELDS.forEach(f => { const el = $("#" + f); if (el) form[f] = el.type === "checkbox" ? el.checked : el.value; }); }
function restoreForm(){ FIELDS.forEach(f => { const el = $("#" + f); if (!el || form[f] === undefined) return; if (el.type === "checkbox") el.checked = form[f]; else if (el.tagName !== "SELECT" || [...el.options].some(o => o.value === form[f])) el.value = form[f]; }); }
function waLink(){
  const c = CITIES[city], F = form, L = [`Merhaba ${CONFIG.brand}, sipariş vermek istiyorum.`, ""];
  cart.forEach((x,i) => { L.push(`${i+1}. ${x.name}${x.freq ? " (" + CONFIG.freq.find(f => f.id === x.freq).label + ")" : ""} – ${tl(x.price)}`); (x.lines||[]).forEach(l => L.push("   " + l)); });
  L.push("", `Toplam: ${tl(finalTotal())}${F.retBox ? " (kutu iadesi düşüldü)" : ""}`, `Teslimat: ${c.name}, ${F.fSemt} · ${c.day} ${F.fSlot}`, `Ad: ${F.fName}`, `Tel: ${F.fTel}`, `Adres: ${F.fAddr}`, `Kapıya bırakılabilir: ${F.fDoor ? "Evet" : "Hayır"}`, `Bizi buradan duydum: ${F.fHeard}`, ...(F.fRef && F.fRef.trim() ? [`Davet eden: ${F.fRef.trim()}`] : []), `Video paylaşımı: ${F.fVideo ? "İzin veriyorum" : "İzin vermiyorum"}`, ...(giftOn() ? [`Hediye: ${CONFIG.giftLabel}`] : []));
  return "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(L.join("\n"));
}
$("#cart").addEventListener("click", e => {
  const s = e.target.closest("[data-step]"), rm = e.target.closest("[data-rm]"), qa = e.target.closest("[data-quickadd]"), bv = e.target.closest("[data-bumpveg]");
  if (rm){ cart.splice(+rm.dataset.rm, 1); save(); renderCart(); }
  if (qa){ const a = ADDONS.find(x => x.id === qa.dataset.quickadd); addToCart({ type:"addon", id:a.id, name:a.label, price:a.price, lines:[] }, qa); renderCart(); }
  if (bv){ addToCart({ type:"addon", id:"mutfak", name:"Mutfak sebze kutusu (meyveyle)", price:CONFIG.vegAddPrice, lines:[] }, bv); renderCart(); }
  if (s){
    const to = +s.dataset.step;
    if (to > 1 && !hasBox()){ toast("Yan ürünler kutuyla birlikte gelir. Önce bir kutu seç"); return; }
    if (stepN === 2) keepForm();
    if (stepN === 2 && to === 3){ const miss = []; if (!form.fName.trim()) miss.push("ad soyad"); if (!/^[0-9 +()-]{10,20}$/.test(form.fTel.trim())) miss.push("geçerli bir telefon"); if (!form.fAddr.trim()) miss.push("adres"); if (miss.length){ toast("Eksik: " + miss.join(", ")); return; } }
    stepN = to; renderCart(); $("#cartBody").scrollTop = 0;
  }
});

/* ---------- sheets + modals ---------- */
function openSheet(id){ $$(".sheet.on").forEach(s => s.classList.remove("on")); $("#" + id).classList.add("on"); $("#scrim").classList.add("on"); }
function closeSheets(){ $$(".sheet.on").forEach(s => s.classList.remove("on")); if (!$(".modal.on")) $("#scrim").classList.remove("on"); }
$("#cartBtn").addEventListener("click", () => { stepN = 1; renderCart(); openSheet("cart"); });
document.addEventListener("click", e => { if (e.target.closest("[data-closesheet]")) closeSheets(); if (e.target.closest("[data-close]")) closeModals(); });
$("#scrim").addEventListener("click", () => { closeSheets(); closeModals(); });
document.addEventListener("keydown", e => { if (e.key === "Escape"){ closeSheets(); closeModals(); } });
function openModal(id){ $("#" + id).classList.add("on"); $("#scrim").classList.add("on"); const f = $("#" + id).querySelector("button, input"); f && f.focus(); }
function closeModals(){ $$(".modal.on").forEach(m => m.classList.remove("on")); if (!$(".sheet.on")) $("#scrim").classList.remove("on"); }

/* ---------- quiz ---------- */
const QUIZ = [
  { q:"Kaç kişisiniz?", a:[["Bir ya da iki","1"],["Üç, dört","3"],["Beş ve üstü ya da ofis","5"]] },
  { q:"Sofranda en çok ne eksik?", a:[["Meyve","meyve"],["Sebze ve yeşillik","yesil"],["İkisi de","karma"]] },
  { q:"Kimin için?", a:[["Kendim ve evim","ev"],["Birine hediye","hediye"],["Ofis","ofis"]] },
  { q:"Ne sıklıkla?", a:[["Bir deneyeyim","tek"],["İki haftada bir","iki"],["Her hafta","hafta"]] }
];
let qi = -1, qa = [], qname = "";
function renderQuiz(){
  const prog = `<div class="qprog">${[0,1,2,3,4].map(i => `<i class="${i <= qi ? "on" : ""}"></i>`).join("")}</div>`;
  if (qi === -1){
    $("#quizCard").innerHTML = prog + `<p class="eyebrow">Sana hangi kutu?</p><h2 id="qTitle" style="font-size:38px;margin:10px 0">4 soruda kutunu bulalım.</h2><p class="muted">30 saniye sürer.</p>
      <label class="field" for="qName" style="margin-top:18px">Sana nasıl hitap edelim?<input id="qName" maxlength="30" placeholder="Adın (isteğe bağlı)"></label>
      <div style="display:flex;gap:10px;margin-top:18px;flex-wrap:wrap"><button class="btn" id="qStart">Başlayalım</button><button class="btn line" data-close>Sonra</button></div>`;
    $("#qName").value = qname;
    $("#qStart").onclick = () => { qname = $("#qName").value.trim(); qi = 0; renderQuiz(); }; return;
  }
  if (qi < QUIZ.length){
    const s = QUIZ[qi];
    $("#quizCard").innerHTML = prog + `<p class="eyebrow">Soru ${qi+1} / ${QUIZ.length}</p><h2 id="qTitle" style="font-size:34px;margin-top:10px">${s.q}</h2><div class="qopts">${s.a.map(([l,v]) => `<button data-qa="${v}">${l}</button>`).join("")}</div>`;
    $$("[data-qa]").forEach(b => b.onclick = () => { qa[qi] = b.dataset.qa; qi++; renderQuiz(); }); return;
  }
  const [kisi, tur, kim, fr] = qa;
  const rec = tur === "yesil" ? "mutfak" : (kisi === "1" ? "tadim" : (kisi === "5" || kim === "ofis") ? "bolluk" : "sofra");
  const b = BOXES.find(x => x.id === rec), withVeg = tur === "karma";
  const safe = qname.replace(/[<>&"]/g, "");
  $("#quizCard").innerHTML = prog + `<p class="eyebrow">Senin kutun</p><h2 id="qTitle" style="font-size:40px;margin:10px 0">${safe ? safe + ", " : ""}${b.name}${withVeg ? " + Mutfak" : ""} tam sana göre.</h2>
    <p class="muted">${b.kg}, ${b.cesit} çeşit, ${b.kisi}. ${withVeg ? "Sebze kutusu aynı teslimatla 599 TL. " : ""}${kim === "hediye" ? "Hediye paketi ve not kartını eklemeyi unutma." : ""}</p>
    ${fr !== "tek" ? `<p style="margin-top:14px" class="guarantee">${shield}${CONFIG.firstOrderGift}.</p>` : ""}
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:20px"><button class="btn" id="qGo">Kutumu hazırla</button><button class="btn line" data-close>Kapat</button></div>`;
  store.set("tane_name", safe); greet();
  $("#qGo").onclick = () => { closeModals(); freq = fr; renderFreq(); if (b.line !== line) setLine(b.line); else renderBoxes(); openCfg(rec, withVeg); if (kim === "hediye"){ $("#cfgGift").checked = true; $("#giftDet").open = true; tween($("#cfgTotal"), cfgPrice()); } };
}
function openQuiz(){ qi = -1; qa = []; renderQuiz(); openModal("quiz"); sess.set("tane_quiz","1"); }
$("#openQuiz").addEventListener("click", openQuiz);
function greet(){ const n = store.get("tane_name"); $("#hello").textContent = n ? `Merhaba ${n}, bu hafta senin için ayırdık.` : ""; }


/* ---------- freshness label + list ---------- */
function renderLabel(){
  const c = CITIES[city];
  $("#lblFrom").textContent = line === "meyve" ? c.from : (c.name === "Antalya" ? "Kumluca" : "Menemen");
  $("#lblTo").textContent = c.semt[1];
  $("#lblBrix").textContent = line === "meyve" ? "Mandalina 12,4 Brix · elle seçildi" : "Sabah 06:50'de toplandı · elle seçildi";
}
let counted = false;
function countHours(){
  if (counted || reduce) return; counted = true;
  const el = $("#hours"); let n = 0; el.textContent = 0;
  const iv = setInterval(() => { n++; el.textContent = n; if (n >= 31) clearInterval(iv); }, 40);
}
function renderWeekList(){
  ($("#weekList") || {}).innerHTML = WEEK[line].map(([ic,n,o,bx]) => `<div class="li"><svg aria-hidden="true"><use href="#i-${ic}"/></svg><span><b>${n}</b><small>${o}</small></span><span class="brix">${bx ? bx + " Brix" : (line === "meyve" ? "olgun" : "taze")}</span></div>`).join("");
}

/* legal + waitlist */
const LEGAL = {
  mesafeli:["Mesafeli satış sözleşmesi","Bu alan avukat tarafından hazırlanacak mesafeli satış sözleşmesi ve ön bilgilendirme formu içindir. Taze meyve ve sebze çabuk bozulabilen ürün olduğundan Mesafeli Sözleşmeler Yönetmeliği md. 15/c uyarınca cayma hakkı kapsamı dışındadır."],
  kvkk:["KVKK aydınlatma metni","Bu alan kişisel verilerin işlenmesine ilişkin aydınlatma metni içindir. Ad, telefon ve adres yalnızca siparişin teslimi için kullanılır."],
  cerez:["Çerez politikası","Bu site sepetini ve tercihlerini yalnızca senin tarayıcında saklar. Reklam ölçümü eklendiğinde bu metin güncellenecektir."]
};
$$("[data-legal]").forEach(b => b.addEventListener("click", () => { const [t,x] = LEGAL[b.dataset.legal]; $("#lTitle").textContent = t; $("#lBody").textContent = x; openModal("legal"); }));

/* reveal + section triggers (content is visible at rest; motion only nudges) */
const io = "IntersectionObserver" in window ? new IntersectionObserver(es => es.forEach(x => {
  if (!x.isIntersecting) return;
  x.target.classList.remove("pre");
  if (x.target.id === "how") x.target.classList.add("on");
  if (x.target.classList.contains("label")) countHours();
  io.unobserve(x.target);
}), { threshold:.2 }) : null;
if (io){
  $$(".reveal").forEach(r => { if (!reduce && r.getBoundingClientRect().top > innerHeight) r.classList.add("pre"); io.observe(r); });
  io.observe($("#how"));
} else $("#how").classList.add("on");
function toast(m){ const t = $("#toast"); t.textContent = m; t.classList.add("on"); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove("on"), 2400); }

/* init */
$("#waText").textContent = "+" + CONFIG.whatsapp.replace(/^(\d{2})(\d{3})(\d{3})(\d{2})(\d{2})$/, "$1 $2 $3 $4 $5");
renderFreq(); setLine("meyve"); renderCity(); renderSide(); renderCommunity(); save(); greet();
