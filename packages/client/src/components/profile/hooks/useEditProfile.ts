import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

export type EditFormData = {
    region?: string;
    city?: string;
    bio?: string;
};

async function editData({
    data,
    profileId,
}: {
    data: EditFormData;
    profileId: number;
}) {
    const response = await fetch(`/api/user/profile/edit/${profileId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error('Profile edit failed');
    }

    return await response.json();
}

export function useEditProfile(profileId: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: EditFormData) => editData({ data, profileId }),
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
