"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
    const pathname = usePathname();

    const links = [
        { href: "/", label: "Home" },
        { href: "/details", label: "Details" },
        { href: "/rsvp", label: "RSVP" },
        { href: "/save-the-date", label: "Save The Date" },
    ];

    const hideNav = pathname === "/save-the-date";

    return (
        <header className="site-header">
            <Link className="brand" href="/">
                Basir & Noor
            </Link>
            {!hideNav && (
                <nav className="site-nav">
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={pathname === link.href ? "active" : ""}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>
            )}
        </header>
    );
}
