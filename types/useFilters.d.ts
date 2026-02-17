import { Filters, Options, QueryFilters } from './types';
/**
 * Creates a reactive filter object from filter configurations
 * @param filters Map of filter keys to their configurations
 * @param initialOptions Initial options for the filters
 * @returns Reactive filter object with values and methods
 */
export declare function useFilters<T extends Filters>(filters: T, initialOptions?: Partial<Options>): QueryFilters<T>;
//# sourceMappingURL=useFilters.d.ts.map