import { createFileRoute } from "@tanstack/react-router";
import EmailChangeCard from "#/features/profile/components/email-change-card";
import ProfileForm from "#/features/profile/components/profile-form";
import { authClient } from "#/lib/auth-client";

export const Route = createFileRoute("/_app/profile/")({
    component: ProfilePage,
});

function ProfilePage() {
    const { data: session, isPending } = authClient.useSession();

    if (isPending || !session) {
        return <p className="p-6 text-muted-foreground">Loading…</p>;
    }

    return (
        <div className="mx-auto w-full max-w-2xl space-y-6 p-4 md:p-6">
            <div>
                <h1 className="font-semibold text-2xl tracking-tight md:text-3xl">
                    Profile
                </h1>
                <p className="mt-1 text-muted-foreground text-sm">
                    Manage your personal information.
                </p>
            </div>

            <ProfileForm user={session.user} />
            <EmailChangeCard
                currentEmail={session.user.email}
                emailVerified={session.user.emailVerified}
            />
        </div>
    );
}
