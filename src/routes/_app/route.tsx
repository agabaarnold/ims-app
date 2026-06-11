import { createFileRoute, redirect } from "@tanstack/react-router";
import { getUserSession } from "#/features/auth/functions";

export const Route = createFileRoute("/_app")({
    beforeLoad: async ({ location }) => {
        const session = await getUserSession();
        if (!session) {
            throw redirect({
                to: "/sign-in",
                search: { redirect: location.href },
            });
        }

        return { session };
    },
    component: AppLayout,
});

function AppLayout() {
    return <div>Hello "/_app"!</div>;
}
