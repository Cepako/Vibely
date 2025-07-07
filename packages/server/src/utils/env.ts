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
};

if (!validate(env)) {
    throw new Error(
        `Invalid environment variables:\n${ajv.errorsText(validate.errors)}`
    );
}

export const ENV: Env = env as Env;
