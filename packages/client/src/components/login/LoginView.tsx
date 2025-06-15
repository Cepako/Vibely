import { useForm, type SubmitHandler } from 'react-hook-form';
import VibelyIcon from '../ui/VibelyIcon';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Link } from '@tanstack/react-router';

type LoginFormData = {
    email: string;
    password: string;
};

export default function LoginView() {
    const { register, handleSubmit } = useForm<LoginFormData>();

    const onSubmit: SubmitHandler<LoginFormData> = (data) => {
        console.log(data); //TODO: Handle login logic
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
                    <Input
                        key={'email'}
                        type='email'
                        placeholder='Email'
                        {...register('email', { required: true })}
                    />
                    <Input
                        key={'password'}
                        type='password'
                        placeholder='Password'
                        {...register('password', { required: true })}
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
