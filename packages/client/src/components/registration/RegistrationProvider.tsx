import { createContext, useContext, useState, type ReactNode } from 'react';
import { useRegisterUser } from './hooks/useRegisterUser';

export type RegistrationFormData = {
    email: string;
    password: string;
    confirmPassword: string;
    name: string;
    surname: string;
    gender: 'male' | 'female';
    profilePicture?: File;
    bio?: string;
    city?: string;
    region?: string;
    dateOfBirth: Date;
    interests?: number[];
};

type RegistrationStep = 'credentials' | 'userInfo' | 'profilePicture';

interface RegistrationContextType {
    currentStep: RegistrationStep;
    formData: Partial<RegistrationFormData>;
    updateFormData: (data: Partial<RegistrationFormData>) => void;
    nextStep: () => void;
    prevStep: () => void;
    submitRegistration: () => void;
}

const RegistrationContext = createContext<RegistrationContextType | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useRegistration = () => {
    const context = useContext(RegistrationContext);
    if (!context) {
        throw new Error(
            'useRegistration must be used within a RegistrationProvider'
        );
    }
    return context;
};

interface RegistrationProviderProps {
    children: ReactNode;
}

const RegistrationProvider: React.FC<RegistrationProviderProps> = ({
    children,
}: RegistrationProviderProps) => {
    const [currentStep, setCurrentStep] =
        useState<RegistrationStep>('credentials');
    const [formData, setFormData] = useState<Partial<RegistrationFormData>>({});
    const { mutate: register } = useRegisterUser();

    const steps: RegistrationStep[] = [
        'credentials',
        'userInfo',
        'profilePicture',
    ];

    const updateFormData = (data: Partial<RegistrationFormData>) => {
        setFormData((prev) => ({ ...prev, ...data }));
    };

    const nextStep = () => {
        const currentIndex = steps.indexOf(currentStep);
        if (currentIndex < steps.length - 1) {
            setCurrentStep(steps[currentIndex + 1]);
        }
    };

    const prevStep = () => {
        const currentIndex = steps.indexOf(currentStep);
        if (currentIndex > 0) {
            setCurrentStep(steps[currentIndex - 1]);
        }
    };

    const submitRegistration = () => {
        const payload = new FormData();

        payload.append('email', formData.email!);
        payload.append('password', formData.password!);
        payload.append('name', formData.name!);
        payload.append('surname', formData.surname!);
        payload.append('gender', formData.gender!);
        payload.append('dateOfBirth', formData.dateOfBirth!.toISOString());

        if (formData.city) payload.append('city', formData.city);
        if (formData.region) payload.append('region', formData.region);
        if (formData.bio) payload.append('bio', formData.bio);

        if (formData.interests && formData.interests.length > 0) {
            payload.append('interests', JSON.stringify(formData.interests));
        }

        if (
            formData.profilePicture &&
            formData.profilePicture instanceof File
        ) {
            payload.append('profilePicture', formData.profilePicture);
        }

        register(payload);
    };

    return (
        <RegistrationContext.Provider
            value={{
                currentStep,
                formData,
                updateFormData,
                nextStep,
                prevStep,
                submitRegistration,
            }}
        >
            {children}
        </RegistrationContext.Provider>
    );
};

export default RegistrationProvider;
