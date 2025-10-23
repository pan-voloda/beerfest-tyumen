(function () {
  const LANG_KEY = "beerfest_lang";
  const langButtons = document.querySelectorAll(".lang-switch button");

  const applyContent = (lang) => {
    document.querySelectorAll("[data-ru][data-en]").forEach((el) => {
      const value = lang === "en" ? el.dataset.en : el.dataset.ru;
      if (value !== undefined) {
        if (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT") {
          return;
        }
        el.textContent = value;
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

    document.querySelectorAll("select option[data-ru][data-en]").forEach((option) => {
      const value = lang === "en" ? option.dataset.en : option.dataset.ru;
      if (value !== undefined) {
        option.textContent = value;
      }
    });
  };

  const setLanguage = (lang) => {
    const normalized = lang === "en" ? "en" : "ru";
    document.documentElement.setAttribute("lang", normalized);
    langButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.lang === normalized);
    });
    applyContent(normalized);
    localStorage.setItem(LANG_KEY, normalized);
    document.dispatchEvent(new CustomEvent("beerfest:lang-change", { detail: normalized }));
  };

  langButtons.forEach((btn) => {
    btn.addEventListener("click", () => setLanguage(btn.dataset.lang));
  });

  setLanguage(localStorage.getItem(LANG_KEY) || "ru");
})();

(function () {
  const nav = document.querySelector(".nav");
  const toggle = document.querySelector(".nav-toggle");
  if (!nav || !toggle) return;
  const srLabel = toggle.querySelector(".sr-only");

  const currentLang = () => (document.documentElement.getAttribute("lang") === "en" ? "en" : "ru");

  const setToggleLabels = (state) => {
    const lang = currentLang();
    const openLabel = lang === "en" ? toggle.dataset.enAriaLabel : toggle.dataset.ruAriaLabel;
    const closeLabel = lang === "en" ? toggle.dataset.enAriaLabelClose : toggle.dataset.ruAriaLabelClose;
    const openText = srLabel ? (lang === "en" ? srLabel.dataset.en : srLabel.dataset.ru) : "";
    const closeText = srLabel ? (lang === "en" ? srLabel.dataset.enClose : srLabel.dataset.ruClose) : "";

    toggle.setAttribute("aria-label", state === "close" ? closeLabel : openLabel);
    if (srLabel) {
      srLabel.textContent = state === "close" ? closeText : openText;
    }
  };

  const closeNav = () => {
    nav.classList.remove("open");
    toggle.classList.remove("nav-open");
    toggle.setAttribute("aria-expanded", "false");
    setToggleLabels("open");
  };

  const openNav = () => {
    nav.classList.add("open");
    toggle.classList.add("nav-open");
    toggle.setAttribute("aria-expanded", "true");
    setToggleLabels("close");
  };

  toggle.addEventListener("click", () => {
    if (nav.classList.contains("open")) {
      closeNav();
    } else {
      openNav();
    }
  });

  nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeNav));

  window.addEventListener("resize", () => {
    if (window.innerWidth > 960) {
      closeNav();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeNav();
    }
  });

  document.addEventListener("beerfest:lang-change", () => {
    const state = nav.classList.contains("open") ? "close" : "open";
    setToggleLabels(state);
  });

  setToggleLabels("open");
})();

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

  const setActive = (activeLink) => {
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
    setActive(sections[0]?.link);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const match = sections.find((item) => item.target === entry.target);
        if (match) {
          setActive(match.link);
        }
      });
    },
    { rootMargin: "-55% 0px -35% 0px", threshold: 0 }
  );

  sections.forEach(({ target }) => observer.observe(target));
})();

