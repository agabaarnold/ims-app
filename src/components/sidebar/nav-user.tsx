import { IconCaretUpDown } from "@tabler/icons-react";
import { useRouteContext } from "@tanstack/react-router";
import { useIsMobile } from "#/hooks/use-mobile";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";
import UserAvatar from "./user-avatar";

function NavUser() {
    const { session } = useRouteContext({ from: "/_app" });
    const user = session.user;

    const isMobile = useIsMobile();

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={
                            <SidebarMenuButton size="lg">
                                <UserAvatar user={user} />
                                <IconCaretUpDown className="ml-auto size-4" />
                            </SidebarMenuButton>
                        }
                    />

                    <DropdownMenuContent
                        align="end"
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        sideOffset={4}
                    >
                        <DropdownMenuGroup>
                            <DropdownMenuLabel>
                                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                    <UserAvatar user={user} />
                                </div>
                            </DropdownMenuLabel>

                            <DropdownMenuSeparator />
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}

export default NavUser;
