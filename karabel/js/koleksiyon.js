// Koleksiyon sayfasında filtreler. Ürün kartları sayfada hazır gelir (tarayıcılar için);
// bu dosya yalnızca onları süzer.
import { $, $$, el, t, terim, normal, TON_RENK } from './ortak.js';

const FORM_SIRA = ['Tek parça', 'Mozaik', 'Altıgen', 'Mini set', 'Panel'];

export function koleksiyonKur() {
  const kutu = $('[data-filtreler]');
  if (!kutu) return;
  const kartlar = $$('.izgara .kart');
  for (const k of kartlar) k._ara = normal(k.textContent);
  const f = (ad) => $(`[data-f="${ad}"]`, kutu) || $(`[data-f="${ad}"]`);
  const secim = { grup: '', form: new Set(), yuzey: new Set(), ton: new Set(), ara: '' };

  const sayim = (alan) => {
    const m = new Map();
    for (const k of kartlar) {
      const v = k.dataset[alan];
      if (v) m.set(v, (m.get(v) || 0) + 1);
    }
    return m;
  };
  const cip = (kume, deger, metin, n) => el('button', {
    class: 'cip', 'aria-pressed': 'false',
    onclick: (e) => {
      if (kume.has(deger)) kume.delete(deger); else kume.add(deger);
      e.currentTarget.setAttribute('aria-pressed', String(kume.has(deger)));
      uygula();
    },
  }, metin, el('small', { text: n }));

  f('form').replaceChildren(...[...sayim('form')].sort((a, b) => FORM_SIRA.indexOf(a[0]) - FORM_SIRA.indexOf(b[0]))
    .map(([v, n]) => cip(secim.form, v, terim('form', v), n)));
  f('yuzey').replaceChildren(...[...sayim('yuzey')].sort((a, b) => b[1] - a[1])
    .map(([v, n]) => cip(secim.yuzey, v, terim('yuzey', v), n)));
  f('ton').replaceChildren(...Object.keys(TON_RENK).filter((k) => sayim('ton').has(k)).map((k) => el('button', {
    class: 'renk', style: `background:${TON_RENK[k]}`, title: terim('ton', k), 'aria-label': terim('ton', k), 'aria-pressed': 'false',
    onclick: (e) => {
      if (secim.ton.has(k)) secim.ton.delete(k); else secim.ton.add(k);
      e.currentTarget.setAttribute('aria-pressed', String(secim.ton.has(k)));
      uygula();
    },
  })));

  f('grup').addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    secim.grup = b.dataset.deger;
    $$('button', f('grup')).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    uygula();
  });
  f('ara').addEventListener('input', (e) => { secim.ara = e.target.value; uygula(); });
  f('temizle').addEventListener('click', () => {
    secim.grup = ''; secim.ara = '';
    secim.form.clear(); secim.yuzey.clear(); secim.ton.clear();
    f('ara').value = '';
    $$('[aria-pressed]', kutu).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.deger === '')));
    uygula();
  });

  function uygula() {
    const kelimeler = normal(secim.ara).split(/\s+/).filter(Boolean);
    let n = 0;
    for (const k of kartlar) {
      const d = k.dataset;
      const goster = (!secim.grup || d.grup === secim.grup) && (!secim.form.size || secim.form.has(d.form)) &&
        (!secim.yuzey.size || secim.yuzey.has(d.yuzey)) && (!secim.ton.size || secim.ton.has(d.ton)) &&
        kelimeler.every((x) => k._ara.includes(x));
      k.hidden = !goster;
      if (goster) n += 1;
    }
    f('sonuc').textContent = t('kol.sonuc', { n });
    f('bos').hidden = n > 0;
    f('temizle').hidden = !(secim.grup || secim.ara || secim.form.size || secim.yuzey.size || secim.ton.size);
  }

  kutu.hidden = false;
  uygula();
}
