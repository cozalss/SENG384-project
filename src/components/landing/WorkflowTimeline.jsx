import { motion } from 'framer-motion';
import ScrollReveal from './ScrollReveal';

const WorkflowTimeline = ({ isMobile, workflow, timelineHeight, timelineRef }) => {
    return (
        <section id="how-it-works" className="container" style={{ maxWidth: '1000px', marginBottom: isMobile ? '100px' : '160px' }}>
            <ScrollReveal>
                <div className="text-center" style={{ marginBottom: '72px', padding: '0 12px' }}>
                    <span className="eyebrow eyebrow-green">
                        <motion.span animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }} style={{ display: 'inline-block' }}>🚀</motion.span> Workflow
                    </span>
                    <h2 style={{ fontSize: isMobile ? '32px' : '52px', marginBottom: '20px', letterSpacing: '-0.04em', lineHeight: '1.05' }}>
                        5 Steps to <span className="text-gradient-aurora">Collaboration</span>
                    </h2>
                    <p className="text-muted" style={{ fontSize: isMobile ? '15px' : '18px', maxWidth: '580px', margin: '0 auto', lineHeight: '1.7' }}>
                        From registration to partnership — simple, structured, and designed around your time.
                    </p>
                </div>
            </ScrollReveal>

            <div ref={timelineRef} style={{ position: 'relative', paddingLeft: isMobile ? '80px' : '0' }}>
                {/* Animated rail */}
                <div className="timeline-rail">
                    <motion.div className="timeline-rail-fill" style={{ height: timelineHeight }} />
                </div>

                {workflow.map((w, i) => {
                    const isLeft = i % 2 === 0;
                    return (
                        <ScrollReveal key={i} direction={isMobile ? 'left' : (isLeft ? 'left' : 'right')} delay={i * 0.05}>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: isMobile ? '1fr' : '1fr 80px 1fr',
                                alignItems: 'center',
                                marginBottom: i === workflow.length - 1 ? '0' : (isMobile ? '28px' : '40px'),
                                position: 'relative'
                            }}>
                                {/* Left side */}
                                <div style={{
                                    gridColumn: isMobile ? '1' : (isLeft ? '1' : '3'),
                                    gridRow: '1',
                                    textAlign: isMobile ? 'left' : (isLeft ? 'right' : 'left'),
                                    paddingRight: !isMobile && isLeft ? '28px' : '0',
                                    paddingLeft: !isMobile && !isLeft ? '28px' : '0'
                                }}>
                                    <motion.div
                                        whileHover={{ y: -4, borderColor: 'rgba(255,255,255,0.16)' }}
                                        style={{
                                            padding: isMobile ? '20px' : '26px',
                                            borderRadius: '18px',
                                            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.4))',
                                            border: '1px solid rgba(255,255,255,0.06)',
                                            backdropFilter: 'blur(16px)',
                                            WebkitBackdropFilter: 'blur(16px)',
                                            position: 'relative', overflow: 'hidden',
                                            transition: 'all 0.3s'
                                        }}
                                    >
                                        {/* Accent line */}
                                        <div style={{
                                            position: 'absolute', top: 0,
                                            left: isMobile || isLeft ? 'auto' : 0,
                                            right: isMobile || !isLeft ? 0 : 'auto',
                                            width: '3px', height: '100%',
                                            background: `linear-gradient(180deg, ${w.accent}, transparent)`
                                        }} />

                                        <div style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                                            marginBottom: '12px',
                                            justifyContent: isMobile || isLeft ? 'flex-start' : 'flex-end',
                                            width: '100%', flexDirection: !isMobile && isLeft ? 'row-reverse' : 'row'
                                        }}>
                                            <div style={{
                                                padding: '4px 10px', borderRadius: '7px',
                                                background: `${w.accent}18`, border: `1px solid ${w.accent}33`,
                                                fontSize: '10.5px', fontWeight: '800', color: w.accent,
                                                letterSpacing: '0.15em', fontFamily: 'var(--font-heading)'
                                            }}>
                                                STEP {w.step}
                                            </div>
                                            <div style={{
                                                width: '32px', height: '32px', borderRadius: '10px',
                                                background: `linear-gradient(135deg, ${w.accent}25, ${w.accent}08)`,
                                                border: `1px solid ${w.accent}30`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: w.accent
                                            }}>
                                                {w.icon}
                                            </div>
                                        </div>
                                        <h3 style={{ fontSize: isMobile ? '18px' : '20px', marginBottom: '8px', letterSpacing: '-0.02em' }}>
                                            {w.title}
                                        </h3>
                                        <p className="text-muted" style={{ fontSize: '13.5px', lineHeight: '1.7' }}>
                                            {w.desc}
                                        </p>
                                    </motion.div>
                                </div>

                                {/* Center node (desktop) */}
                                {!isMobile && (
                                    <div style={{ gridColumn: '2', gridRow: '1', display: 'flex', justifyContent: 'center' }}>
                                        <motion.div
                                            whileHover={{ scale: 1.1, rotate: 5 }}
                                            style={{
                                                width: '58px', height: '58px', borderRadius: '18px',
                                                background: `linear-gradient(135deg, ${w.accent}, var(--accent))`,
                                                border: '3px solid var(--background)',
                                                boxShadow: `0 10px 28px ${w.accent}55, inset 0 2px 0 rgba(255,255,255,0.2)`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: 'white', fontWeight: '800', fontSize: '18px',
                                                fontFamily: 'var(--font-heading)', zIndex: 3, position: 'relative'
                                            }}
                                        >
                                            {w.step}
                                        </motion.div>
                                    </div>
                                )}

                                {/* Mobile node */}
                                {isMobile && (
                                    <div style={{
                                        position: 'absolute', left: '-76px', top: '20px',
                                        width: '44px', height: '44px', borderRadius: '14px',
                                        background: `linear-gradient(135deg, ${w.accent}, var(--accent))`,
                                        border: '3px solid var(--background)',
                                        boxShadow: `0 8px 22px ${w.accent}55`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'white', fontWeight: '800', fontSize: '14px',
                                        fontFamily: 'var(--font-heading)', zIndex: 3
                                    }}>
                                        {w.step}
                                    </div>
                                )}

                                {/* Empty other side (desktop) */}
                                {!isMobile && (
                                    <div style={{ gridColumn: isLeft ? '3' : '1', gridRow: '1' }} />
                                )}
                            </div>
                        </ScrollReveal>
                    );
                })}
            </div>
        </section>
    );
};

export default WorkflowTimeline;
