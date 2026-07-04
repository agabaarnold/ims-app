import {
    IconCaretUpDown,
    IconLogout2,
    IconSettings,
    IconUserEdit,
} from "@tabler/icons-react";
import { useNavigate, useRouteContext } from "@tanstack/react-router";
import { toast } from "react-hot-toast";
import { useIsMobile } from "#/hooks/use-mobile";
import { authClient } from "#/lib/auth-client";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";
import UserAvatar from "./user-avatar";

function NavUser() {
    const navigate = useNavigate();
    const { session } = useRouteContext({ from: "/_app" });
    const user = session.user;

    const isMobile = useIsMobile();

    const handleLogout = async () => {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    toast.success("Logged out successfully");
                    navigate({ to: "/sign-in", replace: true });
                },
            },
        });
    };

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

                            <DropdownMenuGroup>
                                <DropdownMenuItem
                                    onClick={() => navigate({ to: "/profile" })}
                                >
                                    <IconUserEdit /> Profile
                                </DropdownMenuItem>
                            </DropdownMenuGroup>

                            <DropdownMenuGroup>
                                <DropdownMenuItem
                                    onClick={() => navigate({ to: "/settings" })}
                                >
                                    <IconSettings /> Settings
                                </DropdownMenuItem>
                            </DropdownMenuGroup>

                            <DropdownMenuSeparator />

                            <DropdownMenuItem onClick={handleLogout}>
                                <IconLogout2 /> Logout
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}

export default NavUser;
