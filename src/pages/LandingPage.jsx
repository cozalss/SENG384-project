import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import Hero from '../components/landing/Hero';
import BigTextReveal from '../components/landing/BigTextReveal';
import SectionLabel from '../components/landing/SectionLabel';
import SectionNavDots from '../components/landing/SectionNavDots';
import Footer from '../components/landing/Footer';
import '../styles/live-product.css';
import '../styles/spotlight.css';
import '../styles/landing-unified.css';
import { debounce } from '../utils/debounce';

/**
 * Landing flow — 2026 redesign with code-splitting.
 *
 *   Hero               Cinematic 4-act scene + value prop
 *   01 — PREMISE       BigTextReveal (manifesto)
 *   02 — THE PRODUCT   LiveProduct (3 product mockup panels)   [lazy]
 *   03 — TWO SIDES     Engineer ↔ Clinician personas           [lazy]
 *   04 — FILTERS       CinematicNetwork (sample filter map)    [lazy]
 *   05 — TRUST         BentoFeatures                           [lazy]
 *   06 — SPOTLIGHT     Featured collaboration                  [lazy]
 *                      FinalCTA → Footer                       [lazy]
 *
 * Below-the-fold sections are split into their own chunks via React.lazy.
 * The initial paint ships only Hero + BigTextReveal + Footer JS, and the
 * rest streams in during browser idle time so it's already cached by the
 * time the user scrolls. This shaves a noticeable chunk off the cold-load
 * bundle for landing visitors who never scroll past the hero.
 */
const LiveProduct = lazy(() => import('../components/landing/LiveProduct'));
const TwoSides = lazy(() => import('../components/landing/TwoSides'));
const CinematicNetwork = lazy(() => import('../components/landing/CinematicNetwork'));
const BentoFeatures = lazy(() => import('../components/landing/BentoFeatures'));
const Spotlight = lazy(() => import('../components/landing/Spotlight'));
const FinalCTA = lazy(() => import('../components/landing/FinalCTA'));

const SNAP_DELTA_THRESHOLD = 8;
const SNAP_LOCK_MS = 680;

// Suspense fallback that reserves vertical space close to each section's
// real height. Prevents a layout-shift jolt as chunks resolve.
const SectionSkeleton = ({ height = 480 }) => (
    <div
        className="landing-section-skeleton"
        aria-hidden="true"
        style={{ '--skeleton-height': `${height}px` }}
    />
);

const LazySectionContent = ({ height, children }) => {
    const ref = useRef(null);
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        if (shouldRender) return;
        const node = ref.current;
        if (!node) return;
        if (typeof IntersectionObserver === 'undefined') {
            const id = setTimeout(() => setShouldRender(true), 1200);
            return () => clearTimeout(id);
        }
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) return;
                setShouldRender(true);
                observer.disconnect();
            },
            { rootMargin: '720px 0px', threshold: 0.01 }
        );
        observer.observe(node);
        return () => observer.disconnect();
    }, [shouldRender]);

    return (
        <div ref={ref}>
            {shouldRender ? (
                <Suspense fallback={<SectionSkeleton height={height} />}>
                    {children}
                </Suspense>
            ) : (
                <SectionSkeleton height={height} />
            )}
        </div>
    );
};

const SnapPanel = ({ id, label, n, tone, children, className = '' }) => (
    <section
        id={id}
        data-snap-section="true"
        className={`landing-snap-panel ${className}`.trim()}
    >
        {label && (
            <div className="landing-snap-label">
                <SectionLabel
                    n={n}
                    label={label}
                    accent={tone === 'cyan' ? 'hsl(180 75% 65%)' : undefined}
                />
            </div>
        )}
        {children}
    </section>
);

