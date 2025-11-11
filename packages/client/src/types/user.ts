export type Gender = 'male' | 'female';

export type User = {
    id: number;
    email: string;
    name: string;
    surname: string;
    gender: Gender;
    profilePictureUrl?: string;
    bio?: string;
    city?: string;
    region?: string;
    dateOfBirth: string;
    lastLoginAt?: string;
    createdAt: string;
    updatedAt: string;
};
