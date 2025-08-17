import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { Type } from '@sinclair/typebox';
import { CommentReactionController } from './commentReaction.controller';
import { CommentReactionService } from './commentReaction.service';
import { AuthService } from '../auth/auth.service';
import { createAuthGuard } from '../hooks/authGuard';

export async function commentReactionRoutes(fastify: FastifyInstance) {
    const authService = new AuthService();
    const commentReactionService = new CommentReactionService();
    const commentReactionController = new CommentReactionController(
        commentReactionService
    );

    const authGuard = createAuthGuard(authService);

    fastify.addHook('preHandler', authGuard);

    fastify.post(
        '/posts/:postId/comments',
        {
            schema: {
                params: Type.Object({
                    postId: Type.Number(),
                }),
                body: Type.Object({
                    content: Type.String({ minLength: 1, maxLength: 1000 }),
                    parentId: Type.Optional(Type.Number()),
                }),
            },
        },
        async (
            req: FastifyRequest<{
                Params: { postId: number };
                Body: { content: string; parentId?: number };
            }>,
            reply: FastifyReply
        ) => {
            const commentData = {
                postId: req.params.postId,
                content: req.body.content,
                parentId: req.body.parentId,
            };

            req.body = commentData as any;
            return commentReactionController.createComment(req as any, reply);
        }
    );

    fastify.get(
        '/posts/:postId/comments',
        {
            schema: {
                params: Type.Object({
                    postId: Type.Number(),
                }),
            },
        },
        async (
            req: FastifyRequest<{
                Params: { postId: number };
            }>,
            reply: FastifyReply
        ) => commentReactionController.getPostComments(req, reply)
    );

    fastify.put(
        '/comments/:commentId',
        {
            schema: {
                params: Type.Object({
                    commentId: Type.Number(),
                }),
                body: Type.Object({
                    content: Type.String({ minLength: 1, maxLength: 1000 }),
                }),
            },
        },
        async (
            req: FastifyRequest<{
                Params: { commentId: number };
                Body: { content: string };
            }>,
            reply: FastifyReply
        ) => commentReactionController.updateComment(req, reply)
    );

    fastify.delete(
        '/comments/:commentId',
        {
            schema: {
                params: Type.Object({
                    commentId: Type.Number(),
                }),
            },
        },
        async (
            req: FastifyRequest<{
                Params: { commentId: number };
            }>,
            reply: FastifyReply
        ) => commentReactionController.deleteComment(req, reply)
    );

    fastify.post(
        '/comments/:commentId/like',
        {
            schema: {
                params: Type.Object({
                    commentId: Type.Number(),
                }),
            },
        },
        async (
            req: FastifyRequest<{
                Params: { commentId: number };
            }>,
            reply: FastifyReply
        ) => commentReactionController.toggleCommentLike(req, reply)
    );

    fastify.get(
        '/comments/:commentId/likes',
        {
            schema: {
                params: Type.Object({
                    commentId: Type.Number(),
                }),
            },
        },
        async (
            req: FastifyRequest<{
                Params: { commentId: number };
            }>,
            reply: FastifyReply
        ) => commentReactionController.getCommentLikeInfo(req, reply)
    );

    fastify.post(
        '/posts/:postId/like',
        {
            schema: {
                params: Type.Object({
                    postId: Type.Number(),
                }),
            },
        },
        async (
            req: FastifyRequest<{
                Params: { postId: number };
            }>,
            reply: FastifyReply
        ) => commentReactionController.togglePostLike(req, reply)
    );

    fastify.get(
        '/posts/:postId/likes',
        {
            schema: {
                params: Type.Object({
                    postId: Type.Number(),
                }),
            },
        },
        async (
            req: FastifyRequest<{
                Params: { postId: number };
            }>,
            reply: FastifyReply
        ) => commentReactionController.getPostLikeInfo(req, reply)
    );
}
