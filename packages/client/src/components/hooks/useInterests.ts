import { useQuery } from '@tanstack/react-query';

export const fetchInterests = async () => {
    const res = await fetch('/api/user/interests');
    if (!res.ok) throw new Error('Failed to load interests');
    return res.json();
};

export const useInterests = () =>
    useQuery({
        queryKey: ['interests'],
        queryFn: () => fetchInterests(),
        staleTime: 1000 * 60 * 5,
    });
