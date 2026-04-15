/* ============================================================
   LINDT HOMEPAGE — CONCEPT 3
   concept-3.js

   Hero banner carousel with linked product group switching.
   Tabs in the products section also control the banner.
   ============================================================ */

(function () {
  'use strict';

  if (!document.documentElement.classList.contains('concept-3')) return;

  /* ──────────────────────────────────────────────────────────
     REFERENCES
     ────────────────────────────────────────────────────────── */
  const carousel      = document.getElementById('c3-carousel');
  const slides        = [...document.querySelectorAll('.c3-slide')];
  const dots          = [...document.querySelectorAll('.c3-dot')];
  const prevBtn       = document.querySelector('.c3-prev');
  const nextBtn       = document.querySelector('.c3-next');
  const pauseBtn      = document.querySelector('.c3-pause');
  const productGroups = [...document.querySelectorAll('.c3-product-group')];
  const tabs          = [...document.querySelectorAll('[data-c3-tab]')];

  if (!slides.length) return;

  const INTERVAL   = 5000;
  const DARK_SLIDES = [2]; // slide indices that need light-coloured controls

  let current  = 0;
  let isPaused = false;
  let timer    = null;

  /* ──────────────────────────────────────────────────────────
     CORE: go to slide index
     ────────────────────────────────────────────────────────── */
  function goTo(idx) {
    const prev = current;
    current    = ((idx % slides.length) + slides.length) % slides.length;

    // Slides
    slides[prev].classList.remove('c3-slide--active');
    slides[current].classList.add('c3-slide--active');

    // Dots
    dots[prev].classList.remove('c3-dot--active');
    dots[current].classList.add('c3-dot--active');

    // Product groups
    if (productGroups[prev]) productGroups[prev].classList.remove('c3-product-group--active');
    if (productGroups[current]) productGroups[current].classList.add('c3-product-group--active');

    // Tabs — sync active state
    tabs.forEach(t => t.classList.remove('tab--active'));
    const activeTab = tabs[current];
    if (activeTab) activeTab.classList.add('tab--active');

    // Control theme (light controls on dark slide)
    if (carousel) {
      if (DARK_SLIDES.includes(current)) {
        carousel.classList.add('c3-dark-controls');
      } else {
        carousel.classList.remove('c3-dark-controls');
      }
    }
  }

  /* ──────────────────────────────────────────────────────────
     AUTO-PLAY TIMER
     ────────────────────────────────────────────────────────── */
  function startTimer() {
    stopTimer();
    timer = setInterval(function () { goTo(current + 1); }, INTERVAL);
  }

  function stopTimer() {
    if (timer) { clearInterval(timer); timer = null; }
  }

  /* ──────────────────────────────────────────────────────────
     CONTROLS
     ────────────────────────────────────────────────────────── */
  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      goTo(current - 1);
      if (!isPaused) startTimer();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      goTo(current + 1);
      if (!isPaused) startTimer();
    });
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      goTo(i);
      if (!isPaused) startTimer();
    });
  });

  const ICON_PAUSE = '<svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor" aria-hidden="true"><rect x="4" y="3" width="4" height="18"/><rect x="16" y="3" width="4" height="18"/></svg>';
  const ICON_PLAY  = '<svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor" aria-hidden="true"><polygon points="5,3 19,12 5,21"/></svg>';

  function setPaused(state) {
    isPaused = state;
    if (isPaused) {
      stopTimer();
      if (pauseBtn) { pauseBtn.setAttribute('aria-label', 'Play slideshow');  pauseBtn.innerHTML = ICON_PLAY;  }
    } else {
      goTo(current + 1); // advance immediately on resume
      startTimer();
      if (pauseBtn) { pauseBtn.setAttribute('aria-label', 'Pause slideshow'); pauseBtn.innerHTML = ICON_PAUSE; }
    }
  }

  if (pauseBtn) {
    pauseBtn.addEventListener('click', function () { setPaused(!isPaused); });
  }

  /* ──────────────────────────────────────────────────────────
     TABS → also change banner slide
     (main.js already handles the visual tab--active state,
      here we extend that to also switch the banner)
     ────────────────────────────────────────────────────────── */
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var idx = parseInt(tab.dataset.c3Tab, 10);
      if (!isNaN(idx)) {
        goTo(idx);
        if (!isPaused) startTimer();
      }
    });
  });

  /* ──────────────────────────────────────────────────────────
     PAUSE WHEN USER INTERACTS WITH PRODUCT CAROUSEL
     Sets isPaused=true (shows play icon) on first touch/click.
     Auto-advance only resumes when the user explicitly clicks
     the play button.
     ────────────────────────────────────────────────────────── */
  const productsSection = document.querySelector('.c3-products');
  if (productsSection) {
    function onProductInteractionStart() {
      if (!isPaused) setPaused(true);
    }

    productsSection.addEventListener('touchstart', onProductInteractionStart, { passive: true });
    productsSection.addEventListener('mousedown',  onProductInteractionStart);
  }

  /* ──────────────────────────────────────────────────────────
     TOUCH / SWIPE on hero carousel
     ────────────────────────────────────────────────────────── */
  if (carousel) {
    var touchStartX = 0;
    carousel.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    carousel.addEventListener('touchend', function (e) {
      var diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        goTo(diff > 0 ? current + 1 : current - 1);
        if (!isPaused) startTimer();
      }
    }, { passive: true });
  }

  /* ──────────────────────────────────────────────────────────
     MOBILE HEADER + SEARCH SCROLL BEHAVIOUR
     main.js gates everything inside if (isMobile()) which is
     evaluated once at load time. If the viewport settles to
     mobile AFTER that check (first visit, DevTools emulation,
     etc.) the scroll listeners never attach. This block covers
     concept-3 for all those cases.
     ────────────────────────────────────────────────────────── */
  var _mobileScrollReady = false;

  function initMobileScroll() {
    if (_mobileScrollReady || window.innerWidth > 768) return;
    _mobileScrollReady = true;

    var hdr = document.getElementById('site-header');
    var srch = document.getElementById('mobile-search');

    function posSearch(visible) {
      if (!srch) return;
      srch.style.top = visible ? (hdr ? hdr.offsetHeight : 0) + 'px' : '0px';
    }
    posSearch(true);

    var lastSc = 0;
    window.addEventListener('scroll', function () {
      var cur = window.scrollY;
      if (cur < 60) {
        document.body.classList.remove('header-hidden');
        posSearch(true);
      } else if (cur > lastSc + 8) {
        document.body.classList.add('header-hidden');
        posSearch(false);
      } else if (cur < lastSc - 8) {
        document.body.classList.remove('header-hidden');
        posSearch(true);
      }
      lastSc = cur;
    }, { passive: true });
  }

  initMobileScroll();
  /* Also catch the case where the user resizes into mobile width */
  window.addEventListener('resize', initMobileScroll, { passive: true });

  /* ──────────────────────────────────────────────────────────
     INIT
     ────────────────────────────────────────────────────────── */
  goTo(0);
  startTimer();

})();
