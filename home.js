(function () {
  'use strict';

  // ------------------------------------------------------------------
  // 0. Tiny helpers
  // ------------------------------------------------------------------
  const $ = (id) => document.getElementById(id);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ------------------------------------------------------------------
  // 1. STARFIELD
  // ------------------------------------------------------------------
  function initStarfield() {
    const canvas = $('starfield');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let animationId = null;
    let resizeTimer = null;
    const stars = [];
    const STAR_COUNT = 300;

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    function createStars() {
      stars.length = 0;
      for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 1.5 + 0.5,
          speed: Math.random() * 0.02 + 0.005,
          brightness: Math.random() * 0.7 + 0.3,
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      const now = Date.now();
      for (const star of stars) {
        const twinkle = reduceMotion ? 1 : 0.7 + 0.3 * Math.sin(now * star.speed * 2);
        const alpha = star.brightness * twinkle;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();
      }
      if (!reduceMotion) animationId = requestAnimationFrame(draw);
    }

    function start() {
      resize();
      createStars();
      if (animationId) cancelAnimationFrame(animationId);
      draw();
    }

    window.addEventListener(
      'resize',
      () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          resize();
          createStars();
        }, 120);
      },
      { passive: true }
    );

    start();

    window.addEventListener('beforeunload', () => {
      if (animationId) cancelAnimationFrame(animationId);
    });
  }

  // ------------------------------------------------------------------
  // 2. TOAST (auto-creates the element if missing → bulletproof)
  // ------------------------------------------------------------------
  let toastEl = $('toast');
  let toastTimeout = null;

  function ensureToastEl() {
    if (toastEl) return toastEl;
    toastEl = document.createElement('div');
    toastEl.id = 'toast';
    toastEl.className = 'toast';
    toastEl.setAttribute('role', 'status');
    toastEl.setAttribute('aria-live', 'polite');
    document.body.appendChild(toastEl);
    return toastEl;
  }

  function showToast(message, type = 'success') {
    const el = ensureToastEl();
    if (toastTimeout) {
      clearTimeout(toastTimeout);
      el.classList.remove('show', 'error');
    }
    void el.offsetWidth; // force reflow so the animation restarts
    el.textContent = message;
    el.className = 'toast' + (type === 'error' ? ' error' : '');
    el.classList.add('show');

    toastTimeout = setTimeout(() => {
      el.classList.remove('show');
      toastTimeout = null;
    }, 3000);
  }

  // ------------------------------------------------------------------
  // 3. MOBILE MENU  (bug #1 fixed — single source of truth)
  // ------------------------------------------------------------------
  const navLinks = $('navLinks');
  const hamburger = $('hamburgerBtn');

  function setMenu(open) {
    if (!navLinks || !hamburger) return;
    navLinks.classList.toggle('open', open);
    hamburger.classList.toggle('active', open);
    hamburger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  }

  function toggleMenu() {
    if (!navLinks) return;
    setMenu(!navLinks.classList.contains('open'));
  }

  function closeMenu() {
    setMenu(false);
  }

  if (hamburger) {
    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMenu();
    });
  }

  if (navLinks) {
    navLinks.querySelectorAll('a:not(#getStartedBtn)').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });
  }

  // ------------------------------------------------------------------
  // 4. MODAL
  // ------------------------------------------------------------------
  const modal = $('signupModal');
  const getStartedBtn = $('getStartedBtn');
  const closeModalBtn = $('closeModalBtn');
  const signupForm = $('signupForm');
  const usernameInput = $('username');
  const emailInput = $('email');
  const passwordInput = $('password');
  const usernameError = $('usernameError');
  const emailError = $('emailError');
  const passwordError = $('passwordError');

  function openModal() {
    if (!modal) return;
    closeMenu();
    if (!modal.open) modal.showModal();
    document.body.style.overflow = 'hidden';
    setTimeout(() => usernameInput && usernameInput.focus(), 50);
  }

  function closeModal() {
    if (!modal) return;
    if (modal.open) modal.close();
    document.body.style.overflow = '';
  }

  if (getStartedBtn) {
    getStartedBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  }

  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
    // Native ESC / dialog close → always release the scroll lock
    modal.addEventListener('close', () => {
      document.body.style.overflow = '';
    });
  }

  // ------------------------------------------------------------------
  // 5. FORM VALIDATION  (bug #2 fixed — toast now exists)
  // ------------------------------------------------------------------
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validateField(input, errorEl, valid, message) {
    if (!input) return true;
    if (!valid) {
      if (errorEl) errorEl.style.display = 'block';
      input.setCustomValidity(message);
      return false;
    }
    if (errorEl) errorEl.style.display = 'none';
    input.setCustomValidity('');
    return true;
  }

  if (usernameInput) {
    usernameInput.addEventListener('input', function () {
      validateField(this, usernameError, this.value.trim().length > 0, 'Username is required');
    });
  }
  if (emailInput) {
    emailInput.addEventListener('input', function () {
      validateField(this, emailError, emailRe.test(this.value.trim()), 'Enter a valid email');
    });
  }
  if (passwordInput) {
    passwordInput.addEventListener('input', function () {
      validateField(this, passwordError, this.value.length >= 8, 'Password must be at least 8 characters');
    });
  }

  if (signupForm) {
    signupForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const okUser = validateField(
        usernameInput,
        usernameError,
        !!(usernameInput && usernameInput.value.trim().length > 0),
        'Username is required'
      );
      const okEmail = validateField(
        emailInput,
        emailError,
        !!(emailInput && emailRe.test(emailInput.value.trim())),
        'Enter a valid email'
      );
      const okPass = validateField(
        passwordInput,
        passwordError,
        !!(passwordInput && passwordInput.value.length >= 8),
        'Password must be at least 8 characters'
      );

      if (!okUser || !okEmail || !okPass) {
        showToast('Please fix the errors above.', 'error');
        return;
      }

      const submitBtn = this.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating...';
      }

      // Simulated API call
      setTimeout(() => {
        showToast(`Welcome, ${usernameInput.value.trim()}! Account created.`, 'success');
        closeModal();
        signupForm.reset();
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Create Account';
        }
        document.querySelectorAll('.error-message').forEach((el) => {
          el.style.display = 'none';
        });
      }, 1500);
    });
  }

  // ------------------------------------------------------------------
  // 6. PRICING TABS  (bug #3 — was missing entirely)
  // ------------------------------------------------------------------
  const pricingTabs = document.querySelectorAll('[data-pricing-tab]');
  const pricingPanels = document.querySelectorAll('.pricing-wrapper');

  pricingTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const id = tab.getAttribute('data-pricing-tab');
      pricingTabs.forEach((t) => {
        const active = t === tab;
        t.classList.toggle('is-active', active);
        t.setAttribute('aria-selected', String(active));
      });
      pricingPanels.forEach((p) => {
        p.classList.toggle('is-active', p.getAttribute('data-tab') === id);
      });
    });
  });

  // ------------------------------------------------------------------
  // 7. BACK-TO-TOP  (bug #3 — was missing entirely)
  // ------------------------------------------------------------------
  const backToTopBtn = $('backToTopBtn');
  if (backToTopBtn) {
    const onScroll = () => {
      backToTopBtn.classList.toggle('show', window.scrollY > 400);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // set correct state on load

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  // ------------------------------------------------------------------
  // 8. GLOBAL KEYBOARD
  // ------------------------------------------------------------------
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks && navLinks.classList.contains('open')) {
      closeMenu();
    }
  });

  // ------------------------------------------------------------------
  // 9. INIT
  // ------------------------------------------------------------------
  // Script is deferred → DOM is already parsed when this runs.
  initStarfield();

  // Public API (handy for debugging in the console)
  window.DataFlow = { openModal, closeModal, showToast, closeMenu, toggleMenu };
})();