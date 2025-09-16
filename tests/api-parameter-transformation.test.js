/**
 * @jest-environment jsdom
 * 
 * Tests for API Parameter Transformation Guide
 * Matches: API-PARAMETER-TRANSFORMATION-GUIDE.md
 */

describe('API Parameter Transformation', () => {
  
  beforeEach(() => {
    document.body.innerHTML = '<table id="test-table"></table>';
    global.fetch = jest.fn();
  });

  describe('Parameter Transformation', () => {
    test('should transform DataTables params to DummyJSON format', () => {
      const transformParams = (params) => ({
        limit: params.length || 10,
        skip: params.start || 0,
        q: params.search?.value || ''
      });

      const input = { start: 10, length: 20, search: { value: 'john' } };
      const result = transformParams(input);

      expect(result).toEqual({ limit: 20, skip: 10, q: 'john' });
    });

    test('should build correct URL with parameters', () => {
      const buildUrl = (baseUrl, params) => {
        const query = new URLSearchParams({
          limit: params.length || 10,
          skip: params.start || 0,
          q: params.search?.value || ''
        });
        return `${baseUrl}?${query.toString()}`;
      };

      const params = { start: 20, length: 10, search: { value: 'test' } };
      const url = buildUrl('https://dummyjson.com/users', params);

      expect(url).toBe('https://dummyjson.com/users?limit=10&skip=20&q=test');
    });
  });

  describe('Response Transformation', () => {
    test('should transform DummyJSON response to DataTables format', () => {
      const transformResponse = (json) => ({
        recordsTotal: json.total,
        recordsFiltered: json.total,
        data: json.users
      });

      const input = {
        users: [{ id: 1, firstName: 'John' }],
        total: 208,
        skip: 0,
        limit: 10
      };

      const result = transformResponse(input);
      expect(result).toEqual({
        recordsTotal: 208,
        recordsFiltered: 208,
        data: input.users
      });
    });
  });

  describe('Laravel API Format', () => {
    test('should transform DataTables params to Laravel format', () => {
      const transformLaravelParams = (params) => ({
        per_page: params.length || 10,
        page: Math.floor((params.start || 0) / (params.length || 10)) + 1,
        search: params.search?.value || ''
      });

      const input = { start: 20, length: 10, search: { value: 'test' } };
      const result = transformLaravelParams(input);

      expect(result).toEqual({ per_page: 10, page: 3, search: 'test' });
    });

    test('should transform Laravel response to DataTables format', () => {
      const transformLaravelResponse = (json) => ({
        recordsTotal: json.meta.total,
        recordsFiltered: json.meta.total,
        data: json.data
      });

      const input = {
        data: [{ id: 1, name: 'John' }],
        meta: { total: 100, per_page: 10, current_page: 1 }
      };

      const result = transformLaravelResponse(input);
      expect(result).toEqual({
        recordsTotal: 100,
        recordsFiltered: 100,
        data: input.data
      });
    });
  });

  describe('Advanced Parameter Transformation', () => {
    test('should handle column-specific search', () => {
      const buildAdvancedUrl = (baseUrl, params) => {
        const query = new URLSearchParams();
        query.append('limit', params.length || 10);
        query.append('skip', params.start || 0);
        
        // Column-specific search
        params.columns?.forEach((col) => {
          if (col.search?.value) {
            query.append(`filter[${col.data}]`, col.search.value);
          }
        });
        
        return `${baseUrl}?${query.toString()}`;
      };

      const params = {
        start: 0,
        length: 10,
        columns: [
          { data: 'name', search: { value: 'john' } },
          { data: 'email', search: { value: 'gmail' } }
        ]
      };

      const url = buildAdvancedUrl('https://api.example.com/users', params);
      expect(url).toBe('https://api.example.com/users?limit=10&skip=0&filter%5Bname%5D=john&filter%5Bemail%5D=gmail');
    });

    test('should handle sorting parameters', () => {
      const buildSortingUrl = (baseUrl, params) => {
        const query = new URLSearchParams();
        query.append('limit', params.length || 10);
        query.append('skip', params.start || 0);
        
        // Sorting
        if (params.order?.length > 0) {
          const order = params.order[0];
          const column = params.columns[order.column];
          query.append('sortBy', column.data);
          query.append('order', order.dir);
        }
        
        return `${baseUrl}?${query.toString()}`;
      };

      const params = {
        start: 0,
        length: 10,
        columns: [{ data: 'name' }, { data: 'email' }],
        order: [{ column: 1, dir: 'desc' }]
      };

      const url = buildSortingUrl('https://dummyjson.com/users', params);
      expect(url).toBe('https://dummyjson.com/users?limit=10&skip=0&sortBy=email&order=desc');
    });
  });

  describe('Error Handling', () => {
    test('should handle parameter transformation errors', () => {
      const safeTransform = (params) => {
        try {
          return {
            limit: params.length || 10,
            skip: params.start || 0
          };
        } catch (error) {
          throw new Error('Invalid request parameters');
        }
      };

      expect(() => safeTransform(null)).toThrow('Invalid request parameters');
      expect(safeTransform({})).toEqual({ limit: 10, skip: 0 });
    });

    test('should handle invalid response format', () => {
      const safeResponseTransform = (json) => {
        if (!json || !json.users) {
          return {
            recordsTotal: 0,
            recordsFiltered: 0,
            data: []
          };
        }
        
        return {
          recordsTotal: json.total,
          recordsFiltered: json.total,
          data: json.users
        };
      };

      expect(safeResponseTransform(null)).toEqual({
        recordsTotal: 0,
        recordsFiltered: 0,
        data: []
      });

      expect(safeResponseTransform({ users: [{ id: 1 }], total: 1 })).toEqual({
        recordsTotal: 1,
        recordsFiltered: 1,
        data: [{ id: 1 }]
      });
    });
  });

  describe('Data Preprocessing', () => {
    test('should preprocess user data', () => {
      const preprocessData = (users) => {
        return users.map(user => ({
          ...user,
          fullName: `${user.firstName} ${user.lastName}`,
          avatar: user.image || '/default-avatar.png',
          status: user.age >= 18 ? 'Adult' : 'Minor'
        }));
      };

      const input = [
        { id: 1, firstName: 'John', lastName: 'Doe', age: 25, image: null },
        { id: 2, firstName: 'Jane', lastName: 'Smith', age: 16, image: 'avatar.jpg' }
      ];

      const result = preprocessData(input);
      
      expect(result[0]).toEqual({
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        age: 25,
        image: null,
        fullName: 'John Doe',
        avatar: '/default-avatar.png',
        status: 'Adult'
      });

      expect(result[1]).toEqual({
        id: 2,
        firstName: 'Jane',
        lastName: 'Smith',
        age: 16,
        image: 'avatar.jpg',
        fullName: 'Jane Smith',
        avatar: 'avatar.jpg',
        status: 'Minor'
      });
    });
  });

  describe('Search Functionality', () => {
    test('should use different endpoints for search vs pagination', () => {
      const buildDualEndpointUrl = (baseUrl, params) => {
        if (params.search?.value) {
          // Search endpoint
          const query = new URLSearchParams({
            q: params.search.value,
            limit: params.length || 10,
            skip: params.start || 0
          });
          return `${baseUrl}/search?${query}`;
        } else {
          // Regular pagination endpoint
          const query = new URLSearchParams({
            limit: params.length || 10,
            skip: params.start || 0
          });
          return `${baseUrl}?${query}`;
        }
      };

      // Test regular pagination
      const paginationParams = { start: 10, length: 10 };
      const paginationUrl = buildDualEndpointUrl('https://dummyjson.com/users', paginationParams);
      expect(paginationUrl).toBe('https://dummyjson.com/users?limit=10&skip=10');

      // Test search
      const searchParams = { start: 0, length: 10, search: { value: 'james' } };
      const searchUrl = buildDualEndpointUrl('https://dummyjson.com/users', searchParams);
      expect(searchUrl).toBe('https://dummyjson.com/users/search?q=james&limit=10&skip=0');
    });

    test('should handle search with pagination', () => {
      const buildSearchUrl = (baseUrl, params) => {
        const query = new URLSearchParams({
          q: params.search.value,
          limit: params.length || 10,
          skip: params.start || 0
        });
        return `${baseUrl}/search?${query}`;
      };

      // Search on page 2
      const params = {
        start: 10,
        length: 10,
        search: { value: 'john' }
      };

      const url = buildSearchUrl('https://dummyjson.com/users', params);
      expect(url).toBe('https://dummyjson.com/users/search?q=john&limit=10&skip=10');
    });

    test('should handle empty search parameter', () => {
      const buildUrl = (baseUrl, params) => {
        if (params.search?.value) {
          return `${baseUrl}/search?q=${params.search.value}`;
        }
        return `${baseUrl}?limit=${params.length || 10}`;
      };

      // Empty search should use regular endpoint
      const emptySearch = { search: { value: '' }, length: 10 };
      const url1 = buildUrl('https://dummyjson.com/users', emptySearch);
      expect(url1).toBe('https://dummyjson.com/users?limit=10');

      // No search property should use regular endpoint
      const noSearch = { length: 10 };
      const url2 = buildUrl('https://dummyjson.com/users', noSearch);
      expect(url2).toBe('https://dummyjson.com/users?limit=10');
    });
  });

  describe('API Integration', () => {
    test('should handle DummyJSON response format', async () => {
      const mockResponse = {
        users: [
          { id: 1, firstName: 'John', email: 'john@example.com' },
          { id: 2, firstName: 'Jane', email: 'jane@example.com' }
        ],
        total: 208,
        skip: 0,
        limit: 5
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      });

      const response = await fetch('https://dummyjson.com/users?limit=5&skip=0');
      const data = await response.json();

      expect(data).toHaveProperty('users');
      expect(data).toHaveProperty('total');
      expect(data.users).toHaveLength(2);
      expect(data.total).toBe(208);
    });

    test('should handle search endpoint response', async () => {
      const mockSearchResponse = {
        users: [
          { id: 5, firstName: 'James', lastName: 'Johnson', email: 'james@example.com' }
        ],
        total: 1,
        skip: 0,
        limit: 10
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSearchResponse
      });

      const response = await fetch('https://dummyjson.com/users/search?q=james&limit=10&skip=0');
      const data = await response.json();

      expect(data).toHaveProperty('users');
      expect(data.users).toHaveLength(1);
      expect(data.users[0].firstName).toBe('James');
      expect(data.total).toBe(1);
    });

    test('should handle pagination correctly', async () => {
      const mockPage1 = { users: [{ id: 1 }], total: 208, skip: 0 };
      const mockPage2 = { users: [{ id: 11 }], total: 208, skip: 10 };

      fetch
        .mockResolvedValueOnce({ ok: true, json: async () => mockPage1 })
        .mockResolvedValueOnce({ ok: true, json: async () => mockPage2 });

      const page1 = await fetch('https://dummyjson.com/users?limit=10&skip=0');
      const page2 = await fetch('https://dummyjson.com/users?limit=10&skip=10');
      
      const data1 = await page1.json();
      const data2 = await page2.json();

      expect(data1.users[0].id).toBe(1);
      expect(data2.users[0].id).toBe(11);
    });
  });
});