// Sticky Navbar Shadow
window.addEventListener("scroll", () => {
  const navbar = document.querySelector(".navbar");
  if (window.scrollY > 50) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});

// Toggle Hamburger Menu
const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("nav-menu");

if (hamburger) {
  hamburger.addEventListener("click", () => {
    navMenu.classList.toggle("show");
  });
}
// hamburger.addEventListener("click", () => {
//   navMenu.classList.toggle("show");
// });

// SHARED JS
//Testimonial
// ===================== Testimonials (tms) — Fresh JS =====================
(function () {
  const section = document.querySelector(".tms-section");
  const viewport = document.querySelector(".tms-viewport");
  const track = document.querySelector(".tms-track");
  const slides = Array.from(document.querySelectorAll(".tms-slide"));
  const prevBtn = document.querySelector(".tms-prev");
  const nextBtn = document.querySelector(".tms-next");
  const dots = Array.from(document.querySelectorAll(".tms-dot"));

  if (!section || !viewport || !track || slides.length === 0) return;

  // ---- State
  let index = 0;
  let autoEnabled = !window.matchMedia("(prefers-reduced-motion: reduce)")
    .matches;
  let autoTimer = null;

  // ---- Helpers
  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  // compute the left scroll so slide i is centered in the viewport
  function centerLeftFor(i) {
    const slide = slides[i];
    const left =
      slide.offsetLeft - (viewport.clientWidth - slide.clientWidth) / 2;
    const maxLeft = track.scrollWidth - viewport.clientWidth;
    return clamp(left, 0, Math.max(0, maxLeft));
  }

  function setActiveDot(i) {
    dots.forEach((d, di) => d.classList.toggle("is-active", di === i));
  }

  function snapTo(i, smooth = true) {
    index = clamp(i, 0, slides.length - 1);
    track.scrollTo({
      left: centerLeftFor(index),
      behavior: smooth ? "smooth" : "auto",
    });
    setActiveDot(index);
  }

  // Update active index based on current scroll position (for manual drag/scroll)
  function syncIndexFromScroll() {
    const center = track.scrollLeft + viewport.clientWidth / 2;
    let best = 0,
      bestDist = Infinity;
    for (let i = 0; i < slides.length; i++) {
      const s = slides[i];
      const c = s.offsetLeft + s.clientWidth / 2;
      const d = Math.abs(c - center);
      if (d < bestDist) {
        best = i;
        bestDist = d;
      }
    }
    if (best !== index) {
      index = best;
      setActiveDot(index);
    }
  }

  // ---- Controls
  prevBtn?.addEventListener("click", () => snapTo(index - 1));
  nextBtn?.addEventListener("click", () => snapTo(index + 1));
  dots.forEach((dot, i) => dot.addEventListener("click", () => snapTo(i)));

  // ---- Drag/Swipe
  let isDown = false,
    startX = 0,
    startLeft = 0;
  track.addEventListener("pointerdown", (e) => {
    isDown = true;
    startX = e.clientX;
    startLeft = track.scrollLeft;
    track.style.scrollBehavior = "auto"; // disable smooth during drag for snappy feel
    track.setPointerCapture(e.pointerId);
  });
  track.addEventListener("pointermove", (e) => {
    if (!isDown) return;
    const dx = e.clientX - startX;
    track.scrollLeft = startLeft - dx;
    syncIndexFromScroll();
  });
  window.addEventListener(
    "pointerup",
    () => {
      if (!isDown) return;
      isDown = false;
      track.style.scrollBehavior = ""; // restore smooth
      // snap to nearest slide gently
      snapTo(index);
    },
    { passive: true }
  );

  // ---- Sync on scroll/resize
  track.addEventListener("scroll", syncIndexFromScroll, { passive: true });
  window.addEventListener("resize", () => snapTo(index, false));

  // ---- Autoplay (pauses on hover and when section not visible)
  function startAuto() {
    if (!autoEnabled) return;
    stopAuto();
    autoTimer = setInterval(() => snapTo((index + 1) % slides.length), 5000);
  }
  function stopAuto() {
    clearInterval(autoTimer);
    autoTimer = null;
  }

  // Pause on hover
  viewport.addEventListener("mouseenter", stopAuto);
  viewport.addEventListener("mouseleave", startAuto);

  // Disable autoplay after any user interaction
  ["pointerdown", "wheel", "keydown", "touchstart"].forEach((evt) => {
    track.addEventListener(
      evt,
      () => {
        autoEnabled = false;
        stopAuto();
      },
      { once: true, passive: true }
    );
  });

  // Pause when section not in view
  const vis = new IntersectionObserver(
    (entries) => {
      const visible = entries[0]?.isIntersecting;
      if (visible) startAuto();
      else stopAuto();
    },
    { threshold: 0.25 }
  );
  vis.observe(section);

  // ---- Init
  // If content/images cause width shifts, center after load as well
  window.addEventListener("load", () => snapTo(0, false));
  snapTo(0, false);
})();