(function () {
  const galleryImages = document.querySelectorAll(".gallery-grid img");
  if (!galleryImages.length) return;

  const mediaQuery = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;

  if (mediaQuery?.matches) {
    galleryImages.forEach((img) => img.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  galleryImages.forEach((img) => observer.observe(img));
})();

(function () {
  const filterButtons = document.querySelectorAll("[data-program-filter]");
  const items = document.querySelectorAll("[data-program-list] article");
  if (!filterButtons.length || !items.length) return;

  const applyFilter = (category) => {
    items.forEach((item) => {
      const match = category === "all" || item.dataset.category === category;
      item.hidden = !match;
    });
  };

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((btn) => btn.classList.toggle("active", btn === button));
      applyFilter(button.dataset.programFilter || "all");
    });
  });
})();

(function () {
  const link = document.querySelector('[data-calendar-download]:not([data-booking-ics])');
  if (!link) return;

  const programEvents = [
    {
      id: "opening-day",
      start: "2025-09-20T09:00:00+05:00",
      end: "2025-09-20T22:00:00+05:00",
      ru: {
        summary: "BeerFest Tyumen — День открытия",
        description: "Оркестр, парад пивоваров, специальные релизы и живая музыка.",
      },
      en: {
        summary: "BeerFest Tyumen — Opening Day",
        description: "Brass band, brewers' parade, special releases and live music.",
      },
    },
    {
      id: "education-saturday",
      start: "2025-09-27T10:00:00+05:00",
      end: "2025-09-27T21:00:00+05:00",
      ru: {
        summary: "BeerFest Tyumen — Образовательная суббота",
        description: "Лекции TU München, панель о безалкогольном пиве и сенсорный практикум.",
      },
      en: {
        summary: "BeerFest Tyumen — Education Saturday",
        description: "TU München lectures, low & no alcohol panel and sensory lab.",
      },
    },
    {
      id: "tasting-weekend",
      start: "2025-10-04T11:00:00+05:00",
      end: "2025-10-04T22:30:00+05:00",
      ru: {
        summary: "BeerFest Tyumen — Дегустационный уикенд",
        description: "Слепые дегустации, pop-up кухни и Tyumen Jazz Collective вечером.",
      },
      en: {
        summary: "BeerFest Tyumen — Tasting weekend",
        description: "Blind tastings, pop-up kitchens and Tyumen Jazz Collective at night.",
      },
    },
  ];

  const generateICS = () => {
    const lang = document.documentElement.getAttribute("lang") === "en" ? "en" : "ru";
    const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//BeerFest Tyumen//Program//RU"];

    programEvents.forEach((event) => {
      const start = new Date(event.start).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
      const end = new Date(event.end).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
      const details = event[lang];
      lines.push("BEGIN:VEVENT");
      lines.push(`UID:${event.id}@beerfest-tyumen`);
      lines.push(`DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`);
      lines.push(`DTSTART:${start}`);
      lines.push(`DTEND:${end}`);
      lines.push(`SUMMARY:${details.summary}`);
      lines.push(`DESCRIPTION:${details.description}`);
      lines.push("LOCATION:City Exhibition Center, Tyumen");
      lines.push("END:VEVENT");
    });

    lines.push("END:VCALENDAR");
    return new Blob([lines.join("\r\n")], { type: "text/calendar" });
  };

  link.addEventListener("click", (event) => {
    event.preventDefault();
    const blob = generateICS();
    const url = URL.createObjectURL(blob);
    const temp = document.createElement("a");
    temp.href = url;
    temp.download = "beerfest-program.ics";
    temp.rel = "noopener";
    temp.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  });
})();

