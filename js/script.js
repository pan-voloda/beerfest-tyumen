// Language switcher & content binding
(function () {
  const LANG_KEY = "beerfest_lang";
  const langBtns = document.querySelectorAll(".lang-switch button");

  const applyTextContent = (lang) => {
    document.querySelectorAll("[data-ru][data-en]").forEach((el) => {
      const text = lang === "en" ? el.getAttribute("data-en") : el.getAttribute("data-ru");
      if (text !== null) {
        el.textContent = text;
      }
    });

    document.querySelectorAll("[data-ru-placeholder]").forEach((el) => {
      const value = lang === "en" ? el.dataset.enPlaceholder : el.dataset.ruPlaceholder;
      if (value !== undefined) {
        el.setAttribute("placeholder", value);
      }
    });

    document.querySelectorAll("[data-ru-aria-label]").forEach((el) => {
      const value = lang === "en" ? el.dataset.enAriaLabel : el.dataset.ruAriaLabel;
      if (value !== undefined) {
        el.setAttribute("aria-label", value);
      }
    });

    document.querySelectorAll("[data-ru-success]").forEach((el) => {
      const state = el.dataset.state;
      if (!state) return;
      if (state === "success") {
        el.textContent = lang === "en" ? el.dataset.enSuccess : el.dataset.ruSuccess;
      } else if (state === "error") {
        el.textContent = lang === "en" ? el.dataset.enError : el.dataset.ruError;
      }
    });
  };

  const setLang = (lang) => {
    const normalized = lang === "en" ? "en" : "ru";
    document.documentElement.setAttribute("lang", normalized);
    langBtns.forEach((btn) => btn.classList.toggle("active", btn.dataset.lang === normalized));
    applyTextContent(normalized);
    localStorage.setItem(LANG_KEY, normalized);
    document.dispatchEvent(new CustomEvent("beerfest:lang-change", { detail: normalized }));
  };

  langBtns.forEach((btn) => {
    btn.addEventListener("click", () => setLang(btn.dataset.lang));
  });

  setLang(localStorage.getItem(LANG_KEY) || "ru");
})();

// Mobile navigation toggle
(function () {
  const nav = document.getElementById("primary-nav");
  const toggle = document.querySelector(".nav-toggle");
  if (!nav || !toggle) return;
  const srLabel = toggle.querySelector(".sr-only");

  const getLang = () => (document.documentElement.getAttribute("lang") === "en" ? "en" : "ru");

  const setToggleLabel = (state) => {
    const lang = getLang();
    const openLabel = lang === "en" ? toggle.dataset.enAriaLabel : toggle.dataset.ruAriaLabel;
    const closeLabel = lang === "en" ? toggle.dataset.enAriaLabelClose : toggle.dataset.ruAriaLabelClose;
    const label = state === "close" ? closeLabel : openLabel;
    if (label) {
      toggle.setAttribute("aria-label", label);
    }
    if (srLabel) {
      const openText = lang === "en" ? srLabel.dataset.en : srLabel.dataset.ru;
      const closeText = lang === "en" ? srLabel.dataset.enClose : srLabel.dataset.ruClose;
      srLabel.textContent = state === "close" && closeText ? closeText : openText || "";
    }
  };

  const closeNav = () => {
    nav.classList.remove("open");
    toggle.classList.remove("nav-open");
    toggle.setAttribute("aria-expanded", "false");
    setToggleLabel("open");
  };

  const openNav = () => {
    nav.classList.add("open");
    toggle.classList.add("nav-open");
    toggle.setAttribute("aria-expanded", "true");
    setToggleLabel("close");
  };

  toggle.addEventListener("click", () => {
    if (nav.classList.contains("open")) {
      closeNav();
    } else {
      openNav();
    }
  });

  nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeNav));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeNav();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) {
      closeNav();
    }
  });

  document.addEventListener("beerfest:lang-change", () => {
    const state = nav.classList.contains("open") ? "close" : "open";
    setToggleLabel(state);
  });

  setToggleLabel("open");
})();

// Reveal on scroll (gallery images)
(function () {
  const obs = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );
  document.querySelectorAll(".gallery img").forEach((img) => obs.observe(img));
})();

// Simple lightbox
(function () {
  const lb = document.getElementById("lightbox");
  if (!lb) return;
  const lbImg = lb.querySelector("img");
  const closeBtn = lb.querySelector(".close");
  const close = () => {
    lb.classList.remove("open");
    lb.setAttribute("aria-hidden", "true");
    if (lbImg) {
      lbImg.removeAttribute("src");
      lbImg.removeAttribute("alt");
    }
  };

  document.querySelectorAll(".gallery img").forEach((img) => {
    img.addEventListener("click", () => {
      if (!lbImg) return;
      lbImg.src = img.src;
      lbImg.alt = img.alt || "";
      lb.classList.add("open");
      lb.setAttribute("aria-hidden", "false");
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", close);
  }
  lb.addEventListener("click", (event) => {
    if (event.target === lb) {
      close();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      close();
    }
  });
})();

// Contact form handling
(function () {
  const form = document.querySelector(".contact-form");
  if (!form) return;
  const statusEl = form.querySelector(".form-status");
  const requiredFields = form.querySelectorAll("input[required], textarea[required]");

  const getLang = () => (document.documentElement.getAttribute("lang") === "en" ? "en" : "ru");

  const updateStatus = (type) => {
    if (!statusEl) return;
    const lang = getLang();
    statusEl.dataset.state = type;
    if (type === "error") {
      statusEl.classList.add("error");
      statusEl.textContent = lang === "en" ? statusEl.dataset.enError : statusEl.dataset.ruError;
    } else if (type === "success") {
      statusEl.classList.remove("error");
      statusEl.textContent = lang === "en" ? statusEl.dataset.enSuccess : statusEl.dataset.ruSuccess;
    } else {
      statusEl.classList.remove("error");
      statusEl.textContent = "";
      delete statusEl.dataset.state;
    }
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    let hasError = false;

    requiredFields.forEach((field) => {
      const value = field.value.trim();
      if (!value) {
        field.classList.add("invalid");
        hasError = true;
      } else {
        field.classList.remove("invalid");
      }
    });

    if (hasError) {
      updateStatus("error");
      return;
    }

    updateStatus("success");
    form.reset();
    setTimeout(() => updateStatus("clear"), 5000);
  });

  requiredFields.forEach((field) => {
    field.addEventListener("input", () => {
      if (field.value.trim()) {
        field.classList.remove("invalid");
      }
    });
  });

  document.addEventListener("beerfest:lang-change", () => {
    const state = statusEl?.dataset.state;
    if (!state) return;
    updateStatus(state);
  });
})();
