"use client";

import { useRef, useState, useCallback } from "react";
import Link from "next/link";

export default function HomePage() {
    const audioRef = useRef(null);
    const [phase, setPhase] = useState(() => {
        if (typeof window !== "undefined" && sessionStorage.getItem("invitationOpened")) {
            return "done";
        }
        return "idle";
    }); // idle | opening | done

    const [musicPlaying, setMusicPlaying] = useState(false);

    const handleOpen = useCallback(() => {
        if (phase !== "idle") return;
        const audio = audioRef.current;
        if (audio) audio.play().then(() => setMusicPlaying(true)).catch(() => {});
        setPhase("opening");
        setTimeout(() => {
            setPhase("done");
            sessionStorage.setItem("invitationOpened", "1");
        }, 1500);
    }, [phase]);

    const stopMusic = useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.pause();
        audio.currentTime = 0;
        setMusicPlaying(false);
    }, []);

    return (
        <>
            {/* Page content — blurred until envelope is opened */}
            <div className={`home-page-content${phase === "done" ? " home-page-revealed" : " home-page-blurred"}`}>
                <section className="hero">
                    <div className="hero-bismillah">
                        <p className="hero-bismillah-arabic">بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ</p>
                        <p className="hero-bismillah-english">In the name of Allah, the Most Gracious, the Most Merciful</p>
                    </div>
                    <h1 className="hero-family">Mansoor Family</h1>
                    <p className="subtitle">
                        cordially invites you to witness and celebrate the beginning of a beautiful forever
                    </p>
                    <h1>Basir <span>&</span> Noor</h1>
                    <p className="hero-inshallah">إِنْ شَاءَ اللَّهُ</p>
                    <div className="cta-group">
                        <Link className="btn" href="/rsvp">RSVP Now</Link>
                    </div>
                </section>

                <div className="hero-gift-note">
                    <p>No boxed gifts, please</p>
                </div>
                <div className="hero-gift-note">
                    <p>Be mindful of the invite headcount</p>
                </div>
            </div>

            {/* Stop music — always above overlay */}
            {musicPlaying && (
                <button className="home-stop-music" onClick={stopMusic} type="button">
                    Stop Music
                </button>
            )}

            {/* Pink envelope overlay */}
            {phase !== "done" && (
                <div
                    className={`env-overlay${phase === "opening" ? " env-opening" : ""}`}
                    onClick={handleOpen}
                    role="button"
                    aria-label="Open your invitation"
                >
                    <div className="env-card">
                        {/* Flap */}
                        <div className="env-flap" aria-hidden="true" />

                        {/* Envelope body */}
                        <div className="env-body">
                            {/* Decorative fold lines */}
                            <span className="env-fold env-fold-left" aria-hidden="true" />
                            <span className="env-fold env-fold-right" aria-hidden="true" />
                            {/* Wax seal */}
                            <div className="env-seal" aria-hidden="true">♥</div>
                            <p className="env-hint">Tap to open</p>
                        </div>
                    </div>
                </div>
            )}

            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <audio ref={audioRef} src="/audio/tum-hi-ho.mp3" loop preload="auto" playsInline />
        </>
    );
}
