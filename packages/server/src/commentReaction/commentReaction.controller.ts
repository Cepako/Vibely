import { FastifyReply, FastifyRequest } from 'fastify';
import {
    CommentReactionService,
    CreateCommentData,
} from './commentReaction.service';

export class CommentReactionController {
    private commentReactionService: CommentReactionService;

    constructor(commentReactionService: CommentReactionService) {
        this.commentReactionService = commentReactionService;
    }

    async createComment(
        req: FastifyRequest<{
            Body: CreateCommentData;
        }>,
        reply: FastifyReply
    ) {
        try {
            const { id: userId } = req.user;
            const commentData = req.body;

            const comment = await this.commentReactionService.createComment(
                userId,
                commentData
            );

            return reply.status(201).send({
                message: 'Comment created successfully',
                comment,
            });
        } catch (error: any) {
            if (error.message.includes('not found')) {
                return reply.status(404).send({
                    error: error.message,
                });
            }
            return reply.status(500).send({
                error: error.message || 'Failed to create comment',
            });
        }
    }

    async getPostComments(
        req: FastifyRequest<{
            Params: { postId: number };
        }>,
        reply: FastifyReply
    ) {
        try {
            const { postId } = req.params;
            const { id: userId } = req.user;

            const comments = await this.commentReactionService.getPostComments(
                postId,
                userId
            );

            return reply.status(200).send(comments);
        } catch (error: any) {
            return reply.status(500).send({
                error: error.message || 'Failed to fetch comments',
            });
        }
    }

    async deleteComment(
        req: FastifyRequest<{
            Params: { commentId: number };
        }>,
        reply: FastifyReply
    ) {
        try {
            const { id: userId } = req.user;
            const { commentId } = req.params;

            await this.commentReactionService.deleteComment(userId, commentId);

            return reply.status(200).send({
                message: 'Comment deleted successfully',
            });
        } catch (error: any) {
            if (
                error.message.includes('not found') ||
                error.message.includes('unauthorized')
            ) {
                return reply.status(404).send({
                    error: error.message,
                });
            }
            return reply.status(500).send({
                error: error.message || 'Failed to delete comment',
            });
        }
    }

    async updateComment(
        req: FastifyRequest<{
            Params: { commentId: number };
            Body: { content: string };
        }>,
        reply: FastifyReply
    ) {
        try {
            const { id: userId } = req.user;
            const { commentId } = req.params;
            const { content } = req.body;

            const updatedComment =
                await this.commentReactionService.updateComment(
                    userId,
                    commentId,
                    content
                );

            return reply.status(200).send({
                message: 'Comment updated successfully',
                comment: updatedComment,
            });
        } catch (error: any) {
            if (
                error.message.includes('not found') ||
                error.message.includes('unauthorized')
            ) {
                return reply.status(404).send({
                    error: error.message,
                });
            }
            return reply.status(500).send({
                error: error.message || 'Failed to update comment',
            });
        }
    }

    async toggleCommentLike(
        req: FastifyRequest<{
            Params: { commentId: number };
        }>,
        reply: FastifyReply
    ) {
        try {
            const { id: userId } = req.user;
            const { commentId } = req.params;

            const result = await this.commentReactionService.toggleCommentLike(
                userId,
                commentId
            );

            return reply.status(200).send({
                message: result.liked ? 'Comment liked' : 'Comment unliked',
                liked: result.liked,
            });
        } catch (error: any) {
            if (error.message.includes('not found')) {
                return reply.status(404).send({
                    error: error.message,
                });
            }
            return reply.status(500).send({
                error: error.message || 'Failed to toggle comment like',
            });
        }
    }

    async getCommentLikeInfo(
        req: FastifyRequest<{
            Params: { commentId: number };
        }>,
        reply: FastifyReply
    ) {
        try {
            const { id: userId } = req.user;
            const { commentId } = req.params;

            const likeInfo =
                await this.commentReactionService.getCommentLikeInfo(
                    commentId,
                    userId
                );

            return reply.status(200).send(likeInfo);
        } catch (error: any) {
            return reply.status(500).send({
                error: error.message || 'Failed to get comment like info',
            });
        }
    }

    async togglePostLike(
        req: FastifyRequest<{
            Params: { postId: number };
        }>,
        reply: FastifyReply
    ) {
        try {
            const { id: userId } = req.user;
            const { postId } = req.params;

            const result = await this.commentReactionService.togglePostLike(
                userId,
                postId
            );

            return reply.status(200).send({
                message: result.liked ? 'Post liked' : 'Post unliked',
                liked: result.liked,
            });
        } catch (error: any) {
            if (error.message.includes('not found')) {
                return reply.status(404).send({
                    error: error.message,
                });
            }
            return reply.status(500).send({
                error: error.message || 'Failed to toggle like',
            });
        }
    }

    async getPostLikeInfo(
        req: FastifyRequest<{
            Params: { postId: number };
        }>,
        reply: FastifyReply
    ) {
        try {
            const { id: userId } = req.user;
            const { postId } = req.params;

            const likeInfo = await this.commentReactionService.getPostLikeInfo(
                postId,
                userId
            );

            return reply.status(200).send(likeInfo);
        } catch (error: any) {
            return reply.status(500).send({
                error: error.message || 'Failed to get like info',
            });
        }
    }
}
