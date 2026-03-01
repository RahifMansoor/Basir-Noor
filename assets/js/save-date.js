(() => {
  const canvas = document.getElementById("scratchCanvas");
  const stage = document.getElementById("scratchStage");
  const countdown = document.getElementById("countdown");
  const roseLayer = document.getElementById("roseLayer");
  const audio = document.getElementById("saveDateAudio");
  const musicToggle = document.getElementById("musicToggle");

  if (!canvas || !stage || !countdown || !roseLayer) return;

  const targetDate = new Date("2026-10-09T00:00:00");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  let drawing = false;
  let revealed = false;
  let lastPoint = null;
  let heartMask = null;
  let heartMaskCount = 0;
  let maskWidth = 0;
  let maskHeight = 0;
  let lastTrailAt = 0;
  const petalColors = [
    "#ffe8f1",
    "#ffd5e8",
    "#ffc6df",
    "#fbb2d1",
    "#f59bc1",
    "#ef87b4",
    "#e775aa"
  ];

  const heartPath = (context, x, y, size) => {
    context.beginPath();
    context.moveTo(x, y + size / 4);
    context.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + size / 4);
    context.bezierCurveTo(x - size / 2, y + size / 2, x, y + size * 0.82, x, y + size);
    context.bezierCurveTo(x, y + size * 0.82, x + size / 2, y + size / 2, x + size / 2, y + size / 4);
    context.bezierCurveTo(x + size / 2, y, x, y, x, y + size / 4);
    context.closePath();
  };

  const drawMask = () => {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(280, Math.floor(rect.width));
    const height = Math.max(180, Math.floor(rect.height));
    const ratio = window.devicePixelRatio || 1;
    const heartX = width / 2;
    const heartY = Math.max(8, height * 0.05);
    const heartSize = Math.min(width * 0.7, height * 0.86);

    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);

    // Keep the full overlay opaque so hidden text never leaks around the heart.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    // Build a rose-petal heart texture instead of a gold fill.
    ctx.save();
    heartPath(ctx, heartX, heartY, heartSize);
    ctx.clip();

    const roseBase = ctx.createLinearGradient(0, 0, width, height);
    roseBase.addColorStop(0, "#ffd9e7");
    roseBase.addColorStop(0.5, "#f8bcd4");
    roseBase.addColorStop(1, "#ef9fc0");
    ctx.fillStyle = roseBase;
    ctx.fillRect(0, 0, width, height);

    const petalPalette = [
      "#ffe8f1",
      "#ffd5e8",
      "#ffc6df",
      "#fbb2d1",
      "#f59bc1",
      "#ef87b4",
      "#e775aa"
    ];

    for (let i = 0; i < 1700; i += 1) {
      const px = Math.random() * width;
      const py = Math.random() * height;
      const rw = 1.7 + Math.random() * 5.3;
      const rh = 1.2 + Math.random() * 3.7;
      const rot = Math.random() * Math.PI;
      const tone = petalPalette[Math.floor(Math.random() * petalPalette.length)];
      const alpha = 0.3 + Math.random() * 0.55;

      ctx.fillStyle = `${tone}${Math.round(alpha * 255).toString(16).padStart(2, "0")}`;
      ctx.beginPath();
      ctx.ellipse(px, py, rw, rh, rot, 0, Math.PI * 2);
      ctx.fill();
    }

    for (let i = 0; i < 260; i += 1) {
      const px = Math.random() * width;
      const py = Math.random() * height;
      const glow = 0.8 + Math.random() * 1.7;
      ctx.fillStyle = `rgba(255, 244, 248, ${0.28 + Math.random() * 0.3})`;
      ctx.beginPath();
      ctx.arc(px, py, glow, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    ctx.strokeStyle = "rgba(219, 121, 162, 0.5)";
    ctx.lineWidth = 1.5;
    heartPath(ctx, heartX, heartY, heartSize);
    ctx.stroke();

    const maskCanvas = document.createElement("canvas");
    maskCanvas.width = width;
    maskCanvas.height = height;
    const maskCtx = maskCanvas.getContext("2d");
    maskCtx.clearRect(0, 0, width, height);
    maskCtx.fillStyle = "#000";
    heartPath(maskCtx, heartX, heartY, heartSize);
    maskCtx.fill();

    const image = maskCtx.getImageData(0, 0, width, height).data;
    const pixels = width * height;
    heartMask = new Uint8Array(pixels);
    heartMaskCount = 0;
    maskWidth = width;
    maskHeight = height;

    for (let p = 0; p < pixels; p += 1) {
      const alpha = image[p * 4 + 3];
      if (alpha > 20) {
        heartMask[p] = 1;
        heartMaskCount += 1;
      }
    }
  };

  const pointFromEvent = (event) => {
    const rect = canvas.getBoundingClientRect();
    if (event.touches && event.touches[0]) {
      return { x: event.touches[0].clientX - rect.left, y: event.touches[0].clientY - rect.top };
    }
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const makeRoseParticle = ({
    x,
    y,
    cls = "",
    sizeMin = 12,
    sizeMax = 20,
    xSpread = 80,
    yRiseMin = 50,
    yRiseMax = 120,
    delayMax = 0.15
  }) => {
    const rose = document.createElement("span");
    rose.className = `rose-particle ${cls}`.trim();
    const size = sizeMin + Math.random() * (sizeMax - sizeMin);
    rose.style.left = `${x}px`;
    rose.style.top = `${y}px`;
    rose.style.setProperty("--petal-size", `${size}px`);
    rose.style.setProperty("--petal-color", petalColors[Math.floor(Math.random() * petalColors.length)]);
    rose.style.animationDelay = `${Math.random() * delayMax}s`;
    rose.style.setProperty("--rose-x", `${(Math.random() - 0.5) * xSpread}px`);
    rose.style.setProperty("--rose-y", `${-(yRiseMin + Math.random() * (yRiseMax - yRiseMin))}px`);
    rose.style.setProperty("--rose-rot", `${(Math.random() - 0.5) * 200}deg`);
    roseLayer.appendChild(rose);

    window.setTimeout(() => {
      rose.remove();
    }, 2600);
  };

  const spawnSwipePetals = (x, y) => {
    const now = performance.now();
    if (now - lastTrailAt < 35) return;
    lastTrailAt = now;

    const canvasRect = canvas.getBoundingClientRect();
    const layerRect = roseLayer.getBoundingClientRect();
    const layerX = x + (canvasRect.left - layerRect.left);
    const layerY = y + (canvasRect.top - layerRect.top);

    const count = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < count; i += 1) {
      makeRoseParticle({
        x: layerX + (Math.random() - 0.5) * 24,
        y: layerY + (Math.random() - 0.5) * 20,
        cls: "trail",
        sizeMin: 10,
        sizeMax: 16,
        xSpread: 42,
        yRiseMin: 24,
        yRiseMax: 72,
        delayMax: 0.05
      });
    }
  };

  const scratchAt = (event) => {
    if (revealed) return;
    const { x, y } = pointFromEvent(event);
    const prevPoint = lastPoint;
    const xi = Math.floor(x);
    const yi = Math.floor(y);

    if (!heartMask || xi < 0 || yi < 0 || xi >= maskWidth || yi >= maskHeight) return;
    if (!heartMask[yi * maskWidth + xi]) return;

    lastPoint = { x, y };

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 70, 0, Math.PI * 2);
    ctx.fill();

    if (prevPoint) {
      ctx.lineWidth = 140;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(prevPoint.x, prevPoint.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    ctx.globalCompositeOperation = "source-over";
    spawnSwipePetals(x, y);
  };

  const roseBurst = () => {
    roseLayer.innerHTML = "";
    const rect = roseLayer.getBoundingClientRect();
    const centerX = rect.width * 0.5;
    const centerY = rect.height * 0.42;
    const count = Math.max(50, Math.floor(rect.width / 6));

    for (let i = 0; i < count; i += 1) {
      makeRoseParticle({
        x: centerX + (Math.random() - 0.5) * 60,
        y: centerY + (Math.random() - 0.5) * 38,
        cls: "poof",
        sizeMin: 13,
        sizeMax: 24,
        xSpread: rect.width * 1.1,
        yRiseMin: 90,
        yRiseMax: 190,
        delayMax: 0.24
      });
    }

    const poof = document.createElement("span");
    poof.className = "rose-poof-core";
    poof.style.left = `${centerX}px`;
    poof.style.top = `${centerY}px`;
    roseLayer.appendChild(poof);
    window.setTimeout(() => poof.remove(), 1000);
  };

  const revealCheck = () => {
    if (revealed || !heartMask || !heartMaskCount) return;

    const samples = ctx.getImageData(0, 0, maskWidth, maskHeight).data;
    let cleared = 0;
    const total = heartMaskCount;

    for (let p = 0; p < heartMask.length; p += 1) {
      if (!heartMask[p]) continue;
      if (samples[p * 4 + 3] < 25) cleared += 1;
    }

    if (cleared / total > 0.9) {
      revealed = true;
      canvas.style.transition = "opacity 650ms ease";
      canvas.style.opacity = "0";
      canvas.style.pointerEvents = "none";
      roseBurst();
    }
  };

  const tickCountdown = () => {
    const now = new Date();
    const diff = targetDate.getTime() - now.getTime();

    if (diff <= 0) {
      countdown.textContent = "Today is the day.";
      return;
    }

    const totalHours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(totalHours / 24);
    const hours = totalHours % 24;
    const minutes = Math.floor((diff / (1000 * 60)) % 60);

    countdown.textContent = `${days} days, ${hours} hours, ${minutes} minutes to go`;
  };

  const updateMusicButton = () => {
    if (!musicToggle || !audio) return;
    musicToggle.textContent = audio.paused ? "Play Music" : "Pause Music";
  };

  const startMusic = async () => {
    if (!audio) return;
    try {
      await audio.play();
    } catch (_error) {
      // Browser blocked autoplay; user can start from toggle.
    } finally {
      updateMusicButton();
    }
  };

  const startDraw = (event) => {
    drawing = true;
    lastPoint = null;
    scratchAt(event);
    revealCheck();
  };

  const moveDraw = (event) => {
    if (!drawing) return;
    event.preventDefault();
    scratchAt(event);
    revealCheck();
  };

  const stopDraw = () => {
    drawing = false;
    lastPoint = null;
  };

  drawMask();
  tickCountdown();
  updateMusicButton();
  startMusic();
  window.addEventListener("load", startMusic, { once: true });

  canvas.addEventListener("pointerdown", startDraw);
  canvas.addEventListener("pointermove", moveDraw);
  window.addEventListener("pointerup", stopDraw);

  canvas.addEventListener("touchstart", startDraw, { passive: false });
  canvas.addEventListener("touchmove", moveDraw, { passive: false });
  window.addEventListener("touchend", stopDraw);

  if (musicToggle && audio) {
    musicToggle.addEventListener("click", async () => {
      if (audio.paused) {
        await startMusic();
      } else {
        audio.pause();
        updateMusicButton();
      }
    });
  }

  window.addEventListener("resize", drawMask);
  window.setInterval(tickCountdown, 1000 * 30);
})();
