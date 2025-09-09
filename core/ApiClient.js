/**
 * ApiClient - Modern fetch-based HTTP client for ModernTable.js
 */
export class ApiClient {
    constructor(config = {}) {
        // Handle string URL or object config
        if (typeof config === 'string') {
            this.config = {
                url: config,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            };
        } else {
            this.config = {
                url: null,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                ...config
            };
        }
    }

    /**
     * Make HTTP request
     */
    async request(params = {}) {
        try {
            const config = await this.prepareRequest(params);
            
            const response = await fetch(config.url, {
                method: config.method,
                headers: config.headers,
                body: config.method !== 'GET' ? JSON.stringify(config.data) : null
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            return data;

        } catch (error) {
            if (this.config.onError) {
                return await this.config.onError(error);
            }
            throw error;
        }
    }

    /**
     * Prepare request configuration
     */
    async prepareRequest(params) {
        let config = {
            url: this.buildUrl(params),
            method: this.config.method || 'GET',
            headers: { ...this.config.headers },
            data: this.config.data ? this.config.data(params) : params
        };

        // Add CSRF token if available
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
        if (csrfToken) {
            config.headers['X-CSRF-TOKEN'] = csrfToken;
        }

        // Apply request interceptor
        if (this.config.beforeRequest) {
            config = await this.config.beforeRequest(config);
        }

        return config;
    }

    /**
     * Build URL with query parameters
     */
    buildUrl(params) {
        const baseUrl = typeof this.config === 'string' ? this.config : this.config.url;
        
        if (!baseUrl) {
            throw new Error('API URL is not configured');
        }
        
        if (this.config.method === 'GET' && params && Object.keys(params).length > 0) {
            const url = new URL(baseUrl, window.location.origin);
            Object.entries(params).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    if (Array.isArray(value)) {
                        value.forEach((item, index) => {
                            if (typeof item === 'object') {
                                Object.entries(item).forEach(([subKey, subValue]) => {
                                    url.searchParams.append(`${key}[${index}][${subKey}]`, subValue);
                                });
                            } else {
                                url.searchParams.append(`${key}[${index}]`, item);
                            }
                        });
                    } else if (typeof value === 'object') {
                        Object.entries(value).forEach(([subKey, subValue]) => {
                            url.searchParams.append(`${key}[${subKey}]`, subValue);
                        });
                    } else {
                        url.searchParams.append(key, value);
                    }
                }
            });
            return url.toString();
        }

        return baseUrl;
    }

    /**
     * GET request
     */
    async get(params) {
        const originalMethod = this.config.method;
        this.config.method = 'GET';
        const result = await this.request(params);
        this.config.method = originalMethod;
        return result;
    }

    /**
     * POST request
     */
    async post(data) {
        const originalMethod = this.config.method;
        this.config.method = 'POST';
        const result = await this.request(data);
        this.config.method = originalMethod;
        return result;
    }

    /**
     * PUT request
     */
    async put(data) {
        const originalMethod = this.config.method;
        this.config.method = 'PUT';
        const result = await this.request(data);
        this.config.method = originalMethod;
        return result;
    }

    /**
     * DELETE request
     */
    async delete(data) {
        const originalMethod = this.config.method;
        this.config.method = 'DELETE';
        const result = await this.request(data);
        this.config.method = originalMethod;
        return result;
    }
}