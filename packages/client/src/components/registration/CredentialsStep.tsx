import { useForm, type SubmitHandler } from 'react-hook-form';
import { useRegistration } from './RegistrationProvider';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useEmailValidation } from './hooks/useEmailValidation';
import { IconCheck, IconHourglassHigh, IconX } from '@tabler/icons-react';

type CredentialsFormData = {
    email: string;
    password: string;
    confirmPassword: string;
};

export const CredentialsStep: React.FC = () => {
    const { formData, updateFormData, nextStep } = useRegistration();
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<CredentialsFormData>({
        defaultValues: {
            email: formData.email || '',
            password: formData.password || '',
            confirmPassword: formData.confirmPassword || '',
        },
    });

    const email = watch('email');
    const password = watch('password');
    const {
        isChecking,
        isAvailable,
        error: emailError,
    } = useEmailValidation(email);

    const onSubmit: SubmitHandler<CredentialsFormData> = (data) => {
        if (isAvailable === false) {
            return;
        }
        updateFormData(data);
        nextStep();
    };
    const getEmailInputStatus = () => {
        if (!email || !email.includes('@')) return '';
        if (isChecking) return '!border-yellow-400';
        if (isAvailable === true) return '!border-green-400';
        if (isAvailable === false) return '!border-red-400';
        return '';
    };

    const getEmailStatusIcon = () => {
        if (!email || !email.includes('@')) return null;
        if (isChecking)
            return (
                <span className='text-yellow-500'>
                    <IconHourglassHigh />
                </span>
            );
        if (isAvailable === true)
            return (
                <span className='text-green-500'>
                    <IconCheck />
                </span>
            );
        if (isAvailable === false)
            return (
                <span className='text-red-500'>
                    <IconX />
                </span>
            );
        return null;
    };

    return (
        <>
            <h2 className='mb-4 text-2xl font-semibold text-slate-600'>
                Create Account
            </h2>
            <form
                className='flex max-w-[400px] flex-col gap-3'
                onSubmit={handleSubmit(onSubmit)}
            >
                <div className='relative'>
                    <Input
                        placeholder='Email'
                        className={`w-full pr-8 ${getEmailInputStatus()}`}
                        {...register('email', {
                            required: 'Email is required',
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: 'Invalid email address',
                            },
                        })}
                    />
                    <div className='absolute top-1/2 right-3 -translate-y-1/2 transform'>
                        {getEmailStatusIcon()}
                    </div>
                </div>
                {errors.email && (
                    <span className='text-sm text-red-500'>
                        {errors.email.message}
                    </span>
                )}
                {emailError && (
                    <span className='text-sm text-red-500'>{emailError}</span>
                )}
                {isAvailable === true && !errors.email && (
                    <span className='text-sm text-green-500'>
                        Email is available!
                    </span>
                )}

                <Input
                    type='password'
                    placeholder='Password'
                    {...register('password', {
                        required: 'Password is required',
                        minLength: {
                            value: 8,
                            message: 'Password must be at least 8 characters',
                        },
                        pattern: {
                            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).+$/,
                            message:
                                'Password must contain at least one uppercase, lowercase, number, and special character',
                        },
                    })}
                />
                {errors.password && (
                    <span className='text-sm break-words whitespace-normal text-red-500'>
                        {errors.password.message}
                    </span>
                )}

                <Input
                    type='password'
                    placeholder='Confirm password'
                    {...register('confirmPassword', {
                        required: 'Please confirm your password',
                        validate: (value) =>
                            value === password || 'Passwords do not match',
                    })}
                />
                {errors.confirmPassword && (
                    <span className='text-sm text-red-500'>
                        {errors.confirmPassword.message}
                    </span>
                )}

                <Button
                    type='submit'
                    className='mt-4'
                    disabled={isChecking || isAvailable === false}
                >
                    {isChecking ? 'Checking...' : 'Continue'}
                </Button>
            </form>
        </>
    );
};
