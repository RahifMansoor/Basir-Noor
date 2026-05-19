"use client";

import { useState } from "react";

const EVENTS = [
    { key: "dholki",          label: "Dholki",                     date: "Date TBD",         icon: "🥁" },
    { key: "mehndi",          label: "Mehndi",                     date: "Date TBD",         icon: "🌿" },
    { key: "dua_e_khair",     label: "Dua E Khair",                date: "Date TBD",         icon: "🤲" },
    { key: "barat",           label: "Dulha Sehar Bandi & Nikkah", date: "October 10, 2026", icon: "💍" },
    { key: "welcome_dulhan",  label: "Welcome Dulhan",             date: "October 16, 2026", icon: "🌸" },
    { key: "walima",          label: "Walima",                     date: "October 18, 2026", icon: "✨" },
];

const EMPTY_EVENTS = {
    dholki: false, mehndi: false, dua_e_khair: false,
    barat: false, welcome_dulhan: false, walima: false,
};

export default function RsvpPage() {
    const [name, setName]   = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [notes, setNotes] = useState("");
    const [events, setEvents] = useState({ ...EMPTY_EVENTS });
    const [guests, setGuests] = useState([]);

    function addGuest() { setGuests((g) => [...g, ""]); }
    function removeGuest(i) { setGuests((g) => g.filter((_, idx) => idx !== i)); }
    function updateGuest(i, val) { setGuests((g) => g.map((v, idx) => idx === i ? val : v)); }

    const [lookupName, setLookupName]   = useState("");
    const [lookupStatus, setLookupStatus] = useState(null); // null | "found" | "not_found" | "error"
    const [isLooking, setIsLooking]     = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitResult, setSubmitResult] = useState(null); // null | { name, events }
    const [error, setError] = useState("");

    function toggleEvent(key) {
        setEvents((prev) => ({ ...prev, [key]: !prev[key] }));
    }

    async function handleLookup(e) {
        e.preventDefault();
        if (!lookupName.trim()) return;
        setIsLooking(true);
        setLookupStatus(null);
        setError("");
        try {
            const res = await fetch(`/api/rsvp?name=${encodeURIComponent(lookupName.trim())}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            if (!data) {
                setLookupStatus("not_found");
                return;
            }
            // Pre-fill the form with the found record
            setName(data.name);
            setPhone(data.phone ?? "");
            setEmail(data.email ?? "");
            setNotes(data.notes ?? "");
            setGuests(Array.isArray(data.guests) ? data.guests : []);
            setEvents({
                dholki:          data.dholki,
                mehndi:          data.mehndi,
                dua_e_khair:     data.dua_e_khair,
                barat:           data.barat,
                welcome_dulhan:  data.welcome_dulhan,
                walima:          data.walima,
            });
            setLookupStatus("found");
            setSubmitResult(null);
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (err) {
            setLookupStatus("error");
            setError(err.message);
        } finally {
            setIsLooking(false);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!name.trim()) {
            setError("Please enter your full name.");
            return;
        }
        setIsSubmitting(true);
        setError("");
        try {
            const res = await fetch("/api/rsvp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, phone, email, events, guests: guests.map((g) => g.trim()).filter(Boolean), notes }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setSubmitResult({ name: data.name, events: data, guests: data.guests ?? [] });
            setLookupStatus(null);
        } catch (err) {
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    const selectedEvents = EVENTS.filter((ev) => events[ev.key]);

    if (submitResult) {
        const confirmedEvents = EVENTS.filter((ev) => submitResult.events[ev.key]);
        return (
            <div className="content-page">
                <section className="panel full-width rsvp-success-panel">
                    <div className="rsvp-success-icon">🎉</div>
                    <h1>JazakAllah Khair, {submitResult.name}!</h1>
                    <p className="rsvp-success-sub">Your RSVP has been saved. We look forward to celebrating with you.</p>

                    {submitResult.guests.length > 0 && (
                        <p className="rsvp-success-sub">
                            Guests listed: {submitResult.guests.join(", ")}
                        </p>
                    )}

                    {confirmedEvents.length > 0 ? (
                        <>
                            <p className="rsvp-success-label">You are attending:</p>
                            <ul className="rsvp-success-events">
                                {confirmedEvents.map((ev) => (
                                    <li key={ev.key}>
                                        <span>{ev.icon}</span>
                                        <span>{ev.label}</span>
                                        <span className="rsvp-success-date">{ev.date}</span>
                                    </li>
                                ))}
                            </ul>
                        </>
                    ) : (
                        <p className="rsvp-success-sub">No events selected — you can edit your RSVP anytime.</p>
                    )}

                    <button
                        className="btn btn-outline"
                        style={{ marginTop: "2rem" }}
                        onClick={() => {
                            setSubmitResult(null);
                            setName(""); setPhone(""); setEmail(""); setNotes("");
                            setEvents({ ...EMPTY_EVENTS }); setGuests([]);
                            setLookupName(""); setLookupStatus(null);
                        }}
                    >
                        Edit or Submit Another RSVP
                    </button>
                </section>
            </div>
        );
    }

    return (
        <div className="content-page">
            <section className="panel full-width">
                <h1>RSVP</h1>
                <p>Select the events you plan to attend. You can return anytime and edit your response using your name.</p>

                {lookupStatus === "found" && (
                    <div className="rsvp-lookup-banner rsvp-lookup-banner--found">
                        RSVP found — edit your selections below and save.
                    </div>
                )}

                <form className="rsvp-form" onSubmit={handleSubmit} noValidate>

                    {/* ---- Name ---- */}
                    <div className="form-row">
                        <label htmlFor="rsvp-name">Full Name <span className="rsvp-required">*</span></label>
                        <input
                            id="rsvp-name"
                            type="text"
                            placeholder="e.g. Fatima Ahmed"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    {/* ---- Guests ---- */}
                    <div className="rsvp-guests-block">
                        <p className="rsvp-guests-disclaimer">
                            Bringing family or friends? Add their names below — all guests share your event selections.
                        </p>
                        {guests.length > 0 && (
                            <ul className="rsvp-guests-list">
                                {guests.map((g, i) => (
                                    <li key={i} className="rsvp-guest-row">
                                        <input
                                            className="rsvp-guest-input"
                                            type="text"
                                            placeholder={`Guest ${i + 1} full name`}
                                            value={g}
                                            onChange={(e) => updateGuest(i, e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            className="rsvp-guest-remove"
                                            aria-label="Remove guest"
                                            onClick={() => removeGuest(i)}
                                        >
                                            ✕
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <button type="button" className="rsvp-add-guest-btn" onClick={addGuest}>
                            + Add Guest
                        </button>
                    </div>

                    {/* ---- Events ---- */}
                    <div className="rsvp-events-section">
                        <p className="rsvp-events-label">Which events will you attend?</p>
                        <div className="rsvp-events-grid">
                            {EVENTS.map((ev) => (
                                <label key={ev.key} className={`rsvp-event-card${events[ev.key] ? " rsvp-event-card--checked" : ""}`}>
                                    <input
                                        type="checkbox"
                                        checked={events[ev.key]}
                                        onChange={() => toggleEvent(ev.key)}
                                    />
                                    <span className="rsvp-event-check-mark" aria-hidden="true">
                                        {events[ev.key] ? "✓" : ""}
                                    </span>
                                    <span className="rsvp-event-icon">{ev.icon}</span>
                                    <span className="rsvp-event-name">{ev.label}</span>
                                    <span className="rsvp-event-date">{ev.date}</span>
                                </label>
                            ))}
                        </div>
                        {selectedEvents.length > 0 && (
                            <p className="rsvp-selected-summary">
                                Attending {selectedEvents.length} event{selectedEvents.length > 1 ? "s" : ""}:&nbsp;
                                {selectedEvents.map((e) => e.label).join(", ")}
                            </p>
                        )}
                    </div>

                    {/* ---- Optional contact ---- */}
                    <div className="rsvp-optional-grid">
                        <div className="form-row">
                            <label htmlFor="rsvp-phone">Phone <span className="rsvp-optional-tag">(optional)</span></label>
                            <input
                                id="rsvp-phone"
                                type="tel"
                                placeholder="+1 (555) 000-0000"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>
                        <div className="form-row">
                            <label htmlFor="rsvp-email">Email <span className="rsvp-optional-tag">(optional)</span></label>
                            <input
                                id="rsvp-email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <label htmlFor="rsvp-notes">Notes <span className="rsvp-optional-tag">(dietary, accessibility, etc.)</span></label>
                        <textarea
                            id="rsvp-notes"
                            rows={3}
                            placeholder="Anything we should know..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    {error && <p className="rsvp-error">{error}</p>}

                    <button className="btn" type="submit" disabled={isSubmitting || !name.trim()}>
                        {isSubmitting ? "Saving..." : lookupStatus === "found" ? "Save Changes" : "Submit RSVP"}
                    </button>
                </form>
            </section>

            {/* ---- Lookup / Edit section ---- */}
            <section className="panel full-width rsvp-lookup-section">
                <h2>Already RSVP'd?</h2>
                <p>Enter your name to look up and edit your existing response.</p>
                <form className="rsvp-lookup-form" onSubmit={handleLookup} noValidate>
                    <input
                        type="text"
                        className="rsvp-lookup-input"
                        placeholder="Your full name"
                        value={lookupName}
                        onChange={(e) => setLookupName(e.target.value)}
                        required
                    />
                    <button
                        className="btn btn-outline"
                        type="submit"
                        disabled={isLooking || !lookupName.trim()}
                    >
                        {isLooking ? "Looking..." : "Find My RSVP"}
                    </button>
                </form>

                {lookupStatus === "not_found" && (
                    <p className="rsvp-lookup-msg rsvp-lookup-msg--miss">
                        No RSVP found for "{lookupName}". Check your spelling or submit a new one above.
                    </p>
                )}
                {lookupStatus === "error" && (
                    <p className="rsvp-lookup-msg rsvp-lookup-msg--error">{error}</p>
                )}
            </section>
        </div>
    );
}
