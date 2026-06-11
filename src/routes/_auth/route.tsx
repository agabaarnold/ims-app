import { createFileRoute, redirect } from "@tanstack/react-router";
import { getUserSession } from "#/features/auth/functions";

export const Route = createFileRoute("/_auth")({
    beforeLoad: async () => {
        const session = await getUserSession();
        if (session) {
            throw redirect({ to: "/" });
        }
    },
});
