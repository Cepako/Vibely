import { Static, Type } from '@sinclair/typebox';

export const LoginSchema = Type.Object({
    email: Type.String({ format: 'email', readOnly: true }),
    password: Type.String({ minLength: 8 }),
});

export type LoginBody = Static<typeof LoginSchema>;

export const PayloadSchema = Type.Object({
    id: Type.Number(),
    email: Type.String(),
});

export type Payload = Static<typeof PayloadSchema>;
