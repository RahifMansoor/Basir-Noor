"use client";

import { useState, useRef } from "react";
import { compressImage, formatPhotoDate, MAX_BATCH_SIZE } from "@/lib/hubPhotos";

export default function HubAdminAlbumCard({ batch, adminKey, category = "gallery", onChanged }) {
    const [editing, setEditing] = useState(false);
    const [editName, setEditName] = useState(batch.name || "");
    const [editCaption, setEditCaption] = useState(batch.caption || "");
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState("");

    const [busyId, setBusyId] = useState(null); // id currently being deleted or replaced
    const [actionError, setActionError] = useState("");
    const [addingPhotos, setAddingPhotos] = useState(false);
    const fileInputRefs = useRef({});
    const addPhotosInputRef = useRef(null);

    function startEdit() {
        setEditName(batch.name || "");
        setEditCaption(batch.caption || "");
        setSaveError("");
        setEditing(true);
    }

    async function handleSaveEdit(e) {
        e.preventDefault();
        setSaving(true);
        setSaveError("");
        try {
            await Promise.all(
                batch.photos.map((p) =>
                    fetch(`/api/hub/photos/${p.id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json", "x-hub-admin-key": adminKey },
                        body: JSON.stringify({ name: editName.trim(), caption: editCaption }),
                    }).then(async (res) => {
                        if (!res.ok) {
                            const data = await res.json().catch(() => ({}));
                            throw new Error(data.error || "Failed to save.");
                        }
                    })
                )
            );
            setEditing(false);
            onChanged();
        } catch (err) {
            setSaveError(err.message);
        } finally {
            setSaving(false);
        }
    }

    async function handleDeletePhoto(id) {
        setBusyId(id);
        setActionError("");
        try {
            const res = await fetch(`/api/hub/photos/${id}`, {
                method: "DELETE",
                headers: { "x-hub-admin-key": adminKey },
            });
            if (!res.ok) throw new Error("Failed to delete.");
            onChanged();
        } catch (err) {
            setActionError(err.message);
        } finally {
            setBusyId(null);
        }
    }

    async function handleReplacePhoto(id, file) {
        setBusyId(id);
        setActionError("");
        try {
            const dataUrl = await compressImage(file);
            const res = await fetch(`/api/hub/photos/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", "x-hub-admin-key": adminKey },
                body: JSON.stringify({ image: dataUrl }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to replace photo.");
            onChanged();
        } catch (err) {
            setActionError(err.message);
        } finally {
            setBusyId(null);
        }
    }

    async function handleAddPhotos(files) {
        if (files.length === 0) return;
        if (files.length > MAX_BATCH_SIZE) {
            setActionError(`You can add up to ${MAX_BATCH_SIZE} photos at once.`);
            return;
        }
        setAddingPhotos(true);
        setActionError("");
        try {
            const images = await Promise.all(files.map(compressImage));
            const res = await fetch("/api/hub/photos", {
                method: "POST",
                headers: { "Content-Type": "application/json", "x-hub-admin-key": adminKey },
                body: JSON.stringify({
                    name: batch.name || "",
                    caption: batch.caption || "",
                    images,
                    batchId: batch.key,
                    category,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to add photos.");
            onChanged();
        } catch (err) {
            setActionError(err.message);
        } finally {
            setAddingPhotos(false);
        }
    }

    return (
        <article className="hub-admin-album-card">
            {!editing ? (
                <div className="hub-admin-album-header">
                    <div>
                        {batch.name && <span className="hub-photo-caption-name">{batch.name}</span>}
                        {batch.caption && <span className="hub-photo-caption-text"> — {batch.caption}</span>}
                        <span className="hub-photo-caption-date"> · {formatPhotoDate(batch.created_at)}</span>
                    </div>
                    <button type="button" className="hub-admin-edit-btn" onClick={startEdit}>
                        Edit
                    </button>
                </div>
            ) : (
                <form className="hub-admin-edit-form" onSubmit={handleSaveEdit}>
                    <input
                        className="bp-wish-input"
                        type="text"
                        maxLength={80}
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Uploader name (optional)"
                    />
                    <input
                        className="bp-wish-input"
                        type="text"
                        maxLength={300}
                        value={editCaption}
                        onChange={(e) => setEditCaption(e.target.value)}
                        placeholder="Caption (optional)"
                    />
                    {saveError && <p className="bp-wish-status bp-wish-status--error">{saveError}</p>}
                    <div className="hub-admin-edit-actions">
                        <button type="submit" className="bp-wish-submit" disabled={saving}>
                            {saving ? "Saving…" : "Save"}
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => setEditing(false)}
                            disabled={saving}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {actionError && <p className="bp-wish-status bp-wish-status--error">{actionError}</p>}

            <div className="hub-admin-thumb-strip">
                {batch.photos.map((p) => (
                    <div key={p.id} className="hub-admin-thumb-item">
                        <img src={`/api/hub/photos/${p.id}`} alt={batch.caption || batch.name || "Photo"} loading="lazy" />
                        {busyId === p.id && <div className="hub-admin-thumb-busy">…</div>}
                        <div className="hub-admin-thumb-actions">
                            <button
                                type="button"
                                className="hub-admin-thumb-btn"
                                title="Replace photo"
                                disabled={busyId === p.id}
                                onClick={() => fileInputRefs.current[p.id]?.click()}
                            >
                                ✎
                            </button>
                            <button
                                type="button"
                                className="hub-admin-thumb-btn hub-admin-thumb-btn-danger"
                                title="Delete photo"
                                disabled={busyId === p.id}
                                onClick={() => handleDeletePhoto(p.id)}
                            >
                                ✕
                            </button>
                        </div>
                        <input
                            ref={(el) => { fileInputRefs.current[p.id] = el; }}
                            type="file"
                            accept="image/*"
                            className="hub-admin-thumb-file-input"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                e.target.value = "";
                                if (file) handleReplacePhoto(p.id, file);
                            }}
                        />
                    </div>
                ))}

                <button
                    type="button"
                    className="hub-admin-thumb-add"
                    title="Add photos to this post"
                    disabled={addingPhotos}
                    onClick={() => addPhotosInputRef.current?.click()}
                >
                    {addingPhotos ? "…" : "+"}
                </button>
                <input
                    ref={addPhotosInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hub-admin-thumb-file-input"
                    onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        e.target.value = "";
                        if (files.length) handleAddPhotos(files);
                    }}
                />
            </div>
        </article>
    );
}
