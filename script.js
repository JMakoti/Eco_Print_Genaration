// ===================================================
// Lazy Image Loading
// ===================================================

// Lazy Loading Images
document.addEventListener("DOMContentLoaded", function () {
  const lazyImages = document.querySelectorAll("img.lazy");

  const imageObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.add("loaded");
          img.classList.remove("lazy");
          observer.unobserve(img);
        }
      });
    },
    {
      rootMargin: "50px",
    }
  );

  lazyImages.forEach((img) => imageObserver.observe(img));
});

// ===================================================
// Sticky Navbar + Hamburger Menu
// ===================================================

// Sticky Navbar Shadow
window.addEventListener("scroll", () => {
  const navbar = document.querySelector(".navbar");
  if (!navbar) return;
  navbar.classList.toggle("scrolled", window.scrollY > 50);
});

// Toggle Hamburger Menu
const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("nav-menu");

if (hamburger && navMenu) {
  hamburger.addEventListener("click", () => {
    navMenu.classList.toggle("show");
  });
}

// ===================================================
// Testimonials Carousel (tms)
// ===================================================
(function () {
  const section = document.querySelector(".tms-section");
  const viewport = document.querySelector(".tms-viewport");
  const track = document.querySelector(".tms-track");
  const slides = Array.from(document.querySelectorAll(".tms-slide"));
  const prevBtn = document.querySelector(".tms-prev");
  const nextBtn = document.querySelector(".tms-next");
  const dots = Array.from(document.querySelectorAll(".tms-dot"));

  if (!section || !viewport || !track || slides.length === 0) return;

  let index = 0;
  let autoEnabled = !window.matchMedia("(prefers-reduced-motion: reduce)")
    .matches;
  let autoTimer = null;

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

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

  function syncIndexFromScroll() {
    const center = track.scrollLeft + viewport.clientWidth / 2;
    let best = 0,
      bestDist = Infinity;
    slides.forEach((s, i) => {
      const c = s.offsetLeft + s.clientWidth / 2;
      const d = Math.abs(c - center);
      if (d < bestDist) {
        best = i;
        bestDist = d;
      }
    });
    if (best !== index) {
      index = best;
      setActiveDot(index);
    }
  }

  prevBtn?.addEventListener("click", () => snapTo(index - 1));
  nextBtn?.addEventListener("click", () => snapTo(index + 1));
  dots.forEach((dot, i) => dot.addEventListener("click", () => snapTo(i)));

  let isDown = false,
    startX = 0,
    startLeft = 0;
  track.addEventListener("pointerdown", (e) => {
    isDown = true;
    startX = e.clientX;
    startLeft = track.scrollLeft;
    track.style.scrollBehavior = "auto";
    track.setPointerCapture(e.pointerId);
  });
  track.addEventListener("pointermove", (e) => {
    if (!isDown) return;
    track.scrollLeft = startLeft - (e.clientX - startX);
    syncIndexFromScroll();
  });
  window.addEventListener(
    "pointerup",
    () => {
      if (!isDown) return;
      isDown = false;
      track.style.scrollBehavior = "";
      snapTo(index);
    },
    { passive: true }
  );

  track.addEventListener("scroll", syncIndexFromScroll, { passive: true });
  window.addEventListener("resize", () => snapTo(index, false));

  function startAuto() {
    if (!autoEnabled) return;
    stopAuto();
    autoTimer = setInterval(() => snapTo((index + 1) % slides.length), 5000);
  }
  function stopAuto() {
    clearInterval(autoTimer);
    autoTimer = null;
  }

  viewport.addEventListener("mouseenter", stopAuto);
  viewport.addEventListener("mouseleave", startAuto);

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

  const vis = new IntersectionObserver(
    (entries) => (entries[0]?.isIntersecting ? startAuto() : stopAuto()),
    { threshold: 0.25 }
  );
  vis.observe(section);

  window.addEventListener("load", () => snapTo(0, false));
  snapTo(0, false);
})();

