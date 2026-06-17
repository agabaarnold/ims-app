import { IconHome, type TablerIcon } from "@tabler/icons-react";
import type { LinkOptions } from "@tanstack/react-router";
import { SidebarGroup, SidebarGroupLabel, SidebarMenu } from "../ui/sidebar";

interface NavItems {
    icon: TablerIcon;
    title: string;
    url: LinkOptions["to"];
}

const items: NavItems[] = [{ title: "Dashboard", url: "/", icon: IconHome }];

function NavMain() {
    return (
        <SidebarGroup>
            <SidebarGroupLabel className="uppercase">
                Navigation
            </SidebarGroupLabel>

            <SidebarMenu>{}</SidebarMenu>
        </SidebarGroup>
    );
}

export default NavMain;