const LandingPage = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const snapLockRef = useRef(false);

    useEffect(() => {
        const handleResize = debounce(() => setIsMobile(window.innerWidth < 768), 100);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const warm = () => { import('./Login'); };
        if (typeof window === 'undefined') return;
        let idleId = 0;
        const timerId = window.setTimeout(() => {
            if ('requestIdleCallback' in window) {
                idleId = window.requestIdleCallback(warm, { timeout: 5000 });
            } else {
                warm();
            }
        }, 8000);
        return () => {
            window.clearTimeout(timerId);
            if (idleId) window.cancelIdleCallback?.(idleId);
        };
    }, []);

    // Prefetch below-the-fold chunks gently after the hero has had time to
    // settle. Rendering is still viewport-driven; these imports only warm the
    // cache for users who linger before scrolling.
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const prefetchers = [
            () => import('../components/landing/LiveProduct'),
            () => import('../components/landing/TwoSides'),
            () => import('../components/landing/CinematicNetwork'),
            () => import('../components/landing/BentoFeatures'),
            () => import('../components/landing/Spotlight'),
            () => import('../components/landing/FinalCTA'),
        ];
        const idleIds = [];
        const timers = prefetchers.map((prefetch, index) => (
            window.setTimeout(() => {
                if ('requestIdleCallback' in window) {
                    idleIds.push(window.requestIdleCallback(prefetch, { timeout: 9000 + index * 900 }));
                } else {
                    prefetch();
                }
            }, 6500 + index * 850)
        ));
        return () => {
            timers.forEach((id) => window.clearTimeout(id));
            idleIds.forEach((id) => window.cancelIdleCallback?.(id));
        };
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const root = document.documentElement;
        root.classList.add('landing-snap-active');

        const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        const coarsePointer = window.matchMedia?.('(pointer: coarse)').matches ?? false;
        const wideEnough = window.matchMedia?.('(min-width: 901px)').matches ?? true;

        if (reduce || coarsePointer || !wideEnough) {
            return () => root.classList.remove('landing-snap-active');
        }

        const getPanels = () => Array.from(document.querySelectorAll('[data-snap-section="true"]'));
        const nearestIndex = (panels) => {
            const viewportCenter = window.scrollY + window.innerHeight / 2;
            let bestIndex = 0;
            let bestDistance = Infinity;

            panels.forEach((panel, index) => {
                const top = panel.getBoundingClientRect().top + window.scrollY;
                const center = top + panel.offsetHeight / 2;
                const distance = Math.abs(center - viewportCenter);
                if (distance < bestDistance) {
                    bestDistance = distance;
                    bestIndex = index;
                }
            });

            return bestIndex;
        };

        const canScrollVertically = (element, direction) => {
            if (!(element instanceof Element)) return false;
            const style = window.getComputedStyle(element);
            if (!/(auto|scroll|overlay)/.test(style.overflowY)) return false;
            if (element.scrollHeight <= element.clientHeight + 2) return false;

            if (direction > 0) {
                return element.scrollTop + element.clientHeight < element.scrollHeight - 2;
            }
            return element.scrollTop > 2;
        };

        const hasScrollablePath = (target, boundary, direction) => {
            let node = target instanceof Element ? target : null;
            while (node && node !== document.body && node !== document.documentElement) {
                if (node !== boundary && canScrollVertically(node, direction)) return true;
                if (node === boundary) break;
                node = node.parentElement;
            }
            return false;
        };

        const unlock = () => {
            window.clearTimeout(snapLockRef.current);
            snapLockRef.current = window.setTimeout(() => {
                snapLockRef.current = false;
            }, SNAP_LOCK_MS);
        };

        const jumpTo = (panel) => {
            const top = panel.getBoundingClientRect().top + window.scrollY;
            window.scrollTo({ top, behavior: 'smooth' });
            unlock();
        };

        const onWheel = (event) => {
            if (event.ctrlKey || Math.abs(event.deltaY) < SNAP_DELTA_THRESHOLD) return;

            const panels = getPanels();
            if (panels.length < 2) return;

            const current = nearestIndex(panels);
            const direction = event.deltaY > 0 ? 1 : -1;
            if (hasScrollablePath(event.target, panels[current], direction)) return;

            event.preventDefault();
            if (snapLockRef.current) return;

            const next = Math.max(0, Math.min(panels.length - 1, current + direction));
            if (next === current) return;

            jumpTo(panels[next]);
        };

        const onKeyDown = (event) => {
            const keys = ['ArrowDown', 'PageDown', 'ArrowUp', 'PageUp', 'Home', 'End'];
            if (!keys.includes(event.key)) return;
            if (event.target?.matches?.('input, textarea, select, [contenteditable="true"]')) return;

            const panels = getPanels();
            if (panels.length < 2) return;

            const current = nearestIndex(panels);
            let next = current;
            if (event.key === 'ArrowDown' || event.key === 'PageDown') next = current + 1;
            if (event.key === 'ArrowUp' || event.key === 'PageUp') next = current - 1;
            if (event.key === 'Home') next = 0;
            if (event.key === 'End') next = panels.length - 1;
            next = Math.max(0, Math.min(panels.length - 1, next));
            if (next === current) return;

            event.preventDefault();
            jumpTo(panels[next]);
        };

        window.addEventListener('wheel', onWheel, { passive: false });
        window.addEventListener('keydown', onKeyDown);
        return () => {
            window.removeEventListener('wheel', onWheel);
            window.removeEventListener('keydown', onKeyDown);
            window.clearTimeout(snapLockRef.current);
            snapLockRef.current = false;
            root.classList.remove('landing-snap-active');
        };
    }, []);

    return (
        <div className="landing-page-shell" style={{
            background: 'transparent',
            color: 'var(--text-main)',
            overflowX: 'clip',
            minHeight: '100vh',
        }}>
            <div className="fx-grain" aria-hidden="true" />
            <SectionNavDots />
            <Hero />

            <SnapPanel id="premise" n="01" label="Premise" className="landing-snap-panel--premise">
                <BigTextReveal />
            </SnapPanel>

            <SnapPanel id="product" n="02" label="The Product" className="landing-snap-panel--product">
                <LazySectionContent height={680}>
                    <LiveProduct />
                </LazySectionContent>
            </SnapPanel>

            <SnapPanel id="two-sides" n="03" label="Two Sides" tone="cyan" className="landing-snap-panel--two-sides">
                <LazySectionContent height={520}>
                    <TwoSides />
                </LazySectionContent>
            </SnapPanel>

            <SnapPanel id="network" n="04" label="Discovery Filters" className="landing-snap-panel--network">
                <LazySectionContent height={680}>
                    <CinematicNetwork />
                </LazySectionContent>
            </SnapPanel>

            <SnapPanel id="trust" n="05" label="Trust & Capabilities" className="landing-snap-panel--trust">
                <LazySectionContent height={620}>
                    <BentoFeatures isMobile={isMobile} />
                </LazySectionContent>
            </SnapPanel>

            <SnapPanel id="spotlight" n="06" label="Demo Flow" className="landing-snap-panel--spotlight">
                <LazySectionContent height={520}>
                    <Spotlight />
                </LazySectionContent>
            </SnapPanel>

            <section
                id="final-cta"
                data-snap-section="true"
                className="landing-snap-panel landing-snap-panel--final"
            >
                <LazySectionContent height={420}>
                    <FinalCTA isMobile={isMobile} />
                </LazySectionContent>
                <Footer />
            </section>
        </div>
    );
};

export default LandingPage;
