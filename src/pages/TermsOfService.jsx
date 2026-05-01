import { Link } from 'react-router-dom';
import { ArrowLeft, ScrollText, UserCheck, Ban, AlertTriangle, Scale, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAnimReady } from '../hooks/useAnimReady';

const Section = ({ icon: Icon, title, children }) => (
    <section style={{
        background: 'var(--detail-info-bg, rgba(255,255,255,0.02))',
        border: '1px solid var(--detail-info-border, rgba(255,255,255,0.06))',
        borderRadius: '14px',
        padding: '28px 30px',
        marginBottom: '18px',
    }}>
        <div className="flex items-center gap-3" style={{ marginBottom: '14px' }}>
            <div style={{
                width: 38, height: 38, borderRadius: 11,
                background: 'var(--brand-soft-bg, rgba(96, 165, 250, 0.10))',
                border: '1px solid var(--brand-soft-border, rgba(96, 165, 250, 0.22))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--brand-soft-text, #93c5fd)',
            }}>
                <Icon size={18} />
            </div>
            <h2 style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '20px', fontWeight: 600,
                margin: 0, letterSpacing: '-0.02em',
                color: 'var(--text-main)',
            }}>{title}</h2>
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.75 }}>
            {children}
        </div>
    </section>
);

const TermsOfService = () => {
    const animReady = useAnimReady();
    return (
        <div className="animate-fade-in" style={{ maxWidth: '880px', margin: '0 auto', paddingBottom: '80px' }}>
            <Link to="/" className="flex items-center gap-2 text-muted mb-6" style={{ fontSize: '13px', textDecoration: 'none' }}>
                <ArrowLeft size={15} /> Back to Home
            </Link>

            <motion.section
                initial={animReady ? { opacity: 0, y: 20 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="editorial-header"
            >
                <div className="editorial-header-inner">
                    <div>
                        <span className="editorial-eyebrow">
                            <ScrollText size={11} /> Service Agreement
                        </span>
                        <h1 className="editorial-display">
                            Terms <span className="accent">of Service</span>
                        </h1>
                        <p className="editorial-subtitle">
                            Conditions of use for the HEALTH AI co-creation platform. Last updated: April 2026.
                        </p>
                    </div>
                </div>
            </motion.section>

            <Section icon={UserCheck} title="1. Eligibility">
                <p>
                    HEALTH AI is restricted to verified members of academic and clinical institutions.
                    By creating an account you confirm that:
                </p>
                <ul style={{ paddingLeft: 20, marginTop: 10 }}>
                    <li>You hold an active institutional <code>.edu</code> email address.</li>
                    <li>You are at least 18 years old.</li>
                    <li>You will accurately represent your role (Engineer or Healthcare Professional).</li>
                    <li>You will not register on behalf of another individual.</li>
                </ul>
            </Section>

            <Section icon={ScrollText} title="2. Platform Scope">
                <p><strong>HEALTH AI is a structured matchmaking surface.</strong> The service is intentionally limited to:</p>
                <ul style={{ paddingLeft: 20, marginTop: 10 }}>
                    <li>Publishing collaboration announcements.</li>
                    <li>Expressing interest in others' announcements (gated by NDA acknowledgement).</li>
                    <li>Proposing meeting time slots — the meeting itself happens externally (Zoom / Teams).</li>
                    <li>Closing announcements once a partner is found.</li>
                </ul>
                <p style={{ marginTop: 12 }}>
                    <strong>HEALTH AI does NOT provide:</strong> medical advice, financial transactions, legal contracts,
                    document storage, patient data handling, or project management tooling.
                </p>
            </Section>

            <Section icon={Scale} title="3. NDA Workflow &amp; IP">
                <p>
                    When you accept the in-platform NDA before contacting another user, you agree to treat all
                    information shared during the resulting collaboration discussion as confidential. The platform
                    NDA is a lightweight acknowledgement designed to set expectations — for any binding intellectual
                    property protection, parties are encouraged to execute a formal NDA outside the platform before
                    sharing technical specifications, schematics, or proprietary methodologies.
                </p>
            </Section>

            <Section icon={Ban} title="4. Prohibited Conduct">
                <p>You agree NOT to:</p>
                <ul style={{ paddingLeft: 20, marginTop: 10 }}>
                    <li>Upload or share patient data, protected health information (PHI), or any personally identifiable medical record.</li>
                    <li>Use the platform for spam, harassment, or impersonation.</li>
                    <li>Circumvent rate limits, RBAC, or NDA gates.</li>
                    <li>Reverse-engineer, scrape, or systematically extract content.</li>
                    <li>Post advertising, recruiting bait, or material unrelated to health-tech collaboration.</li>
                </ul>
                <p style={{ marginTop: 12 }}>
                    Violations result in account suspension by an administrator and, where appropriate, deletion of the
                    offending content.
                </p>
            </Section>

            <Section icon={AlertTriangle} title="5. Disclaimer of Warranty">
                <p>
                    HEALTH AI is provided <strong>"as is"</strong> as part of an academic SENG 384 project. While we
                    take reasonable steps to maintain availability and security, we do not guarantee uninterrupted
                    service or vouch for the credentials, claims, or conduct of any particular user. Always verify
                    your collaborator independently before sharing sensitive intellectual property.
                </p>
            </Section>

            <Section icon={Mail} title="6. Termination &amp; Contact">
                <p>
                    You may delete your account at any time from your <Link to="/profile" style={{ color: 'var(--brand-soft-text)' }}>Profile page</Link>.
                    We reserve the right to suspend accounts that breach these Terms.
                </p>
                <p style={{ marginTop: 10 }}>
                    Questions: <a href="mailto:legal@healthai.eu" style={{ color: 'var(--brand-soft-text)' }}>legal@healthai.eu</a>
                </p>
            </Section>

            <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-subtle)', marginTop: 32 }}>
                HEALTH AI is a SENG 384 academic project. These terms describe the prototype's intended use and would
                be subject to formal legal review before any production launch.
            </p>
        </div>
    );
};

export default TermsOfService;
