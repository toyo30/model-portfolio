const photoData = [
  [1, 'A study in monochrome', 'Black and white close-up portrait of Mélinda'],
  [4, 'Along the shoreline', 'Mélinda in a white shirt standing by the sea'],
  [5, 'Salt & light', 'Mélinda seated on a sunny beach in a white shirt'],
  [8, 'City in monochrome', 'Mélinda in tailored clothing beside an urban doorway, black and white'],
  [9, 'Between shadows', 'Black and white portrait of Mélinda in a blazer against a city wall'],
  [7, 'Naturally, beauty', 'Mélinda holding a beauty product in a green forest'],
  [10, 'Blue horizon', 'Mélinda wearing a sunhat and black swimwear by the sea'],
  [11, 'Under the sun', 'Close-up of Mélinda in a sunhat beside blue water'],
  [12, 'An open field', 'Mélinda wearing red trousers in a grassy field with horses'],
  [13, 'A quieter moment', 'Mélinda beside a horse in a black shirt and red trousers'],
  [14, 'Into the green', 'Mélinda in a white dress seated on a fallen tree in the forest'],
  [15, 'Forest light', 'Mélinda reclining on a tree trunk in a white dress'],
  [16, 'UNLOGIC / 01', 'Mélinda in a white hoodie against a blue sky with UNLOGIC lettering'],
  [17, 'UNLOGIC / 02', 'Mélinda smiling in a white hoodie with UNLOGIC lettering'],
  [18, 'Sculpted by light', 'Mélinda in a black dress beside textured stone'],
  [19, 'Another perspective', 'Creative close-up of Mélinda photographed through transparent material'],
  [6, 'Beauty in nature', 'Mélinda holding a beauty tube beside her face in a forest'],
  [2, 'Simply, Mélinda', 'Black and white portrait of Mélinda in a black top and jeans'],
];
const photos = photoData.map(([number, title, alt]) => ({
  src: `./public/images/${String(number).padStart(2, '0')}.webp`,
  small: `./public/images/${String(number).padStart(2, '0')}-640.webp`,
  width: number === 1 ? 1066 : 1333,
  title,
  alt,
}));
const gallery = document.querySelector('#gallery');
const lightbox = document.querySelector('#lightbox');
const lightboxImage = document.querySelector('#lightbox-image');
let currentPhoto = 0;
let opener;
let touchStart = null;

gallery.innerHTML = photos.map((photo, index) => `
  <figure class="photo-card reveal">
    <button class="photo-button" data-photo="${index}" aria-label="Open ${photo.alt}">
      <span class="photo-frame"><img src="${photo.src}" srcset="${photo.small} 640w, ${photo.src} ${photo.width}w" sizes="(max-width: 600px) 100vw, (max-width: 950px) 60vw, 55vw" alt="${photo.alt}" loading="lazy" decoding="async" width="900" height="1200"><span class="photo-expand" aria-hidden="true">↗</span></span>
      <span class="photo-caption"><span>${photo.title}</span><span class="photo-number">${String(index + 1).padStart(2, '0')}</span></span>
    </button>
  </figure>`).join('');

function showPhoto(index) {
  currentPhoto = (index + photos.length) % photos.length;
  const photo = photos[currentPhoto];
  lightboxImage.src = photo.src;
  lightboxImage.alt = photo.alt;
  document.querySelector('#lightbox-caption').textContent = photo.title;
  document.querySelector('#lightbox-count').textContent = `${String(currentPhoto + 1).padStart(2, '0')} / ${photos.length}`;
  const nextImage = new Image();
  nextImage.src = photos[(currentPhoto + 1) % photos.length].src;
}

gallery.addEventListener('click', event => {
  const button = event.target.closest('[data-photo]');
  if (!button) return;
  opener = button;
  showPhoto(Number(button.dataset.photo));
  lightbox.showModal();
  document.body.classList.add('modal-open');
});
document.querySelector('.close-lightbox').addEventListener('click', () => lightbox.close());
lightbox.addEventListener('close', () => {
  document.body.classList.remove('modal-open');
  opener?.focus({ preventScroll: true });
});
document.querySelector('.previous').addEventListener('click', () => showPhoto(currentPhoto - 1));
document.querySelector('.next').addEventListener('click', () => showPhoto(currentPhoto + 1));
lightbox.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    showPhoto(currentPhoto + (event.key === 'ArrowRight' ? 1 : -1));
  }
});
lightbox.addEventListener('click', event => {
  if (event.target === lightbox || event.target.classList.contains('lightbox-stage')) lightbox.close();
});
lightbox.addEventListener('touchstart', event => {
  if (event.touches.length === 1) touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
  else touchStart = null;
}, { passive: true });
lightbox.addEventListener('touchend', event => {
  if (!touchStart) return;
  const dx = event.changedTouches[0].clientX - touchStart.x;
  const dy = event.changedTouches[0].clientY - touchStart.y;
  if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5) showPhoto(currentPhoto + (dx < 0 ? 1 : -1));
  touchStart = null;
}, { passive: true });

document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => {
  gallery.classList.toggle('is-grid', button.dataset.view === 'grid');
  document.querySelectorAll('[data-view]').forEach(item => {
    const active = item === button;
    item.classList.toggle('active', active);
    item.setAttribute('aria-pressed', String(active));
  });
}));

const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#site-nav');
function closeMenu() {
  nav.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
}
menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(open));
  nav.classList.toggle('is-open', open);
});
nav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });

if ('IntersectionObserver' in window) {
  document.documentElement.classList.add('js');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.06, rootMargin: '0px 0px 30px 0px' });
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
}
document.querySelector('#year').textContent = new Date().getFullYear();
