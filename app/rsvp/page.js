"use client";

import { useState, useRef, useEffect } from "react";
import { GUEST_LIST } from "@/data/guestList";

// key = DB column name; guestKey = field in GUEST_LIST
const EVENTS = [
    { key: "dholki",  label: "Welcome Bride",    date: "Date TBD",         icon: "🥁", guestKey: "qawwali" },
    { key: "barat",   label: "Nikkah Ceremony",  date: "October 10, 2026", icon: "💍", guestKey: "nikah"   },
    { key: "walima",  label: "Walima",            date: "October 18, 2026", icon: "✨", guestKey: "walima"  },
];

const EMPTY_EVENTS       = { dholki: false, barat: false, walima: false };
const EMPTY_GUESTS       = { dholki: [],    barat: [],    walima: []    };

function matchGuest(name, query) {
    const q = query.toLowerCase();
    return name.toLowerCase().split(/[\s&]+/).filter(Boolean).some(w => w.startsWith(q));
}

export default function RsvpPage() {
    const [nameInput, setNameInput]         = useState("");
    const [suggestions, setSuggestions]     = useState([]);
    const [showDropdown, setShowDropdown]   = useState(false);
    const [selectedGuest, setSelectedGuest] = useState(null);

    const [phone, setPhone]   = useState("");
    const [email, setEmail]   = useState("");
    const [events, setEvents] = useState({ ...EMPTY_EVENTS });
    const [guestsByEvent, setGuestsByEvent] = useState({ ...EMPTY_GUESTS });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitResult, setSubmitResult] = useState(null);
    const [error, setError]               = useState("");

    const [lookupName, setLookupName]             = useState("");
    const [lookupStatus, setLookupStatus]         = useState(null);
    const [isLooking, setIsLooking]               = useState(false);
    const [lookupSuggestions, setLookupSuggestions] = useState([]);
    const [lookupShowDropdown, setLookupShowDropdown] = useState(false);

    const dropdownRef       = useRef(null);
    const lookupDropdownRef = useRef(null);

    const invitedEvents = selectedGuest
        ? EVENTS.filter(ev => selectedGuest[ev.guestKey] != null)
        : [];

    function maxForEvent(ev) {
        return selectedGuest ? (selectedGuest[ev.guestKey] ?? 1) - 1 : 0;
    }

    // Suggestions
    useEffect(() => {
        if (selectedGuest || nameInput.length < 3) {
            setSuggestions([]); setShowDropdown(false); return;
        }
        const matches = GUEST_LIST.filter(g => matchGuest(g.name, nameInput)).slice(0, 8);
        setSuggestions(matches);
        setShowDropdown(matches.length > 0);
    }, [nameInput, selectedGuest]);

    // Lookup suggestions
    useEffect(() => {
        if (lookupName.length < 3) { setLookupSuggestions([]); setLookupShowDropdown(false); return; }
        const matches = GUEST_LIST.filter(g => matchGuest(g.name, lookupName)).slice(0, 8);
        setLookupSuggestions(matches);
        setLookupShowDropdown(matches.length > 0);
    }, [lookupName]);

    // Close dropdowns on outside click
    useEffect(() => {
        function onMouseDown(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target))
                setShowDropdown(false);
            if (lookupDropdownRef.current && !lookupDropdownRef.current.contains(e.target))
                setLookupShowDropdown(false);
        }
        document.addEventListener("mousedown", onMouseDown);
        return () => document.removeEventListener("mousedown", onMouseDown);
    }, []);

    function selectGuest(guest) {
        setSelectedGuest(guest);
        setNameInput(guest.name);
        setShowDropdown(false);
        setSuggestions([]);
        setEvents({ ...EMPTY_EVENTS });   // all unchecked
        setGuestsByEvent({ ...EMPTY_GUESTS });
        setError("");
    }

    async function selectLookupGuest(guest) {
        setLookupName(guest.name);
        setLookupSuggestions([]);
        setLookupShowDropdown(false);
        setLookupStatus(null); setError("");
        setIsLooking(true);
        try {
            const res  = await fetch(`/api/rsvp?name=${encodeURIComponent(guest.name)}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            if (!data) { setLookupStatus("not_found"); return; }
            setSelectedGuest(guest);
            setNameInput(guest.name);
            setPhone(data.phone ?? "");
            setEmail(data.email ?? "");
            setEvents({ dholki: data.dholki ?? false, barat: data.barat ?? false, walima: data.walima ?? false });
            const saved = data.guests;
            if (saved && typeof saved === "object" && !Array.isArray(saved)) {
                setGuestsByEvent({
                    dholki: Array.isArray(saved.dholki) ? saved.dholki : [],
                    barat:  Array.isArray(saved.barat)  ? saved.barat  : [],
                    walima: Array.isArray(saved.walima) ? saved.walima : [],
                });
            } else {
                setGuestsByEvent({ ...EMPTY_GUESTS });
            }
            setLookupStatus("found"); setSubmitResult(null);
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (err) {
            setLookupStatus("error"); setError(err.message);
        } finally {
            setIsLooking(false);
        }
    }

    function clearGuest() {
        setSelectedGuest(null); setNameInput("");
        setEvents({ ...EMPTY_EVENTS });
        setGuestsByEvent({ ...EMPTY_GUESTS });
        setError("");
    }

    function toggleEvent(key) {
        setEvents(prev => {
            const next = { ...prev, [key]: !prev[key] };
            // clear that event's guests when unchecking
            if (prev[key]) setGuestsByEvent(g => ({ ...g, [key]: [] }));
            return next;
        });
    }

    function addGuest(eventKey, max) {
        setGuestsByEvent(prev => {
            if (prev[eventKey].length >= max) return prev;
            return { ...prev, [eventKey]: [...prev[eventKey], ""] };
        });
    }
    function removeGuest(eventKey, i) {
        setGuestsByEvent(prev => ({
            ...prev, [eventKey]: prev[eventKey].filter((_, idx) => idx !== i),
        }));
    }
    function updateGuest(eventKey, i, val) {
        setGuestsByEvent(prev => ({
            ...prev, [eventKey]: prev[eventKey].map((v, idx) => idx === i ? val : v),
        }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!selectedGuest) { setError("Please select your name from the list first."); return; }
        setIsSubmitting(true); setError("");
        // Clean up guests: trim, remove empty strings
        const cleanGuests = {};
        for (const key of Object.keys(guestsByEvent)) {
            cleanGuests[key] = guestsByEvent[key].map(g => g.trim()).filter(Boolean);
        }
        try {
            const res = await fetch("/api/rsvp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: selectedGuest.name, phone, email, events, guests: cleanGuests }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setSubmitResult({ name: data.name, events: data, guests: data.guests ?? {} });
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
        setIsLooking(true); setLookupStatus(null); setError("");
        try {
            const res  = await fetch(`/api/rsvp?name=${encodeURIComponent(lookupName.trim())}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            if (!data) { setLookupStatus("not_found"); return; }

            const guest = GUEST_LIST.find(g => g.name.toLowerCase() === data.name.toLowerCase())
                ?? { name: data.name, qawwali: null, nikah: null, walima: null };
            setSelectedGuest(guest);
            setNameInput(data.name);
            setPhone(data.phone ?? "");
            setEmail(data.email ?? "");
            setEvents({ dholki: data.dholki ?? false, barat: data.barat ?? false, walima: data.walima ?? false });

            // Restore per-event guests (handles both old flat array and new object)
            const saved = data.guests;
            if (saved && typeof saved === "object" && !Array.isArray(saved)) {
                setGuestsByEvent({
                    dholki: Array.isArray(saved.dholki) ? saved.dholki : [],
                    barat:  Array.isArray(saved.barat)  ? saved.barat  : [],
                    walima: Array.isArray(saved.walima) ? saved.walima : [],
                });
            } else {
                setGuestsByEvent({ ...EMPTY_GUESTS });
            }
            setLookupStatus("found"); setSubmitResult(null);
            window.scrollTo({ top: 0, behavior: "smooth" });
        } catch (err) {
            setLookupStatus("error"); setError(err.message);
        } finally {
            setIsLooking(false);
        }
    }

    const selectedEvents = EVENTS.filter(ev => events[ev.key]);

    // ---- Success screen ----
    if (submitResult) {
        const confirmedEvents = EVENTS.filter(ev => submitResult.events[ev.key]);
        const savedGuests = submitResult.guests;
        return (
            <div className="content-page">
                <section className="panel full-width rsvp-success-panel">
                    <div className="rsvp-success-icon">🎉</div>
                    <h1>JazakAllah Khair, {submitResult.name}!</h1>
                    <p className="rsvp-success-sub">Your RSVP has been saved. We look forward to celebrating with you.</p>

                    {confirmedEvents.length > 0 ? (
                        <>
                            <p className="rsvp-success-label">You are attending:</p>
                            <ul className="rsvp-success-events">
                                {confirmedEvents.map(ev => {
                                    const evGuests = savedGuests?.[ev.key] ?? [];
                                    return (
                                        <li key={ev.key}>
                                            <span>{ev.icon}</span>
                                            <div>
                                                <span>{ev.label}</span>
                                                {evGuests.length > 0 && (
                                                    <span className="rsvp-success-guests">+ {evGuests.join(", ")}</span>
                                                )}
                                            </div>
                                            <span className="rsvp-success-date">{ev.date}</span>
                                        </li>
                                    );
                                })}
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
                            setPhone(""); setEmail("");
                            setEvents({ ...EMPTY_EVENTS });
                            setGuestsByEvent({ ...EMPTY_GUESTS });
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
                                <button type="button" className="rsvp-name-clear" aria-label="Clear name" onClick={clearGuest}>✕</button>
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
                                            <li key={i} className="rsvp-suggestion-item" role="option" onMouseDown={() => selectGuest(g)}>
                                                {g.name}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                {nameInput.length >= 3 && !showDropdown && (
                                    <p className="rsvp-no-match">Name not found. Please check your spelling or contact us directly.</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ---- Events with per-event guests ---- */}
                    {selectedGuest && invitedEvents.length > 0 && (
                        <div className="rsvp-events-section">
                            <p className="rsvp-events-label">Which events will you attend?</p>
                            <div className="rsvp-events-list">
                                {invitedEvents.map(ev => {
                                    const max = maxForEvent(ev);
                                    const evGuests = guestsByEvent[ev.key] ?? [];
                                    const checked = events[ev.key];
                                    return (
                                        <div key={ev.key} className={`rsvp-event-item${checked ? " rsvp-event-item--checked" : ""}`}>
                                            <label className="rsvp-event-header">
                                                <input type="checkbox" checked={checked} onChange={() => toggleEvent(ev.key)} />
                                                <span className="rsvp-event-check-box" aria-hidden="true">{checked ? "✓" : ""}</span>
                                                <span className="rsvp-event-icon">{ev.icon}</span>
                                                <div className="rsvp-event-info">
                                                    <span className="rsvp-event-name">{ev.label}</span>
                                                    <span className="rsvp-event-date">{ev.date}</span>
                                                </div>
                                                {max > 0 && (
                                                    <span className="rsvp-event-seats">+{max} guest{max !== 1 ? "s" : ""}</span>
                                                )}
                                            </label>

                                            {checked && max > 0 && (
                                                <div className="rsvp-event-guests">
                                                    {evGuests.map((g, i) => (
                                                        <div key={i} className="rsvp-guest-row">
                                                            <input
                                                                className="rsvp-guest-input"
                                                                type="text"
                                                                placeholder={`Guest ${i + 1} full name`}
                                                                value={g}
                                                                onChange={e => updateGuest(ev.key, i, e.target.value)}
                                                            />
                                                            <button type="button" className="rsvp-guest-remove" aria-label="Remove guest" onClick={() => removeGuest(ev.key, i)}>✕</button>
                                                        </div>
                                                    ))}
                                                    {evGuests.length < max && (
                                                        <button type="button" className="rsvp-add-guest-btn" onClick={() => addGuest(ev.key, max)}>
                                                            + Add Guest ({evGuests.length}/{max})
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
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

                    {/* ---- Optional contact ---- */}
                    {selectedGuest && (
                        <div className="rsvp-optional-grid">
                            <div className="form-row">
                                <label htmlFor="rsvp-phone">Phone <span className="rsvp-optional-tag">(optional)</span></label>
                                <input id="rsvp-phone" type="tel" placeholder="+1 (555) 000-0000" value={phone} onChange={e => setPhone(e.target.value)} />
                            </div>
                            <div className="form-row">
                                <label htmlFor="rsvp-email">Email <span className="rsvp-optional-tag">(optional)</span></label>
                                <input id="rsvp-email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                            </div>
                        </div>
                    )}

                    {error && <p className="rsvp-error">{error}</p>}

                    <button className="btn" type="submit" disabled={isSubmitting || !selectedGuest}>
                        {isSubmitting ? "Saving…" : lookupStatus === "found" ? "Save Changes" : "Submit RSVP"}
                    </button>
                </form>
            </section>

            {/* ---- Look up existing RSVP ---- */}
            <section className="panel full-width rsvp-lookup-section">
                <h2>Already RSVP'd?</h2>
                <p>Enter your name to look up and edit your existing response.</p>
                <form className="rsvp-lookup-form" onSubmit={handleLookup} noValidate>
                    <div className="rsvp-name-wrap" ref={lookupDropdownRef} style={{ flex: 1 }}>
                        <input
                            type="text"
                            className="rsvp-lookup-input"
                            placeholder="Type at least 3 letters of your name…"
                            value={lookupName}
                            autoComplete="off"
                            onChange={e => setLookupName(e.target.value)}
                            onFocus={() => lookupSuggestions.length > 0 && setLookupShowDropdown(true)}
                            required
                        />
                        {lookupShowDropdown && (
                            <ul className="rsvp-suggestions" role="listbox">
                                {lookupSuggestions.map((g, i) => (
                                    <li key={i} className="rsvp-suggestion-item" role="option" onMouseDown={() => selectLookupGuest(g)}>
                                        {g.name}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <button className="btn btn-outline" type="submit" disabled={isLooking || !lookupName.trim()}>
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
