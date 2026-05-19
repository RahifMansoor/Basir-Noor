"use client";

import { useState, useEffect } from "react";

function formatDate(iso) {
    return new Date(iso).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

export default function BaatPakkiComments() {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);

    const [name, setName] = useState("");
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null); // "success" | "error" | null
    const [submitError, setSubmitError] = useState("");

    async function fetchComments() {
        try {
            const res = await fetch("/api/comments");
            if (!res.ok) throw new Error("Failed to load comments.");
            const data = await res.json();
            setComments(data);
        } catch (err) {
            setFetchError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchComments();
    }, []);

    async function handleSubmit(e) {
        e.preventDefault();
        setSubmitting(true);
        setSubmitStatus(null);
        setSubmitError("");

        try {
            const res = await fetch("/api/comments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, comment }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to submit.");
            setComments((prev) => [data, ...prev]);
            setName("");
            setComment("");
            setSubmitStatus("success");
        } catch (err) {
            setSubmitError(err.message);
            setSubmitStatus("error");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <section className="bp-wish-section">
            <h2 className="bp-section-title">Leave a Wish</h2>

            <form className="bp-wish-form" onSubmit={handleSubmit} noValidate>
                <div className="bp-wish-field">
                    <label className="bp-wish-label" htmlFor="wish-name">Your Name</label>
                    <input
                        id="wish-name"
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
                    <label className="bp-wish-label" htmlFor="wish-comment">Your Wish or Du'a</label>
                    <textarea
                        id="wish-comment"
                        className="bp-wish-input bp-wish-textarea"
                        placeholder="Share your blessings for Basir and Noor..."
                        maxLength={1000}
                        required
                        rows={4}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />
                </div>

                {submitStatus === "success" && (
                    <p className="bp-wish-status bp-wish-status--success">
                        JazakAllah Khair! Your wish has been shared.
                    </p>
                )}
                {submitStatus === "error" && (
                    <p className="bp-wish-status bp-wish-status--error">{submitError}</p>
                )}

                <button
                    className="bp-wish-submit"
                    type="submit"
                    disabled={submitting || !name.trim() || !comment.trim()}
                >
                    {submitting ? "Sharing..." : "Share Your Wish"}
                </button>
            </form>

            <div className="bp-comments-list" style={{ marginTop: "2rem" }}>
                {loading && (
                    <p className="bp-wish-loading">Loading wishes...</p>
                )}
                {fetchError && (
                    <p className="bp-wish-status bp-wish-status--error">{fetchError}</p>
                )}
                {!loading && !fetchError && comments.length === 0 && (
                    <p className="bp-wish-empty">Be the first to leave a wish!</p>
                )}
                {comments.map((c, i) => (
                    <article
                        key={c.id}
                        className="bp-comment-card"
                        style={{ animationDelay: `${0.08 + i * 0.07}s` }}
                    >
                        <div className="bp-comment-header">
                            <span className="bp-comment-author">{c.name}</span>
                        </div>
                        <p className="bp-comment-text">{c.comment}</p>
                        <time className="bp-comment-timestamp" dateTime={c.created_at}>
                            {formatDate(c.created_at)}
                        </time>
                    </article>
                ))}
            </div>
        </section>
    );
}
