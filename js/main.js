/* ═══════════════════════════════════════════════════════════════
   RYLO LABS — Professional Business Website JavaScript
   Packages: GSAP + ScrollTrigger, AOS, Lucide Icons
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ═══════════════════════════════════════
     INITIALIZE LIBRARIES
     ═══════════════════════════════════════ */

  // Initialize Lucide icons
  if (window.lucide) {
    lucide.createIcons();
  }

  // Initialize AOS
  if (window.AOS) {
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
      offset: 80,
      disable: window.innerWidth < 768 ? 'phone' : false
    });
  }

  // Register GSAP ScrollTrigger
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }


  /* ═══════════════════════════════════════
     NAVBAR — Scroll behavior & active state
     ═══════════════════════════════════════ */
  var navbar = document.getElementById('navbar');
  var sections = document.querySelectorAll('section[id]');

  function updateNavbar() {
    var scrollY = window.scrollY;

    // Add/remove scrolled class
    if (navbar) {
      if (scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }

    // Update active nav link
    var activeId = '';
    sections.forEach(function (sec) {
      var top = sec.offsetTop - 120;
      var bottom = top + sec.offsetHeight;
      if (scrollY >= top && scrollY < bottom) {
        activeId = sec.id;
      }
    });

    if (activeId && navbar) {
      navbar.querySelectorAll('.nav-link').forEach(function (link) {
        var href = link.getAttribute('href');
        if (href === '#' + activeId) {
          link.classList.add('nav-link--active');
        } else {
          link.classList.remove('nav-link--active');
        }
      });
    }
  }

  window.addEventListener('scroll', updateNavbar, { passive: true });
  updateNavbar();


  /* ═══════════════════════════════════════
     SMOOTH SCROLL — Anchor links
     ═══════════════════════════════════════ */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;
      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        var offset = 80;
        var top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });

        // Close mobile menu if open
        var mobileMenu = document.getElementById('mobileMenu');
        var mobileMenuBtn = document.getElementById('mobileMenuBtn');
        if (mobileMenu && mobileMenu.classList.contains('open')) {
          mobileMenu.classList.remove('open');
          mobileMenuBtn.classList.remove('burger-open');
        }
      }
    });
  });


  /* ═══════════════════════════════════════
     MOBILE MENU — Toggle
     ═══════════════════════════════════════ */
  var mobileMenuBtn = document.getElementById('mobileMenuBtn');
  var mobileMenu = document.getElementById('mobileMenu');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', function () {
      mobileMenu.classList.toggle('open');
      mobileMenuBtn.classList.toggle('burger-open');
    });
  }


  /* ═══════════════════════════════════════
     GSAP — Hero entrance animation
     ═══════════════════════════════════════ */
  function heroEntrance() {
    if (!window.gsap) return;

    var tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.fromTo(navbar,
      { y: -30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8 },
      0.2
    );

    // Hero content animates via AOS, but we add parallax via GSAP
    gsap.to('.hero-orb--1', {
      scrollTrigger: {
        trigger: '#home',
        start: 'top top',
        end: 'bottom top',
        scrub: 1
      },
      y: -100,
      x: 50,
      scale: 0.8,
      opacity: 0
    });

    gsap.to('.hero-orb--2', {
      scrollTrigger: {
        trigger: '#home',
        start: 'top top',
        end: 'bottom top',
        scrub: 1
      },
      y: -80,
      x: -30,
      opacity: 0
    });
  }

  if (document.readyState === 'complete') {
    heroEntrance();
  } else {
    window.addEventListener('load', heroEntrance);
  }


  /* ═══════════════════════════════════════
     GSAP — Parallax effects on scroll
     ═══════════════════════════════════════ */
  function initParallax() {
    if (!window.gsap || !window.ScrollTrigger) return;

    // Product showcase subtle parallax
    var showcase = document.querySelector('.product-showcase__frame');
    if (showcase) {
      gsap.fromTo(showcase,
        { y: 40 },
        {
          y: -40,
          scrollTrigger: {
            trigger: '#products',
            start: 'top 80%',
            end: 'bottom 20%',
            scrub: 1
          }
        }
      );
    }

    // About visual cards stagger
    gsap.utils.toArray('.about-visual__card').forEach(function (card, i) {
      gsap.fromTo(card,
        { x: -30 - (i * 15), opacity: 0 },
        {
          x: i * 20,
          opacity: 1,
          duration: 0.8,
          delay: i * 0.15,
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      );
    });

    // Founder image card rotation
    var founderCard = document.querySelector('.founder-image-card');
    if (founderCard) {
      gsap.fromTo(founderCard,
        { rotate: -3, scale: 0.95, opacity: 0 },
        {
          rotate: 0,
          scale: 1,
          opacity: 1,
          duration: 1,
          scrollTrigger: {
            trigger: '#founder',
            start: 'top 70%',
            toggleActions: 'play none none none'
          }
        }
      );
    }
  }

  if (document.readyState === 'complete') {
    initParallax();
  } else {
    window.addEventListener('load', initParallax);
  }


  /* ═══════════════════════════════════════
     STAT COUNTERS — Animate on scroll
     ═══════════════════════════════════════ */
  var counters = document.querySelectorAll('.stat-number');
  var countersAnimated = false;

  function animateCounters() {
    if (countersAnimated) return;

    counters.forEach(function (counter) {
      var target = parseInt(counter.getAttribute('data-target'), 10);
      var suffix = counter.getAttribute('data-suffix') || '';
      var duration = 2000;
      var start = 0;
      var startTime = null;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);

        // Ease out cubic
        var eased = 1 - Math.pow(1 - progress, 3);
        var current = Math.floor(eased * target);

        counter.textContent = current + suffix;

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          counter.textContent = target + suffix;
        }
      }

      requestAnimationFrame(step);
    });

    countersAnimated = true;
  }

  // Use IntersectionObserver to trigger counter animation
  if (counters.length > 0) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounters();
          counterObserver.disconnect();
        }
      });
    }, { threshold: 0.3 });

    counterObserver.observe(counters[0].closest('section') || counters[0]);
  }


  /* ═══════════════════════════════════════
     CONTACT FORM — Submit handler
     ═══════════════════════════════════════ */
  var contactForm = document.getElementById('contactForm');
  var formSuccess = document.getElementById('formSuccess');

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      // Simulate submission
      var btn = contactForm.querySelector('button[type="submit"]');
      var originalText = btn.innerHTML;
      btn.innerHTML = '<span class="inline-flex items-center gap-2">Sending...</span>';
      btn.disabled = true;

      setTimeout(function () {
        contactForm.style.display = 'none';
        if (formSuccess) {
          formSuccess.classList.remove('hidden');
          // Re-init lucide icons for the success message
          if (window.lucide) lucide.createIcons();
        }
      }, 1500);
    });
  }


  /* ═══════════════════════════════════════
     GSAP — Service cards hover tilt
     ═══════════════════════════════════════ */
  document.querySelectorAll('.service-card').forEach(function (card) {
    var maxTilt = 4;

    card.addEventListener('mousemove', function (e) {
      var rect = card.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width;
      var y = (e.clientY - rect.top) / rect.height;
      var rotateY = (x - 0.5) * maxTilt * 2;
      var rotateX = (0.5 - y) * maxTilt * 2;

      card.style.transform = 'perspective(600px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(-6px)';
    });

    card.addEventListener('mouseleave', function () {
      card.style.transform = '';
    });
  });


  /* ═══════════════════════════════════════
     GSAP — Testimonial cards hover effect
     ═══════════════════════════════════════ */
  document.querySelectorAll('.testimonial-card').forEach(function (card) {
    card.addEventListener('mouseenter', function () {
      if (window.gsap) {
        gsap.to(card, { scale: 1.02, duration: 0.3, ease: 'power2.out' });
      }
    });
    card.addEventListener('mouseleave', function () {
      if (window.gsap) {
        gsap.to(card, { scale: 1, duration: 0.3, ease: 'power2.out' });
      }
    });
  });


  /* ═══════════════════════════════════════
     MAGNETIC EFFECT — CTA buttons
     ═══════════════════════════════════════ */
  document.querySelectorAll('.btn-primary, .btn-white').forEach(function (btn) {
    btn.addEventListener('mousemove', function (e) {
      var rect = btn.getBoundingClientRect();
      var x = e.clientX - rect.left - rect.width / 2;
      var y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = 'translate(' + (x * 0.15) + 'px, ' + (y * 0.15 - 2) + 'px)';
    });

    btn.addEventListener('mouseleave', function () {
      btn.style.transform = '';
    });
  });


  /* ═══════════════════════════════════════
     SCROLL PROGRESS — Top bar (optional)
     ═══════════════════════════════════════ */
  // Creates a thin progress bar at the very top
  var progressBar = document.createElement('div');
  progressBar.style.cssText = 'position:fixed;top:0;left:0;height:2px;background:linear-gradient(90deg,#7c3aed,#a78bfa,#c084fc);z-index:9999;transition:width 0.1s linear;width:0;pointer-events:none;';
  document.body.appendChild(progressBar);

  function updateProgress() {
    var scrollTop = window.scrollY;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = progress + '%';
  }

  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();


  /* ═══════════════════════════════════════
     REFRESH AOS ON WINDOW RESIZE
     ═══════════════════════════════════════ */
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (window.AOS) AOS.refresh();
    }, 250);
  });

})();
