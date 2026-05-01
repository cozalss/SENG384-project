import { motion } from 'framer-motion';
import { Quote, Stethoscope, Cpu, MapPin, Calendar, ArrowUpRight, Award } from 'lucide-react';

/**
 * Demo walkthrough card.
 *
 * Functions as a presentation walkthrough for the implemented workflow.
 * This avoids fake customer claims while still giving the landing page a
 * concrete story the evaluator can follow during the demo.
 */

const Avatar = ({ side, initials, accent }) => (
    <div className={`spt-avatar spt-avatar--${side}`} aria-hidden="true">
        <svg viewBox="0 0 96 96">
            <defs>
                <linearGradient id={`spt-av-grad-${side}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={accent.from} />
                    <stop offset="100%" stopColor={accent.to} />
                </linearGradient>
                <radialGradient id={`spt-av-glow-${side}`} cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor={accent.from} stopOpacity="0.45" />
                    <stop offset="80%" stopColor={accent.from} stopOpacity="0" />
                </radialGradient>
            </defs>
            <circle cx="48" cy="48" r="46" fill={`url(#spt-av-glow-${side})`} />
            <circle cx="48" cy="48" r="40" fill={`url(#spt-av-grad-${side})`} />
            <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
            <text
                x="48" y="58"
                textAnchor="middle"
                fontFamily="Sora, sans-serif"
                fontWeight="700"
                fontSize="26"
                letterSpacing="0"
                fill="hsl(0 0% 6%)"
            >
                {initials}
            </text>
        </svg>
    </div>
);

const Spotlight = () => (
    <section className="spt-section landing-cinema-section">
        <div className="spt-inner">
            <motion.div
                className="spt-eyebrow-row"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
                <span className="spt-eyebrow">
                    <Award size={11} /> Demo Walkthrough
                    <span className="spt-eyebrow-flag" aria-label="sample scenario">sample scenario</span>
                </span>
            </motion.div>

            <motion.h2
                className="spt-heading"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
                What the <em>project workflow</em><br />looks like.
            </motion.h2>

            <motion.div
                className="spt-card"
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
                {/* Top accent rail */}
                <span className="spt-card-rail" aria-hidden="true" />

                {/* Decorative dot pattern */}
                <span className="spt-card-grain" aria-hidden="true" />

                <div className="spt-card-grid">
                    {/* LEFT — figures + portraits */}
                    <div className="spt-card-figures">
                        <div className="spt-figures-stack">
                            <Avatar
                                side="clinic"
                                initials="EM"
                                accent={{ from: 'hsl(180 75% 70%)', to: 'hsl(180 75% 45%)' }}
                            />
                            <Avatar
                                side="engineer"
                                initials="JK"
                                accent={{ from: 'hsl(119 99% 65%)', to: 'hsl(119 99% 40%)' }}
                            />
                        </div>

                        <div className="spt-figures-meta">
                            <div className="spt-figure-row">
                                <Stethoscope size={12} />
                                <div>
                                    <span className="spt-figure-name">Healthcare Professional</span>
                                    <span className="spt-figure-role">Post author · clinical project owner</span>
                                </div>
                            </div>
                            <div className="spt-figure-row">
                                <Cpu size={12} />
                                <div>
                                    <span className="spt-figure-name">Engineer / Developer</span>
                                    <span className="spt-figure-role">Interested collaborator · technical support</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT — story */}
                    <div className="spt-card-body">
                        <span className="spt-project-tag">
                            <span className="spt-project-dot" />
                            Sample post · NDA protected · Meeting request
                        </span>

                        <h3 className="spt-project-title">
                            Health-tech collaboration request - <em>from post to chat</em>
                        </h3>

                        <div className="spt-quote">
                            <Quote size={20} className="spt-quote-icon" />
                            <p>
                                In the presentation, this scenario shows the complete flow: register, create an announcement, browse the dashboard, open a post, accept NDA terms, propose a meeting slot, and continue in chat.
                            </p>
                        </div>

                        <div className="spt-meta-row">
                            <span><MapPin size={11} /> Dashboard to Post Detail</span>
                            <span><Calendar size={11} /> Interest, NDA, Meeting, Chat</span>
                        </div>

                        <div className="spt-outcomes">
                            <div className="spt-outcome">
                                <span className="spt-outcome-num">1</span>
                                <span className="spt-outcome-label">Create a collaboration announcement</span>
                            </div>
                            <div className="spt-outcome">
                                <span className="spt-outcome-num">2</span>
                                <span className="spt-outcome-label">Express interest and accept NDA terms</span>
                            </div>
                            <div className="spt-outcome">
                                <span className="spt-outcome-num">3</span>
                                <span className="spt-outcome-label">Propose meeting and open chat</span>
                            </div>
                        </div>

                        <a href="#final-cta" className="spt-card-link">
                            Start the demo flow <ArrowUpRight size={14} />
                        </a>
                    </div>
                </div>
            </motion.div>

            <motion.p
                className="spt-disclaimer"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.6, delay: 0.4 }}
            >
                Sample scenario for the SENG 384 presentation. It describes implemented screens, not real customer outcomes.
            </motion.p>
        </div>
    </section>
);

export default Spotlight;
