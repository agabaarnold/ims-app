import { IconAlertHexagon, IconArrowLeft, IconHome } from "@tabler/icons-react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Button } from "#/components/ui/button";

export const Route = createFileRoute("/forbidden")({
    component: ForbiddenPage,
});

function ForbiddenPage() {
    const router = useRouter();

    return (
        <main className="min-h-screen px-4 py-10 text-primary">
            <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center justify-center">
                <div className="flex items-center justify-center">
                    <section className="flex flex-col items-center justify-center space-y-6 text-center">
                        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border px-3 py-1 text-muted-foreground text-sm shadow-sm backdrop-blur">
                            <IconAlertHexagon className="size-4" />
                            Access restricted
                        </div>

                        <div className="flex flex-col items-center justify-center space-y-3 md:w-2/3">
                            <h1 className="font-semibold text-4xl tracking-tight sm:text-5xl">
                                Access Denied
                            </h1>
                            <p className="max-w-xl text-base text-muted-foreground leading-7 sm:text-lg">
                                You do not have permission to view this page.
                                Please contact your administrator if you believe
                                this is a mistake.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Button
                                render={
                                    <Link to="/">
                                        <IconHome className="mr-2 size-4" />
                                        Go to dashboard
                                    </Link>
                                }
                                size="lg"
                            />

                            <Button
                                onClick={() => {
                                    if (router.history.length > 1) {
                                        router.history.back();
                                    } else {
                                        router.navigate({ to: "/" });
                                    }
                                }}
                                size="lg"
                                variant="outline"
                            >
                                <IconArrowLeft className="mr-2 size-4" />
                                Go back
                            </Button>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}
