import UserService from '../user.service';
import { db } from '../../db';
import bcrypt from 'bcrypt';
import { handleFileUpload } from '../../utils/handleFileUpload';
import { deleteFile } from '../../utils/deleteFile';

jest.mock('../../friendship/friendship.service');
jest.mock('bcrypt');
jest.mock('../../utils/handleFileUpload');
jest.mock('../../utils/deleteFile');

jest.mock('../../db', () => ({
    db: {
        query: {
            users: { findFirst: jest.fn() },
            friendships: { findFirst: jest.fn() },
            userInterests: { findMany: jest.fn() },
            interests: { findMany: jest.fn() },
        },
        insert: jest.fn(() => ({ values: jest.fn() })),
        update: jest.fn(() => ({
            set: jest.fn(() => ({ where: jest.fn() })),
        })),
        delete: jest.fn(() => ({ where: jest.fn() })),
    },
}));

describe('UserService', () => {
    let service: UserService;
    let mockFriendshipService: any;
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        mockFriendshipService = {
            getFriendshipStatus: jest.fn(),
        };

        service = new UserService(mockFriendshipService);
    });

    afterEach(() => {
        consoleSpy.mockRestore();
    });

    describe('createUser', () => {
        const userData = {
            email: 'test@test.com',
            password: 'Password123!',
            name: 'John',
            surname: 'Doe',
            gender: 'male' as const,
            dateOfBirth: '1990-01-01',
            interests: [1, 2],
        };

        it('powinien utworzyć użytkownika (hash hasła + insert)', async () => {
            (db.query.users.findFirst as jest.Mock)
                .mockResolvedValueOnce(null)
                .mockResolvedValueOnce({ id: 1 });

            (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_pass');

            await service.createUser(userData);

            expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
            expect(db.insert).toHaveBeenCalledTimes(2);
        });

        it('powinien rzucić błąd, gdy email jest zajęty', async () => {
            (db.query.users.findFirst as jest.Mock).mockResolvedValue({
                id: 1,
            });

            await expect(service.createUser(userData)).rejects.toThrow(
                'Email is already registered'
            );
        });
    });

    describe('getProfile', () => {
        const profileId = 2;
        const viewerId = 1;

        it('powinien zwrócić profil z danymi dodatkowymi', async () => {
            const mockUser = { id: profileId, name: 'Alice' };
            (db.query.users.findFirst as jest.Mock).mockResolvedValue(mockUser);

            (db.query.friendships.findFirst as jest.Mock).mockResolvedValue(
                null
            ); // Not blocked

            mockFriendshipService.getFriendshipStatus.mockResolvedValue(
                'friends'
            );

            (db.query.userInterests.findMany as jest.Mock).mockResolvedValue([
                { interestId: 10 },
            ]);
            (db.query.interests.findMany as jest.Mock).mockResolvedValue([
                { id: 10, name: 'Tech' },
            ]);

            const result = await service.getProfile(profileId, viewerId);

            expect(result).toMatchObject({
                id: profileId,
                friendshipStatus: 'friends',
                interests: expect.arrayContaining([{ id: 10, name: 'Tech' }]),
            });
        });

        it('powinien rzucić błąd USER_BLOCKED jeśli viewer jest zablokowany', async () => {
            (db.query.users.findFirst as jest.Mock).mockResolvedValue({
                id: profileId,
            });
            (db.query.friendships.findFirst as jest.Mock).mockResolvedValue({
                status: 'blocked',
            });

            await expect(
                service.getProfile(profileId, viewerId)
            ).rejects.toThrow('Unable to view this profile');
        });
    });

    describe('updateProfilePicture', () => {
        it('powinien przesłać nowy plik i usunąć stary', async () => {
            const userId = 1;
            const mockFile = {
                buffer: Buffer.from(''),
                filename: 'a.png',
                mimetype: 'image/png',
            };
            const oldUser = { id: 1, profilePictureUrl: 'old_url.png' };

            (db.query.users.findFirst as jest.Mock).mockResolvedValue(oldUser);
            (handleFileUpload as jest.Mock).mockResolvedValue('new_url.png');

            await service.updateProfilePicture(userId, mockFile);

            expect(handleFileUpload).toHaveBeenCalledWith(
                mockFile,
                expect.objectContaining({ oldFileUrl: 'old_url.png' })
            );
            expect(db.update).toHaveBeenCalled();
        });

        it('powinien usunąć plik, jeśli przekazano null (brak nowego zdjęcia)', async () => {
            const userId = 1;
            const oldUser = { id: 1, profilePictureUrl: 'old_url.png' };
            (db.query.users.findFirst as jest.Mock).mockResolvedValue(oldUser);

            await service.updateProfilePicture(userId, null);

            expect(deleteFile).toHaveBeenCalledWith('old_url.png');
            expect(db.update).toHaveBeenCalled();
        });
    });

    describe('changePassword', () => {
        it('powinien zmienić hasło przy poprawnym starym haśle', async () => {
            const userId = 1;
            (db.query.users.findFirst as jest.Mock).mockResolvedValue({
                id: 1,
                password: 'hashed_old',
            });
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_new');

            await service.changePassword(userId, 'old', 'new');

            expect(db.update).toHaveBeenCalled();
        });

        it('powinien rzucić błąd przy niepoprawnym starym haśle', async () => {
            (db.query.users.findFirst as jest.Mock).mockResolvedValue({
                id: 1,
                password: 'hashed_old',
            });
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(
                service.changePassword(1, 'wrong', 'new')
            ).rejects.toThrow('Current password is incorrect');
        });
    });

    describe('editProfile', () => {
        it('powinien zaktualizować dane profilu i zainteresowania', async () => {
            const data = {
                city: 'Waw',
                region: 'Maz',
                bio: 'Hi',
                interests: [1, 2],
            };

            await service.editProfile(data, 1);

            expect(db.update).toHaveBeenCalled();
            expect(db.delete).toHaveBeenCalled();
            expect(db.insert).toHaveBeenCalled();
        });
    });
});
