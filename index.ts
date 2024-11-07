import { reactive } from 'vue';

type Single = 'single';
type Multiple = 'multiple';
type Between = 'between';

type FilterType = Single | Multiple | Between;

type Filters = Record<string, FilterType>;

type FilterValueMap<V> = V extends Single
    ? string | number | undefined | null
    : V extends Multiple
    ? string[] | number[]
    : V extends Between
    ? { from: string | number | null | undefined; to: string | number | null | undefined }
    : never;

interface Options {
    delimiter?: string;
    onGet?(filters: QueryObject): void;
}

export type QueryObject = Record<string, string>;

export function useFilters<T extends Filters>(filters: T, options: Options = {}) {
    const queryParams = new URLSearchParams(document.location.search);
    const delimiter = options.delimiter ?? ',';
    const filterKeys = Object.keys(filters);

    const filterProps = (Object.keys(filters) as Array<keyof T>).reduce((carry, key) => {
        const value = queryParams.get(key as string);

        switch (filters[key]) {
            case 'single':
                carry[key] = value as FilterValueMap<T[keyof T]>;
                break;
            case 'multiple':
                carry[key] = (value ? value.split(delimiter) : []) as FilterValueMap<T[keyof T]>;
                break;
            case 'between':
                const [from, to] = value?.split(delimiter) ?? [];
                carry[key] = { from: from ?? null, to: to ?? null } as FilterValueMap<T[keyof T]>;
                break;
        }
        return carry;
    }, {} as { [K in keyof T]: FilterValueMap<T[K]> });

    const hasCallback = !!options.onGet;

    const methods = {
        toSeachParams(): URLSearchParams {
            return new URLSearchParams(this.toQueryObject());
        },
        get(): void {
            if (options.onGet) {
                options.onGet(this.toQueryObject());
            } else {
                console.error('Cannot use get() - Filter callback is not set');
            }
        },
        toQueryObject(): QueryObject {
            return filterKeys.reduce((carry, key) => {
                const type = filters[key];
                const filterProp = this[key];

                switch (type) {
                    case 'single':
                        if (filterProp) {
                            carry[key] = filterProp.toString();
                        }
                        break;
                    case 'multiple':
                        if (Array.isArray(filterProp) && filterProp.length) {
                            carry[key] = filterProp.join(delimiter);
                        }
                        break;
                    case 'between':
                        if (filterProp && filterProp.from && filterProp.to) {
                            carry[key] = [filterProp.from, filterProp.to].join(delimiter);
                        }
                        break;
                }
                return carry;
            }, {} as QueryObject);
        },
        has(filter: string, value: string | number): boolean {
            const type = filters[filter];
            const filterProp = this[filter];

            if (!type) {
                console.error(`Filter "${filter}" does not exist.`);
                return false;
            }

            switch (type) {
                case 'single':
                    return filterProp?.toString() === value.toString();
                case 'multiple':
                    return Array.isArray(filterProp) ? filterProp.includes(value) : false;
                case 'between':
                    return filterProp?.from === value || filterProp?.to === value;
            }
        },
        clear(filter: string, shouldGet = true): void {
            const type = filters[filter];

            if (!type) {
                console.error(`Filter "${filter}" does not exist.`);
                return;
            }

            switch (type) {
                case 'single':
                    this[filter] = null;
                    break;
                case 'multiple':
                    this[filter] = [];
                    break;
                case 'between':
                    this[filter] = { from: null, to: null };
                    break;
            }
            if (hasCallback && shouldGet) {
                this.get();
            }
        },
        clearAll() {
            if (filterKeys.length === 0) return;

            filterKeys.forEach(filter => {
                this.clear(filter, false);
            });

            if (hasCallback) {
                this.get();
            }
        },
    };

    return reactive({
        ...filterProps,
        ...methods,
    });
}
