# Vue Query Filters

A lightweight, flexible URL query parameter management system for Vue applications.

[![npm version](https://img.shields.io/npm/v/@veebisepad/vue-query-filters.svg)](https://www.npmjs.com/package/@veebisepad/vue-query-filters)
[![license](https://img.shields.io/npm/l/@veebisepad/vue-query-filters.svg)](https://github.com/veebisepad/vue-query-filters/blob/main/LICENSE)

Works seamlessly with Spatie [laravel-query-builder](https://spatie.be/docs/laravel-query-builder/v5/introduction) and [Inertia.js](https://inertiajs.com/) for filtering and sorting data in Laravel applications.

## Table of Contents

- [Installation](#installation)
- [Basic Usage](#basic-usage)
- [API Reference](#api-reference)
  - [Core Functions](#core-functions)
  - [Configuration Options](#configuration-options)
  - [Filter Types](#filter-types)
  - [Filter Object Methods](#filter-object-methods)
- [Examples](#examples)
  - [1. Basic Filter Setup and Usage](#1-basic-filter-setup-and-usage)
  - [2. Watching Filter Changes](#2-watching-filter-changes)
  - [3. Resetting Filters](#3-resetting-filters)
  - [4. Vue Component Example](#4-vue-component-example)
  - [5. Custom Filter Implementation](#5-custom-filter-implementation)
  - [6. Using with Laravel and Inertia.js](#6-using-with-laravel-and-inertiajs)
- [TypeScript Support](#typescript-support)
- [License](#license)

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
        onApply: queryParams => {
            console.log('Filters changed:', queryParams);
            // Fetch data or update URL
        },
    }
);
```

## API Reference

### Core Functions

| Function | Description | Parameters | Returns |
|----------|-------------|------------|---------|
| `createFilterFactory(options?)` | Creates a collection of filter factory functions | `options`: Configuration with optional `keyTransformer` function | Filter factory object |
| `useFilters(filters, options?)` | Creates a reactive filter object | `filters`: Map of filter configurations<br>`options`: Optional configuration | Reactive filter object |

### Configuration Options

#### `createFilterFactory` Options

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `keyTransformer` | Function | Transforms filter keys for URL parameters | `key => key` |

Example:
```js
// For Laravel Spatie Query Builder format
const f = createFilterFactory({
    keyTransformer: key => `filter[${key}]`
});
```

#### `useFilters` Options

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| `delimiter` | String | Character used to separate multiple values | `','` |
| `onApply` | Function | Callback function triggered when filters are applied via `get()` | 
| `preserveQueryOrder` | Boolean | Preserves URL query parameter order when generating query objects | `true` |
`undefined` |

Example:
```js
const filters = useFilters(
    { /* filter definitions */ }, 
    { 
        delimiter: ';',
        onApply: queryParams => {
            // Called when filters.get() is invoked
            console.log('Applied filters:', queryParams);
            // Update URL, fetch data, etc.
        }
    }
);
```

### Filter Types

| Filter | Description | Default Value | Example |
|--------|-------------|---------------|---------|
| `single()` | Single value filter | `null` | `f.single('default')` |
| `multiple()` | Array-based filter | `[]` | `f.multiple(['default'])` |
| `range()` | Filter with from/to values | `{from: null, to: null}` | `f.range({from: 10, to: 50})` |
| `custom()` | User-defined filter behavior | Based on implementation | See Custom Filter example |

### Filter Object Methods

| Method | Description | Parameters | Returns |
|--------|-------------|------------|---------|
| `get()` | Triggers the onApply callback | None | void |
| `toSearchParams()` | Converts filters to URLSearchParams | None | URLSearchParams object |
| `toQueryObject(transformKeys?)` | Creates object with filter key-values | `transformKeys`: Boolean (default: true) | Object with filter parameters |
| `toOrderedQueryObject(transformKeys?)` | Creates object with filter key-values, preserving URL parameter order | `transformKeys`: Boolean (default: true) | Object with ordered filter parameters |
| `data()` | Returns plain object of filter values | None | Filter values object |
| `has(filter, value)` | Checks if value exists in filter | `filter`: Filter key<br>`value`: Value to check | Boolean |
| `clear(filterKey, shouldGet?)` | Resets filter(s) to default | `filterKey`: String/Array of keys<br>`shouldGet`: Boolean to trigger onApply | Void |
| `clearAll()` | Resets all filters | None | Void |
| `setOptions(newOptions)` | Updates filter options | `newOptions`: New options object | Void |

#### Filter Object Properties

| Property | Description | Type |
|----------|-------------|------|
| `processing` | Indicates whether an async onApply callback is currently executing | `boolean` (read-only) |

## Examples

### 1. Basic Filter Setup and Usage

```js
const f = createFilterFactory();
const filters = useFilters({
    search: f.single(''),
    category: f.single(null),
    brands: f.multiple([])
});

// Set filter values
filters.search = 'laptop';
filters.category = 'electronics';
filters.brands = ['apple', 'samsung'];

// Check if filter has value
console.log(filters.has('brands', 'apple')); // true

// Get all filter values as query parameters
const queryParams = filters.get();
```

### 2. Watching Filter Changes

```js
import { watch } from 'vue';
import { useDebounceFn } from '@vueuse/core';

// Option 1: Simple watcher
watch(
    filters,
    () => filters.get(), // Trigger onApply callback
    { deep: true }
);

// Option 2: Debounced watcher
const debouncedApplyFilters = useDebounceFn(() => {
    filters.get();
}, 300);

watch(filters, () => debouncedApplyFilters(), { deep: true });
```

### 3. Resetting Filters

```js
// Reset a single filter
filters.clear('category');

// Reset multiple filters
filters.clear(['brands', 'price']);

// Reset all filters
filters.clearAll();
```

### 4. Vue Component Example

```vue
<script setup>
import { useFilters, createFilterFactory } from '@veebisepad/vue-query-filters';

const f = createFilterFactory();
const filters = useFilters({
    search: f.single(''),
    categories: f.multiple([]),
    priceRange: f.range({ from: null, to: null })
});

function applyFilters() {
    filters.get();
}
</script>

<template>
    <div>
        <h2>Product Filters</h2>
        
        <!-- Single filter -->
        <input v-model="filters.search" type="text" placeholder="Search products..." />
        
        <!-- Multiple filter -->
        <div>
            <label><input type="checkbox" value="electronics" v-model="filters.categories" /> Electronics</label>
            <label><input type="checkbox" value="clothing" v-model="filters.categories" /> Clothing</label>
        </div>
        
        <!-- Range filter -->
        <div>
            <input v-model.number="filters.priceRange.from" type="number" placeholder="Min" />
            <input v-model.number="filters.priceRange.to" type="number" placeholder="Max" />
        </div>
        
        <button @click="applyFilters">Apply Filters</button>
        <button @click="filters.clearAll()">Reset All</button>
    </div>
</template>
```

### 5. Custom Filter Implementation

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
        // 'matches' a given candidate
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

### 6. Using with Laravel and Inertia.js

```js
import { useFilters, createFilterFactory } from '@veebisepad/vue-query-filters';
import { router } from '@inertiajs/vue3';
import { watch } from 'vue';

// Create filter factory with key transformer for Laravel Query Builder
const f = createFilterFactory({
    keyTransformer: key => `filter[${key}]`
});

const filters = useFilters(
    {
        name: f.single(),
        category: f.multiple(),
        price: f.range(),
        sort: f.single('-created_at')
    },
    {
        onApply: queryParams => {
            // Navigate with Inertia preserving state
            router.visit(route('products.index', queryParams), {
                preserveState: true,
                preserveScroll: true,
                only: ['products']
            });
        }
    }
);

// Auto-apply filters when they change
watch(filters, () => filters.get(), { deep: true });
```

### 7. Async Filters with Processing State

The `processing` property automatically tracks async operations, perfect for showing loading states:

```vue
<script setup>
import { useFilters, createFilterFactory } from '@veebisepad/vue-query-filters';

const f = createFilterFactory();

const filters = useFilters(
    {
        search: f.single(''),
        category: f.multiple(),
    },
    {
        onApply: async (queryParams) => {
            // Async callback - processing will be automatically tracked
            const searchParams = new URLSearchParams(queryParams);
            const response = await fetch(`/api/products?${searchParams}`);
            const data = await response.json();
            // handle response...
        },
    }
);

function applyFilters() {
    filters.get(); // Sets filters.processing = true until the async operation completes
}
</script>

<template>
    <div>
        <input v-model="filters.search" type="text" placeholder="Search..." />
        
        <!-- Show loading indicator -->
        <div v-if="filters.processing" class="loading">
            Loading results...
        </div>
        
        <!-- Disable button while processing -->
        <button 
            @click="applyFilters" 
            :disabled="filters.processing"
        >
            {{ filters.processing ? 'Loading...' : 'Apply Filters' }}
        </button>
    </div>
</template>
```

The `processing` property works with both async and sync callbacks:
- **Async callback** (returns a Promise): `processing` is `true` until the promise resolves or rejects
- **Sync callback** (no return or non-Promise return): `processing` is set to `true` and immediately back to `false`. Since the operation completes synchronously in the same tick, this state change happens too quickly to be observed in the UI.


## TypeScript Support

```typescript
import { useFilters, createFilterFactory } from '@veebisepad/vue-query-filters';
import type { SingleFilter, MultipleFilter, RangeFilter } from '@veebisepad/vue-query-filters';

const f = createFilterFactory();

const filters = useFilters({
    category: f.single<string>('all'),
    brands: f.multiple<string>([]),
    price: f.range<number>({ from: null, to: null }),
});
```

## License

MIT
