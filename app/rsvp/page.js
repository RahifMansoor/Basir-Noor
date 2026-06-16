"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { GUEST_LIST } from "@/data/guestList";

const EVENTS = [
    { key: "duaEKhair", dbKey: "dua_e_khair", label: "Dua E Khair",    date: "September 28, 2026", icon: "🤲", guestKey: "duaEKhair", href: "/dua-e-khair"   },
    { key: "mehndi",    dbKey: "mehndi",       label: "Mehndi",          date: "October 6, 2026",    icon: "🌿", guestKey: "mehndi",    href: "/mehndi"        },
    { key: "barat",     dbKey: "barat",        label: "Nikkah Ceremony", date: "October 10, 2026",   icon: "💍", guestKey: "nikah",     href: "/barat"         },
    { key: "dholki",    dbKey: "welcome_dulhan", label: "Welcome Bride",   date: "October 16, 2026",   icon: "🥁", guestKey: "qawwali",   href: "/welcome-bride" },
    { key: "walima",    dbKey: "walima",        label: "Walima",          date: "October 18, 2026",   icon: "✨", guestKey: "walima",    href: "/walima"        },
];

const EMPTY_EVENTS = { duaEKhair: false, mehndi: false, dholki: false, barat: false, walima: false };
const EMPTY_GUESTS = { duaEKhair: [],    mehndi: [],    dholki: [],    barat: [],    walima: []    };
const EMPTY_UNABLE = { duaEKhair: false, mehndi: false, dholki: false, barat: false, walima: false };

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
    const [unableEvents, setUnableEvents]   = useState({ ...EMPTY_UNABLE });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitResult, setSubmitResult] = useState(null);
    const [error, setError]               = useState("");

    const [lookupName, setLookupName]                   = useState("");
    const [lookupStatus, setLookupStatus]               = useState(null);
    const [isLooking, setIsLooking]                     = useState(false);
    const [lookupSuggestions, setLookupSuggestions]     = useState([]);
    const [lookupShowDropdown, setLookupShowDropdown]   = useState(false);

    const dropdownRef       = useRef(null);
    const lookupDropdownRef = useRef(null);

    const invitedEvents = selectedGuest
        ? EVENTS.filter(ev => selectedGuest[ev.guestKey] != null)
        : [];

    function maxForEvent(ev) {
        return selectedGuest ? (selectedGuest[ev.guestKey] ?? 1) - 1 : 0;
    }

    useEffect(() => {
        if (selectedGuest || nameInput.length < 3) {
            setSuggestions([]); setShowDropdown(false); return;
        }
        const matches = GUEST_LIST.filter(g => matchGuest(g.name, nameInput)).slice(0, 8);
        setSuggestions(matches);
        setShowDropdown(matches.length > 0);
    }, [nameInput, selectedGuest]);

    useEffect(() => {
        if (lookupName.length < 3) { setLookupSuggestions([]); setLookupShowDropdown(false); return; }
        const matches = GUEST_LIST.filter(g => matchGuest(g.name, lookupName)).slice(0, 8);
        setLookupSuggestions(matches);
        setLookupShowDropdown(matches.length > 0);
    }, [lookupName]);

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

    function applyLoadedData(data) {
        setPhone(data.phone ?? "");
        setEmail(data.email ?? "");
        setEvents({ duaEKhair: data.dua_e_khair ?? false, mehndi: data.mehndi ?? false, dholki: data.welcome_dulhan ?? false, barat: data.barat ?? false, walima: data.walima ?? false });
        // unableEvents is stored inside guests under the _unable key
        const saved = (data.guests && typeof data.guests === "object" && !Array.isArray(data.guests))
            ? data.guests : {};
        setGuestsByEvent({
            duaEKhair: Array.isArray(saved.duaEKhair) ? saved.duaEKhair : [],
            mehndi:    Array.isArray(saved.mehndi)    ? saved.mehndi    : [],
            dholki:    Array.isArray(saved.dholki)    ? saved.dholki    : [],
            barat:     Array.isArray(saved.barat)     ? saved.barat     : [],
            walima:    Array.isArray(saved.walima)    ? saved.walima    : [],
        });
        const savedUnable = saved._unable ?? {};
        setUnableEvents({
            duaEKhair: savedUnable.duaEKhair ?? false,
            mehndi:    savedUnable.mehndi    ?? false,
            dholki:    savedUnable.dholki    ?? false,
            barat:     savedUnable.barat     ?? false,
            walima:    savedUnable.walima    ?? false,
        });
    }

    function selectGuest(guest) {
        setSelectedGuest(guest);
        setNameInput(guest.name);
        setShowDropdown(false);
        setSuggestions([]);
        setEvents({ ...EMPTY_EVENTS });
        setGuestsByEvent({ ...EMPTY_GUESTS });
        setUnableEvents({ ...EMPTY_UNABLE });
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
            applyLoadedData(data);
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
        setUnableEvents({ ...EMPTY_UNABLE });
        setError("");
    }

    function toggleEvent(key) {
        setEvents(prev => {
            const next = { ...prev, [key]: !prev[key] };
            if (prev[key]) setGuestsByEvent(g => ({ ...g, [key]: [] }));
            return next;
        });
        setUnableEvents(prev => ({ ...prev, [key]: false }));
    }

    function toggleUnable(key) {
        setUnableEvents(prev => {
            const turningOn = !prev[key];
            if (turningOn) {
                setEvents(e => ({ ...e, [key]: false }));
                setGuestsByEvent(g => ({ ...g, [key]: [] }));
            }
            return { ...prev, [key]: turningOn };
        });
    }

    function addGuest(eventKey, max) {
        setGuestsByEvent(prev => {
            if (prev[eventKey].length >= max) return prev;
            return { ...prev, [eventKey]: [...prev[eventKey], ""] };
        });
    }
    function removeGuest(eventKey, i) {
        setGuestsByEvent(prev => ({ ...prev, [eventKey]: prev[eventKey].filter((_, idx) => idx !== i) }));
    }
    function updateGuest(eventKey, i, val) {
        setGuestsByEvent(prev => ({ ...prev, [eventKey]: prev[eventKey].map((v, idx) => idx === i ? val : v) }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!selectedGuest) { setError("Please select your name from the list first."); return; }
        if (!email.trim()) { setError("Please enter your email address."); return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError("Please enter a valid email address."); return; }
        setIsSubmitting(true); setError("");
        const cleanGuests = {};
        for (const key of Object.keys(guestsByEvent)) {
            cleanGuests[key] = guestsByEvent[key].map(g => g.trim()).filter(Boolean);
        }
        try {
            const res = await fetch("/api/rsvp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: selectedGuest.name, phone, email, events, guests: cleanGuests, unableEvents }),
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
            applyLoadedData(data);
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
        const confirmedEvents    = EVENTS.filter(ev => submitResult.events[ev.dbKey ?? ev.key]);
        const savedGuests        = submitResult.guests;
        const savedUnable        = (savedGuests && typeof savedGuests === "object") ? (savedGuests._unable ?? {}) : {};
        const unableEventsResult = EVENTS.filter(ev => savedUnable[ev.key]);
        return (
            <div className="content-page">
                <section className="panel full-width rsvp-success-panel">
                    <div className="rsvp-success-icon">🎉</div>
                    <h1>JazakAllah Khair, {submitResult.name}!</h1>
                    <p className="rsvp-success-sub">Your RSVP has been saved. We look forward to celebrating with you.</p>

                    {confirmedEvents.length > 0 && (
                        <>
                            <p className="rsvp-success-label">Attending:</p>
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
                    )}

                    {unableEventsResult.length > 0 && (
                        <>
                            <p className="rsvp-success-label" style={{ marginTop: confirmedEvents.length > 0 ? "16px" : undefined }}>Unable to attend:</p>
                            <ul className="rsvp-success-events rsvp-success-events--unable">
                                {unableEventsResult.map(ev => (
                                    <li key={ev.key}>
                                        <span>{ev.icon}</span>
                                        <div><span>{ev.label}</span></div>
                                        <span className="rsvp-success-date">{ev.date}</span>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}

                    {confirmedEvents.length === 0 && unableEventsResult.length === 0 && (
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
                            setUnableEvents({ ...EMPTY_UNABLE });
                            setLookupName(""); setLookupStatus(null);
                        }}
                    >
                        Edit RSVP
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

                    {/* ---- Events with per-event guests + unable toggle ---- */}
                    {selectedGuest && invitedEvents.length > 0 && (
                        <div className="rsvp-events-section">
                            <p className="rsvp-events-label">Which events will you attend?</p>
                            <div className="rsvp-events-list">
                                {invitedEvents.map(ev => {
                                    const max      = maxForEvent(ev);
                                    const evGuests = guestsByEvent[ev.key] ?? [];
                                    const checked  = events[ev.key];
                                    const unable   = unableEvents[ev.key];
                                    return (
                                        <div key={ev.key} className={`rsvp-event-item${checked ? " rsvp-event-item--checked" : unable ? " rsvp-event-item--unable" : ""}`}>
                                            <div className="rsvp-event-header">
                                                <label className="rsvp-event-check-label" htmlFor={`ev-${ev.key}`}>
                                                    <input id={`ev-${ev.key}`} type="checkbox" checked={checked} onChange={() => toggleEvent(ev.key)} />
                                                    <span className="rsvp-event-check-box" aria-hidden="true">{checked ? "✓" : ""}</span>
                                                </label>
                                                <span className="rsvp-event-icon" aria-hidden="true">{ev.icon}</span>
                                                <div className="rsvp-event-info">
                                                    <span className="rsvp-event-name">{ev.label}</span>
                                                    <span className="rsvp-event-date">{ev.date}</span>
                                                    <Link href={ev.href} className="rsvp-event-details-link" target="_blank" rel="noopener noreferrer">View Details →</Link>
                                                </div>
                                                <button
                                                    type="button"
                                                    className={`rsvp-event-unable-btn${unable ? " rsvp-event-unable-btn--active" : ""}`}
                                                    onClick={() => toggleUnable(ev.key)}
                                                >
                                                    {unable ? "Can't attend ✓" : "Can't attend"}
                                                </button>
                                                {max > 0 && !unable && (
                                                    <span className="rsvp-event-seats">+{max} guest{max !== 1 ? "s" : ""}</span>
                                                )}
                                            </div>

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
                                <label htmlFor="rsvp-email">Email <span className="rsvp-required">*</span></label>
                                <input id="rsvp-email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
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
