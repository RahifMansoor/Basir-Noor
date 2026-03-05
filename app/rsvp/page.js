"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

const TRACKER_URL = "https://example.com/your-excel-rsvp-tracker";

export default function RsvpPage() {
    const [guestCount, setGuestCount] = useState(0);
    const [status, setStatus] = useState({ text: "", color: "" });
    const [showTracker, setShowTracker] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleGuestCountChange = useCallback((e) => {
        const count = Math.max(0, Math.min(8, parseInt(e.target.value || "0", 10)));
        setGuestCount(count);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ text: "Submitting...", color: "var(--muted)" });
        setIsSubmitting(true);

        try {
            const form = e.target;

            if (!form.checkValidity()) {
                form.reportValidity();
                throw new Error("Please complete all required fields.");
            }

            // Build additional guests
            const additionalGuests = [];
            for (let i = 0; i < guestCount; i++) {
                const nameInput = form.querySelector(`#guestName-${i}`);
                const emailInput = form.querySelector(`#guestEmail-${i}`);
                const guestName = nameInput?.value?.trim();
                const guestEmail = emailInput?.value?.trim();

                if (!guestName) {
                    throw new Error(
                        `Please enter a full name for Additional Guest ${i + 1}.`
                    );
                }

                additionalGuests.push({
                    name: guestName,
                    email: guestEmail || "",
                });
            }

            const payload = {
                timestamp: new Date().toISOString(),
                parent: {
                    name: form.parentName.value.trim(),
                    email: form.email.value.trim(),
                    phone: form.phone.value.trim(),
                    attendance: form.attendance.value,
                },
                additionalGuestCount: guestCount,
                additionalGuests,
                notes: form.notes.value.trim(),
            };

            const response = await fetch("/api/rsvp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error("RSVP submission failed. Please try again.");
            }

            setStatus({ text: "RSVP received. Thank you! 🎉", color: "#1d6e2f" });
            form.reset();
            setGuestCount(0);
            setShowTracker(true);
        } catch (error) {
            setStatus({
                text: error.message || "Submission error. Please try again.",
                color: "#992727",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="content-page">
            <section className="panel full-width">
                <h1>RSVP</h1>
                <p>Please submit your RSVP and include all guest details.</p>

                <form
                    id="rsvp-form"
                    className="rsvp-form"
                    noValidate
                    onSubmit={handleSubmit}
                >
                    <h2>Primary Guest</h2>

                    <div className="form-row">
                        <label htmlFor="parentName">Full Name</label>
                        <input id="parentName" name="parentName" type="text" required />
                    </div>

                    <div className="form-row">
                        <label htmlFor="email">Email</label>
                        <input id="email" name="email" type="email" required />
                    </div>

                    <div className="form-row">
                        <label htmlFor="phone">Phone</label>
                        <input id="phone" name="phone" type="tel" required />
                    </div>

                    <div className="form-row">
                        <label htmlFor="attendance">Will you attend?</label>
                        <select id="attendance" name="attendance" required>
                            <option value="">Select</option>
                            <option value="Yes">Yes, joyfully attending</option>
                            <option value="No">Regretfully unable to attend</option>
                        </select>
                    </div>

                    <div className="form-row">
                        <label htmlFor="guestCount">
                            How many additional guests are you bringing?
                        </label>
                        <input
                            id="guestCount"
                            name="guestCount"
                            type="number"
                            min="0"
                            max="8"
                            value={guestCount}
                            onChange={handleGuestCountChange}
                            required
                        />
                    </div>

                    {guestCount > 0 && (
                        <div className="guest-section" aria-live="polite">
                            {Array.from({ length: guestCount }, (_, i) => (
                                <section key={i} className="guest-card">
                                    <h3>Additional Guest {i + 1}</h3>
                                    <div className="form-row">
                                        <label htmlFor={`guestName-${i}`}>Full Name</label>
                                        <input
                                            id={`guestName-${i}`}
                                            name={`guestName-${i}`}
                                            type="text"
                                            required
                                        />
                                    </div>
                                    <div className="form-row">
                                        <label htmlFor={`guestEmail-${i}`}>Email (optional)</label>
                                        <input
                                            id={`guestEmail-${i}`}
                                            name={`guestEmail-${i}`}
                                            type="email"
                                        />
                                    </div>
                                </section>
                            ))}
                        </div>
                    )}

                    <div className="form-row">
                        <label htmlFor="notes">Notes (dietary/accessibility)</label>
                        <textarea id="notes" name="notes" rows="3" />
                    </div>

                    <button className="btn" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Submit RSVP"}
                    </button>
                </form>

                {status.text && (
                    <p className="form-status" role="status" style={{ color: status.color }}>
                        {status.text}
                    </p>
                )}

                {showTracker && (
                    <a
                        className="btn btn-outline"
                        href={TRACKER_URL}
                        target="_blank"
                        rel="noreferrer"
                        style={{ marginTop: "12px" }}
                    >
                        Open RSVP Tracker
                    </a>
                )}
            </section>
        </div>
    );
}
