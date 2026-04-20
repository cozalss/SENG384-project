import { useContext } from 'react';
import { ToastContext } from '../components/ToastContext';

export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) {
        return { success: () => {}, error: () => {}, info: () => {}, dismiss: () => {} };
    }
    return ctx;
};