// ===================================================
// About Section - Video Modal + Scroll Animation
// ===================================================
(function () {
  const openBtn = document.querySelector(".about-play");
  const modal = document.getElementById("about-video-modal");
  if (!openBtn || !modal) return;
  const wrap = modal.querySelector(".video-wrap");
  const closeEls = modal.querySelectorAll("[data-close]");
  let lastFocus = null;

  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("visible");
      }),
    { threshold: 0.2 }
  );
  document
    .querySelectorAll(".about-card, .about-media")
    .forEach((el) => observer.observe(el));

  openBtn.addEventListener("click", () => {
    lastFocus = document.activeElement;
    modal.hidden = false;
    wrap.innerHTML = `<iframe title="EcoPrint video"
      src="https://www.youtube.com/embed/VIDEO_ID?autoplay=1&rel=0&playsinline=1&modestbranding=1"
      frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen></iframe>`;
    document.body.style.overflow = "hidden";
  });

  function closeModal() {
    modal.hidden = true;
    wrap.innerHTML = "";
    document.body.style.overflow = "";
    lastFocus?.focus();
  }

  closeEls.forEach((el) => el.addEventListener("click", closeModal));
  modal.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal-backdrop")) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (!modal.hidden && e.key === "Escape") closeModal();
  });
})();

// ===================================================
// Contact Form Animation + Validation
// ===================================================
const form = document.getElementById("orderForm");
const status = document.getElementById("formStatus");
const groups = document.querySelectorAll(".form-group");
const title = document.querySelector(".animate-title");
const subtitle = document.querySelector(".animate-subtitle");

function animateForm() {
  if (!title || !subtitle) return;
  title.classList.add("animate-show");
  subtitle.classList.add("animate-show");
  groups.forEach((el, i) => {
    setTimeout(() => el.classList.add("animate-show"), i * 100);
  });
}
window.addEventListener("load", animateForm);

