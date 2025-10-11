import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { apiClient } from '../../../lib/apiClient';

export type EditFormData = {
    region?: string;
    city?: string;
    bio?: string;
    interests?: number[];
};

export function useEditProfile(profileId: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: EditFormData) =>
            await apiClient.post(`/user/profile/edit/${profileId}`, data),
        onSuccess: (data) => {
            const { message } = data;
            toast.success(message, {
                position: 'top-center',
            });
            queryClient.invalidateQueries({ queryKey: ['profile', profileId] });
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });
}
