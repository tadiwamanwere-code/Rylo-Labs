/* RYLO LABS — Single-Page Animations */
(function () {
  'use strict';

  /* ═══════════════════════════════════════
     NAVBAR — Entrance + smooth scroll
     ═══════════════════════════════════════ */
  var navbar = document.getElementById('navbar');
  if (navbar) {
    navbar.style.opacity = '0';
    navbar.style.transform = 'translateY(-20px)';
    navbar.style.transition = 'opacity 0.8s cubic-bezier(0.16,1,0.3,1), transform 0.8s cubic-bezier(0.16,1,0.3,1)';
  }

  /* Smooth scroll for anchor links */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        /* Update active nav link */
        var href = this.getAttribute('href');
        navbar.querySelectorAll('.topnav__link').forEach(function (l) {
          l.classList.toggle('active', l.getAttribute('href') === href);
        });
      }
    });
  });


  /* ═══════════════════════════════════════
     HERO — Staggered entrance on load
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

    /* Slideshow first slide is already active — reveal CTA + hint */
    var heroCta = document.getElementById('heroCta');
    if (heroCta) setTimeout(function () { heroCta.classList.add('visible'); }, 1400);

    var scrollHint = document.getElementById('scrollHint');
    if (scrollHint) setTimeout(function () { scrollHint.classList.add('visible'); }, 1800);

    /* Start the slideshow after entrance finishes */
    setTimeout(startSlideshow, 2200);
  }

  if (document.readyState === 'complete') runEntrance();
  else window.addEventListener('load', runEntrance);


  /* ═══════════════════════════════════════
     HERO TEXT SLIDESHOW
     Auto-cycles every 4s with animated
     transitions between slides.
     ═══════════════════════════════════════ */
  var slides = document.querySelectorAll('.hero-slide');
  var dots   = document.querySelectorAll('.hero-dot');
  var currentSlide = 0;
  var slideInterval = null;

  function goToSlide(index) {
    if (index === currentSlide || !slides.length) return;

    /* Exit current */
    slides[currentSlide].classList.remove('hero-slide--active');
    slides[currentSlide].classList.add('hero-slide--exit');
    dots[currentSlide].classList.remove('hero-dot--active');

    /* After exit transition, remove exit class */
    var prev = currentSlide;
    setTimeout(function () {
      slides[prev].classList.remove('hero-slide--exit');
    }, 700);

    /* Enter new */
    currentSlide = index;
    slides[currentSlide].classList.add('hero-slide--active');
    dots[currentSlide].classList.add('hero-dot--active');
  }

  function nextSlide() {
    goToSlide((currentSlide + 1) % slides.length);
  }

  function startSlideshow() {
    if (slides.length < 2) return;
    slideInterval = setInterval(nextSlide, 4000);
  }

  /* Dot click */
  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      var idx = parseInt(this.getAttribute('data-slide'), 10);
      if (idx !== currentSlide) {
        clearInterval(slideInterval);
        goToSlide(idx);
        slideInterval = setInterval(nextSlide, 4000);
      }
    });
  });


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
     HERO FADE ON SCROLL
     ═══════════════════════════════════════ */
  var heroEl = document.getElementById('hero');
  var scrollHintEl = document.getElementById('scrollHint');

  function onScroll() {
    var scrollY = window.scrollY;
    var vh = window.innerHeight;

    /* Hero fade */
    var fadeEnd = vh * 0.5;
    var progress = Math.min(scrollY / fadeEnd, 1);
    if (heroEl) {
      heroEl.style.opacity = String(1 - progress);
      heroEl.style.transform = 'translateY(-' + (progress * 50) + 'px)';
    }
    if (scrollHintEl) {
      scrollHintEl.style.opacity = String(Math.max(0, 1 - progress * 3));
    }

    /* Navbar: switch dark/light based on which section is at top */
    if (navbar) {
      var sections = document.querySelectorAll('section[id]');
      var currentDark = false;
      sections.forEach(function (sec) {
        var rect = sec.getBoundingClientRect();
        if (rect.top <= 80 && rect.bottom > 80) {
          currentDark = sec.id === 'home' || sec.id === 'about';
        }
      });
      if (currentDark) navbar.classList.add('topnav--dark');
      else navbar.classList.remove('topnav--dark');

      /* Update active link */
      var activeId = 'home';
      sections.forEach(function (sec) {
        if (sec.getBoundingClientRect().top <= vh * 0.4) activeId = sec.id;
      });
      navbar.querySelectorAll('.topnav__link').forEach(function (l) {
        l.classList.toggle('active', l.getAttribute('href') === '#' + activeId);
      });
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();


  /* ═══════════════════════════════════════
     RISING COLOR MORPH — Scroll-driven
     The gradient rises upward as you
     scroll through each transition zone,
     diluting the previous section's color.
     ═══════════════════════════════════════ */
  var morphs = document.querySelectorAll('.color-morph');

  function updateMorphs() {
    var vh = window.innerHeight;
    morphs.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      var height = el.offsetHeight;
      /* 0 = bottom of zone at viewport bottom, 1 = top of zone at viewport top */
      var progress = 1 - (rect.bottom / (vh + height));
      progress = Math.max(0, Math.min(progress, 1));
      /* Move the rising gradient from bottom (-100%) to covering the zone (0%) */
      var rising = el.querySelector('.color-morph__rising');
      if (rising) {
        var shift = progress * 100; /* 0% to 100% upward */
        rising.style.transform = 'translateY(-' + shift + '%)';
      }
    });
  }

  window.addEventListener('scroll', function () {
    requestAnimationFrame(updateMorphs);
  }, { passive: true });
  updateMorphs();

})();
