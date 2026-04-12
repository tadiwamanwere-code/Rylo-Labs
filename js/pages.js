/* RYLO LABS — Inner Page Interactions & Animations */
(function () {
  'use strict';


  /* ═══════════════════════════════════════
     UTILITIES
     ═══════════════════════════════════════ */

  /**
   * Format a number with comma separators (e.g. 12500 → "12,500").
   */
  function formatNumber(n) {
    var parts = String(Math.floor(n)).split('');
    var result = '';
    for (var i = 0; i < parts.length; i++) {
      if (i > 0 && (parts.length - i) % 3 === 0) {
        result += ',';
      }
      result += parts[i];
    }
    return result;
  }

  /**
   * easeOutQuart easing — fast start, gentle finish.
   */
  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }


  /* ═══════════════════════════════════════
     1. STAGGERED REVEAL SYSTEM
     Elements with [data-stagger] reveal
     their .stagger-child children one by
     one when scrolled into view.
     ═══════════════════════════════════════ */
  var staggerTargets = document.querySelectorAll('[data-stagger]');

  if (staggerTargets.length) {
    var staggerObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        staggerObserver.unobserve(entry.target);

        var delay = parseInt(entry.target.getAttribute('data-stagger'), 10) || 100;
        var children = entry.target.querySelectorAll('.stagger-child');

        children.forEach(function (child, i) {
          setTimeout(function () {
            child.classList.add('visible');
          }, i * delay);
        });
      });
    }, { threshold: 0.15 });

    staggerTargets.forEach(function (el) {
      staggerObserver.observe(el);
    });
  }


  /* ═══════════════════════════════════════
     2. COUNTER ANIMATION
     .stat-counter elements animate from
     0 → data-target over 2 s on scroll.
     ═══════════════════════════════════════ */
  var COUNTER_DURATION = 2000; // ms

  var counters = document.querySelectorAll('.stat-counter[data-target]');

  if (counters.length) {
    var counterObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        counterObserver.unobserve(entry.target);

        var target = parseFloat(entry.target.getAttribute('data-target')) || 0;
        var suffix = entry.target.getAttribute('data-suffix') === '+' ? '+' : '';
        var startTime = null;

        function tick(timestamp) {
          if (!startTime) startTime = timestamp;
          var elapsed = timestamp - startTime;
          var progress = Math.min(elapsed / COUNTER_DURATION, 1);
          var value = easeOutQuart(progress) * target;

          entry.target.textContent = formatNumber(value) + suffix;

          if (progress < 1) {
            requestAnimationFrame(tick);
          } else {
            // Ensure we land exactly on the target
            entry.target.textContent = formatNumber(target) + suffix;
          }
        }

        requestAnimationFrame(tick);
      });
    }, { threshold: 0.2 });

    counters.forEach(function (el) {
      counterObserver.observe(el);
    });
  }


  /* ═══════════════════════════════════════
     3. FAQ ACCORDION
     Only one item open at a time.
     Clicking a question toggles its answer
     and closes any other open item.
     ═══════════════════════════════════════ */
  var faqQuestions = document.querySelectorAll('.faq-question');

  faqQuestions.forEach(function (question) {
    question.addEventListener('click', function () {
      var parentItem = this.closest('.faq-item');
      if (!parentItem) return;

      var answer = parentItem.querySelector('.faq-answer');
      var isOpen = parentItem.classList.contains('faq-item--active');

      // Close every other open item first
      document.querySelectorAll('.faq-item--active').forEach(function (openItem) {
        if (openItem === parentItem) return;
        openItem.classList.remove('faq-item--active');
        var openAnswer = openItem.querySelector('.faq-answer');
        if (openAnswer) openAnswer.style.maxHeight = '0';
      });

      // Toggle the clicked item
      if (isOpen) {
        parentItem.classList.remove('faq-item--active');
        if (answer) answer.style.maxHeight = '0';
      } else {
        parentItem.classList.add('faq-item--active');
        if (answer) answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });


  /* ═══════════════════════════════════════
     4. CONTACT FORM HANDLING
     Validates required fields, shows inline
     errors, and reveals a success message.
     ═══════════════════════════════════════ */
  var contactForm = document.querySelector('.contact-form');

  if (contactForm) {
    // Clear field errors on input
    contactForm.addEventListener('input', function (e) {
      var field = e.target;
      if (field.classList.contains('form-error')) {
        field.classList.remove('form-error');
        var msg = field.parentElement
          ? field.parentElement.querySelector('.form-error-msg')
          : null;
        if (msg) msg.textContent = '';
      }
    });

    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var requiredFields = contactForm.querySelectorAll('[required]');
      var valid = true;

      // Reset previous errors
      contactForm.querySelectorAll('.form-error').forEach(function (el) {
        el.classList.remove('form-error');
      });
      contactForm.querySelectorAll('.form-error-msg').forEach(function (el) {
        el.textContent = '';
      });

      // Validate each required field
      requiredFields.forEach(function (field) {
        var value = (field.value || '').trim();
        var errorMsg = '';

        if (!value) {
          errorMsg = 'This field is required.';
        } else if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errorMsg = 'Please enter a valid email address.';
        }

        if (errorMsg) {
          valid = false;
          field.classList.add('form-error');
          var msgEl = field.parentElement
            ? field.parentElement.querySelector('.form-error-msg')
            : null;
          if (msgEl) msgEl.textContent = errorMsg;
        }
      });

      if (!valid) return;

      // Success — hide form and show confirmation
      contactForm.style.display = 'none';

      var successEl = document.querySelector('.form-success');
      if (successEl) {
        successEl.style.opacity = '0';
        successEl.style.display = 'block';
        // Force reflow so the transition fires
        void successEl.offsetWidth;
        successEl.style.transition = 'opacity 0.6s ease';
        successEl.style.opacity = '1';
      }
    });
  }


  /* ═══════════════════════════════════════
     5. INNER PAGE HERO ENTRANCE
     Word-by-word reveal for .page-word
     elements, plus eyebrow and subtitle.
     ═══════════════════════════════════════ */
  function runPageHeroEntrance() {
    var pageHero = document.querySelector('.page-hero');
    if (!pageHero) return;

    var eyebrow  = pageHero.querySelector('.eyebrow');
    var subtitle = pageHero.querySelector('.page-hero__subtitle, .subtitle');
    var words    = pageHero.querySelectorAll('.page-word');

    // Eyebrow appears first
    if (eyebrow) {
      setTimeout(function () {
        eyebrow.classList.add('visible');
      }, 200);
    }

    // Words stagger in after eyebrow
    words.forEach(function (word, i) {
      setTimeout(function () {
        word.classList.add('visible');
      }, 400 + i * 100);
    });

    // Subtitle appears after all words
    if (subtitle) {
      var subtitleDelay = 400 + words.length * 100 + 200;
      setTimeout(function () {
        subtitle.classList.add('visible');
      }, subtitleDelay);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runPageHeroEntrance);
  } else {
    runPageHeroEntrance();
  }


  /* ═══════════════════════════════════════
     6. MOBILE MENU TOGGLE
     Burger button opens/closes the nav.
     Links and outside clicks close it.
     ═══════════════════════════════════════ */
  var burger = document.querySelector('.topnav__burger');
  var topnav = document.querySelector('.topnav, #navbar');

  if (burger && topnav) {
    burger.addEventListener('click', function (e) {
      e.stopPropagation();
      topnav.classList.toggle('topnav--mobile-open');
    });

    // Close when a nav link is clicked
    topnav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        topnav.classList.remove('topnav--mobile-open');
      });
    });

    // Close when clicking outside the nav
    document.addEventListener('click', function (e) {
      if (!topnav.contains(e.target)) {
        topnav.classList.remove('topnav--mobile-open');
      }
    });
  }


  /* ═══════════════════════════════════════
     7. DIRECTIONAL SCROLL REVEALS
     .reveal-left  → slides in from left
     .reveal-right → slides in from right
     Uses the same observe-once pattern as
     .scroll-reveal in main.js.
     ═══════════════════════════════════════ */
  var directionalEls = document.querySelectorAll('.reveal-left, .reveal-right');

  if (directionalEls.length) {
    var directionalObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        directionalObserver.unobserve(entry.target);
      });
    }, { threshold: 0.15 });

    directionalEls.forEach(function (el) {
      directionalObserver.observe(el);
    });
  }

})();
