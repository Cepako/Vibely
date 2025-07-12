import { createContext, useContext } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

type User = {
    id: number;
    email: string;
    role: 'admin' | 'user';
};

export type AuthContextType = {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery<User>({
        queryKey: ['me'],
        queryFn: async () => {
            const res = await fetch('/api/auth/me', {
                credentials: 'include',
            });

            if (!res.ok) {
                return null;
            }

            const data = await res.json();
            return data.user;
        },
        staleTime: 1000 * 5,
    });

    const logout = async () => {
        await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include',
        });
        queryClient.invalidateQueries({ queryKey: ['me'] });
    };

    return (
        <AuthContext.Provider
            value={{
                user: data ?? null,
                isAuthenticated: !!data,
                isLoading,
                logout,
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
