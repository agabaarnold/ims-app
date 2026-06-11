import { IconAlertTriangle, IconChevronDown } from "@tabler/icons-react";
import { type ErrorComponentProps, useRouter } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { Button } from "../ui/button";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "../ui/collapsible";
import { Spinner } from "../ui/spinner";

export default function DefaultErrorBoundary({
    error,
    reset,
    info,
}: ErrorComponentProps) {
    const router = useRouter();

    const [detailsOpen, setDetailsOpen] = useState(false);
    const [isRetrying, setIsRetrying] = useState(false);

    const isDev = process.env.NODE_ENV === "development";
    const rawMessage = error instanceof Error ? error.message : String(error);
    const message = isDev
        ? rawMessage
        : "An unexpected error occurred. Please try again.";

    const handleRetry = useCallback(async () => {
        setIsRetrying(true);

        try {
            await router.invalidate();
            reset();
        } finally {
            setIsRetrying(false);
        }
    }, [reset, router]);

    const componentStack = info?.componentStack;

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4">
            {/* Subtle noise / grid backdrop */}
            <div
                aria-hidden="true"
                className="mask-[radial-gradient(ellipse_80%_60%_at_50%_50%,black_30%,transparent_100%)] pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-size-[4rem_4rem] opacity-40"
            />

            <div className="relative z-10 flex w-full max-w-lg flex-col gap-8">
                {/* Header */}
                <div className="flex flex-col items-center gap-5 text-center">
                    <div className="flex size-20 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/10 shadow-lg">
                        <IconAlertTriangle
                            className="size-9 text-destructive"
                            strokeWidth={1.5}
                        />
                    </div>

                    <div className="flex flex-col gap-3">
                        <p className="font-medium text-muted-foreground text-sm uppercase tracking-widest">
                            Something went wrong
                        </p>

                        <h1 className="font-semibold text-3xl text-foreground tracking-tight">
                            Unexpected error
                        </h1>

                        <p className="text-base text-muted-foreground leading-relaxed">
                            An error occurred while rendering this page. You can
                            retry, or reload the page if the problem persists.
                        </p>
                    </div>
                </div>

                {/* Error message pill */}
                {message && (
                    <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3">
                        <p className="wrap-break-word font-mono text-destructive text-sm">
                            {message}
                        </p>
                    </div>
                )}

                {/* Stack trace - dev only */}
                {isDev && componentStack && (
                    <Collapsible
                        onOpenChange={setDetailsOpen}
                        open={detailsOpen}
                    >
                        <CollapsibleTrigger
                            render={
                                <Button type="button" variant="outline">
                                    <span className="font-medium">
                                        Stack trace
                                    </span>
                                    <IconChevronDown
                                        className={`size-4 shrink-0 transition-transform duration-200 ${detailsOpen ? "rotate-180" : ""}`}
                                    />
                                </Button>
                            }
                        />

                        <CollapsibleContent>
                            <div className="mt-1 max-h-60 overflow-auto rounded-md border border-border bg-muted/30 p-4">
                                <pre className="whitespace-pre-wrap break-all font-mono text-muted-foreground text-xs leading-relaxed">
                                    {componentStack}
                                </pre>
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-center gap-3">
                    <Button
                        onClick={() => router.navigate({ to: "." })}
                        size="sm"
                        variant="outline"
                    >
                        Reload page
                    </Button>

                    <Button
                        className="gap-2"
                        disabled={isRetrying}
                        onClick={handleRetry}
                        size="sm"
                    >
                        {isRetrying && <Spinner />}
                        {isRetrying ? "Retrying..." : "Try again"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
