import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import type { GetOrdersInput } from "../schema";
import { getOrder, getOrderFormData, getOrders } from "./index";

export const ordersQueryOptions = (params: GetOrdersInput) =>
    queryOptions({
        queryKey: [
            "orders",
            params.page,
            params.pageSize,
            params.search,
            params.status,
        ],
        queryFn: () => getOrders({ data: params }),
        placeholderData: keepPreviousData,
    });

export const orderQueryOptions = (id: string) =>
    queryOptions({
        queryKey: ["orders", id],
        queryFn: () => getOrder({ data: { id } }),
    });

export const orderFormDataQueryOptions = queryOptions({
    queryKey: ["orders", "form-data"],
    queryFn: () => getOrderFormData(),
});