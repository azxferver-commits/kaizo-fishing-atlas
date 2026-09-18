(() => {
  "use strict";

  document.body.classList.add("js-ready");

  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav");
  const navLinks = [...document.querySelectorAll(".nav a")];
  const reveals = document.querySelectorAll(".reveal");
  const sections = [...document.querySelectorAll("main section[id]")];
  const stage = document.querySelector("[data-msq-stage]");
  const canvas = document.getElementById("particleCanvas");
  const ctx = canvas && canvas.getContext ? canvas.getContext("2d") : null;

  if (menuButton && nav) {
    menuButton.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(open));
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener("click", event => {
      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      if (nav) nav.classList.remove("open");
      if (menuButton) menuButton.setAttribute("aria-expanded", "false");
    });
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -35px 0px" });

    reveals.forEach((el, i) => {
      el.style.transitionDelay = Math.min(i % 4, 3) * 70 + "ms";
      observer.observe(el);
    });
  } else {
    reveals.forEach(el => el.classList.add("is-visible"));
  }

  function updateNav() {
    const point = window.innerHeight * 0.34;
    let active = "inicio";
    sections.forEach(section => {
      if (section.getBoundingClientRect().top <= point) active = section.id;
    });
    navLinks.forEach(link => link.classList.toggle("active", link.getAttribute("href") === "#" + active));
  }
  window.addEventListener("scroll", updateNav, { passive: true });
  updateNav();

  if (stage && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const frame = stage.querySelector(".hud-frame");
    stage.addEventListener("pointermove", event => {
      const r = stage.getBoundingClientRect();
      const x = (event.clientX - r.left) / r.width - 0.5;
      const y = (event.clientY - r.top) / r.height - 0.5;
      if (frame) frame.style.transform = "rotateX(" + (y * -3.5) + "deg) rotateY(" + (x * 4) + "deg)";
    });
    stage.addEventListener("pointerleave", () => {
      if (frame) frame.style.transform = "";
    });
  }

  if (ctx && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    let w = 0, h = 0, dpr = 1, particles = [];
    const colors = [[57,231,255],[71,118,255],[157,92,255],[255,79,216]];

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr,0,0,dpr,0,0);
      const count = Math.max(35, Math.min(85, Math.floor(w / 20)));
      particles = Array.from({length: count}, () => ({
        x: Math.random()*w, y: Math.random()*h,
        r: Math.random()*1.2+.3,
        vx: (Math.random()-.5)*.1, vy: -Math.random()*.13-.02,
        a: Math.random()*.4+.1,
        c: colors[Math.floor(Math.random()*colors.length)]
      }));
    }

    function draw() {
      ctx.clearRect(0,0,w,h);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.y < -5) { p.y = h + 5; p.x = Math.random()*w; }
        if (p.x < -5) p.x = w + 5;
        if (p.x > w + 5) p.x = -5;
        const c = p.c;
        ctx.beginPath();
        ctx.fillStyle = "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + p.a + ")";
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 8;
        ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fill();
      });
      ctx.shadowBlur = 0;
      requestAnimationFrame(draw);
    }

    window.addEventListener("resize", resize, { passive: true });
    resize();
    draw();
  } else if (canvas) {
    canvas.style.display = "none";
  }
})();