//About Section
// About Video Modal + Scroll Animation
(function () {
  const openBtn = document.querySelector(".about-play");
  const modal = document.getElementById("about-video-modal");
  const wrap = modal.querySelector(".video-wrap");
  const closeEls = modal.querySelectorAll("[data-close]");
  let lastFocus = null;

  // Scroll reveal animation
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.2 }
  );

  document
    .querySelectorAll(".about-card, .about-media")
    .forEach((el) => observer.observe(el));

  // --- MODAL LOGIC ---

  // Open modal
  openBtn.addEventListener("click", () => {
    lastFocus = document.activeElement;
    modal.hidden = false;
    wrap.innerHTML = `<iframe title="EcoPrint video"
      src="https://www.youtube.com/embed/VIDEO_ID?autoplay=1&rel=0&playsinline=1&modestbranding=1"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen></iframe>`;
    document.body.style.overflow = "hidden";
  });

  // Close modal
  function closeModal() {
    modal.hidden = true;
    wrap.innerHTML = ""; // clear video so it stops playing
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }

  // Close on X and backdrop
  closeEls.forEach((el) => el.addEventListener("click", closeModal));
  modal.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal-backdrop")) {
      closeModal();
    }
  });

  // Close on Escape
  document.addEventListener("keydown", (e) => {
    if (!modal.hidden && e.key === "Escape") closeModal();
  });
})();

// CONTACT

const form = document.getElementById("orderForm");
const status = document.getElementById("formStatus");
const groups = document.querySelectorAll(".form-group");
const title = document.querySelector(".animate-title");
const subtitle = document.querySelector(".animate-subtitle");

// Animate entrance like Framer Motion
function animateForm() {
  if (!title || !subtitle) return;
  title.classList.add("animate-show");
  subtitle.classList.add("animate-show");
  groups.forEach((el, i) => {
    setTimeout(() => {
      el.classList.add("animate-show");
    }, i * 100);
  });
}
window.addEventListener("load", animateForm);

if (form) {
  // Form Submit
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("name");
    const email = document.getElementById("email");
    const cat = document.getElementById("category");

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
    if (!name.value.trim() || !emailValid || !cat.value) {
      status.textContent = "Please fill all required fields correctly!";
      status.style.color = "red";
      return;
    }

    status.textContent = "Sending…";
    status.style.color = "#2ca02c";
    const btn = form.querySelector(".btn-send");
    btn.disabled = true;

    setTimeout(() => {
      status.textContent = "Thanks! We've received your request.";
      btn.disabled = false;
      form.reset();
    }, 1200);
  });
}
//Process Section

(() => {
  const track = document.querySelector(".pq-trackcards");
  const fill = document.querySelector(".pq-progress");
  const btns = document.querySelectorAll(".pq-btn");
  const steps = document.querySelectorAll(".pq-step");

  let current = 0;
  const total = steps.length;

  function updateProgress() {
    const progress = current / (total - 1);
    fill.style.strokeDashoffset = 1800 * (1 - progress);
    steps.forEach((step, i) => {
      step.classList.toggle("active", i === current);
    });
  }

  btns.forEach((btn) => {
    btn.addEventListener("click", () => {
      // step width = first card’s full width (including gap)
      const stepWidth =
        steps[0].offsetWidth + parseInt(getComputedStyle(track).gap || 0);

      if (btn.dataset.dir === "next") {
        if (current < total - 1) current++;
      } else {
        if (current > 0) current--;
      }

      // scroll to the correct position
      track.scrollTo({
        left: stepWidth * current,
        behavior: "smooth",
      });

      updateProgress();
    });
  });

  track.addEventListener("scroll", () => {
    const scrollPos = track.scrollLeft;
    const stepWidth =
      steps[0].offsetWidth + parseInt(getComputedStyle(track).gap || 0);
    current = Math.round(scrollPos / stepWidth);
    updateProgress();
  });

  updateProgress();
})();

