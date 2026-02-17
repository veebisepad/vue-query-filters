/**
 * Creates a collection of filter factory functions
 * @returns Object containing filter factory methods
 */
export const createFilterFactory = (options) => {
    const keyTransformer = options?.keyTransformer || ((key) => key);
    /**
     * Transforms a key using the provided key transformer function
     * @param key The key to wrap
     * @returns The transformed key
     */
    const transformKey = (key) => keyTransformer(key);
    const allowedFilters = {
        /**
         * Creates a filter for a single value
         * @template SingleType Type of the filter value
         * @param defaultValue Default value when filter key is not present
         * @returns A filter object handling single values
         */
        single: (defaultValue = null) => ({
            defaultValue,
            parseQueryParam(value) {
                return !value ? this.defaultValue : value;
            },
            serializeQueryParam(value) {
                return !value ? null : String(value);
            },
            hasValue(filterValue, value) {
                return filterValue?.toString() === value.toString();
            },
            transformKey,
        }),
        /**
         * Creates a filter for multiple values
         * @template MultipleType Type of each item in the array
         * @param defaultValue Default array when filter key is not present
         * @returns A filter object handling arrays
         */
        multiple: (defaultValue = []) => ({
            defaultValue,
            parseQueryParam(value, delimiter) {
                return !value ? this.defaultValue : value.split(delimiter);
            },
            serializeQueryParam(value, delimiter) {
                return !Array.isArray(value) || !value.length ? null : value.join(delimiter);
            },
            hasValue(filterValue, value) {
                return Array.isArray(filterValue) ? filterValue.includes(value) : false;
            },
            transformKey,
        }),
        /**
         * Creates a range filter
         * @template RangeType Type of the range endpoints
         * @param defaultValue Default range when filter key is not present
         * @returns A filter object handling { from: RangeType; to: RangeType }
         */
        range: (defaultValue = { from: null, to: null }) => ({
            defaultValue,
            parseQueryParam(value, delimiter) {
                if (!value)
                    return this.defaultValue;
                const [from, to] = value.split(delimiter);
                return {
                    from: from ? from : this.defaultValue.from,
                    to: to ? to : this.defaultValue.to,
                };
            },
            serializeQueryParam(value, delimiter) {
                if (!value || (value.from === null && value.to === null))
                    return null;
                return [value.from, value.to].join(delimiter);
            },
            hasValue(filterValue, value) {
                return filterValue?.from?.toString() === value.toString() || filterValue?.to?.toString() === value.toString();
            },
            transformKey,
        }),
        /**
         * Allows creating a custom filter
         * @template CustomType Type of the filter value
         * @param filter A fully-defined filter object
         * @returns The same filter, for custom scenarios
         */
        custom: (filter) => {
            return {
                ...filter,
                transformKey,
            };
        },
    };
    return allowedFilters;
};
