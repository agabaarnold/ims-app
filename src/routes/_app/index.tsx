import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/")({
    component: DashboardPage,
});

function DashboardPage() {
    return <div>Hello "/_app/"!</div>;
}
