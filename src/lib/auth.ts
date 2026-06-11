/** biome-ignore-all lint/suspicious/useAwait: Ignore */
/** biome-ignore-all lint/complexity/noVoid: It is intentional */

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, lastLoginMethod } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { serverEnv } from "#/env/server";
import { sendAuthEmail } from "#/features/email/functions";
import { prisma } from "./db";
import { ac, roles } from "./permissions";

export const auth = betterAuth({
    database: prismaAdapter(prisma, { provider: "postgresql" }),
    emailAndPassword: {
        enabled: true,
        revokeSessionsOnPasswordReset: true,
        resetPasswordTokenExpiresIn: 1800,
        sendResetPassword: async ({ url, user }) => {
            void sendAuthEmail({
                kind: "password-reset",
                to: user.email,
                url,
                expiresInMinutes: 30,
                name: user.name ?? null,
            });
        },
    },
    emailVerification: {
        sendOnSignUp: true,
        sendVerificationEmail: async ({ user, url }) => {
            void sendAuthEmail({
                kind: "email-verification",
                to: user.email,
                url,
                expiresInMinutes: 60,
                name: user.name ?? null,
            });
        },
        expiresIn: 3600,
    },
    socialProviders: {
        github: {
            clientId: serverEnv.GITHUB_CLIENT_ID,
            clientSecret: serverEnv.GITHUB_CLIENT_SECRET,
        },
        google: {
            clientId: serverEnv.GOOGLE_CLIENT_ID,
            clientSecret: serverEnv.GOOGLE_CLIENT_SECRET,
            prompt: "select_account",
        },
    },
    user: { deleteUser: { enabled: true } },
    plugins: [
        admin({ ac, roles, defaultRole: "staff", adminRoles: ["admin"] }),
        lastLoginMethod(),
        tanstackStartCookies(),
    ],
});

export type Session = typeof auth.$Infer.Session;
