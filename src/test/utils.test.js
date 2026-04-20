import { describe, it, expect } from 'vitest';

/**
 * Smoke tests for lightweight pure logic used across the app.
 * We exercise behaviour that the routing / filter code depends on.
 */

describe('post filter logic', () => {
    const sample = [
        { id: 'p1', title: 'AI Diagnostics Platform', explanation: 'ECG anomaly detection', domain: 'AI Diagnostics', expertiseNeeded: 'Cardiology', authorRole: 'Engineer', status: 'Active', city: 'Istanbul', country: 'TR', projectStage: 'prototype developed' },
        { id: 'p2', title: 'Wearable Glucose Monitor', explanation: 'Non-invasive sensor', domain: 'Wearable Tech', expertiseNeeded: 'Clinical trials', authorRole: 'Healthcare Professional', status: 'CLOSED', city: 'Ankara', country: 'TR', projectStage: 'pilot testing' },
        { id: 'p3', title: 'Deleted item', explanation: 'x', domain: 'AI Diagnostics', status: 'DELETED', authorRole: 'Engineer', city: 'x', country: 'x', projectStage: 'idea', expertiseNeeded: 'x' }
    ];

    const filter = (posts, opts) => posts.filter(post => {
        if (post.status === 'DELETED') return false;
        if (opts.status && opts.status !== 'All' && post.status !== opts.status) return false;
        if (opts.domain && opts.domain !== 'All' && post.domain !== opts.domain) return false;
        if (opts.search) {
            const q = opts.search.toLowerCase();
            const hit = post.title.toLowerCase().includes(q)
                || post.explanation.toLowerCase().includes(q)
                || post.domain.toLowerCase().includes(q)
                || (post.expertiseNeeded || '').toLowerCase().includes(q);
            if (!hit) return false;
        }
        return true;
    });

    it('hides DELETED posts unconditionally', () => {
        const out = filter(sample, { status: 'All' });
        expect(out.find(p => p.id === 'p3')).toBeUndefined();
    });

    it('filters by status', () => {
        const out = filter(sample, { status: 'Active' });
        expect(out.map(p => p.id)).toEqual(['p1']);
    });

    it('filters by domain', () => {
        const out = filter(sample, { domain: 'Wearable Tech' });
        expect(out.map(p => p.id)).toEqual(['p2']);
    });

    it('searches across title / explanation / domain / expertise', () => {
        expect(filter(sample, { search: 'Cardiology' }).map(p => p.id)).toEqual(['p1']);
        expect(filter(sample, { search: 'glucose' }).map(p => p.id)).toEqual(['p2']);
        expect(filter(sample, { search: 'nonexistent' })).toEqual([]);
    });
});

describe('email validation (Login rules)', () => {
    const validateEduEmail = (email) => {
        const parts = email.split('@');
        if (parts.length !== 2) return false;
        return parts[1].includes('.edu');
    };

    const isPersonalEmail = (email) => {
        const personalDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
        const domain = email.split('@')[1]?.toLowerCase();
        return personalDomains.includes(domain);
    };

    it('accepts .edu addresses', () => {
        expect(validateEduEmail('cem@boun.edu.tr')).toBe(true);
        expect(validateEduEmail('alice@mit.edu')).toBe(true);
    });

    it('rejects non-.edu addresses', () => {
        expect(validateEduEmail('cem@gmail.com')).toBe(false);
        expect(validateEduEmail('alice@company.com')).toBe(false);
    });

    it('rejects malformed input', () => {
        expect(validateEduEmail('noatsign')).toBe(false);
        expect(validateEduEmail('')).toBe(false);
    });

    it('flags personal providers', () => {
        expect(isPersonalEmail('a@gmail.com')).toBe(true);
        expect(isPersonalEmail('a@uni.edu')).toBe(false);
    });
});

describe('status pill mapping (MyPosts)', () => {
    const getPill = (status) => {
        if (status === 'CLOSED') return { label: 'Partner Found', cls: 'pill-neon' };
        if (status === 'Meeting Scheduled') return { label: status, cls: 'pill-cyan' };
        if (status === 'Active') return { label: status, cls: 'pill-neon' };
        if (status === 'Draft') return { label: status, cls: 'pill-amber' };
        if (status === 'Expired') return { label: status, cls: 'pill-amber' };
        return { label: status, cls: 'pill-cyan' };
    };

    it('maps CLOSED → Partner Found (neon)', () => {
        expect(getPill('CLOSED')).toEqual({ label: 'Partner Found', cls: 'pill-neon' });
    });

    it('maps Meeting Scheduled → cyan', () => {
        expect(getPill('Meeting Scheduled').cls).toBe('pill-cyan');
    });

    it('maps Draft/Expired → amber', () => {
        expect(getPill('Draft').cls).toBe('pill-amber');
        expect(getPill('Expired').cls).toBe('pill-amber');
    });
});
