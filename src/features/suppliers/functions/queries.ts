import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import { getSuppliers } from ".";

export const suppliersQueryOptions = (
    page: number,
    search: string,
    pageSize: number
) =>
    queryOptions({
        queryKey: ["suppliers", page, search],
        queryFn: () => getSuppliers({ data: { page, pageSize, search } }),
        placeholderData: keepPreviousData,
    });
