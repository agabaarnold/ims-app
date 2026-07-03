import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import type { GetCustomersInput } from "../schema";
import { getCustomers } from "./index";

export const customersQueryOptions = (params: GetCustomersInput) =>
    queryOptions({
        queryKey: ["customers", params.page, params.pageSize, params.search],
        queryFn: () => getCustomers({ data: params }),
        placeholderData: keepPreviousData,
    });