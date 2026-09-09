"use client";

import { useState, useEffect } from "react";

function formatDate(iso) {
    return new Date(iso).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export default function HubAdminBroadcasts({ adminKey }) {
    const [broadcasts, setBroadcasts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);

    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);
    const [submitError, setSubmitError] = useState("");
    const [deletingId, setDeletingId] = useState(null);

    async function fetchBroadcasts() {
        try {
            const res = await fetch("/api/hub/broadcasts");
            if (!res.ok) throw new Error("Failed to load broadcasts.");
            setBroadcasts(await res.json());
        } catch (err) {
            setFetchError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchBroadcasts();
    }, []);

    async function handleSubmit(e) {
        e.preventDefault();
        setSubmitting(true);
        setSubmitStatus(null);
        setSubmitError("");

        try {
            const res = await fetch("/api/hub/broadcasts", {
                method: "POST",
                headers: { "Content-Type": "application/json", "x-hub-admin-key": adminKey },
                body: JSON.stringify({ title, message }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to post broadcast.");
            setBroadcasts((prev) => [data, ...prev]);
            setTitle("");
            setMessage("");
            setSubmitStatus("success");
        } catch (err) {
            setSubmitError(err.message);
            setSubmitStatus("error");
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDelete(id) {
        setDeletingId(id);
        try {
            const res = await fetch(`/api/hub/broadcasts/${id}`, {
                method: "DELETE",
                headers: { "x-hub-admin-key": adminKey },
            });
            if (!res.ok) throw new Error("Failed to delete.");
            setBroadcasts((prev) => prev.filter((b) => b.id !== id));
        } catch (err) {
            setFetchError(err.message);
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <section className="hub-admin-panel">
            <h2 className="hub-section-title">📣 Broadcasts</h2>

            <form className="bp-wish-form" onSubmit={handleSubmit} noValidate>
                <div className="bp-wish-field">
                    <label className="bp-wish-label" htmlFor="broadcast-title">Title</label>
                    <input
                        id="broadcast-title"
                        className="bp-wish-input"
                        type="text"
                        placeholder="e.g. New RSVP deadline"
                        maxLength={120}
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
                <div className="bp-wish-field">
                    <label className="bp-wish-label" htmlFor="broadcast-message">Message</label>
                    <textarea
                        id="broadcast-message"
                        className="bp-wish-input bp-wish-textarea"
                        placeholder="Write the announcement..."
                        maxLength={1000}
                        required
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                </div>

                {submitStatus === "success" && (
                    <p className="bp-wish-status bp-wish-status--success">Broadcast posted.</p>
                )}
                {submitStatus === "error" && (
                    <p className="bp-wish-status bp-wish-status--error">{submitError}</p>
                )}

                <button
                    className="bp-wish-submit"
                    type="submit"
                    disabled={submitting || !title.trim() || !message.trim()}
                >
                    {submitting ? "Posting…" : "Post Broadcast"}
                </button>
            </form>

            {loading && <p className="bp-wish-loading">Loading broadcasts...</p>}
            {fetchError && <p className="bp-wish-status bp-wish-status--error">{fetchError}</p>}

            <div className="hub-admin-list">
                {broadcasts.map((b) => (
                    <article key={b.id} className="hub-broadcast-card hub-admin-list-item">
                        <div>
                            <span className="hub-broadcast-date">{formatDate(b.created_at)}</span>
                            <h3>{b.title}</h3>
                            <p>{b.message}</p>
                        </div>
                        <button
                            type="button"
                            className="hub-admin-delete-btn"
                            onClick={() => handleDelete(b.id)}
                            disabled={deletingId === b.id}
                        >
                            {deletingId === b.id ? "Deleting…" : "Delete"}
                        </button>
                    </article>
                ))}
            </div>
        </section>
    );
}
