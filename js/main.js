/* RYLO LABS — Scroll-Driven Puzzle Animation + Entrance Effects */
(function () {
  'use strict';

  /* ═══════════════════════════════════════
     PUZZLE FRAME SCRUBBER
     Uses a native <img> element instead of
     canvas — the browser's GPU image scaler
     produces far sharper results than canvas
     drawImage on compressed JPEGs.
     ═══════════════════════════════════════ */
  var puzzleFrame   = document.getElementById('puzzleFrame');
  var puzzleOverlay = document.getElementById('puzzleOverlay');
  var puzzleHero    = document.querySelector('.puzzle-hero');

  var TOTAL_FRAMES = 240;
  var frames = new Array(TOTAL_FRAMES);
  var frameSrcs = new Array(TOTAL_FRAMES);
  var currentFrame = -1;

  // Build src paths
  for (var i = 0; i < TOTAL_FRAMES; i++) {
    frameSrcs[i] = 'scr/images/ezgif-frame-' + String(i + 1).padStart(3, '0') + '.jpg';
  }

  function showFrame(index) {
    if (!puzzleFrame || index < 0 || index >= TOTAL_FRAMES) return;
    // Try exact frame
    var img = frames[index];
    if (img && img.complete && img.naturalWidth) {
      puzzleFrame.src = img.src;
      return;
    }
    // Nearest loaded fallback
    for (var d = 1; d < 30; d++) {
      var candidates = [index - d, index + d];
      for (var c = 0; c < candidates.length; c++) {
        var ci = candidates[c];
        if (ci < 0 || ci >= TOTAL_FRAMES) continue;
        var f = frames[ci];
        if (f && f.complete && f.naturalWidth) {
          puzzleFrame.src = f.src;
          return;
        }
      }
    }
  }

  if (puzzleFrame) {
    // Preload frame 1 immediately, show it, then queue the rest
    var first = new Image();
    first.onload = function () {
      puzzleFrame.src = first.src;
      currentFrame = 0;
      // Queue remaining frames
      for (var i = 1; i < TOTAL_FRAMES; i++) {
        var img = new Image();
        img.src = frameSrcs[i];
        frames[i] = img;
      }
    };
    first.src = frameSrcs[0];
    frames[0] = first;
  }


  /* ═══════════════════════════════════════
     NAVBAR — Entrance + link switching
     ═══════════════════════════════════════ */
  var navbar = document.getElementById('navbar');
  if (navbar) {
    navbar.style.opacity = '0';
    navbar.style.transform = 'translateY(-20px)';
    navbar.style.transition = 'opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1)';

    navbar.querySelectorAll('.topnav__link').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        navbar.querySelectorAll('.topnav__link').forEach(function (l) { l.classList.remove('active'); });
        link.classList.add('active');
      });
    });
  }


  /* ═══════════════════════════════════════
     HERO — Staggered entrance animation
     ═══════════════════════════════════════ */
  function runEntrance() {
    setTimeout(function () {
      if (navbar) {
        navbar.style.opacity = '1';
        navbar.style.transform = 'translateY(0)';
      }
    }, 300);

    var heroTitle = document.getElementById('heroTitle');
    if (heroTitle) setTimeout(function () { heroTitle.classList.add('visible'); }, 500);

    var heroLine = document.getElementById('heroLine');
    if (heroLine) setTimeout(function () { heroLine.classList.add('visible'); }, 900);

    var heroWords = document.querySelectorAll('.hero-word');
    heroWords.forEach(function (w, i) {
      setTimeout(function () { w.classList.add('visible'); }, 1100 + i * 130);
    });

    var subWords = document.querySelectorAll('.hero-word-sub');
    var subStart = 1100 + heroWords.length * 130 + 250;
    subWords.forEach(function (w, i) {
      setTimeout(function () { w.classList.add('visible'); }, subStart + i * 90);
    });

    var heroPara = document.getElementById('heroPara');
    var paraDelay = subStart + subWords.length * 90 + 250;
    if (heroPara) setTimeout(function () { heroPara.classList.add('visible'); }, paraDelay);

    var heroCtaDelay = paraDelay + 300;
    var heroCta = document.getElementById('heroCta');
    if (heroCta) setTimeout(function () { heroCta.classList.add('visible'); }, heroCtaDelay);

    var scrollHintDelay = heroCtaDelay + 400;
    var scrollHint = document.getElementById('scrollHint');
    if (scrollHint) setTimeout(function () { scrollHint.classList.add('visible'); }, scrollHintDelay);
  }

  if (document.readyState === 'complete') {
    runEntrance();
  } else {
    window.addEventListener('load', runEntrance);
  }


  /* ═══════════════════════════════════════
     SCROLL-REVEAL — IntersectionObserver
     ═══════════════════════════════════════ */
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.scroll-reveal').forEach(function (el) {
    revealObserver.observe(el);
  });


  /* ═══════════════════════════════════════
     AI CARD — Stagger children on scroll
     ═══════════════════════════════════════ */
  var aiCardObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      aiCardObs.unobserve(entry.target);

      var icon = entry.target.querySelector('.ai-card__icon');
      if (icon) setTimeout(function () {
        icon.style.opacity = '1';
        icon.style.transform = 'scale(1) rotate(0deg)';
      }, 200);

      entry.target.querySelectorAll('.ai-word').forEach(function (w, i) {
        setTimeout(function () { w.classList.add('visible'); }, 400 + i * 110);
      });

      var words = entry.target.querySelectorAll('.ai-word');
      var linesStart = 400 + words.length * 110 + 150;
      entry.target.querySelectorAll('.ai-line').forEach(function (l, i) {
        setTimeout(function () { l.classList.add('visible'); }, linesStart + i * 90);
      });

      var lines = entry.target.querySelectorAll('.ai-line');
      var ctaDelay = linesStart + lines.length * 90 + 200;
      var cta = entry.target.querySelector('.ai-card__cta');
      if (cta) setTimeout(function () { cta.classList.add('visible'); }, ctaDelay);
    });
  }, { threshold: 0.2 });

  var aiCard = document.getElementById('aiCard');
  if (aiCard) aiCardObs.observe(aiCard);


  /* ═══════════════════════════════════════
     MASTER SCROLL HANDLER
     ═══════════════════════════════════════ */
  var heroEl       = document.getElementById('hero');
  var scrollHintEl = document.getElementById('scrollHint');
  var lastRAF      = null;

  function onScroll() {
    if (lastRAF) cancelAnimationFrame(lastRAF);
    lastRAF = requestAnimationFrame(handleScroll);
  }

  function handleScroll() {
    var scrollY = window.scrollY;
    var vh      = window.innerHeight;

    /* ── Puzzle frame scrubbing ── */
    if (puzzleFrame && puzzleHero) {
      var sectionTop    = puzzleHero.offsetTop;
      var sectionHeight = puzzleHero.offsetHeight;
      var maxScroll     = sectionHeight - vh;
      var scrollIn      = Math.max(0, scrollY - sectionTop);
      var progress      = Math.min(scrollIn / maxScroll, 1);

      // Map scroll → frame
      var frameIndex = Math.min(Math.floor(progress * (TOTAL_FRAMES - 1)), TOTAL_FRAMES - 1);
      if (frameIndex !== currentFrame) {
        currentFrame = frameIndex;
        showFrame(frameIndex);
      }

      // Hero text fade — first 15% of scroll
      var textFadeEnd = maxScroll * 0.15;
      var textProg    = Math.min(scrollIn / textFadeEnd, 1);

      if (heroEl) {
        heroEl.style.opacity   = String(1 - textProg);
        heroEl.style.transform = 'translateY(-' + (textProg * 80) + 'px)';
      }
      if (scrollHintEl) {
        scrollHintEl.style.opacity = String(Math.max(0, 1 - textProg * 4));
      }

      // Overlay fades with text
      if (puzzleOverlay) {
        puzzleOverlay.style.opacity = String(1 - textProg);
      }

      // Frame fades out in the last 15%
      if (progress > 0.85) {
        var fadeProg = (progress - 0.85) / 0.15;
        puzzleFrame.style.opacity = String(1 - fadeProg);
      } else {
        puzzleFrame.style.opacity = '1';
      }
    }

    /* ── Navbar dark/light switching ── */
    if (navbar) {
      var lightSection = document.querySelector('.section-dark');
      if (lightSection) {
        var sectionRect = lightSection.getBoundingClientRect().top;
        if (sectionRect <= 80) {
          navbar.classList.remove('topnav--dark');
        } else {
          navbar.classList.add('topnav--dark');
        }
      }
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

})();
