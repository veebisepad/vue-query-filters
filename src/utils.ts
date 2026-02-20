import type { LocationLike } from './types';

// Avoid leaking reactive references (or any mutable reference) via defaultValue.
export const cloneDefault = <T>(value: T): T => {
    if (Array.isArray(value)) {
        return [...value] as unknown as T;
    }
    if (value && typeof value === 'object') {
        return JSON.parse(JSON.stringify(value)) as unknown as T;
    }

    return value;
};

export function getSearchParams(location?: LocationLike): URLSearchParams {
    const resolved = resolveLocation(location);

    if (!resolved) {
        return new URLSearchParams();
    }

    return new URLSearchParams(resolved.search);
}

/**
 * Safely resolves current location in any environment
 */
export function resolveLocation(location?: LocationLike): LocationLike | undefined {
    if (location) {
        return location;
    }

    if (typeof window !== 'undefined' && window.location) {
        return window.location;
    }

    return undefined;
}
