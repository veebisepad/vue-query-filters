# Vue Query Filters

`@veebisepad/vue-query-filters` is a reactive utility for managing URL query parameters. 

It works well with Spatie [laravel-query-builder
](https://spatie.be/docs/laravel-query-builder/v5/introduction) and [Inertia.js](https://inertiajs.com/) for filtering and sorting data in Laravel applications.

## Installation
```bash
npm install @veebisepad/vue-query-filters
```


## Features

- **Reactive Filters**: Synchronize filter state with URL query parameters.


- **Filter Types**:
  - `single`: A single value (e.g., text input, dropdown).
  - `multiple`: An array of values (e.g., multi-select).
  - `between`: A range of values (e.g., date ranges, price ranges).
- **Utility Methods**:
  - `get()`: Trigger the onGet function with the current filter values.
  - `toQueryObject()`: Convert filters into a query object for URL parameters or API requests.
  - `toSearchParams()`: Convert filters into a `URLSearchParams` object for easy URL manipulation.
  - `clear()`: Clear a specific filter.
  - `clearAll()`: Clear all filters at once.
  - `has()`: Check if a specific filter contains a given value.

## API

### `useFilters(filters, options)`

Initializes reactive filters with the specified filter types and options.

#### Parameters

- `filters`: An object where each key represents a filter name, and the value represents the filter type (`single`, `multiple`, or `between`).

```typescript
const filters = useFilters({
  name: 'single',        // Single value filter (e.g., text input)
  category: 'multiple',  // Multiple value filter (e.g., multi-select)
  price: 'between',      // Between filter for price range
});

```

- `options`: An object that includes:
  - `delimiter` (optional): The delimiter used for separating multiple values. Defaults to `,`.
  - `onGet` (optional): A function called by `get()`, receiving the current filter state as a query object.
 ```typescript
const filters = useFilters(
  {
    name: 'single',
    category: 'multiple',
    price: 'between',
    dateRange: 'between',
  },
  {
    onGet(queryObject) {
      axios
        .get('/api/products', { params: queryObject })
        .then(response => console.log(response.data))
        .catch(error => console.error(error));
    },
  }
);

```


#### Returns

A reactive object that contains the filter values and methods.

## Methods

#### `get()`

Triggers the `onGet` defined in the options, sending the current filter values to the desired destination (e.g., via an Inertia page visit or an API request).
```typescript
filters.get(); // Triggers the onGet function with the current filter values
```

#### `toQueryObject()`

Converts the current filter values into a query object for use in URL parameters or API requests.

**Example:**
```typescript
const queryObject = filters.toQueryObject();
console.log(queryObject); 
// Example output:
// { 
//   name: 'John',
//   category: 'electronics,furniture',
//   price: '100,500',
//   dateRange: '2023-01-01,2023-01-31'
// }
```
This is particularly useful when you want to manually handle the query object or pass it to an API call without triggering the get() method.

#### `toSearchParams()`
Converts the current filter values into a URLSearchParams object, which can be useful for updating the browser's URL or using the parameters in a request.

```typescript
const searchParams = filters.toSearchParams();
console.log(searchParams.toString()); // Output URL search parameters as a string
```
#### `has(filter: string, value: string | number)`
Checks whether a filter contains a specific value.

#### `clear(filter: string)`
Clears the value of a specific filter.

#### `clearAll()`
Clears all filters.

## Example Usage
### Filter Initialization with Inertia.js and Spatie QueryBuilder

Here’s how to initialize filters in a Vue.js component and handle query parameters using Inertia.js. You can then pass these filters to the backend, where Spatie QueryBuilder can be used to handle the filtered data. For backend integration, check the [Spatie QueryBuilder documentation](https://spatie.be/docs/laravel-query-builder/v5/introduction).

#### Frontend (Vue + Inertia.js)

```typescript
import { useFilters } from '@veebisepad/vue-query-filters';
import { router } from '@inertiajs/vue3';

const filters = useFilters(
  {
    'filter[name]': 'single',          // Single value filter (e.g., text input)
    'filter[category]': 'multiple',    // Multiple value filter (e.g., multi-select)
    'filter[date_between]': 'between', // Between filter for date ranges
  },
  {
    onGet(queryObject) {
      router.visit(route('products.index', queryObject), {
        preserveScroll: true,
        preserveState: true,
      });
    },
  }
);
```

## 2. Vue v-model Usage Example
Bind filter values to your Vue components using v-model. This allows users to interact with filters in the UI, and the query parameters will automatically update through Inertia.
```vue
<script setup lang="ts">
import { useFilters } from '@veebisepad/vue-query-filters';
import { router } from '@inertiajs/vue3';

const filters = useFilters(
  {
    'filter[name]': 'single',
    'filter[category]': 'multiple',
    'filter[date_between]': 'between',
  },
  {
    onGet(queryObject) {
      router.visit(route('products.index', queryObject), {
        preserveScroll: true,
        preserveState: true,
      });
    },
  }
);
</script>

<template>
  <div>
    <!-- Single Value Filter (Text Input) -->
    <label for="name">Name:</label>
    <input id="name" v-model="filters['filter[name]']" type="text" placeholder="Enter name" />

    <!-- Multiple Values Filter (Checkboxes) -->
    <label>Category:</label>
    <div>
      <label><input type="checkbox" value="electronics" v-model="filters['filter[category]']" /> Electronics</label>
      <label><input type="checkbox" value="furniture" v-model="filters['filter[category]']" /> Furniture</label>
      <label><input type="checkbox" value="apparel" v-model="filters['filter[category]']" /> Apparel</label>
    </div>

    <!-- Between Filter (Date Range) -->
    <label>Date Range:</label>
    <div>
      <input v-model="filters['filter[date_between]'].from" type="date" placeholder="From" />
      <input v-model="filters['filter[date_between]'].to" type="date" placeholder="To" />
    </div>

    <button @click="filters.get()">Apply Filters</button>
    <button @click="filters.clearAll()">Clear All Filters</button>
  </div>
</template>

```

---
With @veebisepad/vue-query-filters, you can manage filters reactively, sync them with URL parameters, and trigger updates via Inertia, while maintaining compatibility with Spatie QueryBuilder on the backend. This allows for a more interactive filtering experience in your Vue.js applications.
