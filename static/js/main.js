// Film grain over the whole page: the texture (static/grain.webp, set in the CSS) jumps to a new
// random spot a few times a second. Holds still when the visitor prefers reduced motion.
(() => {
  const tile = { w: 432, h: 288 };   // size of grain.webp
  const layer = document.createElement("div");
  layer.className = "grain";
  layer.setAttribute("aria-hidden", "true");
  document.body.append(layer);

  const still = matchMedia("(prefers-reduced-motion: reduce)");
  let timer;
  const shift = () => {
    const x = Math.round((Math.random() - 0.5) * tile.w);
    const y = Math.round((Math.random() - 0.5) * tile.h);
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

// The small corner mark shows once the posts have slid up over the big front-page title
// (the title itself never leaves the screen, it holds still underneath).
(() => {
  const mark = document.querySelector(".topbar__mark[data-mark]");
  if (!mark) return;
  let queued = false;
  const update = () => {
    queued = false;
    mark.dataset.mark = scrollY > innerHeight * 0.6 ? "shown" : "hidden";
  };
  addEventListener("scroll", () => {
    if (!queued) { queued = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();
})();

// Front-page film: stays on its poster frame for visitors who prefer reduced motion,
// and pauses while the tab is hidden.
(() => {
  const video = document.querySelector("[data-hero-video]");
  if (!video) return;
  const still = matchMedia("(prefers-reduced-motion: reduce)");
  const sync = () => {
    if (still.matches || document.hidden) video.pause();
    else video.play().catch(() => {});
  };
  sync();
  still.addEventListener("change", sync);
  document.addEventListener("visibilitychange", sync);
})();
