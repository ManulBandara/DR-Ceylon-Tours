const navLinks = document.querySelectorAll(".nav__link");
const navLinksContainer = document.getElementById("navLinks");
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const navProgress = document.getElementById("navProgress");

// Mobile menu toggle
if (mobileMenuBtn && navLinksContainer) {
  mobileMenuBtn.addEventListener("click", () => {
    const isOpen = navLinksContainer.classList.toggle("nav__links--open");
    mobileMenuBtn.setAttribute("aria-expanded", isOpen);
  });

  // Close menu when clicking a link
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navLinksContainer.classList.remove("nav__links--open");
      mobileMenuBtn.setAttribute("aria-expanded", "false");
    });
  });

  // Close menu when clicking outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".nav") && navLinksContainer.classList.contains("nav__links--open")) {
      navLinksContainer.classList.remove("nav__links--open");
      mobileMenuBtn.setAttribute("aria-expanded", "false");
    }
  });
}

// Scroll progress indicator
if (navProgress) {
  window.addEventListener("scroll", () => {
    const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    navProgress.style.width = scrolled + "%";
  });
}

// Highlight active section on scroll
const sections = document.querySelectorAll("main section[id]");
const observerNav = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const id = entry.target.getAttribute("id");
      if (!id) return;

      const navLink = document.querySelector(`.nav__link[href="#${id}"]`);
      if (!navLink) return;

      if (entry.isIntersecting) {
        navLinks.forEach((l) => l.classList.remove("nav__link--active"));
        navLink.classList.add("nav__link--active");
      }
    });
  },
  { threshold: 0.3, rootMargin: "-80px 0px -60% 0px" }
);

sections.forEach((section) => observerNav.observe(section));

// =========================================================
// BACK TO TOP BUTTON
// =========================================================

const backToTopBtn = document.getElementById("backToTop");

if (backToTopBtn) {
  window.addEventListener("scroll", () => {
    if (window.scrollY > 400) {
      backToTopBtn.classList.add("back-to-top--show");
    } else {
      backToTopBtn.classList.remove("back-to-top--show");
    }
  });

  backToTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// =========================================================
// STATS COUNTER ANIMATION
// =========================================================

const statNumbers = document.querySelectorAll(".stats__number");

function animateCounter(el, target) {
  const isDecimal = target % 1 !== 0;
  const duration = 2000;
  const start = 0;
  const startTime = performance.now();

  function step(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const easeOutQuad = 1 - (1 - progress) * (1 - progress);
    const value = start + (target - start) * easeOutQuad;

    if (isDecimal) {
      el.textContent = value.toFixed(1);
    } else {
      el.textContent = Math.round(value).toLocaleString();
    }

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

if (statNumbers.length) {
  const statsObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        statNumbers.forEach((el) => {
          const target = parseFloat(el.dataset.target || el.textContent.replace(/,/g, ""));
          if (!isNaN(target)) {
            animateCounter(el, target);
          }
        });

        obs.disconnect();
      });
    },
    { threshold: 0.4 }
  );

  const statsSection = document.querySelector(".stats");
  if (statsSection) statsObserver.observe(statsSection);
}

// =========================================================
// FAQ ACCORDION
// =========================================================

const faqItems = document.querySelectorAll(".faq__item");

faqItems.forEach((item) => {
  const btn = item.querySelector(".faq__question");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const isOpen = item.classList.contains("faq__item--open");

    // Close all other items
    faqItems.forEach((i) => {
      i.classList.remove("faq__item--open");
      const button = i.querySelector(".faq__question");
      if (button) button.setAttribute("aria-expanded", "false");
    });

    // Toggle current item
    if (!isOpen) {
      item.classList.add("faq__item--open");
      btn.setAttribute("aria-expanded", "true");
    }
  });
});

// =========================================================
// CONTACT FORM VALIDATION & WHATSAPP INTEGRATION
// =========================================================

const contactForm = document.getElementById("quickContactForm");
const successMessage = document.getElementById("successMessage");

// Real-time validation function
function validateField(group) {
  const input = group.querySelector("input, select, textarea");
  if (!input) return true;

  // Required field validation
  if (input.hasAttribute("required") && !input.value.trim()) {
    group.classList.add("form__group--error");
    return false;
  }

  // Email validation
  if (input.type === "email" && input.value.trim()) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(input.value.trim())) {
      group.classList.add("form__group--error");
      return false;
    }
  }

  // Phone validation (optional but if filled, must be valid)
  if (input.type === "tel" && input.value.trim()) {
    const phonePattern = /^[+]?[0-9\s-()]+$/;
    if (!phonePattern.test(input.value.trim())) {
      group.classList.add("form__group--error");
      return false;
    }
  }

  group.classList.remove("form__group--error");
  return true;
}

// Validate entire form
function validateForm(form) {
  const groups = form.querySelectorAll(".form__group");
  let isValid = true;

  groups.forEach((group) => {
    const fieldIsValid = validateField(group);
    if (!fieldIsValid) isValid = false;
  });

  return isValid;
}

