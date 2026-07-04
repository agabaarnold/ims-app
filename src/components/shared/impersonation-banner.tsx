import { IconUserOff } from "@tabler/icons-react";
import { toast } from "react-hot-toast";
import { authClient } from "#/lib/auth-client";

const adminClient = authClient.admin;

export default function ImpersonationBanner() {
    const { data: session, refetch } = authClient.useSession();

    const impersonatedBy = session?.session?.impersonatedBy;
    if (!impersonatedBy) {
        return null;
    }

    const handleStop = async () => {
        try {
            const { error } = await adminClient.stopImpersonating();
            if (error) {
                throw new Error(error.message);
            }
            await refetch();
            toast.success("Returned to your account");
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Failed to stop impersonation"
            );
        }
    };

    return (
        <div className="flex items-center justify-between gap-4 bg-amber-500 px-4 py-2 font-medium text-amber-950 text-sm">
            <span>
                You are viewing as{" "}
                <strong className="font-semibold">{session?.user.name}</strong>{" "}
                ({session?.user.email})
            </span>

            <button
                className="flex items-center gap-1.5 rounded-md bg-amber-950/10 px-3 py-1 transition-colors hover:bg-amber-950/20"
                onClick={handleStop}
                type="button"
            >
                <IconUserOff className="size-4" />
                Stop impersonating
            </button>
        </div>
    );
}
