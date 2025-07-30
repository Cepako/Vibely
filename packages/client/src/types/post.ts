export type PrivacyLevel = 'public' | 'friends' | 'private';
export type ContentType = 'photo' | 'video' | 'album';
export type PostReaction = {
    id: number;
    postId: number;
    userId: number;
    createdAt: string;
};
export type Comment = {
    id: number;
    postId: number;
    userId: number;
    content: string;
    createdAt: string;
    updatedAt: string;
};
export type UserInfo = {
    id: number;
    firstName: string;
    lastName: string;
    profilePictureUrl?: string | null;
};
export type Post = {
    id: number;
    userId: number;
    content: string;
    contentType: ContentType;
    privacyLevel: PrivacyLevel;
    contentUrl?: string | null;
    createdAt: string;
    updatedAt: string;
    user: UserInfo;
    comments: Array<Comment & { user: UserInfo }>;
    postReactions: Array<PostReaction & { user: UserInfo }>;
};
