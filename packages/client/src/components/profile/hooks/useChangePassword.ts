import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { apiClient } from '../../../lib/apiClient';

export type ChangePasswordData = {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
};

export function useChangePassword() {
    return useMutation({
        mutationFn: async (data: ChangePasswordData) =>
            await apiClient.post('/user/change-password', data),
        onSuccess: (data) => {
            const { message } = data;
            toast.success(message, {
                position: 'top-center',
            });
        },
        onError: (error: any) => {
            toast.error(error.message || 'Failed to change password', {
                position: 'top-center',
            });
        },
    });
}
