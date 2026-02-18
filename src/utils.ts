// Avoid leaking reactive references (or any mutable reference) via defaultValue.
export const cloneDefault = <T>(value: T): T => {
    if (Array.isArray(value)) return [...value] as unknown as T;
    if (value && typeof value === 'object') return JSON.parse(JSON.stringify(value)) as unknown as T;
    return value;
};
