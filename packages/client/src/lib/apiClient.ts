let authErrorCallback: (() => void) | null = null;

export const setAuthErrorCallback = (callback: () => void) => {
    authErrorCallback = callback;
};

export async function fetchWithAuth<T = any>(
    url: string,
    options: RequestInit = {}
): Promise<T> {
    const response = await fetch(`/api${url}`, {
        ...options,
        credentials: 'include',
    });

    if (response.status === 401 && authErrorCallback) {
        authErrorCallback();
        throw new Error('Unauthorized');
    }

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error?.message || `HTTP ${response.status}`);
    }

    return response.json();
}

export const apiClient = {
    get: <T = any>(url: string, options?: RequestInit) =>
        fetchWithAuth<T>(url, { ...options, method: 'GET' }),

    post: <T = any>(url: string, data?: any, options?: RequestInit) =>
        fetchWithAuth<T>(url, {
            ...options,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
            body: JSON.stringify(data ?? {}),
        }),

    patch: <T = any>(url: string, data?: any, options?: RequestInit) =>
        fetchWithAuth<T>(url, {
            ...options,
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
            body: JSON.stringify(data ?? {}),
        }),
    put: <T = any>(url: string, data?: any, options?: RequestInit) =>
        fetchWithAuth<T>(url, {
            ...options,
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
            body: JSON.stringify(data ?? {}),
        }),

    delete: <T = any>(url: string, options?: RequestInit) =>
        fetchWithAuth<T>(url, { ...options, method: 'DELETE' }),

    upload: async <T = any>(url: string, formData: FormData): Promise<T> => {
        const response = await fetch(`/api${url}`, {
            method: 'POST',
            credentials: 'include',
            body: formData,
        });

        if (response.status === 401 && authErrorCallback) {
            authErrorCallback();
            throw new Error('Unauthorized');
        }

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error?.message || `HTTP ${response.status}`);
        }

        return response.json();
    },
};
