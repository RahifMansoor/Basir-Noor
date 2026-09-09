"use client";

import { formatPhotoDate } from "@/lib/hubPhotos";

export default function HubHeartPhotoCard({ batch, onOpenLightbox, style }) {
    const photo = batch.photos[0];

    return (
        <article className="hub-heart-card" style={style}>
            <button
                type="button"
                className="hub-heart-frame"
                onClick={() => onOpenLightbox(batch.key, 0)}
                aria-label={batch.caption || (batch.name ? `View photo of ${batch.name}` : "View photo")}
            >
                <img
                    className="hub-heart-frame-img"
                    src={`/api/hub/photos/${photo.id}`}
                    alt={batch.caption || (batch.name ? `Photo of ${batch.name}` : "Dream team photo")}
                    loading="lazy"
                />
                {batch.photos.length > 1 && (
                    <span className="hub-heart-count-badge">{batch.photos.length}</span>
                )}
            </button>
            {(batch.name || batch.caption) && (
                <div className="hub-heart-caption">
                    {batch.name && <span className="hub-photo-caption-name">{batch.name}</span>}
                    {batch.caption && <span className="hub-photo-caption-text">{batch.caption}</span>}
                    <span className="hub-photo-caption-date">{formatPhotoDate(batch.created_at)}</span>
                </div>
            )}
        </article>
    );
}
