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
    prevBtn.addEventListener('click', function () { goTo(current - 1); });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function () { goTo(current + 1); });
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () { goTo(i); });
  });

  /* Pause/play button — toggles video-background playback state */
  const ICON_PAUSE = '<svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor" aria-hidden="true"><rect x="4" y="3" width="4" height="18"/><rect x="16" y="3" width="4" height="18"/></svg>';
  const ICON_PLAY  = '<svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor" aria-hidden="true"><polygon points="5,3 19,12 5,21"/></svg>';

  if (pauseBtn) {
    pauseBtn.addEventListener('click', function () {
      isPaused = !isPaused;
      if (isPaused) {
        pauseBtn.setAttribute('aria-label', 'Play video');
        pauseBtn.innerHTML = ICON_PLAY;
      } else {
        pauseBtn.setAttribute('aria-label', 'Pause video');
        pauseBtn.innerHTML = ICON_PAUSE;
      }
    });
  }

  /* ──────────────────────────────────────────────────────────
     TABS → also change banner slide
     (main.js already handles the visual tab--active state,
      here we extend that to also switch the banner)
     ────────────────────────────────────────────────────────── */
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var idx = parseInt(tab.dataset.c3Tab, 10);
      if (!isNaN(idx)) { goTo(idx); }
    });
  });

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
      }
    }, { passive: true });
  }

  /* ──────────────────────────────────────────────────────────
     DESKTOP HEADER — hide on scroll-down, reveal on scroll-up
     ────────────────────────────────────────────────────────── */
  (function initDesktopScroll() {
    if (window.innerWidth <= 768) return;
    var lastY = 0;
    window.addEventListener('scroll', function () {
      var cur = window.scrollY;
      if (cur < 80) {
        document.body.classList.remove('header-hidden');
      } else if (cur > lastY + 8) {
        document.body.classList.add('header-hidden');
      } else if (cur < lastY - 8) {
        document.body.classList.remove('header-hidden');
      }
      lastY = cur;
    }, { passive: true });
  })();

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
     EXPLORE LINDT — tab switching
     ────────────────────────────────────────────────────────── */
  var exploreTabs   = [...document.querySelectorAll('.c3-explore-tab')];
  var explorePanels = [...document.querySelectorAll('.c3-explore-panel')];
  var exploreNav    = document.querySelector('.c3-explore-tabs');

  function centreTab(tab) {
    if (!exploreNav || window.innerWidth > 768) return;
    var navW  = exploreNav.offsetWidth;
    var tabL  = tab.offsetLeft;
    var tabW  = tab.offsetWidth;
    exploreNav.scrollLeft = tabL - (navW / 2) + (tabW / 2);
  }

  exploreTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var idx = parseInt(tab.dataset.exploreTab, 10);
      exploreTabs.forEach(function (t) {
        t.classList.remove('c3-explore-tab--active');
        t.setAttribute('aria-selected', 'false');
      });
      explorePanels.forEach(function (p) { p.classList.remove('c3-explore-panel--active'); });
      tab.classList.add('c3-explore-tab--active');
      tab.setAttribute('aria-selected', 'true');
      if (explorePanels[idx]) explorePanels[idx].classList.add('c3-explore-panel--active');
      centreTab(tab);
    });
  });

  // Centre the initially active tab on mobile load
  var initialActive = document.querySelector('.c3-explore-tab--active');
  if (initialActive) centreTab(initialActive);

  /* ──────────────────────────────────────────────────────────
     NEWSLETTER FLOAT — dismiss on X click
     ────────────────────────────────────────────────────────── */
  var newsletterClose = document.getElementById('c3-newsletter-close');
  var newsletterFloat = document.getElementById('c3-newsletter-float');
  if (newsletterClose && newsletterFloat) {
    newsletterClose.addEventListener('click', function (e) {
      e.stopPropagation();
      newsletterFloat.classList.add('c3-newsletter-hidden');
    });
  }

  /* ──────────────────────────────────────────────────────────
     INIT
     ────────────────────────────────────────────────────────── */
  goTo(0);

})();

