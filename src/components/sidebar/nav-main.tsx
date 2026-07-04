import {
    IconBuildingWarehouse,
    IconCategory,
    IconHome,
    IconNotes,
    IconPackage,
    IconPackages,
    IconTransfer,
    IconTruckDelivery,
    IconUserDollar,
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

export interface NavItems {
    icon: TablerIcon;
    title: string;
    url: LinkOptions["to"];
}

const items: NavItems[] = [
    { title: "Dashboard", url: "/", icon: IconHome },
    { title: "Products", url: "/products", icon: IconPackages },
    { title: "Categories", url: "/categories", icon: IconCategory },
    { title: "Suppliers", url: "/suppliers", icon: IconTruckDelivery },
    { title: "Customers", url: "/customers", icon: IconUserDollar },
    { title: "Purchase orders", url: "/purchase-orders", icon: IconPackage },
    { title: "Orders", url: "/orders", icon: IconNotes },
    { title: "Transfers", url: "/stock-transfers", icon: IconTransfer },
    { title: "Warehouses", url: "/warehouses", icon: IconBuildingWarehouse },
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
                            tooltip={item.title}
                        />
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}

export default NavMain;
