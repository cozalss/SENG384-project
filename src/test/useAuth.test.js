import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../hooks/useAuth';

// Mock Firestore services to avoid real network calls.
vi.mock('../services/firestore', () => ({
    updateUserInFirestore: vi.fn(async () => {}),
    deleteUserFromFirestore: vi.fn(async () => {}),
    addActivityLog: vi.fn(async () => {})
}));

describe('useAuth', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('starts with null user when localStorage is empty', () => {
        const { result } = renderHook(() => useAuth());
        expect(result.current.user).toBeNull();
    });

    it('restores user synchronously from localStorage (no flicker)', () => {
        const saved = { id: 'u1', name: 'Cem Ozal', email: 'cem@uni.edu', role: 'Engineer' };
        localStorage.setItem('health_ai_user', JSON.stringify(saved));
        const { result } = renderHook(() => useAuth());
        expect(result.current.user).toEqual(saved);
    });

    it('updates user on single-arg call', async () => {
        const saved = { id: 'u1', name: 'Cem', role: 'Engineer' };
        localStorage.setItem('health_ai_user', JSON.stringify(saved));
        const { result } = renderHook(() => useAuth());

        await act(async () => {
            await result.current.updateUser({ name: 'Cem Ozal' });
        });

        expect(result.current.user.name).toBe('Cem Ozal');
        expect(JSON.parse(localStorage.getItem('health_ai_user')).name).toBe('Cem Ozal');
    });

    it('updates user on legacy (id, fields) call shape', async () => {
        const saved = { id: 'u1', name: 'A', city: 'Ankara' };
        localStorage.setItem('health_ai_user', JSON.stringify(saved));
        const { result } = renderHook(() => useAuth());

        await act(async () => {
            await result.current.updateUser('u1', { city: 'Istanbul' });
        });

        expect(result.current.user.city).toBe('Istanbul');
    });

    it('logout clears user and localStorage', async () => {
        localStorage.setItem('health_ai_user', JSON.stringify({ id: 'u1', name: 'A', role: 'Engineer' }));
        const { result } = renderHook(() => useAuth());

        await act(async () => {
            await result.current.logout();
        });

        expect(result.current.user).toBeNull();
        expect(localStorage.getItem('health_ai_user')).toBeNull();
    });

    it('deleteUser clears session', async () => {
        localStorage.setItem('health_ai_user', JSON.stringify({ id: 'u1', name: 'A', role: 'Engineer' }));
        const { result } = renderHook(() => useAuth());

        await act(async () => {
            await result.current.deleteUser();
        });

        expect(result.current.user).toBeNull();
        expect(localStorage.getItem('health_ai_user')).toBeNull();
    });
});
