// Her sayfanın giriş noktası: menü, iletişim formu, koleksiyon filtreleri ve ürün sayfası.
import { $, $$, t, waBaglanti, ILETISIM } from './ortak.js';
import { koleksiyonKur } from './koleksiyon.js';

function ustKur() {
  const ust = $('#ust');
  const kaydir = () => ust.classList.toggle('kaydi', scrollY > 8);
  addEventListener('scroll', kaydir, { passive: true });
  kaydir();
  const dugme = $('#menu-dugme'), menu = $('#menu');
  dugme.addEventListener('click', () => {
    const acik = menu.classList.toggle('acik');
    dugme.setAttribute('aria-expanded', String(acik));
  });
  $$('a', menu).forEach((a) => a.addEventListener('click', () => { menu.classList.remove('acik'); dugme.setAttribute('aria-expanded', 'false'); }));
}

function formKur() {
  for (const form of $$('[data-form]')) {
    const mesaj = () => {
      const v = Object.fromEntries(new FormData(form));
      return t('wa.form', { ad: v.ad.trim(), konu: v.konu.trim() || '—', mesaj: v.mesaj.trim() });
    };
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      open(waBaglanti(mesaj()), '_blank', 'noopener');
    });
    $('[data-eposta]', form)?.addEventListener('click', () => {
      if (!form.reportValidity()) return;
      const v = Object.fromEntries(new FormData(form));
      location.href = `mailto:${ILETISIM.eposta}?subject=${encodeURIComponent(v.konu || 'Karabel')}&body=${encodeURIComponent(mesaj())}`;
    });
  }
}

function urunSayfasi() {
  const kutu = $('[data-urun-gorsel]');
  if (!kutu) return;
  $('[data-urun-gorunum]', kutu)?.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    $$('[data-urun-gorunum] button', kutu).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    $$('[data-gorsel]', kutu).forEach((g) => { g.hidden = g.dataset.gorsel !== b.dataset.deger; });
  });
  // uygulama sahneleri: tıklayınca büyük görünüm
  const diyalog = $('[data-sahne-diyalog]');
  if (diyalog) {
    $$('[data-sahne]').forEach((b) => b.addEventListener('click', () => {
      $('img', diyalog).src = b.dataset.sahne;
      $('img', diyalog).alt = $('img', b).alt;
      diyalog.showModal();
    }));
    diyalog.addEventListener('click', (e) => { if (e.target === diyalog || e.target.closest('.sahne-kapat')) diyalog.close(); });
  }
}

function basla() {
  ustKur();
  formKur();
  koleksiyonKur();
  urunSayfasi();
}

try { basla(); } catch (e) { console.error(e); }
