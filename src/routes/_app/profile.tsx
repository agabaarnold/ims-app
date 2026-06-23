import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/profile")({
    component: ProfilePage,
});

function ProfilePage() {
    return <div>Hello "/_app/profile"!</div>;
}
