// Film grain over the whole page: a canvas tile of random dark and light specks, shifted to a
// new random spot a few times a second. Holds still when the visitor prefers reduced motion.
(() => {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  const img = ctx.createImageData(size, size);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const r = Math.random();
    const v = r < 0.8 ? 0 : 255;                 // mostly dark specks, some light ones
    d[i] = d[i + 1] = d[i + 2] = v;
    d[i + 3] = Math.random() < 0.55 ? Math.random() * 200 : 0;
  }
  ctx.putImageData(img, 0, 0);

  const layer = document.createElement("div");
  layer.className = "grain";
  layer.setAttribute("aria-hidden", "true");
  layer.style.backgroundImage = `url(${canvas.toDataURL("image/png")})`;
  document.body.append(layer);

  const still = matchMedia("(prefers-reduced-motion: reduce)");
  let timer;
  const shift = () => {
    const x = Math.floor(Math.random() * size);
    const y = Math.floor(Math.random() * size);
    layer.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };
  const run = () => {
    clearInterval(timer);
    if (!still.matches) timer = setInterval(shift, 1000 / 12);   // 12 fps, like film
  };
  run();
  still.addEventListener("change", run);
  document.addEventListener("visibilitychange", () => (document.hidden ? clearInterval(timer) : run()));
})();

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