if (contactForm) {
  // Form submission
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!validateForm(contactForm)) {
      // Scroll to first error
      const firstError = contactForm.querySelector(".form__group--error");
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
        firstError.querySelector("input, select, textarea")?.focus();
      }
      return;
    }

    // Collect form data
    const formData = new FormData(contactForm);
    const name = formData.get("name") || "";
    const email = formData.get("email") || "";
    const phone = formData.get("phone") || "";
    const service = formData.get("service") || "";
    const message = formData.get("message") || "";

    // Build WhatsApp message
    const parts = [];
    if (name) parts.push(`Name: ${name}`);
    if (email) parts.push(`Email: ${email}`);
    if (phone) parts.push(`Phone/WhatsApp: ${phone}`);
    if (service) parts.push(`Service: ${service}`);
    if (message) parts.push(`Message: ${message}`);

    const text = `🌴 New inquiry from DR Ceylon Tours website:%0A%0A${parts.join("%0A")}`;
    const waNumber = "94701914681";
    const waUrl = `https://wa.me/${waNumber}?text=${text}`;

    // Open WhatsApp
    window.open(waUrl, "_blank", "noopener,noreferrer");

    // Reset form
    contactForm.reset();

    // Show success message
    if (successMessage) {
      successMessage.classList.add("alert--show");
      setTimeout(() => {
        successMessage.classList.remove("alert--show");
      }, 5000);
    }

    // Analytics tracking (if you have GA or similar)
    if (typeof gtag !== "undefined") {
      gtag("event", "form_submit", {
        event_category: "Contact",
        event_label: service || "General Inquiry"
      });
    }
  });

  // Real-time validation on input
  contactForm.querySelectorAll("input, select, textarea").forEach((el) => {
    el.addEventListener("input", () => {
      const group = el.closest(".form__group");
      if (!group) return;
      validateField(group);
    });

    // Also validate on blur
    el.addEventListener("blur", () => {
      const group = el.closest(".form__group");
      if (!group) return;
      validateField(group);
    });
  });
}

// =========================================================
// IMAGE LAZY LOADING ENHANCEMENT
// =========================================================

const lazyImages = document.querySelectorAll('img[loading="lazy"]');

if ("IntersectionObserver" in window && lazyImages.length) {
  const imageObserver = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const img = entry.target;

        // Add loaded class when image actually loads
        img.addEventListener(
          "load",
          () => {
            img.classList.add("is-loaded");
          },
          { once: true }
        );

        // If image is already cached, add class immediately
        if (img.complete) {
          img.classList.add("is-loaded");
        }

        obs.unobserve(img);
      });
    },
    { rootMargin: "100px" }
  );

  lazyImages.forEach((img) => imageObserver.observe(img));
}

// =========================================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// =========================================================

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const href = this.getAttribute("href");

    // Ignore empty hrefs or just "#"
    if (!href || href === "#") return;

    const targetElement = document.querySelector(href);
    if (targetElement) {
      e.preventDefault();
      targetElement.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  });
});

// =========================================================
// CARD ENTRANCE ANIMATION
// =========================================================

const cards = document.querySelectorAll(".card");

if (cards.length && "IntersectionObserver" in window) {
  const cardObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
          }, index * 100);
          cardObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
  );

  cards.forEach((card) => {
    card.style.opacity = "0";
    card.style.transform = "translateY(30px)";
    card.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    cardObserver.observe(card);
  });
}

// =========================================================
// WHATSAPP FLOAT BUTTON ANALYTICS
// =========================================================

const whatsappFloat = document.querySelector(".whatsapp-float");
if (whatsappFloat) {
  whatsappFloat.addEventListener("click", () => {
    if (typeof gtag !== "undefined") {
      gtag("event", "click", {
        event_category: "WhatsApp",
        event_label: "Floating Button"
      });
    }
  });
}

// =========================================================
// PERFORMANCE MONITORING (Optional)
// =========================================================

// Log performance metrics to console (remove in production)
if (window.performance && console.table) {
  window.addEventListener("load", () => {
    setTimeout(() => {
      const perfData = window.performance.timing;
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
      const connectTime = perfData.responseEnd - perfData.requestStart;
      const renderTime = perfData.domComplete - perfData.domLoading;

      console.log("📊 Page Performance:");
      console.table({
        "Page Load Time": `${pageLoadTime}ms`,
        "Server Response": `${connectTime}ms`,
        "Render Time": `${renderTime}ms`
      });
    }, 0);
  });
}

// =========================================================
// ACCESSIBILITY: KEYBOARD NAVIGATION IMPROVEMENTS
// =========================================================

// Trap focus in mobile menu when open
if (navLinksContainer && mobileMenuBtn) {
  const focusableElements = navLinksContainer.querySelectorAll(
    'a[href], button:not([disabled])'
  );
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  navLinksContainer.addEventListener("keydown", (e) => {
    if (e.key !== "Tab" || !navLinksContainer.classList.contains("nav__links--open")) return;

    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        lastFocusable.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        firstFocusable.focus();
        e.preventDefault();
      }
    }
  });
}

// ESC key to close mobile menu
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && navLinksContainer?.classList.contains("nav__links--open")) {
    navLinksContainer.classList.remove("nav__links--open");
    mobileMenuBtn?.setAttribute("aria-expanded", "false");
    mobileMenuBtn?.focus();
  }
});

// =========================================================
// COOKIE CONSENT (Optional - Uncomment if needed)
// =========================================================

/*
function initCookieConsent() {
  const cookieConsent = localStorage.getItem("cookieConsent");

  if (!cookieConsent) {
    // Show cookie banner
    const banner = document.createElement("div");
    banner.className = "cookie-banner";
    banner.innerHTML = `
      <p>We use cookies to improve your experience. <a href="#privacy">Learn more</a></p>
      <button onclick="acceptCookies()">Accept</button>
    `;
    document.body.appendChild(banner);
  }
}

function acceptCookies() {
  localStorage.setItem("cookieConsent", "true");
  document.querySelector(".cookie-banner")?.remove();
}

// Uncomment to enable:
// initCookieConsent();
*/

console.log("✅ DR Ceylon Tours - Enhanced JavaScript Loaded");