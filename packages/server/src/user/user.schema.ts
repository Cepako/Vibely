import { Type, Static } from '@sinclair/typebox';

export const GenderSchema = Type.Union([
    Type.Literal('male'),
    Type.Literal('female'),
]);

export type Gender = Static<typeof GenderSchema>;

export const StatusSchema = Type.Union([
    Type.Literal('active'),
    Type.Literal('inactive'),
    Type.Literal('suspended'),
    Type.Literal('banned'),
]);

export type UserStatus = Static<typeof StatusSchema>;

export const RoleSchema = Type.Union([
    Type.Literal('admin'),
    Type.Literal('user'),
]);

export type Role = Static<typeof RoleSchema>;

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
});

export type RegisterUser = Static<typeof RegisterUserSchema>;
