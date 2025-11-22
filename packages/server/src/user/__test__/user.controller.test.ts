jest.mock('../../utils/env', () => ({
    ENV: { NODE_ENV: 'development' },
}));
jest.mock('../../db', () => ({ db: {} }));

import UserController from '../user.controller';
import UserService from '../user.service';
import { FastifyRequest, FastifyReply } from 'fastify';

jest.mock('../user.service');

describe('UserController', () => {
    let controller: UserController;
    let mockService: jest.Mocked<UserService>;
    let mockRequest: Partial<FastifyRequest>;
    let mockReply: Partial<FastifyReply>;
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
        consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        mockService = new UserService({} as any) as jest.Mocked<UserService>;
        controller = new UserController(mockService);

        mockRequest = {
            user: { id: 1 } as any,
            body: {},
            params: {},
            query: {},
            parts: jest.fn(),
        };

        mockReply = {
            code: jest.fn().mockReturnThis(),
            status: jest.fn().mockReturnThis(),
            send: jest.fn().mockReturnThis(),
        };
    });

    afterEach(() => {
        consoleSpy.mockRestore();
    });

    describe('me', () => {
        it('powinien zwrócić zalogowanego użytkownika (200)', async () => {
            const mockUser = { id: 1, email: 'me@test.com' } as any;
            mockService.findUserById.mockResolvedValue(mockUser);

            await controller.me(
                mockRequest as FastifyRequest,
                mockReply as FastifyReply
            );

            expect(mockService.findUserById).toHaveBeenCalledWith(1);
            expect(mockReply.status).toHaveBeenCalledWith(200);
            expect(mockReply.send).toHaveBeenCalledWith(mockUser);
        });

        it('powinien zwrócić 404, gdy user nie istnieje', async () => {
            mockService.findUserById.mockResolvedValue(null);

            await controller.me(
                mockRequest as FastifyRequest,
                mockReply as FastifyReply
            );

            expect(mockReply.status).toHaveBeenCalledWith(404);
        });
    });

    describe('registerUser', () => {
        it('powinien zarejestrować użytkownika (poprawne wywołanie)', async () => {
            const fields = {
                email: 'valid@email.com',
                password: 'StrongPassword1!',
                name: 'John',
                surname: 'Doe',
                gender: 'male' as const,
                dateOfBirth: '1990-01-01',
                interests: [],
            };

            const mockFile = {
                buffer: Buffer.from('img'),
                filename: 'test.png',
                mimetype: 'image/png',
            };

            mockService.createUser.mockResolvedValue(undefined);

            await controller.registerUser(
                fields,
                mockFile,
                mockReply as FastifyReply
            );

            expect(mockService.createUser).toHaveBeenCalled();
            expect(mockReply.code).toHaveBeenCalledWith(201);
            expect(mockReply.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'User registered successfully',
                })
            );
        });

        it('powinien zarejestrować użytkownika (bezpośrednie wywołanie)', async () => {
            const fields = {
                email: 'valid@email.com',
                password: 'StrongPassword1!',
                name: 'John',
                surname: 'Doe',
                gender: 'male' as const,
                dateOfBirth: '1990-01-01',
                interests: [],
            };

            mockService.createUser.mockResolvedValue(undefined);

            await controller.registerUser(
                fields,
                null, // brak pliku
                mockReply as FastifyReply
            );

            expect(mockService.createUser).toHaveBeenCalled();
            expect(mockReply.code).toHaveBeenCalledWith(201);
        });

        it('powinien zwrócić 400 przy błędzie walidacji (złe hasło)', async () => {
            const fields = {
                email: 'valid@email.com',
                password: 'weak', // Za słabe hasło
                name: 'John',
                surname: 'Doe',
                gender: 'male' as const,
                dateOfBirth: '1990-01-01',
            };

            await controller.registerUser(
                fields,
                null,
                mockReply as FastifyReply
            );

            expect(mockReply.code).toHaveBeenCalledWith(400);
            expect(mockReply.send).toHaveBeenCalledWith(
                expect.objectContaining({ message: 'Validation failed' })
            );
        });
    });

    describe('updateProfilePicture', () => {
        it('powinien zaktualizować zdjęcie (200)', async () => {
            mockRequest.params = { profileId: 1 }; // userId == profileId

            const filePart = {
                type: 'file',
                fieldname: 'profilePicture',
                filename: 'a.png',
                mimetype: 'image/png',
                toBuffer: jest.fn().mockResolvedValue(Buffer.from('ok')),
            };

            mockRequest.parts = jest.fn().mockReturnValue(
                (async function* () {
                    yield filePart;
                })()
            );

            mockService.updateProfilePicture.mockResolvedValue(undefined);

            await controller.updateProfilePicture(
                mockRequest as FastifyRequest<{ Params: any }>,
                mockReply as FastifyReply
            );

            expect(mockService.updateProfilePicture).toHaveBeenCalled();
            expect(mockReply.status).toHaveBeenCalledWith(200);
        });

        it('powinien zwrócić 403, jeśli próbuje edytować cudzy profil', async () => {
            mockRequest.user = { id: 1 } as any;
            mockRequest.params = { profileId: 2 };

            await controller.updateProfilePicture(
                mockRequest as FastifyRequest<{ Params: any }>,
                mockReply as FastifyReply
            );

            expect(mockReply.status).toHaveBeenCalledWith(403);
        });
    });

    describe('getProfile', () => {
        it('powinien zwrócić profil (200)', async () => {
            mockRequest.params = { profileId: 2 };
            mockService.getProfile.mockResolvedValue({
                id: 2,
                name: 'Bob',
            } as any);

            await controller.getProfile(
                mockRequest as FastifyRequest<{ Params: any }>,
                mockReply as FastifyReply
            );

            expect(mockService.getProfile).toHaveBeenCalledWith(2, 1);
            expect(mockReply.status).toHaveBeenCalledWith(200);
        });

        it('powinien obsłużyć błąd USER_BLOCKED (403)', async () => {
            mockRequest.params = { profileId: 2 };
            const error = new Error('Blocked');
            error.name = 'USER_BLOCKED';
            mockService.getProfile.mockRejectedValue(error);

            await controller.getProfile(
                mockRequest as FastifyRequest<{ Params: any }>,
                mockReply as FastifyReply
            );

            expect(mockReply.status).toHaveBeenCalledWith(403);
            expect(mockReply.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: 'Unable to view this profile',
                })
            );
        });
    });

    describe('editProfile', () => {
        it('powinien edytować profil (201)', async () => {
            mockRequest.params = { profileId: 1 }; // own profile
            mockRequest.body = { city: 'NY' };
            mockService.editProfile.mockResolvedValue(undefined);

            await controller.editProfile(
                mockRequest as FastifyRequest<{ Params: any; Body: any }>,
                mockReply as FastifyReply
            );

            expect(mockService.editProfile).toHaveBeenCalledWith(
                { city: 'NY' },
                1
            );
            expect(mockReply.code).toHaveBeenCalledWith(201);
        });

        it('powinien zabronić edycji cudzego profilu (403)', async () => {
            mockRequest.params = { profileId: 999 }; // not owner

            await controller.editProfile(
                mockRequest as FastifyRequest<{ Params: any; Body: any }>,
                mockReply as FastifyReply
            );

            expect(mockReply.status).toHaveBeenCalledWith(403);
        });
    });

    describe('changePassword', () => {
        it('powinien zmienić hasło (200)', async () => {
            mockRequest.body = {
                currentPassword: 'old',
                newPassword: 'NewPassword1!',
                confirmPassword: 'NewPassword1!',
            };
            mockService.changePassword.mockResolvedValue(undefined);

            await controller.changePassword(
                mockRequest as FastifyRequest<{ Body: any }>,
                mockReply as FastifyReply
            );

            expect(mockReply.status).toHaveBeenCalledWith(200);
        });

        it('powinien zwrócić 400 przy braku zgodności haseł', async () => {
            mockRequest.body = {
                currentPassword: 'old',
                newPassword: 'Pass1',
                confirmPassword: 'Pass2',
            };

            await controller.changePassword(
                mockRequest as FastifyRequest<{ Body: any }>,
                mockReply as FastifyReply
            );

            expect(mockReply.status).toHaveBeenCalledWith(400);
            expect(mockReply.send).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: expect.stringContaining('match'),
                })
            );
        });
    });
});
