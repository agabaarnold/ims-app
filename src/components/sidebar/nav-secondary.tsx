import { IconSettings, IconUsers } from "@tabler/icons-react";
import { Link, useRouteContext } from "@tanstack/react-router";
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "../ui/sidebar";
import type { NavItems } from "./nav-main";

interface NavItemsSecondary extends NavItems {
    adminOnly: boolean;
}

const items: NavItemsSecondary[] = [
    { title: "Users", url: "/admin/users", icon: IconUsers, adminOnly: true },
    {
        title: "Settings",
        url: "/settings",
        icon: IconSettings,
        adminOnly: false,
    },
];

function NavSecondary() {
    const { session } = useRouteContext({ from: "/_app" });
    const isAdmin =
        session.user.role === "admin" || session.user.role === "superAdmin";

    const visibleItems = items.filter(
        (item) => !item.adminOnly || isAdmin,
    );

    return (
        <SidebarGroup className="mt-auto">
            <SidebarGroupContent>
                <SidebarMenu className="space-y-1.5">
                    {visibleItems.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                render={
                                    <Link
                                        activeProps={{
                                            className:
                                                "bg-primary text-secondary hover:text-secondary hover:bg-primary",
                                        }}
                                        to={item.url}
                                    >
                                        <item.icon /> <span>{item.title}</span>
                                    </Link>
                                }
                                size="sm"
                                tooltip={item.title}
                            />
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}

export default NavSecondary;
