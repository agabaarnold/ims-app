import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import DefaultErrorBoundary from "./components/shared/default-error-boundary";
import DefaultNotFound from "./components/shared/default-not-found";
import { getContext } from "./integrations/root-provider";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
    const context = getContext();

    const router = createTanStackRouter({
        routeTree,
        context,
        scrollRestoration: true,
        defaultPreload: "intent",
        defaultPreloadStaleTime: 0,
        defaultErrorComponent: ({ error, reset, info }) => (
            <DefaultErrorBoundary error={error} info={info} reset={reset} />
        ),
        defaultNotFoundComponent: () => <DefaultNotFound />,
    });

    setupRouterSsrQueryIntegration({
        router,
        queryClient: context.queryClient,
    });

    return router;
}

declare module "@tanstack/react-router" {
    interface Register {
        router: ReturnType<typeof getRouter>;
    }
}
