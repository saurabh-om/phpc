/* PESHAS / PHPC — site behaviour. Vanilla JS, no dependencies. */
(function () {
  "use strict";
  var doc = document, body = doc.body;
  var header = doc.querySelector(".site-header");
  var toggle = doc.querySelector(".navtoggle");
  var nav = doc.querySelector(".nav");
  var overHero = body.hasAttribute("data-hero"); // header starts transparent

  /* --- Header state: transparent over hero, solid after scroll --- */
  function setHeaderState() {
    if (!header) return;
    var scrolled = window.scrollY > 40;
    if (overHero && !scrolled) {
      header.classList.add("is-top");
      header.classList.remove("is-solid");
    } else {
      header.classList.add("is-solid");
      header.classList.remove("is-top");
    }
  }
  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });

  /* --- Mobile nav --- */
  if (toggle) {
    toggle.setAttribute("aria-expanded", "false");
    toggle.addEventListener("click", function () {
      var open = body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav && nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        body.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* --- Scroll reveal --- */
  var reveals = [].slice.call(doc.querySelectorAll(".reveal"));
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) {
    reveals.forEach(function (el) { el.classList.add("in"); });
  } else if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* --- Collections: highlight active category in sub-nav --- */
  var catLinks = [].slice.call(doc.querySelectorAll(".catnav a"));
  var sections = catLinks
    .map(function (a) { return doc.querySelector(a.getAttribute("href")); })
    .filter(Boolean);
  if (catLinks.length && sections.length && "IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          var id = "#" + en.target.id;
          catLinks.forEach(function (a) {
            a.classList.toggle("active", a.getAttribute("href") === id);
          });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* --- Slider (cluster moments) --- */
  var slider = doc.querySelector("[data-slider]");
  if (slider) {
    var slides = [].slice.call(slider.querySelectorAll(".slide"));
    var dotsWrap = slider.querySelector(".slider__dots");
    var prev = slider.querySelector(".slider__arrow--prev");
    var next = slider.querySelector(".slider__arrow--next");
    var idx = 0, timer = null, DELAY = 5000;

    if (slides.length) {
      slider.classList.add("is-ready");
      var dots = slides.map(function (s, i) {
        var b = doc.createElement("button");
        b.type = "button";
        b.setAttribute("aria-label", "Go to photo " + (i + 1));
        b.addEventListener("click", function () { go(i); restart(); });
        dotsWrap.appendChild(b);
        return b;
      });

      var show = function (n) {
        idx = (n + slides.length) % slides.length;
        slides.forEach(function (s, i) { s.classList.toggle("is-active", i === idx); });
        dots.forEach(function (d, i) { d.classList.toggle("is-active", i === idx); });
      };
      var go = show;
      var nextFn = function () { show(idx + 1); };

      if (prev) prev.addEventListener("click", function () { show(idx - 1); restart(); });
      if (next) next.addEventListener("click", function () { show(idx + 1); restart(); });

      var motionOk = !(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
      var start = function () { if (motionOk && slides.length > 1) timer = setInterval(nextFn, DELAY); };
      var stop = function () { if (timer) { clearInterval(timer); timer = null; } };
      function restart() { stop(); start(); }

      slider.addEventListener("mouseenter", stop);
      slider.addEventListener("mouseleave", start);
      slider.addEventListener("focusin", stop);
      slider.addEventListener("focusout", start);
      doc.addEventListener("visibilitychange", function () { doc.hidden ? stop() : start(); });

      show(0);
      start();
    }
  }

  /* --- Footer year --- */
  var y = doc.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
