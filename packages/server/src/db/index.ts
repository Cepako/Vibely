import { drizzle } from 'drizzle-orm/postgres-js';
import { ENV } from '../utils/env';
import * as schema from './schema';
import * as relations from './relations';

export const db = drizzle(ENV.DATABASE_URL, {
    schema: {
        ...schema,
        ...relations,
    },
});
