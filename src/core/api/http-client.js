import axios from 'axios';
// ── Client Instance ───────────────────────────────────
const httpClient = axios.create({
    baseURL: '/api/v1',
    timeout: 30_000,
    headers: {
        'Content-Type': 'application/json',
    },
});
// ── Request Interceptor: Auth + Tenant + Idempotency ──
httpClient.interceptors.request.use((config) => {
    // Auth token (will be set by auth store)
    const token = localStorage.getItem('abren_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    // Tenant ID
    const tenantId = localStorage.getItem('abren_tenant_id');
    if (tenantId) {
        config.headers['X-Tenant-ID'] = tenantId;
    }
    // Idempotency key for mutating requests
    const method = config.method?.toUpperCase();
    if (method && ['POST', 'PUT', 'PATCH'].includes(method)) {
        config.headers['Idempotency-Key'] = crypto.randomUUID();
    }
    return config;
});
// ── Response Interceptor: Envelope Unwrap ─────────────
httpClient.interceptors.response.use((response) => response, (error) => {
    if (error.response) {
        const { status, data } = error.response;
        // 401: Token expired or invalid
        if (status === 401) {
            localStorage.removeItem('abren_token');
            window.location.href = '/login';
            return Promise.reject(error);
        }
        // Structured error from backend
        if (data?.detail) {
            return Promise.reject(new Error(data.detail));
        }
    }
    return Promise.reject(error);
});
// ── Typed Request Helpers ─────────────────────────────
export async function apiGet(url, config) {
    const response = await httpClient.get(url, config);
    return response.data.data;
}
export async function apiPost(url, body, config) {
    const response = await httpClient.post(url, body, config);
    return response.data.data;
}
export async function apiPut(url, body, config) {
    const response = await httpClient.put(url, body, config);
    return response.data.data;
}
export async function apiPatch(url, body, config) {
    const response = await httpClient.patch(url, body, config);
    return response.data.data;
}
export async function apiDelete(url, config) {
    const response = await httpClient.delete(url, config);
    return response.data.data;
}
export { httpClient };
