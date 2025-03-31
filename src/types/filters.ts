import { Reactive } from 'vue';

/**
 * Base interface for all filter types
 * @template T The type of value this filter handles
 */
export interface AllowedFilter<T> {
    /** Default value when filter is not specified */
    defaultValue: T;
    /**
     * Converts a URL parameter string to filter value
     * @param value The string value from URL query parameter
     * @param delimiter Character used to split multiple values
     * @returns Properly typed filter value
     */
    parseQueryParam(value: string | null, delimiter: string): T;
    /**
     * Converts filter value to URL parameter string
     * @param value The filter value to convert
     * @param delimiter Character used to join multiple values
     * @returns String representation for URL or null if empty/default
     */
    serializeQueryParam(value: T, delimiter: string): string | null;
    /**
     * Checks if a specific value exists in the filter
     * @param filterValue Current filter value
     * @param value Value to check for
     * @returns True if value exists in filter
     */
    hasValue(filterValue: T, value: string | number): boolean;
}

/** Map of filter keys to their filter implementation */
export type Filters = Record<string, AllowedFilter<any>>;

/** Map of filter keys to their string representation for URL */
export type QueryObject<T> = Record<keyof T, string>;

/**
 * Maps filter types to their value types using the defaultValue property
 * @template T Input type with defaultValue property
 */
export type FilterValueMap<T> = T extends { defaultValue: infer V } ? V : never;

/**
 * Complete filter object with values and methods
 * @template T Filter configuration type
 */
export type QueryFilters<T extends Filters> = Reactive<{ [K in keyof T]: FilterValueMap<T[K]> } & FilterMethods<T>>;

export type FilterState<T extends Filters> = {
    [K in keyof T]: FilterValueMap<T[K]>;
} & FilterMethods<T>;
/**
 * Configuration options for filters
 */
export interface Options<T> {
    /** Character used to separate multiple values in URL parameters */
    delimiter: string;
    /**
     * Callback triggered when filters are applied
     * @param filters The query object with current filter values
     */
    onApply?(filters: QueryObject<T>): void;
}

/**
 * Methods available on the filter object
 * @template T Type of the filters configuration
 */
export interface FilterMethods<T extends Filters> {
    /**
     * Converts current filter values to URLSearchParams
     * @returns URLSearchParams object for use in fetch or URL construction
     */
    toSearchParams(): URLSearchParams;

    /**
     * Triggers the onApply callback with current filter values
     */
    get(): void;

    /**
     * Creates an object with filter keys and their string representations
     * @returns Object mapping filter keys to query string values
     */
    toQueryObject(): QueryObject<T>;

    /**
     * Checks if a value exists in the specified filter
     * @param filter The filter key to check
     * @param value The value to look for
     * @returns True if the value exists in the filter
     */
    has<K extends keyof T>(filter: K, value: string | number): boolean;

    /**
     * Resets one or more filters to their default values
     * @param filterKey Single key or array of keys to reset
     * @param shouldGet Whether to trigger the onApply callback after clearing
     */
    clear<K extends keyof T>(filterKey: K | K[], shouldGet?: boolean): void;

    /**
     * Resets all filters to their default values
     */
    clearAll(): void;

    /**
     * Updates filter options
     * @param newOptions New options to merge with existing ones
     */
    setOptions(newOptions: Partial<Options<T>>): void;
}

export interface SingleFilter<T> extends AllowedFilter<T> {
    defaultValue: T;
}
export interface MultipleFilter<T> extends AllowedFilter<T[]> {
    defaultValue: T[];
}
export interface RangeFilter<T> extends AllowedFilter<{ from: T; to: T }> {
    defaultValue: { from: T; to: T };
}
