import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { apiClient } from '../../../lib/apiClient';

export function useChangeProfileImage(profileId: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: FormData) =>
            await apiClient.upload(
                `/user/profile/edit/picture/${profileId}`,
                data
            ),
        onSuccess: (data) => {
            const { message } = data;
            toast.success(message, {
                position: 'top-center',
            });
            queryClient.invalidateQueries({ queryKey: ['me'] });
            queryClient.invalidateQueries({ queryKey: ['profile', profileId] });
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });
}
