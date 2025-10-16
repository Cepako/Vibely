import { type User } from './user';

export type ContentType = 'photo' | 'video';
export type PrivacyLevel = 'public' | 'friends' | 'private';

export interface PostReaction {
    id: number;
    postId: number;
    userId: number;
    createdAt: string;
    user: User;
}

export interface Comment {
    id: number;
    postId: number;
    userId: number;
    content: string;
    createdAt: string;
}

export interface Post {
    id: number;
    userId: number;
    content: string;
    contentType: ContentType;
    privacyLevel: PrivacyLevel;
    createdAt: string;
    updatedAt: string;
    contentUrl: string;
    user: User;
    postReactions: PostReaction[];
    comments: Comment[];
}
