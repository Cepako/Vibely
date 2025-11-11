import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
} from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, setAuthErrorCallback } from '../../lib/apiClient';

type UserPayload = {
    id: number;
    email: string;
};

export type AuthContextType = {
    user: UserPayload | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    logout: () => Promise<void>;
    refreshUser: () => Promise<UserPayload | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const queryClient = useQueryClient();
    const isRedirectingRef = useRef(false);

    const { data, isLoading, refetch } = useQuery<UserPayload | null>({
        queryKey: ['verify'],
        queryFn: async () => {
            try {
                const data = await apiClient.get<{ user: UserPayload | null }>(
                    '/auth/verify'
                );
                return data.user;
            } catch (error) {
                return null;
            }
        },
        staleTime: 1000 * 60 * 15,
        retry: false,
        refetchOnWindowFocus: true,
    });

    const refreshUser = async () => {
        const result = await refetch();
        return result.data ?? null;
    };

    const performLogout = useCallback(
        async (options: { isAutoLogout?: boolean } = {}) => {
            const { isAutoLogout = false } = options;
            if (isRedirectingRef.current) return;
            isRedirectingRef.current = true;

            try {
                if (!isAutoLogout) await apiClient.post('/auth/logout', {});
            } catch (error) {
                console.error('Logout error:', error);
            }

            queryClient.clear();
            queryClient.setQueryData(['verify'], null);

            const currentPath = window.location.pathname;
            if (currentPath !== '/') {
                sessionStorage.setItem('redirectAfterLogin', currentPath);
            }

            if (isAutoLogout) sessionStorage.setItem('sessionExpired', 'true');

            window.location.href = '/';
        },
        [queryClient]
    );

    const manualLogout = async () => {
        await performLogout({ isAutoLogout: false });
    };

    useEffect(() => {
        setAuthErrorCallback(() => performLogout({ isAutoLogout: true }));
    }, [performLogout]);

    return (
        <AuthContext.Provider
            value={{
                user: data ?? null,
                isAuthenticated: !!data,
                isLoading,
                logout: manualLogout,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
