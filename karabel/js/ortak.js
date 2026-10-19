// Sayfalar arasında ortak yardımcılar. Metinler sayfaya gömülü gelir (#sayfa-verisi);
// kaynakları web/dil/<kod>.json dosyalarıdır, site üretilirken sayfaya yazılır.

const veri = JSON.parse(document.getElementById('sayfa-verisi').textContent);

export const KOK = veri.kok;
export const DIL = veri.dil.kod;
export const ILETISIM = veri.il;
const paket = veri.dil;

export const $ = (s, k = document) => k.querySelector(s);
export const $$ = (s, k = document) => [...k.querySelectorAll(s)];

export function el(etiket, ozellik = {}, ...cocuk) {
  const e = document.createElement(etiket);
  for (const [k, v] of Object.entries(ozellik)) {
    if (k === 'class') e.className = v;
    else if (k === 'text') e.textContent = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else if (v !== false && v != null) e.setAttribute(k, v === true ? '' : v);
  }
  e.append(...cocuk.filter((c) => c != null));
  return e;
}

export function t(anahtar, degerler = {}) {
  let s = paket.arayuz[anahtar] ?? anahtar;
  for (const [k, v] of Object.entries(degerler)) s = s.replaceAll(`{${k}}`, v);
  return s;
}

export function terim(tur, deger) {
  if (deger == null) return '';
  return paket.terim?.[tur]?.[deger] ?? deger;
}

export function sayi(n, basamak = 1) {
  return new Intl.NumberFormat(paket.dil.yerel, { maximumFractionDigits: basamak, numberingSystem: 'latn' }).format(n);
}

export function normal(s) {
  return String(s ?? '').toLocaleLowerCase('tr').normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/ı/g, 'i').replace(/,/g, '.');
}

export const TON_RENK = {
  beyaz: '#ecebe6', krem: '#e2d3bb', sari: '#d1a868', kahve: '#8f7660', gri: '#a3a6a6',
  siyah: '#2a2d30', pembe: '#d6aa9c', karisik: 'conic-gradient(#e2d3bb 0 33%, #8f7660 0 66%, #d1a868 0)',
};

export const DERZ = [
  ['beyaz', '#f1eee8'], ['kemik', '#dcd4c5'], ['kum', '#c4b398'],
  ['gri', '#96948f'], ['antrasit', '#4a4845'], ['siyah', '#1f1e1c'],
];
export const derzRengi = (ad) => (DERZ.find(([k]) => k === ad) || DERZ[1])[1];

// --- ürün metinleri (site.py'deki karşılıklarıyla aynı kurallar)

export function adi(u) {
  const ek = ['Koyu', 'Açık'].includes(u.ek) ? ` · ${terim('ek', u.ek)}` : '';
  const tam = paket.terim?.tasAd?.[`${u.ad}|${u.grup}`];
  return `${tam || `${terim('ad', u.ad)} ${terim('grup', u.grup)}`}${ek}`;
}

/** Düğmelerde kullanılan kısa, ayırt edici ad: "Light Mix 7,5×15", "Silver mozaik", "Altıgen". */
export function kisaAd(u) {
  const ad = terim('ad', u.ad);
  if (u.form === 'Tek parça' && u.parca_cm?.[1]) return `${ad} ${sayi(u.parca_cm[0])}×${sayi(u.parca_cm[1])}`;
  if (u.form === 'Mozaik' || u.form === 'Panel') return `${ad} ${terim('form', u.form).toLocaleLowerCase(DIL)}`;
  return terim('form', u.form);
}

export function cm(a, b) {
  return b == null ? `${sayi(a)} cm` : `${sayi(a)} × ${sayi(b)} cm`;
}

export function parcaOlcusu(u) {
  const yak = u.teyit_bekliyor && ['Panel', 'Mini set'].includes(u.form) ? '≈ ' : '';
  if (u.form === 'Altıgen' && u.kenar_cm) return t('urun.kenar', { n: sayi(u.kenar_cm) });
  if (u.form === 'Mini set' && u.olcu_aciklama) {
    const liste = [];
    for (const m of u.olcu_aciklama.matchAll(/(\d+(?:[.,]\d+)?)\s*[×x]\s*(\d+(?:[.,]\d+)?)/g)) {
      const p = `${sayi(parseFloat(m[1].replace(',', '.')))}×${sayi(parseFloat(m[2].replace(',', '.')))}`;
      if (!liste.includes(p) && !/^3\d×3\d$/.test(p)) liste.push(p);
    }
    return liste.length ? `${yak}${liste.join(' / ')} cm` : '';
  }
  if (u.parca_cm) {
    const [a, b] = u.parca_cm;
    return b == null ? `${cm(a)} × ${t('urun.olcuyeGore').toLocaleLowerCase(DIL)}` : yak + cm(a, b);
  }
  return '';
}

export function altMetin(u) {
  return [terim('form', u.form), parcaOlcusu(u), terim('yuzey', u.yuzey)].filter(Boolean).join(' · ');
}

export function waBaglanti(mesaj) {
  return `https://wa.me/${ILETISIM.telefonHam}?text=${encodeURIComponent(mesaj)}`;
}

export function sayfaYolu(tur) {
  const yollar = {
    tr: { studyo: 'studyo/', koleksiyon: 'koleksiyon/' },
    en: { studyo: 'en/studio/', koleksiyon: 'en/collection/' },
  };
  return KOK + (yollar[DIL] || yollar.tr)[tur];
}

let katalogIs = null;
export function katalog() {
  if (!katalogIs) katalogIs = fetch(`${KOK}veri/katalog.json`).then((y) => y.json()).then((v) => v.urunler);
  return katalogIs;
}

export function bildir(mesaj) {
  const b = $('#bildirim');
  if (!b) return;
  b.textContent = mesaj;
  b.classList.add('goster');
  clearTimeout(bildir.zaman);
  bildir.zaman = setTimeout(() => b.classList.remove('goster'), 2400);
}

export const hareketAz = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
