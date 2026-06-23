import { queryOptions } from "@tanstack/react-query";
import { getCategories } from "./index";

export const categoriesQueryOptions = queryOptions({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
});
