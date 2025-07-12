import { useForm, type SubmitHandler } from 'react-hook-form';
import VibelyIcon from '../ui/VibelyIcon';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

type LoginFormData = {
    email: string;
    password: string;
};

export default function LoginView() {
    const [isError, setIsError] = useState(false);
    const { register, handleSubmit } = useForm<LoginFormData>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
        setIsError(false);
        const { email, password } = data;
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            setIsError(true);
        } else {
            queryClient.invalidateQueries({ queryKey: ['me'] });
            setTimeout(() => navigate({ to: '/home' }), 100);
        }
    };

    return (
        <div className='flex h-screen w-full items-center justify-center p-4'>
            <div className='border-primary-100 flex h-1/2 w-1/4 flex-col justify-evenly rounded-2xl border bg-white px-10 shadow-2xl'>
                <h1 className='text-primary-500 flex items-center gap-1 text-6xl font-bold'>
                    <VibelyIcon className='h-16 w-16' />
                    Vibely
                </h1>
                <form
                    className='flex flex-col gap-2'
                    onSubmit={handleSubmit(onSubmit)}
                >
                    {isError && (
                        <div className='text-sm text-red-500'>
                            Invalid email or password.
                        </div>
                    )}
                    <Input
                        key={'email'}
                        type='email'
                        placeholder='Email'
                        {...register('email', {
                            required: true,
                            onChange: () => setIsError(false),
                        })}
                    />
                    <Input
                        key={'password'}
                        type='password'
                        placeholder='Password'
                        {...register('password', {
                            required: true,
                            onChange: () => setIsError(false),
                        })}
                    />

                    <Button type='submit'>Login</Button>
                </form>
                <div className='text-gray-500'>
                    Don't have an account?{' '}
                    <Link
                        to='/registration'
                        className='text-primary-400 hover:underline'
                    >
                        Registration
                    </Link>
                </div>
            </div>
        </div>
    );
}
