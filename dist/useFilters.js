import { reactive, ref } from 'vue';
/**
 * Creates a reactive filter object from filter configurations
 * @param filters Map of filter keys to their configurations
 * @param initialOptions Initial options for the filters
 * @returns Reactive filter object with values and methods
 */
export function useFilters(filters, initialOptions = {}) {
    const queryParams = new URLSearchParams(document.location.search);
    let options = { delimiter: ',', preserveQueryOrder: true, ...initialOptions };
    const filterKeys = Object.keys(filters);
    const processing = ref(false);
    const filterProps = Object.keys(filters).length > 0
        ? Object.keys(filters).reduce((carry, key) => {
            const filterConfig = filters[key];
            const transformedKey = filterConfig.transformKey(key);
            const paramValue = queryParams.get(transformedKey);
            carry[key] = filterConfig.parseQueryParam(paramValue, options.delimiter);
            return carry;
        }, {})
        : {};
    const hasCallback = !!options.onApply;
    const filterObject = {
        ...filterProps,
        get processing() {
            return processing.value;
        },
        toSearchParams() {
            return new URLSearchParams(this.toQueryObject());
        },
        get() {
            if (options.onApply) {
                processing.value = true;
                const result = options.onApply(options.preserveQueryOrder ? this.toOrderedQueryObject() : this.toQueryObject());
                // Check if result is a Promise
                if (result && typeof result.then === 'function') {
                    result.finally(() => {
                        processing.value = false;
                    });
                }
                else {
                    processing.value = false;
                }
            }
            else {
                console.warn('Cannot use get() - Filter callback is not set');
            }
        },
        toOrderedQueryObject(transformKeys = true) {
            const queryObject = this.toQueryObject(transformKeys);
            const orderedObject = {};
            new URLSearchParams(document.location.search).forEach((_, key) => {
                if (key in queryObject) {
                    orderedObject[key] = queryObject[key];
                }
            });
            return Object.assign(orderedObject, queryObject);
        },
        toQueryObject(transformKeys = true) {
            return filterKeys.reduce((queryObject, key) => {
                const paramValue = filters[key].serializeQueryParam(this[key], options.delimiter);
                if (paramValue) {
                    const objectKey = transformKeys ? filters[key].transformKey(key) : key;
                    queryObject[objectKey] = paramValue;
                }
                return queryObject;
            }, {});
        },
        data() {
            return filterProps;
        },
        has(filter, value) {
            return filters[filter].hasValue(this[filter], value) ?? false;
        },
        clear(filterKey, shouldGet = true) {
            const filtersToClear = Array.isArray(filterKey) ? filterKey : [filterKey];
            if (filtersToClear.length === 0)
                return;
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
        setOptions(newOptions) {
            options = { ...options, ...newOptions };
        },
    };
    return reactive(filterObject);
}
