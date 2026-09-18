(() => {
  'use strict';

  const canvas = document.getElementById('particleCanvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  const portalStage = document.querySelector('[data-portal-stage]');
  const menuToggle = document.querySelector('.menu-toggle');
  const mainNav = document.querySelector('.main-nav');
  const navLinks = [...document.querySelectorAll('.main-nav a')];
  const sections = [...document.querySelectorAll('main section[id]')];
  const revealItems = document.querySelectorAll('.reveal');

  let width = 0;
  let height = 0;
  let dpr = 1;
  let particles = [];
  let rafId = null;

  const palette = [
    [57, 231, 255],
    [71, 118, 255],
    [157, 92, 255],
    [255, 79, 216]
  ];

  function resizeCanvas() {
    if (!canvas || !ctx) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    createParticles();
  }

  function createParticles() {
    if (!canvas || !ctx) return;
    const count = Math.max(38, Math.min(95, Math.floor(width / 18)));
    particles = Array.from({ length: count }, () => {
      const color = palette[Math.floor(Math.random() * palette.length)];
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.4 + 0.35,
        vx: (Math.random() - 0.5) * 0.12,
        vy: Math.random() * -0.16 - 0.025,
        alpha: Math.random() * 0.5 + 0.12,
        pulse: Math.random() * Math.PI * 2,
        color
      };
    });
  }

  function drawParticles() {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.pulse += 0.012;

      if (p.y < -8) {
        p.y = height + 8;
        p.x = Math.random() * width;
      }
      if (p.x < -8) p.x = width + 8;
      if (p.x > width + 8) p.x = -8;

      const alpha = p.alpha * (0.72 + Math.sin(p.pulse) * 0.28);
      const [r, g, b] = p.color;

      ctx.beginPath();
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
      ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${alpha})`;
      ctx.shadowBlur = 8;
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.shadowBlur = 0;
    rafId = requestAnimationFrame(drawParticles);
  }

  function setupReveal() {
    if (!('IntersectionObserver' in window)) {
      revealItems.forEach(el => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.remove('reveal-pending');
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -20px 0px' }
    );

    revealItems.forEach((el, index) => {
      el.classList.add('reveal-pending');
      el.style.transitionDelay = `${Math.min(index % 5, 4) * 55}ms`;
      observer.observe(el);
    });
  }

  function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', event => {
        const targetId = anchor.getAttribute('href');
        if (!targetId || targetId === '#') return;

        const target = document.querySelector(targetId);
        if (!target) return;

        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });

        if (mainNav && mainNav.classList.contains('is-open')) {
          mainNav.classList.remove('is-open');
          if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  function setupMenu() {
    if (!menuToggle || !mainNav) return;
    menuToggle.addEventListener('click', () => {
      const nextState = !mainNav.classList.contains('is-open');
      mainNav.classList.toggle('is-open', nextState);
      menuToggle.setAttribute('aria-expanded', String(nextState));
    });
  }

  function setupPortalMotion() {
    if (!portalStage || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    portalStage.addEventListener('pointermove', event => {
      const rect = portalStage.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      portalStage.style.transform = `rotateX(${y * -4}deg) rotateY(${x * 4}deg) scale(1.018)`;
    });

    portalStage.addEventListener('pointerleave', () => {
      portalStage.style.transform = '';
    });
  }

  function updateActiveNav() {
    const offset = window.innerHeight * 0.34;
    let current = 'inicio';

    for (const section of sections) {
      const rect = section.getBoundingClientRect();
      if (rect.top <= offset) current = section.id;
    }

    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
  }

  function setupCardTilt() {
    const cards = document.querySelectorAll('.premium-card, .social-card');

    cards.forEach(card => {
      card.addEventListener('pointermove', event => {
        if (window.innerWidth < 900) return;
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `translateY(-7px) perspective(700px) rotateX(${y * -2.8}deg) rotateY(${x * 3.5}deg)`;
      });

      card.addEventListener('pointerleave', () => {
        card.style.transform = '';
      });
    });
  }

  function handleScroll() {
    updateActiveNav();
  }

  window.addEventListener('resize', resizeCanvas, { passive: true });
  window.addEventListener('scroll', handleScroll, { passive: true });

  if (canvas && ctx) {
    resizeCanvas();
    drawParticles();
  }
  setupReveal();
  setupSmoothScroll();
  setupMenu();
  setupPortalMotion();
  setupCardTilt();
  updateActiveNav();

  window.addEventListener('beforeunload', () => {
    if (rafId) cancelAnimationFrame(rafId);
  });
})();