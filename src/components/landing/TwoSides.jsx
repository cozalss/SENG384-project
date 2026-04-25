import { motion } from 'framer-motion';
import { Cpu, Stethoscope, FileText, Lock, BookOpen, Shield, Rocket, CheckCircle2 } from 'lucide-react';

/**
 * TwoSides — split-pane "Engineer ↔ Clinician" view.
 *
 * Conveys the platform's bridging premise visually: two distinct personas
 * with their own action lists, joined by a center "Meet" node. Replaces
 * the older BridgeSection that was deleted; rewritten in the green
 * Sentinel-aligned palette with cleaner copy.
 */
const ENGINEER_ACTIONS = [
    { icon: FileText, text: 'Post tech stack & open problem' },
    { icon: Stethoscope, text: 'Find clinical domain expertise' },
    { icon: Lock, text: 'Schedule NDA-protected meetings' },
    { icon: CheckCircle2, text: 'Mark Partner Found when matched' },
];

const CLINICIAN_ACTIONS = [
    { icon: BookOpen, text: 'Describe a real bedside need' },
    { icon: Cpu, text: 'Find engineers who can build it' },
    { icon: Shield, text: 'Safe, structured first contact' },
    { icon: Rocket, text: 'Move directly to collaboration' },
];

const PersonaCard = ({ side, title, role, accent, icon, actions, delay }) => {
    const RoleIcon = icon;

    return (
        <motion.div
            className="px-persona-card"
            initial={{ opacity: 0, x: side === 'left' ? -24 : 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-120px' }}
            transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
            style={{
                position: 'relative',
                padding: 'clamp(1.75rem, 3vw, 2.5rem)',
                borderRadius: 22,
                background: `linear-gradient(135deg, ${accent.wash} 0%, rgba(15, 15, 18, 0.6) 100%)`,
                border: `1px solid ${accent.border}`,
                backdropFilter: 'blur(20px) saturate(120%)',
                WebkitBackdropFilter: 'blur(20px) saturate(120%)',
                overflow: 'hidden',
                boxShadow: '0 1px 2px rgba(0,0,0,0.22), 0 28px 56px -24px rgba(0,0,0,0.5)',
            }}
        >
        {/* Top accent rail */}
        <span style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 2,
            background: `linear-gradient(90deg, ${accent.rail}, transparent)`,
        }} />

        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '5px 12px',
            borderRadius: 999,
            background: accent.chipBg,
            border: `1px solid ${accent.chipBorder}`,
            color: accent.ink,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            marginBottom: 22,
        }}>
            <RoleIcon size={11} /> {role}
        </span>

        <h3 style={{
            margin: 0,
            fontSize: 'clamp(1.4rem, 2.6vw, 1.85rem)',
            fontWeight: 600,
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            color: 'hsl(0 0% 96%)',
            marginBottom: 12,
        }}>
            {title}
        </h3>

        <ul style={{
            listStyle: 'none', padding: 0, margin: '20px 0 0',
            display: 'flex', flexDirection: 'column', gap: 8,
        }}>
            {actions.map((a, i) => {
                const ActionIcon = a.icon;
                return (
                    <li key={i} style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '10px 14px',
                        borderRadius: 11,
                        background: accent.chipBg,
                        border: `1px solid ${accent.chipBorder}`,
                        fontSize: 14,
                        fontWeight: 400,
                        color: 'hsl(0 0% 86%)',
                    }}>
                        <span style={{ color: accent.ink, display: 'inline-flex' }}>
                            <ActionIcon size={14} />
                        </span>
                        {a.text}
                    </li>
                );
            })}
        </ul>
        </motion.div>
    );
};

const TwoSides = () => {
    const engineerAccent = {
        ink: 'hsl(119 99% 60%)',
        wash: 'rgba(34, 211, 102, 0.08)',
        border: 'rgba(34, 211, 102, 0.16)',
        chipBg: 'rgba(34, 211, 102, 0.06)',
        chipBorder: 'rgba(34, 211, 102, 0.18)',
        rail: 'rgba(34, 211, 102, 0.7)',
    };

    const clinicianAccent = {
        ink: '#67e8f9',
        wash: 'rgba(34, 211, 238, 0.08)',
        border: 'rgba(34, 211, 238, 0.16)',
        chipBg: 'rgba(34, 211, 238, 0.06)',
        chipBorder: 'rgba(34, 211, 238, 0.18)',
        rail: 'rgba(34, 211, 238, 0.7)',
    };

    return (
        <section
            style={{
                position: 'relative',
                /* Unified to the landing standard: clamp(3.5rem, 7vw, 5.5rem)
                   matches BigTextReveal + HowItWorks for consistent rhythm. */
                padding: 'clamp(3.5rem, 7vw, 5.5rem) clamp(1.5rem, 4vw, 3rem)',
                fontFamily: 'Sora, sans-serif',
            }}
        >
            <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
                {/* Heading */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    style={{ textAlign: 'center', marginBottom: 'clamp(1.75rem, 3.5vw, 2.5rem)' }}
                >
                    {/* eyebrow removed — SectionLabel handles it now */}
                    <h2 style={{
                        margin: 0,
                        fontSize: 'clamp(1.75rem, 4vw, 3rem)',
                        fontWeight: 600,
                        lineHeight: 1.05,
                        letterSpacing: '-0.035em',
                        color: 'hsl(0 0% 96%)',
                    }}>
                        Whichever side <em style={{
                            fontFamily: "'Instrument Serif', Georgia, serif",
                            fontStyle: 'italic',
                            fontWeight: 400,
                            color: 'hsl(119 99% 56%)',
                        }}>you're on</em>.
                    </h2>
                    <p style={{
                        marginTop: 14,
                        fontSize: 'clamp(0.95rem, 1.3vw, 1.1rem)',
                        color: 'hsl(0 0% 70%)',
                        fontWeight: 300,
                        lineHeight: 1.6,
                        maxWidth: '50ch',
                        marginInline: 'auto',
                    }}>
                        Each persona gets the right tools, with the right safeguards, and a workflow tuned to how they actually work.
                    </p>
                </motion.div>

                {/* Two-pane grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: 'clamp(1rem, 2.5vw, 2rem)',
                    alignItems: 'stretch',
                }}>
                    <PersonaCard
                        side="left"
                        title="I'm an engineer."
                        role="Engineer Persona"
                        icon={Cpu}
                        accent={engineerAccent}
                        actions={ENGINEER_ACTIONS}
                        delay={0.05}
                    />
                    <PersonaCard
                        side="right"
                        title="I'm a clinician."
                        role="Clinician Persona"
                        icon={Stethoscope}
                        accent={clinicianAccent}
                        actions={CLINICIAN_ACTIONS}
                        delay={0.18}
                    />
                </div>
            </div>
        </section>
    );
};

export default TwoSides;
