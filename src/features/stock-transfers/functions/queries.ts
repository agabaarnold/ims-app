import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import type { GetStockTransfersInput } from "../schema";
import {
    getStockTransfer,
    getStockTransferFormData,
    getStockTransfers,
} from "./index";

export const stockTransfersQueryOptions = ({
    page,
    pageSize,
    status,
}: GetStockTransfersInput) =>
    queryOptions({
        queryKey: ["stock-transfers", page, pageSize, status],
        queryFn: () => getStockTransfers({ data: { page, pageSize, status } }),
        placeholderData: keepPreviousData,
    });

export const stockTransferQueryOptions = (id: string) =>
    queryOptions({
        queryKey: ["stock-transfers", id],
        queryFn: () => getStockTransfer({ data: { id } }),
    });

export const stockTransferFormDataQueryOptions = queryOptions({
    queryKey: ["stock-transfers", "form-data"],
    queryFn: () => getStockTransferFormData(),
});