"use client";

import { useState, useEffect, useRef, useMemo } from "react";

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;
const MAX_BATCH_SIZE = 10;
const SWIPE_THRESHOLD = 50;

function formatDate(iso) {
    return new Date(iso).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

async function compressImage(file) {
    let bitmap;
    try {
        bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
        bitmap = await createImageBitmap(file);
    }

    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(bitmap, 0, 0, width, height);

    return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
}

export default function HubGallery() {
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);

    const [name, setName] = useState("");
    const [caption, setCaption] = useState("");
    const [selections, setSelections] = useState([]); // [{ dataUrl }]
    const [processingFile, setProcessingFile] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);
    const [submitError, setSubmitError] = useState("");

    const [activeBatchKey, setActiveBatchKey] = useState(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const touchStartX = useRef(null);
    const fileInputRef = useRef(null);

    const batches = useMemo(() => {
        const order = [];
        const byKey = new Map();
        for (const p of photos) {
            const key = p.batch_id || `solo-${p.id}`;
            if (!byKey.has(key)) {
                byKey.set(key, { key, name: p.name, caption: p.caption, created_at: p.created_at, photos: [] });
                order.push(key);
            }
            byKey.get(key).photos.push(p);
        }
        return order.map((key) => byKey.get(key));
    }, [photos]);

    const activeBatch = useMemo(
        () => batches.find((b) => b.key === activeBatchKey) || null,
        [batches, activeBatchKey]
    );

    async function fetchPhotos() {
        try {
            const res = await fetch("/api/hub/photos");
            if (!res.ok) throw new Error("Failed to load photos.");
            const data = await res.json();
            setPhotos(data);
        } catch (err) {
            setFetchError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchPhotos();
    }, []);

    async function handleFileChange(e) {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setSubmitStatus(null);

        if (files.length > MAX_BATCH_SIZE) {
            setSubmitStatus("error");
            setSubmitError(`You can upload up to ${MAX_BATCH_SIZE} photos at once.`);
            return;
        }

        setProcessingFile(true);
        try {
            const dataUrls = await Promise.all(files.map(compressImage));
            setSelections(dataUrls.map((dataUrl) => ({ dataUrl })));
        } catch {
            setSubmitStatus("error");
            setSubmitError("Couldn't read one of those images. Please try different photos.");
        } finally {
            setProcessingFile(false);
        }
    }

    function removeSelection(i) {
        setSelections((prev) => prev.filter((_, idx) => idx !== i));
    }

    function resetForm() {
        setName("");
        setCaption("");
        setSelections([]);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (selections.length === 0) {
            setSubmitStatus("error");
            setSubmitError("Please choose at least one photo.");
            return;
        }
        setSubmitting(true);
        setSubmitStatus(null);
        setSubmitError("");

        try {
            const res = await fetch("/api/hub/photos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    caption,
                    images: selections.map((s) => s.dataUrl),
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to upload.");
            setPhotos((prev) => [...data, ...prev]);
            resetForm();
            setSubmitStatus("success");
        } catch (err) {
            setSubmitError(err.message);
            setSubmitStatus("error");
        } finally {
            setSubmitting(false);
        }
    }

    function openLightbox(batchKey, index = 0) {
        setActiveBatchKey(batchKey);
        setActiveIndex(index);
    }
    function closeLightbox() {
        setActiveBatchKey(null);
    }
    function showPrev(e) {
        e?.stopPropagation();
        if (!activeBatch) return;
        setActiveIndex((i) => (i - 1 + activeBatch.photos.length) % activeBatch.photos.length);
    }
    function showNext(e) {
        e?.stopPropagation();
        if (!activeBatch) return;
        setActiveIndex((i) => (i + 1) % activeBatch.photos.length);
    }

    useEffect(() => {
        if (!activeBatch) return;
        function onKeyDown(e) {
            if (e.key === "Escape") closeLightbox();
            if (e.key === "ArrowLeft") showPrev();
            if (e.key === "ArrowRight") showNext();
        }
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [activeBatch]);

    function onTouchStart(e) {
        touchStartX.current = e.touches[0].clientX;
    }
    function onTouchEnd(e) {
        if (touchStartX.current === null) return;
        const deltaX = e.changedTouches[0].clientX - touchStartX.current;
        touchStartX.current = null;
        if (Math.abs(deltaX) < SWIPE_THRESHOLD) return;
        if (deltaX < 0) showNext();
        else showPrev();
    }

    const activePhoto = activeBatch ? activeBatch.photos[activeIndex] : null;

    return (
        <>
            <section className="bp-wish-section hub-upload-section">
                <h2 className="bp-section-title">Add Photos</h2>
                <form className="bp-wish-form" onSubmit={handleSubmit} noValidate>
                    <div className="bp-wish-field">
                        <label className="bp-wish-label" htmlFor="hub-photo-name">Your Name</label>
                        <input
                            id="hub-photo-name"
                            className="bp-wish-input"
                            type="text"
                            placeholder="e.g. Auntie Fatima"
                            maxLength={80}
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="bp-wish-field">
                        <label className="bp-wish-label" htmlFor="hub-photo-caption">Caption (optional)</label>
                        <input
                            id="hub-photo-caption"
                            className="bp-wish-input"
                            type="text"
                            placeholder="Say something about these moments"
                            maxLength={300}
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                        />
                    </div>
                    <div className="bp-wish-field">
                        <label className="bp-wish-label" htmlFor="hub-photo-file">
                            Photos <span className="hub-upload-hint">(choose one or select several at once)</span>
                        </label>
                        <input
                            id="hub-photo-file"
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileChange}
                        />
                        {processingFile && <p className="hub-upload-processing">Preparing photos…</p>}
                        {selections.length > 0 && (
                            <div className="hub-upload-preview-strip">
                                {selections.map((s, i) => (
                                    <div key={i} className="hub-upload-preview-item">
                                        <img src={s.dataUrl} alt={`Selected photo ${i + 1}`} />
                                        <button
                                            type="button"
                                            className="hub-upload-preview-remove"
                                            aria-label="Remove photo"
                                            onClick={() => removeSelection(i)}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {submitStatus === "success" && (
                        <p className="bp-wish-status bp-wish-status--success">
                            Thank you! Your photos have been added.
                        </p>
                    )}
                    {submitStatus === "error" && (
                        <p className="bp-wish-status bp-wish-status--error">{submitError}</p>
                    )}

                    <button
                        className="bp-wish-submit"
                        type="submit"
                        disabled={submitting || processingFile || !name.trim() || selections.length === 0}
                    >
                        {submitting
                            ? "Uploading…"
                            : selections.length > 1
                            ? `Share ${selections.length} Photos`
                            : "Share Photo"}
                    </button>
                </form>
            </section>

            <section className="bp-gallery-section hub-gallery-section">
                <h2 className="bp-section-title">Shared Photos</h2>
                {loading && <p className="bp-wish-loading">Loading photos...</p>}
                {fetchError && <p className="bp-wish-status bp-wish-status--error">{fetchError}</p>}
                {!loading && !fetchError && batches.length === 0 && (
                    <p className="bp-wish-empty">No photos yet — be the first to share one!</p>
                )}
                <div className="hub-photo-grid">
                    {batches.map((b, i) => (
                        <article
                            key={b.key}
                            className="hub-photo-card"
                            style={{ animationDelay: `${0.05 + i * 0.05}s` }}
                        >
                            <button
                                type="button"
                                className="hub-photo-img-btn"
                                onClick={() => openLightbox(b.key, 0)}
                                aria-label="View full photo"
                            >
                                <img src={`/api/hub/photos/${b.photos[0].id}`} alt={b.caption || `Photo by ${b.name}`} loading="lazy" />
                                {b.photos.length > 1 && (
                                    <span className="hub-photo-count-badge">📷 {b.photos.length}</span>
                                )}
                                <div className="hub-photo-overlay">
                                    <span className="bp-zoom-icon">🔍</span>
                                </div>
                            </button>
                            <div className="hub-photo-caption">
                                <span className="hub-photo-caption-name">{b.name}</span>
                                {b.caption && <span className="hub-photo-caption-text">{b.caption}</span>}
                                <span className="hub-photo-caption-date">{formatDate(b.created_at)}</span>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            {activePhoto && (
                <div
                    className="bp-lightbox"
                    onClick={closeLightbox}
                    onTouchStart={onTouchStart}
                    onTouchEnd={onTouchEnd}
                >
                    <button className="bp-lb-close" onClick={closeLightbox} aria-label="Close">✕</button>
                    {activeBatch.photos.length > 1 && (
                        <>
                            <button className="bp-lb-arrow bp-lb-prev" onClick={showPrev} aria-label="Previous">‹</button>
                            <button className="bp-lb-arrow bp-lb-next" onClick={showNext} aria-label="Next">›</button>
                        </>
                    )}
                    <img
                        className="bp-lb-img"
                        src={`/api/hub/photos/${activePhoto.id}`}
                        alt={activePhoto.caption || `Photo by ${activePhoto.name}`}
                        onClick={(e) => e.stopPropagation()}
                    />
                    <div className="hub-lb-caption">
                        <strong>{activePhoto.name}</strong>
                        {activePhoto.caption && <span> — {activePhoto.caption}</span>}
                        <span className="bp-comment-timestamp"> · {formatDate(activePhoto.created_at)}</span>
                    </div>
                    {activeBatch.photos.length > 1 && (
                        <div className="bp-lb-counter">{activeIndex + 1} / {activeBatch.photos.length}</div>
                    )}
                </div>
            )}
        </>
    );
}
