"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import "./navbar.css";

const NAV_LINKS = [
  { label: "Platform", href: "/platform" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Data", href: "/#data" },
  { label: "Simulator", href: "/simulator" },
  { label: "Ev Trend", href: "/ev-trend-chart" },
];

export default function Navbar() {
  const [visible, setVisible] = useState(true);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;

      if (y > lastY.current + 4) {
        setVisible(false);
      } else if (y < lastY.current - 4) {
        setVisible(true);
      }

      lastY.current = y;
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <header className={`navbar ${visible ? "" : "nav-hidden"}`}>
      <nav className="nav-inner" aria-label="Main navigation">
        {/* Left — nav links */}
        <ul className="nav-links" role="list">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href} className="nav-link">
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Centre — logo */}
        <a href="/" className="nav-brand" aria-label="ZEUS">
          <div className="nav-logo-slot">
            <Image
              src="/logo_zeus.png"
              alt="ZEUS"
              width={125}
              height={46}
              className="nav-logo-img"
              priority
            />
          </div>
        </a>

        {/* Right — CTA */}
        <div className="nav-right">
          <a href="#contact" className="nav-cta">
            Watch Demo
          </a>
        </div>
      </nav>
    </header>
  );
}
