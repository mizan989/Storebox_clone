// ============================================================
// Storebox Global Core — Lenis Smooth Scrolling & Animate UI
// ============================================================

(function () {
  const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Initialize Lenis Smooth Scrolling (if loaded and not reduced-motion)
  function initLenis() {
    if (RM || !window.Lenis || window.__lenis) return;
    
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.2,
      infinite: false
    });

    window.lenis = lenis;
    window.__lenis = lenis;

    // Connect with GSAP ScrollTrigger if present
    if (window.gsap && window.ScrollTrigger) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    } else {
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }
  }

  // Try immediate init or wait for scripts
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLenis);
  } else {
    initLenis();
  }

  document.addEventListener('DOMContentLoaded', () => {
    // 2. Mobile Drawer Menu Setup & Toggle (with animated hamburger-to-cross)
    const menuBtn = document.querySelector('button[aria-label="Open menu"]') || document.querySelector('.css-1f5scab');
    let drawer = document.getElementById('mobileDrawer') || document.querySelector('.sn-mobile-drawer');

    // If drawer does not exist in DOM, create and inject it automatically
    if (!drawer) {
      drawer = document.createElement('div');
      drawer.id = 'mobileDrawer';
      drawer.className = 'sn-mobile-drawer';
      drawer.setAttribute('aria-hidden', 'true');
      drawer.innerHTML = `
        <div class="sn-mobile-drawer-content">
          <nav class="sn-mobile-nav">
            <a href="/" class="sn-mobile-link"><span>Home</span><span class="sn-arrow">→</span></a>
            <a href="/pricing.html" class="sn-mobile-link"><span>Pricing</span><span class="sn-arrow">→</span></a>
            <a href="/ecommerce.html" class="sn-mobile-link"><span>E-commerce</span><span class="sn-arrow">→</span></a>
            <a href="/aeo-geo-seo.html" class="sn-mobile-link"><span>SEO &amp; AEO</span><span class="sn-arrow">→</span></a>
            <a href="/#free-draft" class="sn-mobile-link"><span>Contact</span><span class="sn-arrow">→</span></a>
          </nav>
          <div class="sn-mobile-drawer-cta">
            <a href="/#free-draft" class="sn-mobile-cta-btn">
              <span>Get My Free Draft</span>
              <span style="font-size: 16px;">→</span>
            </a>
            <div class="sn-mobile-socials">
              <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" class="sn-social-pill" aria-label="WhatsApp">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                <span>WhatsApp</span>
              </a>
              <a href="https://instagram.com/storebox" target="_blank" rel="noopener noreferrer" class="sn-social-pill" aria-label="Instagram">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                <span>Instagram</span>
              </a>
              <a href="https://linkedin.com/company/storebox" target="_blank" rel="noopener noreferrer" class="sn-social-pill" aria-label="LinkedIn">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                <span>LinkedIn</span>
              </a>
            </div>
          </div>
        </div>
      `;
      const navContainer = document.querySelector('.css-p2lvsv') || document.querySelector('header.MuiAppBar-root')?.parentNode || document.body;
      navContainer.appendChild(drawer);
    }

    if (menuBtn && drawer) {
      function toggleMenu(forceClose = false) {
        const isCurrentlyOpen = menuBtn.getAttribute('aria-expanded') === 'true' || menuBtn.classList.contains('is-open');
        const shouldOpen = forceClose ? false : !isCurrentlyOpen;
        
        menuBtn.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
        menuBtn.classList.toggle('is-open', shouldOpen);
        drawer.classList.toggle('is-open', shouldOpen);
        drawer.setAttribute('aria-hidden', shouldOpen ? 'false' : 'true');

        // Prevent body background scroll while mobile menu is open
        if (shouldOpen) {
          document.body.style.overflow = 'hidden';
          if (window.__lenis) window.__lenis.stop();
        } else {
          document.body.style.overflow = '';
          if (window.__lenis) window.__lenis.start();
        }
      }

      menuBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleMenu();
      });

      // Close when clicking any nav link in the drawer
      drawer.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          toggleMenu(true);
        });
      });

      // Close when clicking outside drawer
      document.addEventListener('click', (e) => {
        if ((menuBtn.getAttribute('aria-expanded') === 'true' || menuBtn.classList.contains('is-open')) &&
            !drawer.contains(e.target) && !menuBtn.contains(e.target)) {
          toggleMenu(true);
        }
      });

      // Close on Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && (menuBtn.getAttribute('aria-expanded') === 'true' || menuBtn.classList.contains('is-open'))) {
          toggleMenu(true);
        }
      });
    }

    // 3. Dynamic Navbar Scroll State
    const navWrapper = document.querySelector('.css-p2lvsv');
    const navHeader = document.querySelector('header.MuiAppBar-root');
    
    function updateNavbar() {
      const scrolled = window.scrollY > 20;
      if (navWrapper) navWrapper.classList.toggle('is-scrolled', scrolled);
      if (navHeader) navHeader.classList.toggle('is-scrolled', scrolled);
    }
    window.addEventListener('scroll', updateNavbar, { passive: true });
    updateNavbar();

    // 4. Global Top Reading Progress Bar
    let progressBar = document.querySelector('.sn-scroll-progress-bar');
    if (!progressBar) {
      const progressContainer = document.createElement('div');
      progressContainer.className = 'sn-scroll-progress';
      progressBar = document.createElement('div');
      progressBar.className = 'sn-scroll-progress-bar';
      progressContainer.appendChild(progressBar);
      document.body.appendChild(progressContainer);
    }

    function updateProgress() {
      const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollTotal > 0 ? window.scrollY / scrollTotal : 0;
      if (progressBar) {
        progressBar.style.transform = `scaleX(${Math.min(Math.max(progress, 0), 1)})`;
      }
    }
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();

    // 5. Helper for smooth scrolling taking Lenis into account
    function scrollToTarget(target) {
      if (!target) return;
      const headerH = 74;
      if (window.__lenis && typeof window.__lenis.scrollTo === 'function') {
        window.__lenis.scrollTo(target, { offset: -headerH, duration: 1.2 });
      } else if (window.lenis && typeof window.lenis.scrollTo === 'function') {
        window.lenis.scrollTo(target, { offset: -headerH, duration: 1.2 });
      } else {
        const rect = target.getBoundingClientRect();
        const absoluteTop = window.pageYOffset + rect.top - headerH;
        window.scrollTo({ top: absoluteTop, behavior: 'smooth' });
      }
    }

    // 6. Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#' || !targetId) return;
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          scrollToTarget(target);
        }
      });
    });

    // 7. Handle URL hash on page load if present
    if (window.location.hash) {
      setTimeout(() => {
        const target = document.querySelector(window.location.hash);
        if (target) scrollToTarget(target);
      }, 450);
    }

    // 8. Staggered Entrance Reveal Fallback (.rv)
    const reveals = document.querySelectorAll('.rv:not(.is-revealed)');
    if (reveals.length > 0 && (!window.gsap || RM)) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });
      reveals.forEach(el => observer.observe(el));
    }

    // 9. Formspree AJAX Form Handling
    const formspreeForms = document.querySelectorAll('form[action*="formspree.io"]');
    formspreeForms.forEach(form => {
      form.addEventListener('submit', async function (e) {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        const origText = submitBtn ? submitBtn.innerHTML : 'Submit';
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<span>Submitting details...</span>';
        }

        const formData = new FormData(form);
        try {
          const response = await fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: { 'Accept': 'application/json' }
          });

          if (response.ok) {
            form.innerHTML = `
              <div style="background: rgba(15, 168, 143, 0.08); border: 1.5px solid #0FA88F; border-radius: 18px; padding: 36px 24px; text-align: center; color: #221D15; animation: fadeIn .4s ease;">
                <div style="width: 56px; height: 56px; border-radius: 50%; background: #0FA88F; color: #fff; display: inline-flex; align-items: center; justify-content: center; font-size: 28px; font-weight: bold; margin-bottom: 16px; box-shadow: 0 6px 18px rgba(15,168,143,0.3);">✓</div>
                <h3 style="font-family: 'Fraunces', Georgia, serif; font-size: 24px; font-weight: 700; color: #221D15; margin: 0 0 10px;">Free Draft Request Received!</h3>
                <p style="font-family: 'Bricolage Grotesque', system-ui, sans-serif; font-size: 15px; color: #6E6557; margin: 0 0 24px; line-height: 1.6;">
                  Thank you! Alex Morgan and our engineering team will build your custom draft site and send your live preview within 24 hours.
                </p>
                <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 8px; background: #0FA88F; color: #ffffff; padding: 13px 26px; border-radius: 9999px; text-decoration: none; font-weight: 600; font-size: 14.5px; transition: transform .2s ease; box-shadow: 0 4px 14px rgba(15,168,143,0.35);">
                  <span>Chat with Alex on WhatsApp</span>
                  <span style="font-size: 16px;">→</span>
                </a>
              </div>
            `;
          } else {
            const data = await response.json();
            alert(data.errors ? data.errors.map(err => err.message).join(", ") : 'Submission failed. Please try again or WhatsApp us directly.');
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.innerHTML = origText;
            }
          }
        } catch (err) {
          alert('There was a problem submitting your form. Please WhatsApp us directly at +91 98765 43210.');
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = origText;
          }
        }
      });
    });
  });
})();
