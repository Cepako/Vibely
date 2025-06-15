import { useEffect, useState } from 'react';

export const useEmailValidation = (email: string, delay: number = 500) => {
    const [isChecking, setIsChecking] = useState(false);
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
        if (!email || !email.includes('@') || !emailRegex.test(email)) {
            setIsAvailable(null);
            setError(null);
            return;
        }

        const timer = setTimeout(async () => {
            setIsChecking(true);
            setError(null);

            try {
                const response = await fetch('/api/auth/check-email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email }),
                });

                if (!response.ok) {
                    throw new Error('Failed to check email');
                }

                const data = await response.json();
                setIsAvailable(data.available);

                if (!data.available) {
                    setError('This email is already registered');
                }
            } catch (err) {
                console.error(err);
                // setError('Failed to verify email');
                setIsAvailable(true); //TODO: change to null when connect with backend
            } finally {
                setIsChecking(false);
            }
        }, delay);

        return () => clearTimeout(timer);
    }, [email, delay]);

    return { isChecking, isAvailable, error };
};
