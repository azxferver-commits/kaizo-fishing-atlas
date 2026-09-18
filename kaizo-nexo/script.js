(() => {
  'use strict';

  const canvas = document.getElementById('particleCanvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  const msqStage = document.querySelector('[data-msq-stage]');
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');
  const navLinks = [...document.querySelectorAll('.nav a')];
  const sections = [...document.querySelectorAll('main section[id]')];
  const revealItems = [...document.querySelectorAll('.reveal')];

  let w = 0, h = 0, dpr = 1, raf = null, particles = [];

  const palette = [
    [57,231,255],[71,118,255],[157,92,255],[255,79,216]
  ];

  function resizeCanvas() {
    if (!canvas || !ctx) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr,0,0,dpr,0,0);
    const count = Math.max(34, Math.min(88, Math.floor(w / 20)));
    particles = Array.from({length:count}, () => ({
      x:Math.random()*w, y:Math.random()*h,
      r:Math.random()*1.35+.35,
      vx:(Math.random()-.5)*.12, vy:-Math.random()*.14-.02,
      a:Math.random()*.5+.12, phase:Math.random()*Math.PI*2,
      c:palette[Math.floor(Math.random()*palette.length)]
    }));
  }

  function drawParticles() {
    if (!ctx) return;
    ctx.clearRect(0,0,w,h);
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy; p.phase += .012;
      if (p.y < -8) { p.y = h + 8; p.x = Math.random()*w; }
      if (p.x < -8) p.x = w + 8;
      if (p.x > w + 8) p.x = -8;
      const alpha = p.a * (.72 + Math.sin(p.phase)*.28);
      const [r,g,b] = p.c;
      ctx.beginPath();
      ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
      ctx.shadowColor = `rgba(${r},${g},${b},${alpha})`;
      ctx.shadowBlur = 8;
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    raf = requestAnimationFrame(drawParticles);
  }

  function setupReveal() {
    if (!('IntersectionObserver' in window)) {
      revealItems.forEach(el => el.classList.add('visible'));
      return;
    }
    revealItems.forEach((el,i) => {
      el.classList.add('pending');
      el.style.transitionDelay = `${Math.min(i%5,4)*55}ms`;
    });
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.remove('pending');
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      });
    }, {threshold:.08, rootMargin:'0px 0px -20px 0px'});
    revealItems.forEach(el => observer.observe(el));
  }

  function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const id = a.getAttribute('href');
        if (!id || id === '#') return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({behavior:'smooth',block:'start'});
        nav?.classList.remove('open');
        menuToggle?.setAttribute('aria-expanded','false');
      });
    });
  }

  function setupMenu() {
    if (!menuToggle || !nav) return;
    menuToggle.addEventListener('click', () => {
      const open = !nav.classList.contains('open');
      nav.classList.toggle('open', open);
      menuToggle.setAttribute('aria-expanded', String(open));
    });
  }

  function setupMsqMotion() {
    if (!msqStage || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    msqStage.addEventListener('pointermove', e => {
      if (window.innerWidth < 900) return;
      const r = msqStage.getBoundingClientRect();
      const x = (e.clientX-r.left)/r.width-.5;
      const y = (e.clientY-r.top)/r.height-.5;
      msqStage.style.transform = `translateY(-5px) rotateX(${y*-3}deg) rotateY(${x*4}deg) scale(1.012)`;
    });
    msqStage.addEventListener('pointerleave', () => {
      msqStage.style.transform = '';
    });
  }

  function setupCardTilt() {
    document.querySelectorAll('.social-card').forEach(card => {
      card.addEventListener('pointermove', e => {
        if (window.innerWidth < 900) return;
        const r = card.getBoundingClientRect();
        const x = (e.clientX-r.left)/r.width-.5;
        const y = (e.clientY-r.top)/r.height-.5;
        card.style.transform = `translateY(-7px) perspective(700px) rotateX(${y*-2.5}deg) rotateY(${x*3}deg)`;
      });
      card.addEventListener('pointerleave', () => card.style.transform='');
    });
  }

  function updateActiveNav() {
    const threshold = window.innerHeight*.34;
    let current = 'inicio';
    sections.forEach(section => {
      if (section.getBoundingClientRect().top <= threshold) current = section.id;
    });
    navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === '#'+current));
  }

  window.addEventListener('resize', resizeCanvas, {passive:true});
  window.addEventListener('scroll', updateActiveNav, {passive:true});

  if (canvas && ctx) {
    resizeCanvas();
    drawParticles();
  }
  setupReveal();
  setupSmoothScroll();
  setupMenu();
  setupMsqMotion();
  setupCardTilt();
  updateActiveNav();

  window.addEventListener('beforeunload', () => { if (raf) cancelAnimationFrame(raf); });
})();