(function () {
  const modal = document.querySelector("[data-booking-modal]");
  if (!modal) return;

  const steps = Array.from(modal.querySelectorAll(".booking-step"));
  const summaryBox = modal.querySelector("[data-booking-summary]");
  const submitBtn = modal.querySelector("[data-booking-submit]");
  const feedback = modal.querySelector(".booking-feedback");
  const icsLink = modal.querySelector("[data-booking-ics]");

  const ticketMap = {
    single: {
      price: 1500,
      ru: { name: "Однодневный", description: "Вход на все зоны" },
      en: { name: "Single day", description: "Access to all areas" },
    },
    weekend: {
      price: 3900,
      ru: { name: "Уикенд-пас", description: "Два дня подряд" },
      en: { name: "Weekend pass", description: "Two consecutive days" },
    },
    premium: {
      price: 7500,
      ru: { name: "Премиум индустрия", description: "Backstage и B2B" },
      en: { name: "Premium industry", description: "Backstage & B2B" },
    },
  };

  const translations = {
    ru: {
      ticket: "Тариф",
      guests: "Гостей",
      date: "Дата",
      contact: "Контакты",
      phone: "Телефон",
      comment: "Комментарий",
      total: "Сумма",
    },
    en: {
      ticket: "Pass",
      guests: "Guests",
      date: "Date",
      contact: "Contact",
      phone: "Phone",
      comment: "Comment",
      total: "Total",
    },
  };

  let currentStep = 0;
  let bookingData = {};

  const openModal = (prefill) => {
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    steps.forEach((step, index) => step.classList.toggle("active", index === 0));
    currentStep = 0;
    bookingData = {
      ticket: prefill?.ticket || "single",
      quantity: prefill?.quantity ? String(prefill.quantity) : "1",
    };
    feedback.dataset.state = "";
    feedback.textContent = "";
    submitBtn.disabled = false;
    icsLink.hidden = true;
    const form1 = modal.querySelector('[data-booking-form-step="1"]');
    form1.reset();
    form1.ticket.value = bookingData.ticket;
    form1.quantity.value = bookingData.quantity;
    const today = new Date().toISOString().split("T")[0];
    form1.visitDate.min = today;
  };

  const closeModal = () => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  modal.querySelectorAll("[data-booking-close]").forEach((btn) => btn.addEventListener("click", closeModal));
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal();
    }
  });

  document.querySelectorAll("[data-booking-open]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const card = trigger.closest("[data-ticket-card]");
      const quantityInput = card?.querySelector("[data-ticket-qty]");
      const quantity = quantityInput ? Number(quantityInput.value) || 1 : 1;
      openModal({
        ticket: trigger.dataset.ticketType || "single",
        quantity,
      });
    });
  });

  modal.querySelectorAll("[data-booking-prev]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (currentStep === 0) return;
      steps[currentStep].classList.remove("active");
      currentStep -= 1;
      steps[currentStep].classList.add("active");
    });
  });

  const showSummary = () => {
    const lang = document.documentElement.getAttribute("lang") === "en" ? "en" : "ru";
    const labels = translations[lang];
    const ticket = ticketMap[bookingData.ticket] || ticketMap.single;
    const total = ticket.price * (Number(bookingData.quantity) || 1);
    const date = bookingData.visitDate ? new Date(bookingData.visitDate) : null;
    const dateFormatted = date
      ? date.toLocaleDateString(lang === "ru" ? "ru-RU" : "en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
      : "";

    summaryBox.innerHTML = `
      <div><strong>${labels.ticket}:</strong> ${ticket[lang].name}</div>
      <div><strong>${labels.guests}:</strong> ${bookingData.quantity}</div>
      <div><strong>${labels.date}:</strong> ${dateFormatted}</div>
      <div><strong>${labels.contact}:</strong> ${bookingData.fullName} — ${bookingData.email}</div>
      <div><strong>${labels.phone}:</strong> ${bookingData.phone}</div>
      <div><strong>${labels.comment}:</strong> ${bookingData.comment || "—"}</div>
      <div><strong>${labels.total}:</strong> ${total.toLocaleString(lang === "ru" ? "ru-RU" : "en-US", { style: "currency", currency: "RUB" })}</div>
    `;
  };

  const form1 = modal.querySelector('[data-booking-form-step="1"]');
  const form2 = modal.querySelector('[data-booking-form-step="2"]');

  form1.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form1);
    bookingData.ticket = data.get("ticket") || "single";
    bookingData.quantity = data.get("quantity") || "1";
    bookingData.visitDate = data.get("visitDate") || "";
    steps[currentStep].classList.remove("active");
    currentStep = 1;
    steps[currentStep].classList.add("active");
  });

  form2.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form2);
    bookingData.fullName = data.get("fullName") || "";
    bookingData.email = data.get("email") || "";
    bookingData.phone = data.get("phone") || "";
    bookingData.comment = data.get("comment") || "";
    steps[currentStep].classList.remove("active");
    currentStep = 2;
    steps[currentStep].classList.add("active");
    showSummary();
  });

  const createICS = () => {
    const lang = document.documentElement.getAttribute("lang") === "en" ? "en" : "ru";
    const ticket = ticketMap[bookingData.ticket] || ticketMap.single;
    if (!bookingData.visitDate) return null;
    const start = new Date(`${bookingData.visitDate}T10:00:00+05:00`);
    const end = new Date(`${bookingData.visitDate}T18:00:00+05:00`);
    const formatDate = (date) => date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//BeerFest Tyumen//Booking//RU",
      "BEGIN:VEVENT",
      `UID:booking-${Date.now()}@beerfest-tyumen`,
      `DTSTAMP:${formatDate(new Date())}`,
      `DTSTART:${formatDate(start)}`,
      `DTEND:${formatDate(end)}`,
      `SUMMARY:${lang === "ru" ? "Бронирование BeerFest Tyumen" : "BeerFest Tyumen booking"}`,
      `DESCRIPTION:${ticket[lang].name} — ${bookingData.quantity} ${lang === "ru" ? "гостей" : "guest(s)"}`,
      "LOCATION:City Exhibition Center, Tyumen",
      "END:VEVENT",
      "END:VCALENDAR",
    ];
    return new Blob([lines.join("\r\n")], { type: "text/calendar" });
  };

  submitBtn.addEventListener("click", async () => {
    submitBtn.disabled = true;
    feedback.dataset.state = "";
    feedback.textContent = "";

    const payload = {
      ...bookingData,
      ticketName: ticketMap[bookingData.ticket]?.ru?.name || bookingData.ticket,
      createdAt: new Date().toISOString(),
    };

    try {
      const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      const blob = createICS();
      if (blob && icsLink) {
        const url = URL.createObjectURL(blob);
        icsLink.href = url;
        icsLink.hidden = false;
        setTimeout(() => URL.revokeObjectURL(url), 120000);
      }

      feedback.dataset.state = "success";
      const lang = document.documentElement.getAttribute("lang") === "en" ? "en" : "ru";
      feedback.textContent = lang === "en" ? feedback.dataset.enSuccess : feedback.dataset.ruSuccess;
    } catch (error) {
      feedback.dataset.state = "error";
      const lang = document.documentElement.getAttribute("lang") === "en" ? "en" : "ru";
      feedback.textContent = lang === "en" ? feedback.dataset.enError : feedback.dataset.ruError;
      submitBtn.disabled = false;
      return;
    }
  });
})();

(function () {
  const form = document.querySelector("[data-newsletter]");
  if (!form) return;
  const feedback = form.querySelector(".form-feedback");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    feedback.dataset.state = "";
    feedback.textContent = "";

    const data = Object.fromEntries(new FormData(form));

    try {
      const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, type: "newsletter" }),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      form.reset();
      feedback.dataset.state = "success";
      const lang = document.documentElement.getAttribute("lang") === "en" ? "en" : "ru";
      feedback.textContent = lang === "en" ? feedback.dataset.enSuccess : feedback.dataset.ruSuccess;
    } catch (error) {
      feedback.dataset.state = "error";
      const lang = document.documentElement.getAttribute("lang") === "en" ? "en" : "ru";
      feedback.textContent = lang === "en" ? feedback.dataset.enError : feedback.dataset.ruError;
    }
  });
})();

(function () {
  const widget = document.querySelector("[data-chat]");
  if (!widget) return;
  const toggle = widget.querySelector(".chat-widget__toggle");
  const panel = widget.querySelector(".chat-widget__panel");
  if (!toggle || !panel) return;

  toggle.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!expanded));
    panel.hidden = expanded;
  });
})();