if (form && status) {
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

// ===================================================
// Process Section
// ===================================================
(() => {
  const track = document.querySelector(".pq-trackcards");
  const fill = document.querySelector(".pq-progress");
  const btns = document.querySelectorAll(".pq-btn");
  const steps = document.querySelectorAll(".pq-step");
  if (!track || !fill || !btns.length || !steps.length) return;

  let current = 0;
  const total = steps.length;

  function updateProgress() {
    const progress = current / (total - 1);
    fill.style.strokeDashoffset = 1800 * (1 - progress);
    steps.forEach((step, i) => step.classList.toggle("active", i === current));
  }

  btns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const stepWidth =
        steps[0].offsetWidth + parseInt(getComputedStyle(track).gap || 0);
      current += btn.dataset.dir === "next" ? 1 : -1;
      current = Math.max(0, Math.min(current, total - 1));
      track.scrollTo({ left: stepWidth * current, behavior: "smooth" });
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

// ===================================================
// Shop Section + Carousel + WhatsApp Integration
// ===================================================
document.addEventListener("DOMContentLoaded", () => {
  const WHATSAPP_NUMBER = "254700000000";

  // Build WhatsApp links for each card
  document.querySelectorAll(".item-card").forEach((card) => {
    const data = JSON.parse(card.dataset.product || "{}");
    const btn = card.querySelector(".buy");
    if (!btn || !data.name) return;

    const text = `Hello! I'm interested in:
• Product: ${data.name}
• ID: ${data.id || "-"}
• Price: KES ${data.price || "-"}`;
    btn.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      text
    )}`;
    btn.target = "_blank";
    btn.rel = "noopener";
  });

  // Initialize carousels
  const carousels = document.querySelectorAll(".carousel");
  carousels.forEach((carousel) => {
    const track = carousel.querySelector(".track");
    const prev = carousel.querySelector(".nav.prev");
    const next = carousel.querySelector(".nav.next");
    if (!track || !prev || !next) return;

    const getGap = () => parseFloat(getComputedStyle(track).gap || "0") || 0;
    const getStep = () => {
      const card = track.querySelector(".card");
      return card ? card.getBoundingClientRect().width + getGap() : 300;
    };

    const updateDisabled = () => {
      const max = track.scrollWidth - track.clientWidth - 1;
      prev.disabled = track.scrollLeft <= 0;
      next.disabled = track.scrollLeft >= max;
    };

    updateDisabled();
    next.addEventListener("click", () => {
      track.scrollBy({ left: getStep(), behavior: "smooth" });
      setTimeout(updateDisabled, 300);
    });
    prev.addEventListener("click", () => {
      track.scrollBy({ left: -getStep(), behavior: "smooth" });
      setTimeout(updateDisabled, 300);
    });
    track.addEventListener("scroll", updateDisabled, { passive: true });
  });
});

// ===================================================
// Auto-scroll Feature + Partners Marquee + Floating Shapes
// ===================================================

// Auto-scroll top feature
const tfAutoTrack = document.querySelector(".tf-track");
if (tfAutoTrack) {
  let autoScrollAmount = 0;
  const step = 1;
  function autoScroll() {
    const max = tfAutoTrack.scrollWidth - tfAutoTrack.clientWidth;
    autoScrollAmount = (autoScrollAmount + step) % max;
    tfAutoTrack.scrollTo({ left: autoScrollAmount, behavior: "smooth" });
  }
  setInterval(autoScroll, 20);
}

// Continuous scroll animation (Top Feature)
const tfTrack = document.querySelector(".tf-track");
let scrollSpeed = 0.7;
let position = 0;
function animate() {
  if (!tfTrack) return;
  position -= scrollSpeed;
  if (Math.abs(position) >= tfTrack.scrollWidth / 2) position = 0;
  tfTrack.style.transform = `translateX(${position}px)`;
  requestAnimationFrame(animate);
}
animate();

const tfViewport = document.querySelector(".tf-viewport");
if (tfViewport) {
  tfViewport.addEventListener("mouseenter", () => (scrollSpeed = 0));
  tfViewport.addEventListener("mouseleave", () => (scrollSpeed = 0.5));
}

// ===================================================
// Scroll Animations + Counters
// ===================================================
const animatedCards = document.querySelectorAll("[data-animate]");
function animateOnScroll() {
  const triggerBottom = window.innerHeight * 0.85;
  animatedCards.forEach((card) => {
    if (card.getBoundingClientRect().top < triggerBottom) {
      card.style.opacity = "1";
      card.style.transform = "translateY(0)";
    }
  });
}
window.addEventListener("scroll", animateOnScroll);
window.addEventListener("load", animateOnScroll);

// Facts Counter Animation
document.addEventListener("DOMContentLoaded", () => {
  const facts = document.querySelectorAll(".fact");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const target = +entry.target.dataset.target;
        const numberEl = entry.target.querySelector(".fact-number");
        let count = 0;
        const increment = target / 100;

        const counter = setInterval(() => {
          count += increment;
          if (count >= target) {
            numberEl.textContent = target.toLocaleString();
            clearInterval(counter);
          } else {
            numberEl.textContent = Math.floor(count).toLocaleString();
          }
        }, 15);

        entry.target.style.opacity = 1;
        entry.target.style.transform = "translateY(0)";
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.5 }
  );
  facts.forEach((fact) => observer.observe(fact));
});

// ===================================================
// Partners Logos Marquee (pl)
// ===================================================
(function () {
  const viewports = document.querySelectorAll(".pl-viewport");
  if (!viewports.length) return;

  viewports.forEach((vp) => {
    const track = vp.querySelector(".pl-track");
    if (!track) return;
    const baseItems = Array.from(track.children).map((el) =>
      el.cloneNode(true)
    );

    function build() {
      track.replaceChildren(...baseItems.map((n) => n.cloneNode(true)));
      let w = track.scrollWidth;
      const target = vp.clientWidth * 2.2;
      while (w < target) {
        baseItems.forEach((n) => track.appendChild(n.cloneNode(true)));
        w = track.scrollWidth;
      }
      const pxPerSec = parseInt(track.dataset.speed || "90", 10);
      const duration = w / pxPerSec;
      track.style.setProperty("--pl-duration", `${duration}s`);
    }

    build();
    window.addEventListener("resize", () => {
      clearTimeout(track._r);
      track._r = setTimeout(build, 150);
    });

    let down = false,
      startX = 0,
      startTx = 0;
    track.addEventListener("pointerdown", (e) => {
      down = true;
      startX = e.clientX;
      const m = getComputedStyle(track).transform;
      startTx = m !== "none" ? parseFloat(m.split(",")[4]) : 0;
      track.style.animationPlayState = "paused";
      track.setPointerCapture(e.pointerId);
    });
    track.addEventListener("pointermove", (e) => {
      if (!down) return;
      track.style.transform = `translateX(${startTx + (e.clientX - startX)}px)`;
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

// ===================================================
// Floating Shapes Follow Cursor
// ===================================================
document.addEventListener("mousemove", (e) => {
  const shapes = document.querySelectorAll(".floating-shape");
  shapes.forEach((shape, i) => {
    const speed = (i + 1) * 0.05;
    shape.style.transform = `translate(${e.clientX * speed}px, ${
      e.clientY * speed
    }px)`;
  });
});
// =================================================================
// Map Cards For The Horizontal scroll for both Videos and Articles
// =================================================================

// videos
fetch("data/media.json")
  .then((response) => response.json())
  .then((data) => {
    videos = data;
    buildVideoCards(videos);
  })
  .catch((error) => console.error("Error loading videos:", error));

function buildVideoCards(videos) {
  const track = document.querySelector(".videos-track");
  track.innerHTML = "";

  videos.forEach((video) => {
    const li = document.createElement("li");
    li.className = `video-card ${video.background_color}`;

    li.innerHTML = `
      <article>
        <div class="image-container">
          <img src="${video.image_url}" alt="${video.alt_text}" />
          <button class="about-play" type="button" data-video="${video.video_url}">
            <svg width="26" height="26" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7-11-7z" fill="currentColor" />
            </svg>
          </button>
        </div>
        <div class="content">
          <header>
            <h4 class="tag">${video.tag}</h4>
            <h3><a href="${video.link}">${video.title}</a></h3>
            <p class="meta">
              <small>${video.date}</small> | <small>${video.source}</small>
            </p>
          </header>
        </div>
      </article>
    `;

    track.appendChild(li);
  });
}

// articles
fetch("data/articles.json")
  .then((response) => response.json())
  .then((data) => {
    articles = data;
    buildArticleCards(articles);
  })
  .catch((error) => console.error("Error loading articles:", error));

function buildArticleCards(articles) {
  const track = document.querySelector(".articles-track");

  // Clear existing cards (optional)
  track.innerHTML = "";

  articles.forEach((article) => {
    const li = document.createElement("li");
    li.className = `article-card ${article.background_color}`;

    li.innerHTML = `
      <article>
        <div class="content">
          <header>
            <h4 class="tag">${article.tag}</h4>
            <h3>
              <a href="${article.link}">${article.title}</a>
            </h3>
            <p class="meta">
              <small>${article.date}</small> |
              <small>${article.source}</small> |
              <small>By ${article.author}</small>
            </p>
          </header>
          <main>
            <p>${article.description}</p>
          </main>
        </div>
      </article>
    `;

    track.appendChild(li);
  });
}

// ===================================================
// Horizontal scroll for both Videos and Articles
// ===================================================

document.querySelectorAll(".scroll-wrapper").forEach((wrapper) => {
  const track = wrapper.querySelector(".scroll-track");
  const btnLeft = wrapper.querySelector(".scroll-btn.left");
  const btnRight = wrapper.querySelector(".scroll-btn.right");

  btnLeft.addEventListener("click", () => {
    track.scrollBy({ left: -300, behavior: "smooth" });
  });

  btnRight.addEventListener("click", () => {
    track.scrollBy({ left: 300, behavior: "smooth" });
  });
});
