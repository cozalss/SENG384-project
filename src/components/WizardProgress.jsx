import { motion } from 'framer-motion';

/**
 * Premium wizard progress — a single continuous gradient bar that animates
 * between steps, plus labeled markers. Replaces the old dot-and-line cluster.
 *
 * Props:
 *   steps: Array<{ label: string }>
 *   current: 1-indexed current step
 *   onStepClick?: (stepNumber) => void  — if set, step pills become clickable
 */
const WizardProgress = ({ steps = [], current = 1, onStepClick }) => {
    const total = steps.length || 1;
    // Map current (1..total) to 0..1 — the fill lands centered on each step.
    const progress = total > 1 ? (current - 1) / (total - 1) : 1;

    return (
        <div className="px-wizard" role="group" aria-label="Progress">
            <div className="px-wizard-track">
                <motion.div
                    className="px-wizard-fill"
                    initial={false}
                    animate={{ width: `${progress * 100}%` }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                />
            </div>

            <div className="px-wizard-steps">
                {steps.map((s, idx) => {
                    const n = idx + 1;
                    const state = n < current ? 'done' : n === current ? 'active' : 'idle';
                    const clickable = !!onStepClick && n <= current; // Back-nav only
                    return (
                        <button
                            key={n}
                            type="button"
                            className={`px-wizard-step ${state} ${clickable ? 'is-clickable' : ''}`}
                            onClick={clickable ? () => onStepClick(n) : undefined}
                            aria-current={state === 'active' ? 'step' : undefined}
                            disabled={!clickable && state === 'idle'}
                        >
                            <span className="px-wizard-step-num">
                                {state === 'done' ? '✓' : n}
                            </span>
                            <span className="px-wizard-step-label">{s.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default WizardProgress;
