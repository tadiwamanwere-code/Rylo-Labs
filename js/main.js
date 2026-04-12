/* RYLO LABS — Scroll-Driven Puzzle Animation + Entrance Effects */
(function () {
  'use strict';

  /* ═══════════════════════════════════════
     PUZZLE FRAME SCRUBBER
     ═══════════════════════════════════════ */
  var puzzleFrame   = document.getElementById('puzzleFrame');
  var puzzleOverlay = document.getElementById('puzzleOverlay');
  var puzzleHero    = document.querySelector('.puzzle-hero');

  var TOTAL_FRAMES = 240;
  var frames = new Array(TOTAL_FRAMES);
  var frameSrcs = new Array(TOTAL_FRAMES);
  var currentFrame = -1;

  for (var i = 0; i < TOTAL_FRAMES; i++) {
    frameSrcs[i] = 'scr/images/ezgif-frame-' + String(i + 1).padStart(3, '0') + '.jpg';
  }

  function showFrame(index) {
    if (!puzzleFrame || index < 0 || index >= TOTAL_FRAMES) return;
    var img = frames[index];
    if (img && img.complete && img.naturalWidth) {
      puzzleFrame.src = img.src;
      return;
    }
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
    var first = new Image();
    first.onload = function () {
      puzzleFrame.src = first.src;
      currentFrame = 0;
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

    /* Nav links navigate normally — active state set per-page in HTML */
  }


  /* ═══════════════════════════════════════
     HERO — Only Rylo Labs title on load
     Everything else reveals on scroll
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
     CACHE DOM REFS for scroll-driven reveals
     ═══════════════════════════════════════ */
  var heroEl       = document.getElementById('hero');
  var scrollHintEl = document.getElementById('scrollHint');
  var heroLineEl   = document.getElementById('heroLine');
  var heroParaEl   = document.getElementById('heroPara');
  var heroCtaEl    = document.getElementById('heroCta');

  var taglineWords = document.querySelectorAll('#heroTagline .hero-word');
  var subWords     = document.querySelectorAll('#heroSub .hero-word-sub');

  var lastRAF = null;


  /* ═══════════════════════════════════════
     MASTER SCROLL HANDLER
     Drives puzzle frames AND text reveals
     ═══════════════════════════════════════ */
  function onScroll() {
    if (lastRAF) cancelAnimationFrame(lastRAF);
    lastRAF = requestAnimationFrame(handleScroll);
  }

  function handleScroll() {
    var scrollY = window.scrollY;
    var vh      = window.innerHeight;

    if (puzzleFrame && puzzleHero) {
      var sectionTop    = puzzleHero.offsetTop;
      var sectionHeight = puzzleHero.offsetHeight;
      var maxScroll     = sectionHeight - vh;
      var scrollIn      = Math.max(0, scrollY - sectionTop);
      var progress      = Math.min(scrollIn / maxScroll, 1);

      /* ── Frame scrubbing ── */
      var frameIndex = Math.min(Math.floor(progress * (TOTAL_FRAMES - 1)), TOTAL_FRAMES - 1);
      if (frameIndex !== currentFrame) {
        currentFrame = frameIndex;
        showFrame(frameIndex);
      }

      /* ── Scroll-driven text reveals ──
         Each element appears at a specific scroll %,
         synced with the puzzle frames assembling.
         ────────────────────────────────────────────
         0%      Rylo Labs (already visible from load)
         1%      Accent line
         2-5%    Tagline words (one every 0.4%)
         6-9%    Sub-tagline words (one every 0.3%)
         10%     Paragraph
         11%     CTA
         12%     Scroll hint
         20%+    Text fades out
      ──────────────────────────────────────────── */

      // Accent line
      if (heroLineEl) {
        if (progress >= 0.01) heroLineEl.classList.add('visible');
        else heroLineEl.classList.remove('visible');
      }

      // Tagline words — staggered 2% to ~5%
      for (var tw = 0; tw < taglineWords.length; tw++) {
        var twThresh = 0.02 + tw * 0.004;
        if (progress >= twThresh) taglineWords[tw].classList.add('visible');
        else taglineWords[tw].classList.remove('visible');
      }

      // Sub-tagline words — staggered 6% to ~9%
      for (var sw = 0; sw < subWords.length; sw++) {
        var swThresh = 0.06 + sw * 0.003;
        if (progress >= swThresh) subWords[sw].classList.add('visible');
        else subWords[sw].classList.remove('visible');
      }

      // Paragraph
      if (heroParaEl) {
        if (progress >= 0.10) heroParaEl.classList.add('visible');
        else heroParaEl.classList.remove('visible');
      }

      // CTA
      if (heroCtaEl) {
        if (progress >= 0.11) heroCtaEl.classList.add('visible');
        else heroCtaEl.classList.remove('visible');
      }

      // Scroll hint
      if (scrollHintEl) {
        if (progress >= 0.12) scrollHintEl.classList.add('visible');
        else scrollHintEl.classList.remove('visible');
      }

      /* ── Hero text fades out 20-35% ── */
      var fadeStart = 0.20;
      var fadeEnd   = 0.35;
      if (progress > fadeStart) {
        var textProg = Math.min((progress - fadeStart) / (fadeEnd - fadeStart), 1);
        if (heroEl) {
          heroEl.style.opacity   = String(1 - textProg);
          heroEl.style.transform = 'translateY(-' + (textProg * 80) + 'px)';
        }
        if (scrollHintEl) {
          scrollHintEl.style.opacity = String(Math.max(0, 1 - textProg * 3));
        }
        if (puzzleOverlay) {
          puzzleOverlay.style.opacity = String(1 - textProg);
        }
      } else {
        if (heroEl) {
          heroEl.style.opacity = '1';
          heroEl.style.transform = 'translateY(0)';
        }
        if (puzzleOverlay) {
          puzzleOverlay.style.opacity = '1';
        }
      }

      /* ── Frame fades out last 15% ── */
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
