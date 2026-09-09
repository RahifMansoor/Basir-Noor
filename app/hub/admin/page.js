"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import HubAdminBroadcasts from "@/components/HubAdminBroadcasts";
import HubAdminPhotos from "@/components/HubAdminPhotos";

const STORAGE_KEY = "hubAdminKey";

export default function HubAdminPage() {
    const [checking, setChecking] = useState(true);
    const [adminKey, setAdminKey] = useState(null);
    const [passcode, setPasscode] = useState("");
    const [verifying, setVerifying] = useState(false);
    const [error, setError] = useState("");

    async function verify(key) {
        const res = await fetch("/api/hub/admin/verify", {
            method: "POST",
            headers: { "x-hub-admin-key": key },
        });
        return res.ok;
    }

    useEffect(() => {
        (async () => {
            const stored = window.localStorage.getItem(STORAGE_KEY);
            if (stored && (await verify(stored))) {
                setAdminKey(stored);
            } else if (stored) {
                window.localStorage.removeItem(STORAGE_KEY);
            }
            setChecking(false);
        })();
    }, []);

    async function handleUnlock(e) {
        e.preventDefault();
        setVerifying(true);
        setError("");
        try {
            const ok = await verify(passcode);
            if (!ok) throw new Error("Incorrect passcode.");
            window.localStorage.setItem(STORAGE_KEY, passcode);
            setAdminKey(passcode);
        } catch (err) {
            setError(err.message);
        } finally {
            setVerifying(false);
        }
    }

    function handleLogOut() {
        window.localStorage.removeItem(STORAGE_KEY);
        setAdminKey(null);
        setPasscode("");
    }

    return (
        <div className="content-page event-page hub-page">
            <section className="event-hero">
                <p className="eyebrow">The Hub</p>
                <h1>🛠️ Admin</h1>
                <p>Post broadcasts and manage shared photos.</p>
            </section>

            {checking && <p className="bp-wish-loading">Checking access...</p>}

            {!checking && !adminKey && (
                <section className="hub-admin-gate">
                    <form className="bp-wish-form" onSubmit={handleUnlock} noValidate>
                        <div className="bp-wish-field">
                            <label className="bp-wish-label" htmlFor="admin-passcode">Passcode</label>
                            <input
                                id="admin-passcode"
                                className="bp-wish-input"
                                type="password"
                                inputMode="numeric"
                                autoComplete="off"
                                required
                                autoFocus
                                value={passcode}
                                onChange={(e) => setPasscode(e.target.value)}
                            />
                        </div>
                        {error && <p className="bp-wish-status bp-wish-status--error">{error}</p>}
                        <button className="bp-wish-submit" type="submit" disabled={verifying || !passcode}>
                            {verifying ? "Checking…" : "Unlock"}
                        </button>
                    </form>
                </section>
            )}

            {!checking && adminKey && (
                <>
                    <div className="hub-admin-logout">
                        <button type="button" className="btn btn-outline" onClick={handleLogOut}>
                            Log Out
                        </button>
                    </div>
                    <HubAdminBroadcasts adminKey={adminKey} />
                    <HubAdminPhotos adminKey={adminKey} category="gallery" title="📸 Photos" />
                    <HubAdminPhotos adminKey={adminKey} category="dream-team" title="🌟 Dream Team Photos" />
                </>
            )}

            <div className="hub-back-link">
                <Link className="btn btn-outline" href="/hub">
                    ← Back to Hub
                </Link>
            </div>
        </div>
    );
}
