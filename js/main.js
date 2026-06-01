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

  /* --- Footer year --- */
  var y = doc.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
