import { queryOptions } from "@tanstack/react-query";
import { getDashboardData } from "./index";

export const dashboardQueryOptions = queryOptions({
    queryKey: ["dashboard"],
    queryFn: () => getDashboardData(),
    // Stale after 2 minutes — dashboard is a near-real-time view,
    // but we don't want to hammer the DB on every navigation
    staleTime: 2 * 60 * 1000,
});
