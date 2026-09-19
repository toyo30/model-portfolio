const chapters = [...document.querySelectorAll('.chapter')];
const progress = document.querySelector('#progress');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const clamp = (n, a = 0, b = 1) => Math.max(a, Math.min(b, n));
let ticking = false;
function render() {
  ticking = false;
  progress.style.transform = `scaleX(${clamp(scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight))})`;
  chapters.forEach(chapter => {
    const r = chapter.getBoundingClientRect();
    const p = clamp((innerHeight - r.top) / (innerHeight + r.height));
    chapter.style.setProperty('--p', p.toFixed(3));
    if (reduced.matches) return;
    if (chapter.dataset.effect === 'scale') chapter.style.setProperty('--scale', (0.72 + p * .4).toFixed(3));
    if (chapter.dataset.effect === 'split') chapter.style.setProperty('--drift', `${(p - .5) * 18}px`);
    if (chapter.dataset.effect === 'stack') chapter.style.setProperty('--stack', `${p - .5}`);
    if (chapter.dataset.effect === 'reveal') chapter.style.setProperty('--reveal', p.toFixed(3));
  });
}
function schedule() { if (!ticking) { ticking = true; requestAnimationFrame(render); } }
addEventListener('scroll', schedule, { passive: true });
addEventListener('resize', schedule, { passive: true });
addEventListener('load', render); reduced.addEventListener('change', render); render();
const menu = document.querySelector('.menu');
menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', open); document.body.classList.toggle('menu-open', open); });
document.querySelectorAll('nav a').forEach(a => a.addEventListener('click', () => { menu.setAttribute('aria-expanded', 'false'); document.body.classList.remove('menu-open'); }));