// video and Article Section
// // video and Article Section
// document.addEventListener("DOMContentLoaded", () => {
//   const scrollContainers = document.querySelectorAll(".scroll-container");
//   scrollContainers.forEach((container) => {
//     const grid = container.querySelector(".video-grid");
//     const leftBtn = container.querySelector(".scroll-btn.left");
//     const rightBtn = container.querySelector(".scroll-btn.right");

//     if (!grid) return; // nothing to scroll

//     // make scroll amount responsive to container width
//     const getScrollAmount = () =>
//       Math.max(280, Math.floor(container.clientWidth * 0.7));

//     // click handlers (guard buttons)
//     if (leftBtn) {
//       leftBtn.addEventListener("click", () => {
//         grid.scrollBy({ left: -getScrollAmount(), behavior: "smooth" });
//       });
//     }
//     if (rightBtn) {
//       rightBtn.addEventListener("click", () => {
//         grid.scrollBy({ left: getScrollAmount(), behavior: "smooth" });
//       });
//     }

//     // allow keyboard navigation when container receives focus
//     container.setAttribute("tabindex", "0");
//     container.addEventListener("keydown", (e) => {
//       if (e.key === "ArrowLeft") {
//         e.preventDefault();
//         grid.scrollBy({ left: -getScrollAmount(), behavior: "smooth" });
//       } else if (e.key === "ArrowRight") {
//         e.preventDefault();
//         grid.scrollBy({ left: getScrollAmount(), behavior: "smooth" });
//       }
//     });
//   });
// });

// shop.html section

