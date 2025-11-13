let authErrorCallback: (() => void) | null = null;

export const setAuthErrorCallback = (callback: () => void) => {
    authErrorCallback = callback;
};

let isRefreshing = false;
let failedRequestQueue: Array<{
    resolve: (value: unknown) => void;
    reject: (reason?: any) => void;
    url: string;
    options: RequestInit;
}> = [];

const processQueue = (error: any) => {
    failedRequestQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(fetchWithRefresh(prom.url, prom.options));
        }
    });
    failedRequestQueue = [];
};

/**
 * The core fetch wrapper with refresh token logic.
 */
async function fetchWithRefresh(
    url: string,
    options: RequestInit = {}
): Promise<Response> {
    const fullUrl = `/api${url}`;
    const response = await fetch(fullUrl, {
        ...options,
        credentials: 'include',
    });

    if (response.status !== 401) {
        return response;
    }

    if (
        url.includes('/auth/login') ||
        url.includes('/auth/logout') ||
        url.includes('/auth/refresh')
    ) {
        return response;
    }

    if (isRefreshing) {
        return new Promise((resolve, reject) => {
            failedRequestQueue.push({ resolve, reject, url, options });
        }) as Promise<any>;
    }

    isRefreshing = true;

    return new Promise((resolve, reject) => {
        fetch('/api/auth/refresh', {
            method: 'POST',
            credentials: 'include',
        })
            .then(async (refreshResponse) => {
                if (!refreshResponse.ok) {
                    const err = new Error('Session expired');
                    processQueue(err);
                    if (authErrorCallback) {
                        authErrorCallback();
                    }
                    return reject(err);
                }

                processQueue(null);

                const newOriginalResponse = await fetch(fullUrl, options);
                resolve(newOriginalResponse);
            })
            .catch((err) => {
                processQueue(err);
                if (authErrorCallback) {
                    authErrorCallback();
                }
                reject(err);
            })
            .finally(() => {
                isRefreshing = false;
            });
    });
}

/**
 * A helper to process the response from fetchWithRefresh
 */
async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        const errorMessage =
            errorBody?.error || errorBody?.message || `HTTP ${response.status}`;
        throw new Error(errorMessage);
    }
    if (response.status === 204) {
        return null as T;
    }
    return response.json();
}

export const apiClient = {
    get: async <T = any>(url: string, options?: RequestInit): Promise<T> => {
        const response = await fetchWithRefresh(url, {
            ...options,
            method: 'GET',
        });
        return handleResponse<T>(response);
    },

    post: async <T = any>(
        url: string,
        data?: any,
        options?: RequestInit
    ): Promise<T> => {
        const response = await fetchWithRefresh(url, {
            ...options,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
            body: JSON.stringify(data ?? {}),
        });
        return handleResponse<T>(response);
    },

    patch: async <T = any>(
        url: string,
        data?: any,
        options?: RequestInit
    ): Promise<T> => {
        const response = await fetchWithRefresh(url, {
            ...options,
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
            body: JSON.stringify(data ?? {}),
        });
        return handleResponse<T>(response);
    },

    put: async <T = any>(
        url: string,
        data?: any,
        options?: RequestInit
    ): Promise<T> => {
        const response = await fetchWithRefresh(url, {
            ...options,
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
            body: JSON.stringify(data ?? {}),
        });
        return handleResponse<T>(response);
    },

    delete: async <T = any>(url: string, options?: RequestInit): Promise<T> => {
        const response = await fetchWithRefresh(url, {
            ...options,
            method: 'DELETE',
        });
        return handleResponse<T>(response);
    },

    upload: async <T = any>(url: string, formData: FormData): Promise<T> => {
        const response = await fetchWithRefresh(url, {
            method: 'POST',
            body: formData,
        });
        return handleResponse<T>(response);
    },
};
