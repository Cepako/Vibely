import { IconEdit } from '@tabler/icons-react';
import type { UserProfile } from '../hooks/useProfile';
import { Dialog, useDialog } from '../ui/Dialog';
import { useForm } from 'react-hook-form';
import { useEditProfile, type EditFormData } from './hooks/useEditProfile';
import Input from '../ui/Input';

interface EditProfileFormProps {
    user: UserProfile;
}

export default function EditProfileForm({ user }: EditProfileFormProps) {
    const dialog = useDialog(false);
    const { region, city, bio, id } = user;

    return (
        <>
            <Dialog
                isOpen={dialog.isOpen}
                onClose={dialog.closeDialog}
                placement='center'
            >
                <Form
                    region={region}
                    city={city}
                    bio={bio}
                    profileId={id}
                    closeDialog={dialog.closeDialog}
                />
            </Dialog>
            <button
                onClick={() => dialog.openDialog()}
                className='flex cursor-pointer items-center space-x-2 rounded-lg bg-gray-100 px-4 py-2 transition-colors hover:bg-gray-200'
            >
                <IconEdit size={16} />
                <span>Edit Profile</span>
            </button>
        </>
    );
}

interface FormProps {
    profileId: number;
    closeDialog: () => void;
    region?: string;
    city?: string;
    bio?: string;
}

function Form({ region, city, bio, profileId, closeDialog }: FormProps) {
    const editProfile = useEditProfile(profileId);
    const { register, handleSubmit } = useForm<EditFormData>({
        defaultValues: { bio, city, region },
    });

    const onSubmit = (data: EditFormData) => {
        editProfile.mutate(data);
        closeDialog();
    };

    return (
        <div className='flex w-full flex-col gap-5 rounded-md bg-white p-5'>
            <h2 className='text-xl font-bold'>Edit profile</h2>
            <form
                onSubmit={handleSubmit(onSubmit)}
                className='flex h-full w-full flex-col gap-3'
            >
                <div className='flex flex-1 flex-col gap-1'>
                    <Label label='City' />
                    <Input
                        type='text'
                        placeholder='City (optional)'
                        {...register('city')}
                    />
                </div>
                <div className='flex flex-1 flex-col gap-1'>
                    <Label label='Region' />
                    <Input
                        type='text'
                        placeholder='Region/State (optional)'
                        {...register('region')}
                    />
                </div>
                <div className='w-full'>
                    <Label label='About' />
                    <textarea
                        className='outline-primary-400 w-full resize-none rounded-lg border border-gray-300 p-3 placeholder:text-slate-400 focus:outline-1'
                        rows={4}
                        placeholder='Tell us a bit about yourself... (optional)'
                        {...register('bio')}
                    />
                </div>
                <div className='flex justify-evenly'>
                    <button
                        type='submit'
                        className='bg-primary-500 hover:bg-primary-600 cursor-pointer rounded-lg px-7 py-1 text-white duration-200'
                    >
                        Edit
                    </button>
                    <button
                        type='button'
                        className='cursor-pointer rounded-lg bg-rose-500 px-4 py-1 text-white duration-200 hover:bg-rose-600'
                        onClick={() => closeDialog()}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

function Label({ label }: { label: string }) {
    return <div className='text-sm text-slate-500'>{label}</div>;
}
