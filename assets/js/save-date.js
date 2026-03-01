(() => {
  const canvas = document.getElementById("scratchCanvas");
  const stage = document.getElementById("scratchStage");
  const countdown = document.getElementById("countdown");
  const sparkleLayer = document.getElementById("sparkleLayer");

  if (!canvas || !stage || !countdown || !sparkleLayer) return;

  const targetDate = new Date("2026-10-09T00:00:00");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  let drawing = false;
  let revealed = false;
  let lastPoint = null;
  let heartMask = null;
  let heartMaskCount = 0;
  let maskWidth = 0;
  let maskHeight = 0;

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

    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#fce18f");
    gradient.addColorStop(0.45, "#e0b857");
    gradient.addColorStop(1, "#b8882c");

    // Keep the full overlay opaque so hidden text never leaks around the heart.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = gradient;
    heartPath(ctx, heartX, heartY, heartSize);
    ctx.fill();

    // Add subtle glitter dots for a textured gold-heart look.
    for (let i = 0; i < 500; i += 1) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const dotSize = Math.random() * 1.8;
      const alpha = 0.08 + Math.random() * 0.24;
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, dotSize, 0, Math.PI * 2);
      ctx.fill();
    }

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
  };

  const sparkleBurst = () => {
    sparkleLayer.innerHTML = "";
    const rect = sparkleLayer.getBoundingClientRect();
    const count = Math.max(32, Math.floor(rect.width / 8));

    for (let i = 0; i < count; i += 1) {
      const sparkle = document.createElement("span");
      sparkle.className = "sparkle";
      sparkle.style.left = `${Math.random() * rect.width}px`;
      sparkle.style.top = `${Math.random() * (rect.height * 0.8)}px`;
      sparkle.style.animationDelay = `${Math.random() * 0.25}s`;
      sparkle.style.width = `${4 + Math.random() * 10}px`;
      sparkle.style.height = sparkle.style.width;
      sparkleLayer.appendChild(sparkle);
    }
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
      sparkleBurst();
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

  canvas.addEventListener("pointerdown", startDraw);
  canvas.addEventListener("pointermove", moveDraw);
  window.addEventListener("pointerup", stopDraw);

  canvas.addEventListener("touchstart", startDraw, { passive: false });
  canvas.addEventListener("touchmove", moveDraw, { passive: false });
  window.addEventListener("touchend", stopDraw);

  window.addEventListener("resize", drawMask);
  window.setInterval(tickCountdown, 1000 * 30);
})();
