export type Gender = 'male' | 'female';
export type Role = 'admin' | 'user';
export type Status = 'active' | 'inactive' | 'suspended' | 'banned';
export type FriendshipStatus = 'pending' | 'accepted' | 'rejected' | 'blocked';

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
    status: Status;
    lastLoginAt?: string;
    createdAt: string;
    updatedAt: string;
    role: Role;
    isOnline: boolean;
};
