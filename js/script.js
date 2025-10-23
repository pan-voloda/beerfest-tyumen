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

    document.querySelectorAll("[data-ru-content][data-en-content]").forEach((el) => {
      const value = lang === "en" ? el.dataset.enContent : el.dataset.ruContent;
      if (value !== undefined) {
        el.setAttribute("content", value);
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

// Active navigation state based on scroll position
(function () {
  const navLinks = Array.from(document.querySelectorAll(".nav a[href^='#']"));
  if (!navLinks.length) return;

  const sections = navLinks
    .map((link) => {
      const id = link.getAttribute("href");
      if (!id) return null;
      const target = document.querySelector(id);
      if (!target) return null;
      return { link, target };
    })
    .filter(Boolean);

  if (!sections.length) return;

  const setActiveLink = (activeLink) => {
    sections.forEach(({ link }) => {
      const isActive = link === activeLink;
      link.classList.toggle("is-active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  };

  if (typeof IntersectionObserver !== "function") {
    setActiveLink(sections[0].link);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const match = sections.find((item) => item.target === entry.target);
          if (match) {
            setActiveLink(match.link);
          }
        }
      });
    },
    { rootMargin: "-55% 0px -40% 0px", threshold: 0 }
  );

  sections.forEach(({ target }) => observer.observe(target));

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      setActiveLink(link);
    });
  });

  setActiveLink(sections[0].link);
})();

// Reveal on scroll (gallery images)
(function () {
  const images = document.querySelectorAll(".gallery img");
  if (!images.length) return;

  const mediaQuery = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;

  const revealImmediately = () => {
    images.forEach((img) => img.classList.add("visible"));
  };

  if (mediaQuery?.matches) {
    revealImmediately();
    return;
  }

  if (typeof IntersectionObserver !== "function") {
    revealImmediately();
    return;
  }

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

  images.forEach((img) => obs.observe(img));

  const handleMotionChange = (event) => {
    if (event.matches) {
      obs.disconnect();
      revealImmediately();
    }
  };

  mediaQuery?.addEventListener?.("change", handleMotionChange);
  mediaQuery?.addListener?.(handleMotionChange);
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
  const requiredFields = Array.from(form.querySelectorAll("input[required], textarea[required]"));
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

  const getLang = () => (document.documentElement.getAttribute("lang") === "en" ? "en" : "ru");

  const getErrorElement = (field) => field.closest(".form-field")?.querySelector(".error-message");

  const getMessageKey = (type, lang) => {
    if (type === "invalid") {
      return lang === "en" ? "enInvalid" : "ruInvalid";
    }
    return lang === "en" ? "enRequired" : "ruRequired";
  };

  const applyErrorMessage = (errorEl, type, lang) => {
    if (!errorEl) return;
    const key = getMessageKey(type, lang);
    const fallbackKey = getMessageKey("required", lang);
    errorEl.textContent = errorEl.dataset[key] || errorEl.dataset[fallbackKey] || "";
  };

  const setFieldError = (field, type) => {
    const lang = getLang();
    const errorEl = getErrorElement(field);
    field.classList.add("invalid");
    field.setAttribute("aria-invalid", "true");
    if (errorEl) {
      errorEl.dataset.state = type;
      applyErrorMessage(errorEl, type, lang);
    }
  };

  const clearFieldError = (field) => {
    const errorEl = getErrorElement(field);
    field.classList.remove("invalid");
    field.removeAttribute("aria-invalid");
    if (errorEl) {
      delete errorEl.dataset.state;
      errorEl.textContent = "";
    }
  };

  const validateField = (field) => {
    const value = field.value.trim();
    if (!value) {
      return { valid: false, type: "required" };
    }
    if (field.type === "email" && !emailPattern.test(value)) {
      return { valid: false, type: "invalid" };
    }
    return { valid: true };
  };

  const updateStatus = (type) => {
    if (!statusEl) return;
    const lang = getLang();
    if (type === "clear") {
      statusEl.classList.remove("error");
      statusEl.textContent = "";
      delete statusEl.dataset.state;
      return;
    }

    statusEl.dataset.state = type;
    if (type === "error") {
      statusEl.classList.add("error");
      statusEl.textContent = lang === "en" ? statusEl.dataset.enError : statusEl.dataset.ruError;
    } else if (type === "success") {
      statusEl.classList.remove("error");
      statusEl.textContent = lang === "en" ? statusEl.dataset.enSuccess : statusEl.dataset.ruSuccess;
    }
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    let hasError = false;

    requiredFields.forEach((field) => {
      const result = validateField(field);
      if (!result.valid) {
        setFieldError(field, result.type);
        hasError = true;
      } else {
        clearFieldError(field);
      }
    });

    if (hasError) {
      updateStatus("error");
      return;
    }

    updateStatus("success");
    form.reset();
    requiredFields.forEach(clearFieldError);
    setTimeout(() => updateStatus("clear"), 5000);
  });

  requiredFields.forEach((field) => {
    field.addEventListener("input", () => {
      const result = validateField(field);
      if (result.valid) {
        clearFieldError(field);
      } else if (field.classList.contains("invalid") || field.getAttribute("aria-invalid") === "true") {
        setFieldError(field, result.type);
      }
    });

    field.addEventListener("blur", () => {
      const result = validateField(field);
      if (!result.valid) {
        setFieldError(field, result.type);
      } else {
        clearFieldError(field);
      }
    });
  });

  document.addEventListener("beerfest:lang-change", () => {
    const state = statusEl?.dataset.state;
    if (state) {
      updateStatus(state);
    }
    requiredFields.forEach((field) => {
      const errorEl = getErrorElement(field);
      const errorState = errorEl?.dataset.state;
      if (errorEl && errorState) {
        applyErrorMessage(errorEl, errorState, getLang());
      }
    });
  });
})();
