import 'dotenv/config';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { Type, Static } from '@sinclair/typebox';

const EnvSchema = Type.Object({
    NODE_ENV: Type.Union([
        Type.Literal('development'),
        Type.Literal('production'),
    ]),
    DATABASE_URL: Type.String({ format: 'uri' }),
    PORT: Type.Optional(Type.Number()),
    JWT_SECRET: Type.String(),
    JWT_ACCESS_EXPIERS: Type.String(),
    COOKIE_SECRET: Type.String(),
    JWT_REFRESH_SECRET: Type.String(),
    JWT_REFRESH_EXPIRES: Type.String(),
});

export type Env = Static<typeof EnvSchema>;

const ajv = new Ajv({ allErrors: true, useDefaults: true });
addFormats(ajv);
const validate = ajv.compile(EnvSchema);

const env = {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    PORT: process.env.PORT ? Number(process.env.PORT) : undefined,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_ACCESS_EXPIERS: process.env.JWT_ACCESS_EXPIERS,
    COOKIE_SECRET: process.env.COOKIE_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES,
};

if (!validate(env)) {
    throw new Error(
        `Invalid environment variables:\n${ajv.errorsText(validate.errors)}`
    );
}

export const ENV: Env = env as Env;