// ===== Hexashop-like carousel (no external libs) =====
document.addEventListener("DOMContentLoaded", () => {
  // 1) WhatsApp number (no leading +). Replace with yours.
  const WHATSAPP_NUMBER = "254700000000";

  // 2) Build WhatsApp links for every product card.
  document.querySelectorAll(".card").forEach((card) => {
    const data = JSON.parse(card.dataset.product || "{}");
    const btn = card.querySelector(".buy");
    if (!btn || !data.name) return;

    const text = `Hello! I'm interested in:
• Product: ${data.name}
• ID: ${data.id || "-"}
• Price: KES ${data.price || "-"}
Please share availability and size options.`;

    btn.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      text
    )}`;
    btn.target = "_blank";
    btn.rel = "noopener";
  });

  // 3) Initialize each carousel independently.
  document.addEventListener("DOMContentLoaded", () => {
    const carousels = document.querySelectorAll(".carousel");
    if (!carousels.length) return;

    carousels.forEach((carousel) => {
      const track = carousel.querySelector(".track");
      const prev = carousel.querySelector(".nav.prev");
      const next = carousel.querySelector(".nav.next");
      if (!track || !prev || !next) return;
      // document.querySelectorAll(".carousel").forEach((carousel) => {
      //   const track = carousel.querySelector(".track");
      //   const prev = carousel.querySelector(".nav.prev");
      //   const next = carousel.querySelector(".nav.next");
      //   if (!track || !prev || !next) return;

      // Helper: get numeric gap between cards from CSS
      const getGap = () => {
        const cs = getComputedStyle(track);
        // Some browsers expose 'columnGap', others just 'gap'
        const gapStr = cs.columnGap || cs.gap || "0px";
        const n = parseFloat(gapStr);
        return Number.isFinite(n) ? n : 0;
      };

      // Helper: how far to move = width of one card + gap
      const getStep = () => {
        const card = track.querySelector(".card");
        if (!card) return 300;
        const w = card.getBoundingClientRect().width;
        return w + getGap();
      };

      // Update arrow disabled states
      const updateDisabled = () => {
        const max = track.scrollWidth - track.clientWidth - 1; // tolerance
        prev.disabled = track.scrollLeft <= 0;
        next.disabled = track.scrollLeft >= max;
      };

      updateDisabled();

      // Click handlers: move by exactly one card per click
      next.addEventListener("click", () => {
        track.scrollBy({ left: getStep(), behavior: "smooth" });
        setTimeout(updateDisabled, 300);
      });

      prev.addEventListener("click", () => {
        track.scrollBy({ left: -getStep(), behavior: "smooth" });
        setTimeout(updateDisabled, 300);
      });

      // Keep buttons in sync while user scrolls
      track.addEventListener("scroll", updateDisabled, { passive: true });

      // Optional: basic drag-to-scroll for desktop
      let isDown = false,
        startX = 0,
        startLeft = 0;

      const onMouseDown = (e) => {
        isDown = true;
        startX = e.pageX;
        startLeft = track.scrollLeft;
        track.classList.add("grabbing");
        // Prevent selecting images/text while dragging
        e.preventDefault();
      };

      const onMouseMove = (e) => {
        if (!isDown) return;
        const dx = e.pageX - startX;
        track.scrollLeft = startLeft - dx * 1.2; // speed factor
      };

      const onMouseUp = () => {
        if (!isDown) return;
        isDown = false;
        track.classList.remove("grabbing");
      };

      track.addEventListener("mousedown", onMouseDown);
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);

      // Optional: snap neatly to nearest card after wheel/drag end
      let snapTimer;
      const snapToNearest = () => {
        clearTimeout(snapTimer);
        snapTimer = setTimeout(() => {
          const step = getStep();
          const current = track.scrollLeft;
          const targetIndex = Math.round(current / step);
          const target = targetIndex * step;
          track.scrollTo({ left: target, behavior: "smooth" });
        }, 120);
      };
      track.addEventListener("wheel", snapToNearest, { passive: true });
      track.addEventListener("mouseup", snapToNearest);
      track.addEventListener("touchend", snapToNearest);
      window.addEventListener("resize", updateDisabled);
    });
  });
});

// Auto-scroll carousel
// const track = document.querySelector(".tf-track");
// let scrollAmount = 0;
// let scrollStep = 1; // pixels per interval
// let maxScroll = track.scrollWidth - track.clientWidth;

// function autoScroll() {
//   scrollAmount += scrollStep;
//   if (scrollAmount >= maxScroll) scrollAmount = 0;
//   track.scrollTo({ left: scrollAmount, behavior: "smooth" });
// }

// setInterval(autoScroll, 20); // adjust speed here

const tfAutoTrack = document.querySelector(".tf-track");
let autoScrollAmount = 0;
let autoScrollStep = 1; // pixels per interval
if (tfAutoTrack) {
  let autoMaxScroll = tfAutoTrack.scrollWidth - tfAutoTrack.clientWidth;
  function autoScroll() {
    autoMaxScroll = tfAutoTrack.scrollWidth - tfAutoTrack.clientWidth;
    autoScrollAmount += autoScrollStep;
    if (autoScrollAmount >= autoMaxScroll) autoScrollAmount = 0;
    tfAutoTrack.scrollTo({ left: autoScrollAmount, behavior: "smooth" });
  }
  setInterval(autoScroll, 20);
}
//Top Feature
// consttrack = document.querySelector(".tf-track");
// let scrollSpeed = 0.7; // pixels per frame
// let position = 0;

// function animate() {
//   position -= scrollSpeed;

//   // Reset position when half of the track width is scrolled (because we duplicated items)
//   if (Math.abs(position) >= track.scrollWidth / 2) {
//     position = 0;
//   }

//   track.style.transform = `translateX(${position}px)`;
//   requestAnimationFrame(animate);
// }

// animate();

// // Pause on hover
// document.querySelector(".tf-viewport").addEventListener("mouseenter", () => {
//   scrollSpeed = 0;
// });
// document.querySelector(".tf-viewport").addEventListener("mouseleave", () => {
//   scrollSpeed = 0.5;
// });

const tfTrack = document.querySelector(".tf-track");
let scrollSpeed = 0.7; // pixels per frame
let position = 0;

function animate() {
  if (!tfTrack) return;
  position -= scrollSpeed;
  // Reset position when half of the track width is scrolled (because we duplicated items)
  if (Math.abs(position) >= tfTrack.scrollWidth / 2) {
    position = 0;
  }
  tfTrack.style.transform = `translateX(${position}px)`;
  requestAnimationFrame(animate);
}

animate();

// Pause on hover (guard)
const tfViewport = document.querySelector(".tf-viewport");
if (tfViewport) {
  tfViewport.addEventListener("mouseenter", () => {
    scrollSpeed = 0;
  });
  tfViewport.addEventListener("mouseleave", () => {
    scrollSpeed = 0.5;
  });
}

//Shop Section
const animatedCards = document.querySelectorAll("[data-animate]");

function animateOnScroll() {
  const triggerBottom = window.innerHeight * 0.85;

  animatedCards.forEach((card) => {
    const cardTop = card.getBoundingClientRect().top;

    if (cardTop < triggerBottom) {
      card.style.opacity = "1";
      card.style.transform = "translateY(0)";
    }
  });
}

window.addEventListener("scroll", animateOnScroll);
window.addEventListener("load", animateOnScroll);

document.addEventListener("DOMContentLoaded", () => {
  const facts = document.querySelectorAll(".fact");

  // Intersection Observer for scroll animation
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Animate each fact
          const target = +entry.target.dataset.target;
          const numberEl = entry.target.querySelector(".fact-number");
          let count = 0;
          const increment = target / 100; // speed

          const counter = setInterval(() => {
            count += increment;
            if (count >= target) {
              numberEl.textContent = target.toLocaleString();
              clearInterval(counter);
            } else {
              numberEl.textContent = Math.floor(count).toLocaleString();
            }
          }, 15);

          // Add entrance animation
          entry.target.style.opacity = 1;
          entry.target.style.transform = "translateY(0)";

          observer.unobserve(entry.target); // run once
        }
      });
    },
    { threshold: 0.5 }
  );

  facts.forEach((fact) => observer.observe(fact));
});
document.addEventListener("DOMContentLoaded", () => {
  const facts = document.querySelectorAll(".fact");

  // Intersection Observer for scroll animation
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Animate each fact
          const target = +entry.target.dataset.target;
          const numberEl = entry.target.querySelector(".fact-number");
          let count = 0;
          const increment = target / 100; // speed

          const counter = setInterval(() => {
            count += increment;
            if (count >= target) {
              numberEl.textContent = target.toLocaleString();
              clearInterval(counter);
            } else {
              numberEl.textContent = Math.floor(count).toLocaleString();
            }
          }, 15);

          // Add entrance animation
          entry.target.style.opacity = 1;
          entry.target.style.transform = "translateY(0)";

          observer.unobserve(entry.target); // run once
        }
      });
    },
    { threshold: 0.5 }
  );

  facts.forEach((fact) => observer.observe(fact));
});

// ========= Partners Logos Marquee (namespaced: pl) =========
(function () {
  const viewports = document.querySelectorAll(".pl-viewport");
  if (!viewports.length) return;

  viewports.forEach((vp) => {
    const track = vp.querySelector(".pl-track");
    if (!track) return;

    // Duplicate items until track > ~2x viewport for seamless scroll
    const baseItems = Array.from(track.children).map((el) =>
      el.cloneNode(true)
    );
    function build() {
      // reset to base
      track.replaceChildren(...baseItems.map((n) => n.cloneNode(true)));

      let w = track.scrollWidth;
      const target = vp.clientWidth * 2.2; // a bit over 2x
      while (w < target) {
        baseItems.forEach((n) => track.appendChild(n.cloneNode(true)));
        w = track.scrollWidth;
      }

      // Speed control: pixels per second from data-speed (default 120)
      const pxPerSec = parseInt(track.dataset.speed || "90", 10);
      const duration = w / pxPerSec;
      track.style.setProperty("--pl-duration", `${duration}s`);
    }

    build();
    window.addEventListener("resize", () => {
      clearTimeout(track._r);
      track._r = setTimeout(build, 150);
    });

    // Drag/Swipe to scroll manually (pauses animation while dragging)
    let down = false,
      startX = 0,
      startTx = 0;
    track.addEventListener("pointerdown", (e) => {
      down = true;
      startX = e.clientX;
      // read current translateX from computed matrix
      const m = getComputedStyle(track).transform;
      startTx = m !== "none" ? parseFloat(m.split(",")[4]) : 0;
      track.style.animationPlayState = "paused";
      track.setPointerCapture(e.pointerId);
    });
    track.addEventListener("pointermove", (e) => {
      if (!down) return;
      const dx = e.clientX - startX;
      track.style.transform = `translateX(${startTx + dx}px)`;
    });
    window.addEventListener(
      "pointerup",
      () => {
        if (!down) return;
        down = false;
        track.style.transform = "";
        track.style.animationPlayState = "";
      },
      { passive: true }
    );
  });
})();

// Optional: Interactive floating shapes following cursor
document.addEventListener("mousemove", function (e) {
  const shapes = document.querySelectorAll(".floating-shape");
  shapes.forEach((shape, index) => {
    const speed = (index + 1) * 0.05;
    const x = e.clientX * speed;
    const y = e.clientY * speed;
    shape.style.transform = `translate(${x}px, ${y}px)`;
  });
});

//Shop Carousel
