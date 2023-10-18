import { reactive } from 'vue'

export type QueryObject = Record<string | symbol, string>

interface filterParams {
    toSeachParams(): URLSearchParams
    toQueryObject(): QueryObject
    has(filter: string, value: string | number): boolean
    clear(filter: string): void
    get(): void
    clearAll(): void
}

interface options {
    delimiter?: string
    callbackFn?(filters: QueryObject): void
}

interface filterObject {
    key: string,
    multiple: boolean
}


export type FilterStruct = filterObject
export type Options = options
export type FilterOptions = filterParams & FilterValueObject
export type FilterValueObject = Record<string | symbol, any>

export function useFilters(filters: FilterStruct[], options: Options = {}): FilterOptions {
    const queryParams = new URLSearchParams(document.location.search)
    const delimiter = options.delimiter ?? ','

    let filterKeys: FilterValueObject = {}

    filters.forEach((filter: FilterStruct) => {
        const value = queryParams.get(filter.key)
        if(value){
            filterKeys[filter.key] = filter.multiple ? value.split(delimiter) : value
        }
        else {
            filterKeys[filter.key] = filter.multiple ? [] : null
        }
    })
    const params = reactive({
        ...filterKeys,
        hasCallback: !!options.callbackFn,

        toSeachParams(): URLSearchParams {
            return new URLSearchParams(this.toQueryObject())
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
                  queryObject[filter.key] = this[filter.key].join(delimiter)
                }
                else if(this[filter.key]){
                   queryObject[filter.key] = this[filter.key]
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
