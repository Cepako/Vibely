import { Type, Static } from '@sinclair/typebox';

export const GenderSchema = Type.Union([
    Type.Literal('male'),
    Type.Literal('female'),
]);

export type Gender = Static<typeof GenderSchema>;

export const RegisterUserSchema = Type.Object({
    email: Type.String({ format: 'email' }),
    password: Type.String({
        minLength: 8,
        pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^\\w\\s]).+$',
    }),
    name: Type.String(),
    surname: Type.String(),
    gender: GenderSchema,
    profilePictureUrl: Type.Optional(Type.String()),
    bio: Type.Optional(Type.String()),
    city: Type.Optional(Type.String()),
    region: Type.Optional(Type.String()),
    dateOfBirth: Type.String(),
    interests: Type.Optional(Type.Array(Type.Number())),
});

export type RegisterUser = Static<typeof RegisterUserSchema>;
