import type { Table } from "@tanstack/react-table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";

interface PageSizeSelectorProps<TData> {
    table: Table<TData>;
}

function PageSizeSelector<TData>({ table }: PageSizeSelectorProps<TData>) {
    return (
        <Select
            onValueChange={(value) => table.setPageSize(Number(value))}
            value={table.getState().pagination.pageSize}
        >
            <SelectTrigger className="w-[100px]">
                <SelectValue />
            </SelectTrigger>

            <SelectContent>
                <SelectItem value={5}>5</SelectItem>
                <SelectItem value={10}>10</SelectItem>
                <SelectItem value={20}>20</SelectItem>
                <SelectItem value={50}>50</SelectItem>
                <SelectItem value={100}>100</SelectItem>
            </SelectContent>
        </Select>
    );
}

export default PageSizeSelector;
