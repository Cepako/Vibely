import { Static, Type } from '@sinclair/typebox';

export const LoginSchema = Type.Object({
    email: Type.String({ format: 'email', readOnly: true }),
    password: Type.String({ minLength: 8 }),
});

export type LoginBody = Static<typeof LoginSchema>;
