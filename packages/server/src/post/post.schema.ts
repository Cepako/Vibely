import { Static, Type } from '@sinclair/typebox';

export const PrivacyLevelSchema = Type.Union([
    Type.Literal('public'),
    Type.Literal('friends'),
    Type.Literal('private'),
]);

export type PrivacyLevel = Static<typeof PrivacyLevelSchema>;

export const ContentTypeSchema = Type.Union([
    Type.Literal('photo'),
    Type.Literal('video'),
    Type.Literal('album'),
]);

export type ContentType = Static<typeof ContentTypeSchema>;
