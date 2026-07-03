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

const DEFAULT_ORDER_FORM_DATA_PARAMS = {
    page: 1,
    pageSize: 100,
    search: "",
} as const;

export const orderFormDataQueryOptions = (
    params = DEFAULT_ORDER_FORM_DATA_PARAMS
) =>
    queryOptions({
        queryKey: ["orders", "form-data", params.page, params.pageSize, params.search],
        queryFn: () => getOrderFormData({ data: params }),
    });
