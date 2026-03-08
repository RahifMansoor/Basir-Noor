"use client";

import { useState } from "react";
import Link from "next/link";
import { eventDetails } from "@/data/eventDetails";

const DUAS = [
    {
        id: 1,
        title: "Dua For Blessing The Marriage",
        arabic: "بَارَكَ اللَّهُ لَكَ وَبَارَكَ عَلَيْكَ وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ",
        transliteration:
            "Barakallahu laka, wa baraka alayka, wa jamaa baynakuma fi khayr.",
        translation:
            "May Allah bless you, shower His blessings upon you, and join you together in goodness.",
        reference: "Sunan Abi Dawud",
    },
    {
        id: 2,
        title: "Dua For Righteous Spouses",
        arabic:
            "رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا",
        transliteration:
            "Rabbana hab lana min azwajina wa dhurriyyatina qurrata ayunin wajalna lil-muttaqina imama.",
        translation:
            "Our Lord, grant us from among our spouses and offspring comfort to our eyes and make us an example for the righteous.",
        reference: "Qur'an 25:74",
    },
    {
        id: 3,
        title: "Dua For Goodness And Ease",
        arabic: "رَبِّ إِنِّي لِمَا أَنْزَلْتَ إِلَيَّ مِنْ خَيْرٍ فَقِيرٌ",
        transliteration: "Rabbi inni lima anzalta ilayya min khayrin faqir.",
        translation:
            "My Lord, I am truly in need of whatever good You send down to me.",
        reference: "Qur'an 28:24",
    },
    {
        id: 4,
        title: "Dua For Good In This Life And The Next",
        arabic:
            "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
        transliteration:
            "Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina adhaban-nar.",
        translation:
            "Our Lord, grant us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.",
        reference: "Qur'an 2:201",
    },
    {
        id: 5,
        title: "Dua For Mercy Between Hearts",
        arabic:
            "وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُمْ مِنْ أَنْفُسِكُمْ أَزْوَاجًا لِتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُمْ مَوَدَّةً وَرَحْمَةً",
        transliteration:
            "Wa min ayatihi an khalaqa lakum min anfusikum azwajan litaskunu ilayha wa jaala baynakum mawaddatan wa rahmah.",
        translation:
            "And among His signs is that He created for you spouses from among yourselves so that you may find tranquility in them, and He placed between you love and mercy.",
        reference: "Qur'an 30:21",
    },
];

function getRandomIndex(excludeIndex) {
    if (DUAS.length === 1) return 0;

    let nextIndex = Math.floor(Math.random() * DUAS.length);

    while (nextIndex === excludeIndex) {
        nextIndex = Math.floor(Math.random() * DUAS.length);
    }

    return nextIndex;
}

export default function DuaEKhairPage() {
    const [selectedIndex, setSelectedIndex] = useState(() =>
        Math.floor(Math.random() * DUAS.length)
    );

    const dua = DUAS[selectedIndex];
    const event = eventDetails.duaEKhair;

    const showAnotherDua = () => {
        setSelectedIndex((currentIndex) => getRandomIndex(currentIndex));
    };

    return (
        <div className="content-page event-page dua-page">
            <section className="dua-hero">
                <p className="eyebrow">Dua E Khair</p>
                <h1>Marriage Duas</h1>
                <p>
                    A collection of beautiful duas and verses asking Allah for
                    blessing, mercy, tranquility, and goodness in marriage.
                </p>
            </section>

            <section className="dua-card">
                <span className="dua-chip">{dua.title}</span>
                <p className="dua-arabic">{dua.arabic}</p>
                <p className="dua-transliteration">{dua.transliteration}</p>
                <p className="dua-translation">{dua.translation}</p>
                <p className="dua-reference">{dua.reference}</p>

                <div className="dua-actions">
                    <button className="btn" type="button" onClick={showAnotherDua}>
                        Show Another Dua
                    </button>
                    <Link className="btn btn-outline" href="/">
                        Back Home
                    </Link>
                </div>
            </section>

            <section className="panel event-highlight">
                <h2>{event.title} Details</h2>
                <p>{event.note}</p>

                <div className="event-actions">
                    <button className="btn btn-disabled" type="button" disabled>
                        RSVP Coming Soon
                    </button>
                    <Link className="btn btn-outline" href="/">
                        Back Home
                    </Link>
                </div>
            </section>

            <section className="details-grid">
                <article className="detail-card">
                    <span className="card-icon">📅</span>
                    <h2>Date</h2>
                    <p>{event.date}</p>
                </article>

                <article className="detail-card">
                    <span className="card-icon">📍</span>
                    <h2>Location</h2>
                    <p>{event.location}</p>
                </article>

                <article className="detail-card">
                    <span className="card-icon">👗</span>
                    <h2>Dress Code</h2>
                    <p>{event.dressCode}</p>
                </article>

                <article className="detail-card">
                    <span className="card-icon">✨</span>
                    <h2>Mood</h2>
                    <p>{event.mood}</p>
                </article>

                <article className="detail-card detail-card-wide">
                    <span className="card-icon">🎉</span>
                    <h2>Activities</h2>
                    <ul className="event-activities">
                        {event.activities.map((activity) => (
                            <li key={activity}>{activity}</li>
                        ))}
                    </ul>
                </article>
            </section>
        </div>
    );
}
