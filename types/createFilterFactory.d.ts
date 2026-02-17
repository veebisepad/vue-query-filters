/**
 * Creates a collection of filter factory functions
 * @returns Object containing filter factory methods
 */
import { AllowedFilter, FilterFactoryOptions, MultipleFilter, RangeFilter, SingleFilter } from './types';
export declare const createFilterFactory: (options?: FilterFactoryOptions) => {
    /**
     * Creates a filter for a single value
     * @template SingleType Type of the filter value
     * @param defaultValue Default value when filter key is not present
     * @returns A filter object handling single values
     */
    single: <SingleType>(defaultValue?: SingleType) => SingleFilter<SingleType>;
    /**
     * Creates a filter for multiple values
     * @template MultipleType Type of each item in the array
     * @param defaultValue Default array when filter key is not present
     * @returns A filter object handling arrays
     */
    multiple: <MultipleType>(defaultValue?: MultipleType[]) => MultipleFilter<MultipleType>;
    /**
     * Creates a range filter
     * @template RangeType Type of the range endpoints
     * @param defaultValue Default range when filter key is not present
     * @returns A filter object handling { from: RangeType; to: RangeType }
     */
    range: <RangeType>(defaultValue?: {
        from: RangeType;
        to: RangeType;
    }) => RangeFilter<RangeType>;
    /**
     * Allows creating a custom filter
     * @template CustomType Type of the filter value
     * @param filter A fully-defined filter object
     * @returns The same filter, for custom scenarios
     */
    custom: <CustomType>(filter: AllowedFilter<CustomType>) => AllowedFilter<CustomType>;
};
//# sourceMappingURL=createFilterFactory.d.ts.map