import { useEffect, useRef, useState, useCallback, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import './PxSelect.css';

/**
 * Premium select — keyboard-accessible popover with aurora-amber active state.
 *
 * Props:
 *   - value: string (controlled)
 *   - onChange: (newValue) => void
 *   - options: Array<{ value: string, label: string, hint?: string }>
 *   - label?: string — eyebrow label shown inside the trigger (e.g. "Domain:")
 *   - placeholder?: string
 *   - align?: 'start' | 'end' — align popover to trigger edge (default: start)
 *   - size?: 'sm' | 'md' (default: md)
 *
 * A11y: roving focus with ArrowUp/Down, Home/End, Enter/Space to select, Esc to close.
 */
const PxSelect = ({
    value,
    onChange,
    options = [],
    label,
    placeholder = 'Select…',
    align = 'start',
    size = 'md',
    id,
    className = '',
    ariaLabel,
    /** Optional: when truthy, the trigger renders a small green accent dot in
     *  its corner. Use this to signal "this filter has a non-default value
     *  applied" so users can scan the bar at a glance. */
    isActive = false,
}) => {
    const [open, setOpen] = useState(false);
    const [activeIdx, setActiveIdx] = useState(() => Math.max(0, options.findIndex(o => o.value === value)));
    const triggerRef = useRef(null);
    const popoverRef = useRef(null);
    const [rect, setRect] = useState(null);

    const selected = options.find(o => o.value === value);
    const selectedIdx = Math.max(0, options.findIndex(o => o.value === value));

    const updateRect = useCallback(() => {
        const t = triggerRef.current;
        if (!t) return;
        const r = t.getBoundingClientRect();
        setRect({
            top: r.bottom + 6,
            left: align === 'end' ? r.right : r.left,
            right: align === 'end' ? window.innerWidth - r.right : undefined,
            width: Math.max(r.width, 200),
        });
    }, [align]);

    useLayoutEffect(() => {
        if (!open) return;
        updateRect();
        const onResize = () => updateRect();
        window.addEventListener('resize', onResize);
        window.addEventListener('scroll', onResize, true);
        return () => {
            window.removeEventListener('resize', onResize);
            window.removeEventListener('scroll', onResize, true);
        };
    }, [open, updateRect]);

    const openMenu = () => {
        setActiveIdx(selectedIdx);
        setOpen(true);
    };

    // Click-outside
    useEffect(() => {
        if (!open) return;
        const onPointerDown = (e) => {
            if (triggerRef.current?.contains(e.target)) return;
            if (popoverRef.current?.contains(e.target)) return;
            setOpen(false);
        };
        window.addEventListener('mousedown', onPointerDown);
        return () => window.removeEventListener('mousedown', onPointerDown);
    }, [open]);

    // Keyboard on the trigger / popover
    const onTriggerKey = (e) => {
        if (['ArrowDown', 'Enter', ' '].includes(e.key)) {
            e.preventDefault();
            openMenu();
        }
    };

    const onPopoverKey = (e) => {
        if (e.key === 'Escape') { e.preventDefault(); setOpen(false); triggerRef.current?.focus(); return; }
        if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => (i + 1) % options.length); return; }
        if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIdx(i => (i - 1 + options.length) % options.length); return; }
        if (e.key === 'Home')      { e.preventDefault(); setActiveIdx(0); return; }
        if (e.key === 'End')       { e.preventDefault(); setActiveIdx(options.length - 1); return; }
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            const opt = options[activeIdx];
            if (opt) { onChange?.(opt.value); setOpen(false); triggerRef.current?.focus(); }
        }
    };

    return (
        <>
            <button
                ref={triggerRef}
                id={id}
                type="button"
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-label={ariaLabel}
                className={`px-select-trigger ${size} ${open ? 'is-open' : ''} ${isActive ? 'is-filter-active' : ''} ${className}`}
                onClick={() => {
                    if (open) setOpen(false);
                    else openMenu();
                }}
                onKeyDown={onTriggerKey}
            >
                <span className="px-select-value">
                    {label && <span className="px-select-label">{label}</span>}
                    <span className="px-select-text">
                        {selected ? selected.label : <span style={{ color: 'var(--text-subtle)' }}>{placeholder}</span>}
                    </span>
                </span>
                <motion.span
                    className="px-select-chev"
                    aria-hidden="true"
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
                >
                    <ChevronDown size={14} strokeWidth={2.2} />
                </motion.span>
                {isActive && <span className="px-select-active-dot" aria-hidden="true" />}
            </button>

            {typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                    {open && rect && (
                        <motion.div
                            ref={popoverRef}
                            role="listbox"
                            tabIndex={-1}
                            onKeyDown={onPopoverKey}
                            initial={{ opacity: 0, y: -6, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -4, scale: 0.98 }}
                            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                            className="px-select-popover"
                            style={{
                                position: 'fixed',
                                top: rect.top,
                                left: align === 'start' ? rect.left : undefined,
                                right: align === 'end' ? rect.right : undefined,
                                minWidth: rect.width,
                            }}
                        >
                            {options.map((opt, i) => {
                                const isActive = i === activeIdx;
                                const isSelected = opt.value === value;
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        role="option"
                                        aria-selected={isSelected}
                                        className={`px-select-option ${isActive ? 'is-active' : ''} ${isSelected ? 'is-selected' : ''}`}
                                        onMouseEnter={() => setActiveIdx(i)}
                                        onClick={() => {
                                            onChange?.(opt.value);
                                            setOpen(false);
                                            triggerRef.current?.focus();
                                        }}
                                    >
                                        <span className="px-select-option-body">
                                            <span className="px-select-option-label">{opt.label}</span>
                                            {opt.hint && <span className="px-select-option-hint">{opt.hint}</span>}
                                        </span>
                                        {isSelected && <Check size={13} strokeWidth={2.5} />}
                                    </button>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
};

export default PxSelect;
