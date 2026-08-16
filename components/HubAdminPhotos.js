"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { compressImage, MAX_BATCH_SIZE, groupPhotosByBatch } from "@/lib/hubPhotos";
import HubAdminAlbumCard from "@/components/HubAdminAlbumCard";

export default function HubAdminPhotos({ adminKey }) {
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

    const fileInputRef = useRef(null);

    const batches = useMemo(() => groupPhotosByBatch(photos), [photos]);

    async function fetchPhotos() {
        try {
            const res = await fetch("/api/hub/photos");
            if (!res.ok) throw new Error("Failed to load photos.");
            setPhotos(await res.json());
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
                headers: { "Content-Type": "application/json", "x-hub-admin-key": adminKey },
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

    return (
        <section className="hub-admin-panel">
            <h2 className="hub-section-title">📸 Photos</h2>

            <form className="bp-wish-form" onSubmit={handleSubmit} noValidate>
                <div className="bp-wish-field">
                    <label className="bp-wish-label" htmlFor="admin-photo-name">Uploader Name</label>
                    <input
                        id="admin-photo-name"
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
                    <label className="bp-wish-label" htmlFor="admin-photo-caption">Caption (optional)</label>
                    <input
                        id="admin-photo-caption"
                        className="bp-wish-input"
                        type="text"
                        placeholder="Say something about these moments"
                        maxLength={300}
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                    />
                </div>
                <div className="bp-wish-field">
                    <label className="bp-wish-label" htmlFor="admin-photo-file">
                        Photos <span className="hub-upload-hint">(choose one or select up to {MAX_BATCH_SIZE} at once)</span>
                    </label>
                    <input
                        id="admin-photo-file"
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
                    <p className="bp-wish-status bp-wish-status--success">Photos added.</p>
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
                        ? `Add ${selections.length} Photos`
                        : "Add Photo"}
                </button>
            </form>

            {loading && <p className="bp-wish-loading">Loading photos...</p>}
            {fetchError && <p className="bp-wish-status bp-wish-status--error">{fetchError}</p>}
            {!loading && !fetchError && batches.length === 0 && (
                <p className="bp-wish-empty">No photos yet.</p>
            )}

            <div className="hub-admin-album-list">
                {batches.map((b) => (
                    <HubAdminAlbumCard key={b.key} batch={b} adminKey={adminKey} onChanged={fetchPhotos} />
                ))}
            </div>
        </section>
    );
}
