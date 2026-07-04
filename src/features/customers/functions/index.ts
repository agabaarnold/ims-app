import { createServerFn } from "@tanstack/react-start";
import { prisma } from "#/lib/db";
import {
    authMiddleware,
    createCustomerMiddleware,
    deleteCustomerMiddleware,
    updateCustomerMiddleware,
} from "#/middleware";
import {
    createCustomerSchema,
    deleteCustomerSchema,
    getCustomersSchema,
    updateCustomerSchema,
} from "../schema";

export const getCustomers = createServerFn({ method: "GET" })
    .middleware([authMiddleware])
    .validator(getCustomersSchema)
    .handler(async ({ data }) => {
        const { page, pageSize, search } = data;
        const skip = (page - 1) * pageSize;

        const where = search
            ? {
                  OR: [
                      {
                          name: {
                              contains: search,
                              mode: "insensitive" as const,
                          },
                      },
                      {
                          email: {
                              contains: search,
                              mode: "insensitive" as const,
                          },
                      },
                      {
                          phone: {
                              contains: search,
                              mode: "insensitive" as const,
                          },
                      },
                  ],
              }
            : {};

        const [customers, total] = await prisma.$transaction([
            prisma.customer.findMany({
                where,
                include: { _count: { select: { orders: true } } },
                orderBy: { name: "asc" },
                skip,
                take: pageSize,
            }),
            prisma.customer.count({ where }),
        ]);

        return {
            customers,
            total,
            page,
            pageSize,
            pageCount: Math.ceil(total / pageSize),
        };
    });

export const createCustomer = createServerFn({ method: "POST" })
    .middleware([authMiddleware, createCustomerMiddleware])
    .validator(createCustomerSchema)
    .handler(
        async ({ context: { session }, data }) =>
            await prisma.$transaction(async (tx) => {
                const customer = await tx.customer.create({ data });
                await tx.auditLog.create({
                    data: {
                        action: "CREATE",
                        userId: session.user.id,
                        entityId: customer.id,
                        entityType: "CUSTOMER",
                        after: {
                            name: customer.name,
                            email: customer.email,
                            phone: customer.phone,
                            address: customer.address,
                        },
                    },
                });
                return customer;
            })
    );

export const updateCustomer = createServerFn({ method: "POST" })
    .middleware([authMiddleware, updateCustomerMiddleware])
    .validator(updateCustomerSchema)
    .handler(
        async ({ context: { session }, data }) =>
            await prisma.$transaction(async (tx) => {
                const before = await tx.customer.findUnique({
                    where: { id: data.id },
                });
                if (!before) {
                    throw new Error(`Customer ${data.id} not found`);
                }

                const customer = await tx.customer.update({
                    where: { id: data.id },
                    data: {
                        name: data.name,
                        email: data.email,
                        phone: data.phone,
                        address: data.address,
                    },
                });
                await tx.auditLog.create({
                    data: {
                        action: "UPDATE",
                        userId: session.user.id,
                        entityId: customer.id,
                        entityType: "CUSTOMER",
                        before: {
                            name: before.name,
                            email: before.email,
                            phone: before.phone,
                            address: before.address,
                        },
                        after: {
                            name: customer.name,
                            email: customer.email,
                            phone: customer.phone,
                            address: customer.address,
                        },
                    },
                });
                return customer;
            })
    );

export const deleteCustomer = createServerFn({ method: "POST" })
    .middleware([authMiddleware, deleteCustomerMiddleware])
    .validator(deleteCustomerSchema)
    .handler(
        async ({ context: { session }, data }) =>
            await prisma.$transaction(async (tx) => {
                const customer = await tx.customer.findUnique({
                    where: { id: data.id },
                    include: { _count: { select: { orders: true } } },
                });
                if (!customer) {
                    throw new Error(`Customer ${data.id} not found`);
                }
                if (customer._count.orders > 0) {
                    throw new Error(
                        "Can't delete a customer with existing orders."
                    );
                }

                await tx.customer.delete({ where: { id: data.id } });
                await tx.auditLog.create({
                    data: {
                        action: "DELETE",
                        userId: session.user.id,
                        entityId: customer.id,
                        entityType: "CUSTOMER",
                        before: { name: customer.name },
                    },
                });
            })
    );
