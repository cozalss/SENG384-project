import React, { useRef, useState, useEffect } from 'react';
import { useScroll, useTransform } from 'framer-motion';
import Hero from '../components/landing/Hero';
import LandingNavbar from '../components/landing/LandingNavbar';
import { domains, compareItems, workflow } from '../constants/landingData';
import { debounce } from '../utils/debounce';
import DomainsMarquee from '../components/landing/DomainsMarquee';
import BentoFeatures from '../components/landing/BentoFeatures';
import ProblemSolution from '../components/landing/ProblemSolution';
import WorkflowTimeline from '../components/landing/WorkflowTimeline';
import BridgeSection from '../components/landing/BridgeSection';
import FinalCTA from '../components/landing/FinalCTA';
import Footer from '../components/landing/Footer';
import ScrollReveal from '../components/landing/ScrollReveal';

const LandingPage = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const timelineRef = useRef(null);

    const { scrollYProgress } = useScroll({
        target: timelineRef,
        offset: ['start center', 'end center'],
    });

    const timelineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

    useEffect(() => {
        const handleResize = debounce(() => setIsMobile(window.innerWidth < 768), 100);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div style={{ background: 'transparent', color: 'var(--text-main)', overflowX: 'hidden', minHeight: '100vh' }}>
            <LandingNavbar />
            <Hero />

            <ScrollReveal delay={0.2}>
                <DomainsMarquee isMobile={isMobile} domains={domains} />
            </ScrollReveal>

            <ScrollReveal>
                <BentoFeatures isMobile={isMobile} />
            </ScrollReveal>

            <ScrollReveal>
                <ProblemSolution isMobile={isMobile} compareItems={compareItems} />
            </ScrollReveal>

            <ScrollReveal>
                <WorkflowTimeline
                    isMobile={isMobile}
                    workflow={workflow}
                    timelineHeight={timelineHeight}
                    timelineRef={timelineRef}
                />
            </ScrollReveal>

            <ScrollReveal>
                <BridgeSection isMobile={isMobile} />
            </ScrollReveal>

            <ScrollReveal>
                <FinalCTA isMobile={isMobile} />
            </ScrollReveal>

            <Footer />
        </div>
    );
};

export default LandingPage;
