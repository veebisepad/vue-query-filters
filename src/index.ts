/**
 * Vue Query Filters - URL query parameter handling for Vue applications
 * @module vue-query-filters
 */

import { createFilterFactory } from './createFilterFactory';

export * from './types';

// Re-export core functions
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
export const factory = createFilterFactory();
