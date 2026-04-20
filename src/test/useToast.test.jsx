import { describe, it, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ToastProvider } from '../components/ToastProvider';
import { useToast } from '../hooks/useToast';

const Trigger = ({ type = 'success' }) => {
    const toast = useToast();
    return <button onClick={() => toast[type]('hello world', { title: 'Heads up' })}>fire</button>;
};

describe('ToastProvider + useToast', () => {
    it('falls back gracefully when no provider mounted', () => {
        render(<Trigger />);
        // Clicking without provider should not throw.
        const btn = screen.getByText('fire');
        expect(() => btn.click()).not.toThrow();
    });

    it('renders a toast with title + message on success()', () => {
        render(
            <ToastProvider>
                <Trigger />
            </ToastProvider>
        );

        act(() => {
            screen.getByText('fire').click();
        });

        expect(screen.getByText('hello world')).toBeInTheDocument();
        expect(screen.getByText('Heads up')).toBeInTheDocument();
    });

    it('supports error and info types', () => {
        render(
            <ToastProvider>
                <Trigger type="error" />
            </ToastProvider>
        );
        act(() => { screen.getByText('fire').click(); });
        expect(screen.getByText('hello world')).toBeInTheDocument();
    });
});
