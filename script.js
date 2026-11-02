/* ==========================================================================
   FoodBridge Kerala — Master JavaScript
   Features:
   - Subtle Custom Cursor with Lerp and Context Sensitivity
   - Restrained Magnetic Buttons (Zero Jitter, Smooth Release)
   - Viewport Reveal Animations (IntersectionObserver)
   - Smooth Animated Number Counters (Cubic Ease-Out)
   - Live Count & Need Feed Interactivity
   - Modal Dialog Management
   - Full Donation Submission Flow & Toast Notifications
   ========================================================================== */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

  /* ------------------------------------------------------------------------
     1. Custom Cursor (Desktop Only)
     ------------------------------------------------------------------------ */
  (function initCustomCursor() {
    const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    if (isTouch) return;

    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    if (!dot || !ring) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let isMoving = false;

    // Follow mouse coordinates
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = mouseX + 'px';
      dot.style.top = mouseY + 'px';
      if (!isMoving) {
        dot.style.opacity = '1';
        ring.style.opacity = '1';
        isMoving = true;
      }
    });

    // Smooth lerp outer ring
    function render() {
      const ease = 0.14;
      ringX += (mouseX - ringX) * ease;
      ringY += (mouseY - ringY) * ease;
      ring.style.left = ringX + 'px';
      ring.style.top = ringY + 'px';
      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);

    // Interactive element hovers
    const interactiveTags = 'a, button, input, select, textarea, .need-card, .review-card, .district-pill, .collage-main';
    document.addEventListener('mouseover', (e) => {
      const target = e.target.closest(interactiveTags);
      if (!target) return;

      if (target.matches('input, textarea')) {
        document.body.classList.add('cursor-text');
        document.body.classList.remove('cursor-hover');
      } else {
        document.body.classList.add('cursor-hover');
        document.body.classList.remove('cursor-text');
      }
    });

    document.addEventListener('mouseout', (e) => {
      const related = e.relatedTarget;
      if (!related || !related.closest(interactiveTags)) {
        document.body.classList.remove('cursor-hover', 'cursor-text');
      }
    });

    // Hide on window blur/leave
    document.addEventListener('mouseleave', () => {
      dot.style.opacity = '0';
      ring.style.opacity = '0';
      isMoving = false;
    });

    document.addEventListener('mouseenter', () => {
      dot.style.opacity = '1';
      ring.style.opacity = '1';
      isMoving = true;
    });
  })();

  /* ------------------------------------------------------------------------
     2. Gentle Magnetic Effect (Subtle & Restrained)
     ------------------------------------------------------------------------ */
  (function initMagnetic() {
    const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    if (isTouch) return;

    const magnetics = document.querySelectorAll('.magnetic');
    const STRENGTH = 0.22; // Very restrained
    const MAX_DIST = 14;   // Max pixel displacement

    magnetics.forEach((btn) => {
      let isHover = false;
      let currX = 0;
      let currY = 0;
      let targetX = 0;
      let targetY = 0;
      let rafId;

      function update() {
        currX += (targetX - currX) * 0.2;
        currY += (targetY - currY) * 0.2;
        btn.style.transform = `translate(${currX}px, ${currY}px)`;

        if (isHover || Math.abs(currX) > 0.1 || Math.abs(currY) > 0.1) {
          rafId = requestAnimationFrame(update);
        } else {
          btn.style.transform = '';
        }
      }

      btn.addEventListener('mouseenter', () => {
        isHover = true;
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(update);
      });

      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dx = (e.clientX - centerX) * STRENGTH;
        const dy = (e.clientY - centerY) * STRENGTH;

        targetX = Math.max(-MAX_DIST, Math.min(MAX_DIST, dx));
        targetY = Math.max(-MAX_DIST, Math.min(MAX_DIST, dy));
      });

      btn.addEventListener('mouseleave', () => {
        isHover = false;
        targetX = 0;
        targetY = 0;
      });
    });
  })();

  /* ------------------------------------------------------------------------
     3. Sticky Navigation & Mobile Menu
     ------------------------------------------------------------------------ */
  (function initNav() {
    const nav = document.getElementById('nav');
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');

    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    }, { passive: true });

    if (toggle && links) {
      toggle.addEventListener('click', () => {
        links.classList.toggle('open');
      });

      links.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
          links.classList.remove('open');
        });
      });
    }
  })();

  /* ------------------------------------------------------------------------
     4. Scroll Reveal Animations (IntersectionObserver)
     ------------------------------------------------------------------------ */
  (function initReveals() {
    const targets = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    targets.forEach((el) => observer.observe(el));
  })();

  /* ------------------------------------------------------------------------
     5. Animated Number Counters
     ------------------------------------------------------------------------ */
  (function initCounters() {
    const counters = document.querySelectorAll('.counter');
    if (!counters.length) return;

    function countUp(el) {
      const target = parseInt(el.getAttribute('data-target'), 10);
      const duration = 1600;
      const start = performance.now();

      function step(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Cubic ease out
        const ease = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(ease * target);

        el.textContent = current >= 1000
          ? current.toLocaleString('en-IN')
          : current.toString();

        if (progress < 1) {
          requestAnimationFrame(step);
        }
      }
      requestAnimationFrame(step);
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          countUp(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    counters.forEach((c) => observer.observe(c));
  })();

  /* ------------------------------------------------------------------------
     6. Progress Bar Fill on Scroll
     ------------------------------------------------------------------------ */
  (function initProgressBars() {
    const bars = document.querySelectorAll('.impact-bar-fill');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const fill = entry.target.style.getPropertyValue('--fill') || '75%';
          entry.target.style.width = fill;
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.25 });

    bars.forEach((b) => {
      b.style.width = '0';
      b.style.transition = 'width 1.2s cubic-bezier(0.2, 0.8, 0.2, 1)';
      observer.observe(b);
    });
  })();

  /* ------------------------------------------------------------------------
     7. Dynamic Live Counter Pulse (Simulates Active Rescues)
     ------------------------------------------------------------------------ */
  (function initLivePulse() {
    const liveEl = document.getElementById('liveCount');
    if (!liveEl) return;

    let count = 12;
    setInterval(() => {
      // Occasionally fluctuate between 11 and 15
      const change = Math.random() > 0.5 ? 1 : -1;
      count = Math.max(9, Math.min(18, count + change));
      liveEl.textContent = count;
    }, 7000);
  })();

  /* ------------------------------------------------------------------------
     8. "Tonight's Need" Button Interactivity
     ------------------------------------------------------------------------ */
  (function initNeedActions() {
    const buttons = document.querySelectorAll('.need-btn');
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const card = btn.closest('.need-card');
        const orgName = card ? card.querySelector('.need-org')?.textContent : 'Shelter';
        
        // Scroll directly to donate form and focus
        const donateSection = document.getElementById('donate');
        if (donateSection) {
          donateSection.scrollIntoView({ behavior: 'smooth' });
          const notes = document.getElementById('notes');
          if (notes) {
            notes.value = `Intended for: ${orgName}`;
          }
          showToast(`Directing your surplus to ${orgName}`);
        }
      });
    });
  })();

  /* ------------------------------------------------------------------------
     9. Donate Form Submission Flow
     ------------------------------------------------------------------------ */
  (function initDonateForm() {
    const form = document.getElementById('donateForm');
    const success = document.getElementById('formSuccess');
    const newBtn = document.getElementById('newDonation');

    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('donorName').value.trim();
      const phone = document.getElementById('donorPhone').value.trim();
      const foodType = document.getElementById('foodType').value;
      const quantity = document.getElementById('quantity').value.trim();
      const address = document.getElementById('pickupAddress').value.trim();
      const time = document.getElementById('pickupTime').value;

      if (!name || !phone || !foodType || !quantity || !address || !time) {
        showToast('Please fill in all required fields.');
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Posting to Network…';
      submitBtn.disabled = true;

      setTimeout(() => {
        form.hidden = true;
        success.hidden = false;
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
        showToast('✓ Food surplus posted! Nearest NGOs alerted.');
      }, 900);
    });

    if (newBtn) {
      newBtn.addEventListener('click', () => {
        form.reset();
        form.hidden = false;
        success.hidden = true;
        form.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }
  })();

  /* ------------------------------------------------------------------------
     10. Authentication Modal
     ------------------------------------------------------------------------ */
  (function initAuthModal() {
    const overlay = document.getElementById('authOverlay');
    const loginBtn = document.getElementById('loginBtn');
    const closeBtn = document.getElementById('modalClose');
    const tabs = document.querySelectorAll('.modal-tab');
    const loginTab = document.getElementById('loginTab');
    const regTab = document.getElementById('registerTab');

    if (!overlay) return;

    function openModal() {
      overlay.removeAttribute('hidden');
      requestAnimationFrame(() => overlay.classList.add('visible'));
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      overlay.classList.remove('visible');
      setTimeout(() => {
        overlay.setAttribute('hidden', '');
        document.body.style.overflow = '';
      }, 300);
    }

    if (loginBtn) {
      loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
      });
    }

    document.querySelectorAll('a[href="#auth"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('visible')) {
        closeModal();
      }
    });

    // Tab switching
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        const which = tab.getAttribute('data-tab');
        if (loginTab) loginTab.hidden = (which !== 'login');
        if (regTab) regTab.hidden = (which !== 'register');
      });
    });

    // Dummy sign-in handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        closeModal();
        showToast('Welcome back to FoodBridge Kerala!');
      });
    }

    // Dummy registration handler
    const regForm = document.getElementById('registerForm');
    if (regForm) {
      regForm.addEventListener('submit', (e) => {
        e.preventDefault();
        closeModal();
        showToast('Welcome aboard! Account successfully created.');
      });
    }
  })();

  /* ------------------------------------------------------------------------
     11. Elegant Toast Feedback
     ------------------------------------------------------------------------ */
  function showToast(msg) {
    const old = document.querySelector('.fb-toast-msg');
    if (old) old.remove();

    const toast = document.createElement('div');
    toast.className = 'fb-toast-msg';
    toast.textContent = msg;
    toast.style.cssText = `
      position: fixed;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%) translateY(20px);
      background: #132a1e;
      color: #f9f6f0;
      padding: 0.9rem 1.6rem;
      border-radius: 999px;
      font-size: 0.9rem;
      font-weight: 500;
      box-shadow: 0 10px 30px rgba(19, 42, 30, 0.25);
      z-index: 999999;
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
      pointer-events: none;
      white-space: nowrap;
      border: 1px solid rgba(249, 246, 240, 0.15);
    `;

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(20px)';
      setTimeout(() => toast.remove(), 300);
    }, 3800);
  }

});
