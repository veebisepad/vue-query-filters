import { reactive, ref } from 'vue';
import { Filters, FilterState, FilterValueMap, Options, QueryFilters, QueryObject } from './types';

/**
 * Creates a reactive filter object from filter configurations
 * @param filters Map of filter keys to their configurations
 * @param initialOptions Initial options for the filters
 * @returns Reactive filter object with values and methods
 */
export function useFilters<T extends Filters>(filters: T, initialOptions: Partial<Options> = {}): QueryFilters<T> {
    const queryParams = new URLSearchParams(document.location.search);
    let options = { delimiter: ',', preserveQueryOrder: true, ...initialOptions };
    const filterKeys = Object.keys(filters) as Array<keyof T>;
    const processing = ref(false);

    const filterProps =
        Object.keys(filters).length > 0
            ? (Object.keys(filters) as Array<keyof T>).reduce((carry, key) => {
                  const filterConfig = filters[key];
                  const transformedKey = filterConfig.transformKey(key as string);
                  const paramValue = queryParams.get(transformedKey);

                  carry[key] = filterConfig.parseQueryParam(paramValue, options.delimiter) as FilterValueMap<typeof filterConfig>;

                  return carry;
              }, {} as { [K in keyof T]: FilterValueMap<T[K]> })
            : ({} as { [K in keyof T]: FilterValueMap<T[K]> });

    const hasCallback = !!options.onApply;

    const filterObject: FilterState<T> = {
        ...filterProps,
        get processing() {
            return processing.value;
        },
        toSearchParams(): URLSearchParams {
            return new URLSearchParams(this.toQueryObject());
        },

        get(): void {
            if (options.onApply) {
                processing.value = true;
                const result = options.onApply(options.preserveQueryOrder ? this.toOrderedQueryObject() : this.toQueryObject());
                
                // Check if result is a Promise
                if (result && typeof result.then === 'function') {
                    result.finally(() => {
                        processing.value = false;
                    });
                } else {
                    processing.value = false;
                }
            } else {
                console.warn('Cannot use get() - Filter callback is not set');
            }
        },

        toOrderedQueryObject(transformKeys = true): QueryObject {
            const queryObject = this.toQueryObject(transformKeys);
            const orderedObject: QueryObject = {};

            new URLSearchParams(document.location.search).forEach((_, key) => {
                if (key in queryObject) {
                    orderedObject[key] = queryObject[key];
                }
            });

            return Object.assign(orderedObject, queryObject);
        },

        toQueryObject(transformKeys = true): QueryObject {
            return filterKeys.reduce((queryObject, key) => {
                const paramValue = filters[key].serializeQueryParam(this[key], options.delimiter);

                if (paramValue) {
                    const objectKey = transformKeys ? filters[key].transformKey(key as string) : key;
                    queryObject[objectKey as string] = paramValue;
                }

                return queryObject;
            }, {} as QueryObject);
        },

        data(): { [K in keyof T]: FilterValueMap<T[K]> } {
            return filterProps;
        },

        has<K extends keyof T>(filter: K, value: string | number): boolean {
            return filters[filter].hasValue(this[filter], value) ?? false;
        },
        clear<K extends keyof T>(filterKey: K | K[], shouldGet = true): void {
            const filtersToClear = Array.isArray(filterKey) ? filterKey : [filterKey];
            if (filtersToClear.length === 0) return;

            filtersToClear.forEach(key => {
                this[key] = filters[key].defaultValue;
            });

            if (hasCallback && shouldGet) {
                this.get();
            }
        },
        clearAll() {
            this.clear(filterKeys, true);
        },
        setOptions(newOptions: Partial<Options>) {
            options = { ...options, ...newOptions };
        },
    };
    return reactive(filterObject) as QueryFilters<T>;
}
