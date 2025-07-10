import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useNavigate } from '@tanstack/react-router';

const registerUser = async (formData: FormData) => {
    const response = await fetch('/api/user/register', {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error('Registration failed');
    }

    return await response.json();
};

export const useRegisterUser = () => {
    const navigate = useNavigate();
    return useMutation({
        mutationFn: registerUser,
        onSuccess: (data) => {
            const { message } = data;
            toast.success(message, {
                position: 'top-center',
            });
            setTimeout(() => {
                navigate({ to: '/' });
            }, 200);
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });
};
