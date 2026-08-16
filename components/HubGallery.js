"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { formatPhotoDate } from "@/lib/hubPhotos";

const SWIPE_THRESHOLD = 50;

export default function HubGallery() {
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);

    const [activeBatchKey, setActiveBatchKey] = useState(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const touchStartX = useRef(null);

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

    useEffect(() => {
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
        fetchPhotos();
    }, []);

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
            <section className="bp-gallery-section hub-gallery-section">
                <h2 className="bp-section-title">Shared Photos</h2>
                {loading && <p className="bp-wish-loading">Loading photos...</p>}
                {fetchError && <p className="bp-wish-status bp-wish-status--error">{fetchError}</p>}
                {!loading && !fetchError && batches.length === 0 && (
                    <p className="bp-wish-empty">No photos yet — check back soon!</p>
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
                                <span className="hub-photo-caption-date">{formatPhotoDate(b.created_at)}</span>
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
                        <span className="bp-comment-timestamp"> · {formatPhotoDate(activePhoto.created_at)}</span>
                    </div>
                    {activeBatch.photos.length > 1 && (
                        <div className="bp-lb-counter">{activeIndex + 1} / {activeBatch.photos.length}</div>
                    )}
                </div>
            )}
        </>
    );
}
