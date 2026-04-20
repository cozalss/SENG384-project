import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Minimal window shims that jsdom doesn't provide but our code uses.
if (!window.matchMedia) {
    window.matchMedia = vi.fn().mockImplementation(query => ({
        matches: false, media: query, onchange: null,
        addListener: vi.fn(), removeListener: vi.fn(),
        addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn()
    }));
}

if (!window.IntersectionObserver) {
    window.IntersectionObserver = class {
        observe() {} unobserve() {} disconnect() {} takeRecords() { return []; }
    };
}

if (!window.ResizeObserver) {
    window.ResizeObserver = class {
        observe() {} unobserve() {} disconnect() {}
    };
}

if (!window.scrollTo) {
    window.scrollTo = vi.fn();
}
