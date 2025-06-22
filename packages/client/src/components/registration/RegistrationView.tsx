import {
    useRegistration,
    type RegistrationFormData,
} from './RegistrationProvider';
import { CredentialsStep } from './CredentialsStep';
import { UserInfoStep } from './UserInfoStep';
import { ProfilePictureStep } from './ProfilePictureStep';
import VibelyIcon from '../ui/VibelyIcon';
import { useNavigate } from '@tanstack/react-router';
import { Dialog, useDialog } from '../ui/Dialog';
import Button from '../ui/Button';

export default function RegisterView() {
    const { currentStep, formData } = useRegistration();
    const dialog = useDialog(false);
    const navigate = useNavigate();
    const dataExists = hasFormData(formData);

    const handleLoginClick = () => {
        if (dataExists) {
            dialog.openDialog();
        } else {
            navigate({ to: '/' });
        }
    };

    const handleConfirmLeave = () => {
        dialog.closeDialog();
        navigate({ to: '/' });
    };

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 'credentials':
                return <CredentialsStep />;
            case 'userInfo':
                return <UserInfoStep />;
            case 'profilePicture':
                return <ProfilePictureStep />;
            default:
                return <CredentialsStep />;
        }
    };

    return (
        <div className='bg-primary-50 flex min-h-screen items-center justify-center'>
            <div className='flex h-full w-full items-center justify-center'>
                <div className='border-primary-100 flex min-w-1/4 flex-col justify-evenly gap-3 rounded-2xl border bg-white px-10 py-6 shadow-2xl'>
                    <h1 className='text-primary-500 flex items-center gap-1 text-6xl font-bold'>
                        <VibelyIcon className='h-16 w-16' />
                        Vibely
                    </h1>
                    <>{renderCurrentStep()}</>
                    <div className='flex gap-1 text-gray-500'>
                        Already have account?{' '}
                        <Dialog
                            isOpen={dialog.isOpen}
                            onClose={dialog.closeDialog}
                            title='You have unsaved changes in your registration form!'
                            size='md'
                            placement='center'
                        >
                            <div className='flex flex-col gap-5 rounded-2xl border border-slate-700 bg-white p-5'>
                                <p className='text-slate-500'>
                                    Are you sure you want to leave? All your
                                    progress will be lost.
                                </p>
                                <div className='flex gap-3'>
                                    <Button
                                        onClick={dialog.closeDialog}
                                        className='flex-1'
                                    >
                                        Stay
                                    </Button>
                                    <Button
                                        onClick={handleConfirmLeave}
                                        className='flex-1 bg-rose-600 hover:bg-rose-700'
                                    >
                                        Leave
                                    </Button>
                                </div>
                            </div>
                        </Dialog>
                        <div
                            onClick={handleLoginClick}
                            className='text-primary-400 cursor-pointer hover:underline'
                        >
                            Login
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function hasFormData(formData: Partial<RegistrationFormData>) {
    const fieldsToCheck: (keyof Partial<RegistrationFormData>)[] = [
        'email',
        'password',
        'confirmPassword',
        'name',
        'surname',
        'city',
        'region',
        'bio',
        'profilePicture',
    ];

    return fieldsToCheck.some((field) => {
        const value = formData[field];
        return value && value.toString().trim().length > 0;
    });
}