/* ============================================================
   VIDEO CONTROLS — store locator section
   Play/pause toggle · Volume slider · Fullscreen button
   ============================================================ */
(function () {
  'use strict';

  if (!document.documentElement.classList.contains('concept-3')) return;

  var playBtn  = document.querySelector('.c3-vid-play');
  var soundBtn = document.querySelector('.c3-vid-sound');
  var volTrack = document.querySelector('.c3-vol-track');
  var volFill  = document.querySelector('.c3-vol-fill');
  var volThumb = document.querySelector('.c3-vol-thumb');

  if (!playBtn) return;

  /* ── State ── */
  var isPlaying = false;
  var isMuted   = true;
  var volPct    = 80;   // remembered level when muted (0–100)

  /* ── SVG icon strings ── */
  var SVG_PLAY  = '<svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor" aria-hidden="true"><polygon points="5,3 19,12 5,21"/></svg>';
  var SVG_PAUSE = '<svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor" aria-hidden="true"><rect x="4" y="3" width="4" height="18"/><rect x="16" y="3" width="4" height="18"/></svg>';

  var SVG_VOL = {
    off:  '<svg viewBox="0 0 17 17" width="15" height="15" fill="currentColor" aria-hidden="true"><path d="M14.025 16.0083L11.8823 13.8656C11.5872 14.0545 11.2743 14.2168 10.9438 14.3526C10.6132 14.4884 10.2709 14.5976 9.9167 14.6802V13.2281C10.082 13.1691 10.2443 13.1101 10.4037 13.051C10.5631 12.992 10.7136 12.9212 10.8552 12.8385L8.50003 10.4833V14.1667L4.95837 10.625H2.12503V6.375H4.3917L0.991699 2.975L1.98337 1.98334L15.0167 15.0167L14.025 16.0083ZM13.8834 11.9L12.8563 10.8729C13.057 10.5069 13.2075 10.1233 13.3078 9.72188C13.4082 9.32049 13.4584 8.9073 13.4584 8.4823C13.4584 7.37257 13.1337 6.38091 12.4844 5.5073C11.8351 4.63368 10.9792 4.04341 9.9167 3.73646V2.28438C11.3806 2.61493 12.5729 3.35573 13.4938 4.50678C14.4146 5.65782 14.875 6.98299 14.875 8.4823C14.875 9.10799 14.7894 9.71007 14.6183 10.2885C14.4471 10.867 14.2021 11.4042 13.8834 11.9ZM11.5104 9.52709L9.9167 7.93334V5.63125C10.4716 5.89098 10.9054 6.28056 11.2183 6.8C11.5311 7.31945 11.6875 7.88612 11.6875 8.5C11.6875 8.67709 11.6728 8.85122 11.6433 9.0224C11.6137 9.19358 11.5695 9.36181 11.5104 9.52709ZM8.50003 6.51667L6.65837 4.675L8.50003 2.83334V6.51667ZM7.08337 10.7313V9.06667L5.80837 7.79167H3.5417V9.20834H5.56045L7.08337 10.7313Z"/></svg>',
    low:  '<svg viewBox="0 0 17 17" width="15" height="15" fill="currentColor" aria-hidden="true"><path d="M4.95837 10.625V6.37499H7.79171L11.3334 2.83333V14.1667L7.79171 10.625H4.95837ZM6.37504 9.20833H8.39379L9.91671 10.7312V6.26874L8.39379 7.79166H6.37504V9.20833Z"/></svg>',
    mid:  '<svg viewBox="0 0 17 17" width="15" height="15" fill="currentColor" aria-hidden="true"><path d="M3.54163 10.625V6.37499H6.37496L9.91663 2.83333V14.1667L6.37496 10.625H3.54163ZM11.3333 11.3333V5.63124C11.8645 5.87916 12.2925 6.26284 12.6171 6.78229C12.9418 7.30173 13.1041 7.8743 13.1041 8.49999C13.1041 9.12569 12.9418 9.69236 12.6171 10.2C12.2925 10.7076 11.8645 11.0854 11.3333 11.3333ZM8.49996 6.26874L6.97704 7.79166H4.95829V9.20833H6.97704L8.49996 10.7312V6.26874Z"/></svg>',
    high: '<svg viewBox="0 0 17 17" width="15" height="15" fill="currentColor" aria-hidden="true"><path d="M9.91667 14.6802V13.2281C10.9792 12.9212 11.8351 12.3309 12.4844 11.4573C13.1337 10.5837 13.4583 9.59202 13.4583 8.48229C13.4583 7.37257 13.1337 6.38091 12.4844 5.50729C11.8351 4.63368 10.9792 4.04341 9.91667 3.73646V2.28438C11.3806 2.61493 12.5729 3.35573 13.4938 4.50677C14.4146 5.65782 14.875 6.98299 14.875 8.48229C14.875 9.9816 14.4146 11.3068 13.4938 12.4578C12.5729 13.6089 11.3806 14.3497 9.91667 14.6802ZM2.125 10.625V6.375H4.95833L8.5 2.83334V14.1667L4.95833 10.625H2.125ZM9.91667 11.3333V5.63125C10.4715 5.89098 10.9054 6.28056 11.2182 6.8C11.5311 7.31945 11.6875 7.88611 11.6875 8.5C11.6875 9.10209 11.5311 9.6599 11.2182 10.1734C10.9054 10.687 10.4715 11.0736 9.91667 11.3333ZM7.08333 6.26875L5.56042 7.79167H3.54167V9.20834H5.56042L7.08333 10.7313V6.26875Z"/></svg>'
  };

  /* ── Helpers ── */
  function volIcon() {
    if (isMuted || volPct === 0) return SVG_VOL.off;
    if (volPct < 34) return SVG_VOL.low;
    if (volPct < 67) return SVG_VOL.mid;
    return SVG_VOL.high;
  }

  function updatePlay() {
    playBtn.innerHTML = isPlaying ? SVG_PAUSE : SVG_PLAY;
    playBtn.setAttribute('aria-label', isPlaying ? 'Pause video' : 'Play video');
  }

  function updateSound() {
    soundBtn.innerHTML = volIcon();
    soundBtn.setAttribute('aria-label', isMuted ? 'Unmute' : 'Mute');
  }

  function updateVolumeBar() {
    if (!volFill || !volThumb) return;
    var pct = isMuted ? 0 : volPct;
    volFill.style.height  = pct + '%';
    volThumb.style.bottom = 'calc(' + pct + '% - 5px)';
  }

  function applyVolumeFromEvent(e) {
    var rect = volTrack.getBoundingClientRect();
    var raw  = 1 - ((e.clientY - rect.top) / rect.height);
    volPct   = Math.round(Math.max(0, Math.min(1, raw)) * 100);
    isMuted  = volPct === 0;
    updateSound();
    updateVolumeBar();
  }

  /* ── Event listeners ── */
  playBtn.addEventListener('click', function () {
    isPlaying = !isPlaying;
    updatePlay();
  });

  soundBtn.addEventListener('click', function () {
    isMuted = !isMuted;
    if (!isMuted && volPct === 0) { volPct = 80; }
    updateSound();
    updateVolumeBar();
  });

  if (volTrack) {
    var dragging = false;
    volTrack.addEventListener('mousedown', function (e) {
      dragging = true;
      applyVolumeFromEvent(e);
    });
    document.addEventListener('mousemove', function (e) {
      if (dragging) { applyVolumeFromEvent(e); }
    });
    document.addEventListener('mouseup', function () { dragging = false; });
    volTrack.addEventListener('click', applyVolumeFromEvent);
  }

  /* ── Init ── */
  updatePlay();
  updateSound();
  updateVolumeBar();

})();
