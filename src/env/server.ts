import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const serverEnv = createEnv({
    server: {
        DATABASE_URL: z.url(),
        NODE_ENV: z.enum(["development", "production"]).default("production"),
        BETTER_AUTH_SECRET: z.string(),
        BETTER_AUTH_URL: z.url(),
        GITHUB_CLIENT_ID: z.string(),
        GITHUB_CLIENT_SECRET: z.string(),
        GOOGLE_CLIENT_ID: z.string(),
        GOOGLE_CLIENT_SECRET: z.string(),
        SMTP_HOST: z.string(),
        SMTP_PORT: z.coerce.number(),
        SMTP_USER: z.string(),
        SMTP_PASS: z.string(),
        SMTP_FROM: z.string().min(1),
    },
    runtimeEnv: process.env,
    emptyStringAsUndefined: true,
});
