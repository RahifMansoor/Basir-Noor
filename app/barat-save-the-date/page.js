"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const TARGET_DATE = new Date("2026-10-10T17:00:00");
const PETAL_COLORS = [
    "#ffe5e5",
    "#ffc9c9",
    "#ffaaaa",
    "#ff8f8f",
    "#f86f6f",
    "#e24f4f",
    "#c93a3a",
];

export default function BaratSaveTheDatePage() {
    const canvasRef = useRef(null);
    const stageRef = useRef(null);
    const roseLayerRef = useRef(null);
    const audioRef = useRef(null);
    const drawingRef = useRef(false);
    const lastPointRef = useRef(null);
    const heartMaskRef = useRef(null);
    const heartMaskCountRef = useRef(0);
    const maskDimsRef = useRef({ w: 0, h: 0 });
    const brushSizeRef = useRef(28);
    const lastTrailRef = useRef(0);
    const lastCheckRef = useRef(0);
    const revealedRef = useRef(false);

    const [countdown, setCountdown] = useState("Loading countdown...");
    const [musicLabel, setMusicLabel] = useState("Play Music");
    const [canvasReady, setCanvasReady] = useState(false);

    const tickCountdown = useCallback(() => {
        const now = new Date();
        const diff = TARGET_DATE.getTime() - now.getTime();
        if (diff <= 0) {
            setCountdown("Today is the day.");
            return;
        }
        const totalHours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(totalHours / 24);
        const hours = totalHours % 24;
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        setCountdown(`${days} days, ${hours} hours, ${minutes} minutes to go`);
    }, []);

    const heartPath = (context, x, y, size) => {
        context.beginPath();
        context.moveTo(x, y + size / 4);
        context.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + size / 4);
        context.bezierCurveTo(
            x - size / 2,
            y + size / 2,
            x,
            y + size * 0.82,
            x,
            y + size
        );
        context.bezierCurveTo(
            x,
            y + size * 0.82,
            x + size / 2,
            y + size / 2,
            x + size / 2,
            y + size / 4
        );
        context.bezierCurveTo(x + size / 2, y, x, y, x, y + size / 4);
        context.closePath();
    };

    const drawMask = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        const rect = canvas.getBoundingClientRect();
        const width = Math.max(280, Math.floor(rect.width));
        const height = Math.max(180, Math.floor(rect.height));
        const ratio = window.devicePixelRatio || 1;
        const heartX = width / 2;
        const heartY = Math.max(8, height * 0.05);
        const heartSize = Math.min(width * 0.92, height * 0.94);

        canvas.width = width * ratio;
        canvas.height = height * ratio;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        ctx.clearRect(0, 0, width, height);

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);

        ctx.save();
        heartPath(ctx, heartX, heartY, heartSize);
        ctx.clip();

        const roseBase = ctx.createLinearGradient(0, 0, width, height);
        roseBase.addColorStop(0, "#ffd9d9");
        roseBase.addColorStop(0.5, "#f4a8a8");
        roseBase.addColorStop(1, "#dd6b6b");
        ctx.fillStyle = roseBase;
        ctx.fillRect(0, 0, width, height);

        const isMobile = width < 500;
        const petalCount = isMobile ? 500 : 1200;
        const glowCount = isMobile ? 60 : 160;

        for (let i = 0; i < petalCount; i++) {
            const px = Math.random() * width;
            const py = Math.random() * height;
            const rw = 1.7 + Math.random() * 5.3;
            const rh = 1.2 + Math.random() * 3.7;
            const rot = Math.random() * Math.PI;
            const tone =
                PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)];
            const alpha = 0.3 + Math.random() * 0.55;
            ctx.fillStyle = `${tone}${Math.round(alpha * 255)
                .toString(16)
                .padStart(2, "0")}`;
            ctx.beginPath();
            ctx.ellipse(px, py, rw, rh, rot, 0, Math.PI * 2);
            ctx.fill();
        }

        for (let i = 0; i < glowCount; i++) {
            const px = Math.random() * width;
            const py = Math.random() * height;
            const glow = 0.8 + Math.random() * 1.7;
            ctx.fillStyle = `rgba(255, 241, 241, ${0.28 + Math.random() * 0.3})`;
            ctx.beginPath();
            ctx.arc(px, py, glow, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();

        ctx.strokeStyle = "rgba(190, 63, 63, 0.45)";
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
        const hMask = new Uint8Array(pixels);
        let count = 0;
        for (let p = 0; p < pixels; p++) {
            if (image[p * 4 + 3] > 20) {
                hMask[p] = 1;
                count++;
            }
        }

        heartMaskRef.current = hMask;
        heartMaskCountRef.current = count;
        maskDimsRef.current = { w: width, h: height };
        brushSizeRef.current = Math.max(18, Math.floor(heartSize * 0.075));
        setCanvasReady(true);
    }, []);

    const makeRoseParticle = useCallback(
        ({
            x,
            y,
            cls = "",
            sizeMin = 12,
            sizeMax = 20,
            xSpread = 80,
            yRiseMin = 50,
            yRiseMax = 120,
            delayMax = 0.15,
        }) => {
            const roseLayer = roseLayerRef.current;
            if (!roseLayer) return;

            const rose = document.createElement("span");
            rose.className = `rose-particle ${cls}`.trim();
            const size = sizeMin + Math.random() * (sizeMax - sizeMin);
            rose.style.left = `${x}px`;
            rose.style.top = `${y}px`;
            rose.style.setProperty("--petal-size", `${size}px`);
            rose.style.setProperty(
                "--petal-color",
                PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)]
            );
            rose.style.animationDelay = `${Math.random() * delayMax}s`;
            rose.style.setProperty(
                "--rose-x",
                `${(Math.random() - 0.5) * xSpread}px`
            );
            rose.style.setProperty(
                "--rose-y",
                `${-(yRiseMin + Math.random() * (yRiseMax - yRiseMin))}px`
            );
            rose.style.setProperty(
                "--rose-rot",
                `${(Math.random() - 0.5) * 200}deg`
            );
            roseLayer.appendChild(rose);

            setTimeout(() => rose.remove(), 2600);
        },
        []
    );

    const spawnSwipePetals = useCallback(
        (x, y) => {
            const now = performance.now();
            if (now - lastTrailRef.current < 35) return;
            lastTrailRef.current = now;

            const canvas = canvasRef.current;
            const roseLayer = roseLayerRef.current;
            if (!canvas || !roseLayer) return;

            const canvasRect = canvas.getBoundingClientRect();
            const layerRect = roseLayer.getBoundingClientRect();
            const layerX = x + (canvasRect.left - layerRect.left);
            const layerY = y + (canvasRect.top - layerRect.top);

            const count = 2 + Math.floor(Math.random() * 2);
            for (let i = 0; i < count; i++) {
                makeRoseParticle({
                    x: layerX + (Math.random() - 0.5) * 24,
                    y: layerY + (Math.random() - 0.5) * 20,
                    cls: "trail",
                    sizeMin: 10,
                    sizeMax: 16,
                    xSpread: 42,
                    yRiseMin: 24,
                    yRiseMax: 72,
                    delayMax: 0.05,
                });
            }
        },
        [makeRoseParticle]
    );

    const roseBurst = useCallback(() => {
        const roseLayer = roseLayerRef.current;
        if (!roseLayer) return;

        roseLayer.innerHTML = "";
        const rect = roseLayer.getBoundingClientRect();
        const centerX = rect.width * 0.5;
        const centerY = rect.height * 0.42;
        const count = Math.max(50, Math.floor(rect.width / 6));

        for (let i = 0; i < count; i++) {
            makeRoseParticle({
                x: centerX + (Math.random() - 0.5) * 60,
                y: centerY + (Math.random() - 0.5) * 38,
                cls: "poof",
                sizeMin: 13,
                sizeMax: 24,
                xSpread: rect.width * 1.1,
                yRiseMin: 90,
                yRiseMax: 190,
                delayMax: 0.24,
            });
        }

        const poof = document.createElement("span");
        poof.className = "rose-poof-core";
        poof.style.left = `${centerX}px`;
        poof.style.top = `${centerY}px`;
        roseLayer.appendChild(poof);
        setTimeout(() => poof.remove(), 1000);
    }, [makeRoseParticle]);

    const pointFromEvent = (event) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };
        const rect = canvas.getBoundingClientRect();
        if (event.touches && event.touches[0]) {
            return {
                x: event.touches[0].clientX - rect.left,
                y: event.touches[0].clientY - rect.top,
            };
        }
        return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };

    const revealCheck = useCallback(() => {
        if (
            revealedRef.current ||
            !heartMaskRef.current ||
            !heartMaskCountRef.current
        )
            return;

        const now = performance.now();
        if (now - lastCheckRef.current < 300) return;
        lastCheckRef.current = now;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        const { w, h } = maskDimsRef.current;
        const samples = ctx.getImageData(0, 0, w, h).data;
        let cleared = 0;
        const hMask = heartMaskRef.current;

        for (let p = 0; p < hMask.length; p++) {
            if (!hMask[p]) continue;
            if (samples[p * 4 + 3] < 25) cleared++;
        }

        if (cleared / heartMaskCountRef.current > 0.35) {
            revealedRef.current = true;
            canvas.style.transition = "opacity 650ms ease";
            canvas.style.opacity = "0";
            canvas.style.pointerEvents = "none";
            roseBurst();
        }
    }, [roseBurst]);

    const scratchAt = useCallback(
        (event) => {
            if (revealedRef.current) return;
            const canvas = canvasRef.current;
            if (!canvas) return;

            const ctx = canvas.getContext("2d", { willReadFrequently: true });
            const { x, y } = pointFromEvent(event);
            const prevPoint = lastPointRef.current;
            const xi = Math.floor(x);
            const yi = Math.floor(y);
            const { w, h } = maskDimsRef.current;

            if (
                !heartMaskRef.current ||
                xi < 0 ||
                yi < 0 ||
                xi >= w ||
                yi >= h
            )
                return;
            if (!heartMaskRef.current[yi * w + xi]) return;

            lastPointRef.current = { x, y };

            const r = brushSizeRef.current;
            ctx.globalCompositeOperation = "destination-out";
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();

            if (prevPoint) {
                ctx.lineWidth = r * 2;
                ctx.lineCap = "round";
                ctx.beginPath();
                ctx.moveTo(prevPoint.x, prevPoint.y);
                ctx.lineTo(x, y);
                ctx.stroke();
            }

            ctx.globalCompositeOperation = "source-over";
            spawnSwipePetals(x, y);
        },
        [spawnSwipePetals]
    );

    const startDraw = useCallback(
        (event) => {
            drawingRef.current = true;
            lastPointRef.current = null;
            scratchAt(event);
            revealCheck();
        },
        [scratchAt, revealCheck]
    );

    const moveDraw = useCallback(
        (event) => {
            if (!drawingRef.current) return;
            event.preventDefault();
            scratchAt(event);
            revealCheck();
        },
        [scratchAt, revealCheck]
    );

    const stopDraw = useCallback(() => {
        drawingRef.current = false;
        lastPointRef.current = null;
        lastCheckRef.current = 0;
        revealCheck();
    }, [revealCheck]);

    const toggleMusic = useCallback(async () => {
        const audio = audioRef.current;
        if (!audio) return;
        if (audio.paused) {
            try {
                await audio.play();
                setMusicLabel("Pause Music");
            } catch {
                setMusicLabel("Play Music");
            }
        } else {
            audio.pause();
            setMusicLabel("Play Music");
        }
    }, []);

    useEffect(() => {
        drawMask();
        tickCountdown();

        const audio = audioRef.current;
        if (audio) {
            audio
                .play()
                .then(() => setMusicLabel("Pause Music"))
                .catch(() => setMusicLabel("Play Music"));
        }

        const canvas = canvasRef.current;
        if (canvas) {
            canvas.addEventListener("pointerdown", startDraw);
            canvas.addEventListener("pointermove", moveDraw);
            canvas.addEventListener("touchstart", startDraw, { passive: false });
            canvas.addEventListener("touchmove", moveDraw, { passive: false });
        }

        window.addEventListener("pointerup", stopDraw);
        window.addEventListener("touchend", stopDraw);
        window.addEventListener("resize", drawMask);

        const countdownInterval = setInterval(tickCountdown, 30000);

        return () => {
            if (canvas) {
                canvas.removeEventListener("pointerdown", startDraw);
                canvas.removeEventListener("pointermove", moveDraw);
                canvas.removeEventListener("touchstart", startDraw);
                canvas.removeEventListener("touchmove", moveDraw);
            }
            window.removeEventListener("pointerup", stopDraw);
            window.removeEventListener("touchend", stopDraw);
            window.removeEventListener("resize", drawMask);
            clearInterval(countdownInterval);
        };
    }, [drawMask, tickCountdown, startDraw, moveDraw, stopDraw]);

    return (
        <div className="content-page save-date-page">
            <section className="scratch-card-wrap">
                <div className="scratch-stage" ref={stageRef} id="scratchStage">
                    <div className="reveal-card" id="revealCard">
                        <button
                            className="music-toggle-inline"
                            type="button"
                            aria-label="Toggle background music"
                            onClick={toggleMusic}
                        >
                            {musicLabel}
                        </button>
                        <p className="eyebrow save-date-kicker">Scratch to Reveal</p>
                        <p className="save-date-title">Save The Barat Date</p>
                        <div className="heart-scratch-wrap">
                            <div className={`heart-reveal-content${canvasReady ? " ready" : ""}`}>
                                <p className="bismillah">بِسْمِ ٱللَّٰهِ</p>
                                <span className="reveal-divider" />
                                <p className="couple">Basir & Noor</p>
                                <p className="message">
                                    Join us for Dulha Sehar Bandi & Nikah
                                </p>
                                <p className="date-line">October 10, 2026</p>
                                <span className="reveal-divider" />
                                <p className="countdown">{countdown}</p>
                                <p className="formal-invite-note">Sheraton Nashua, NH</p>
                            </div>
                            <canvas
                                ref={canvasRef}
                                id="scratchCanvas"
                                aria-label="Scratch card"
                            />
                        </div>
                    </div>
                    <div
                        ref={roseLayerRef}
                        id="roseLayer"
                        className="rose-layer"
                        aria-hidden="true"
                    />
                </div>
            </section>

            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <audio
                ref={audioRef}
                src="/audio/Aaj Sajeya (Piano Cover).mp3"
                loop
                preload="auto"
                playsInline
            />
        </div>
    );
}
