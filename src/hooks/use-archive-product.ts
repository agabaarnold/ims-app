import { useRouter } from "@tanstack/react-router";
import { toast } from "react-hot-toast";
import { archiveProduct } from "#/features/products/functions";

export const useArchiveProduct = (productId: string) => {
    const router = useRouter();

    const archive = async () => {
        try {
            await archiveProduct({ data: { id: productId } });
            toast.success("Product archived successfully!");
            router.clearCache();
            router.invalidate();
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("Failed to archive product");
            }
        }
    };

    return { archive };
};
