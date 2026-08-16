"use client";

import { useState, useRef } from "react";
import { formatPhotoDate } from "@/lib/hubPhotos";

const SWIPE_THRESHOLD = 40;

export default function HubAlbumCard({ batch, onOpenLightbox, style }) {
    const [index, setIndex] = useState(0);
    const touchStartX = useRef(null);
    const multi = batch.photos.length > 1;

    function showPrev(e) {
        e.stopPropagation();
        setIndex((i) => (i - 1 + batch.photos.length) % batch.photos.length);
    }
    function showNext(e) {
        e.stopPropagation();
        setIndex((i) => (i + 1) % batch.photos.length);
    }

    function onTouchStart(e) {
        touchStartX.current = e.touches[0].clientX;
    }
    function onTouchEnd(e) {
        if (touchStartX.current === null) return;
        const deltaX = e.changedTouches[0].clientX - touchStartX.current;
        touchStartX.current = null;
        if (Math.abs(deltaX) < SWIPE_THRESHOLD) return;
        e.stopPropagation();
        if (deltaX < 0) setIndex((i) => (i + 1) % batch.photos.length);
        else setIndex((i) => (i - 1 + batch.photos.length) % batch.photos.length);
    }

    const photo = batch.photos[index];

    return (
        <article className="hub-photo-card" style={style}>
            <div
                className="hub-photo-img-btn hub-album-carousel"
                onTouchStart={multi ? onTouchStart : undefined}
                onTouchEnd={multi ? onTouchEnd : undefined}
            >
                <img
                    src={`/api/hub/photos/${photo.id}`}
                    alt={batch.caption || `Photo by ${batch.name}`}
                    loading="lazy"
                    onClick={() => onOpenLightbox(batch.key, index)}
                />
                {multi && (
                    <>
                        <button type="button" className="hub-album-arrow hub-album-arrow-prev" onClick={showPrev} aria-label="Previous photo">‹</button>
                        <button type="button" className="hub-album-arrow hub-album-arrow-next" onClick={showNext} aria-label="Next photo">›</button>
                        <span className="hub-photo-count-badge">{index + 1} / {batch.photos.length}</span>
                        <div className="hub-album-dots">
                            {batch.photos.map((_, i) => (
                                <span key={i} className={`hub-album-dot${i === index ? " active" : ""}`} />
                            ))}
                        </div>
                    </>
                )}
                <div className="hub-photo-overlay">
                    <span className="bp-zoom-icon">🔍</span>
                </div>
            </div>
            <div className="hub-photo-caption">
                <span className="hub-photo-caption-name">{batch.name}</span>
                {batch.caption && <span className="hub-photo-caption-text">{batch.caption}</span>}
                <span className="hub-photo-caption-date">{formatPhotoDate(batch.created_at)}</span>
            </div>
        </article>
    );
}
