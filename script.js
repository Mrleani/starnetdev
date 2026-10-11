"use strict";

/* ---------- Settings: edit these values ---------- */
const CONTACT_EMAIL = "starnetdev20@gmail.com";        // where contact form messages are sent
const VMAXWEB_URL   = "https://vma-xweb.vercel.app/#b089531e908d45c0a584dc4ff4163017";    // address of the VMAXweb product site
/* ------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;

  /* ----- Config -> page ----- */
  const vmax = $("#vmaxLink"); if (vmax) vmax.href = VMAXWEB_URL;
  const mailLink = $("#mailLink");
  if (mailLink) { mailLink.href = "mailto:" + CONTACT_EMAIL; mailLink.textContent = CONTACT_EMAIL; }
  const year = $("#year"); if (year) year.textContent = new Date().getFullYear();

  /* ----- Mobile menu ----- */
  const toggle = $("#navToggle");
  const links = $("#siteNav");
  const closeNav = () => {
    if (!links || !toggle) return;
    links.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  };
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    $$("a", links).forEach(a => a.addEventListener("click", closeNav));
  }
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeNav(); });
  document.addEventListener("click", e => { if (!e.target.closest(".nav")) closeNav(); });

  /* ----- Scroll: nav state + progress bar ----- */
  const navWrap = $(".nav-wrap");
  const bar = $("#progress");
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (navWrap) navWrap.classList.toggle("scrolled", y > 24);
      if (bar) bar.style.transform = "scaleX(" + (max > 0 ? Math.min(1, y / max) : 0) + ")";
      ticking = false;
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ----- Active nav link ----- */
  const navLinks = $$(".nav-links a");
  const sections = navLinks.map(a => {
    const href = a.getAttribute("href") || "";
    return href.charAt(0) === "#" ? $(href) : null;   // links on other pages (privacy.html) are skipped
  }).filter(Boolean);
  if ("IntersectionObserver" in window) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const id = "#" + en.target.id;
        navLinks.forEach(a => a.classList.toggle("active", a.getAttribute("href") === id));
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(s => spy.observe(s));
  }

  /* ----- Reveal on scroll (+ stagger) ----- */
  $$("[data-stagger]").forEach(group => {
    $$(".reveal", group).forEach((el, i) => el.style.setProperty("--d", (i * 0.09) + "s"));
  });
  $$(".plans .reveal").forEach((el, i) => el.style.setProperty("--d", (i * 0.12) + "s"));

  const gaugeFill = $("#gaugeFill");
  const gaugeNum = $("#gaugeNum");
  const CIRC = 2 * Math.PI * 58;
  let gaugeDone = false;
  const runGauge = () => {
    if (gaugeDone || !gaugeFill) return;
    gaugeDone = true;
    const score = Number(gaugeFill.dataset.score) || 0;
    gaugeFill.style.strokeDashoffset = String(CIRC * (1 - score / 100));
    if (reduce) { gaugeNum.textContent = score; return; }
    const t0 = performance.now(), dur = 1800;
    (function step(now) {
      const p = Math.min(1, (now - t0) / dur);
      gaugeNum.textContent = Math.round(score * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  };
  if (gaugeFill && !reduce) gaugeNum.textContent = "0";

  const reveals = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        en.target.classList.add("in");
        if (en.target.id === "report") runGauge();
        obs.unobserve(en.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add("in"));
    runGauge();
  }

  /* ----- Scramble-decode headline ----- */
  const sc = $("#scramble");
  if (sc && !reduce) {
    const finalText = sc.dataset.text;
    const glyphs = "!<>-_/[]{}=+*^?#01";
    const total = 1400;
    const t0 = performance.now() + 350;
    (function frame(now) {
      const p = Math.max(0, Math.min(1, (now - t0) / total));
      let out = "";
      for (let i = 0; i < finalText.length; i++) {
        const ch = finalText[i];
        if (ch === " ") { out += " "; continue; }
        out += p >= (i + 1) / finalText.length ? ch : glyphs[Math.floor(Math.random() * glyphs.length)];
      }
      sc.textContent = out;
      if (p < 1) requestAnimationFrame(frame); else sc.textContent = finalText;
    })(performance.now());
  }

  /* ----- Typed status line ----- */
  const typed = $("#typedText");
  if (typed && !reduce) {
    const phrases = [
      "scanning HTTP security headers",
      "verifying TLS certificate",
      "checking CORS policy",
      "probing exposed files",
      "mapping subdomains",
      "protecting digital trust"
    ];
    let pi = 0, ci = 0, del = false;
    (function type() {
      const word = phrases[pi];
      typed.textContent = word.slice(0, ci);
      let wait = del ? 18 : 42;
      if (!del && ci === word.length) { del = true; wait = 1400; }
      else if (del && ci === 0) { del = false; pi = (pi + 1) % phrases.length; wait = 320; }
      else ci += del ? -1 : 1;
      setTimeout(type, wait);
    })();
  }

  /* ----- Network canvas (hero) ----- */
  const canvas = $("#net");
  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext("2d");
    const hero = $("#home");
    let w = 0, h = 0, dpr = 1, nodes = [], running = true, visible = true;
    const mouse = { x: -9999, y: -9999 };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = hero.clientWidth; h = hero.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.max(28, Math.min(90, Math.round((w * h) / 17000)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35,
        r: Math.random() * 1.4 + .6
      }));
    };

    const LINK = 130;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        if (!reduce) {
          a.x += a.vx; a.y += a.vy;
          if (a.x < 0 || a.x > w) a.vx *= -1;
          if (a.y < 0 || a.y > h) a.vy *= -1;
        }
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK) {
            ctx.strokeStyle = "rgba(69,200,255," + (0.22 * (1 - d / LINK)).toFixed(3) + ")";
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        const md = Math.hypot(a.x - mouse.x, a.y - mouse.y);
        if (md < 170) {
          ctx.strokeStyle = "rgba(61,224,192," + (0.5 * (1 - md / 170)).toFixed(3) + ")";
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
          if (!reduce) { a.x += (mouse.x - a.x) * .004; a.y += (mouse.y - a.y) * .004; }
        }
        ctx.fillStyle = "rgba(160,225,255,.85)";
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill();
      }
    };

    const loop = () => {
      if (!running) return;
      if (visible) draw();
      requestAnimationFrame(loop);
    };

    resize();
    window.addEventListener("resize", resize);
    hero.addEventListener("pointermove", e => {
      const r = hero.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    hero.addEventListener("pointerleave", () => { mouse.x = mouse.y = -9999; });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(hero);
    }
    document.addEventListener("visibilitychange", () => {
      const was = running;
      running = !document.hidden;
      if (running && !was) loop();
    });
    if (reduce) draw(); else loop();
  }

  /* ----- Falling code background (whole page) ----- */
  const rain = $("#rain");
  if (rain && rain.getContext) {
    const rctx = rain.getContext("2d");
    const CHARS = "0123456789ABCDEF{}[]<>/\\;:=+-*&|$#_".split("");
    const SIZE = 16;
    let rw = 0, rh = 0, cols = 0, drops = [], speeds = [], hues = [], last = 0, rrun = true;

    const rsize = () => {
      const d = Math.min(window.devicePixelRatio || 1, 1.5);
      rw = window.innerWidth; rh = window.innerHeight;
      rain.width = rw * d; rain.height = rh * d;
      rctx.setTransform(d, 0, 0, d, 0, 0);
      rctx.font = SIZE + "px 'JetBrains Mono', monospace";
      rctx.textBaseline = "top";
      cols = Math.ceil(rw / SIZE);
      drops = Array.from({ length: cols }, () => -Math.random() * (rh / SIZE));
      speeds = Array.from({ length: cols }, () => 0.35 + Math.random() * 0.7);
      hues = Array.from({ length: cols }, () => (Math.random() < 0.7 ? "69,200,255" : "61,224,192"));
    };

    const rtick = () => {
      rctx.globalCompositeOperation = "destination-out";
      rctx.fillStyle = "rgba(0,0,0,0.09)";
      rctx.fillRect(0, 0, rw, rh);
      rctx.globalCompositeOperation = "source-over";
      for (let i = 0; i < cols; i++) {
        const y = drops[i] * SIZE;
        if (y > -SIZE) {
          const ch = CHARS[Math.floor(Math.random() * CHARS.length)];
          rctx.fillStyle = "rgba(" + hues[i] + ",0.55)";
          rctx.fillText(ch, i * SIZE, y);
          rctx.fillStyle = "rgba(215,248,255,0.9)";
          rctx.fillText(ch, i * SIZE, y);
        }
        drops[i] += speeds[i];
        if (drops[i] * SIZE > rh && Math.random() > 0.97) {
          drops[i] = -Math.random() * 12;
          speeds[i] = 0.35 + Math.random() * 0.7;
        }
      }
    };

    const rloop = now => {
      if (!rrun) return;
      if (now - last > 45) { last = now; rtick(); }
      requestAnimationFrame(rloop);
    };

    rsize();
    window.addEventListener("resize", rsize);
    if (reduce) {
      for (let k = 0; k < 140; k++) rtick();
    } else {
      requestAnimationFrame(rloop);
      document.addEventListener("visibilitychange", () => {
        const was = rrun;
        rrun = !document.hidden;
        if (rrun && !was) requestAnimationFrame(rloop);
      });
    }
  }

  /* ----- Cursor glow ----- */
  const glow = $("#cursorGlow");
  if (glow && finePointer && !reduce) {
    let tx = 0, ty = 0, cx = 0, cy = 0;
    window.addEventListener("pointermove", e => { tx = e.clientX; ty = e.clientY; glow.classList.add("on"); }, { passive: true });
    document.addEventListener("pointerleave", () => glow.classList.remove("on"));
    (function follow() {
      cx += (tx - cx) * .12; cy += (ty - cy) * .12;
      glow.style.transform = "translate(" + cx.toFixed(1) + "px," + cy.toFixed(1) + "px)";
      requestAnimationFrame(follow);
    })();
  }

  /* ----- Magnetic buttons ----- */
  if (finePointer && !reduce) {
    $$(".btn").forEach(btn => {
      btn.addEventListener("pointermove", e => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * .18;
        const y = (e.clientY - r.top - r.height / 2) * .28;
        btn.style.transform = "translate(" + x.toFixed(1) + "px," + y.toFixed(1) + "px)";
      });
      btn.addEventListener("pointerleave", () => { btn.style.transform = ""; });
    });
  }

  /* ----- Copy email ----- */
  const copyBtn = $("#copyMail");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      let ok = false;
      try { await navigator.clipboard.writeText(CONTACT_EMAIL); ok = true; } catch (_) {}
      if (!ok) {
        const range = document.createRange();
        range.selectNodeContents(mailLink);
        const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
      }
      copyBtn.textContent = ok ? "Copied" : "Press Ctrl+C";
      setTimeout(() => { copyBtn.textContent = "Copy"; }, 1800);
    });
  }

  /* ----- Contact form: validates, then opens the visitor's mail app ----- */
  const form = $("#contactForm");
  const note = $("#formNote");
  const setNote = (msg, type) => { note.textContent = msg; note.className = "form-note " + (type || ""); };
  if (form) form.addEventListener("submit", e => {
    e.preventDefault();
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    form.name.setAttribute("aria-invalid", String(!name));
    form.email.setAttribute("aria-invalid", String(!emailOk));
    form.message.setAttribute("aria-invalid", String(!message));

    if (!name || !emailOk || !message) {
      setNote("Please fill in your name, a valid email and a message.", "error");
      return;
    }
    const subject = encodeURIComponent("Message from " + name + " via Starnet Security");
    const body = encodeURIComponent(message + "\n\n— " + name + " (" + email + ")");
    window.location.href = "mailto:" + CONTACT_EMAIL + "?subject=" + subject + "&body=" + body;
    setNote("Your email app should open with the message ready to send.", "ok");
  });
});
