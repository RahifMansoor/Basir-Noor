"use client";

import { useState, useRef, useEffect } from "react";
import { GUEST_LIST } from "@/data/guestList";

// key = DB column name; guestKey = field in GUEST_LIST
const EVENTS = [
    { key: "dholki",  label: "Dholki",             date: "Date TBD",         icon: "🥁", guestKey: "qawwali" },
    { key: "barat",   label: "Nikkah Ceremony",  date: "October 10, 2026", icon: "💍", guestKey: "nikah"   },
    { key: "walima",  label: "Walima",            date: "October 18, 2026", icon: "✨", guestKey: "walima"  },
];

const EMPTY_EVENTS = { dholki: false, barat: false, walima: false };

function matchGuest(name, query) {
    const q = query.toLowerCase();
    const n = name.toLowerCase();
    return n.split(/[\s&]+/).filter(Boolean).some(word => word.startsWith(q));
}

export default function RsvpPage() {
    const [nameInput, setNameInput]       = useState("");
    const [suggestions, setSuggestions]   = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedGuest, setSelectedGuest] = useState(null);

    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [notes, setNotes] = useState("");
    const [events, setEvents] = useState({ ...EMPTY_EVENTS });
    const [guests, setGuests] = useState([]);

    const [isSubmitting, setIsSubmitting]   = useState(false);
    const [submitResult, setSubmitResult]   = useState(null);
    const [error, setError]                 = useState("");

    const [lookupName, setLookupName]       = useState("");
    const [lookupStatus, setLookupStatus]   = useState(null);
    const [isLooking, setIsLooking]         = useState(false);

    const dropdownRef = useRef(null);

    // Events and guest cap derived from the selected guest
    const invitedEvents = selectedGuest
        ? EVENTS.filter(ev => selectedGuest[ev.guestKey] != null)
        : [];

    const maxGuests = selectedGuest && invitedEvents.length > 0
        ? Math.max(...invitedEvents.map(ev => selectedGuest[ev.guestKey])) - 1
        : 0;

    // Rebuild suggestions whenever nameInput changes
    useEffect(() => {
        if (selectedGuest || nameInput.length < 3) {
            setSuggestions([]);
            setShowDropdown(false);
            return;
        }
        const matches = GUEST_LIST.filter(g => matchGuest(g.name, nameInput)).slice(0, 8);
        setSuggestions(matches);
        setShowDropdown(matches.length > 0);
    }, [nameInput, selectedGuest]);

    // Close dropdown on outside click
    useEffect(() => {
        function onMouseDown(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener("mousedown", onMouseDown);
        return () => document.removeEventListener("mousedown", onMouseDown);
    }, []);

    function selectGuest(guest) {
        setSelectedGuest(guest);
        setNameInput(guest.name);
        setShowDropdown(false);
        setSuggestions([]);
        // Pre-check all invited events
        const newEvents = { ...EMPTY_EVENTS };
        EVENTS.forEach(ev => {
            if (guest[ev.guestKey] != null) newEvents[ev.key] = true;
        });
        setEvents(newEvents);
        setGuests([]);
        setError("");
    }

    function clearGuest() {
        setSelectedGuest(null);
        setNameInput("");
        setEvents({ ...EMPTY_EVENTS });
        setGuests([]);
        setError("");
    }

    function addGuest() {
        if (guests.length < maxGuests) setGuests(g => [...g, ""]);
    }
    function removeGuest(i)     { setGuests(g => g.filter((_, idx) => idx !== i)); }
    function updateGuest(i, val){ setGuests(g => g.map((v, idx) => idx === i ? val : v)); }
    function toggleEvent(key)   { setEvents(prev => ({ ...prev, [key]: !prev[key] })); }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!selectedGuest) {
            setError("Please select your name from the list first.");
            return;
        }
        setIsSubmitting(true);
        setError("");
        try {
            const res = await fetch("/api/rsvp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: selectedGuest.name,
                    phone, email, events,
                    guests: guests.map(g => g.trim()).filter(Boolean),
                    notes,
                }),
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

    async function handleLookup(e) {
        e.preventDefault();
        if (!lookupName.trim()) return;
        setIsLooking(true);
        setLookupStatus(null);
        setError("");
        try {
            const res  = await fetch(`/api/rsvp?name=${encodeURIComponent(lookupName.trim())}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            if (!data) { setLookupStatus("not_found"); return; }

            // Try to match back to guest list for event restrictions
            const guest = GUEST_LIST.find(g => g.name.toLowerCase() === data.name.toLowerCase())
                ?? { name: data.name, qawwali: null, nikah: null, walima: null };
            setSelectedGuest(guest);
            setNameInput(data.name);
            setPhone(data.phone ?? "");
            setEmail(data.email ?? "");
            setNotes(data.notes ?? "");
            setGuests(Array.isArray(data.guests) ? data.guests : []);
            setEvents({
                dholki: data.dholki ?? false,
                barat:  data.barat  ?? false,
                walima: data.walima ?? false,
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

    const selectedEvents = EVENTS.filter(ev => events[ev.key]);

    // ---- Success screen ----
    if (submitResult) {
        const confirmedEvents = EVENTS.filter(ev => submitResult.events[ev.key]);
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
                                {confirmedEvents.map(ev => (
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
                            setSelectedGuest(null); setNameInput("");
                            setPhone(""); setEmail(""); setNotes("");
                            setEvents({ dholki: false, barat: false, walima: false }); setGuests([]);
                            setLookupName(""); setLookupStatus(null);
                        }}
                    >
                        Edit or Submit Another RSVP
                    </button>
                </section>
            </div>
        );
    }

    // ---- Main form ----
    return (
        <div className="content-page">
            <section className="panel full-width">
                <h1>RSVP</h1>
                <p>Type your name below to find your invitation, then confirm which events you'll attend.</p>

                {lookupStatus === "found" && (
                    <div className="rsvp-lookup-banner rsvp-lookup-banner--found">
                        RSVP found — edit your selections below and save.
                    </div>
                )}

                <form className="rsvp-form" onSubmit={handleSubmit} noValidate>

                    {/* ---- Name autocomplete ---- */}
                    <div className="form-row">
                        <label htmlFor="rsvp-name">
                            Your Name <span className="rsvp-required">*</span>
                        </label>

                        {selectedGuest ? (
                            <div className="rsvp-name-selected">
                                <span>{selectedGuest.name}</span>
                                <button
                                    type="button"
                                    className="rsvp-name-clear"
                                    aria-label="Clear name"
                                    onClick={clearGuest}
                                >
                                    ✕
                                </button>
                            </div>
                        ) : (
                            <div className="rsvp-name-wrap" ref={dropdownRef}>
                                <input
                                    id="rsvp-name"
                                    type="text"
                                    placeholder="Type at least 3 letters of your name…"
                                    value={nameInput}
                                    autoComplete="off"
                                    onChange={e => setNameInput(e.target.value)}
                                    onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
                                />
                                {showDropdown && (
                                    <ul className="rsvp-suggestions" role="listbox">
                                        {suggestions.map((g, i) => (
                                            <li
                                                key={i}
                                                className="rsvp-suggestion-item"
                                                role="option"
                                                onMouseDown={() => selectGuest(g)}
                                            >
                                                {g.name}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                {nameInput.length >= 3 && !showDropdown && (
                                    <p className="rsvp-no-match">
                                        Name not found. Please check your spelling or contact us directly.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ---- Events (only after name selected) ---- */}
                    {selectedGuest && invitedEvents.length > 0 && (
                        <div className="rsvp-events-section">
                            <p className="rsvp-events-label">Which events will you attend?</p>
                            <div className="rsvp-events-grid">
                                {invitedEvents.map(ev => (
                                    <label
                                        key={ev.key}
                                        className={`rsvp-event-card${events[ev.key] ? " rsvp-event-card--checked" : ""}`}
                                    >
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
                                    {selectedEvents.map(ev => ev.label).join(", ")}
                                </p>
                            )}
                        </div>
                    )}

                    {selectedGuest && invitedEvents.length === 0 && (
                        <p className="rsvp-no-events">
                            We're still finalising your invitation details. Please check back soon or contact us directly.
                        </p>
                    )}

                    {/* ---- Additional guests (capped per invite) ---- */}
                    {selectedGuest && maxGuests > 0 && (
                        <div className="rsvp-guests-block">
                            <p className="rsvp-guests-disclaimer">
                                Your invitation includes up to {maxGuests} additional guest{maxGuests !== 1 ? "s" : ""}. Add their names below.
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
                                                onChange={e => updateGuest(i, e.target.value)}
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
                            {guests.length < maxGuests && (
                                <button type="button" className="rsvp-add-guest-btn" onClick={addGuest}>
                                    + Add Guest ({guests.length}/{maxGuests})
                                </button>
                            )}
                        </div>
                    )}

                    {/* ---- Optional contact + notes ---- */}
                    {selectedGuest && (
                        <>
                            <div className="rsvp-optional-grid">
                                <div className="form-row">
                                    <label htmlFor="rsvp-phone">Phone <span className="rsvp-optional-tag">(optional)</span></label>
                                    <input
                                        id="rsvp-phone"
                                        type="tel"
                                        placeholder="+1 (555) 000-0000"
                                        value={phone}
                                        onChange={e => setPhone(e.target.value)}
                                    />
                                </div>
                                <div className="form-row">
                                    <label htmlFor="rsvp-email">Email <span className="rsvp-optional-tag">(optional)</span></label>
                                    <input
                                        id="rsvp-email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <label htmlFor="rsvp-notes">Notes <span className="rsvp-optional-tag">(dietary, accessibility, etc.)</span></label>
                                <textarea
                                    id="rsvp-notes"
                                    rows={3}
                                    placeholder="Anything we should know…"
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                />
                            </div>
                        </>
                    )}

                    {error && <p className="rsvp-error">{error}</p>}

                    <button
                        className="btn"
                        type="submit"
                        disabled={isSubmitting || !selectedGuest}
                    >
                        {isSubmitting ? "Saving…" : lookupStatus === "found" ? "Save Changes" : "Submit RSVP"}
                    </button>
                </form>
            </section>

            {/* ---- Look up existing RSVP ---- */}
            <section className="panel full-width rsvp-lookup-section">
                <h2>Already RSVP'd?</h2>
                <p>Enter your name to look up and edit your existing response.</p>
                <form className="rsvp-lookup-form" onSubmit={handleLookup} noValidate>
                    <input
                        type="text"
                        className="rsvp-lookup-input"
                        placeholder="Your full name"
                        value={lookupName}
                        onChange={e => setLookupName(e.target.value)}
                        required
                    />
                    <button
                        className="btn btn-outline"
                        type="submit"
                        disabled={isLooking || !lookupName.trim()}
                    >
                        {isLooking ? "Looking…" : "Find My RSVP"}
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
