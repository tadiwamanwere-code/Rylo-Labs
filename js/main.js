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

    var heroWords = document.querySelectorAll('.hero-word');
    heroWords.forEach(function (w, i) {
      setTimeout(function () { w.classList.add('visible'); }, 1100 + i * 130);
    });

    var subWords = document.querySelectorAll('.hero-word-sub');
    var subStart = 1100 + heroWords.length * 130 + 250;
    subWords.forEach(function (w, i) {
      setTimeout(function () { w.classList.add('visible'); }, subStart + i * 90);
    });

    var heroCta = document.getElementById('heroCta');
    var ctaDelay = subStart + subWords.length * 90 + 300;
    if (heroCta) setTimeout(function () { heroCta.classList.add('visible'); }, ctaDelay);

    var scrollHint = document.getElementById('scrollHint');
    if (scrollHint) setTimeout(function () { scrollHint.classList.add('visible'); }, ctaDelay + 400);
  }

  if (document.readyState === 'complete') runEntrance();
  else window.addEventListener('load', runEntrance);


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

})();
