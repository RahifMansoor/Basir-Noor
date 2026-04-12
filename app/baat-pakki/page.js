"use client";

import { useState } from "react";
import Link from "next/link";
import { baatPakkiData } from "@/data/eventDetails";

export default function BaatPakkiPage() {
    const { title, eyebrow, intro, photos, comments } = baatPakkiData;
    const [lightbox, setLightbox] = useState(null);

    return (
        <div className="content-page baat-pakki-page">
            <section className="event-hero">
                <p className="eyebrow">{eyebrow}</p>
                  <h1>{title}</h1>
                <p>{intro}</p>
                <div className="bp-date-location">
                    <span>March 29, 2026</span>
                    <span className="bp-date-dot">&middot;</span>
                    <span>New Hampshire, USA</span>
                </div>

            </section>

            {/* ---- Photo Gallery ---- */}
            <section className="bp-gallery-section">
                <h2 className="bp-section-title">Our Moments</h2>
                <div className="bp-gallery-grid">
                    {photos.map((photo, i) => (
                        <button
                            key={photo.src}
                            className="bp-gallery-item"
                            onClick={() => setLightbox(i)}
                            style={{ animationDelay: `${0.1 + i * 0.1}s` }}
                        >
                            <img src={photo.src} alt={photo.alt} loading="lazy" />
                            <span className="bp-gallery-overlay">
                                <span className="bp-zoom-icon">⛶</span>
                            </span>
                        </button>
                    ))}
                </div>
            </section>

            {/* ---- Lightbox ---- */}
            {lightbox !== null && (
                <div className="bp-lightbox" onClick={() => setLightbox(null)}>
                    <button
                        className="bp-lb-close"
                        onClick={() => setLightbox(null)}
                        aria-label="Close"
                    >
                        ✕
                    </button>
                    <button
                        className="bp-lb-arrow bp-lb-prev"
                        aria-label="Previous"
                        onClick={(e) => {
                            e.stopPropagation();
                            setLightbox((lightbox - 1 + photos.length) % photos.length);
                        }}
                    >
                        ‹
                    </button>
                    <img
                        className="bp-lb-img"
                        src={photos[lightbox].src}
                        alt={photos[lightbox].alt}
                        onClick={(e) => e.stopPropagation()}
                    />
                    <button
                        className="bp-lb-arrow bp-lb-next"
                        aria-label="Next"
                        onClick={(e) => {
                            e.stopPropagation();
                            setLightbox((lightbox + 1) % photos.length);
                        }}
                    >
                        ›
                    </button>
                    <span className="bp-lb-counter">
                        {lightbox + 1} / {photos.length}
                    </span>
                </div>
            )}

            {/* ---- Comments / Wishes ---- */}
            {comments.length > 0 && (
            <section className="bp-comments-section">
                <h2 className="bp-section-title">Wishes and Du'a</h2>
                <div className="bp-comments-list">
                    {comments.map((c, i) => (
                        <article
                            className="bp-comment-card"
                            key={i}
                            style={{ animationDelay: `${0.15 + i * 0.12}s` }}
                        >
                            {c.author && (
                                <div className="bp-comment-header">
                                    {c.avatar && (
                                        <img
                                            className="bp-comment-avatar"
                                            src={c.avatar}
                                            alt={c.author}
                                            loading="lazy"
                                        />
                                    )}
                                    <span className="bp-comment-author">{c.author}</span>
                                </div>
                            )}
                            {c.text && <p className="bp-comment-text">{c.text}</p>}
                            {c.image && (
                                <img
                                    className="bp-comment-image"
                                    src={c.image}
                                    alt={c.author ? `Shared by ${c.author}` : "Baat Pakki moment"}
                                    loading="lazy"
                                />
                            )}
                        </article>
                    ))}
                </div>
            </section>
            )}

            <section className="panel full-width" style={{ marginTop: "28px", textAlign: "center" }}>
                <p>Many more comments and blessings to come and will be added InshAllah!</p>
            </section>

            <div className="event-actions" style={{ marginTop: "32px" }}>
                {/* <Link className="btn btn-outline" href="/">
                    Back Home
                </Link> */}
            </div>
        </div>
    );
}
