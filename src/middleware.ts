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
        if (!hasPermission) {
            throw new Error(
                "You do not have permission to create a product. Please contact your administrator."
            );
        }

        return next();
    }
);
