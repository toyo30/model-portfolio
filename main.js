const photoData = [
  [1, 'Black and white close-up portrait of Mélinda'],
  [4, 'Mélinda in a white shirt standing by the sea'],
  [5, 'Mélinda seated on a sunny beach in a white shirt'],
  [8, 'Mélinda in tailored clothing beside an urban doorway, black and white'],
  [9, 'Black and white portrait of Mélinda in a blazer against a city wall'],
  [7, 'Mélinda holding a beauty product in a green forest'],
  [10, 'Mélinda wearing a sunhat and black swimwear by the sea'],
  [11, 'Close-up of Mélinda in a sunhat beside blue water'],
  [12, 'Mélinda wearing red trousers in a grassy field with horses'],
  [13, 'Mélinda beside a horse in a black shirt and red trousers'],
  [14, 'Mélinda in a white dress seated on a fallen tree in the forest'],
  [15, 'Mélinda reclining on a tree trunk in a white dress'],
  [16, 'Mélinda in a white hoodie against a blue sky with UNLOGIC lettering'],
  [17, 'Mélinda smiling in a white hoodie with UNLOGIC lettering'],
  [18, 'Mélinda in a black dress beside textured stone'],
  [19, 'Creative close-up of Mélinda photographed through transparent material'],
  [6, 'Mélinda holding a beauty tube beside her face in a forest'],
  [2, 'Black and white portrait of Mélinda in a black top and jeans'],
];

const experience = document.querySelector('#experience');
const container = document.querySelector('#story-cards');
const progressFill = document.querySelector('#scroll-progress-fill');
const cue = document.querySelector('.scroll-cue');
const navDots = [...document.querySelectorAll('.nav-dot')];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

experience.style.setProperty('--scene-count', photoData.length);
container.innerHTML = photoData.map(([number, alt], index) => {
  const file = String(number).padStart(2, '0');
  const width = number === 1 ? 1066 : 1333;
  return `<figure class="story-card"${index === 0 ? ' style="opacity:1;visibility:visible"' : ''}>
    <img ${index < 2 ? 'src' : 'data-src'}="./public/images/${file}.webp"
      ${index < 2 ? 'srcset' : 'data-srcset'}="./public/images/${file}-640.webp 640w, ./public/images/${file}.webp ${width}w"
      sizes="(max-width:700px) 100vw, 70vw" alt="${alt}"
      width="${width}" height="2000" decoding="async" ${index === 0 ? 'fetchpriority="high"' : ''} />
  </figure>`;
}).join('');
const cards = [...container.querySelectorAll('.story-card')];

function loadPhoto(index) {
  const img = cards[index]?.querySelector('img');
  if (!img?.dataset.src) return;
  img.srcset = img.dataset.srcset;
  img.src = img.dataset.src;
  delete img.dataset.src;
  delete img.dataset.srcset;
}

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
let ticking = false;
let activeCards = new Set([0]);

function render() {
  ticking = false;
  const top = experience.offsetTop;
  const viewportHeight = document.querySelector('.story-viewport').clientHeight;
  const totalDistance = experience.offsetHeight - viewportHeight;
  const scrollY = window.scrollY;
  const overallProgress = clamp(scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight), 0, 1);
  progressFill.style.transform = `scaleX(${overallProgress})`;
  const inMeasurements = document.querySelector('#measurements').getBoundingClientRect().top < window.innerHeight * .5;
  navDots.forEach((dot, index) => {
    const active = index === (inMeasurements ? 1 : 0);
    dot.classList.toggle('is-active', active);
    if (active) dot.setAttribute('aria-current', 'location');
    else dot.removeAttribute('aria-current');
  });

  if (reducedMotion.matches) return;
  // Each portrait holds at center, then travels right as the next enters from the left.
  const position = clamp((scrollY - top) / Math.max(1, totalDistance), 0, 1) * (cards.length - 1);
  const nextActive = new Set();
  const base = Math.floor(position);
  for (let i = Math.max(0, base - 1); i <= Math.min(cards.length - 1, base + 2); i += 1) {
    loadPhoto(i);
    const distance = position - i;
    if (Math.abs(distance) > 1) continue;
    nextActive.add(i);
    const magnitude = Math.abs(distance);
    const travel = clamp((magnitude - .12) / .88, 0, 1);
    const eased = travel * travel * (3 - 2 * travel);
    const direction = distance < 0 ? -1 : 1;
    const opacity = 1 - clamp((travel - .5) / .5, 0, 1);
    const x = direction * eased * 108;
    const scale = 1 - eased * .14;
    const rotate = direction * eased * 5;
    const card = cards[i];
    card.style.visibility = 'visible';
    card.style.opacity = String(opacity);
    card.style.transform = `translate3d(${x}%,0,0) scale(${scale}) rotateY(${rotate}deg)`;
    card.style.zIndex = String(10 - Math.round(magnitude * 5));
  }
  for (const index of activeCards) {
    if (!nextActive.has(index)) {
      cards[index].style.visibility = 'hidden';
      cards[index].style.opacity = '0';
    }
  }
  activeCards = nextActive;
  cue.style.opacity = position < .12 ? '1' : '0';
  cue.style.pointerEvents = position < .12 ? 'auto' : 'none';
}

function scheduleRender() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(render);
}

function updateMotionPreference() {
  if (reducedMotion.matches) photoData.forEach((_, index) => loadPhoto(index));
  scheduleRender();
}

window.addEventListener('scroll', scheduleRender, { passive: true });
window.addEventListener('resize', scheduleRender, { passive: true });
reducedMotion.addEventListener('change', updateMotionPreference);
updateMotionPreference();
