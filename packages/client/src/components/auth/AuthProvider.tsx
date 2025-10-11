import { createContext, useContext, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { setAuthErrorCallback } from '../../lib/apiClient';
import { useRouter } from '@tanstack/react-router';

type UserPayload = {
    id: number;
    email: string;
    role: 'admin' | 'user';
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
    const router = useRouter();

    const { data, isLoading, refetch } = useQuery<UserPayload | null>({
        queryKey: ['verify'],
        queryFn: async () => {
            const res = await fetch('/api/auth/verify', {
                credentials: 'include',
            });

            if (!res.ok) {
                return null;
            }

            const data = await res.json();
            return data.user;
        },
        staleTime: 1000 * 60 * 5,
        retry: false,
        refetchOnWindowFocus: true,
    });

    const refreshUser = async () => {
        const result = await refetch();
        return result.data ?? null;
    };

    const logout = async () => {
        await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include',
        });
        queryClient.clear();

        const currentPath = window.location.pathname;
        if (currentPath !== '/') {
            sessionStorage.setItem('redirectAfterLogin', currentPath);
        }

        router.navigate({ to: '/' });
    };

    useEffect(() => {
        setAuthErrorCallback(() => {
            queryClient.setQueryData(['verify'], null);
            queryClient.clear();

            const currentPath = window.location.pathname;
            if (currentPath !== '/') {
                sessionStorage.setItem('redirectAfterLogin', currentPath);
            }

            router.navigate({ to: '/' });
        });
    }, [queryClient, router]);

    return (
        <AuthContext.Provider
            value={{
                user: data ?? null,
                isAuthenticated: !!data,
                isLoading,
                logout,
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
