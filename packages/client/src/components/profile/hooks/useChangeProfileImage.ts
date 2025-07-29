import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

async function changeProfileImage({
    data,
    profileId,
}: {
    data: FormData;
    profileId: number;
}) {
    const response = await fetch(
        `/api/user/profile/edit/picture/${profileId}`,
        {
            method: 'POST',
            body: data,
            credentials: 'include',
        }
    );

    if (!response.ok) {
        throw new Error('Profile image change failed');
    }

    return await response.json();
}

export function useChangeProfileImage(profileId: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: FormData) => changeProfileImage({ data, profileId }),
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
