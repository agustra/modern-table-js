# 🔄 API Parameter Transformation Guide - ModernTable.js

Panduan untuk mengintegrasikan ModernTable.js dengan API yang menggunakan format parameter berbeda dari DataTables standard.

## 🎯 Problem Statement

**ModernTable.js** menggunakan format parameter DataTables:
```javascript
// Format yang dikirim ModernTable.js
{
  draw: 1,
  start: 0,      // offset
  length: 10,    // limit per page
  search: { value: "", regex: false },
  columns: [...],
  order: [...]
}
```

**API External** sering menggunakan format berbeda:
```javascript
// Contoh: DummyJSON API
{
  limit: 10,     // items per page
  skip: 0,       // offset
  q: ""          // search query
}

// Contoh: Laravel API
{
  per_page: 10,  // items per page
  page: 1,       // current page
  search: ""     // search term
}

// Contoh: REST API Standard
{
  size: 10,      // page size
  offset: 0,     // data offset
  filter: ""     // filter term
}
```

## ✅ Solusi: beforeRequest + dataSrc Pattern

### 🔧 Core Implementation

```javascript
const table = new ModernTable("#table", {
  api: {
    url: "https://dummyjson.com/users",
    method: "GET",
    
    // 1. Transform outgoing parameters
    beforeRequest: async (config) => {
      const params = config.data || {};
      const query = new URLSearchParams();
      
      // Map DataTables format → DummyJSON format
      query.append("limit", params.length || 10);
      query.append("skip", params.start || 0);
      query.append("q", params.search?.value || "");
      
      config.url = `https://dummyjson.com/users?${query.toString()}`;
      return config;
    },
    
    // 2. Transform incoming response
    dataSrc: function(json) {
      return {
        draw: json.draw || 1,
        recordsTotal: json.total,
        recordsFiltered: json.total,
        data: json.users
      };
    }
  },
  columns: [
    { data: "id", title: "ID", width: "60px" },
    { data: "firstName", title: "First Name" },
    { data: "lastName", title: "Last Name" },
    { data: "email", title: "Email" },
    { data: "phone", title: "Phone" }
  ],
  serverSide: true,
  pageLength: 10,
  paging: true,
  searching: true,
  ordering: true,
  responsive: true
});
```

## 🌐 Real-World Examples

### Example 1: DummyJSON API

```javascript
// API: https://dummyjson.com/users?limit=10&skip=0&q=search
api: {
  url: "https://dummyjson.com/users",
  beforeRequest: async (config) => {
    const params = config.data || {};
    const query = new URLSearchParams({
      limit: params.length || 10,
      skip: params.start || 0,
      q: params.search?.value || ""
    });
    config.url = `https://dummyjson.com/users?${query}`;
    return config;
  },
  dataSrc: function(json) {
    return {
      recordsTotal: json.total,
      recordsFiltered: json.total,
      data: json.users
    };
  }
}
```

### Example 2: Laravel Pagination API

```javascript
// API: /api/users?per_page=10&page=1&search=term
api: {
  url: "/api/users",
  beforeRequest: async (config) => {
    const params = config.data || {};
    const query = new URLSearchParams({
      per_page: params.length || 10,
      page: Math.floor((params.start || 0) / (params.length || 10)) + 1,
      search: params.search?.value || ""
    });
    config.url = `/api/users?${query}`;
    return config;
  },
  dataSrc: function(json) {
    return {
      recordsTotal: json.meta.total,
      recordsFiltered: json.meta.total,
      data: json.data
    };
  }
}
```

### Example 3: GraphQL API

```javascript
// GraphQL dengan variables
api: {
  url: "/graphql",
  method: "POST",
  beforeRequest: async (config) => {
    const params = config.data || {};
    
    config.headers['Content-Type'] = 'application/json';
    config.data = {
      query: `
        query GetUsers($limit: Int, $offset: Int, $search: String) {
          users(limit: $limit, offset: $offset, search: $search) {
            total
            data { id name email }
          }
        }
      `,
      variables: {
        limit: params.length || 10,
        offset: params.start || 0,
        search: params.search?.value || ""
      }
    };
    return config;
  },
  dataSrc: function(json) {
    const result = json.data.users;
    return {
      recordsTotal: result.total,
      recordsFiltered: result.total,
      data: result.data
    };
  }
}
```

## 📊 Parameter Mapping Patterns

### Common API Formats

| ModernTable | DummyJSON | Laravel | REST Standard | GraphQL |
|-------------|-----------|---------|---------------|---------|
| `start` | `skip` | `page` calculation | `offset` | `offset` |
| `length` | `limit` | `per_page` | `size` | `limit` |
| `search.value` | `q` | `search` | `filter` | `search` |
| `order[0].column` | `sortBy` | `sort_by` | `sort` | `orderBy` |
| `order[0].dir` | `order` | `sort_dir` | `direction` | `direction` |

### Advanced Parameter Transformation

```javascript
beforeRequest: async (config) => {
  const params = config.data || {};
  const query = new URLSearchParams();
  
  // Basic pagination
  query.append("limit", params.length || 10);
  query.append("skip", params.start || 0);
  
  // Global search
  if (params.search?.value) {
    query.append("q", params.search.value);
  }
  
  // Column-specific search
  params.columns?.forEach((col, index) => {
    if (col.search?.value) {
      query.append(`filter[${col.data}]`, col.search.value);
    }
  });
  
  // Sorting
  if (params.order?.length > 0) {
    const order = params.order[0];
    const column = params.columns[order.column];
    query.append("sortBy", column.data);
    query.append("order", order.dir);
  }
  
  config.url = `${config.url}?${query.toString()}`;
  return config;
}
```

## 🔄 Response Transformation Patterns

### Standard DataTables Response Format

```javascript
{
  "draw": 1,                    // Request counter
  "recordsTotal": 1000,         // Total records in database
  "recordsFiltered": 100,       // Total records after filtering
  "data": [...]                 // Array of records for current page
}
```

### Common API Response Transformations

```javascript
// DummyJSON format
dataSrc: function(json) {
  return {
    recordsTotal: json.total,
    recordsFiltered: json.total,
    data: json.users
  };
}

