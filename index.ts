import { reactive } from 'vue'

interface filterObject {
    key: string,
    multiple: boolean
}

interface options {
    delimiter?: string
    callbackFn?(filters: QueryObject): void
}

export type FilterStruct = filterObject
export type QueryObject = Record<string, string>
export type FilterValueObject = Record<string, any>

interface FilterParams {
    toQueryString(): URLSearchParams
    toQueryObject(): QueryObject
    has(filter: string, value: string | number): boolean
    clear(filter: string): void
    get(): void
    clearAll(): void
}
export type Options<options> = options
export type FilterOptions<filterValueObject> = filterValueObject & FilterParams

export function useFilters(filters: filterObject[], options: Options<options>): FilterOptions<FilterValueObject> {
    const queryParams = new URLSearchParams(document.location.search)
    const delimiter = options.delimiter ?? ','

    let filterParams: FilterValueObject = {}

    filters.forEach((filter: FilterStruct) => {
        const value = queryParams.get(filter.key)
        if(value){
            filterParams[filter.key] = filter.multiple ? value.split(delimiter) : value
        }
        else {
            filterParams[filter.key] = filter.multiple ? [] : null
        }
    })
    const params = reactive({
        ...filterParams,
        hasCallback: options.callbackFn ? true : false,
        toQueryString() {
            let query = new URLSearchParams()

            filters.forEach(filter => {
                if(this[filter.key] && this[filter.key].length) {
                    query.set(filter.key, this[filter.key])
                }
            })
            
            return query
        },
        get(): void {
            if(options.callbackFn){
                return options.callbackFn(this.toQueryObject())
            }
            else {
                console.error('Cannot use get() - Filter callback is not set')
            }
        },
        toQueryObject(): QueryObject {
            const queryObject: QueryObject = {}

            filters.forEach(filter => {
                if(Array.isArray(this[filter.key]) && this[filter.key].length){
                  return queryObject[filter.key] = this[filter.key].join(delimiter)
                }
                else if(this[filter.key]){
                    return queryObject[filter.key] = this[filter.key]
                }
            })
            return queryObject
        },
        has(filter: string, value: string | number): boolean {
            return this[filter] ? this[filter].includes(value) : false
        },
        clear(filter: string) {
            const defaultFilter = filters.find(filterStruct => filterStruct.key === filter)
            if(defaultFilter){
                this[filter] = defaultFilter.multiple ? [] : null

                if(this.hasCallback){
                    this.get()
                }
            }
        },
        clearAll() {
            filters.forEach((filter: filterObject) => {
               this[filter.key] = filter.multiple ? [] : null
            })

            if(this.hasCallback){
                this.get()
            }
        },
    })

    return params
}
