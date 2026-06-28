import { queryOptions } from "@tanstack/react-query";
import { getWarehouses } from "./index";

export const warehousesQueryOptions = queryOptions({
    queryKey: ["warehouses"],
    queryFn: () => getWarehouses(),
});