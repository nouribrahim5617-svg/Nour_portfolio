/* ============================================================
   NOUR IBRAHIM PORTFOLIO — interactions
   - Smooth scroll (Lenis)
   - Page loader counter
   - Custom cursor + hover variants
   - Scroll-triggered reveals (GSAP ScrollTrigger)
   - Subtle hero parallax
   ============================================================ */

(() => {
  /* ---------- Loader ---------- */
  const loader     = document.getElementById("loader");
  const loaderBar  = document.getElementById("loaderBar");
  const loaderCnt  = document.getElementById("loaderCount");

  if (loader && loaderBar && loaderCnt) {
    let n = 0;
    const tick = () => {
      n += Math.random() * 12;
      if (n >= 100) n = 100;
      loaderBar.style.width = n + "%";
      loaderCnt.textContent = String(Math.floor(n)).padStart(2, "0");
      if (n < 100) {
        setTimeout(tick, 80);
      } else {
        setTimeout(() => {
          loader.classList.add("is-done");
          // reveal hero media
          const media = document.querySelector(".hero__media");
          if (media) media.classList.add("is-visible");
        }, 320);
      }
    };
    tick();
  }

  /* ---------- Hero video — scroll-scrubbed playback ---------- */
  // Map scroll progress through the hero section onto a *slow* slice of the video.
  // The clip is ~5s; we only use the first SLICE_SECONDS and the playback advances
  // proportionally to how far the user has scrolled through the hero.
  const heroVideo = document.getElementById("heroVideo");
  const heroSection = document.getElementById("hero");
  if (heroVideo && heroSection) {
    const SLICE_SECONDS = 3.2;   // how much of the clip to use across the scroll
    const START_OFFSET  = 0.0;   // start time within the clip

    let videoReady = false;
    heroVideo.addEventListener("loadedmetadata", () => {
      videoReady = true;
      heroVideo.currentTime = START_OFFSET;
    }, { once: true });

    // Make sure preload kicks in
    heroVideo.load();

    let target = START_OFFSET;
    let current = START_OFFSET;

    const update = () => {
      if (!videoReady) return;
      const r = heroSection.getBoundingClientRect();
      // 0 when hero top hits the viewport top, 1 when hero bottom leaves
      const total = r.height + window.innerHeight;
      const passed = Math.min(Math.max(window.innerHeight - r.top, 0), total);
      const progress = passed / total;
      target = START_OFFSET + progress * SLICE_SECONDS;
    };

    const tickVid = () => {
      // ease toward target so the video glides instead of snapping
      current += (target - current) * 0.12;
      if (videoReady && Math.abs(heroVideo.currentTime - current) > 0.005) {
        try { heroVideo.currentTime = current; } catch (e) {}
      }
      requestAnimationFrame(tickVid);
    };
    update();
    tickVid();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  }

  /* ---------- Lenis smooth scroll ---------- */
  let lenis;
  if (window.Lenis) {
    lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // anchor links — route through Lenis for smoothness
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const target = document.querySelector(a.getAttribute("href"));
        if (target) {
          e.preventDefault();
          lenis.scrollTo(target, { offset: -20, duration: 1.4 });
        }
      });
    });
  }

  /* ---------- Custom cursor ---------- */
  const cursor      = document.getElementById("cursor");
  const cursorRing  = document.getElementById("cursorRing");

  if (cursor && cursorRing) {
    let mx = window.innerWidth / 2,
        my = window.innerHeight / 2;
    let rx = mx, ry = my;

    window.addEventListener("mousemove", (e) => {
      mx = e.clientX;
      my = e.clientY;
      cursor.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    });

    const animate = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      cursorRing.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      requestAnimationFrame(animate);
    };
    animate();

    // Hover states from data-cursor
    document.querySelectorAll("[data-cursor]").forEach((el) => {
      const kind = el.getAttribute("data-cursor"); // link | enter | hover
      el.addEventListener("mouseenter", () => {
        if (kind === "link")  document.body.classList.add("cursor-link");
        if (kind === "enter") document.body.classList.add("cursor-enter");
      });
      el.addEventListener("mouseleave", () => {
        document.body.classList.remove("cursor-link", "cursor-enter");
      });
    });
  }

  /* ---------- GSAP ScrollTrigger reveals ---------- */
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    // Generic .reveal elements
    gsap.utils.toArray(".reveal").forEach((el) => {
      gsap.fromTo(
        el,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    });

    // Hero title — line-by-line reveal
    const lines = document.querySelectorAll(".hero__title .line, .hero__intro");
    if (lines.length) {
      gsap.fromTo(
        lines,
        { y: 80, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.4,
          stagger: 0.15,
          ease: "expo.out",
          delay: 0.5,
        }
      );
    }

    // Hero meta corners
    gsap.fromTo(
      ".hero__meta",
      { opacity: 0, y: -10 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, delay: 1.4, ease: "power2.out" }
    );

    // Subtle parallax on hero video — slower than scroll
    const media = document.querySelector(".hero__media");
    if (media) {
      gsap.to(media, {
        yPercent: -15,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }

    // Section heads
    gsap.utils.toArray(".section-head").forEach((el) => {
      gsap.fromTo(
        el,
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 90%" },
        }
      );
    });

    // Project cards staggered in
    gsap.utils.toArray(".project-card").forEach((card, i) => {
      gsap.fromTo(
        card,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.0,
          delay: i * 0.08,
          ease: "power3.out",
          scrollTrigger: { trigger: ".projects__grid", start: "top 80%" },
        }
      );
    });

    // Big titles like .projects__title / .about__title / .contact__title
    gsap.utils.toArray(".projects__title, .about__title, .contact__title").forEach((el) => {
      gsap.fromTo(
        el,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 85%" },
        }
      );
    });

    // Project detail page — feature image scale-in
    gsap.utils.toArray(".p-feature__img, .p-img").forEach((el) => {
      gsap.fromTo(
        el,
        { scale: 1.08, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 1.4,
          ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 90%" },
        }
      );
    });

    // Project detail — title and brief
    gsap.utils.toArray(".p-hero__title, .p-brief__label h3, .p-brief__body .lead").forEach((el) => {
      gsap.fromTo(
        el,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 90%" },
        }
      );
    });

    // refresh after fonts load
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    }
  }

  /* ---------- Project card mousemove tilt ---------- */
  document.querySelectorAll(".project-card").forEach((card) => {
    const num = card.querySelector(".project-card__num");
    const img = card.querySelector(".project-card__img");

    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      if (num) num.style.transform = `translate(${x * 16}px, ${y * 16}px)`;
      if (img) img.style.backgroundPosition = `${50 + x * 8}% ${50 + y * 8}%`;
    });
    card.addEventListener("mouseleave", () => {
      if (num) num.style.transform = "";
      if (img) img.style.backgroundPosition = "center";
    });
  });

  /* ---------- Hide cursor on touch devices ---------- */
  window.addEventListener("touchstart", () => {
    document.body.style.cursor = "auto";
    if (cursor)     cursor.style.display = "none";
    if (cursorRing) cursorRing.style.display = "none";
  }, { once: true });
})();
