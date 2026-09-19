/* ═══════════════════════════════════════════════════════════
   Mélinda — Portfolio
   Scroll-driven animations & interactions
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ── Selectors ──
  const topbar       = document.getElementById('topbar');
  const progressFill = document.getElementById('progress-fill');
  const chapters     = [...document.querySelectorAll('.chapter')];
  const hamburger    = document.querySelector('.hamburger');
  const mobileMenu   = document.querySelector('.mobile-menu');
  const mobileLinks  = document.querySelectorAll('.mobile-menu a');
  const reduced      = matchMedia('(prefers-reduced-motion: reduce)');

  // ── Utilities ──
  const clamp = (n, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, n));
  const lerp  = (a, b, t) => a + (b - a) * t;

  // ── Smooth values (lerped for buttery motion) ──
  const smoothVars = new Map(); // chapter → { current, target }

  chapters.forEach(ch => {
    smoothVars.set(ch, {
      p:      { current: 0, target: 0 },
      scale:  { current: 0.72, target: 0.72 },
      drift:  { current: 0, target: 0 },
      pan:    { current: 0, target: 0 },
      spread: { current: 0, target: 0 },
      reveal: { current: 0, target: 0 },
    });
  });

  // ── Intersection Observer for fade-in ──
  const fadeObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    },
    { threshold: 0.15 }
  );

  // Observe chapters + sections for fade-in
  document.querySelectorAll('.chapter, .about, .contact').forEach(el => {
    fadeObserver.observe(el);
  });

  // ── Top bar scroll state ──
  let lastScrollY = 0;
  let headerVisible = true;

  function updateTopbar() {
    const scrollY = window.scrollY;
    topbar.classList.toggle('is-scrolled', scrollY > 80);

    // Hide/show topbar based on scroll direction (Apple-style)
    if (scrollY > 400) {
      if (scrollY > lastScrollY + 5 && headerVisible) {
        topbar.style.transform = 'translateY(-100%)';
        topbar.style.transition = 'transform .35s var(--ease-out-expo), background .4s, backdrop-filter .4s';
        headerVisible = false;
      } else if (scrollY < lastScrollY - 5 && !headerVisible) {
        topbar.style.transform = 'none';
        headerVisible = true;
      }
    } else {
      topbar.style.transform = 'none';
      headerVisible = true;
    }
    lastScrollY = scrollY;
  }

  // ── Hamburger ──
  hamburger.addEventListener('click', () => {
    const open = hamburger.getAttribute('aria-expanded') !== 'true';
    hamburger.setAttribute('aria-expanded', String(open));
    mobileMenu.classList.toggle('is-open', open);
    mobileMenu.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.classList.remove('is-open');
      mobileMenu.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    });
  });

  // ── Scroll progress ──
  function updateProgress() {
    const scrollFrac = clamp(
      window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
    );
    progressFill.style.transform = `scaleX(${scrollFrac})`;
  }

  // ── Chapter scroll targets ──
  function computeTargets() {
    const vh = window.innerHeight;

    chapters.forEach(ch => {
      const rect = ch.getBoundingClientRect();
      const vars = smoothVars.get(ch);

      // Normalised progress: 0 when entering bottom, 1 when leaving top
      const p = clamp((vh - rect.top) / (vh + rect.height));
      vars.p.target = p;

      const effect = ch.dataset.effect;

      if (effect === 'scale') {
        // Scale from 0.72 → 1.08 through center
        vars.scale.target = 0.72 + p * 0.38;
      }

      if (effect === 'split') {
        // Opposing vertical drift
        vars.drift.target = (p - 0.5) * 22;
      }

      if (effect === 'pan') {
        // Horizontal scroll mapped to vertical scroll position
        const track = ch.querySelector('.pan-track');
        if (track) {
          const totalWidth = track.scrollWidth - window.innerWidth + 100;
          vars.pan.target = -p * totalWidth;
        }
      }

      if (effect === 'spread') {
        // 0 = fully stacked in center, 1 = fully fanned out
        // Start early (15%) and finish by center (50%) so it's done when visible
        const raw = clamp((p - 0.15) / 0.35);
        vars.spread.target = raw * raw * (3 - 2 * raw); // smoothstep
      }

      if (effect === 'reveal') {
        vars.reveal.target = p;
      }
    });
  }

  // ── Smooth animation loop ──
  const LERP_FACTOR = 0.08; // lower = smoother & slower
  let rafId = null;
  let isAnimating = false;

  function animate() {
    let needsUpdate = false;

    // Lerp all smooth values toward their targets
    chapters.forEach(ch => {
      const vars = smoothVars.get(ch);
      const effect = ch.dataset.effect;

      // Always lerp p
      const oldP = vars.p.current;
      vars.p.current = lerp(vars.p.current, vars.p.target, LERP_FACTOR);
      if (Math.abs(vars.p.current - vars.p.target) > 0.0005) needsUpdate = true;

      if (reduced.matches) return; // Skip animations in reduced motion

      if (effect === 'scale') {
        vars.scale.current = lerp(vars.scale.current, vars.scale.target, LERP_FACTOR);
        ch.querySelector('.chapter-frame').style.transform = `scale(${vars.scale.current.toFixed(4)})`;
        if (Math.abs(vars.scale.current - vars.scale.target) > 0.0005) needsUpdate = true;

        // Float images parallax
        const floats = ch.querySelectorAll('.float');
        floats.forEach((fl, i) => {
          const offset = ((i === 0 ? 0.5 : vars.p.current) - 0.5) * (i === 0 ? 200 : -160);
          fl.style.transform = `translateY(${offset.toFixed(1)}px) rotate(${i === 0 ? 4 : -3}deg)`;
        });
      }

      if (effect === 'split') {
        vars.drift.current = lerp(vars.drift.current, vars.drift.target, LERP_FACTOR);
        const leftCol = ch.querySelector('.split-col--left');
        const rightCol = ch.querySelector('.split-col--right');
        if (leftCol) leftCol.style.transform = `translateY(${vars.drift.current.toFixed(2)}px)`;
        if (rightCol) rightCol.style.transform = `translateY(${(-vars.drift.current).toFixed(2)}px)`;
        if (Math.abs(vars.drift.current - vars.drift.target) > 0.05) needsUpdate = true;
      }

      if (effect === 'pan') {
        vars.pan.current = lerp(vars.pan.current, vars.pan.target, LERP_FACTOR);
        const track = ch.querySelector('.pan-track');
        if (track) track.style.transform = `translateX(${vars.pan.current.toFixed(1)}px)`;
        if (Math.abs(vars.pan.current - vars.pan.target) > 0.5) needsUpdate = true;
      }

      if (effect === 'spread') {
        vars.spread.current = lerp(vars.spread.current, vars.spread.target, LERP_FACTOR);
        const frame = ch.querySelector('.spread-frame');
        if (frame) frame.style.setProperty('--spread', vars.spread.current.toFixed(4));
        if (Math.abs(vars.spread.current - vars.spread.target) > 0.001) needsUpdate = true;
      }

      if (effect === 'reveal') {
        vars.reveal.current = lerp(vars.reveal.current, vars.reveal.target, LERP_FACTOR);
        const imgs = ch.querySelectorAll('.reveal-frame img');
        const r = vars.reveal.current;
        if (imgs[0]) imgs[0].style.clipPath = `inset(0 ${((1 - r) * 100).toFixed(2)}% 0 0)`;
        if (imgs[1]) imgs[1].style.clipPath = `inset(0 0 0 ${(r * 100).toFixed(2)}%)`;
        if (Math.abs(vars.reveal.current - vars.reveal.target) > 0.001) needsUpdate = true;
      }
    });

    if (needsUpdate) {
      rafId = requestAnimationFrame(animate);
    } else {
      isAnimating = false;
    }
  }

  function startAnimation() {
    if (!isAnimating) {
      isAnimating = true;
      rafId = requestAnimationFrame(animate);
    }
  }

  // ── Scroll handler ──
  function onScroll() {
    updateTopbar();
    updateProgress();
    computeTargets();
    startAnimation();
  }

  // ── Events ──
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => {
    computeTargets();
    startAnimation();
  }, { passive: true });

  reduced.addEventListener('change', () => {
    computeTargets();
    startAnimation();
  });

  // ── Initial render ──
  updateTopbar();
  updateProgress();
  computeTargets();

  // Kick off initial smooth animation
  chapters.forEach(ch => {
    const vars = smoothVars.get(ch);
    // Set current = target for initial state (no lerp needed)
    vars.p.current = vars.p.target;
    vars.scale.current = vars.scale.target;
    vars.drift.current = vars.drift.target;
    vars.pan.current = vars.pan.target;
    vars.spread.current = vars.spread.target;
    vars.reveal.current = vars.reveal.target;
  });
  startAnimation();

})();
