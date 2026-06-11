import { IconArrowLeft, IconCompass, IconHome } from "@tabler/icons-react";
import { Link, useRouter } from "@tanstack/react-router";
import { Button, buttonVariants } from "../ui/button";

function DefaultNotFound() {
    const router = useRouter();

    return (
        <div className="relative flex h-screen flex-col items-center justify-center overflow-hidden px-4">
            <div
                aria-hidden="true"
                className="mask-[radial-gradient(ellipse_80%_60%_at_50%_50%,black_30%,transparent_100%)] pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-size-[4rem_4rem] opacity-40"
            />

            <div className="flex max-w-md flex-col items-center gap-8 text-center">
                <div className="flex size-20 items-center justify-center rounded-2xl border border-border bg-muted shadow-lg">
                    <IconCompass
                        className="size-9 text-muted-foreground"
                        strokeWidth={1.5}
                    />
                </div>

                <div className="flex flex-col gap-3">
                    <p className="font-medium text-muted-foreground text-sm uppercase tracking-widest">
                        404 - Page not found
                    </p>

                    <h1 className="font-semibold text-4xl text-foreground tracking-tight">
                        Lost in the void
                    </h1>

                    <p className="text-base text-muted-foreground leading-relaxed">
                        The page you're looking for doesn't exist or may have
                        been moved. Double-check the URL, or head back somewhere
                        familiar.
                    </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3">
                    <Button
                        className="gap-2"
                        onClick={() => router.history.back()}
                        size="sm"
                        variant="outline"
                    >
                        <IconArrowLeft className="size-4" /> Go back
                    </Button>

                    <Link
                        className={buttonVariants({
                            className: "gap-2",
                            size: "sm",
                        })}
                        to="/"
                    >
                        <IconHome className="size-4" /> Home
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default DefaultNotFound;
