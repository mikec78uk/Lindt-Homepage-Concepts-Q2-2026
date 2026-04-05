/* ============================================================
   LINDT HOMEPAGE — CONCEPT 1
   main.js
   ============================================================ */

(function () {
  'use strict';

  const isMobile = () => window.innerWidth <= 768;

  /* ──────────────────────────────────────────────────────────
     HEADER HEIGHT — set as CSS var so padding-top stays correct
     ────────────────────────────────────────────────────────── */
  function syncHeaderHeight() {
    const header = document.getElementById('site-header');
    if (header && !isMobile()) {
      document.documentElement.style.setProperty('--hdr-desktop', header.offsetHeight + 'px');
    }
  }
  syncHeaderHeight();
  window.addEventListener('resize', syncHeaderHeight, { passive: true });

  /* ──────────────────────────────────────────────────────────
     VIDEO CONTROL
     ────────────────────────────────────────────────────────── */
  const video    = document.querySelector('.hero-video');
  const videoBtn = document.getElementById('video-ctrl');
  let videoPlaying = true;

  if (video && videoBtn) {
    videoBtn.addEventListener('click', () => {
      if (videoPlaying) {
        video.pause();
        videoBtn.textContent = '▶';
        videoBtn.setAttribute('aria-label', 'Play video');
      } else {
        video.play();
        videoBtn.textContent = '⏸';
        videoBtn.setAttribute('aria-label', 'Pause video');
      }
      videoPlaying = !videoPlaying;
    });
  }

  /* ──────────────────────────────────────────────────────────
     FILTER TABS (shared — works on any .filter-tabs group)
     ────────────────────────────────────────────────────────── */
  document.querySelectorAll('.filter-tabs').forEach(group => {
    group.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        group.querySelectorAll('.tab').forEach(t => t.classList.remove('tab--active'));
        tab.classList.add('tab--active');
      });
    });
  });

  /* ──────────────────────────────────────────────────────────
     USP BAR ROTATION — runs on both mobile and desktop bars
     ────────────────────────────────────────────────────────── */
  document.querySelectorAll('.header-usp').forEach(function (bar) {
    const msgs = bar.querySelectorAll('.usp-msg');
    if (msgs.length < 2) return;
    let current = 0;
    setInterval(function () {
      msgs[current].classList.remove('usp-active');
      current = (current + 1) % msgs.length;
      msgs[current].classList.add('usp-active');
    }, 4500);
  });

  /* ──────────────────────────────────────────────────────────
     NEWSLETTER FORM
     ────────────────────────────────────────────────────────── */
  const nlForm = document.getElementById('newsletter-form');
  if (nlForm) {
    nlForm.addEventListener('submit', e => {
      e.preventDefault();
      const input = nlForm.querySelector('input[type="email"]');
      if (input && input.value.trim()) {
        const original = input.placeholder;
        input.value = '';
        input.placeholder = 'Thank you — you\'re subscribed!';
        input.style.borderColor = 'var(--gold)';
        setTimeout(() => {
          input.placeholder = original;
          input.style.borderColor = '';
        }, 3500);
      }
    });
  }

  /* ──────────────────────────────────────────────────────────
     CONSENT READ MORE TOGGLE — all viewports
     ────────────────────────────────────────────────────────── */
  document.querySelectorAll('.consent-read-more').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const expanded = btn.closest('.newsletter-consent').querySelector('.consent-expanded');
      const isHidden = expanded.hidden;
      expanded.hidden = !isHidden;
      btn.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
      btn.textContent = isHidden ? 'Read less' : 'Read more';
    });
  });

  /* ──────────────────────────────────────────────────────────
     MOBILE BEHAVIOURS
     ────────────────────────────────────────────────────────── */
  if (isMobile()) {
    const main         = document.getElementById('site-main');
    const slides       = [...document.querySelectorAll('.slide')];
    const dots         = [...document.querySelectorAll('.dot-nav .dot')];
    const dotNav       = document.querySelector('.dot-nav');
    const header       = document.getElementById('site-header');
    const mobileSearch = document.getElementById('mobile-search');

    if (!main) return;

    const isConcept2 = document.documentElement.classList.contains('concept-2');

    /* ── Scroll reveal for concept-2 mobile ─────────────────── */
    if (isConcept2) {
      const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const delay = entry.target.dataset.delay;
            if (delay) entry.target.style.transitionDelay = delay + 'ms';
            entry.target.classList.add('revealed');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });
      document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));
    }

    /* ── Position mobile search bar below header ─────────────── */
    function positionSearch(headerVisible) {
      if (!mobileSearch) return;
      if (headerVisible) {
        mobileSearch.style.top = (header ? header.offsetHeight : 0) + 'px';
      } else {
        mobileSearch.style.top = '0px';
      }
    }
    // Initialise
    positionSearch(true);

    /* ── 1. Header hide / show on scroll ─────────────────────── */
    let lastScroll = 0;

    const scrollTarget = isConcept2 ? window : main;
    const getScroll = () => isConcept2 ? window.scrollY : main.scrollTop;

    scrollTarget.addEventListener('scroll', () => {
      const current = getScroll();

      if (current < 60) {
        // Near top — always show header
        document.body.classList.remove('header-hidden');
        positionSearch(true);
      } else if (current > lastScroll + 8) {
        // Scrolling down — hide header, search stays at top
        document.body.classList.add('header-hidden');
        positionSearch(false);
      } else if (current < lastScroll - 8) {
        // Scrolling up — show header, search drops below it
        document.body.classList.remove('header-hidden');
        positionSearch(true);
      }

      lastScroll = current;
    }, { passive: true });

    /* ── 2. Dot nav — track current slide ────────────────────── */
    const slideObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          const idx   = parseInt(entry.target.dataset.slideIndex, 10);
          const theme = entry.target.dataset.theme;

          // Update active dot
          dots.forEach((d, i) => d.classList.toggle('dot--active', i === idx));

          // Switch dot colour based on slide background
          if (theme === 'light') {
            dotNav.classList.add('theme-light');
          } else {
            dotNav.classList.remove('theme-light');
          }
        }
      });
    }, { root: main, threshold: 0.5 });

    slides.forEach(s => slideObserver.observe(s));

    /* ── 3. Dot click → scroll to slide ─────────────────────── */
    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        const target = slides[idx];
        if (target) {
          main.scrollTo({ top: target.offsetTop, behavior: 'smooth' });
        }
      });
    });

    /* ── 4. Category carousel (mobile only) ──────────────────── */
    const catCards  = [...document.querySelectorAll('.cat-card')];
    const prevBtn   = document.getElementById('cat-prev');
    const nextBtn   = document.getElementById('cat-next');
    const indicator = document.querySelector('.cat-nav-indicator');
    let currentCat  = 0;

    function setCategory(next) {
      const prev = currentCat;
      currentCat = Math.max(0, Math.min(catCards.length - 1, next));

      catCards.forEach((card, i) => {
        card.classList.remove('cat-active', 'cat-hidden', 'cat-prev');
        if (i === currentCat) {
          card.classList.add('cat-active');
        } else if (i < currentCat) {
          card.classList.add('cat-prev');
        } else {
          card.classList.add('cat-hidden');
        }
      });

      if (indicator) indicator.textContent = `${currentCat + 1} / ${catCards.length}`;

      // Disable buttons at boundaries
      if (prevBtn) prevBtn.disabled = currentCat === 0;
      if (nextBtn) nextBtn.disabled = currentCat === catCards.length - 1;
    }

    if (prevBtn) prevBtn.addEventListener('click', () => setCategory(currentCat - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => setCategory(currentCat + 1));

    // Initialise
    setCategory(0);

    /* ── 5. Swipe support for category carousel ──────────────── */
    const catGrid = document.getElementById('categories-grid');
    if (catGrid) {
      let touchStartX = 0;
      catGrid.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].clientX;
      }, { passive: true });
      catGrid.addEventListener('touchend', e => {
        const diff = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) {
          setCategory(diff > 0 ? currentCat + 1 : currentCat - 1);
        }
      }, { passive: true });
    }

    /* ── 6. Footer accordion ─────────────────────────────────── */
    const footerCols = [...document.querySelectorAll('.footer-col:not(.footer-social-col)')];
    footerCols.forEach(col => {
      const heading = col.querySelector('.footer-heading');
      if (!heading) return;
      heading.addEventListener('click', () => {
        const isOpen = col.classList.contains('is-open');
        footerCols.forEach(c => c.classList.remove('is-open'));
        if (!isOpen) col.classList.add('is-open');
      });
    });

  } else {
    /* ──────────────────────────────────────────────────────────
       DESKTOP BEHAVIOURS
       ────────────────────────────────────────────────────────── */

    /* ── Scroll reveal ───────────────────────────────────────── */
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = entry.target.dataset.delay;
          if (delay) entry.target.style.transitionDelay = delay + 'ms';
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll('[data-reveal]').forEach(el => {
      revealObserver.observe(el);
    });

    /* ── Header shadow on scroll ─────────────────────────────── */
    const header = document.getElementById('site-header');
    if (header) {
      window.addEventListener('scroll', () => {
        header.style.boxShadow = window.scrollY > 10
          ? '0 2px 16px rgba(0,0,0,0.08)'
          : 'none';
      }, { passive: true });
    }
  }

})();
