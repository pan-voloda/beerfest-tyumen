// Language switcher & content binding
(function(){
  const LANG_KEY = "beerfest_lang";
  const langBtns = document.querySelectorAll(".lang-switch button");
  const setLang = (lang) => {
    document.documentElement.setAttribute("lang", lang === "en" ? "en" : "ru");
    langBtns.forEach(b => b.classList.toggle("active", b.dataset.lang === lang));
    // Replace all elements with data-ru/data-en
    document.querySelectorAll("[data-ru]").forEach(el => {
      const text = lang === "en" ? el.getAttribute("data-en") : el.getAttribute("data-ru");
      if (text !== null) el.textContent = text;
    });
    localStorage.setItem(LANG_KEY, lang);
  };
  langBtns.forEach(b => b.addEventListener("click", () => setLang(b.dataset.lang)));
  setLang(localStorage.getItem(LANG_KEY) || "ru");
})();

// Reveal on scroll (gallery images)
(function(){
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if(e.isIntersecting){
        e.target.classList.add("visible");
        obs.unobserve(e.target);
      }
    });
  }, { threshold: .2 });
  document.querySelectorAll(".gallery img").forEach(img => obs.observe(img));
})();

// Simple lightbox
(function(){
  const lb = document.getElementById("lightbox");
  const lbImg = lb.querySelector("img");
  const closeBtn = lb.querySelector(".close");
  document.querySelectorAll(".gallery img").forEach(img => {
    img.addEventListener("click", () => {
      lbImg.src = img.src;
      lb.classList.add("open");
      lb.setAttribute("aria-hidden", "false");
    });
  });
  const close = () => {
    lb.classList.remove("open");
    lb.setAttribute("aria-hidden", "true");
    lbImg.src = "";
  };
  closeBtn.addEventListener("click", close);
  lb.addEventListener("click", (e)=>{ if(e.target===lb) close(); });
  document.addEventListener("keydown", (e)=>{ if(e.key==="Escape") close(); });
})();