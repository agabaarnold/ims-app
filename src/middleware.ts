import { redirect } from "@tanstack/react-router";
import { createMiddleware } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "./lib/auth";

export const authMiddleware = createMiddleware().server(async ({ next }) => {
    const headers = getRequestHeaders();
    const session = await auth.api.getSession({ headers });
    if (!session) {
        throw redirect({ to: "/sign-in" });
    }

    return next({ context: { session } });
});

export const createProductMiddleware = createMiddleware().server(
    async ({ next }) => {
        const headers = getRequestHeaders();

        const hasPermission = await auth.api.userHasPermission({
            headers,
            body: { permissions: { product: ["create"] } },
        });
        if (!hasPermission.success) {
            throw redirect({ to: "/forbidden" });
        }

        return next();
    }
);

export const updateProductMiddleware = createMiddleware().server(
    async ({ next }) => {
        const headers = getRequestHeaders();

        const hasPermission = await auth.api.userHasPermission({
            headers,
            body: { permissions: { product: ["update"] } },
        });
        if (!hasPermission.success) {
            throw redirect({ to: "/forbidden", replace: true });
        }

        return next();
    }
);

export const archiveProductMiddleware = createMiddleware().server(
    async ({ next }) => {
        const headers = getRequestHeaders();

        const hasPermission = await auth.api.userHasPermission({
            headers,
            body: { permissions: { product: ["delete"] } },
        });
        if (!hasPermission.success) {
            throw new Error("You do not have permission to archive products");
        }

        return next();
    }
);

export const createCategoryMiddleware = createMiddleware().server(
    async ({ next }) => {
        const headers = getRequestHeaders();

        const hasPermission = await auth.api.userHasPermission({
            headers,
            body: { permissions: { category: ["create"] } },
        });
        if (!hasPermission.success) {
            throw redirect({ to: "/forbidden" });
        }

        return next();
    }
);

export const updateCategoryMiddleware = createMiddleware().server(
    async ({ next }) => {
        const headers = getRequestHeaders();

        const hasPermission = await auth.api.userHasPermission({
            headers,
            body: { permissions: { category: ["update"] } },
        });
        if (!hasPermission.success) {
            throw redirect({ to: "/forbidden", replace: true });
        }

        return next();
    }
);

export const deleteCategoryMiddleware = createMiddleware().server(
    async ({ next }) => {
        const headers = getRequestHeaders();

        const hasPermission = await auth.api.userHasPermission({
            headers,
            body: { permissions: { category: ["delete"] } },
        });
        if (!hasPermission.success) {
            throw new Error("You do not have permission to delete categories");
        }

        return next();
    }
);

export const createSupplierMiddleware = createMiddleware().server(
    async ({ next }) => {
        const headers = getRequestHeaders();

        const hasPermission = await auth.api.userHasPermission({
            headers,
            body: { permissions: { supplier: ["create"] } },
        });
        if (!hasPermission.success) {
            throw redirect({ to: "/forbidden" });
        }

        return next();
    }
);

export const updateSupplierMiddleware = createMiddleware().server(
    async ({ next }) => {
        const headers = getRequestHeaders();

        const hasPermission = await auth.api.userHasPermission({
            headers,
            body: { permissions: { supplier: ["update"] } },
        });
        if (!hasPermission.success) {
            throw redirect({ to: "/forbidden", replace: true });
        }

        return next();
    }
);

export const deleteSupplierMiddleware = createMiddleware().server(
    async ({ next }) => {
        const headers = getRequestHeaders();

        const hasPermission = await auth.api.userHasPermission({
            headers,
            body: { permissions: { supplier: ["delete"] } },
        });
        if (!hasPermission.success) {
            throw new Error("You do not have permission to delete suppliers");
        }

        return next();
    }
);

export const createOrderMiddleware = createMiddleware().server(
    async ({ next }) => {
        const headers = getRequestHeaders();

        const hasPermission = await auth.api.userHasPermission({
            headers,
            body: { permissions: { order: ["create"] } },
        });
        if (!hasPermission.success) {
            throw redirect({ to: "/forbidden" });
        }

        return next();
    }
);

export const confirmOrderMiddleware = createMiddleware().server(
    async ({ next }) => {
        const headers = getRequestHeaders();

        const hasPermission = await auth.api.userHasPermission({
            headers,
            body: { permissions: { order: ["approve"] } },
        });
        if (!hasPermission.success) {
            throw redirect({ to: "/forbidden" });
        }

        return next();
    }
);

