import { IconSettings } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "../ui/sidebar";

function NavSecondary() {
    return (
        <SidebarGroup className="mt-auto">
            <SidebarGroupContent>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            render={
                                <Link to="/settings">
                                    <IconSettings /> <span>Settings</span>
                                </Link>
                            }
                            size="sm"
                        />
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}

export default NavSecondary;
