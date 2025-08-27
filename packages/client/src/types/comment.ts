import { type User } from './user';

export interface CommentReaction {
    id: number;
    commentId: number;
    userId: number;
    user: User;
    createdAt?: string;
}

export interface Comment {
    id: number;
    postId: number;
    userId: number;
    content: string;
    parentId: number | null;
    createdAt: string | null;
    updatedAt: string | null;
    user: User;
    replies: Comment[];
    likeCount: number;
    isLiked: boolean;
    commentReactions?: CommentReaction[];
}

export interface CreateCommentData {
    content: string;
    parentId?: number;
}

export interface CommentLikeInfo {
    count: number;
    isLiked: boolean;
    users: User[];
}
