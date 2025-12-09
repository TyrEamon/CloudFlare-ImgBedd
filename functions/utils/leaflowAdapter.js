/**
 * Leaflow API 适配器
 * 通过容器化 Leaflow 服务替代 KV/D1 写入，避免 Workers KV 写入限制。
 */

const DEFAULT_HEADERS = {
    'Content-Type': 'application/json'
};

export class LeaflowAdapter {
    constructor(apiBase, token) {
        this.apiBase = apiBase.replace(/\/$/, '');
        this.token = token;
    }

    buildHeaders(extra = {}) {
        const headers = { ...DEFAULT_HEADERS, ...extra };
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        return headers;
    }

    async put(key, value, options = {}) {
        const body = {
            value,
            metadata: options.metadata || undefined
        };

        const res = await fetch(`${this.apiBase}/kv/${encodeURIComponent(key)}`, {
            method: 'PUT',
            headers: this.buildHeaders(),
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            throw new Error(`Leaflow PUT failed: ${res.status} ${res.statusText}`);
        }
        return true;
    }

    async get(key, options = {}) {
        const res = await fetch(`${this.apiBase}/kv/${encodeURIComponent(key)}`, {
            method: 'GET',
            headers: this.buildHeaders()
        });

        if (res.status === 404) return null;
        if (!res.ok) throw new Error(`Leaflow GET failed: ${res.status} ${res.statusText}`);

        const data = await res.json();
        const rawValue = data.value ?? null;

        if (options.type === 'json') {
            if (rawValue === null) return null;
            if (typeof rawValue === 'string') {
                try {
                    return JSON.parse(rawValue);
                } catch (e) {
                    console.warn('Leaflow GET json parse failed, returning raw string');
                    return rawValue;
                }
            }
            return rawValue;
        }

        return rawValue;
    }

    async getWithMetadata(key) {
        const res = await fetch(`${this.apiBase}/kv/${encodeURIComponent(key)}`, {
            method: 'GET',
            headers: this.buildHeaders()
        });

        if (res.status === 404) return null;
        if (!res.ok) throw new Error(`Leaflow GET failed: ${res.status} ${res.statusText}`);

        const data = await res.json();
        return {
            value: data.value ?? null,
            metadata: data.metadata || {}
        };
    }

    async delete(key) {
        const res = await fetch(`${this.apiBase}/kv/${encodeURIComponent(key)}`, {
            method: 'DELETE',
            headers: this.buildHeaders()
        });

        if (!res.ok && res.status !== 404) {
            throw new Error(`Leaflow DELETE failed: ${res.status} ${res.statusText}`);
        }
        return true;
    }

    async list(options = {}) {
        const params = new URLSearchParams();
        if (options.prefix) params.append('prefix', options.prefix);
        if (options.limit) params.append('limit', options.limit);
        if (options.cursor) params.append('cursor', options.cursor);

        const res = await fetch(`${this.apiBase}/kv?${params.toString()}`, {
            method: 'GET',
            headers: this.buildHeaders()
        });

        if (!res.ok) throw new Error(`Leaflow LIST failed: ${res.status} ${res.statusText}`);
        const data = await res.json();
        return {
            keys: (data.keys || []).map((item) => ({
                name: item.name,
                metadata: item.metadata || {}
            })),
            cursor: data.cursor,
            list_complete: data.list_complete
        };
    }

    async putFile(fileId, value, options) {
        return this.put(fileId, value, options);
    }

    async getFile(fileId, options) {
        return this.getWithMetadata(fileId, options);
    }

    async getFileWithMetadata(fileId, options) {
        return this.getWithMetadata(fileId, options);
    }

    async deleteFile(fileId, options) {
        return this.delete(fileId, options);
    }

    async listFiles(options) {
        return this.list(options);
    }

    async putSetting(key, value, options) {
        return this.put(key, value, options);
    }

    async getSetting(key, options) {
        return this.get(key, options);
    }

    async deleteSetting(key, options) {
        return this.delete(key, options);
    }

    async listSettings(options) {
        return this.list(options);
    }

    async putIndexOperation(operationId, operation, options) {
        const key = 'manage@index@operation_' + operationId;
        return this.put(key, JSON.stringify(operation), options);
    }

    async getIndexOperation(operationId, options) {
        const key = 'manage@index@operation_' + operationId;
        const result = await this.get(key, options);
        return result ? JSON.parse(result) : null;
    }

    async deleteIndexOperation(operationId, options) {
        const key = 'manage@index@operation_' + operationId;
        return this.delete(key, options);
    }

    async listIndexOperations(options) {
        const listOptions = Object.assign({}, options, {
            prefix: 'manage@index@operation_'
        });
        const result = await this.list(listOptions);
        const operations = [];
        for (const item of result.keys) {
            const operationData = await this.get(item.name);
            if (operationData) {
                const operation = JSON.parse(operationData);
                operations.push({
                    id: item.name.replace('manage@index@operation_', ''),
                    type: operation.type,
                    timestamp: operation.timestamp,
                    data: operation.data,
                    processed: operation.processed || false
                });
            }
        }

        return operations;
    }
}
