import { IconSettings, IconUsers } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "../ui/sidebar";
import type { NavItems } from "./nav-main";

const items: NavItems[] = [
    { title: "Users", url: "/admin/users", icon: IconUsers },
    { title: "Settings", url: "/settings", icon: IconSettings },
];

function NavSecondary() {
    return (
        <SidebarGroup className="mt-auto">
            <SidebarGroupContent>
                <SidebarMenu className="space-y-1.5">
                    {items.map((item) => (
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
                            />
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}

export default NavSecondary;
