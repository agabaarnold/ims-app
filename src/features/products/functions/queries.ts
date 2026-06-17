import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import type { GetProductsInput } from "../schema";
import { getProducts } from "./index";

export const getProductsQuery = ({
    page = 1,
    pageSize = 10,
    search = "",
}: GetProductsInput) =>
    queryOptions({
        queryKey: ["products", page, pageSize, search],
        queryFn: () => getProducts({ data: { page, pageSize, search } }),
        placeholderData: keepPreviousData,
    });
