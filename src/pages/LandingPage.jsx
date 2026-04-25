import { useState, useEffect } from 'react';
import Hero from '../components/landing/Hero';
import BigTextReveal from '../components/landing/BigTextReveal';
import StickyShowcase from '../components/landing/StickyShowcase';
import HowItWorks from '../components/landing/HowItWorks';
import TwoSides from '../components/landing/TwoSides';
import BentoFeatures from '../components/landing/BentoFeatures';
import FinalCTA from '../components/landing/FinalCTA';
import Footer from '../components/landing/Footer';
import SectionLabel from '../components/landing/SectionLabel';
import SectionNavDots from '../components/landing/SectionNavDots';
import { debounce } from '../utils/debounce';

/**
 * Landing flow — research-aligned 2026 pacing.
 *
 * Killed: keyword Marquee (research flagged dual-row keyword tickers as
 * "2024-coded" and our project has no real institution logos to anchor
 * data, so it was decorative-only).
 *
 * Added: SectionLabel hairline + "01 — PREMISE" style separators between
 * every block. Linear/Vercel/Cedar pattern. Adds editorial structure with
 * ~32px vertical cost — replaces 80-120px of empty section padding.
 *
 * Sequence:
 *   Hero — value prop + Spline scene
 *   01 — Premise          → BigTextReveal (clip-path mask lines)
 *   02 — The narrative    → StickyShowcase (3-act pinned scroll, 160vh)
 *   03 — How it works     → HowItWorks (4 steps + SVG path-draw connector)
 *   04 — Two sides        → TwoSides (Engineer ↔ Clinician personas)
 *   05 — Capabilities     → BentoFeatures (4 feature cards)
 *                          FinalCTA → Footer
 */
const LandingPage = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = debounce(() => setIsMobile(window.innerWidth < 768), 100);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const warm = () => { import('./Login'); };
        if (typeof window === 'undefined') return;
        if ('requestIdleCallback' in window) {
            const id = window.requestIdleCallback(warm, { timeout: 2500 });
            return () => window.cancelIdleCallback?.(id);
        }
        const t = setTimeout(warm, 1500);
        return () => clearTimeout(t);
    }, []);

    return (
        <div className="landing-page-shell" style={{
            background: 'transparent',
            color: 'var(--text-main)',
            // overflow-x: clip instead of hidden — `hidden` creates a scroll
            // container that breaks position: sticky inside StickyShowcase.
            // `clip` clips overflow without becoming a scroll context.
            overflowX: 'clip',
            minHeight: '100vh',
        }}>
            <div className="fx-grain" aria-hidden="true" />
            <SectionNavDots />
            <Hero />

            <SectionLabel id="premise" n="01" label="Start Here" />
            <BigTextReveal />

            <SectionLabel id="narrative" n="02" label="Why It Matters" />
            <StickyShowcase />

            <SectionLabel id="how-it-works" n="03" label="How It Works" />
            <HowItWorks />

            <SectionLabel id="two-sides" n="04" label="Two Sides" />
            <TwoSides />

            <SectionLabel id="capabilities" n="05" label="Capabilities" />
            <BentoFeatures isMobile={isMobile} />

            <FinalCTA isMobile={isMobile} />
            <Footer />
        </div>
    );
};

export default LandingPage;
