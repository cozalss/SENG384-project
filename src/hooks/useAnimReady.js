import { createContext, useContext } from 'react';

/**
 * Provides a flag for "skip entrance animations" during the very first render
 * of the app (hard refresh). Pages read this flag and pass `initial={false}`
 * when true so there's no visible entrance animation on F5.
 *
 * Default value is `true` (skip) so motion components render instantly even
 * before the provider wraps — safest no-flash behavior.
 */
export const AnimReadyContext = createContext(false);

export const useAnimReady = () => useContext(AnimReadyContext);
