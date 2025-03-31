# Vue Query Filters

A lightweight, flexible URL query parameter management system for Vue applications.

[![npm version](https://img.shields.io/npm/v/@veebisepad/vue-query-filters.svg)](https://www.npmjs.com/package/@veebisepad/vue-query-filters)
[![license](https://img.shields.io/npm/l/@veebisepad/vue-query-filters.svg)](https://github.com/veebisepad/vue-query-filters/blob/main/LICENSE)

It works well with Spatie [laravel-query-builder
](https://spatie.be/docs/laravel-query-builder/v5/introduction) and [Inertia.js](https://inertiajs.com/) for filtering and sorting data in Laravel applications.

## Installation

```bash
npm install @veebisepad/vue-query-filters
```

## Basic Usage

```js
import { useFilters, createFilterFactory } from '@veebisepad/vue-query-filters';
import { watch } from 'vue';

// Create filter factory
const f = createFilterFactory();

// Define your filters
const filters = useFilters(
    {
        category: f.single(),
        brands: f.multiple(),
        price: f.range(),
    },
    {
        // Optional configuration
        delimiter: ',',
        onApply: queryParams => {
            // Fetch data or update URL
            console.log('Filters changed:', queryParams);
        },
    }
);

// Automatically sync with URL parameters on initialization

console.log(filters.category);
console.log(filters.brands);
console.log(filters.price);

watch(
    filters,
    () => {
        filters.get(); // Trigger the onApply callback
    },
    { deep: true }
);

// ----------------------------------------------------------
// Vue Query Filters does not automatically watch parameters because it aims to provide maximum flexibility and control to developers.

// Example: Using VueUse debounce to watch filters
import { useDebounceFn } from '@vueuse/core';
import { watch } from 'vue';

const debouncedApplyFilters = useDebounceFn(() => {
    filters.get(); // Trigger the onApply callback
}, 300); // Debounce for 300ms

watch(
    filters,
    () => {
        debouncedApplyFilters();
    },
    { deep: true }
);

// Reset filters
filters.clear('category'); // Reset a single filter
filters.clear(['brands', 'price']); // Reset multiple filters
filters.clearAll(); // Reset all filters
```

## Filter Types

### Single Filter

For simple single-value filters:

```js
// String value
const filters = {
    category: filters.single(),
    status: filters.single(),
};

// Numeric value
const filters = {
    page: filters.single(1),
};

// Usage
filters.category = 'electronics';
console.log(filters.has('category', 'electronics')); // true
```

### Multiple Filter

For array-based filters:

```js
const filters = {
    brands: f.multiple(),
    colors: f.multiple(),
};

// Usage
filters.brands = ['apple', 'samsung'];
console.log(filters.has('brands', 'apple')); // true
```

### Range Filter

For filters with from/to values:

```js
const filters = {
    price: filters.range(),
    dateRange: filters.range(),
};

// Usage
filters.price = { from: 100, to: 500 };
console.log(filters.has('price', 100)); // true (matches 'from' value)
```

### Custom Filter

```js
import { createFilterFactory, useFilters } from '@veebisepad/vue-query-filters';

// 1) Create a filter factory
const factory = createFilterFactory();

// 2) Define a custom filter
const myCustomFilter = factory.custom({
    defaultValue: 123,
    parseQueryParam(value, delimiter) {
        // Expected to parse 'enabled,value' from the incoming query string
        // and return the parsed filter value
    },
    serializeQueryParam(currentValue, delimiter) {
        // Expected to generate a string for the URL query parameter
        // or return null if the filter is inactive
    },
    hasValue(filterValue, candidate) {
        // Expected to determine if the current filter value
        // ‘matches’ a given candidate
    },
});

// 3) Implement the custom filter in useFilters
const filters = useFilters(
    {
        specialSetting: myCustomFilter,
    },
    {
        onApply(queryParams) {
            // Triggered when filters.get() is called
            console.log('Custom filter changed:', queryParams);
        },
    }
);

// 4) Use the custom filter
filters.specialSetting = 234;
filters.get(); // calls onApply with updated query params
```

### `createFilterFactory(options)`

Creates a collection of filter factory functions.

#### Parameters:

-   `options`: (Optional) Configuration options
    -   `keyTransformer`: Function to transform filter keys for URL parameters (e.g., for Laravel's query builder)

#### Example:

```js
// For Laravel Spatie Query Builder format
const spatieFactory = createFilterFactory({
    keyTransformer: key => `filter[${key}]`,
});

// Now all keys will be transformed automatically
const filters = useFilters({
    name: spatieFactory.single(), // Will become filter[name] in URL
    category: spatieFactory.multiple(), // Will become filter[category] in URL
});
```

## Integration Examples

### Using with Vue Components

Here's how to use the filters with Vue components:

```vue
<script setup>
import { useFilters, createFilterFactory } from '@veebisepad/vue-query-filters';

const f = createFilterFactory();

const filters = useFilters(
    {
        search: f.single(''),
        categories: f.multiple([]),
        priceRange: f.range({ from: null, to: null }),
    },
    {
        onApply: queryParams => {
            // Fetch data or update URL with the new filters
            fetchProducts(queryParams);
        },
    }
);

function fetchProducts(params) {
    // Example API call using the filter parameters
    console.log('Fetching products with params:', params);
}

function applyFilters() {
    filters.get();
}

function resetFilters() {
    filters.clearAll();
}
</script>

<template>
    <div>
        <h2>Product Filters</h2>

        <!-- Single filter example -->
        <div>
            <label>Search:</label>
            <input
                v-model="filters.search"
                type="text"
                placeholder="Search products..." />
        </div>

        <!-- Multiple filter example -->
        <div>
            <label>Categories:</label>
            <div>
                <label
                    ><input
                        type="checkbox"
                        value="electronics"
                        v-model="filters.categories" />
                    Electronics</label
                >
                <label
                    ><input
                        type="checkbox"
                        value="clothing"
                        v-model="filters.categories" />
                    Clothing</label
                >
                <label
                    ><input
                        type="checkbox"
                        value="books"
                        v-model="filters.categories" />
                    Books</label
                >
            </div>
        </div>

        <!-- Range filter example -->
        <div>
            <label>Price Range:</label>
            <div>
                <input
                    v-model.number="filters.priceRange.from"
                    type="number"
                    placeholder="Min" />
                <input
                    v-model.number="filters.priceRange.to"
                    type="number"
                    placeholder="Max" />
            </div>
        </div>

        <div>
            <button @click="filters.get()">Apply Filters</button>
            <button @click="filters.clearAll()">Reset Filters</button>
        </div>
    </div>
</template>
```

### Using with Inertia.js

When using Inertia.js for your Laravel + Vue applications:

```js
import { useFilters, createFilterFactory } from '@veebisepad/vue-query-filters';
import { router } from '@inertiajs/vue3';

const f = createFilterFactory();

const filters = useFilters(
    {
        search: f.single(),
        category: f.multiple(),
        price: f.range(),
    },
    {
        onApply: queryParams => {
            // Use Inertia to visit the current page with new query parameters
            router.visit(route('products.index', queryParams), {
                preserveState: true,
                preserveScroll: true,
                only: ['products'],
            });
        },
    }
);

// You can watch for filter changes if you want to automatically apply them
// This is optional - you can also use the get() method manually
import { watch } from 'vue';

watch(
    filters,
    () => {
        filters.get();
    },
    { deep: true }
);
```

### Using with Laravel and Spatie Query Builder

For seamless integration with Laravel's Spatie Query Builder:

```js
import { useFilters, createFilterFactory } from '@veebisepad/vue-query-filters';
import { router } from '@inertiajs/vue3';

const f = createFilterFactory();

// Format filter names to match Spatie Query Builder's expected format
const filters = useFilters(
    {
        'filter[name]': f.single(),
        'filter[category]': f.multiple(),
        'filter[price]': f.range(),
    },
    {
        onApply: queryParams => {
            router.visit(route('products.index', queryParams), {
                preserveState: true,
                preserveScroll: true,
            });
        },
    }
);
```

## API Reference

### `useFilters(filters, options)`

Creates a reactive filter object from filter configurations.

#### Parameters:

-   `filters`: Map of filter keys to their configurations
-   `options`: (Optional) Configuration options
    -   `delimiter`: Character used to separate multiple values (`','` by default)
    -   `onApply`: Callback function triggered when filters are applied

#### Returns:

A reactive object with filter values and methods:

-   `toSearchParams()`: Converts filters to URLSearchParams object
-   `get()`: Triggers the onApply callback with current filter values
-   `toQueryObject(transformKeys)`: Creates an object with filter keys and their string representations
    -   `transformKeys`: (Optional boolean, default: true) When true, keys are transformed using the transformKey function
-   `data()`: Returns a plain object with just the filter values, without methods
-   `has(filter, value)`: Checks if a value exists in the specified filter
-   `clear(filterKey, shouldGet)`: Resets one or more filters to default values
-   `clearAll()`: Resets all filters to their default values
-   `setOptions(newOptions)`: Updates filter options

### `createFilterFactory()`

Creates a collection of filter factory functions.

#### Returns:

Object containing filter factory methods:

-   `single(defaultValue)`: Creates a filter for a single value
-   `multiple(defaultValue)`: Creates a filter for multiple values
-   `range(defaultValue)`: Creates a range filter
-   `custom(filter)`: Allows creating a custom filter

## TypeScript Support

This package is built with TypeScript and provides full type safety using the built-in interfaces:

```typescript
import { useFilters, createFilterFactory } from '@veebisepad/vue-query-filters';
import type { Filters, SingleFilter, MultipleFilter, RangeFilter, QueryFilters } from '@veebisepad/vue-query-filters';

const f = createFilterFactory();

// Use the built-in interfaces with your filter configuration
const filters = useFilters({
    category: f.single<string>('all'),
    brands: f.multiple<string>([]),
    price: f.range<number>({ from: null, to: null }),
});

// TypeScript will enforce the correct types
filters.category = 'electronics'; // ✅ Type-safe
filters.brands = ['apple', 'samsung']; // ✅ Type-safe
filters.brands = [1, 2, 3]; // ❌ Type error (numbers instead of strings)
filters.price = { from: 100, to: 500 }; // ✅ Type-safe
```

## License

MIT
