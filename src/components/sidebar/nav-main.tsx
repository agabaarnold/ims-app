import {
    IconBasketPlus,
    IconBuildingWarehouse,
    IconCategory,
    IconHome,
    IconPackages,
    type TablerIcon,
} from "@tabler/icons-react";
import { Link, type LinkOptions } from "@tanstack/react-router";
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "../ui/sidebar";

interface NavItems {
    icon: TablerIcon;
    title: string;
    url: LinkOptions["to"];
}

const items: NavItems[] = [
    { title: "Dashboard", url: "/", icon: IconHome },
    { title: "Products", url: "/products", icon: IconPackages },
    { title: "Warehouses", url: "/warehouses", icon: IconBuildingWarehouse },
    { title: "Categories", url: "/categories", icon: IconCategory },
    { title: "Suppliers", url: "/suppliers", icon: IconBasketPlus },
];

function NavMain() {
    return (
        <SidebarGroup>
            <SidebarGroupLabel className="uppercase">
                Navigation
            </SidebarGroupLabel>

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
                                    <item.icon />
                                    <span>{item.title}</span>
                                </Link>
                            }
                        />
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}

export default NavMain;
