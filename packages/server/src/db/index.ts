import { drizzle } from 'drizzle-orm/postgres-js';
import { ENV } from '@/utils/env';
import { userPhotos, users } from './schema';

export const db = drizzle(ENV.DATABASE_URL, {
    schema: {
        users,
        userPhotos, //TODO: Add all etities
    },
});
