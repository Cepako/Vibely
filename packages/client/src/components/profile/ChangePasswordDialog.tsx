import { IconEye, IconEyeOff, IconLock } from '@tabler/icons-react';
import { Dialog, useDialog } from '../ui/Dialog';
import { useForm } from 'react-hook-form';
import {
    useChangePassword,
    type ChangePasswordData,
} from './hooks/useChangePassword';
import Input from '../ui/Input';
import { useState } from 'react';

export default function ChangePasswordDialog() {
    const dialog = useDialog(false);

    return (
        <>
            <Dialog
                isOpen={dialog.isOpen}
                onClose={dialog.closeDialog}
                placement='center'
                className='-translate-y-20'
            >
                <ChangePasswordForm closeDialog={dialog.closeDialog} />
            </Dialog>
            <button
                onClick={() => dialog.openDialog()}
                className='flex cursor-pointer items-center space-x-2 rounded-lg bg-gray-100 px-4 py-2 transition-colors hover:bg-gray-200'
            >
                <IconLock size={16} />
                <span>Change Password</span>
            </button>
        </>
    );
}

interface ChangePasswordFormProps {
    closeDialog: () => void;
}

function ChangePasswordForm({ closeDialog }: ChangePasswordFormProps) {
    const changePassword = useChangePassword();
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        reset,
    } = useForm<ChangePasswordData>();

    const newPassword = watch('newPassword');

    const onSubmit = async (data: ChangePasswordData) => {
        try {
            await changePassword.mutateAsync(data);
            reset();
            closeDialog();
        } catch (err) {
            console.error('Change password failed', err);
        }
    };

    const validatePasswordMatch = (value: string) => {
        return value === newPassword || 'Passwords do not match';
    };

    const validatePasswordStrength = (value: string) => {
        const hasUpperCase = /[A-Z]/.test(value);
        const hasLowerCase = /[a-z]/.test(value);
        const hasNumber = /\d/.test(value);
        const hasSpecialChar = /[^\w\s]/.test(value);
        const isLongEnough = value.length >= 8;

        if (!isLongEnough) return 'Password must be at least 8 characters';
        if (!hasUpperCase) return 'Password must contain an uppercase letter';
        if (!hasLowerCase) return 'Password must contain a lowercase letter';
        if (!hasNumber) return 'Password must contain a number';
        if (!hasSpecialChar) return 'Password must contain a special character';
        return true;
    };

    return (
        <div className='flex w-full max-w-md flex-col gap-5 rounded-md bg-white p-5'>
            <h2 className='text-xl font-bold'>Change Password</h2>
            <form
                onSubmit={handleSubmit(onSubmit)}
                className='flex h-full w-full flex-col gap-4'
            >
                <div className='flex flex-col gap-1'>
                    <Label label='Current Password' />
                    <div className='relative'>
                        <Input
                            type={showPasswords.current ? 'text' : 'password'}
                            placeholder='Enter current password'
                            {...register('currentPassword', {
                                required: 'Current password is required',
                            })}
                            className='w-full'
                        />
                        <TogglePasswordButton
                            show={showPasswords.current}
                            onClick={() =>
                                setShowPasswords((prev) => ({
                                    ...prev,
                                    current: !prev.current,
                                }))
                            }
                        />
                    </div>
                    {errors.currentPassword && (
                        <span className='text-sm text-red-500'>
                            {errors.currentPassword.message}
                        </span>
                    )}
                </div>

                <div className='flex flex-col gap-1'>
                    <Label label='New Password' />
                    <div className='relative'>
                        <Input
                            type={showPasswords.new ? 'text' : 'password'}
                            placeholder='Enter new password'
                            {...register('newPassword', {
                                required: 'New password is required',
                                validate: validatePasswordStrength,
                            })}
                            className='w-full'
                        />
                        <TogglePasswordButton
                            show={showPasswords.new}
                            onClick={() =>
                                setShowPasswords((prev) => ({
                                    ...prev,
                                    new: !prev.new,
                                }))
                            }
                        />
                    </div>
                    {errors.newPassword && (
                        <span className='text-sm text-red-500'>
                            {errors.newPassword.message}
                        </span>
                    )}
                    <div className='text-xs text-slate-500'>
                        Must contain: 8+ characters, uppercase, lowercase,
                        number, and special character
                    </div>
                </div>

                <div className='flex flex-col gap-1'>
                    <Label label='Confirm New Password' />
                    <div className='relative'>
                        <Input
                            type={showPasswords.confirm ? 'text' : 'password'}
                            placeholder='Confirm new password'
                            {...register('confirmPassword', {
                                required: 'Please confirm your password',
                                validate: validatePasswordMatch,
                            })}
                            className='w-full'
                        />
                        <TogglePasswordButton
                            show={showPasswords.confirm}
                            onClick={() =>
                                setShowPasswords((prev) => ({
                                    ...prev,
                                    confirm: !prev.confirm,
                                }))
                            }
                        />
                    </div>
                    {errors.confirmPassword && (
                        <span className='text-sm text-red-500'>
                            {errors.confirmPassword.message}
                        </span>
                    )}
                </div>

                <div className='flex justify-end gap-3 pt-2'>
                    <button
                        type='button'
                        className='cursor-pointer rounded-lg bg-slate-200 px-6 py-2 text-slate-700 duration-200 hover:bg-slate-300'
                        onClick={() => {
                            reset();
                            closeDialog();
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        type='submit'
                        disabled={changePassword.isPending}
                        className='bg-primary-500 hover:bg-primary-600 cursor-pointer rounded-lg px-6 py-2 text-white duration-200 disabled:cursor-not-allowed disabled:opacity-50'
                    >
                        {changePassword.isPending
                            ? 'Changing...'
                            : 'Change Password'}
                    </button>
                </div>
            </form>
        </div>
    );
}

function Label({ label }: { label: string }) {
    return <div className='text-sm font-medium text-slate-500'>{label}</div>;
}

function TogglePasswordButton({
    show,
    onClick,
}: {
    show: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type='button'
            onClick={onClick}
            className='absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-slate-400 hover:text-slate-600'
        >
            {show ? <IconEyeOff /> : <IconEye />}
        </button>
    );
}
