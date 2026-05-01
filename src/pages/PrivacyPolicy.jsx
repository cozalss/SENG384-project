import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Database, Download, Trash2, Eye, Lock, Globe, Mail } from 'lucide-react';
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
                background: 'var(--brand-soft-bg, rgba(34, 211, 102, 0.10))',
                border: '1px solid var(--brand-soft-border, rgba(34, 211, 102, 0.22))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--brand-soft-text, hsl(119 80% 72%))',
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

const PrivacyPolicy = () => {
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
                            <Shield size={11} /> GDPR Compliant
                        </span>
                        <h1 className="editorial-display">
                            Privacy <span className="accent">Policy</span>
                        </h1>
                        <p className="editorial-subtitle">
                            How HEALTH AI collects, uses, and protects your data. Last updated: April 2026.
                        </p>
                    </div>
                </div>
            </motion.section>

            <Section icon={Database} title="1. Data We Collect">
                <p>HEALTH AI deliberately collects the minimum data needed to operate a structured matchmaking service:</p>
                <ul style={{ paddingLeft: 20, marginTop: 10 }}>
                    <li><strong>Identity:</strong> Full name, institutional <code>.edu</code> email, role (Engineer / Healthcare Professional / Admin), institution, city, country.</li>
                    <li><strong>Authentication:</strong> Hashed password (SHA-256), one-time verification codes (10-minute TTL).</li>
                    <li><strong>Content you publish:</strong> Announcement title, domain, description, expertise needed, project stage, confidentiality level.</li>
                    <li><strong>Activity:</strong> Login events, post creation/edit/closure, meeting requests, NDA acceptances. Stored for audit only.</li>
                </ul>
                <p style={{ marginTop: 12, color: 'var(--brand-soft-text)' }}>
                    <strong>We do NOT collect:</strong> patient data, medical records, technical IP files, financial information, or any document uploads.
                </p>
            </Section>

            <Section icon={Eye} title="2. How We Use Your Data">
                <ul style={{ paddingLeft: 20 }}>
                    <li>To verify institutional affiliation and prevent anonymous accounts.</li>
                    <li>To display your announcements to potential cross-disciplinary partners.</li>
                    <li>To deliver in-app notifications and (best-effort) email about meeting requests.</li>
                    <li>To produce administrative audit logs for security and incident response.</li>
                </ul>
                <p style={{ marginTop: 10 }}>
                    Your data is <strong>not</strong> sold, traded, or shared with third parties for marketing.
                </p>
            </Section>

            <Section icon={Lock} title="3. Security">
                <ul style={{ paddingLeft: 20 }}>
                    <li>HTTPS in transit, encrypted at-rest via Firebase Cloud Firestore.</li>
                    <li>Passwords hashed with SHA-256 before storage. Plaintext is never persisted.</li>
                    <li>30-minute idle session timeout.</li>
                    <li>Role-Based Access Control (RBAC) on administrative surfaces.</li>
                    <li>NDA acceptance is recorded before confidential project details are unlocked.</li>
                </ul>
            </Section>

            <Section icon={Download} title="4. Your Rights — GDPR Article 15 &amp; 20">
                <p>From your <Link to="/profile" style={{ color: 'hsl(119 99% 60%)' }}>Profile page</Link> you can:</p>
                <ul style={{ paddingLeft: 20, marginTop: 10 }}>
                    <li><strong>Export all your data</strong> as a JSON download (Article 20 — Data Portability).</li>
                    <li><strong>Edit your profile</strong> (name, city, country, institution).</li>
                    <li><strong>View your activity</strong> in the dashboard.</li>
                </ul>
            </Section>

            <Section icon={Trash2} title="5. Right to Erasure — Article 17">
                <p>
                    Deleting your account from the Profile page triggers a cascading erasure: your user document,
                    every post you authored, every interest and meeting record under those posts, and your
                    notification queue are all removed from our database. Audit log entries that reference
                    your user ID are retained in pseudonymized form for security audit purposes for
                    <strong> 24 months</strong>, after which they are deleted automatically.
                </p>
            </Section>

            <Section icon={Globe} title="6. Cookies &amp; Local Storage">
                <p>
                    HEALTH AI uses only first-party browser storage to keep you signed in (<code>health_ai_user</code>) and
                    to remember your cookie consent choice (<code>health_ai_cookie_consent</code>). We do not run
                    third-party analytics, tracking pixels, or advertising cookies.
                </p>
            </Section>

            <Section icon={Mail} title="7. Contact">
                <p>
                    Data protection requests: <a href="mailto:legal@healthai.eu" style={{ color: 'hsl(119 99% 60%)' }}>legal@healthai.eu</a>.
                    We respond within 30 days as required by GDPR Article 12.
                </p>
            </Section>

            <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-subtle)', marginTop: 32 }}>
                HEALTH AI is a SENG 384 academic project. This privacy policy describes the prototype's data
                handling and would be subject to formal legal review before any production launch.
            </p>
        </div>
    );
};

export default PrivacyPolicy;
