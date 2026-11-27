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
    const x = Math.floor(Math.random() * size) - size / 2;   // -128 to 127, within the overhang
    const y = Math.floor(Math.random() * size) - size / 2;
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
    mark.dataset.mark = scrollY > innerHeight * 0.75 ? "shown" : "hidden";
  };
  addEventListener("scroll", () => {
    if (!queued) { queued = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();
})();
