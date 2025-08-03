import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Post } from '../../../types/post';
import toast from 'react-hot-toast';
import { useAuth } from '../../auth/AuthProvider';

export interface CreatePostData {
    content: string;
    contentType: 'photo' | 'video' | 'album';
    privacyLevel: 'public' | 'friends' | 'private';
    file?: File | null;
}

export interface UpdatePostData {
    content?: string;
    contentType?: 'photo' | 'video' | 'album';
    privacyLevel?: 'public' | 'friends' | 'private';
    removeFile?: boolean;
    file?: File | null;
}

const postsApi = {
    async getPosts(profileId: number): Promise<Post[]> {
        const response = await fetch(`/api/post/${profileId}`, {
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error('Failed to fetch posts');
        }

        return response.json();
    },

    async createPost(
        data: CreatePostData
    ): Promise<{ message: string; post: Post }> {
        const formData = new FormData();
        formData.append('content', data.content);
        formData.append('contentType', data.contentType);
        formData.append('privacyLevel', data.privacyLevel);

        if (data.file) {
            formData.append('file', data.file);
        }

        const response = await fetch('/api/post/create', {
            method: 'POST',
            credentials: 'include',
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create post');
        }

        return response.json();
    },

    async updatePost(
        postId: number,
        data: UpdatePostData
    ): Promise<{ message: string; post: Post }> {
        const formData = new FormData();

        if (data.content !== undefined)
            formData.append('content', data.content);
        if (data.contentType !== undefined)
            formData.append('contentType', data.contentType);
        if (data.privacyLevel !== undefined)
            formData.append('privacyLevel', data.privacyLevel);
        if (data.removeFile !== undefined)
            formData.append('removeFile', data.removeFile.toString());

        if (data.file) {
            formData.append('file', data.file);
        }

        const response = await fetch(`/api/post/${postId}/edit`, {
            method: 'PUT',
            credentials: 'include',
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update post');
        }

        return response.json();
    },

    async deletePost(postId: number): Promise<{ message: string }> {
        const response = await fetch(`/api/post/${postId}`, {
            method: 'DELETE',
            credentials: 'include',
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete post');
        }

        return response.json();
    },
};

export const usePosts = (profileId: number) => {
    const { user } = useAuth();
    return useQuery({
        queryKey: ['posts', user?.id, profileId],
        queryFn: () => postsApi.getPosts(profileId),
        staleTime: 5 * 60 * 1000,
    });
};

export const useCreatePost = (profileId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: postsApi.createPost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts', profileId] });
            toast.success('Post created successfully!');
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
};

export const useUpdatePost = (profileId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            postId,
            data,
        }: {
            postId: number;
            data: UpdatePostData;
        }) => postsApi.updatePost(postId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts', profileId] });
            toast.success('Post updated successfully!');
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
};

export const useDeletePost = (profileId: number) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: postsApi.deletePost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts', profileId] });
            toast.success('Post deleted successfully!');
        },
        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
};