export const updateOrderMiddleware = createMiddleware().server(
    async ({ next }) => {
        const headers = getRequestHeaders();

        const hasPermission = await auth.api.userHasPermission({
            headers,
            body: { permissions: { order: ["update"] } },
        });
        if (!hasPermission.success) {
            throw redirect({ to: "/forbidden", replace: true });
        }

        return next();
    }
);

export const cancelOrderMiddleware = createMiddleware().server(
    async ({ next }) => {
        const headers = getRequestHeaders();

        const hasPermission = await auth.api.userHasPermission({
            headers,
            body: { permissions: { order: ["cancel"] } },
        });
        if (!hasPermission.success) {
            throw new Error("You do not have permission to cancel orders");
        }

        return next();
    }
);

export const createCustomerMiddleware = createMiddleware().server(
    async ({ next }) => {
        const headers = getRequestHeaders();

        const hasPermission = await auth.api.userHasPermission({
            headers,
            body: { permissions: { customer: ["create"] } },
        });
        if (!hasPermission.success) {
            throw redirect({ to: "/forbidden" });
        }

        return next();
    }
);

export const updateCustomerMiddleware = createMiddleware().server(
    async ({ next }) => {
        const headers = getRequestHeaders();

        const hasPermission = await auth.api.userHasPermission({
            headers,
            body: { permissions: { customer: ["update"] } },
        });
        if (!hasPermission.success) {
            throw redirect({ to: "/forbidden", replace: true });
        }

        return next();
    }
);

export const deleteCustomerMiddleware = createMiddleware().server(
    async ({ next }) => {
        const headers = getRequestHeaders();

        const hasPermission = await auth.api.userHasPermission({
            headers,
            body: { permissions: { customer: ["delete"] } },
        });
        if (!hasPermission.success) {
            throw new Error("You do not have permission to delete customers");
        }

        return next();
    }
);

export const createWarehouseMiddleware = createMiddleware().server(
    async ({ next }) => {
        const headers = getRequestHeaders();

        const hasPermission = await auth.api.userHasPermission({
            headers,
            body: { permissions: { warehouse: ["create"] } },
        });
        if (!hasPermission.success) {
            throw redirect({ to: "/forbidden" });
        }

        return next();
    }
);

export const updateWarehouseMiddleware = createMiddleware().server(
    async ({ next }) => {
        const headers = getRequestHeaders();

        const hasPermission = await auth.api.userHasPermission({
            headers,
            body: { permissions: { warehouse: ["update"] } },
        });
        if (!hasPermission.success) {
            throw redirect({ to: "/forbidden", replace: true });
        }

        return next();
    }
);

export const deleteWarehouseMiddleware = createMiddleware().server(
    async ({ next }) => {
        const headers = getRequestHeaders();

        const hasPermission = await auth.api.userHasPermission({
            headers,
            body: { permissions: { warehouse: ["delete"] } },
        });
        if (!hasPermission.success) {
            throw new Error("You do not have permission to delete warehouses");
        }

        return next();
    }
);

export const createStockTransferMiddleware = createMiddleware().server(
    async ({ next }) => {
        const headers = getRequestHeaders();

        const hasPermission = await auth.api.userHasPermission({
            headers,
            body: { permissions: { inventory: ["transfer"] } },
        });
        if (!hasPermission.success) {
            throw redirect({ to: "/forbidden" });
        }

        return next();
    }
);

export const completeStockTransferMiddleware = createMiddleware().server(
    async ({ next }) => {
        const headers = getRequestHeaders();

        const hasPermission = await auth.api.userHasPermission({
            headers,
            body: { permissions: { inventory: ["transfer"] } },
        });
        if (!hasPermission.success) {
            throw redirect({ to: "/forbidden" });
        }

        return next();
    }
);

export const cancelStockTransferMiddleware = createMiddleware().server(
    async ({ next }) => {
        const headers = getRequestHeaders();

        const hasPermission = await auth.api.userHasPermission({
            headers,
            body: { permissions: { inventory: ["transfer"] } },
        });
        if (!hasPermission.success) {
            throw redirect({ to: "/forbidden" });
        }

        return next();
    }
);