// Laravel pagination format
dataSrc: function(json) {
  return {
    recordsTotal: json.meta.total,
    recordsFiltered: json.meta.total,
    data: json.data
  };
}

// Custom API with nested data
dataSrc: function(json) {
  return {
    recordsTotal: json.pagination.totalItems,
    recordsFiltered: json.pagination.filteredItems,
    data: json.result.items
  };
}

// API with separate count endpoint
dataSrc: async function(json) {
  // Fetch total count separately if needed
  const countResponse = await fetch('/api/users/count');
  const countData = await countResponse.json();
  
  return {
    recordsTotal: countData.total,
    recordsFiltered: json.filtered_count || countData.total,
    data: json.items
  };
}
```

## 🛠️ Advanced Use Cases

### 1. Authentication Headers

```javascript
beforeRequest: async (config) => {
  // Add auth headers
  config.headers.Authorization = `Bearer ${getAuthToken()}`;
  
  // Transform parameters
  const params = config.data || {};
  // ... parameter transformation
  
  return config;
}
```

### 2. Error Handling

```javascript
beforeRequest: async (config) => {
  try {
    // Parameter transformation
    return config;
  } catch (error) {
    console.error("Parameter transformation failed:", error);
    throw new Error("Invalid request parameters");
  }
},

dataSrc: function(json) {
  if (json.error) {
    throw new Error(json.error.message);
  }
  
  if (!json.data) {
    console.warn("No data in response, using empty array");
    return {
      recordsTotal: 0,
      recordsFiltered: 0,
      data: []
    };
  }
  
  return {
    recordsTotal: json.total,
    recordsFiltered: json.filtered,
    data: json.data
  };
}
```

### 3. Data Preprocessing

```javascript
dataSrc: function(json) {
  // Preprocess data before rendering
  const processedData = json.users.map(user => ({
    ...user,
    fullName: `${user.firstName} ${user.lastName}`,
    avatar: user.image || '/default-avatar.png',
    status: user.age >= 18 ? 'Adult' : 'Minor'
  }));
  
  return {
    recordsTotal: json.total,
    recordsFiltered: json.total,
    data: processedData
  };
}
```

## 🔍 Debugging & Testing

### Debug Configuration

```javascript
api: {
  url: "https://api.example.com/users",
  beforeRequest: async (config) => {
    console.group("🔄 Parameter Transformation");
    console.log("📤 Original params:", config.data);
    
    // Transform parameters
    const params = config.data || {};
    const query = new URLSearchParams({
      limit: params.length || 10,
      skip: params.start || 0
    });
    
    config.url = `https://api.example.com/users?${query}`;
    console.log("🌐 Final URL:", config.url);
    console.groupEnd();
    
    return config;
  },
  dataSrc: function(json) {
    console.group("📥 Response Transformation");
    console.log("📊 Raw response:", json);
    
    const result = {
      recordsTotal: json.total,
      recordsFiltered: json.total,
      data: json.users
    };
    
    console.log("✅ Transformed result:", result);
    console.groupEnd();
    
    return result;
  }
}
```

### Testing dengan DummyJSON

Test URL langsung di browser:
- Page 1: https://dummyjson.com/users?limit=10&skip=0
- Page 2: https://dummyjson.com/users?limit=10&skip=10
- Search: https://dummyjson.com/users?limit=10&skip=0&q=john

### Testing Checklist

- [ ] ✅ Page 1 loads correctly (users 1-10)
- [ ] ✅ Page 2 shows users 11-20
- [ ] ✅ Search functionality works
- [ ] ✅ Pagination shows 21 pages (208 total users)
- [ ] ✅ Page size change works
- [ ] ✅ Loading states display
- [ ] ✅ Info text shows correct counts

## 🎯 Best Practices

1. **Validate Input**: Always check `config.data` exists
2. **Handle Errors**: Use try-catch in transformations
3. **Log Requests**: Add debugging for development
4. **Test Edge Cases**: Empty data, network errors, invalid responses
5. **Performance**: Avoid heavy processing in transformations
6. **Security**: Sanitize search parameters
7. **Consistency**: Use consistent parameter naming
8. **Documentation**: Document your API parameter mapping

## 📚 Quick Reference

### Minimal Implementation (DummyJSON)
```javascript
api: {
  url: "https://dummyjson.com/users",
  beforeRequest: async (config) => {
    const params = config.data || {};
    const query = new URLSearchParams({
      limit: params.length || 10,
      skip: params.start || 0
    });
    config.url = `https://dummyjson.com/users?${query}`;
    return config;
  },
  dataSrc: (json) => ({
    recordsTotal: json.total,
    recordsFiltered: json.total,
    data: json.users
  })
}
```

### Full-Featured Implementation (DummyJSON)
```javascript
api: {
  url: "https://dummyjson.com/users",
  method: "GET",
  beforeRequest: async (config) => {
    const params = config.data || {};
    const query = new URLSearchParams();
    
    // Pagination
    query.append("limit", params.length || 10);
    query.append("skip", params.start || 0);
    
    // Search
    if (params.search?.value) {
      query.append("q", params.search.value);
    }
    
    // Sorting (DummyJSON supports sortBy and order)
    if (params.order?.length > 0) {
      const order = params.order[0];
      const column = params.columns[order.column];
      query.append("sortBy", column.data);
      query.append("order", order.dir);
    }
    
    config.url = `https://dummyjson.com/users?${query}`;
    return config;
  },
  dataSrc: function(json) {
    return {
      draw: json.draw || 1,
      recordsTotal: json.total,
      recordsFiltered: json.total,
      data: json.users
    };
  }
}
```

---

**💡 Pro Tip**: Approach ini universal dan bisa digunakan untuk mengintegrasikan ModernTable.js dengan API format apapun. Cukup sesuaikan parameter mapping di `beforeRequest` dan response mapping di `dataSrc`.