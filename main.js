// Progressive enhancement: the page and every link also work without JavaScript.
const fontNames = {
  classic: 'A · 经典学术', book: 'B · 书卷风格', paper: 'C · 论文风格', modern: 'D · 现代简洁',
  garamond: 'E · 古典书卷', baskerville: 'F · 稳重印刷', lora: 'G · 饱满衬线',
  inter: 'H · 清晰无衬线', manrope: 'I · 饱满几何', nunito: 'J · 柔和圆润',
  'nunito-rounded': 'K · 柔圆书写', quicksand: 'L · 圆润几何', 'mplus-rounded': 'M · 饱满圆体'
};
const localPreview = location.protocol === 'file:' || ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
const showFontPreview = localPreview || new URLSearchParams(location.search).get('preview') === 'fonts';
const defaultFont = document.body.dataset.font || 'nunito';
// A new design default takes precedence over choices from the earlier comparison.
const fontStorageKey = 'academic-homepage-font-preview-rounded-v1';

if (showFontPreview) {
  document.querySelector('#font-preview').hidden = false;
  if (new URLSearchParams(location.search).get('compare') === 'rounded') {
    document.querySelector('#font-preview > details').open = true;
  }
  function applyFont(value) {
    const font = Object.hasOwn(fontNames, value) ? value : defaultFont;
    document.body.dataset.font = font;
    document.querySelector('#font-current').textContent = fontNames[font];
    document.querySelector(`input[name="font-choice"][value="${font}"]`).checked = true;
  }
  let savedFont = defaultFont;
  try { savedFont = localStorage.getItem(fontStorageKey) || savedFont; } catch { /* File previews may restrict storage. */ }
  applyFont(savedFont);
  document.querySelectorAll('input[name="font-choice"]').forEach(input => {
    input.addEventListener('change', () => {
      applyFont(input.value);
      try { localStorage.setItem(fontStorageKey, input.value); } catch { /* Switching still works without persistence. */ }
    });
  });
}

const navigationLinks = [...document.querySelectorAll('nav a[href^="#"]')];
const sections = navigationLinks.map(link => document.querySelector(link.hash));

function updateNavigation() {
  const threshold = document.querySelector('.site-header').getBoundingClientRect().height + 52;
  let current = sections[0];
  for (const section of sections) {
    if (section.getBoundingClientRect().top <= threshold) current = section;
  }
  if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 8) {
    current = sections[sections.length - 1];
  }
  for (const link of navigationLinks) {
    if (link.hash === `#${current.id}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  }
}

let scheduled = false;
window.addEventListener('scroll', () => {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => { updateNavigation(); scheduled = false; });
}, { passive: true });
window.addEventListener('resize', updateNavigation);
window.addEventListener('load', updateNavigation);
updateNavigation();
