/**
 *  @packageDocumentation
 * Vue Query Filters - reactive URL query parameter handling for Vue 3 applications.
 *
 * @module vue-query-filters
 */

import { createFilterFactory } from './createFilterFactory.js';

export * from './types';

// Re-export core functions
export { createFilterFactory } from './createFilterFactory.js';
export { useFilters } from './useFilters.js';

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
