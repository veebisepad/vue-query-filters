/**
 * Vue Query Filters - URL query parameter handling for Vue applications
 * @module vue-query-filters
 */
export * from './types';
export { createFilterFactory } from './createFilterFactory';
export { useFilters } from './useFilters';
/**
 * Pre-configured filter factory for convenience
 * @example
 * import { factory } from 'vue-query-filters';
 *
 * const filters = useFilters({
 *   search: factory.single<string>(),
 *   categories: factory.multiple<string>()
 * });
 */
export declare const factory: {
    single: <SingleType>(defaultValue?: SingleType) => import("./types").SingleFilter<SingleType>;
    multiple: <MultipleType>(defaultValue?: MultipleType[]) => import("./types").MultipleFilter<MultipleType>;
    range: <RangeType>(defaultValue?: {
        from: RangeType;
        to: RangeType;
    }) => import("./types").RangeFilter<RangeType>;
    custom: <CustomType>(filter: import("./types").AllowedFilter<CustomType>) => import("./types").AllowedFilter<CustomType>;
};
//# sourceMappingURL=index.d.ts.map