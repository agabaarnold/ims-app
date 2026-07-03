import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

const statement = {
    ...defaultStatements,
    product: ["create", "read", "update", "delete"],
    category: ["create", "read", "update", "delete"],
    supplier: ["create", "read", "update", "delete"],
    customer: ["create", "read", "update", "delete"],
    inventory: ["read", "adjust", "transfer"],
    order: ["create", "read", "update", "approve", "cancel"],
    purchaseOrder: ["create", "read", "update", "approve", "cancel"],
    report: ["read", "export"],
    warehouse: ["create", "read", "update", "delete"],
} as const;

export const ac = createAccessControl(statement);

const superAdminRole = ac.newRole({
    ...adminAc.statements,
    product: ["create", "read", "update", "delete"],
    category: ["create", "read", "update", "delete"],
    supplier: ["create", "read", "update", "delete"],
    customer: ["create", "read", "update", "delete"],
    inventory: ["read", "adjust", "transfer"],
    order: ["create", "read", "update", "approve", "cancel"],
    purchaseOrder: ["create", "read", "update", "approve", "cancel"],
    report: ["read", "export"],
    warehouse: ["create", "read", "update", "delete"],
    user: [...adminAc.statements.user, "impersonate-admins"],
});

const adminRole = ac.newRole({
    ...adminAc.statements,
    product: ["create", "read", "update", "delete"],
    category: ["create", "read", "update", "delete"],
    supplier: ["create", "read", "update", "delete"],
    customer: ["create", "read", "update", "delete"],
    inventory: ["read", "adjust", "transfer"],
    order: ["create", "read", "update", "approve", "cancel"],
    purchaseOrder: ["create", "read", "update", "approve", "cancel"],
    report: ["read", "export"],
    warehouse: ["create", "read", "update", "delete"],
});

const managerRole = ac.newRole({
    product: ["create", "read", "update"],
    category: ["create", "read", "update"],
    supplier: ["create", "read", "update"],
    customer: ["create", "read", "update"],
    inventory: ["read", "adjust", "transfer"],
    order: ["create", "read", "update", "approve", "cancel"],
    purchaseOrder: ["create", "read", "update", "approve"],
    report: ["read", "export"],
    warehouse: ["create", "read", "update"],
    user: ["list"],
});

const staffRole = ac.newRole({
    product: ["read"],
    category: ["read"],
    supplier: ["read"],
    customer: ["read"],
    inventory: ["read", "adjust"],
    order: ["create", "read"],
    report: ["read"],
    warehouse: ["read"],
});

export const roles = {
    superAdmin: superAdminRole,
    admin: adminRole,
    manager: managerRole,
    staff: staffRole,
} as const;
