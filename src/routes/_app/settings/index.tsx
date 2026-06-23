import { createFileRoute } from "@tanstack/react-router";
import ActiveSessionsCard from "#/features/settings/components/active-sessions-card";
import ChangePasswordCard from "#/features/settings/components/change-password-card";
import DangerZoneCard from "#/features/settings/components/danger-zone-card";

export const Route = createFileRoute("/_app/settings/")({
    component: SettingsPage,
});

function SettingsPage() {
    return (
        <div className="mx-auto w-full max-w-2xl space-y-6 p-4 md:p-6">
            <div>
                <h1 className="font-semibold text-2xl tracking-tight md:text-3xl">
                    Settings
                </h1>
                <p className="mt-1 text-muted-foreground text-sm">
                    Manage your security and appearance preferences.
                </p>
            </div>

            <ChangePasswordCard />
            <ActiveSessionsCard />
            <DangerZoneCard />
        </div>
    );
}
