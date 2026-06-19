import { keepPreviousData, queryOptions } from "@tanstack/react-query";
import type { GetProductsInput } from "../schema";
import { getProductDetails, getProductFormData, getProducts } from "./index";

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

export const productDetailQueryOptions = (productId: string) =>
    queryOptions({
        queryKey: ["products", productId, "detail"],
        queryFn: () => getProductDetails({ data: { id: productId } }),
    });

export const productFormDataQueryOptions = queryOptions({
    queryKey: ["products", "form-data"],
    queryFn: () => getProductFormData(),
});
