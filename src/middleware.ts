import { redirect } from "@tanstack/react-router";
import { createMiddleware } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "./lib/auth";

export const authMiddleware = createMiddleware().server(async ({ next }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });
    if (!session) {
        throw redirect({ to: "/sign-in" });
    }

    return next({ context: { session } });
});

export const createProductMiddleware = createMiddleware().server(
    async ({ next }) => {
        const headers = getRequestHeaders();

        const hasPermission = await auth.api.userHasPermission({
            headers,
            body: { permissions: { product: ["create"] } },
        });
        if (!hasPermission.success) {
            throw redirect({ to: "/forbidden" });
        }

        return next();
    }
);

export const updateProductMiddleware = createMiddleware().server(
    async ({ next }) => {
        const headers = getRequestHeaders();

        const hasPermission = await auth.api.userHasPermission({
            headers,
            body: { permissions: { product: ["update"] } },
        });
        if (!hasPermission.success) {
            throw redirect({ to: "/forbidden", replace: true });
        }

        return next();
    }
);

export const archiveProductMiddleware = createMiddleware().server(
    async ({ next }) => {
        const headers = getRequestHeaders();

        const hasPermission = await auth.api.userHasPermission({
            headers,
            body: { permissions: { product: ["delete"] } },
        });
        if (!hasPermission.success) {
            throw new Error("You do not have permission to archive products");
        }

        return next();
    }
);
