import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import AppHeader from "#/components/shared/app-header";
import AppSidebar from "#/components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "#/components/ui/sidebar";
import { getUserSession } from "#/features/auth/functions";

export const Route = createFileRoute("/_app")({
    beforeLoad: async ({ location }) => {
        const session = await getUserSession();
        if (!session) {
            throw redirect({
                to: "/sign-in",
                search: { redirect: location.pathname },
            });
        }

        return { session };
    },
    component: AppLayout,
});

function AppLayout() {
    return (
        <SidebarProvider>
            <AppSidebar />

            <SidebarInset>
                <AppHeader />

                <main className="flex-1 px-8 py-4">
                    <Outlet />
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}
