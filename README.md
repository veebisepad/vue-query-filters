# Neatly coupled query arguments for Vue 3

This package allows you to build query arguments with ease. We are using [URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) to keep track of active query values.
When coupled with [Inertiajs](https://inertiajs.com/) & [Laravel](https://laravel.com/) it can be used to filter/sort data with ease.

## installation

```
npm i @veebisepad/vue-query-filters
```

## Basic usage

`useFilter()` accepts an array of filterObjects & options as arguments.

filterObjects are defined with a key (representing the query argument key) and a boolean condition if the filter can have multiple values E.g _"?numbers=1,2"_

`options` is an object with optional properties: `{delimiter: '', callbackFn: null}`

`delimiter` has a default value "," but can be replaced with any string value. Using "|" as a delimiter would yield "?numbers=1|2"

For the `callbackFn` you cold set the query you want to preform with the filters.

```js
const filters = useFilters(
    [
        { key: 'filter[issue_date_between]', multiple: true }, // ?filter[issue_date_between]=1970-01-01,1970-01-04
        { key: 'number', multiple: true }, // ?number=1,2
    ],
// optional options
    {
        delimiter: ',',
        callbackFn: filters => {
           // callback logic
        },
    },
)
```

## Input binding

We can use the filter keys to bind model values. Following the example above, we can use the filter keys like so:

Using `{ key: 'number', multiple: true }`
```js

  <input v-model="filters.number"></input>

```
Using `{ key: 'filter[issue_date_between]', multiple: true }`
```js

  <input v-model="filters['filter[issue_date_between]']"></input>
```

## retrieving query results

`filters.toQueryObject()` returns a key, value pair for each filter.

```js

 /* stored filter values with delimiter set as '|' 
  'filter[issue_date_between]': ['1970-01-01','1970-01-04'],
  number: [1,2]
*/

filters.toQueryObject() // => { 'filter[issue_date_between]': "1970-01-01|1970-01-04", number: "1|2" }

```


`filters.toSearchParams()` returns an instance of `URLSearchParams()`

```js

 /* stored filter values with delimiter set as '|' 
  'filter[issue_date_between]': ['1970-01-01','1970-01-04'],
  number: [1,2]
*/

filters.toSearchParams().toString() // => "filter[issue_date_between]=1970-01-01|1970-01-04&number=1|2"

```
## using the `callbackFn` to query results

in the background we bind the callback to `get()` method

**!!** `filters.get()` will throw an error if callback function is not set.

```js

 {
callbackFn: filters => {
// using inertia get request
        router.get('localhost', filters, {
            preserveState: true,
            preserveScroll: true,
        })
    },
}

// on input we will form the query and fetch the response using the callback function.
 <input v-model="filters.number" @input="filters.get()"></input>
```

## Clearing filter values

Use the `clear(filter)` method to clear a single filters value or `clearAll()` to clear all filter values.

Both `clear(filter)` & `clearAll()` will initiate the `get()` method if callback function is set.

Otherwise a manual re-fetch must be preformed to clear out the query parameters from the browsers url.

```js
 <button @click="filters.clear('number')">clear number</button>
```

```js
 <button @click="filters.clearAll()">clear all filters</button>
```



