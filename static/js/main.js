// The page takes the colours of the episode at the middle of the screen, episodes fade in
// as they arrive, and the small corner mark shows once the big wordmark has scrolled away.
(() => {
  const root = document.documentElement;
  const sections = [...document.querySelectorAll("[data-episode]")];
  if (!sections.length || !("IntersectionObserver" in window)) return;

  // Start with the colours of the first section, then let transitions take over
  root.dataset.episode = sections[0].dataset.episode;
  requestAnimationFrame(() => requestAnimationFrame(() => root.setAttribute("data-ready", "")));

  const middle = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) root.dataset.episode = entry.target.dataset.episode;
    }
  }, { rootMargin: "-50% 0px -50% 0px" });

  const seen = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.setAttribute("data-seen", "");
        seen.unobserve(entry.target);
      }
    }
  }, { threshold: 0.15 });

  for (const section of sections) {
    middle.observe(section);
    if (section.classList.contains("episode")) seen.observe(section);
  }

  const mark = document.querySelector(".mark[data-mark]");
  const hero = document.querySelector("[data-hero]");
  if (mark && hero) {
    new IntersectionObserver(([entry]) => {
      mark.dataset.mark = entry.isIntersecting ? "hidden" : "shown";
    }).observe(hero);
  }
})();
