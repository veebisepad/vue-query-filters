/**
 * Creates a collection of filter factory functions
 * @returns Object containing filter factory methods
 */

import { AllowedFilter, MultipleFilter, RangeFilter, SingleFilter } from './types';

export const createFilterFactory = () => {
    const allowedFilters = {
        /**
         * Creates a filter for a single value
         * @template SingleType Type of the filter value
         * @param defaultValue Default value when filter key is not present
         * @returns A filter object handling single values
         */
        single: <SingleType>(defaultValue: SingleType = null as SingleType): SingleFilter<SingleType> => ({
            defaultValue,
            parseQueryParam(value: string | null): SingleType {
                return !value ? this.defaultValue : (value as SingleType);
            },
            serializeQueryParam(value: SingleType): string | null {
                return !value ? null : String(value);
            },
            hasValue(filterValue: SingleType, value: string | number): boolean {
                return filterValue?.toString() === value.toString();
            },
        }),

        /**
         * Creates a filter for multiple values
         * @template MultipleType Type of each item in the array
         * @param defaultValue Default array when filter key is not present
         * @returns A filter object handling arrays
         */
        multiple: <MultipleType>(defaultValue: MultipleType[] = []): MultipleFilter<MultipleType> => ({
            defaultValue,
            parseQueryParam(value: string | null, delimiter: string): MultipleType[] {
                return !value ? this.defaultValue : (value.split(delimiter) as MultipleType[]);
            },
            serializeQueryParam(value: MultipleType[], delimiter: string): string | null {
                return !Array.isArray(value) || !value.length ? null : value.join(delimiter);
            },
            hasValue(filterValue: MultipleType[], value: string | number): boolean {
                return Array.isArray(filterValue) ? filterValue.includes(value as MultipleType) : false;
            },
        }),

        /**
         * Creates a range filter
         * @template RangeType Type of the range endpoints
         * @param defaultValue Default range when filter key is not present
         * @returns A filter object handling { from: RangeType; to: RangeType }
         */
        range: <RangeType>(defaultValue: { from: RangeType; to: RangeType } = { from: null as RangeType, to: null as RangeType }): RangeFilter<RangeType> => ({
            defaultValue,
            parseQueryParam(value: string | null, delimiter: string): { from: RangeType; to: RangeType } {
                if (!value) return this.defaultValue;
                const [from, to] = value.split(delimiter);
                return {
                    from: from ? (from as unknown as RangeType) : this.defaultValue.from,
                    to: to ? (to as unknown as RangeType) : this.defaultValue.to,
                };
            },
            serializeQueryParam(value: { from: RangeType; to: RangeType }, delimiter: string): string | null {
                if (!value || (value.from === null && value.to === null)) return null;
                return [value.from, value.to].join(delimiter);
            },
            hasValue(filterValue: { from: RangeType; to: RangeType }, value: string | number): boolean {
                return filterValue?.from?.toString() === value.toString() || filterValue?.to?.toString() === value.toString();
            },
        }),

        /**
         * Allows creating a custom filter
         * @template CustomType Type of the filter value
         * @param filter A fully-defined filter object
         * @returns The same filter, for custom scenarios
         */
        custom: <CustomType>(filter: AllowedFilter<CustomType>): AllowedFilter<CustomType> => filter,
    };

    return allowedFilters;
};
